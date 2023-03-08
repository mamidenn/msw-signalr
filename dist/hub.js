import connections from "./connections.js";
export function send(target, ...args) {
    connections.forEach((c) => {
        c.send({ type: 1, target, arguments: args });
    });
}
//# sourceMappingURL=hub.js.map