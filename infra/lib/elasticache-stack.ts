import * as cdk from 'aws-cdk-lib';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from "constructs";
import { ContextProps } from '../lib/type';
import { AuroraStack } from './aurora-stack'

export class Aa4kElastiCacheStack extends cdk.Stack {
  readonly elastiCacheAccessableSG;
  readonly redisEndpoint;
  readonly redisEndpointPort;

  constructor(scope: Construct, id: string, contextProps: ContextProps, auroraStack: AuroraStack, props?: cdk.StackProps) {
    super(scope, id, props);
    const { stageName, cacheNodeType } = contextProps;

    // Security Group
    const securityGroup = new ec2.SecurityGroup(this, 'ReplicationGroupSecurityGroup', {
      vpc: auroraStack.vpc,
      allowAllOutbound: true,
    });
    this.elastiCacheAccessableSG = new ec2.SecurityGroup(this, 'ElastiCacheAccessableSecurityGroup', {
      vpc: auroraStack.vpc,
      allowAllOutbound: true,
    });
    securityGroup.connections.allowFrom(this.elastiCacheAccessableSG, ec2.Port.tcp(6379));

    // Subnet Group
    const subnetGroup = new elasticache.CfnSubnetGroup(this, 'SubnetGroup', {
      description: 'Subnet group for redis cluster',
      subnetIds: auroraStack.vpc.privateSubnets.map(subnet => subnet.subnetId),
      cacheSubnetGroupName: `aa4k-${stageName}-redis-subnet`
    });

    const cfnReplicationGroup = new elasticache.CfnReplicationGroup(this, 'ReplicationGroup', {
      replicationGroupId: `aa4k-${stageName}-redis`,
      replicationGroupDescription: `aa4k-${stageName}-redis`,
      cacheNodeType: cacheNodeType,
      numCacheClusters: 2,
      automaticFailoverEnabled: true,
      engine: 'redis',
      engineVersion: '7.1',
      cacheParameterGroupName: 'default.redis7',
      snapshotRetentionLimit: 1,
      snapshotWindow: '19:00-20:00',
      preferredMaintenanceWindow: 'sat:18:00-sat:19:00',
      transitEncryptionEnabled: false,
      atRestEncryptionEnabled: false,
      multiAzEnabled: true,
      cacheSubnetGroupName: subnetGroup.ref,
      securityGroupIds: [securityGroup.securityGroupId],
    });
    this.redisEndpoint = cfnReplicationGroup.attrPrimaryEndPointAddress;
    this.redisEndpointPort = cfnReplicationGroup.attrPrimaryEndPointPort;
  }
}