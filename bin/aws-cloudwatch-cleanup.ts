#!/usr/bin/env node
import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';
import { AwsCloudWatchCleanupStack } from '../lib/aws-cloudwatch-cleanup-stack';

const app = new cdk.App();
new AwsCloudWatchCleanupStack(app, 'AwsCloudWatchCleanupStack', {
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT ?? process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION ?? process.env.CDK_DEFAULT_REGION
  }
});
