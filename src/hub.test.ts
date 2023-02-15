import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HubConnection } from "@microsoft/signalr";

declare module "vitest" {
  export interface TestContext {
    connection?: HubConnection;
  }
}

describe("signalR handler", () => {
  it("does nothing", async () => {
    const res = await window.fetch("http://localhost/hub/negotiate");
    expect(true).toBe(true);
  });
});
