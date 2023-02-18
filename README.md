# msw-signalr

A set of handlers that can be used in a [Mock Service Worker](https://mswjs.io/)
to mock a SignalR server.

## Installation

```bash
npm install msw-signalr
```

## Usage

Import the `signalRHandlers` function and pass it the URL of your SignalR hub.
Use the returned handlers in your `setupServer` call [just like you would your
own REST call handlers](https://mswjs.io/docs/getting-started/integrate).

```typescript
// src/mocks/server.js
import { setupServer } from "msw/node";
import { signalRHandlers } from "msw-signalr";
import { handlers } from "./handlers";

const hubUrl = "/hub";
export const server = setupServer(...handlers, ...signalRhandlers(hubUrl));

//----------------

// src/mocks/browser.js
import { setupWorker } from "msw";
import { signalRHandlers } from "msw-signalr";
import { handlers } from "./handlers";

const hubUrl = "/hub";
export const worker = setupWorker(...handlers, ...signalRHandlers(hubUrl));
```

You can then broadcast messages to connected clients using the `send` method.

```typescript
import { send } from "msw-signalr";
import { HubConnectionBuilder } from "@microsoft/signalr";

// set up the client
const hubUrl = "/hub";
const connection = new HubConnectionBuilder().withUrl(hubUrl).build();
connection.on("test-method", (message, id) => console.log({message, id})
await connection.start();

// send a message
send("test-method", "Hello, world!", 69); // logs {message: "Hello, world!", id: 69}
```
