import { CloudWatchLogsClient, DeleteLogGroupCommand, DescribeLogGroupsCommand, DescribeLogGroupsCommandOutput } from "@aws-sdk/client-cloudwatch-logs";
import { chunk, delay } from "./utils";

export class CloudWatchModule {
  constructor(private readonly client: CloudWatchLogsClient, private readonly prefix = "/aws/lambda/") {}

  public async describeLogGroupNames(): Promise<string[]> {
    let nextToken: string | undefined = "init";

    let logGroupNames: string[] = [];

    while (nextToken) {
      if (nextToken === "init") nextToken = undefined;

      const command: DescribeLogGroupsCommand = new DescribeLogGroupsCommand({ logGroupNamePrefix: this.prefix, nextToken });

      const result: DescribeLogGroupsCommandOutput = await this.client.send(command);

      const logGroupNamesWithNoPrefix: string[] = result.logGroups?.reduce((acc, logGroup) => logGroup.logGroupName ? [...acc, this.removePrefix(logGroup.logGroupName)] : acc, [] as string[]) ?? [];

      logGroupNames = [...logGroupNames, ...logGroupNamesWithNoPrefix];

      nextToken = result.nextToken;

      await delay(100);
    }

    return logGroupNames;
  }

  public async deleteLogGroups(logGroupNames: string[]): Promise<void> {
    const chunked: string[][] = chunk<string>(logGroupNames, 10);

    for (const logGroupNames of chunked) {
      const promises = logGroupNames.map(logGroupName => this.client.send(new DeleteLogGroupCommand({ logGroupName: `${this.prefix}${logGroupName}` })));

      await Promise.all(promises);
    }
  }

  private removePrefix(logGroupName: string): string {
    if (!this.prefix.trim()) return logGroupName;

    return logGroupName.replace(this.prefix, "");
  };
}
