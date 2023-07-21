import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { CloudWatchModule } from "./modules/cloudWatchModule";
import { LambdaModule } from "./modules/lambdaModule";

const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "eu-central-1";

const cloudWatchClient = new CloudWatchLogsClient({ region });
const cloudWatchModule = new CloudWatchModule(cloudWatchClient);

const lambdaClient = new LambdaClient({ region });
const lambdaModule = new LambdaModule(lambdaClient);

interface LambdaEvent {
  cleanup?: boolean;
}

export const handler = async (event?: LambdaEvent) => {
  const logNames = await cloudWatchModule.describeLogGroupNames();

  const lambdaNames = await lambdaModule.listFunctionNames();

  const unusedLogGroups = logNames.filter(logName => !lambdaNames.includes(logName));

  console.log(JSON.stringify(unusedLogGroups, undefined, 2));

  if (event?.cleanup) {
    await cloudWatchModule.deleteLogGroups(unusedLogGroups);
  }
};
