import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Regression guard: the daisyUI migration once dropped the .nbrb-icon rule,
// which silently replaced the ruble glyph with the plain text "BYN" while
// markup-level tests kept passing.
describe("NBRB ruble icon styles", () => {
  const globalsCss = readFileSync(
    path.join(process.cwd(), "src", "app", "globals.css"),
    "utf8",
  );

  it("defines the .nbrb-icon rule with the local font and ligatures", () => {
    expect(globalsCss).toContain(".nbrb-icon {");
    expect(globalsCss).toContain("font-family: var(--font-nbrb)");
    expect(globalsCss).toContain('font-feature-settings: "liga"');
    expect(globalsCss).toContain("font-variant-ligatures: discretionary-ligatures");
    expect(globalsCss).toContain("font-style: normal");
    expect(globalsCss).toContain("text-transform: none");
  });

  it("keeps the NBRB font variable wired in the layout", () => {
    const layout = readFileSync(
      path.join(process.cwd(), "src", "app", "layout.tsx"),
      "utf8",
    );
    expect(layout).toContain('variable: "--font-nbrb"');
    expect(layout).toContain("nbrbFont.variable");
  });
});
