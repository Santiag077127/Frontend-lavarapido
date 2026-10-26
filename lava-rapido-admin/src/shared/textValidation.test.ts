import { describe, expect, it } from "vitest";
import { containsEmoji } from "./textValidation";

describe("containsEmoji", () => {
  it.each(["🚗", "👍🏽", "👨‍👩‍👧‍👦", "🇨🇴", "1️⃣"]) (
    "detects emoji sequences: %s",
    (value) => expect(containsEmoji(value)).toBe(true),
  );

  it.each(["María", "Peña", "João", "François", "name@example.com", "O'Connor-Smith"]) (
    "allows valid text: %s",
    (value) => expect(containsEmoji(value)).toBe(false),
  );
});
