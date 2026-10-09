// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const TEMAS = [
  {
    numero: 1,
    titulo: "La Constitución Española de 1978",
    descripcion:
      "Estructura y contenido. Principios generales. Valor normativo. La Reforma constitucional. Derechos y deberes fundamentales.",
    tipo: "GENERAL",
    pdfUrl: "/pdfs/TEMA 1_ La Constitución Española.pdf",
    markdownPath: "/data/markdown/TEMA_1.md",
  },
  {
    numero: 2,
    titulo: "El Estatuto de Autonomía de Canarias",
    descripcion:
      "Valor normativo. Competencias e Instituciones de la Comunidad Autónoma de Canarias. La Agencia Tributaria Canaria.",
    tipo: "GENERAL",
    pdfUrl: "/pdfs/TEMA 2.pdf",
    markdownPath: "/data/markdown/TEMA_2.md",
  },
  {
    numero: 3,
    titulo: "Régimen Local: Régimen jurídico",
    descripcion:
      "Entidades que integran la Administración Local. La Hacienda Local en la Constitución.",
    tipo: "GENERAL",
    pdfUrl: "/pdfs/TEMA 3.pdf",
    markdownPath: "/data/markdown/TEMA_3.md",
  },
  {
    numero: 4,
    titulo: "Las fuentes del Derecho Administrativo",
    descripcion:
      "La jerarquía de las fuentes. La Ley. Las Disposiciones del Ejecutivo con fuerza de Ley: Decreto-Ley y Decreto Legislativo. El Reglamento.",
    tipo: "GENERAL",
    pdfUrl: "/pdfs/TEMA 4 Las fuentes del Derecho Administrativo.pdf",
    markdownPath: "/data/markdown/TEMA_4.md",
  },
  {
    numero: 5,
    titulo: "Ley 39/2015 del Procedimiento Administrativo",
    descripcion:
      "Derechos de las personas en sus relaciones con las Administraciones Públicas. Derecho y obligación de relacionarse electrónicamente. Identificación y firma. Registros.",
    tipo: "GENERAL",
    pdfUrl: "/pdfs/TEMA 5.pdf",
    markdownPath: "/data/markdown/TEMA_5.md",
  },
  {
    numero: 6,
    titulo: "Los actos administrativos: requisitos y eficacia",
    descripcion:
      "Fases del procedimiento administrativo. La revisión de oficio de los actos administrativos. Los recursos administrativos.",
    tipo: "ESPECIFICA",
    pdfUrl: "/pdfs/TEMA 6_Los actos administrativos requisitos y eficacia.pdf",
    markdownPath: "/data/markdown/TEMA_6.md",
  },
  {
    numero: 7,
    titulo: "Atención al contribuyente",
    descripcion:
      "Acogida e información general. Atención presencial, telefónica y telemática. Concepto de documento. Protección de datos.",
    tipo: "ESPECIFICA",
    pdfUrl:
      "/pdfs/TEMA 7_ Atención al contribuyente Acogida e información general.pdf",
    markdownPath: "/data/markdown/TEMA_7.md",
  },
  {
    numero: 8,
    titulo: "El Consorcio de Tributos de Tenerife",
    descripcion:
      "Constitución. Naturaleza. Municipios integrados y división en Zonas. Órganos de Gobierno. El Director: atribuciones.",
    tipo: "ESPECIFICA",
    pdfUrl:
      "/pdfs/TEMA 8_El Consorcio de Tributos de Tenerife Constitución. Naturaleza.pdf",
    markdownPath: "/data/markdown/TEMA_8.md",
  },
  {
    numero: 9,
    titulo: "El personal al servicio de las Entidades Locales",
    descripcion:
      "Personal funcionario y laboral. Derechos y deberes. Provisión de puestos. Situaciones administrativas. Régimen disciplinario.",
    tipo: "ESPECIFICA",
    pdfUrl: "/pdfs/TEMA 9_El personal al servicio de las Entidades Locales.pdf",
    markdownPath: "/data/markdown/TEMA_9.md",
  },
  {
    numero: 10,
    titulo: "Los recursos de las Entidades Locales",
    descripcion:
      "La imposición y ordenación de los tributos locales. Contenido de las Ordenanzas Fiscales. Impugnación.",
    tipo: "ESPECIFICA",
    pdfUrl: "/pdfs/TEMA 10_Los recursos de las Entidades Locales.pdf",
    markdownPath: "/data/markdown/TEMA_10.md",
  },
  {
    numero: 11,
    titulo: "La obligación tributaria",
    descripcion:
      "Obligados tributarios. Responsables. Domicilio Fiscal. Cuantificación. Deuda tributaria: recargos e intereses de demora.",
    tipo: "ESPECIFICA",
    pdfUrl: "/pdfs/TEMA 11_ La obligación tributaria.pdf",
    markdownPath: "/data/markdown/TEMA_11.md",
  },
  {
    numero: 12,
    titulo: "Procedimientos de gestión tributaria",
    descripcion:
      "Declaraciones y autoliquidaciones. Las Liquidaciones Tributarias. Notificación. Recursos. Devolución de ingresos indebidos.",
    tipo: "ESPECIFICA",
    pdfUrl: "/pdfs/TEMA 12_Procedimientos de gestión tributaria.pdf",
    markdownPath: "/data/markdown/TEMA_12.md",
  },
  {
    numero: 13,
    titulo: "El Impuesto sobre Bienes Inmuebles I",
    descripcion:
      "Naturaleza y Hecho Imponible. Supuestos de no sujeción. Sujetos Pasivos. Exenciones.",
    tipo: "ESPECIFICA",
    pdfUrl: "/pdfs/TEMA 13_ El Impuesto sobre Bienes Inmuebles I.pdf",
    markdownPath: "/data/markdown/TEMA_13.md",
  },
  {
    numero: 14,
    titulo: "El Impuesto sobre Bienes Inmuebles II",
    descripcion:
      "Base Imponible y liquidable. Devengo y período impositivo. Gestión catastral y gestión tributaria. El Catastro Inmobiliario.",
    tipo: "ESPECIFICA",
    pdfUrl: "/pdfs/TEMA 14_ El Impuesto sobre Bienes Inmuebles II (1).pdf",
    markdownPath: "/data/markdown/TEMA_14.md",
  },
  {
    numero: 15,
    titulo: "IAE, IVTM, IIVTNU, Tasas y Contribuciones",
    descripcion:
      "El Impuesto sobre Actividades Económicas. IVTM. IIVTNU. Tasas y contribuciones especiales.",
    tipo: "ESPECIFICA",
    pdfUrl: "/pdfs/TEMA 15.pdf",
    markdownPath: "/data/markdown/TEMA_15.md",
  },
  {
    numero: 16,
    titulo: "Recaudación en período voluntario",
    descripcion:
      "Recaudación de deudas de vencimiento periódico y notificación colectiva. Plazos de ingreso. Entidades colaboradoras.",
    tipo: "ESPECIFICA",
    pdfUrl: "/pdfs/TEMA 16.pdf",
    markdownPath: "/data/markdown/TEMA_16.md",
  },
  {
    numero: 17,
    titulo: "Recaudación en período ejecutivo",
    descripcion:
      "El procedimiento de apremio. Recargos del período ejecutivo. Intereses de demora. Providencia de Apremio. Suspensión.",
    tipo: "ESPECIFICA",
    pdfUrl: "/pdfs/TEMA 17.pdf",
    markdownPath: "/data/markdown/TEMA_17.md",
  },
  {
    numero: 18,
    titulo: "Ejecución de garantías y diligencias de embargo",
    descripcion:
      "Orden de prelación. Particularidades: cuentas, sueldos, créditos, inmuebles. Costas. Terminación del procedimiento.",
    tipo: "ESPECIFICA",
    pdfUrl: "/pdfs/TEMA 18.pdf",
    markdownPath: "/data/markdown/TEMA_18.md",
  },
  {
    numero: 19,
    titulo: "Aplazamiento y fraccionamiento de deudas",
    descripcion:
      "Tramitación. Garantías. Consecuencias de la falta de pago. Particularidades de la Ordenanza Fiscal del Consorcio.",
    tipo: "ESPECIFICA",
    pdfUrl: "/pdfs/TEMA 19.pdf",
    markdownPath: "/data/markdown/TEMA_19.md",
  },
  {
    numero: 20,
    titulo: "La inspección de los tributos",
    descripcion:
      "Concepto y funciones. El personal inspector: facultades. Actas de inspección: con acuerdo, conformidad y disconformidad. Potestad sancionadora.",
    tipo: "ESPECIFICA",
    pdfUrl: "/pdfs/TEMA 20.pdf",
    markdownPath: "/data/markdown/TEMA_20.md",
  },
];

async function main() {
  console.log("🌱 Poblando base de datos...");
  for (const tema of TEMAS) {
    await prisma.tema.upsert({
      where: { numero: tema.numero },
      update: tema,
      create: tema,
    });
    console.log(`✅ Tema ${tema.numero}: ${tema.titulo}`);
  }
  console.log("\n✅ Base de datos poblada correctamente con 20 temas");
}

main()
  .catch((e) => {
    console.error("❌ Error poblando BD:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
