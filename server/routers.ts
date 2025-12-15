import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Receipt generation procedures
  receipt: router({
    generate: publicProcedure
      .input(z.object({
        fromText: z.string(),
        toText: z.string(),
        toNumber: z.string(),
        purpose: z.string(),
        date: z.string(),
        price: z.string(),
      }))
      .mutation(({ input }) => {
        try {
          // Read the template
          const templatePath = path.join(process.cwd(), "client/public/receipt-template.html");
          let htmlContent = fs.readFileSync(templatePath, "utf-8");

          // Replace placeholders
          htmlContent = htmlContent.replace("{{FROM_TEXT}}", input.fromText);
          htmlContent = htmlContent.replace("{{TO_TEXT}}", input.toText);
          htmlContent = htmlContent.replace("{{TO_NUMBER}}", input.toNumber);
          htmlContent = htmlContent.replace("{{PURPOSE_TEXT}}", input.purpose);
          htmlContent = htmlContent.replace("{{DATE}}", input.date);
          htmlContent = htmlContent.replace("{{PRICE}}", input.price);

          return {
            success: true,
            html: htmlContent,
          };
        } catch (error) {
          console.error("Error generating receipt:", error);
          return {
            success: false,
            error: "Failed to generate receipt",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
