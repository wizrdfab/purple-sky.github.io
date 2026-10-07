import { config } from '../config';
import { RESEARCH, RISK } from '../content/facts';
import { date, num, pct, sol } from '../format';

// Spanish is the reference: the English dictionary must have the same shape (the compiler checks it).
// Words: "periodo de trading", "terminar antes", "tu billetera". Never "depósito" or "bloqueo", and no promised returns.

const L = 'es' as const;
const d = config.defaults;
const n = RESEARCH.strategy;

export const es = {
  lang: {
    code: 'es',
    other: 'EN',
    otherLabel: 'Read in English',
  },
  skip: 'Saltar al contenido',
  nav: {
    how: 'Cómo funciona',
    numbers: 'Resultados',
    risks: 'Riesgos',
    fees: 'Comisión',
    about: 'Quiénes somos',
    app: 'Empezar',
    menu: 'Menú',
  },
  hero: {
    kicker: 'Solana · una billetera que es tuya',
    title: 'Tu billetera, operada por un periodo que tú eliges.',
    lead:
      'PurpleSky opera una estrategia de trading en Solana sobre una billetera que es tuya. ' +
      `Tú eliges cuánto (${num(d.perPersonMinSol, L)} a ${num(d.perPersonMaxSol, L)} SOL) y por cuánto tiempo. ` +
      'Al final, todo vuelve a tu Phantom. Puedes terminar antes cuando quieras.',
    cta: 'Empezar',
    ctaWaitlist: 'Inscribirme en la lista',
    ctaRisks: 'Leer los riesgos primero',
    waitlistNote:
      'La prueba con los fondos del fundador fue exitosa. ' +
      'Por ahora abrimos solo a personas que han sido invitadas personalmente. Puedes inscribirte y te avisaremos cuando estemos listos.',
    openNote:
      'La prueba con los fondos del fundador fue exitosa. ' +
      'Abrimos paso a paso, empezando por personas invitadas en privado.',
  },
  risk: {
    title: 'Antes de nada: los riesgos',
    items: [
      'Puedes perder parte o todo lo que pongas.',
      `En la investigación, el ${RISK.lostPct} % de las operaciones perdió dinero, y cerca del ${RISK.bigLossPct} % perdió más del ${RISK.bigLossOverPct} % de lo que puso.`,
      `${RISK.daysDown} de los ${RISK.days} días de investigación terminó en pérdida. Un día, una semana o un periodo completo pueden terminar en pérdida.`,
      `La estrategia es nueva: ${n.sessions} días de investigación y un historial en vivo que empezó el ${date(RESEARCH.liveSince, L)}.`,
      'No es asesoría financiera ni un producto de inversión regulado. No hay rentabilidad prometida ni seguro de ningún tipo.',
      'Usa solo dinero que puedas perder por completo.',
    ],
    more: 'Leer la divulgación de riesgos completa',
  },
  how: {
    title: 'Cómo funciona',
    lead: 'Un botón, cinco pasos. Tus fondos nunca salen de una billetera que es tuya.',
    steps: [
      {
        title: 'Conectas Phantom',
        body:
          'Inicias sesión firmando un mensaje con Phantom (no mueve fondos). Se crea una billetera de trading a tu ' +
          'nombre, con Privy. Es tuya: puedes exportar su llave privada cuando quieras.',
      },
      {
        title: `Pones entre ${num(d.perPersonMinSol, L)} y ${num(d.perPersonMaxSol, L)} SOL`,
        body:
          `Mueves SOL desde Phantom a tu billetera de trading. Por ahora, el total entre todas las personas no pasa de ${num(d.totalCapSol, L)} SOL.`,
      },
      {
        title: 'Eliges el periodo y tu comisión',
        body:
          `${d.periodDays.join(' o ')} días. La comisión es una parte de la ganancia, al final: mínimo ${d.feeMinPct} %, ` +
          'más si quieres. Si no hay ganancia, no hay comisión.',
      },
      {
        title: 'Autorizas un permiso acotado',
        body:
          'Nuestro servidor puede operar tu billetera durante el periodo, bajo una política que Privy hace cumplir: ' +
          'compras y ventas en un exchange descentralizado de Solana, y transferencias solo de vuelta a tu Phantom y la ' +
          'comisión a la nuestra.',
      },
      {
        title: 'Al final, todo vuelve a ti',
        body:
          'Cuando termina el periodo, o cuando lo terminas antes, el trader vende lo abierto y envía todo a tu ' +
          'Phantom, menos la comisión si hubo ganancia. Es automático.',
      },
    ],
    policyTitle: 'Lo que el permiso permite, y lo que no',
    policyAllows: [
      'Comprar y vender tokens en un exchange descentralizado de Solana, y pagar las tarifas de la red.',
      'Enviar SOL a tu Phantom.',
      'Enviar la comisión a la billetera de PurpleSky al liquidar.',
    ],
    policyDenies: [
      'Enviar SOL o tokens a cualquier otra dirección.',
      'Usar cualquier otro programa de Solana.',
    ],
    policyNote:
      'La política limita a dónde puede ir el dinero; no puede revisar que la comisión esté bien calculada. Eso lo hace ' +
      'nuestro software, y cada liquidación queda en la cadena para que la verifiques.',
    controlTitle: 'Tú mantienes el control',
    control: [
      'Terminar antes, en cualquier momento.',
      'Quitar el permiso de PurpleSky cuando no haya un periodo en curso.',
      'Exportar la llave privada de tu billetera de trading.',
    ],
    strategyTitle: 'La estrategia, en simple',
    strategy: [
      'Compra y vende tokens de Solana de forma automática, según reglas propias.',
      'Cada operación usa solo una parte del saldo de tu billetera, nunca todo.',
    ],
  },
  numbers: {
    title: 'Lo que ha mostrado la estrategia',
    lead:
      `Investigación del ${date(RESEARCH.dataFrom, L).replace(' de 2026', '')} al ${date(RESEARCH.dataTo, L)}, ` +
      'simulando la operación real, comisiones incluidas. El intervalo es el del 95 %.',
    perTrade: 'por operación, en promedio',
    range: (lo: number, hi: number) => `intervalo del 95 %: ${pct(lo, L)} a ${pct(hi, L)}`,
    research: {
      label: `Investigación · en vivo desde el ${date(RESEARCH.liveSince, L).replace(' de 2026', '')}`,
      details: `${n.trades} operaciones en ${n.sessions} días · ${n.wonPct} % ganadoras · ${n.sessionsPositive} de ${n.sessions} días positivos`,
    },
    live: {
      label: 'Historial en vivo',
      empty:
        `Empezó el ${date(RESEARCH.liveSince, L)} con la billetera del fundador. Lo publicaremos aquí a medida que ` +
        'crezca, sea bueno o malo.',
      stats: (trades: number, mean: number, won: number | null, since: string) =>
        `${trades} operaciones desde el ${date(since, L)} · promedio ${pct(mean, L)}` +
        (won === null ? '' : ` · ${num(won, L, 0)} % ganadoras`),
      updated: (when: string) => `Actualizado: ${when}`,
    },
    caveatsTitle: 'Lo que estos números son, y lo que no',
    caveats: [
      `Son ${n.sessions} días de datos. Es poco: el intervalo es amplio y el futuro puede ser distinto.`,
      'Un promedio por operación no es lo que gana tu billetera: cada operación usa solo una parte del saldo, así que ' +
        'mueve la billetera mucho menos que la operación misma, y antes de los costos de red.',
      `Son promedios: el ${RISK.lostPct} % de las operaciones perdió dinero en la investigación.`,
      'Nada de esto es una promesa ni un pronóstico.',
    ],
  },
  fees: {
    title: 'La comisión, y a dónde va',
    items: [
      'Solo cobramos si ganas: una parte de la ganancia del periodo, al final. Si no hay ganancia, no pagas comisión.',
      `El mínimo es ${d.feeMinPct} %. Puedes elegir dar más.`,
      'Si terminas antes, la comisión se calcula sobre la ganancia hasta ese momento.',
    ],
    exampleTitle: 'Ejemplos ilustrativos, no expectativas',
    exampleWin:
      `Empiezas con ${sol(0.3, L)} y el periodo termina con ${sol(0.36, L)}: la ganancia es ${sol(0.06, L)}; con ` +
      `${d.feeMinPct} %, la comisión es ${sol(0.006, L)} y recibes ${sol(0.354, L)}.`,
    exampleLoss: `Empiezas con ${sol(0.3, L)} y termina con ${sol(0.25, L)}: no hay comisión y recibes ${sol(0.25, L)}.`,
    costs:
      'Las operaciones además pagan las tarifas de la red Solana y del exchange. Ya están descontadas en los resultados de arriba.',
    causesTitle: 'Causas de la naturaleza',
    causes:
      'Lo que se obtenga se usará para cumplir la misión del beneficiar a la naturaleza y la humanidad. Antes de abrir a otras personas publicaremos aquí las ' +
      'causas, la proporción de cada comisión que reciben y cada donación con su transacción.',
  },
  ideas: {
    title: 'Ideas a largo plazo',
    items: [
      'Subir los límites solo cuando los resultados en vivo coincidan con la investigación.',
      'Agregar estrategias solo si pasan las mismas pruebas: hipótesis escritas antes, probadas en datos que no se usaron para crearlas.',
      'Publicar el historial en vivo completo, pérdidas incluidas.',
    ],
    note: 'Son ideas, no compromisos.',
  },
  about: {
    title: 'Quiénes somos',
    founder:
      'PurpleSky es el proyecto de una persona en Chile: un trader con miles de horas de experiencia en mercados, ' +
      'que sigue la tecnología blockchain desde sus comienzos. Lo operará una fundación sin ánimos de lucro; sus datos están en los términos.',
    contact: 'Escríbenos',
    builtTitle: 'Cómo se construyó',
    built: [
      'Primero, investigación sobre datos históricos, con hipótesis escritas antes de probarlas.',
      'Después, operaciones simuladas.',
      `Desde el ${date(RESEARCH.liveSince, L).replace(' de 2026', '')}, los fondos del propio fundador.`,
    ],
  },
  footer: {
    rights: 'PurpleSky, parte de FL Org.',
    notAdvice: 'Nada en este sitio es asesoría financiera. Puedes perder todo lo que pongas.',
    risks: 'Riesgos',
    terms: 'Términos',
    privacy: 'Privacidad',
    draft: 'Los términos, los riesgos y la privacidad son borradores en revisión legal.',
  },
  doc: {
    draft: 'BORRADOR para revisión legal. Todavía no es un contrato vigente.',
    back: 'Volver al inicio',
    otherLang: 'La versión en castellano es la que rige.',
    loading: 'Cargando…',
  },
  notFound: {
    title: 'Esta página no existe',
    back: 'Ir al inicio',
  },
  app: {
    title: 'Tu periodo de trading',
    demoBanner: 'DEMO: nada aquí es real. No hay billeteras, fondos ni operaciones reales; los números son inventados.',
    demoExit: 'Salir de la demo',
    notConfigured: 'El botón todavía no está conectado. Mientras tanto, puedes recorrer el flujo en la demo.',
    openDemo: 'Abrir la demo',
    signUpByContact: 'Para inscribirte ahora, escríbenos o únete a nuestro Telegram:',
    loading: 'Cargando…',
    loadFailed: 'No pudimos cargar el inicio de sesión. Recarga la página; si sigue fallando, escríbenos.',
    apiDown: 'No podemos contactar al servidor ahora. Tus fondos no se ven afectados. Intenta de nuevo en unos minutos.',
    retry: 'Reintentar',
    logout: 'Cerrar sesión',
    cancelled: 'Cancelaste la firma.',
    failed: (msg: string) => `Algo falló: ${msg}`,
    connect: {
      title: 'Conecta tu Phantom',
      body:
        'Inicias sesión firmando un mensaje con Phantom; no mueve fondos. Se crea una billetera de trading que es tuya.',
      button: 'Conectar Phantom',
      mobile: 'En el teléfono, abre esta página dentro del navegador de la app Phantom.',
    },
    wallets: {
      phantom: 'Tu Phantom',
      trading: 'Tu billetera de trading',
      creating: 'Creando tu billetera de trading…',
      copy: 'Copiar',
      copied: 'Copiado',
      explorer: 'Ver en Solscan',
    },
    waitlist: {
      title: 'Aún no abrimos a otras personas',
      body:
        'Antes de operar dinero de otros, esperamos la revisión de un abogado y un periodo de prueba limpio con los ' +
        'fondos del fundador. Inscríbete y te avisaremos cuando abra.',
      amount: '¿Cuánto pensarías poner? (SOL)',
      days: 'Periodo',
      fee: 'Comisión sobre la ganancia',
      contact: 'Correo o usuario de Telegram (opcional)',
      risks: 'Leí los riesgos: podría perder parte o todo.',
      submit: 'Inscribirme',
      done: 'Listo: estás en la lista. Te avisaremos cuando abra.',
      doneFallback: 'Tu inicio de sesión quedó registrado. Anunciaremos la apertura en Telegram y en X.',
      demo: 'Ver el flujo completo en la demo (nada real)',
    },
    steps: ['Riesgos y términos', 'Tu billetera de trading', 'Periodo y comisión', 'Autorizar y empezar'],
    terms: {
      title: 'Los riesgos y los términos',
      summary: [
        'Puedes perder parte o todo el SOL que pongas en tu billetera de trading.',
        'Durante el periodo, nuestro servidor opera esa billetera bajo una política: solo compras y ventas de tokens, y SOL solo de vuelta a tu Phantom y la comisión a la nuestra.',
        'Puedes terminar antes cuando quieras: el trader vende lo abierto y te devuelve todo, menos la comisión si hubo ganancia.',
        'No hay rentabilidad prometida. Los resultados pasados o de investigación no aseguran nada.',
      ],
      readRisks: 'Divulgación de riesgos',
      readTerms: 'Términos',
      readPrivacy: 'Privacidad',
      checkRisk: 'Entiendo que puedo perder parte o todo el SOL que ponga en la billetera de trading.',
      checkTerms: (v: string) => `Leí y acepto los términos (versión ${v}) y el aviso de privacidad.`,
      checkAge: 'Tengo 18 años o más.',
      continue: 'Continuar',
    },
    fund: {
      title: 'Tu billetera de trading',
      balance: 'Saldo de tu billetera de trading',
      phantomBalance: 'Saldo en tu Phantom',
      range: (min: number, max: number) =>
        `Para empezar, tu billetera de trading debe tener entre ${sol(min, L)} y ${sol(max, L)}.`,
      totalLeft: (x: number) => `Espacio disponible entre todas las personas: ${sol(x, L)}.`,
      amount: 'SOL a mover desde Phantom',
      after: (x: number) => `Tu billetera de trading quedará con ${sol(x, L)}.`,
      send: 'Mover desde Phantom',
      signing: 'Esperando tu firma…',
      confirming: 'Confirmando en la red…',
      ok: 'Tu billetera de trading está dentro de los límites.',
      tooMuch: (x: number) => `Tu billetera de trading tiene más que el límite. Devuelve ${sol(x, L)} a Phantom para empezar.`,
      returnExcess: 'Devolver el exceso a Phantom',
      errLow: (min: number) => `Con esto quedarías bajo el mínimo de ${sol(min, L)}.`,
      errHigh: (max: number) => `Con esto pasarías el máximo de ${sol(max, L)}.`,
      errPhantom: 'No tienes suficiente SOL en Phantom (deja un poco para la tarifa de la red).',
      errFull: 'No queda espacio entre todas las personas por ahora. Vuelve a intentar más adelante.',
      continue: 'Continuar',
      back: 'Volver',
    },
    period: {
      title: 'Periodo y comisión',
      days: (n: number) => `${n} días`,
      fee: 'Tu comisión sobre la ganancia',
      feeHelp: (min: number) => `Mínimo ${min} %. Solo se cobra si el periodo termina con ganancia.`,
      hours: 'El trader compra solo en su horario de operación. Fuera de él, tu billetera espera.',
      continue: 'Continuar',
      back: 'Volver',
    },
    start: {
      title: 'Autorizar y empezar',
      body:
        'Al pulsar pasan tres cosas: registramos tu billetera y creamos su política; Privy te pide aprobar el permiso ' +
        'de PurpleSky sobre tu billetera de trading; y empieza el periodo.',
      amount: 'En tu billetera de trading',
      period: 'Periodo',
      fee: 'Comisión sobre la ganancia',
      ends: 'Termina aprox.',
      button: 'Autorizar y empezar',
      registering: 'Creando tu política…',
      authorizing: 'Aprueba el permiso en la ventana de Privy…',
      starting: 'Empezando el periodo…',
      back: 'Volver',
    },
    dash: {
      periodOf: (k: number) => `Periodo de ${k} días`,
      status: { active: 'En curso', closing: 'Cerrando: vendiendo y devolviendo', settled: 'Terminado' },
      ends: (when: string) => `Termina: ${when}`,
      endedAt: (when: string) => `Terminó: ${when}`,
      started: 'Al empezar',
      now: 'Ahora',
      result: 'Resultado',
      fee: 'Comisión elegida',
      open: 'Posiciones abiertas',
      none: 'Ninguna ahora',
      openCount: (k: number) => (k === 1 ? '1 posición' : `${k} posiciones`),
      closed: 'Operaciones cerradas en el periodo',
      noClosed: 'Todavía ninguna',
      closedCount: (k: number, won: number) => `${k} · ${won} con ganancia`,
      endEarly: 'Terminar antes',
      endConfirm:
        'El trader venderá lo abierto a precio de mercado y enviará todo a tu Phantom, menos la comisión si hay ' +
        'ganancia hasta ahora. ¿Terminar el periodo ahora?',
      endYes: 'Sí, terminar',
      endNo: 'Seguir',
      settlement: 'Liquidación',
      final: 'Saldo final',
      profit: 'Ganancia',
      feePaid: 'Comisión pagada',
      returned: 'Enviado a tu Phantom',
      tx: 'transacción',
      newPeriod: 'Empezar otro periodo',
      refresh: 'Actualizar',
      updated: (t: string) => `Actualizado ${t}`,
      hours: 'Compra solo en su horario de operación.',
    },
    tools: {
      title: 'Tu billetera es tuya',
      export: 'Exportar la llave privada',
      exportNote:
        'Privy muestra la llave en una ventana aparte; PurpleSky nunca la ve. Mover fondos durante un periodo lo termina antes.',
      returnAll: 'Enviar todo el saldo a Phantom',
      returnNote: 'Disponible sin un periodo en curso.',
      revoke: 'Quitar el permiso de PurpleSky',
      revokeNote: 'Con un periodo en curso, usa «Terminar antes»: sin el permiso, el trader no puede vender lo abierto.',
      revoked: 'Permiso quitado. PurpleSky ya no puede operar tu billetera.',
      sent: 'Enviado.',
    },
  },
};

export type Dict = typeof es;
