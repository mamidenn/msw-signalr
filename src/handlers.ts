import { HttpResponse, http as rest } from "msw";
import connections, { find, add } from "./connections.js";
import { negotiate, HandshakeRequest, HandshakeResponse } from "./negotiate.js";
import { signalRify, parse } from "./messages.js";

export default function (hubUrl: string) {
  return [
    rest.post(`${hubUrl}/negotiate`, async ({request: req}) => {
      // client needs to specify which version of the protocol they want to use
      const requestedVersion = new URL(req.url).searchParams.get("negotiateVersion");
      if (requestedVersion === null) return new HttpResponse(null, {status: 400});
      // unsupported version returns 400
      const version = Number.parseInt(requestedVersion);
      if (version !== 0 && version !== 1) return new HttpResponse(null, {status: 400});

      // create and remember the connection
      // return the connectionId and available transports
      const response = negotiate(version);
      add(response);
      return HttpResponse.json(response);
    }),
    rest.get(hubUrl, async ({request: req}) => {
      const [connection, error] = find(new URL(req.url).searchParams.get("id"));
      if (connection === null) return new HttpResponse(null, {status:error});

      // For some reason, client sends a GET request before the handshake
      // possibly to check if the connection is still alive?
      if (connection.needsInitialGet) {
        connection.needsInitialGet = false;
        return new HttpResponse();
      }
      // the second GET request is the handshake
      if (connection.needsHandshake) {
        const response: HandshakeResponse = { protocol: "json", version: 1 };
        return HttpResponse.text(signalRify(response));
      }

      // all GETs after that are polls for messages
      const response = await new Promise<any>((res, rej) => {
        connection.send = res;
        connection.close = rej;
      })
        .then((val) => HttpResponse.text(signalRify(val)))
        // if the connection is terminated, return 200
        .catch(() => new HttpResponse());
      return response;
    }),
    rest.post(hubUrl, async ({request:req}) => {
      const [connection, error] = find(new URL(req.url).searchParams.get("id"));
      if (connection === null) return new HttpResponse(null, {status: error});

      // the first POST request is the handshake
      // the client sends the protocol and version they want to use
      // if the protocol is not supported, return 400
      if (connection.needsHandshake) {
        const request: HandshakeRequest = parse(await req.text());
        if (request.protocol === "json" && request.version === 1) {
          connection.needsHandshake = false;
          return new HttpResponse();
        } else
          return HttpResponse.text(signalRify({ error: "Requested protocol not supported" }))
          
      }
      return new HttpResponse(null, {status: 400});
    }),
    rest.delete(hubUrl, async ({request: req}) => {
      const [connection, error] = find(new URL(req.url).searchParams.get("id"));
      if (connection === null) return new HttpResponse(null, {status: error});

      // remove the connection from the list of connections
      // and close it
      connections.splice(connections.indexOf(connection), 1);
      connection.close();
      return new HttpResponse(null, {status: 204});
    }),
  ];
}
