import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("receipt.generate", () => {
  it("generates receipt HTML with correct placeholders replaced", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.receipt.generate({
      fromText: "أحمد محمد",
      toText: "سارة علي",
      toNumber: "SA1234567890123456789012",
      purpose: "تحويل مالي",
      date: "2025-12-01",
      price: "1000",
    });

    expect(result.success).toBe(true);
    expect(result.html).toBeDefined();
    
    // Verify placeholders are replaced
    expect(result.html).toContain("أحمد محمد");
    expect(result.html).toContain("سارة علي");
    expect(result.html).toContain("SA1234567890123456789012");
    expect(result.html).toContain("تحويل مالي");
    expect(result.html).toContain("2025-12-01");
    expect(result.html).toContain("1000");
    
    // Verify original template content is preserved
    expect(result.html).toContain("إيصال التحويل");
    expect(result.html).toContain("Transfer Receipt");
    expect(result.html).toContain("Al Rajhi Bank");
  });

  it("handles special characters in input", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.receipt.generate({
      fromText: "محمد علي الأحمد",
      toText: "فاطمة محمود",
      toNumber: "SA9999999999999999999999",
      purpose: "رسوم الدراسة",
      date: "01/12/1445",
      price: "5500",
    });

    expect(result.success).toBe(true);
    expect(result.html).toContain("محمد علي الأحمد");
    expect(result.html).toContain("فاطمة محمود");
  });
});
