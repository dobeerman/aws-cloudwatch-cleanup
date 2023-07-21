import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface NodejsLambdaConstructProps extends Omit<cdk.aws_lambda_nodejs.NodejsFunctionProps, "runtime"> {}

export class NodejsLambdaConstruct extends Construct {
  public lambda: cdk.aws_lambda_nodejs.NodejsFunction;
  public logGroup: cdk.aws_logs.LogGroup;

  constructor(scope: Construct, id: string, props: NodejsLambdaConstructProps = {}) {
    super(scope, id);

    const { logRetention, ...lambdaProps } = props;

    this.lambda = new cdk.aws_lambda_nodejs.NodejsFunction(this, id, {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      maxEventAge: cdk.Duration.seconds(60),
      memorySize: 1024,
      retryAttempts: 2,
      handler: "handler",
      bundling: { minify: true },
      ...lambdaProps,
    });

    this.logGroup = new cdk.aws_logs.LogGroup(this, "LambdaLogGroup", {
      logGroupName: `/aws/lambda/${this.lambda.functionName}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logRetention ?? cdk.aws_logs.RetentionDays.TWO_WEEKS,
    });
  }
}
