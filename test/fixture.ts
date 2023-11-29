import { randomUUID } from "node:crypto";
globalThis.window.crypto.randomUUID = randomUUID;
