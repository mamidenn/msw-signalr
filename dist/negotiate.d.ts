type ProtocolVersion = 0 | 1;
type NegotiateResponse = {
    connectionId: string;
    availableTransports: Transport[];
} & ({
    negotiateVersion: 0;
} | {
    negotiateVersion: 1;
    connectionToken: string;
});
type Transport = {
    transport: "LongPolling" | "ServerSentEvents" | "WebSockets";
    transferFormats: readonly ("Text" | "Binary")[];
};
export type HandshakeRequest = {
    protocol: "messagepack" | "json";
    version: 1;
};
export type HandshakeResponse = {
    protocol: "json";
    version: 1;
};
export declare function negotiate(version: ProtocolVersion): NegotiateResponse;
export {};
