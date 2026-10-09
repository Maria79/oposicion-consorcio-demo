// src/lib/questionSelector.ts
import { prisma } from "@/lib/prisma";
import type { Pregunta } from "@prisma/client";

type TestMode = "quick" | "complete";

type QuestionStats = {
  preguntaId: string;
  vecesVista: number;
  aciertos: number;
  fallos: number;
  blancos: number;
  ultimaVista: Date | null;
};

type PreguntaConScore = Pregunta & {
  score: number;
  conceptoNormalizado: string;
};

function normalizeConcept(value: string | null | undefined): string {
  return (value || "sin-concepto")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function isRecent(date: Date | null, hours: number): boolean {
  if (!date) return false;

  const limit = new Date();
  limit.setHours(limit.getHours() - hours);

  return date > limit;
}

function calculateScore(
  pregunta: Pregunta,
  stats: QuestionStats | undefined,
  mode: TestMode,
): number {
  let score = 100;

  if (!stats) {
    score += mode === "quick" ? 100 : 40;
  } else if (mode === "quick") {
    score -= stats.vecesVista * 10;
    score += stats.fallos * 35;
    score += stats.blancos * 20;
    score -= stats.aciertos * 25;

    if (isRecent(stats.ultimaVista, 24)) {
      score -= 100;
    }
  } else {
    score -= stats.vecesVista * 4;
    score += stats.fallos * 25;
    score += stats.blancos * 10;
    score -= stats.aciertos * 5;

    if (isRecent(stats.ultimaVista, 24)) {
      score -= 20;
    }
  }

  if (pregunta.dificultad === "DIFICIL") score += mode === "quick" ? 10 : 15;
  if (pregunta.dificultad === "MEDIA") score += 5;

  return score;
}

export async function selectQuestionsForTest(
  temaId: number,
  cantidad: number,
  mode: TestMode = "quick",
): Promise<Pregunta[]> {
  const preguntas = await prisma.pregunta.findMany({
    where: { temaId },
    orderBy: { createdAt: "desc" },
  });

  if (preguntas.length === 0) return [];

  const historial = await prisma.preguntaIntento.findMany({
    where: {
      pregunta: {
        temaId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const statsMap = new Map<string, QuestionStats>();

  for (const item of historial) {
    const current = statsMap.get(item.preguntaId) ?? {
      preguntaId: item.preguntaId,
      vecesVista: 0,
      aciertos: 0,
      fallos: 0,
      blancos: 0,
      ultimaVista: null,
    };

    current.vecesVista += 1;

    if (item.enBlanco) {
      current.blancos += 1;
    } else if (item.correcta) {
      current.aciertos += 1;
    } else {
      current.fallos += 1;
    }

    if (!current.ultimaVista || item.createdAt > current.ultimaVista) {
      current.ultimaVista = item.createdAt;
    }

    statsMap.set(item.preguntaId, current);
  }

  const preguntasConScore: PreguntaConScore[] = preguntas.map((pregunta) => {
    const stats = statsMap.get(pregunta.id);

    return {
      ...pregunta,
      conceptoNormalizado: normalizeConcept(
        pregunta.concepto || pregunta.articulo,
      ),
      score: calculateScore(pregunta, stats, mode),
    };
  });

  const candidatas = preguntasConScore
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);

  const seleccionadas: Pregunta[] = [];
  const idsUsados = new Set<string>();
  const conceptosUsados = new Set<string>();

  for (const pregunta of shuffle(candidatas)) {
    if (seleccionadas.length >= cantidad) break;

    if (idsUsados.has(pregunta.id)) continue;
    if (conceptosUsados.has(pregunta.conceptoNormalizado)) continue;

    idsUsados.add(pregunta.id);
    conceptosUsados.add(pregunta.conceptoNormalizado);
    seleccionadas.push(pregunta);
  }

  if (seleccionadas.length < cantidad) {
    const relleno = preguntasConScore
      .filter((p) => !idsUsados.has(p.id))
      .sort((a, b) => b.score - a.score);

    for (const pregunta of relleno) {
      if (seleccionadas.length >= cantidad) break;

      if (conceptosUsados.has(pregunta.conceptoNormalizado)) continue;

      idsUsados.add(pregunta.id);
      conceptosUsados.add(pregunta.conceptoNormalizado);
      seleccionadas.push(pregunta);
    }
  }

  return seleccionadas;
}
