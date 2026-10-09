// src/app/temas/[id]/test/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TestPlayer from "@/components/test/TestPlayer";
import { selectQuestionsForTest } from "@/lib/questionSelector";

export default async function TestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const { mode = "quick" } = await searchParams;

  const temaNumero = parseInt(id, 10);

  const tema = await prisma.tema.findUnique({
    where: { numero: temaNumero },
  });

  if (!tema) return notFound();

  const cantidad = mode === "quick" ? 10 : 20;

  const preguntasSeleccionadas = await selectQuestionsForTest(
    tema.id,
    cantidad,
    mode === "complete" ? "complete" : "quick",
  );

  if (preguntasSeleccionadas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No hay preguntas disponibles
          </h1>
          <p className="text-gray-600 mb-6">
            Vuelve al tema y genera preguntas nuevas.
          </p>
          <a
            href={`/temas/${tema.numero}`}
            className="text-blue-600 hover:underline"
          >
            ← Volver al tema
          </a>
        </div>
      </div>
    );
  }

  return (
    <TestPlayer
      tema={tema}
      demoMode={process.env.DEMO_MODE === "true"}
      preguntas={preguntasSeleccionadas.map((p) => ({
        id: p.id,
        enunciado: p.enunciado,
        opcionA: p.opcionA,
        opcionB: p.opcionB,
        opcionC: p.opcionC,
        correcta: p.correcta,
        explicacion: p.explicacion || "",
      }))}
    />
  );
}
