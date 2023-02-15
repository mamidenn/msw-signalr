import { setupServer } from "msw/node";
import { handlers } from "./hub.js";

export const server = setupServer(...handlers);
