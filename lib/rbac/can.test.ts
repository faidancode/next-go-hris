import { describe, expect, it } from "vitest";
import { __internal, clearRbacCache } from "./can";

describe("rbac helper cache", () => {
  it("creates stable cache key", () => {
    const key = __internal.getCacheKey("emp-1", "comp-1", "leave", "approve");
    expect(key).toBe("rbac:emp-1:comp-1:leave:approve");
  });

  it("clears cache store", () => {
    clearRbacCache();
    __internal.cache.set("x", { value: true, expiresAt: Date.now() + 1000 });

    expect(__internal.cache.size).toBe(1);
    clearRbacCache();
    expect(__internal.cache.size).toBe(0);
  });
});
