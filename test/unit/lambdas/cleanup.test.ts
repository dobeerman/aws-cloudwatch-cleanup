import { handler } from "../../../lambdas/src/cleanup";
import { CloudWatchModule } from "../../../lambdas/src/modules/cloudWatchModule";
import { LambdaModule } from "../../../lambdas/src/modules/lambdaModule";

describe("cleanup.ts", () => {
  let describeLogGroupNamesSpy: jest.Mock;
  let listFunctionNamesSpy: jest.Mock;
  let consoleLogSpy: jest.Mock;
  let deleteLogGroupsSpy: jest.Mock;

  beforeEach(() => {
    describeLogGroupNamesSpy = jest.fn().mockResolvedValue(["lambda-one", "lambda-two"]);
    CloudWatchModule.prototype.describeLogGroupNames = describeLogGroupNamesSpy;

    listFunctionNamesSpy = jest.fn().mockResolvedValue(["lambda-one"]);;
    LambdaModule.prototype.listFunctionNames = listFunctionNamesSpy;

    consoleLogSpy = jest.fn();
    console.log = consoleLogSpy;

    deleteLogGroupsSpy = jest.fn();
    CloudWatchModule.prototype.deleteLogGroups = deleteLogGroupsSpy;
  });

  afterEach(jest.clearAllMocks);

  const testCases = [
    { event: undefined },
    { event: { cleanup: false } },
  ];

  test.each(testCases)("SHOULD not delete log groups WHEN %o", async ({ event }) => {
    // ACT
    await handler(event);

    // ASSERT
    expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(["lambda-two"], undefined, 2));
    expect(deleteLogGroupsSpy).not.toHaveBeenCalled();
  });

  test("SHOULD delete log groups WHEN `cleanup` is true", async () => {
    // ACT
    await handler({ cleanup: true });

    // ASSERT
    expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(["lambda-two"], undefined, 2));
    expect(deleteLogGroupsSpy).toHaveBeenCalledWith(["lambda-two"]);
  });
});
