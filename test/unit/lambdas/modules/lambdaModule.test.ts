import { LambdaClient, ListFunctionsCommandOutput } from "@aws-sdk/client-lambda";
import { LambdaModule } from "../../../../lambdas/src/modules/lambdaModule";

describe('modules/lambdaModule.ts', () => {
  let lambdaClientSpy: jest.Mock;
  let lambdaModule: LambdaModule;

  beforeEach(() => {
    const resolvedValueOne: ListFunctionsCommandOutput = {
      NextMarker: "test-marker",
      Functions: [{ FunctionName: "lambda-one" }, { FunctionName: "lambda-two" }],
      $metadata: { httpStatusCode: 200 }
    };

    const resolvedValueTwo: ListFunctionsCommandOutput = {
      NextMarker: undefined,
      Functions: [{ FunctionName: "lambda-three" }, { FunctionName: "lambda-four" }],
      $metadata: { httpStatusCode: 200 }
    };

    lambdaClientSpy = jest.fn()
      .mockResolvedValueOnce(resolvedValueOne)
      .mockResolvedValueOnce(resolvedValueTwo);

    LambdaClient.prototype.send = lambdaClientSpy;

    const lambdaClient = new LambdaClient({});

    lambdaModule = new LambdaModule(lambdaClient);
  });

  afterEach(jest.restoreAllMocks);

  test('SHOULD list functions WHEN invoked', async () => {
    // ACT
    const result = await lambdaModule.listFunctionNames();

    // ASSERT
    expect(result).toEqual(["lambda-one", "lambda-two", "lambda-three", "lambda-four"]);
  });

  test('SHOULD filter out undefined function names WHEN function name is undefiled ', async () => {
    // ASSIGN
    const resolvedValue: ListFunctionsCommandOutput = {
      NextMarker: undefined,
      Functions: [{}, { FunctionName: "lambda-four" }],
      $metadata: { httpStatusCode: 200 }
    };
    lambdaClientSpy = jest.fn().mockResolvedValueOnce(resolvedValue);
    LambdaClient.prototype.send = lambdaClientSpy;

    // ACT
    const result = await lambdaModule.listFunctionNames();

    // ASSERT
    expect(result).toEqual(["lambda-four"]);
  });

  test('SHOULD filter out function names WHEN Functions parameter is undefiled ', async () => {
    // ASSIGN
    const resolvedValueOne: ListFunctionsCommandOutput = {
      NextMarker: "test-marker",
      $metadata: { httpStatusCode: 200 }
    };
    const resolvedValueTwo: ListFunctionsCommandOutput = {
      NextMarker: undefined,
      Functions: [{}, { FunctionName: "lambda-one" }],
      $metadata: { httpStatusCode: 200 }
    };
    lambdaClientSpy = jest.fn()
      .mockResolvedValueOnce(resolvedValueOne)
      .mockResolvedValueOnce(resolvedValueTwo);
    LambdaClient.prototype.send = lambdaClientSpy;

    // ACT
    const result = await lambdaModule.listFunctionNames();

    // ASSERT
    expect(result).toEqual(["lambda-one"]);
  });
});
