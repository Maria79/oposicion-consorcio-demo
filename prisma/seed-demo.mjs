import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { resolve } from "node:path";
import { DEMO_TOPICS, buildDemoQuestions, scoreDemoAttempt } from "./demo-fixtures.mjs";

// Never run this command against the user's original dev.db or an existing DB.
const expected = resolve(process.cwd(), "prisma", "portfolio-demo.sqlite");
const url = process.env.DATABASE_URL ?? "";
if (
  process.env.DEMO_SEED_ALLOWED !== "isolated-portfolio-database" ||
  url !== `file:${expected}`
) {
  throw new Error("Demo seeding refused: only the isolated portfolio-demo.sqlite database is permitted.");
}

const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Protect against overwriting the owner's study records or re-seeding
  // an existing database that could have real visitor activity.
  const counts = await Promise.all([
    prisma.tema.count(),
    prisma.pregunta.count(),
    prisma.intento.count(),
    prisma.preguntaIntento.count(),
  ]);
  if (counts.some(count => count !== 0)) {
    throw new Error("Demo seeding refused: target database is not empty.");
  }

  for (const [index, titulo] of DEMO_TOPICS.entries()) {
    const numero = index + 1;
    const tema = await prisma.tema.create({
      data: {
        numero,
        titulo,
        descripcion: "DEMO FICTICIA — Ejercicios sobre organización de una oficina. No representan preguntas del examen ni asesoramiento jurídico.",
        tipo: numero <= 5 ? "GENERAL" : "ESPECIFICA",
        pdfUrl: "",
        markdownPath: null,
        contenido: "Material totalmente ficticio creado para enseñar el funcionamiento técnico de la aplicación.",
        resumen: null,
      },
    });
    await prisma.pregunta.createMany({
      data: buildDemoQuestions(tema.id, numero),
    });
  }

  // Artificial attempt histories: they demonstrate the progress dashboard
  // without copying the owner's real attempts from prisma/dev.db.
  const examples = [
    { numero: 1, wrong: [1, 6], blank: [8], seconds: 211, date: "2026-01-03T10:00:00Z" },
    { numero: 7, wrong: [0, 4, 5], blank: [9], seconds: 310, date: "2026-01-04T11:00:00Z" },
    { numero: 13, wrong: [2], blank: [3, 8], seconds: 180, date: "2026-01-05T12:00:00Z" },
  ];
  for (const example of examples) {
    const tema = await prisma.tema.findUniqueOrThrow({ where: { numero: example.numero } });
    const questions = buildDemoQuestions(tema.id, example.numero).slice(0, 10);
    const answers = questions.map((q, index) => {
      const enBlanco = example.blank.includes(index);
      const correct = !enBlanco && !example.wrong.includes(index);
      const distractor = q.correcta === "A" ? "B" : "A";
      return {
        preguntaId: q.id,
        respuesta: enBlanco ? null : correct ? q.correcta : distractor,
        correcta: correct,
        enBlanco,
      };
    });
    const score = scoreDemoAttempt(answers);
    const intento = await prisma.intento.create({
      data: {
        temaId: tema.id,
        tipo: "TEST",
        modo: "RAPIDO",
        totalPreguntas: score.total,
        correctas: score.correctas,
        incorrectas: score.incorrectas,
        enBlanco: score.enBlanco,
        puntuacion: score.puntuacion,
        tiempoSegundos: example.seconds,
        respuestas: JSON.stringify(answers),
        createdAt: new Date(example.date),
      },
    });
    await prisma.preguntaIntento.createMany({
      data: answers.map(a => ({ ...a, intentoId: intento.id, createdAt: new Date(example.date) })),
    });
  }

  const summary = await Promise.all([
    prisma.tema.count(), prisma.pregunta.count(),
    prisma.intento.count(), prisma.preguntaIntento.count(),
  ]);
  if (summary.join(",") !== "20,400,3,30") {
    throw new Error("Unexpected synthetic dataset size: " + summary.join(","));
  }
  console.log("Portfolio DEMO data created: 20 topics, 400 fictional questions, 3 synthetic attempts, 30 example answers.");
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
