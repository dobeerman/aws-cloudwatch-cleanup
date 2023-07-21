import { CloudWatchLogsClient, DescribeLogGroupsCommandOutput } from "@aws-sdk/client-cloudwatch-logs";
import { CloudWatchModule } from "../../../../lambdas/src/modules/cloudWatchModule";

describe("modules/cloudWatchModule.ts", () => {
  describe("describeLogGroupNames method", () => {
    let cloudWatchLogsClientSpy: jest.Mock;
    let cloudWatchModule: CloudWatchModule;

    beforeEach(() => {
      const resolvedValueOne: DescribeLogGroupsCommandOutput = {
        nextToken: "test-token",
        logGroups: [
          { logGroupName: "/aws/lambda/test-lambda-name-one" },
          { logGroupName: "/aws/lambda/test-lambda-name-two" },
        ],
        $metadata: { httpStatusCode: 200 },
      };

      const resolvedValueTwo: DescribeLogGroupsCommandOutput = {
        nextToken: undefined,
        logGroups: [
          { logGroupName: "/aws/lambda/test-lambda-name-three" },
          { logGroupName: "/aws/lambda/test-lambda-name-four" },
        ],
        $metadata: { httpStatusCode: 200 },
      };

      cloudWatchLogsClientSpy = jest.fn()
        .mockResolvedValueOnce(resolvedValueOne)
        .mockResolvedValueOnce(resolvedValueTwo);

      CloudWatchLogsClient.prototype.send = cloudWatchLogsClientSpy;

      const cloudWatchClient = new CloudWatchLogsClient({});

      cloudWatchModule = new CloudWatchModule(cloudWatchClient);
    });

    afterEach(jest.resetAllMocks);

    test("SHOULD describe log group names AND remove prefix WHEN invoked", async () => {
      const result = await cloudWatchModule.describeLogGroupNames();

      expect(result).toEqual([
        "test-lambda-name-one",
        "test-lambda-name-two",
        "test-lambda-name-three",
        "test-lambda-name-four"
      ]);
    });

    const testCases = [
      { logGroups: undefined },
      { logGroups: [{}] },
    ];

    test.each(testCases)("SHOULD return empty array WHEN %o", async ({ logGroups }) => {
      const resolvedValue: DescribeLogGroupsCommandOutput = {
        nextToken: undefined,
        logGroups,
        $metadata: { httpStatusCode: 200 },
      };

      cloudWatchLogsClientSpy = jest.fn().mockResolvedValueOnce(resolvedValue);

      CloudWatchLogsClient.prototype.send = cloudWatchLogsClientSpy;

      const result = await cloudWatchModule.describeLogGroupNames();

      expect(result).toEqual([]);
    });
  });

  describe("deleteLogGroups method", () => {
    let cloudWatchLogsClientSpy: jest.Mock;
    let cloudWatchModule: CloudWatchModule;

    beforeEach(() => {
      cloudWatchLogsClientSpy = jest.fn();
      CloudWatchLogsClient.prototype.send = cloudWatchLogsClientSpy;

      const cloudWatchClient = new CloudWatchLogsClient({});

      cloudWatchModule = new CloudWatchModule(cloudWatchClient);
    });

    afterEach(jest.resetAllMocks);

    test("SHOULD delete log groups WHEN invoked", async () => {
      await cloudWatchModule.deleteLogGroups([
        "test-lambda-name-one",
        "test-lambda-name-two",
      ]);

      expect(cloudWatchLogsClientSpy).toHaveBeenNthCalledWith(
        1, expect.objectContaining({ input: { logGroupName: "/aws/lambda/test-lambda-name-one" } })
      );
      expect(cloudWatchLogsClientSpy).toHaveBeenNthCalledWith(
        2, expect.objectContaining({ input: { logGroupName: "/aws/lambda/test-lambda-name-two" } })
      );
    });
  });

  describe("module initiated with no prefix", () => {
    let cloudWatchLogsClientSpy: jest.Mock;
    let cloudWatchModule: CloudWatchModule;

    beforeEach(() => {
      const resolvedValueOne: DescribeLogGroupsCommandOutput = {
        nextToken: "test-token",
        logGroups: [
          { logGroupName: "/aws/lambda/test-lambda-name-one" },
          { logGroupName: "/aws/lambda/test-lambda-name-two" },
        ],
        $metadata: { httpStatusCode: 200 },
      };

      const resolvedValueTwo: DescribeLogGroupsCommandOutput = {
        nextToken: undefined,
        logGroups: [
          { logGroupName: "/aws/lambda/test-lambda-name-three" },
          { logGroupName: "/aws/lambda/test-lambda-name-four" },
        ],
        $metadata: { httpStatusCode: 200 },
      };

      cloudWatchLogsClientSpy = jest.fn()
        .mockResolvedValueOnce(resolvedValueOne)
        .mockResolvedValueOnce(resolvedValueTwo);

      CloudWatchLogsClient.prototype.send = cloudWatchLogsClientSpy;

      const cloudWatchClient = new CloudWatchLogsClient({});

      cloudWatchModule = new CloudWatchModule(cloudWatchClient, "");
    });

    afterEach(jest.resetAllMocks);

    test("SHOULD return empty array WHEN invoked", async () => {
      const result = await cloudWatchModule.describeLogGroupNames();

      expect(result).toEqual([
        "/aws/lambda/test-lambda-name-one",
        "/aws/lambda/test-lambda-name-two",
        "/aws/lambda/test-lambda-name-three",
        "/aws/lambda/test-lambda-name-four"
      ]);
    });
  });
});
