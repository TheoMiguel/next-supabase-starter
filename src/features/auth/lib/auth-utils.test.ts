import { describe, it, expect, vi } from "vitest";

describe("auth-utils", () => {
  it("should export getUser, getProfile, requireAuth, requireRole", async () => {
    vi.mock("next/headers", () => ({
      cookies: vi.fn(() => ({ getAll: () => [], set: vi.fn() })),
    }));
    vi.mock("next/navigation", () => ({
      redirect: vi.fn(),
    }));
    vi.mock("@/lib/supabase/server", () => ({
      createClient: vi.fn(() => ({
        auth: {
          getClaims: vi.fn().mockResolvedValue({ data: null }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null }),
            })),
          })),
        })),
      })),
    }));

    const { getUser, getProfile, requireAuth, requireRole } = await import("./auth-utils");

    expect(typeof getUser).toBe("function");
    expect(typeof getProfile).toBe("function");
    expect(typeof requireAuth).toBe("function");
    expect(typeof requireRole).toBe("function");
  });

  it("getUser returns null when no session", async () => {
    vi.mock("@/lib/supabase/server", () => ({
      createClient: vi.fn(() => ({
        auth: {
          getClaims: vi.fn().mockResolvedValue({ data: null }),
        },
      })),
    }));

    const { getUser } = await import("./auth-utils");
    const user = await getUser();
    expect(user).toBeNull();
  });
});
