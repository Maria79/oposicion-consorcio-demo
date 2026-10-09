// src/components/test/TestPlayer.tsx
"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertCircle,
  SkipForward,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { saveAttempt } from "@/actions/saveAttempt";

interface Pregunta {
  id: string;
  enunciado: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  correcta: string;
  explicacion: string;
}

interface Tema {
  id: number;
  numero: number;
  titulo: string;
}

interface TestPlayerProps {
  tema: Tema;
  preguntas: Pregunta[];
  demoMode?: boolean;
}

const formatTiempo = (segundos: number): string => {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${min.toString().padStart(2, "0")}:${seg.toString().padStart(2, "0")}`;
};

const normalizeAnswer = (value: string | null | undefined) =>
  value?.trim().toUpperCase();

export default function TestPlayer({ tema, preguntas, demoMode = false }: TestPlayerProps) {
  // Estados
  const [indiceActual, setIndiceActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string | null>>(
    {},
  );
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [mostrarRevision, setMostrarRevision] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);

  // Cronómetro
  useEffect(() => {
    if (mostrarResultado) return;

    const intervalo = setInterval(() => {
      setTiempoTranscurrido((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [mostrarResultado]);

  // Determinar modo (RAPIDO o COMPLETO)
  const modoTest = preguntas.length <= 10 ? "RAPIDO" : "COMPLETO";

  // Calcular estadísticas DESPUÉS de mostrar resultados
  const aciertos = mostrarResultado
    ? preguntas.filter((p) => {
        const respuesta = normalizeAnswer(respuestas[p.id]);
        const correcta = normalizeAnswer(p.correcta);

        return respuesta === correcta;
      }).length
    : 0;

  const fallos = mostrarResultado
    ? preguntas.filter((p) => {
        const respuesta = normalizeAnswer(respuestas[p.id]);
        const correcta = normalizeAnswer(p.correcta);

        return respuesta !== undefined && respuesta !== correcta;
      }).length
    : 0;

  const blancos = mostrarResultado
    ? preguntas.filter((p) => {
        const respuesta = respuestas[p.id];
        return respuesta === null || respuesta === undefined;
      }).length
    : 0;

  const notaConPenalizacion =
    preguntas.length > 0
      ? ((aciertos - fallos / 2) / preguntas.length) * 10
      : 0;
  const notaFinal = Math.max(0, Number(notaConPenalizacion.toFixed(2)));

  // Guardar intento cuando se muestran los resultados
  useEffect(() => {
    if (!mostrarResultado || isSaved || preguntas.length === 0) return;
    if (demoMode) return; // The demo is read-only: do not write shared attempts.

    const guardarIntento = async () => {
      // Construir preguntasMostradas
      const preguntasMostradas = preguntas.map((p) => {
        const respuesta = respuestas[p.id];
        const enBlanco = respuesta === null || respuesta === undefined;
        const correcta = !enBlanco && respuesta === p.correcta;

        return {
          preguntaId: p.id,
          respuesta: respuesta,
          correcta: correcta,
          enBlanco: enBlanco,
        };
      });

      await saveAttempt({
        temaId: tema.id,
        tipo: "TEST",
        modo: modoTest,
        totalPreguntas: preguntas.length,
        correctas: aciertos,
        incorrectas: fallos,
        enBlanco: blancos,
        puntuacion: notaFinal,
        tiempoSegundos: tiempoTranscurrido,
        respuestas: JSON.stringify(respuestas),
        preguntasMostradas: preguntasMostradas,
      });

      setIsSaved(true);
    };

    guardarIntento();
  }, [
    mostrarResultado,
    isSaved,
    preguntas,
    aciertos,
    fallos,
    blancos,
    notaFinal,
    respuestas,
    tiempoTranscurrido,
    modoTest,
    tema.id,
    demoMode,
  ]);

  // Variables derivadas
  const preguntaActual = preguntas[indiceActual];

  const respuestaSeleccionada = preguntaActual
    ? respuestas[preguntaActual.id]
    : null;
  const esUltima = indiceActual === preguntas.length - 1;

  // Handlers
  const seleccionarRespuesta = (opcion: string) => {
    if (mostrarResultado || !preguntaActual) return;

    setRespuestas((prev) => ({
      ...prev,
      [preguntaActual.id]: opcion,
    }));
  };

  const dejarEnBlanco = () => {
    if (mostrarResultado || !preguntaActual) return;
    setRespuestas((prev) => ({
      ...prev,
      [preguntaActual.id]: null,
    }));

    if (esUltima) {
      setMostrarResultado(true);
    } else {
      setIndiceActual((prev) => prev + 1);
    }
  };

  const siguientePregunta = () => {
    if (!preguntaActual) return;

    if (esUltima) {
      setRespuestas((prev) => {
        setMostrarResultado(true);
        return prev;
      });
    } else {
      setIndiceActual((prev) => prev + 1);
    }
  };

  const anteriorPregunta = () => {
    setIndiceActual((prev) => Math.max(0, prev - 1));
  };

  const revisarPregunta = (index: number) => {
    setIndiceActual(index);
    setMostrarRevision(true);
    setMostrarResultado(false);
  };

  // PANTALLA DE RESULTADOS
  if (mostrarResultado && !mostrarRevision) {
    const aprobado = notaFinal >= 4;

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            {aprobado ? (
              <Trophy className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {aprobado ? "¡Test completado!" : "Test no superado"}
            </h1>

            <p className="text-gray-600 mb-2">
              Tema {tema.numero}: {tema.titulo}
            </p>

            <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
              <Clock className="h-4 w-4" />
              Tiempo: {formatTiempo(tiempoTranscurrido)}
            </div>
          </div>

          <Card className="mb-6 border-2">
            <CardContent className="p-8 text-center">
              <div
                className={`text-6xl font-bold mb-2 ${
                  aprobado ? "text-green-600" : "text-red-600"
                }`}
              >
                {notaFinal.toFixed(2)}
              </div>

              <div className="text-gray-500 mb-6">sobre 10</div>

              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">
                    {aciertos}
                  </div>
                  <div className="text-sm text-green-600">Correctas</div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-700">
                    {fallos}
                  </div>
                  <div className="text-sm text-red-600">Incorrectas</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-700">
                    {blancos}
                  </div>
                  <div className="text-sm text-gray-600">En blanco</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                <strong>Fórmula aplicada:</strong> (Aciertos - Errores/2) × (10/
                {preguntas.length})
                <br />
                <em>
                  ({aciertos} - {fallos}/2) × (10/{preguntas.length}) ={" "}
                  {notaFinal.toFixed(2)}
                </em>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revisión por preguntas:
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {preguntas.map((p, index) => {
                const respuesta = respuestas[p.id];
                const esCorrecta =
                  normalizeAnswer(respuesta) === normalizeAnswer(p.correcta);
                const estaEnBlanco =
                  respuesta === null || respuesta === undefined;

                let bgColor = "bg-gray-50";
                let icon = <AlertCircle className="h-4 w-4 text-gray-500" />;
                let texto = "Sin contestar";

                if (!estaEnBlanco) {
                  if (esCorrecta) {
                    bgColor = "bg-green-50 border border-green-200";
                    icon = <CheckCircle2 className="h-4 w-4 text-green-600" />;
                    texto = `Correcta (${respuesta})`;
                  } else {
                    bgColor = "bg-red-50 border border-red-200";
                    icon = <XCircle className="h-4 w-4 text-red-600" />;
                    texto = `Fallada (Tu: ${respuesta} | Correcta: ${p.correcta})`;
                  }
                }

                return (
                  <button
                    key={p.id}
                    onClick={() => revisarPregunta(index)}
                    className={`w-full p-3 rounded-lg ${bgColor} hover:opacity-80 transition-opacity flex items-center justify-between text-left cursor-pointer`}
                  >
                    <div className="flex items-center gap-3">
                      {icon}
                      <span className="text-sm font-medium">
                        Pregunta {index + 1}
                      </span>
                    </div>

                    <span className="text-sm text-gray-600">{texto}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => setMostrarRevision(false)}>
              Cerrar revisión
            </Button>

            <Link href={`/temas/${tema.numero}`}>
              <Button>Volver al tema</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MODO REVISIÓN
  if (mostrarRevision) {
    const respuesta = respuestas[preguntaActual.id];
    const estaEnBlanco = respuesta === null || respuesta === undefined;

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setMostrarRevision(false)}>
              ← Volver a resultados
            </Button>

            <span className="text-sm font-medium text-gray-500">
              Pregunta {indiceActual + 1} de {preguntas.length}
            </span>

            <Button
              variant="outline"
              onClick={anteriorPregunta}
              disabled={indiceActual === 0}
            >
              Anterior
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {preguntaActual.enunciado}
              </h2>

              <div className="space-y-3">
                {(["A", "B", "C"] as const).map((opcion) => {
                  const textoOpcion = preguntaActual[
                    `opcion${opcion}` as keyof typeof preguntaActual
                  ] as string;

                  const isSelected = respuesta === opcion;
                  const isCorrect = opcion === preguntaActual.correcta;

                  let borderColor = "border-gray-200";
                  let bgColor = "bg-white";
                  let icon = null;

                  if (estaEnBlanco && isCorrect) {
                    borderColor = "border-gray-400";
                    bgColor = "bg-gray-100";
                    icon = <CheckCircle2 className="h-5 w-5 text-gray-600" />;
                  } else if (isSelected && isCorrect) {
                    borderColor = "border-green-600";
                    bgColor = "bg-green-50";
                    icon = <CheckCircle2 className="h-5 w-5 text-green-600" />;
                  } else if (isSelected && !isCorrect) {
                    borderColor = "border-red-600";
                    bgColor = "bg-red-50";
                    icon = <XCircle className="h-5 w-5 text-red-600" />;
                  } else if (isCorrect) {
                    borderColor = "border-green-600";
                    bgColor = "bg-green-50";
                    icon = <CheckCircle2 className="h-5 w-5 text-green-600" />;
                  }

                  return (
                    <div
                      key={opcion}
                      className={`w-full p-4 rounded-lg border-2 flex items-center gap-4 ${borderColor} ${bgColor}`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {opcion}
                      </span>

                      <span className="text-gray-900 flex-1">
                        {textoOpcion}
                      </span>

                      {icon}
                    </div>
                  );
                })}
              </div>

              {preguntaActual.explicacion && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                  <strong>Explicación:</strong> {preguntaActual.explicacion}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => revisarPregunta(Math.max(0, indiceActual - 1))}
                  disabled={indiceActual === 0}
                >
                  ← Anterior
                </Button>

                <Button
                  onClick={() =>
                    revisarPregunta(
                      Math.min(preguntas.length - 1, indiceActual + 1),
                    )
                  }
                  disabled={indiceActual === preguntas.length - 1}
                >
                  Siguiente →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // MODO TEST NORMAL
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/temas/${tema.numero}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Salir del test
          </Link>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="font-mono font-semibold text-gray-900">
              {formatTiempo(tiempoTranscurrido)}
            </span>
          </div>

          <span className="text-sm font-medium text-gray-500">
            Pregunta {indiceActual + 1} de {preguntas.length}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((indiceActual + 1) / preguntas.length) * 100}%`,
            }}
          />
        </div>

        <Card className="mb-6">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {preguntaActual.enunciado}
            </h2>

            <div className="space-y-3">
              {(["A", "B", "C"] as const).map((opcion) => {
                const textoOpcion = preguntaActual[
                  `opcion${opcion}` as keyof typeof preguntaActual
                ] as string;

                const isSelected = respuestaSeleccionada === opcion;

                const borderColor = isSelected
                  ? "border-blue-600"
                  : "border-gray-200 hover:border-blue-400";

                const bgColor = isSelected ? "bg-blue-50" : "bg-white";

                return (
                  <button
                    key={opcion}
                    onClick={() => seleccionarRespuesta(opcion)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-4 cursor-pointer ${borderColor} ${bgColor}`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {opcion}
                    </span>

                    <span className="text-gray-900">{textoOpcion}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={anteriorPregunta}
            disabled={indiceActual === 0}
          >
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={dejarEnBlanco}
              className="text-gray-600"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Dejar en blanco
            </Button>

            <Button
              onClick={siguientePregunta}
              disabled={respuestaSeleccionada === undefined}
            >
              {esUltima ? "Ver resultados" : "Siguiente"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
