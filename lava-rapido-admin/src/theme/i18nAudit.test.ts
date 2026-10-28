import * as ts from "typescript";
import { describe, expect, it } from "vitest";
import { translations, type LanguageOption } from "./theme";

const sourceFiles = import.meta.glob("../**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const languages: LanguageOption[] = ["es", "en", "fr", "pt"];
const invariantCopy = new Set([
  "Lava Rápido Vehicular", "Logo Lava Rápido Vehicular", "Lava Rápido", "Neiva, Huila",
  "CC", "TI", "CE", "ID:", "min", "Wompi",
]);

describe("admin language coverage", () => {
  it("has every referenced key in all four dictionaries", () => {
    const used = new Set<string>();
    for (const [filename, source] of Object.entries(sourceFiles)) {
      if (filename.endsWith(".test.tsx")) continue;
      for (const match of source.matchAll(/\bt\("([\w.]+)"\)|"((?:ui|common|auth|payments|booking|operators|form)\.[\w.]+)"/g)) {
        used.add(match[1] || match[2]);
      }
    }
    for (const language of languages) {
      expect(Object.keys(translations[language]).sort(), language).toEqual(Object.keys(translations.es).sort());
      expect([...used].filter((key) => !translations[language][key]), language).toEqual([]);
      expect(Object.entries(translations[language]).filter(([, value]) => !value.trim()), language).toEqual([]);
    }
  });

  it("keeps visible JSX text and accessibility labels in the dictionary", () => {
    const literals: string[] = [];
    for (const [filename, source] of Object.entries(sourceFiles)) {
      if (filename.endsWith(".test.tsx") || (!filename.startsWith("../features/") && !filename.startsWith("../router/"))) continue;
      const tree = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const check = (node: ts.Node) => {
        let value: string | undefined;
        if (ts.isJsxText(node)) value = node.text.replace(/\s+/g, " ").trim();
        if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name) && node.initializer && ts.isStringLiteral(node.initializer)
          && ["placeholder", "title", "aria-label", "alt"].includes(node.name.text)) value = node.initializer.text;
        if (value && /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(value) && !invariantCopy.has(value)) {
          literals.push(`${filename.slice(3)}:${tree.getLineAndCharacterOfPosition(node.pos).line + 1} ${value}`);
        }
        ts.forEachChild(node, check);
      };
      check(tree);
    }
    expect(literals).toEqual([]);
  });
});
