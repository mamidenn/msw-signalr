import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { hubUrl } from "./hub.js";
import { server } from "./mocks/server.js";

server.listen({ onUnhandledRequest: "error" });

const connection = new HubConnectionBuilder()
  .withUrl(hubUrl)
  .configureLogging(LogLevel.Trace)
  .build();

await connection.start();

server.close();
