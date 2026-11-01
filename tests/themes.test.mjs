import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import {
  palettes,
  parsePreferences,
  DEFAULT_PALETTE,
  THEME_STORAGE_KEY,
} from "../lib/themes.ts";
import { buildThemeBootstrap } from "../lib/theme-bootstrap.ts";

const css = readFileSync(
  new URL("../app/theme-tokens.css", import.meta.url),
  "utf8",
);
const script = buildThemeBootstrap({
  defaultPalette: DEFAULT_PALETTE,
  paletteIds: palettes.map((p) => p.id),
  storageKey: THEME_STORAGE_KEY,
});
function bootstrap(saved, systemDark = false, blocked = false) {
  const root = { dataset: {} };
  runInNewContext(script, {
    document: { documentElement: root },
    window: { matchMedia: () => ({ matches: systemDark }) },
    localStorage: {
      getItem() {
        if (blocked) throw new Error("Storage blocked");
        return saved;
      },
    },
  });
  return root.dataset;
}
function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) {
  const [lo, hi] = [luminance(a), luminance(b)].sort((a, b) => a - b);
  return (hi + 0.05) / (lo + 0.05);
}
function tokens(id, mode) {
  const block = css
    .split(`:root[data-palette="${id}"][data-color-mode="${mode}"] {`)[1]
    ?.split("}")[0];
  assert.ok(block, `${id} ${mode} has CSS`);
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[\da-fA-F]+)/g)].map((m) => [
      m[1],
      m[2],
    ]),
  );
}

test("Midnight Indigo is the only available palette", () => {
  assert.deepEqual(
    palettes.map((p) => p.id),
    ["midnight-indigo"],
  );
  assert.equal(DEFAULT_PALETTE, "midnight-indigo");
});

test("invalid and partial saved preferences recover to usable defaults", () => {
  for (const value of [null, "", "{broken", "null", "42", "[]"])
    assert.deepEqual(parsePreferences(value), {
      palette: "midnight-indigo",
      appearance: "system",
    });
  assert.deepEqual(
    parsePreferences('{"palette":"unknown","appearance":"dark"}'),
    { palette: "midnight-indigo", appearance: "dark" },
  );
  assert.deepEqual(
    parsePreferences('{"palette":"royal-indigo","appearance":"invalid"}'),
    { palette: "midnight-indigo", appearance: "system" },
  );
});

test("older saved palettes migrate without losing appearance preferences", () => {
  const saved = '{"palette":"deep-ocean-navy","appearance":"dark"}';
  assert.deepEqual(parsePreferences(saved), {
    palette: "midnight-indigo",
    appearance: "dark",
  });
  assert.deepEqual(bootstrap(saved), {
    palette: "midnight-indigo",
    appearance: "dark",
    colorMode: "dark",
  });
});

test("first visit follows the system before paint", () => {
  assert.deepEqual(bootstrap(null, true), {
    palette: "midnight-indigo",
    appearance: "system",
    colorMode: "dark",
  });
  assert.equal(bootstrap(null, false).colorMode, "light");
});

test("saved explicit mode overrides the system; system setting follows it", () => {
  assert.deepEqual(
    bootstrap('{"palette":"royal-indigo","appearance":"light"}', true),
    { palette: "midnight-indigo", appearance: "light", colorMode: "light" },
  );
  assert.equal(
    bootstrap('{"palette":"electric-cobalt","appearance":"dark"}', false)
      .colorMode,
    "dark",
  );
  assert.equal(
    bootstrap('{"palette":"slate-blue","appearance":"system"}', true).colorMode,
    "dark",
  );
});

test("corrupt or blocked storage cannot prevent rendering", () => {
  assert.equal(bootstrap("{bad", true).colorMode, "dark");
  assert.equal(bootstrap(null, false, true).colorMode, "light");
});

for (const palette of palettes)
  for (const mode of ["light", "dark"]) {
    test(`${palette.name} / ${mode}: primitives and text roles stay consistent and readable`, () => {
      const t = tokens(palette.id, mode);
      for (const [key, value] of Object.entries(palette[mode])) {
        const cssKey = key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
        assert.equal(t[cssKey].toLowerCase(), value.toLowerCase());
      }
      for (const background of ["background", "sidebar", "surface"]) {
        for (const foreground of [
          "foreground",
          "readable-muted",
          "accent-text",
          "http-get",
          "http-post",
          "http-put",
          "http-patch",
          "http-delete",
        ]) {
          assert.ok(
            contrast(t[foreground], t[background]) >= 4.5,
            `${foreground} on ${background}`,
          );
        }
      }
      assert.ok(
        contrast(t["primary-foreground"], t.primary) >= 4.5,
        "button labels",
      );
      for (const role of [
        "json-key",
        "json-string",
        "json-number",
        "json-literal",
        "json-punctuation",
        "json-gutter",
      ])
        assert.ok(contrast(t[role], t["code-background"]) >= 4.5, role);
    });
  }
