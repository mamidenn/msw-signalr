import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import handlers from "./handlers.js";
import { setupServer } from "msw/node";
import { send } from "./hub.js";

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
  it("can send messages", async () => {
    const connection = new HubConnectionBuilder().withUrl(hubUrl).build();

    const received = new Promise<any[]>((res) =>
      connection.on("test", (...args) => res(args))
    );
    await connection.start();
    send("test", "hello", "world");
    expect(await received).toStrictEqual(["hello", "world"]);
  });
  it("can send messages to multiple receivers", async () => {
    const builder = new HubConnectionBuilder().withUrl(hubUrl);
    const connections = [builder.build(), builder.build()];
    const received = connections.map(
      (c) => new Promise<any[]>((res) => c.on("test", (...args) => res(args)))
    );
    for (const c of connections) {
      await c.start();
    }

    send("test", "hello", "world");
    for (const r of received) {
      expect(await r).toStrictEqual(["hello", "world"]);
    }
  });
});
