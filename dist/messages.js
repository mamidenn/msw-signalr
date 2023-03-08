export function signalRify(val) {
    return JSON.stringify(val) + "\x1e";
}
export function parse(val) {
    return JSON.parse(val.slice(0, -1));
}
//# sourceMappingURL=messages.js.map