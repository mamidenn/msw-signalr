import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { hubUrl } from "./hub.js";

declare module "vitest" {
  export interface TestContext {
    connection?: HubConnection;
  }
}

describe("signalR handler", () => {
  it("can negotiate a connection with the client", async (ctx) => {
    ctx.connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .configureLogging(LogLevel.Trace)
      .build();
    await ctx.connection.start();
    expect(ctx.connection.state).toBe(HubConnectionState.Connected);
  });
});
