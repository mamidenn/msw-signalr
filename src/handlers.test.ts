import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import handlers from "./handlers.js";
import { setupServer } from "msw/node";

const hubUrl = "http://localhost/hub";
const server = setupServer(...handlers(hubUrl));

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  return () => {
    server.close();
  };
});
afterEach(() => {
  server.resetHandlers();
});

describe("signalR handler", () => {
  it("can negotiate a connection with the client", async () => {
    const connection = new HubConnectionBuilder().withUrl(hubUrl).build();
    await connection.start();
    expect(connection.state).toBe(HubConnectionState.Connected);
  });
  it("disconnects gracefully", async () => {
    const connection = new HubConnectionBuilder().withUrl(hubUrl).build();
    await connection.start();
    await connection.stop();
    expect(connection.state).toBe(HubConnectionState.Disconnected);
  });
});
