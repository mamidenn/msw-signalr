type ConnectionVersionSpecific = {
    version: 0;
} | {
    version: 1;
    connectionToken: string;
};
type ConnectionCommon = {
    connectionId: string;
    needsHandshake: boolean;
    needsInitialGet: boolean;
    send: (val: any) => void;
    close: () => void;
};
export type Connection = ConnectionCommon & ConnectionVersionSpecific;
declare const connections: Connection[];
export declare function add(info: {
    connectionId: string;
} & ({
    negotiateVersion: 0;
} | {
    negotiateVersion: 1;
    connectionToken: string;
})): void;
export declare function find(tokenOrId: string | null): [Connection, null] | [null, number];
export default connections;
