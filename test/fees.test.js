import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../Homepage.html", import.meta.url), "utf8");
const source = html.match(/<script id="fees">([\s\S]*?)<\/script>/)[1];
const context = {};
vm.runInNewContext(`${source}; this.projectFeeDrag = projectFeeDrag;`, context);
const { projectFeeDrag } = context;

test("£100k at 6% with 0.75% OCF over 20 years drags ≈ £42.5k", () => {
  const r = projectFeeDrag(100000, 6, 0.75, 20);
  assert.ok(Math.abs(r.finalGross - 320713.55) < 1, `gross ${r.finalGross}`);
  assert.ok(Math.abs(r.finalNet - 278259.6) < 50, `net ${r.finalNet}`);
  assert.ok(r.drag > 42000 && r.drag < 43000, `drag ${r.drag}`);
});

test("zero OCF means zero drag", () => {
  const r = projectFeeDrag(50000, 5, 0, 10);
  assert.equal(r.drag, 0);
  assert.equal(r.dragPct, 0);
});

test("series has one point per year plus the starting value", () => {
  const r = projectFeeDrag(1000, 4, 1, 7);
  assert.equal(r.gross.length, 8);
  assert.equal(r.net.length, 8);
  assert.equal(r.gross[0], 1000);
});
