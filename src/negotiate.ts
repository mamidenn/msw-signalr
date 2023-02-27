import { v4 as randomUUID } from "@lukeed/uuid";

type ProtocolVersion = 0 | 1;

type NegotiateResponse = {
  connectionId: string;
  availableTransports: Transport[];
} & (
  | { negotiateVersion: 0 }
  | { negotiateVersion: 1; connectionToken: string }
);
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
    connectionId: randomUUID(),
    availableTransports: [
      {
        transport: "LongPolling" as const,
        transferFormats: ["Text"] as const,
      },
    ],
  };
  switch (version) {
    case 0:
      return { ...response, negotiateVersion: 0 };
    case 1:
      return {
        ...response,
        negotiateVersion: 1,
        connectionToken: randomUUID(),
      };
  }
}
