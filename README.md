# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## **How to Use the Lambda Function?**

Before deploying the Lambda function, it's essential to understand how to invoke it:

1. **Dry Run:** To test the Lambda function without actually deleting any Log Groups, invoke it with the following event:
   ```json
   { "cleanup": false }
   ```
   This will allow the function to identify unused Log Groups and log them without performing any deletions.

2. **Actual Cleanup:** Once you're confident with the dry run results and want to proceed with the actual cleanup, invoke the Lambda function with:
   ```json
   { "cleanup": true }
   ```
   This will command the function to delete the identified unused CloudWatch Log Groups.

### Invoke Lambda function from terminal

```sh
aws lambda invoke --function-name YourFunctionName --payload '{"cleanup": false}' outputfile.txt
```
