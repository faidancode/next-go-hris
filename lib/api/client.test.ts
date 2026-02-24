import { describe, expect, it } from "vitest";
import {
  __internal,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "./client";

describe("api client error mapping", () => {
  it("maps 401 to UnauthorizedError", () => {
    const error = __internal.mapError(401, { message: "expired" }, "failed");
    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.message).toBe("expired");
  });

  it("maps 403 to ForbiddenError", () => {
    const error = __internal.mapError(403, { error: "forbidden" }, "failed");
    expect(error).toBeInstanceOf(ForbiddenError);
  });

  it("maps 400 to ValidationError", () => {
    const error = __internal.mapError(
      400,
      { message: "invalid", errors: { email: ["required"] } },
      "failed",
    );

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).fieldErrors?.email?.[0]).toBe("required");
  });

  it("normalizes RBAC endpoint to api v1", () => {
    const url = __internal.normalizePath("/rbac/permissions");
    expect(url).toBe("/api/v1/rbac/permissions");
  });

  it("keeps explicit /api path untouched", () => {
    const url = __internal.normalizePath("/api/rbac/permissions");
    expect(url).toBe("/api/rbac/permissions");
  });
});
