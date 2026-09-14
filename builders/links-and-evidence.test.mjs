import test from 'node:test';
import assert from 'node:assert/strict';
import { nodeLinks } from './node-links.mjs';
import { pairVerdict } from '../modular-star/pair-verdict.mjs';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
test('legacy electron numbers never masquerade as permanent family keys', () => {
  const legacy = nodeLinks({ label: '#511 distanceKm', type: 'function' });
  assert.match(legacy.ext, /CLASSIFICATION\.md$/);
  assert.match(nodeLinks({ id: 'family:511', label: 'distanceKm', type: 'function' }).ext, /family=511$/);
});
test('element, repository and evidence links resolve by identity', () => {
  assert.match(nodeLinks({ label: 'Si(202609051525)', type: 'element' }, { symbols: new Set(['Si']) }).ext, /block=Si$/);
  assert.equal(nodeLinks({ label: 'gridatlas', type: 'repo' }).gh, 'https://github.com/Ventusltd/gridatlas');
  assert.equal(nodeLinks({ type: 'decay' }, { example: 'https://github.com/Ventusltd/star-maker/blob/main/stars/example.json' }).ext, 'https://github.com/Ventusltd/star-maker/blob/main/stars/example.json');
});
test('77 percent green is mixed evidence, not unstable', () => {
  assert.equal(pairVerdict({ green: 3261, red: 955, total: 4216 }), 'mixed evidence');
});
test('unstable needs three observations and at least ninety percent actually red', () => {
  assert.equal(pairVerdict({ green: 0, red: 2, total: 2 }), 'mixed evidence');
  assert.equal(pairVerdict({ green: 1, red: 9, total: 10 }), 'unstable');
  assert.equal(pairVerdict({ green: 1, red: 8, total: 10 }), 'mixed evidence');
  assert.equal(pairVerdict({ green: 0, red: 0, total: 10 }), 'mixed evidence');
  assert.equal(pairVerdict({ green: 3, red: 0, total: 3 }), 'proven');
  assert.throws(() => pairVerdict({ green: 4, red: 0, total: 3 }), /Invalid/);
});
test('chemistry keeps qualifying pairs even when one element is independently unstable', () => {
  const root = mkdtempSync(join(tmpdir(), 'stars-pairs-'));
  try {
    mkdirSync(join(root, 'elements')); mkdirSync(join(root, 'stars'));
    writeFileSync(join(root, 'elements/table.json'), JSON.stringify({ elements: [{ family: 'cartridge', name: 'a', symbol: 'Aa' }, { family: 'cartridge', name: 'b', symbol: 'Bb' }] }));
    for (let i = 0; i < 3; i++) writeFileSync(join(root, `stars/${i}.json`), JSON.stringify({ id: i, seed: { kind: 'constellation', choice: { selected: {} } }, loaded: ['a', 'b'], verdict: 'RED', findings: [] }));
    const run = spawnSync(process.execPath, [fileURLToPath(new URL('./chemistry.mjs', import.meta.url))], { env: { ...process.env, SKY_DIR: root }, encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    const graph = JSON.parse(readFileSync(join(root, 'chemistry/graph.json'), 'utf8'));
    assert.equal(graph.edges.filter(e => e.kind === 'UNSTABLE_WITH').length, 1);
    assert.ok(graph.nodes.every(n => n.gh && n.ext));
  } finally {
    assert.ok(resolve(root).startsWith(resolve(tmpdir()) + sep));
    rmSync(root, { recursive: true, force: true });
  }
});
