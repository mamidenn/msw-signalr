type ProtocolVersion = 0 | 1;
type NegotiateResponse =
  | {
      negotiateVersion: 0;
      connectionId: string;
      availableTransports: Transport[];
    }
  | {
      negotiateVersion: 1;
      connectionId: string;
      availableTransports: Transport[];
      connectionToken: string;
    };
type Transport = {
  transport: "LongPolling" | "ServerSentEvents" | "WebSockets";
  transferFormats: readonly ("Text" | "Binary")[];
};
export type HandshakeRequest = {
  protocol: "messagepack" | "json";
  version: 1;
};
export type HandshakeResponse = { protocol: "json"; version: 1 };

export function negotiate(version: ProtocolVersion): NegotiateResponse {
  const response = {
    connectionId: crypto.randomUUID(),
    availableTransports: [
      {
        transport: "ServerSentEvents" as const,
        transferFormats: ["Text"] as const,
      },
    ],
  };
  if (version === 0) return { ...response, negotiateVersion: 0 };
  return { ...response, negotiateVersion: 1, connectionToken: crypto.randomUUID() };
}
