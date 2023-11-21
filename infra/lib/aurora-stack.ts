import * as cdk from "aws-cdk-lib";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from "constructs";

export class AuroraStack extends Construct {
  readonly securityGroup;
  readonly vpc;
  readonly dbSecretName;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);
    const envKey = this.node.tryGetContext('environment');
    const context = this.node.tryGetContext(envKey);
    const envName = context.envName;

    // VPC
    const vpc = new ec2.Vpc(this, "VPC", {
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
    this.vpc = vpc


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
      vpc: vpc,
      subnetGroupName: "SubnetGroup",
      vpcSubnets: vpc.selectSubnets({
        onePerAz: true,
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }),
    });

    // Monitoring Role
    const monitoringRole = new cdk.aws_iam.Role(this, "MonitoringRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal(
        "monitoring.rds.amazonaws.com"
      ),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonRDSEnhancedMonitoringRole"
        ),
      ],
    });

    // Security Group
    this.securityGroup = new ec2.SecurityGroup(this, 'AuroraAccessableSecurityGroup', {
      vpc,
      allowAllOutbound: true,
    })

    // DB Cluster
    const dbIdentifierPrefix = `aa4k-${envName}`;
    this.dbSecretName = `${envName}/DbAccessSecret`;
    const rdsCredentials: cdk.aws_rds.Credentials = cdk.aws_rds.Credentials.fromGeneratedSecret("postgresAdmin", { secretName: this.dbSecretName, });
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
      securityGroups: [this.securityGroup],
      backup: { // バックアップ
        retention: cdk.Duration.days(7),  // バックアップ保持期間
        preferredWindow: "16:00-16:30",   // 
      },
      cloudwatchLogsExports: ["postgresql"], // ログのエクスポート
      copyTagsToSnapshot: true, // スナップショットにタグをコピー
      credentials: rdsCredentials,
      defaultDatabaseName: "mainDB",  // 最初のデータベース名
      deletionProtection: false,  // 削除保護
      iamAuthentication: true, // IAM データベース認証
      monitoringInterval: cdk.Duration.minutes(1),  // 拡張モニタリング-詳細度
      monitoringRole, // モニタリングロール
      parameterGroup: dbClusterParameterGroup,  // パラメータグループ
      storageEncrypted: true, // storageEncrypted
      instanceIdentifierBase: "db-instance",
      vpc: vpc,
      subnetGroup,
    });

    // RDS Proxy を作成
    const secrets = dbCluster.secret ? [dbCluster.secret] : [];
    const proxy = new cdk.aws_rds.DatabaseProxy(this, 'DatabaseProxy', {
      proxyTarget: cdk.aws_rds.ProxyTarget.fromCluster(dbCluster),
      secrets: secrets,
      vpc,
      dbProxyName: `${dbIdentifierPrefix}-proxy`,
      securityGroups: [this.securityGroup],
    });
  }
}