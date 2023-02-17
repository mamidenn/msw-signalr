export function signalRify(val: any) {
  return JSON.stringify(val) + "\x1e";
}
export function parse(val: string) {
  return JSON.parse(val.slice(0, -1));
}
