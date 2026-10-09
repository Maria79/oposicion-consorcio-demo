// src/actions/saveAttempt.ts
"use server";

import { prisma } from "@/lib/prisma";
// import { revalidatePath } from "next/cache";

type PreguntaMostrada = {
  preguntaId: string;
  respuesta: string | null;
  correcta: boolean;
  enBlanco: boolean;
};

type SaveAttemptParams = {
  temaId: number;
  tipo: string;
  modo: string;
  totalPreguntas: number;
  correctas: number;
  incorrectas: number;
  enBlanco: number;
  puntuacion: number;
  tiempoSegundos: number;
  respuestas: string;
  preguntasMostradas: PreguntaMostrada[];
};

export async function saveAttempt(params: SaveAttemptParams) {
  if (process.env.DEMO_MODE === "true") {
    return { success: false, error: "Demo: los intentos no se guardan." };
  }
  try {
    const intento = await prisma.intento.create({
      data: {
        temaId: params.temaId,
        tipo: params.tipo,
        modo: params.modo,
        totalPreguntas: params.totalPreguntas,
        correctas: params.correctas,
        incorrectas: params.incorrectas,
        enBlanco: params.enBlanco,
        puntuacion: params.puntuacion,
        tiempoSegundos: params.tiempoSegundos,
        respuestas: params.respuestas,
      },
    });

    await prisma.preguntaIntento.createMany({
      data: params.preguntasMostradas.map((p) => ({
        intentoId: intento.id,
        preguntaId: p.preguntaId,
        respuesta: p.respuesta,
        correcta: p.correcta,
        enBlanco: p.enBlanco,
      })),
    });

    return { success: true };
  } catch (error) {
    console.error("Error guardando intento:", error);
    return { success: false, error: "Error al guardar el intento" };
  }
}
