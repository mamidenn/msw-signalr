import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { delay } from "msw";
import { setupWorker } from "msw/browser";
import { signalRHub } from "./lib";
import "./style.css";

const hubUrl = "/hub";
const messages = document.getElementById("messages")!;
const sendMessage = document.getElementById("test")!;
const stop = document.getElementById("stop")!;
const start = document.getElementById("start")!;
const state = document.getElementById("state")!;

const hub = signalRHub(hubUrl, { keepAliveInterval: 7_500, delay });
const worker = setupWorker(...hub.handlers);

worker.start().then(async () => {
  const connection = new HubConnectionBuilder()
    .configureLogging(LogLevel.Trace)
    .withUrl(hubUrl)
    .build();

  const updateState = () => {
    state.setAttribute("data-state", connection.state);
    state.innerHTML =
      connection.state +
      (connection.connectionId ? " (" + connection.connectionId + ")" : "");
  };
  const startWithState = async () => {
    const started = connection.start();
    updateState();
    await started;
    updateState();
  };

  updateState();
  connection.onclose(updateState);
  connection.onreconnecting(updateState);
  connection.onreconnected(updateState);
  connection.on("test", (...args) => {
    messages.innerHTML += "<li>" + args.join() + "</li>";
  });

  await startWithState();

  sendMessage.onclick = () => {
    hub.broadcast("test", "foo", "bar");
  };

  start.onclick = async () => {
    await startWithState();
  };
  stop.onclick = async () => {
    await connection.stop();
  };
});
