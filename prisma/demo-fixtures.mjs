// Pure, deterministic and openly fictional portfolio data.
// No questions were copied from personal databases or source study PDFs.
export const DEMO_TOPICS = [
  "La Constitución Española de 1978",
  "El Estatuto de Autonomía de Canarias",
  "Régimen Local: Régimen jurídico",
  "Las fuentes del Derecho Administrativo",
  "Ley 39/2015 del Procedimiento Administrativo",
  "Los actos administrativos: requisitos y eficacia",
  "Atención al contribuyente",
  "El Consorcio de Tributos de Tenerife",
  "El personal al servicio de las Entidades Locales",
  "Los recursos de las Entidades Locales",
  "La obligación tributaria",
  "Procedimientos de gestión tributaria",
  "El Impuesto sobre Bienes Inmuebles I",
  "El Impuesto sobre Bienes Inmuebles II",
  "IAE, IVTM, IIVTNU, Tasas y Contribuciones",
  "Recaudación en período voluntario",
  "Recaudación en período ejecutivo",
  "Ejecución de garantías y diligencias de embargo",
  "Aplazamiento y fraccionamiento de deudas",
  "La inspección de los tributos"
];

const CASES = [
  [
    "registro de una consulta",
    "Registrar la solicitud con una referencia de seguimiento.",
    "Archivar la consulta sin leerla.",
    "Comunicar una respuesta inventada."
  ],
  [
    "cambio en una dirección de contacto",
    "Solicitar confirmación del dato antes de actualizarlo.",
    "Sustituirlo por el de otra persona.",
    "Compartir el dato sin permiso."
  ],
  [
    "organización de documentos",
    "Usar un nombre y clasificación coherentes.",
    "Guardar todos los archivos sin identificar.",
    "Eliminar el original sin revisión."
  ],
  [
    "atención a una persona usuaria",
    "Escuchar y aclarar qué trámite necesita.",
    "Presuponer el motivo de su visita.",
    "Pedir datos ajenos a su consulta."
  ],
  [
    "una incidencia en el sistema",
    "Registrar el incidente y comunicarlo al responsable.",
    "Ocultar el error para no interrumpir.",
    "Inventar un resultado correcto."
  ],
  [
    "recepción de documentos incompletos",
    "Indicar qué información falta de forma clara.",
    "Aceptar el documento como completo.",
    "Añadir información sin autorización."
  ],
  [
    "una duda sobre una fecha",
    "Contrastar la fecha con la fuente correspondiente.",
    "Elegir un día al azar.",
    "Copiar una fecha de otro expediente."
  ],
  [
    "revisión de un registro duplicado",
    "Verificar la coincidencia antes de consolidarlo.",
    "Borrar ambos registros sin comprobar.",
    "Crear una tercera copia."
  ],
  [
    "envío de un mensaje de seguimiento",
    "Resumir el estado y el siguiente paso.",
    "Incluir información privada de terceros.",
    "Prometer una resolución no confirmada."
  ],
  [
    "protección de un archivo interno",
    "Aplicar acceso según las funciones autorizadas.",
    "Publicar un enlace abierto para cualquiera.",
    "Compartir la contraseña del equipo."
  ],
  [
    "clasificación de un expediente",
    "Asignar un identificador y categoría verificables.",
    "Cambiar su tipo sin comprobarlo.",
    "Mezclarlo con otro expediente ajeno."
  ],
  [
    "una consulta que no puede resolverse al momento",
    "Explicar la situación y derivarla al área adecuada.",
    "Afirmar una respuesta sin verificar.",
    "Cerrar la consulta sin información."
  ],
  [
    "preparación de una reunión",
    "Anotar temas y responsables de seguimiento.",
    "Repartir tareas sin comunicarlas.",
    "Compartir notas con datos privados."
  ],
  [
    "corrección de una entrada errónea",
    "Registrar la corrección dejando trazabilidad.",
    "Sobrescribir el registro sin explicación.",
    "Cambiar también registros correctos."
  ],
  [
    "confirmación de recepción",
    "Emitir un acuse con referencia verificable.",
    "Garantizar un resultado todavía desconocido.",
    "Ignorar la entrega."
  ],
  [
    "solicitud de información confidencial",
    "Verificar la identidad y autorización.",
    "Entregar los datos sin comprobar nada.",
    "Enviar los datos a un grupo público."
  ],
  [
    "consulta de documentación oficial",
    "Comprobar la fuente y su fecha de publicación.",
    "Usar exclusivamente un resumen anónimo.",
    "Asumir que nunca se actualiza."
  ],
  [
    "resumen de un caso",
    "Separar hechos confirmados de pendientes.",
    "Presentar suposiciones como hechos.",
    "Omitir toda referencia temporal."
  ],
  [
    "actualización de un listado",
    "Validar el cambio antes de guardarlo.",
    "Modificar todos los registros a la vez.",
    "Deshabilitar el historial de cambios."
  ],
  [
    "preparación de una tarea recurrente",
    "Documentar frecuencia, responsable y resultado.",
    "Repetirla sin revisar errores.",
    "Ejecutarla con credenciales compartidas."
  ]
];

/**
 * These questions demonstrate application mechanics, not official exam content.
 * Repeated operational scenarios across subjects are deliberate and labeled.
 */
export function buildDemoQuestions(topicId, numero) {
  return CASES.map(([concept, correct, wrong1, wrong2], index) => {
    const opts = [correct, wrong1, wrong2];
    const correctPosition = (numero + index) % 3;
    const rearranged = [...opts.slice(1)];
    rearranged.splice(correctPosition, 0, opts[0]);
    return {
      id: `demo-${String(numero).padStart(2,"0")}-${String(index+1).padStart(2,"0")}`,
      temaId: topicId,
      enunciado: `[EJEMPLO FICTICIO · Tema ${numero}] En una oficina simulada, ¿qué harías ante ${concept}?`,
      opcionA: rearranged[0],
      opcionB: rearranged[1],
      opcionC: rearranged[2],
      correcta: ["A","B","C"][correctPosition],
      explicacion: `Ejercicio ficticio: ${correct} No es una pregunta oficial ni una explicación legal.`,
      articulo: "EJEMPLO FICTICIO",
      concepto: `Ejemplo ${index+1}: ${concept}`,
      fingerprint: `demo-v1-topic-${numero}-scenario-${index+1}`,
      dificultad: index % 5 === 0 ? "DIFICIL" : index % 2 === 0 ? "MEDIA" : "FACIL",
      tipo: "TEST",
      generadaIA: false,
      flagMal: false
    };
  });
}

export function scoreDemoAttempt(answers) {
  const total = answers.length;
  const correctas = answers.filter(a=>a.correcta).length;
  const enBlanco = answers.filter(a=>a.enBlanco).length;
  const incorrectas = total-correctas-enBlanco;
  const puntuacion = Math.max(0,Number(((correctas-incorrectas/2)/total*10).toFixed(2)));
  return {total,correctas,enBlanco,incorrectas,puntuacion};
}
