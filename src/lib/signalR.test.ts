import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { setupServer } from "msw/node";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import signalR from "./signalR";

const hubUrl = "http://localhost/hub";
const hub = signalR(hubUrl);
const server = setupServer(...hub.handlers);
const builder = new HubConnectionBuilder()
  .withUrl(hubUrl)
  .configureLogging(LogLevel.Error);

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
    const connection = builder.build();
    await connection.start();
    expect(connection.state).toBe(HubConnectionState.Connected);
  });

  it("disconnects gracefully", async () => {
    const connection = builder.build();
    await connection.start();
    await connection.stop();
    expect(connection.state).toBe(HubConnectionState.Disconnected);
  });

  it("can send messages", async () => {
    const connection = builder.build();

    const received = new Promise<any[]>((res) =>
      connection.on("test", (...args) => res(args))
    );
    await connection.start();
    hub.connections.forEach((c) => c.send("test", "hello", "world"));
    expect(await received).toStrictEqual(["hello", "world"]);
  });

  it("can send messages to multiple receivers", async () => {
    const connections = [builder.build(), builder.build()];
    const received = connections.map(
      (c) => new Promise<any[]>((res) => c.on("test", (...args) => res(args)))
    );
    for (const c of connections) {
      await c.start();
    }

    hub.connections.forEach((c) => c.send("test", "hello", "world"));
    for (const r of received) {
      expect(await r).toStrictEqual(["hello", "world"]);
    }
  });
});
