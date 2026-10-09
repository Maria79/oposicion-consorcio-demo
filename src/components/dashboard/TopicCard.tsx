import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Tema {
  id: number;
  numero: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  intentos: Array<{
    puntuacion: number;
  }>;
}

interface TopicCardProps {
  tema: Tema;
}

export function TopicCard({ tema }: TopicCardProps) {
  const hasAttempts = tema.intentos.length > 0;
  const notaMaxima = hasAttempts
    ? Math.max(...tema.intentos.map((i) => i.puntuacion))
    : undefined;

  return (
    <Link href={`/temas/${tema.numero}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 ${
                  hasAttempts
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tema.numero}
              </div>
              <h3 className="font-semibold text-base leading-tight">
                {tema.titulo}
              </h3>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 shrink-0 ml-2" />
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-10">
            {tema.descripcion}
          </p>

          <div className="flex items-center justify-between pt-3 border-t">
            <Badge
              variant={tema.tipo === "GENERAL" ? "default" : "secondary"}
              className="text-xs"
            >
              {tema.tipo === "GENERAL" ? "GENERAL" : "ESPECÍFICA"}
            </Badge>

            {hasAttempts ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {notaMaxima?.toFixed(2)} / 10
                </span>
                <span className="text-xs text-gray-500">
                  ({tema.intentos.length} intentos)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <Circle className="h-4 w-4" />
                <span className="text-xs">Sin intentos</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
