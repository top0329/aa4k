import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from "constructs";
import { ContextProps } from '../lib/type';
import { AuroraStack } from './aurora-stack';

export class Aa4kParameterStack extends cdk.Stack {
  readonly ssmAccessableSG;
  readonly aa4kConstParameter;

  constructor(scope: Construct, id: string, contextProps: ContextProps, auroraStack: AuroraStack, props?: cdk.StackProps) {
    super(scope, id, props);
    const { stageName } = contextProps;

    // Security Group
    this.ssmAccessableSG = new ec2.SecurityGroup(this, 'SsmAccessableSecurityGroup', {
      vpc: auroraStack.vpc,
      allowAllOutbound: true,
    });

    // Vpc Endpoint
    const ssmVpcEndpoint = new ec2.InterfaceVpcEndpoint(this, 'SsmVpcEndpoint', {
      vpc: auroraStack.vpc,
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
    });
    ssmVpcEndpoint.connections.allowFrom(this.ssmAccessableSG, ec2.Port.tcp(443));

    // パラメータストア登録値（システム定数）
    const aa4kConstValueObj = {
      allowedCidrs: [
        "103.79.14.0/24",       // kintoneプロキシのIPアドレス
        "118.238.251.130/32",   // SC-VPNのIPアドレス
        "202.210.220.64/28",    // SC-VPNのIPアドレス
        "39.110.232.32/28",     // SC-VPNのIPアドレス
      ],
      "retrieveMaxCount": 30,
      "retrieveScoreThreshold": 0.7,
      "historyUseCount": 10,
      "historyGetCount": 30,
    };

    // ParameterStore
    this.aa4kConstParameter = new ssm.StringParameter(this, 'StringParameter', {
      parameterName: `/${stageName}/aa4k/const`,
      stringValue: JSON.stringify(aa4kConstValueObj),
      dataType: ssm.ParameterDataType.TEXT
    });
  }
}