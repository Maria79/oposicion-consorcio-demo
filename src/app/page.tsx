import { StatsCard } from "@/components/dashboard/StatsCard";
import { TopicCard } from "@/components/dashboard/TopicCard";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Trophy,
  TrendingUp,
  FileText,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getEstadisticas() {
  const intentos = await prisma.intento.findMany();

  const temasEstudiados = new Set(intentos.map((i) => i.temaId)).size;
  const temasAprobados = new Set(
    intentos.filter((i) => i.puntuacion >= 5).map((i) => i.temaId),
  ).size;

  const notaMedia =
    intentos.length > 0
      ? intentos.reduce((acc, i) => acc + i.puntuacion, 0) / intentos.length
      : 0;

  const progresoGlobal = Math.round((temasEstudiados / 20) * 100);

  return {
    temasEstudiados,
    temasAprobados,
    notaMedia: parseFloat(notaMedia.toFixed(2)),
    testsRealizados: intentos.length,
    progresoGlobal,
  };
}

async function getTemas() {
  return await prisma.tema.findMany({
    orderBy: { numero: "asc" },
    include: {
      intentos: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function Dashboard() {
  const [estadisticas, temas] = await Promise.all([
    getEstadisticas(),
    getTemas(),
  ]);

  const temasGenerales = temas.filter((t) => t.tipo === "GENERAL");
  const temasEspecificos = temas.filter((t) => t.tipo === "ESPECIFICA");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Oposición Auxiliar Administrativo
            </h1>
          </div>
          <p className="text-gray-600 ml-11 text-sm">
            Consorcio de Tributos de Tenerife · 36 plazas · Grupo C2
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {process.env.DEMO_MODE === "true" && (
          <div role="status" className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <strong>DEMO FICTICIA.</strong> Las preguntas y estadísticas son datos de ejemplo.
            No representan preguntas oficiales. Las respuestas que marques no se guardan.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Temas estudiados"
            value={`${estadisticas.temasEstudiados}/20`}
            icon={BookOpen}
            color="blue"
          />
          <StatsCard
            title="Temas aprobados"
            value={`${estadisticas.temasAprobados}/20`}
            icon={Trophy}
            color="green"
          />
          <StatsCard
            title="Nota media"
            value={estadisticas.notaMedia.toFixed(2)}
            icon={TrendingUp}
            color="yellow"
          />
          <StatsCard
            title="Tests realizados"
            value={estadisticas.testsRealizados.toString()}
            icon={FileText}
            color="purple"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Progreso global</h2>
            <span className="text-sm font-medium text-gray-600">
              {estadisticas.progresoGlobal}%
            </span>
          </div>
          <Progress value={estadisticas.progresoGlobal} className="h-3" />
        </div>

        <Tabs defaultValue="temario" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="temario">Temario</TabsTrigger>
            <TabsTrigger value="evolucion">Mi Evolución</TabsTrigger>
            <TabsTrigger value="simulacros">Simulacros</TabsTrigger>
          </TabsList>

          <TabsContent value="temario" className="space-y-8">
            <section>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Materias Generales
                </h2>
                <p className="text-gray-600 text-sm">
                  Temas 1 al 5 · Constitución, Administración Local, Canarias,
                  Igualdad y Protección de Datos
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {temasGenerales.map((tema) => (
                  <TopicCard key={tema.id} tema={tema} />
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Materias Específicas
                </h2>
                <p className="text-gray-600 text-sm">
                  Temas 6 al 20 · Derecho Administrativo, Tributario,
                  Recaudación y Presupuestos
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {temasEspecificos.map((tema) => (
                  <TopicCard key={tema.id} tema={tema} />
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="evolucion">
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gráficas de evolución
              </h3>
              <p className="text-gray-600">
                Próximamente verás aquí tu progreso detallado por temas y
                fechas.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="simulacros">
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Simulacros de examen
              </h3>
              <p className="text-gray-600">
                Aquí podrás realizar simulacros completos tipo test y supuestos
                prácticos.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
