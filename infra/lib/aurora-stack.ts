import * as cdk from "aws-cdk-lib";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from "constructs";
import { ContextProps } from '../lib/type';

export class AuroraStack extends cdk.Stack {
  readonly auroraAccessableSG;
  readonly vpc;
  readonly dbAdminSecret;

  constructor(scope: Construct, id: string, contextProps: ContextProps, props?: cdk.StackProps) {
    super(scope, id);
    const stageName = contextProps.stageName;

    // VPC
    this.vpc = new ec2.Vpc(this, "VPC", {
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          name: "PublicSubnet",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "PrivateSubne",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
    });


    // DB Cluster Parameter Group
    const dbClusterParameterGroup = new cdk.aws_rds.ParameterGroup(
      this,
      "DbClusterParameterGroup",
      {
        engine: cdk.aws_rds.DatabaseClusterEngine.auroraPostgres({
          version: cdk.aws_rds.AuroraPostgresEngineVersion.VER_15_3,
        }),
        description: "aurora-postgresql15",
        parameters: {
          log_statement: "none",
          "pgaudit.log": "all",
          "pgaudit.role": "rds_pgaudit",
          shared_preload_libraries: "pgaudit",
        },
      }
    );

    // DB Parameter Group
    const dbParameterGroup = new cdk.aws_rds.ParameterGroup(
      this,
      "DbParameterGroup",
      {
        engine: cdk.aws_rds.DatabaseClusterEngine.auroraPostgres({
          version: cdk.aws_rds.AuroraPostgresEngineVersion.VER_15_3,
        }),
        description: "aurora-postgresql15",
      }
    );

    // Subnet Group
    const subnetGroup = new cdk.aws_rds.SubnetGroup(this, "SubnetGroup", {
      description: "description",
      vpc: this.vpc,
      subnetGroupName: "SubnetGroup",
      vpcSubnets: this.vpc.selectSubnets({
        onePerAz: true,
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }),
    });

    // Security Group
    this.auroraAccessableSG = new ec2.SecurityGroup(this, 'AuroraAccessableSecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
    })

    // DB Admin User Secret
    const EXCLUDE_CHARACTERS = ':@/" \'';
    this.dbAdminSecret = new secretsmanager.Secret(this, "DbAdminSecret", {
      generateSecretString: {
        generateStringKey: "password",
        passwordLength: 32,
        requireEachIncludedType: true,
        secretStringTemplate: '{"username": "postgresAdmin"}',
        excludeCharacters: EXCLUDE_CHARACTERS,
      },
      secretName: `${stageName}/DbAccessSecret`,
    });

    // DB Cluster
    const dbIdentifierPrefix = `aa4k-${stageName}`;
    const dbCluster = new cdk.aws_rds.DatabaseCluster(this, "DatabaseCluster", {
      clusterIdentifier: `${dbIdentifierPrefix}-rds`,  // DB クラスター識別子
      engine: cdk.aws_rds.DatabaseClusterEngine.auroraPostgres({
        version: cdk.aws_rds.AuroraPostgresEngineVersion.VER_15_3,
      }),
      serverlessV2MaxCapacity: 1.0, // 最大 ACU
      serverlessV2MinCapacity: 0.5, // 最小 ACU
      writer: cdk.aws_rds.ClusterInstance.serverlessV2("serverlessV2", {
        autoMinorVersionUpgrade: false,
        scaleWithWriter: true,
        caCertificate: cdk.aws_rds.CaCertificate.RDS_CA_RDS2048_G1,
        parameterGroup: dbParameterGroup,
        enablePerformanceInsights: true, // Performance Insightsを有効にする
        performanceInsightRetention: cdk.aws_rds.PerformanceInsightRetention.DEFAULT, // データ保持期間
      }),
      securityGroups: [this.auroraAccessableSG],
      backup: { // バックアップ
        retention: cdk.Duration.days(7),  // バックアップ保持期間
        preferredWindow: "16:00-16:30",   // 
      },
      cloudwatchLogsExports: ["postgresql"], // ログのエクスポート
      copyTagsToSnapshot: true, // スナップショットにタグをコピー
      credentials: cdk.aws_rds.Credentials.fromSecret(this.dbAdminSecret),
      defaultDatabaseName: "aa4kDB",  // 最初のデータベース名
      deletionProtection: contextProps.deletionProtection,  // 削除保護
      iamAuthentication: false, // IAM データベース認証
      monitoringInterval: cdk.Duration.minutes(1),  // 拡張モニタリング-詳細度
      parameterGroup: dbClusterParameterGroup,  // パラメータグループ
      storageEncrypted: true, // storageEncrypted
      instanceIdentifierBase: "db-instance",
      vpc: this.vpc,
      subnetGroup,
    });

    // RDS Proxy を作成
    const proxy = new cdk.aws_rds.DatabaseProxy(this, 'DatabaseProxy', {
      proxyTarget: cdk.aws_rds.ProxyTarget.fromCluster(dbCluster),
      secrets: dbCluster.secret ? [dbCluster.secret] : [],
      vpc: this.vpc,
      dbProxyName: `${dbIdentifierPrefix}-proxy`,
      securityGroups: [this.auroraAccessableSG],
    });


    // ******************************
    // 踏み台サーバ (bastion)
    // ******************************
    // bastion Security Group
    const name = `aa4k-${stageName}-bastion-sg`
    const bastionGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc: this.vpc,
      securityGroupName: name,
      description: name,
    });
    // EC2 Instance Connect (ローカル環境から接続)対応
    bastionGroup.addIngressRule(
      ec2.Peer.ipv4("118.238.251.130/32"),
      ec2.Port.tcp(22),
      "from showcase"
    );
    bastionGroup.addIngressRule(
      ec2.Peer.ipv4("202.210.220.64/28"),
      ec2.Port.tcp(22),
      "from showcase"
    );
    bastionGroup.addIngressRule(
      ec2.Peer.ipv4("39.110.232.32/28"),
      ec2.Port.tcp(22),
      "from showcase"
    );
    // キーペア作成
    const cfnKeyPair = new ec2.CfnKeyPair(this, 'CfnKeyPair', {
      keyName: `aa4k-${stageName}-bastion`,
    })
    cfnKeyPair.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)

    // EC2作成
    const instance = new ec2.Instance(this, 'Instance', {
      instanceName: `aa4k-${stageName}-bastion`,
      vpc: this.vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO,
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
      }),
      securityGroup: bastionGroup,
      vpcSubnets: this.vpc.selectSubnets({
        onePerAz: true,
        subnetType: ec2.SubnetType.PUBLIC,
      }),
      keyName: cdk.Token.asString(cfnKeyPair.ref),
    })
    instance.connections.allowFromAnyIpv4(ec2.Port.tcp(22))

    // BastionHostLinux
    const host = new ec2.BastionHostLinux(this, "BastionHost", {
      instanceName: `aa4k-${stageName}-bastion`,
      vpc: this.vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.NANO
      ),
      securityGroup: bastionGroup,
      subnetSelection: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    // 作成したbastion Security Group を auroraAccessableSG に追加
    this.auroraAccessableSG.addIngressRule(
      bastionGroup,
      ec2.Port.tcp(5432),
      'from bastion'
    )
  }
}