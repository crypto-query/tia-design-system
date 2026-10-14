import { describe, expect, it } from "vitest";
import { fuzzyMatch } from "./fuzzy-match";

describe("fuzzyMatch", () => {
    it("matches everything while the query is empty", () => {
        expect(fuzzyMatch("Momentum Futures", "")).toBe(true);
        expect(fuzzyMatch("", "")).toBe(true);
    });

    it("treats a whitespace-only query as empty", () => {
        expect(fuzzyMatch("Momentum Futures", "   ")).toBe(true);
    });

    it("matches a plain substring", () => {
        expect(fuzzyMatch("Momentum Futures", "futures")).toBe(true);
    });

    it("matches letters in order across word boundaries", () => {
        expect(fuzzyMatch("Momentum Futures", "mfu")).toBe(true);
        expect(fuzzyMatch("E-mini S&P 500", "es5")).toBe(true);
    });

    it("rejects the same letters out of order", () => {
        expect(fuzzyMatch("Momentum Futures", "ufm")).toBe(false);
    });

    it("rejects a letter the haystack does not hold", () => {
        expect(fuzzyMatch("Momentum Futures", "mfz")).toBe(false);
        expect(fuzzyMatch("", "a")).toBe(false);
    });

    it("ignores case on both sides", () => {
        expect(fuzzyMatch("momentum futures", "MFU")).toBe(true);
        expect(fuzzyMatch("MOMENTUM FUTURES", "mfu")).toBe(true);
    });

    it("trims the query before matching", () => {
        expect(fuzzyMatch("Momentum Futures", "  mfu  ")).toBe(true);
    });

    it("needs each repeated letter to appear again", () => {
        expect(fuzzyMatch("abc", "aa")).toBe(false);
        expect(fuzzyMatch("banana", "aaa")).toBe(true);
    });

    it("matches a query holding a space when the haystack holds one too", () => {
        expect(fuzzyMatch("Momentum Futures", "m fu")).toBe(true);
        expect(fuzzyMatch("MomentumFutures", "m fu")).toBe(false);
    });
});
