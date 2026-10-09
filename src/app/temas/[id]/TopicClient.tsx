// src/app/temas/[id]/TopicClient.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  Play,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dynamic from "next/dynamic";
import { generateQuestions } from "@/actions/generateQuestions";
import { Intento } from "@prisma/client";

const PdfViewer = dynamic(
  () => import("@/components/topics/PdfViewer").then((mod) => mod.PdfViewer),
  {
    ssr: false,
    loading: () => <p>Cargando visor de PDF...</p>,
  },
);

interface Topic {
  type: string;
  title: string;
  description: string;
}

interface TopicClientProps {
  topicId: number;
  topic: Topic;
  pdfUrl: string;
  intentos: Intento[];
  demoMode: boolean;
}

export default function TopicClient({
  topicId,
  topic,
  pdfUrl,
  intentos,
  demoMode,
}: TopicClientProps) {
  const router = useRouter();
  const [isGeneratingQuick, setIsGeneratingQuick] = useState(false);
  const [isGeneratingComplete, setIsGeneratingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGenerateQuickTest = async () => {
    if (demoMode) {
      router.push(`/temas/${topicId}/test?mode=quick`);
      return;
    }
    setIsGeneratingQuick(true);
    setIsGeneratingComplete(false);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await generateQuestions(topicId, 10);

      if (result.success) {
        setSuccessMessage(
          `✅ ${result.count} preguntas generadas correctamente. Total en el pool: ${result.total}`,
        );
        setTimeout(() => {
          router.push(`/temas/${topicId}/test?mode=quick`);
        }, 1500);
      } else {
        setError(result.error || "Error al generar las preguntas");
      }
    } catch (err) {
      setError("Error de conexión. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setIsGeneratingQuick(false);
    }
  };

  const handleGenerateCompleteTest = async () => {
    if (demoMode) {
      router.push(`/temas/${topicId}/test?mode=complete`);
      return;
    }
    setIsGeneratingComplete(true);
    setIsGeneratingQuick(false);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await generateQuestions(topicId, 20);

      if (result.success) {
        setSuccessMessage(
          `✅ ${result.count} preguntas generadas correctamente. Total en el pool: ${result.total}`,
        );
        setTimeout(() => {
          router.push(`/temas/${topicId}/test?mode=complete`);
        }, 1500);
      } else {
        setError(result.error || "Error al generar las preguntas");
      }
    } catch (err) {
      setError("Error de conexión. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setIsGeneratingComplete(false);
    }
  };

  const mejorPuntuacion =
    intentos.length > 0 ? Math.max(...intentos.map((i) => i.puntuacion)) : null;

  const formatearFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  const formatearTiempo = (segundos: number) => {
    if (segundos === 0) return "Sin tiempo";
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Navegación */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al temario
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0">
              {topicId}
            </div>
            <div className="flex-1">
              <Badge
                variant="secondary"
                className="mb-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
              >
                {topic.type}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {topic.title}
              </h1>
              <p className="text-gray-600 text-base">{topic.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {demoMode && (
          <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950 text-sm">
            <strong>DEMO FICTICIA.</strong> Los test utilizan preguntas predefinidas.
            No se realizan llamadas a IA ni se guardan tus respuestas.
          </div>
        )}
        <Tabs defaultValue="teoria" className="space-y-6">
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none p-0 h-auto w-full justify-start gap-6">
            <TabsTrigger
              value="teoria"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-4 py-3 text-base font-medium text-gray-500 data-[state=active]:text-black"
            >
              📖 Teoría
            </TabsTrigger>
            <TabsTrigger
              value="test"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-4 py-3 text-base font-medium text-gray-500 data-[state=active]:text-black"
            >
              ▶ Test
            </TabsTrigger>
          </TabsList>

          {/* PESTAÑA TEORÍA */}
          <TabsContent value="teoria" className="space-y-6 mt-6">
            {/* Tarjeta Resumen IA */}
            {!demoMode && (
            <Card className="border border-gray-200">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <Sparkles className="h-10 w-10 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Resumen inteligente
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  La IA analizará el PDF del tema y creará un resumen
                  estructurado con ideas clave, plazos, normativa y detalles
                  importantes para el examen.
                </p>
                <Button className="bg-black text-white hover:bg-gray-800 px-6 py-2 text-base">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar resumen
                </Button>
              </CardContent>
            </Card>
            )}

{/* Visor de PDF */}
            {pdfUrl && <PdfViewer pdfUrl={pdfUrl} />}

            {/* Tarjeta PDF Original */}
            {!demoMode && pdfUrl && (
            <Card className="border border-gray-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Documento original del tema
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => window.open(pdfUrl, "_blank")}
                >
                  Abrir en pestaña nueva
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
            )}
</TabsContent>

          {/* PESTAÑA TEST */}
          <TabsContent value="test" className="space-y-8 mt-6">
            {/* Alertas de éxito/error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Botones de Test */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* BOTÓN 1: TEST RÁPIDO */}
              <Button
                onClick={handleGenerateQuickTest}
                disabled={isGeneratingQuick || isGeneratingComplete}
                className="h-24 bg-black text-white hover:bg-gray-800 flex flex-col items-start justify-center px-6 text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3 mb-1">
                  {isGeneratingQuick ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                  <span className="text-lg font-bold">Test rápido</span>
                </div>
                <span className="text-sm text-gray-300 ml-8">
                  {isGeneratingQuick ? "Generando..." : "10 preguntas"}
                </span>
              </Button>

              {/* BOTÓN 2: TEST COMPLETO */}
              <Button
                variant="outline"
                onClick={handleGenerateCompleteTest}
                disabled={isGeneratingQuick || isGeneratingComplete}
                className="h-24 border-2 border-gray-200 hover:bg-gray-50 flex flex-col items-start justify-center px-6 text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3 mb-1">
                  {isGeneratingComplete ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                  ) : (
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                  )}
                  <span className="text-lg font-bold text-gray-900">
                    Test completo
                  </span>
                </div>
                <span className="text-sm text-gray-500 ml-8">
                  {isGeneratingComplete ? "Generando..." : "20 preguntas"}
                </span>
              </Button>
            </div>

            {/* Historial de Intentos REALES */}
            {intentos.length > 0 && (
              <div className="space-y-4">
                {/* Mejor Puntuación */}
                {mejorPuntuacion !== null && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">
                      Mejor puntuación
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-green-700">
                        {mejorPuntuacion.toFixed(2)}
                      </span>
                      <span className="text-xl text-gray-500">/ 10</span>
                    </div>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900 mt-8">
                  Historial de intentos ({intentos.length})
                </h3>
                <div className="space-y-3">
                  {intentos.map((attempt) => {
                    const passed = attempt.puntuacion >= 4;
                    return (
                      <Card
                        key={attempt.id}
                        className="border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {passed ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-500" />
                            )}
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span
                                  className={`text-lg font-bold ${
                                    passed ? "text-green-700" : "text-red-600"
                                  }`}
                                >
                                  {attempt.puntuacion.toFixed(2)}
                                </span>
                                <span className="text-gray-500">/ 10</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {attempt.correctas} correctas ·{" "}
                                {attempt.incorrectas} erróneas ·{" "}
                                {attempt.enBlanco} en blanco
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center justify-end gap-1">
                              <Clock className="h-3 w-3" />
                              {formatearTiempo(attempt.tiempoSegundos)}
                            </div>
                            <div>{formatearFecha(attempt.createdAt)}</div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mensaje si no hay intentos */}
            {intentos.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">
                  Aún no has realizado ningún test en este tema.
                  <br />
                  <span className="text-sm">
                    Haz clic en &quot;Test rápido&quot; o &quot;Test
                    completo&quot; para empezar.
                  </span>
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
