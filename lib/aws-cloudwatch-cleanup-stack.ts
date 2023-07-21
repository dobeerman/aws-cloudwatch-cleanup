import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsLambdaConstruct } from "../constructs/nodejsLambdaConstruct";
import path = require("path");

export class AwsCloudWatchCleanupStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const role = new cdk.aws_iam.Role(this, "CloudWatchLogsCleanupRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
      ],
      inlinePolicies: {
        CloudWatchLogsCleanupRoleInlinePolicy: new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              actions: ["logs:DescribeLogGroups", "logs:DeleteLogGroup"],
              resources: ["*"]
            }),
            new cdk.aws_iam.PolicyStatement({
              actions: ["lambda:ListFunctions"],
              resources: ["*"]
            })
          ]
        })
      }
    });

    const { lambda } = new NodejsLambdaConstruct(this, "CloudWatchLogsCleanupLambda", {
      entry: path.join(__dirname, "..", "lambdas/src/cleanup.ts"),
      role,
    });

    const baseUrl = new URL(`https://${this.region}.console.${this.partition}.amazon.com`);

    baseUrl.pathname = "/lambda/home";
    baseUrl.searchParams.append("region", this.region);
    baseUrl.hash = `/functions/${lambda.functionName}`;

    new cdk.CfnOutput(this, "LambdaFunctionUrl", { value: baseUrl.href, });
  }
}
