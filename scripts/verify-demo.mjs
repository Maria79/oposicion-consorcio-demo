import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import { DEMO_TOPICS } from "../prisma/demo-fixtures.mjs";

const file = resolve(process.cwd(), "prisma", "portfolio-demo.sqlite");
const url = process.env.DATABASE_URL;
if (url !== `file:${file}`) {
  throw new Error("Demo verification only accepts the isolated portfolio-demo.sqlite URL.");
}
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
try {
  assert.equal(await prisma.tema.count(), 20);
  assert.equal(await prisma.pregunta.count(), 400);
  assert.equal(await prisma.intento.count(), 3);
  assert.equal(await prisma.preguntaIntento.count(), 30);
  assert.equal(await prisma.pregunta.count({ where: { generadaIA: true } }), 0);
  assert.equal(await prisma.pregunta.count({ where: { enunciado: { startsWith: "[EJEMPLO FICTICIO" } } }), 400);
  for (let topicNumber = 1; topicNumber <= DEMO_TOPICS.length; topicNumber++) {
    const topic = await prisma.tema.findUniqueOrThrow({ where: { numero: topicNumber }, include: { _count: { select: { preguntas: true } } } });
    assert.equal(topic.titulo, DEMO_TOPICS[topicNumber - 1]);
    assert.equal(topic._count.preguntas, 20);
    assert.equal(topic.pdfUrl, "");
    assert.equal(topic.markdownPath, null);
  }
  console.log("Demo verification passed: 20 topics; 20 labeled questions per topic; 3 artificial attempts; no AI-generated questions.");
} finally {
  await prisma.$disconnect();
}
