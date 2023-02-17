type ConnectionVersionSpecific =
  | { version: 0 }
  | { version: 1; connectionToken: string };
type ConnectionCommon = {
  connectionId: string;
  needsHandshake: boolean;
  needsInitialGet: boolean;
  send: (val: any) => void;
  close: () => void;
};
export type Connection = ConnectionCommon & ConnectionVersionSpecific;
const connections: Connection[] = [];

export function add(
  info: { connectionId: string } & (
    | { negotiateVersion: 0 }
    | { negotiateVersion: 1; connectionToken: string }
  )
) {
  const common: ConnectionCommon = {
    connectionId: info.connectionId,
    needsHandshake: true,
    needsInitialGet: true,
    send: (_val: any) => {
      throw new Error("Connection is not ready");
    },
    close: () => {
      throw new Error("Cannot terminate a connection that is not ready");
    },
  };
  let connection: Connection;
  if (info.negotiateVersion === 0) {
    connection = { ...common, version: 0 };
  } else if (info.negotiateVersion === 1) {
    connection = {
      ...common,
      version: 1,
      connectionToken: info.connectionToken,
    };
  } else {
    throw new Error("Invalid negotiate version");
  }

  connections.push(connection);
}

export function find(
  tokenOrId: string | null
): [Connection, null] | [null, number] {
  if (tokenOrId === null) return [null, 400];
  // look for a connection with the given token
  // if none is found, look for a connection with the given id
  const connection =
    connections.find(
      (c) => c.version === 1 && c.connectionToken === tokenOrId
    ) ||
    connections.find((c) => c.version === 0 && c.connectionId === tokenOrId) ||
    null;
  if (connection === null) return [null, 404];
  return [connection, null];
}

export default connections;
