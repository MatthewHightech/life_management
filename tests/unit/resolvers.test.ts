import { describe, expect, it } from "vitest";
import { resolvers } from "@life/graphql/resolvers";

describe("graphql resolvers", () => {
  it("returns health check", () => {
    expect(resolvers.Query.health()).toBe("ok");
  });

  it("returns pong for ping mutation", () => {
    expect(resolvers.Mutation.ping()).toBe("pong");
  });
});
