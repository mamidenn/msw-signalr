---
"msw-signalr": major
---

# Migrate to MSW 2.x

Mock Service Worker 2 features stream responses, which makes mocking a SignalR hub significantly easier. The mock request handler implementation now uses Server Sent Events instead of Long-Polling.

## API changes

`signalRHandlers` was renamed to `signalRHub` to better reflect the changed role:

```diff
- import { signalRHandlers } from "msw-signalr";
+ import { signalRHub } from "msw-signalr"
```

`signalRHub` returns an object with `handlers`, `connections`, and `broadcast` function, which takes the role of the formally global `send`.

```diff
- export const server = setupServer(...signalRhandlers("/hub"));
+ export const hub = signalRHub("/hub");
+ export const worker = setupWorker(...hub.handlers);
```

```diff
- send("foo", "bar")
+ hub.broadcast("foo", "bar")
```

The `connections` property can now be used to send messages to individual clients:

```js
hub.connections.get("some-id").send("foo", "bar");
```