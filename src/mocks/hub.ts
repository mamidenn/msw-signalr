import { rest } from "msw";

export const handlers = [
  rest.get("http://localhost/hub/negotiate", (req, res, ctx) => {
    console.log("hi!");
    return res(ctx.status(200));
  }),
  rest.post("http://localhost/hub/negotiate", (req, res, ctx) => {
    return res(ctx.status(200));
  }),
];
