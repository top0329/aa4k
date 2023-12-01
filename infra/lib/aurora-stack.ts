import * as cdk from "aws-cdk-lib";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from "constructs";
import { ContextProps } from '../lib/type';

export class AuroraStack extends cdk.Stack {
  readonly auroraAccessableSG;
  readonly vpc;
  readonly dbAdminSecret;
  readonly rdsProxyEndpoint;

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
          name: "PrivateSubnet",
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
      backup: { // バックアップ
        retention: cdk.Duration.days(7),  // バックアップ保持期間
        preferredWindow: "16:00-16:30",   // 
      },
      cloudwatchLogsExports: ["postgresql"], // ログのエクスポート
      copyTagsToSnapshot: true, // スナップショットにタグをコピー
      credentials: {
        username: "postgresAdmin",
        secretName: `${stageName}/DbAccessSecret`,
      },
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
    this.dbAdminSecret = dbCluster.secret;
    dbCluster.connections.allowFrom(this.auroraAccessableSG, ec2.Port.tcp(5432))

    // RDS Proxy を作成
    const proxy = new cdk.aws_rds.DatabaseProxy(this, 'DatabaseProxy', {
      proxyTarget: cdk.aws_rds.ProxyTarget.fromCluster(dbCluster),
      secrets: this.dbAdminSecret ? [this.dbAdminSecret] : [],
      vpc: this.vpc,
      dbProxyName: `${dbIdentifierPrefix}-proxy`,
      securityGroups: dbCluster.connections.securityGroups,
    });
    this.rdsProxyEndpoint = proxy.endpoint;

    // ******************************
    // 踏み台サーバ (bastion)
    // ******************************
    // BastionHostLinux
    const host = new ec2.BastionHostLinux(this, "BastionHost", {
      instanceName: `aa4k-${stageName}-bastion`,
      vpc: this.vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.NANO
      ),
      securityGroup: this.auroraAccessableSG,
      subnetSelection: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });
  }
}