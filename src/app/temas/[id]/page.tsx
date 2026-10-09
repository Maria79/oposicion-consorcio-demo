// src/app/temas/[id]/page.tsx
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import TopicClient from "./TopicClient";
import { prisma } from "@/lib/prisma";
import { Intento } from "@prisma/client";

// interface Intento {
//   id: string;
//   temaId: number;
//   tipo: string;
//   modo: string;
//   totalPreguntas: number;
//   correctas: number;
//   incorrectas: number;
//   enBlanco: number;
//   puntuacion: number;
//   tiempoSegundos: number;
//   respuestas: string;
//   createdAt: Date;
// }

// Datos completos de los 20 temas
const TOPICS_DATA: Record<
  number,
  { type: string; title: string; description: string }
> = {
  1: {
    type: "MATERIA GENERAL",
    title: "La Constitución Española de 1978",
    description:
      "Estructura y contenido. Principios generales. Valor normativo. La Reforma constitucional. Derechos y deberes fundamentales.",
  },
  2: {
    type: "MATERIA GENERAL",
    title: "El Estatuto de Autonomía de Canarias",
    description:
      "Valor normativo. Competencias e Instituciones de la Comunidad Autónoma de Canarias. La Agencia Tributaria Canaria.",
  },
  3: {
    type: "MATERIA GENERAL",
    title: "Régimen Local: Régimen jurídico",
    description:
      "Entidades que integran la Administración Local. La Hacienda Local en la Constitución.",
  },
  4: {
    type: "MATERIA GENERAL",
    title: "Las fuentes del Derecho Administrativo",
    description:
      "La jerarquía de las fuentes. La Ley. Las Disposiciones del Ejecutivo con fuerza de Ley: Decreto-Ley y Decreto Legislativo. El Reglamento.",
  },
  5: {
    type: "MATERIA GENERAL",
    title: "Ley 39/2015 del Procedimiento Administrativo",
    description:
      "Derechos de las personas en sus relaciones con las Administraciones Públicas. Derecho y obligación de relacionarse electrónicamente. Identificación y firma. Registros.",
  },
  6: {
    type: "MATERIA ESPECÍFICA",
    title: "Los actos administrativos: requisitos y eficacia",
    description:
      "Fases del procedimiento administrativo. La revisión de oficio de los actos administrativos. Los recursos administrativos.",
  },
  7: {
    type: "MATERIA ESPECÍFICA",
    title: "Atención al contribuyente",
    description:
      "Acogida e información general. Atención presencial, telefónica y telemática. Concepto de documento. Protección de datos.",
  },
  8: {
    type: "MATERIA ESPECÍFICA",
    title: "El Consorcio de Tributos de Tenerife",
    description:
      "Constitución. Naturaleza. Municipios integrados y división en Zonas. Órganos de Gobierno. El Director: atribuciones.",
  },
  9: {
    type: "MATERIA ESPECÍFICA",
    title: "El personal al servicio de las Entidades Locales",
    description:
      "Personal funcionario y laboral. Derechos y deberes. Provisión de puestos. Situaciones administrativas. Régimen disciplinario.",
  },
  10: {
    type: "MATERIA ESPECÍFICA",
    title: "Los recursos de las Entidades Locales",
    description:
      "La imposición y ordenación de los tributos locales. Contenido de las Ordenanzas Fiscales. Impugnación.",
  },
  11: {
    type: "MATERIA ESPECÍFICA",
    title: "La obligación tributaria",
    description:
      "Obligados tributarios. Responsables. Domicilio Fiscal. Cuantificación. Deuda tributaria: recargos e intereses de demora.",
  },
  12: {
    type: "MATERIA ESPECÍFICA",
    title: "Procedimientos de gestión tributaria",
    description:
      "Declaraciones y autoliquidaciones. Las Liquidaciones Tributarias. Notificación. Recursos. Devolución de ingresos indebidos.",
  },
  13: {
    type: "MATERIA ESPECÍFICA",
    title: "El Impuesto sobre Bienes Inmuebles I",
    description:
      "Naturaleza y Hecho Imponible. Supuestos de no sujeción. Sujetos Pasivos. Exenciones.",
  },
  14: {
    type: "MATERIA ESPECÍFICA",
    title: "El Impuesto sobre Bienes Inmuebles II",
    description:
      "Base Imponible y liquidable. Devengo y período impositivo. Gestión catastral y gestión tributaria. El Catastro Inmobiliario.",
  },
  15: {
    type: "MATERIA ESPECÍFICA",
    title: "IAE, IVTM, IIVTNU, Tasas y Contribuciones",
    description:
      "El Impuesto sobre Actividades Económicas. IVTM. IIVTNU. Tasas y contribuciones especiales.",
  },
  16: {
    type: "MATERIA ESPECÍFICA",
    title: "Recaudación en período voluntario",
    description:
      "Recaudación de deudas de vencimiento periódico y notificación colectiva. Plazos de ingreso. Entidades colaboradoras.",
  },
  17: {
    type: "MATERIA ESPECÍFICA",
    title: "Recaudación en período ejecutivo",
    description:
      "El procedimiento de apremio. Recargos del período ejecutivo. Intereses de demora. Providencia de Apremio. Suspensión.",
  },
  18: {
    type: "MATERIA ESPECÍFICA",
    title: "Ejecución de garantías y diligencias de embargo",
    description:
      "Orden de prelación. Particularidades: cuentas, sueldos, créditos, inmuebles. Costas. Terminación del procedimiento.",
  },
  19: {
    type: "MATERIA ESPECÍFICA",
    title: "Aplazamiento y fraccionamiento de deudas",
    description:
      "Tramitación. Garantías. Consecuencias de la falta de pago. Particularidades de la Ordenanza Fiscal del Consorcio.",
  },
  20: {
    type: "MATERIA ESPECÍFICA",
    title: "La inspección de los tributos",
    description:
      "Concepto y funciones. El personal inspector: facultades. Actas de inspección: con acuerdo, conformidad y disconformidad. Potestad sancionadora.",
  },
};

// Mapeo de temas a sus PDFs en /public/pdfs/
const PDF_MAP: Record<number, string> = {
  1: "/pdfs/TEMA 1_ La Constitución Española.pdf",
  2: "/pdfs/TEMA 2.pdf",
  3: "/pdfs/TEMA 3.pdf",
  4: "/pdfs/TEMA 4 Las fuentes del Derecho Administrativo.pdf",
  5: "/pdfs/TEMA 5.pdf",
  6: "/pdfs/TEMA 6_Los actos administrativos requisitos y eficacia.pdf",
  7: "/pdfs/TEMA 7_ Atención al contribuyente Acogida e información general.pdf",
  8: "/pdfs/TEMA 8_El Consorcio de Tributos de Tenerife Constitución. Naturaleza.pdf",
  9: "/pdfs/TEMA 9_El personal al servicio de las Entidades Locales.pdf",
  10: "/pdfs/TEMA 10_Los recursos de las Entidades Locales.pdf",
  11: "/pdfs/TEMA 11_ La obligación tributaria.pdf",
  12: "/pdfs/TEMA 12_Procedimientos de gestión tributaria.pdf",
  13: "/pdfs/TEMA 13_ El Impuesto sobre Bienes Inmuebles I.pdf",
  14: "/pdfs/TEMA 14_ El Impuesto sobre Bienes Inmuebles II (1).pdf",
  15: "/pdfs/TEMA 15.pdf",
  16: "/pdfs/TEMA 16.pdf",
  17: "/pdfs/TEMA 17.pdf",
  18: "/pdfs/TEMA 18.pdf",
  19: "/pdfs/TEMA 19.pdf",
  20: "/pdfs/TEMA 20.pdf",
};

// ✅ Server Component: puede ser async y recibir params como Promise
export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const topicId = parseInt(id);
  const topic = TOPICS_DATA[topicId];
  const demoMode = process.env.DEMO_MODE === "true";
  const pdfUrl = demoMode ? "" : PDF_MAP[topicId];

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tema no encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            El tema que buscas no existe en el temario.
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            ← Volver al temario
          </Link>
        </div>
      </div>
    );
  }

  // Buscar el tema en la BD
  const temaBD = await prisma.tema.findUnique({
    where: { numero: topicId },
  });

  // ✅ Traer los intentos reales (tipo Intento de Prisma)
  let intentos: Intento[] = [];
  if (temaBD) {
    intentos = await prisma.intento.findMany({
      where: { temaId: temaBD.id },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <TopicClient
      topicId={topicId}
      topic={topic}
      pdfUrl={pdfUrl}
      intentos={intentos}
      demoMode={demoMode}
    />
  );
}
