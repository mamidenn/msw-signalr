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
import { signalRHub } from "msw-signalr";

export const hub = signalRHub("/hub");
export const server = setupServer(...hub.handlers);

//----------------

// src/mocks/browser.js
import { setupWorker } from "msw/browser";
import { signalRHub } from "msw-signalr";

export const hub = signalRHub("/hub");
export const worker = setupWorker(...hub.handlers);
```

You can then broadcast messages to connected clients using the `send` method.

```typescript
import { hub } from "./mocks/browser";
import { HubConnectionBuilder } from "@microsoft/signalr";

// set up the client
const connection = new HubConnectionBuilder().withUrl("/hub").build();
connection.on("test-method", (message, id) => console.log({message, id})
await connection.start();

// send a message
hub.broadcast("test-method", "Hello, world!", 69); // logs {message: "Hello, world!", id: 69}
```

The hub can be further customized with the second argument to `signalRHub`, e.g. by passing a `delay` function to simulate network delay:

```js
import { delay } from "msw";
const hub = signalRHub("/hub", { delay });
```
