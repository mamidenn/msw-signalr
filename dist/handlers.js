import { rest } from "msw";
import connections, { find, add } from "./connections.js";
import { negotiate } from "./negotiate.js";
import { signalRify, parse } from "./messages.js";
export default function (hubUrl) {
    return [
        rest.post(`${hubUrl}/negotiate`, async (req, res, ctx) => {
            // client needs to specify which version of the protocol they want to use
            const requestedVersion = req.url.searchParams.get("negotiateVersion");
            if (requestedVersion === null)
                return res(ctx.status(400));
            // unsupported version returns 400
            const version = Number.parseInt(requestedVersion);
            if (version !== 0 && version !== 1)
                return res(ctx.status(400));
            // create and remember the connection
            // return the connectionId and available transports
            const response = negotiate(version);
            add(response);
            return res(ctx.status(200), ctx.json(response));
        }),
        rest.get(hubUrl, async (req, res, ctx) => {
            const [connection, error] = find(req.url.searchParams.get("id"));
            if (connection === null)
                return res(ctx.status(error));
            // For some reason, client sends a GET request before the handshake
            // possibly to check if the connection is still alive?
            if (connection.needsInitialGet) {
                connection.needsInitialGet = false;
                return res(ctx.status(200));
            }
            // the second GET request is the handshake
            if (connection.needsHandshake) {
                const response = { protocol: "json", version: 1 };
                return res(ctx.body(signalRify(response)));
            }
            // all GETs after that are polls for messages
            const response = await new Promise((res, rej) => {
                connection.send = res;
                connection.close = rej;
            })
                .then((val) => res(ctx.body(signalRify(val))))
                // if the connection is terminated, return 200
                .catch(() => res(ctx.status(200)));
            return response;
        }),
        rest.post(hubUrl, async (req, res, ctx) => {
            const [connection, error] = find(req.url.searchParams.get("id"));
            if (connection === null)
                return res(ctx.status(error));
            // the first POST request is the handshake
            // the client sends the protocol and version they want to use
            // if the protocol is not supported, return 400
            if (connection.needsHandshake) {
                const request = parse(await req.text());
                if (request.protocol === "json" && request.version === 1) {
                    connection.needsHandshake = false;
                    return res(ctx.status(200));
                }
                else
                    return res(ctx.body(signalRify({ error: "Requested protocol not supported" })));
            }
            return res(ctx.status(400));
        }),
        rest.delete(hubUrl, async (req, res, ctx) => {
            const [connection, error] = find(req.url.searchParams.get("id"));
            if (connection === null)
                return res(ctx.status(error));
            // remove the connection from the list of connections
            // and close it
            connections.splice(connections.indexOf(connection), 1);
            connection.close();
            return res(ctx.status(204));
        }),
    ];
}
//# sourceMappingURL=handlers.js.map