import connections from "./connections.js";

export function send(target: string, ...args: any[]) {
  connections.forEach((c) => {
    c.send({ type: 1, target, arguments: args });
  });
}
