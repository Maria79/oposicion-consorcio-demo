import { test } from "node:test";
import assert from "node:assert/strict";
import { DEMO_TOPICS, buildDemoQuestions, scoreDemoAttempt } from "./demo-fixtures.mjs";

test("generates 20 labeled, deterministic fictional questions per topic", () => {
  assert.equal(DEMO_TOPICS.length, 20);
  for (let topic = 1; topic <= 20; topic++) {
    const first = buildDemoQuestions(123, topic);
    const second = buildDemoQuestions(123, topic);
    assert.deepEqual(first, second);
    assert.equal(first.length, 20);
    assert.equal(new Set(first.map(q => q.fingerprint)).size, 20);
    assert.equal(new Set(first.map(q => q.concepto)).size, 20);
    for (const q of first) {
      assert.equal(q.generadaIA, false);
      assert.match(q.enunciado, /^\[EJEMPLO FICTICIO/);
      assert.ok(["A", "B", "C"].includes(q.correcta));
      assert.match(q.explicacion, /No es una pregunta oficial/);
      const answers = [q.opcionA, q.opcionB, q.opcionC];
      assert.equal(new Set(answers).size, 3);
    }
  }
});

test("synthetic scoring matches the app's half-point error penalty", () => {
  const actual = scoreDemoAttempt([
    { correcta: true, enBlanco: false },
    { correcta: true, enBlanco: false },
    { correcta: false, enBlanco: false },
    { correcta: false, enBlanco: true },
  ]);
  assert.deepEqual(actual, { total: 4, correctas: 2, enBlanco: 1, incorrectas: 1, puntuacion: 3.75 });
});
