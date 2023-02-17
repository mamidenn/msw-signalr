import { ResponseResolver, rest, RestContext } from "msw";
export const hubUrl = "http://localhost/hub";

type Connection = {
  connectionId: string;
  needsHandshake: boolean;
  needsInitialGet: boolean;
} & (
  | { negotiateVersion: 0 }
  | { negotiateVersion: 1; connectionToken: string }
);
type ProtocolVersion = 0 | 1;
type Transport = {
  transport: "LongPolling" | "ServerSentEvents" | "WebSockets";
  transferFormats: ("Text" | "Binary")[];
};
type HandshakeRequest = {
  protocol: "messagepack" | "json";
  version: 1;
};

const connections: Connection[] = [];

function negotiateResponse(version: ProtocolVersion): Connection & {
  availableTransports: Transport[];
} {
  const res: {
    connectionId: string;
    needsHandshake: boolean;
    needsInitialGet: boolean;
    availableTransports: Transport[];
  } = {
    connectionId: "807809a5-31bf-470d-9e23-afaee35d8a0d",
    needsHandshake: true,
    needsInitialGet: true,
    availableTransports: [
      {
        transport: "LongPolling",
        transferFormats: ["Text"],
      },
    ],
  };

  switch (version) {
    case 0:
      return { ...res, negotiateVersion: 0 };
    case 1:
      return {
        ...res,
        negotiateVersion: 1,
        connectionToken: "05265228-1e2c-46c5-82a1-6a5bcc3f0143",
      };
  }
}

function parseVersion(version: string) {
  const parsed = Number.parseInt(version);
  if (parsed !== 0 && parsed !== 1) return null;
  return parsed;
}

export const handlers = [
  rest.post(`${hubUrl}/negotiate`, async (req, res, ctx) => {
    const requestedVersion = req.url.searchParams.get("negotiateVersion");
    if (requestedVersion === null) return res(ctx.status(400));

    const version = parseVersion(requestedVersion);
    if (version === null) return res(ctx.status(400));

    const response = negotiateResponse(version);
    connections.push(response);
    return res(ctx.status(200), ctx.json(response));
  }),
  rest.get(hubUrl, async (req, res, ctx) => {
    const tokenOrId = req.url.searchParams.get("id");
    if (tokenOrId === null) return res(ctx.status(400));

    const connection = findConnection(tokenOrId);
    if (connection === null) return res(ctx.status(404));

    if (connection.needsInitialGet) {
      connection.needsInitialGet = false;
      return res(ctx.status(200));
    }
    if (connection.needsHandshake) {
      return res(
        ctx.body(JSON.stringify({ protocol: "json", version: 1 }) + "\x1e")
      );
    }
    await new Promise((res) => setTimeout(res, 5000));
    return res(ctx.body(JSON.stringify({ type: 7 }) + "\x1e"));
  }),
  rest.post(hubUrl, async (req, res, ctx) => {
    const tokenOrId = req.url.searchParams.get("id");
    if (tokenOrId === null) return res(ctx.status(400));
    const connection = findConnection(tokenOrId);
    if (connection === null) return res(ctx.status(404));

    const messages = (await req.text())
      .split("\x1e")
      .filter(Boolean)
      .map((v) => JSON.parse(v));
    if (connection.needsHandshake) {
      const handshakeRequest: HandshakeRequest = messages.shift();
      if (
        handshakeRequest.protocol === "json" &&
        handshakeRequest.version === 1
      ) {
        connection.needsHandshake = false;
        return res(ctx.body(JSON.stringify({ error: 1 }) + "\x1e"));
      } else
        return res(
          ctx.body(
            JSON.stringify({ error: "Requested protocol not supported" }) +
              "\x1e"
          )
        );
    }
    return res(ctx.status(400));
  }),

  rest.delete(hubUrl, async (req, res, ctx) => {
    const tokenOrId = req.url.searchParams.get("id");
    if (tokenOrId === null) throw { status: 400 };

    const connection = findConnection(tokenOrId);
    if (connection === null) throw { status: 404 };

    connections.splice(connections.indexOf(connection), 1);
    return res(ctx.status(204));
  }),
];

function findConnection(tokenOrId: string) {
  return (
    connections.find(
      (c) => c.negotiateVersion === 1 && c.connectionToken === tokenOrId
    ) ||
    connections.find(
      (c) => c.negotiateVersion === 0 && c.connectionId === tokenOrId
    ) ||
    null
  );
}
