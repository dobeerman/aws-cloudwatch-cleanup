import { LambdaClient, ListFunctionsCommand, ListFunctionsCommandOutput } from "@aws-sdk/client-lambda";
import { delay } from "./utils";

export class LambdaModule {
  constructor(private readonly client: LambdaClient) {}

  public async listFunctionNames(): Promise<string[]> {
    let marker: string | undefined = 'init';

    let functionNames: string[] = [];

    while (marker) {
      if (marker === 'init') marker = undefined;

      const command: ListFunctionsCommand = new ListFunctionsCommand({ Marker: marker });

      const result: ListFunctionsCommandOutput = await this.client.send(command);

      const reduced = result.Functions?.reduce((acc, curr) => curr.FunctionName ? [...acc, curr.FunctionName] : acc, [] as string[]) ?? [];

      functionNames = [...functionNames, ...reduced];

      marker = result.NextMarker;

      await delay(100);
    }

    return functionNames;
  }
}
