// src/actions/generateQuestions.ts
"use server";

import { getOpenAI } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

type GeneratedQuestion = {
  enunciado: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  correcta: "A" | "B" | "C";
  explicacion: string;
  dificultad?: "FACIL" | "MEDIA" | "DIFICIL";
  concepto: string;
};

type GeneratedQuestionsResponse = {
  preguntas: GeneratedQuestion[];
};

async function readMarkdown(markdownPath: string): Promise<string> {
  const cleanPath = markdownPath.startsWith("/")
    ? markdownPath.slice(1)
    : markdownPath;

  const filePath = path.join(process.cwd(), "public", cleanPath);

  return fs.readFile(filePath, "utf8");
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCorrectOptionText(question: GeneratedQuestion): string {
  if (question.correcta === "A") return question.opcionA;
  if (question.correcta === "B") return question.opcionB;
  return question.opcionC;
}

function createFingerprint(
  temaId: number,
  question: GeneratedQuestion,
): string {
  const concepto = normalizeText(question.concepto || question.enunciado);
  const correctOption = normalizeText(getCorrectOptionText(question));

  const optionsSignature = [
    normalizeText(question.opcionA),
    normalizeText(question.opcionB),
    normalizeText(question.opcionC),
  ]
    .sort()
    .join("|");

  return normalizeText(
    `tema:${temaId}|concepto:${concepto}|correcta:${correctOption}|opciones:${optionsSignature}`,
  );
}

function isValidQuestion(question: GeneratedQuestion): boolean {
  return Boolean(
    question.enunciado &&
    question.opcionA &&
    question.opcionB &&
    question.opcionC &&
    ["A", "B", "C"].includes(question.correcta) &&
    question.explicacion &&
    question.concepto,
  );
}

export async function generateQuestions(temaId: number, cantidad: number = 10) {
  if (process.env.DEMO_MODE === "true") {
    return { success: false, error: "Demo: la generación con IA está desactivada." };
  }
  try {
    const tema = await prisma.tema.findUnique({
      where: { id: temaId },
    });

    if (!tema) {
      return { success: false, error: "Tema no encontrado" };
    }

    let sourceContent = `${tema.titulo}\n\n${tema.descripcion}`;

    if (tema.markdownPath) {
      try {
        sourceContent = await readMarkdown(tema.markdownPath);
      } catch {
        console.warn(
          `No se encontró el markdown para el tema ${tema.numero}: ${tema.markdownPath}`,
        );
      }
    }

    const preguntasExistentes = await prisma.pregunta.findMany({
      where: { temaId: tema.id },
      select: {
        enunciado: true,
        opcionA: true,
        opcionB: true,
        opcionC: true,
        correcta: true,
        concepto: true,
        articulo: true,
        fingerprint: true,
        dificultad: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const existingFingerprints = new Set(
      preguntasExistentes
        .map((p) => p.fingerprint)
        .filter((fp): fp is string => Boolean(fp)),
    );

    const conceptosExistentesTexto =
      preguntasExistentes.length > 0
        ? preguntasExistentes
            .slice(0, 120)
            .map((p, index) => {
              const concepto = p.concepto || p.articulo || "Sin concepto";
              return `${index + 1}. Concepto: ${concepto} | Enunciado: ${
                p.enunciado
              }`;
            })
            .join("\n")
        : "No hay preguntas previas.";

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
Eres preparador experto de oposiciones de Auxiliar Administrativo/a del Consorcio de Tributos de Tenerife.

Tu objetivo es generar preguntas tipo test útiles para dominar un tema concreto.

Reglas obligatorias:
- Genera preguntas basadas únicamente en el contenido proporcionado.
- No inventes datos, artículos, plazos, órganos, porcentajes ni requisitos.
- Cada pregunta debe evaluar un concepto concreto.
- El campo "concepto" debe ser claro y específico.
- Se permiten variantes de un mismo concepto, pero deben evaluar un matiz diferente.
- No generes preguntas que sean la misma pregunta con otro enunciado.
- No repitas preguntas con el mismo concepto, mismas opciones y misma respuesta correcta.
- Los distractores deben ser plausibles.
- Evita opciones absurdas.
- No uses "todas son correctas" ni "ninguna es correcta".
- Cada pregunta tendrá exactamente tres opciones: A, B y C.
- Solo una opción será correcta.
- La explicación debe ayudar a estudiar.
- Responde únicamente con JSON válido.
          `.trim(),
        },
        {
          role: "user",
          content: `
Tema ${tema.numero}: ${tema.titulo}

Descripción:
${tema.descripcion}

Contenido completo del tema:
${sourceContent}

Preguntas/conceptos ya existentes:
${conceptosExistentesTexto}

Genera exactamente ${cantidad} preguntas nuevas.

Criterios:
- Prioriza definiciones legales, órganos, competencias, requisitos, plazos, excepciones, procedimientos, listas cerradas y diferencias entre conceptos similares.
- Cubre distintas partes del tema.
- No concentres todas las preguntas en el mismo apartado.
- Si generas una variante de un concepto ya existente, debe preguntar un matiz distinto.
- No generes preguntas prácticas todavía; solo teoría del tema.
- No generes preguntas demasiado fáciles si no aportan valor de estudio.

Distribución recomendada:
- 30% fáciles.
- 50% medias.
- 20% difíciles.

Devuelve exclusivamente este JSON:

{
  "preguntas": [
    {
      "enunciado": "Pregunta clara y precisa",
      "opcionA": "Respuesta A",
      "opcionB": "Respuesta B",
      "opcionC": "Respuesta C",
      "correcta": "A",
      "explicacion": "Explicación útil para estudiar.",
      "dificultad": "MEDIA",
      "concepto": "Concepto específico evaluado"
    }
  ]
}
          `.trim(),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return { success: false, error: "No se recibió contenido de OpenAI" };
    }

    const data = JSON.parse(content) as GeneratedQuestionsResponse;

    if (!Array.isArray(data.preguntas)) {
      return {
        success: false,
        error: "OpenAI no devolvió un array de preguntas válido",
      };
    }

    const preguntasValidas = data.preguntas.filter(isValidQuestion);

    if (preguntasValidas.length === 0) {
      return {
        success: false,
        error: "OpenAI no devolvió preguntas válidas",
      };
    }

    const preguntasParaGuardar: Array<
      GeneratedQuestion & { fingerprint: string }
    > = [];

    const fingerprintsNuevos = new Set<string>();

    for (const pregunta of preguntasValidas) {
      const fingerprint = createFingerprint(tema.id, pregunta);

      if (existingFingerprints.has(fingerprint)) {
        continue;
      }

      if (fingerprintsNuevos.has(fingerprint)) {
        continue;
      }

      fingerprintsNuevos.add(fingerprint);
      preguntasParaGuardar.push({
        ...pregunta,
        fingerprint,
      });
    }

    if (preguntasParaGuardar.length === 0) {
      return {
        success: false,
        error:
          "OpenAI devolvió preguntas válidas, pero todas eran duplicadas o demasiado similares.",
      };
    }

    for (const pregunta of preguntasParaGuardar) {
      try {
        await prisma.pregunta.create({
          data: {
            temaId: tema.id,
            enunciado: pregunta.enunciado,
            opcionA: pregunta.opcionA,
            opcionB: pregunta.opcionB,
            opcionC: pregunta.opcionC,
            correcta: pregunta.correcta,
            explicacion: pregunta.explicacion,
            dificultad: pregunta.dificultad ?? "MEDIA",
            concepto: pregunta.concepto,
            articulo: pregunta.concepto,
            fingerprint: pregunta.fingerprint,
            generadaIA: true,
          },
        });
      } catch (error) {
        console.warn("Pregunta descartada por posible duplicado:", error);
      }
    }

    revalidatePath(`/temas/${tema.numero}`);

    return {
      success: true,
      count: preguntasParaGuardar.length,
      total: preguntasExistentes.length + preguntasParaGuardar.length,
    };
  } catch (error) {
    console.error("Error generando preguntas:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al generar las preguntas",
    };
  }
}
