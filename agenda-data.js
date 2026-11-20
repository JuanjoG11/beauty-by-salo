// ==========================================
// BEAUTY STUDIO BY SALOMÉ OSORIO
// Datos de Agenda Navideña (gestionados por Admin)
// ==========================================

// Clave de almacenamiento local para los datos de la agenda
const AGENDA_STORAGE_KEY = 'salome_agenda_navidad_2025';
const WA_NUMBER = '573126879434';

// ──────────────────────────────────────────
// SERVICIOS DISPONIBLES PARA AGENDAR
// ──────────────────────────────────────────
const BOOKING_SERVICES = [
  // ── PROMOS NAVIDEÑAS (aparecen primero) ──
  {
    id: 'promo-mirada-labios',
    name: 'Mirada + Labios',
    category: '🎁 Promos Navideñas',
    price: 110000,
    originalPrice: 125000,
    tag: 'Montaje pestañas + Hidralips'
  },
  {
    id: 'promo-facial-completo',
    name: 'Facial Completo',
    category: '🎁 Promos Navideñas',
    price: 105000,
    originalPrice: 125000,
    tag: 'Limpieza + Hidratación facial'
  },
  {
    id: 'promo-whispy-navidad',
    name: 'Whispy Navideño',
    category: '🎁 Promos Navideñas',
    price: 110000,
    originalPrice: 117000,
    tag: 'Efecto Whispy + Color o Apliques'
  },
  // ── MONTAJES ──
  {
    id: 'efecto-natural',
    name: 'Efecto Natural',
    category: 'Montajes',
    price: 70000,
    duration: '90 min'
  },
  {
    id: 'efecto-pestanina',
    name: 'Efecto Pestañina',
    category: 'Montajes',
    price: 80000,
    duration: '90 min'
  },
  {
    id: 'efecto-2d',
    name: 'Efecto 2D',
    category: 'Montajes',
    price: 85000,
    duration: '100 min'
  },
  {
    id: 'efecto-3d-sutil',
    name: 'Efecto 3D Sutil',
    category: 'Montajes',
    price: 90000,
    duration: '100 min'
  },
  {
    id: 'efecto-3d',
    name: 'Efecto 3D',
    category: 'Montajes',
    price: 100000,
    duration: '110 min'
  },
  {
    id: 'efecto-whispy',
    name: 'Efecto Whispy',
    category: 'Montajes',
    price: 110000,
    duration: '110 min'
  },
  {
    id: 'tecnorimel',
    name: 'Tecno Rímel',
    category: 'Montajes',
    price: 85000,
    duration: '90 min'
  },
  {
    id: 'retoque-natural',
    name: 'Retoque Natural',
    category: 'Retoques',
    price: 45000,
    duration: '60 min'
  },
  {
    id: 'retoque-pestanina',
    name: 'Retoque Pestañina',
    emoji: '💄',
    category: 'Retoques',
    price: 50000,
    duration: '60 min'
  },
  {
    id: 'retoque-2d',
    name: 'Retoque 2D',
    category: 'Retoques',
    price: 50000,
    duration: '65 min'
  },
  {
    id: 'retoque-3d-sutil',
    name: 'Retoque 3D Sutil',
    category: 'Retoques',
    price: 65000,
    duration: '65 min'
  },
  {
    id: 'retoque-3d',
    name: 'Retoque 3D',
    category: 'Retoques',
    price: 65000,
    duration: '70 min'
  },
  {
    id: 'retoque-whispy',
    name: 'Retoque Whispy',
    category: 'Retoques',
    price: 70000,
    duration: '70 min'
  },
  {
    id: 'retoque-tecnorimel',
    name: 'Retoque Tecno Rímel',
    category: 'Retoques',
    price: 50000,
    duration: '60 min'
  },
  {
    id: 'hidratacion-facial',
    name: 'Hidratación Facial',
    category: 'Faciales',
    price: 55000,
    duration: '60 min'
  },
  {
    id: 'limpieza-facial',
    name: 'Limpieza Facial',
    category: 'Faciales',
    price: 70000,
    duration: '75 min'
  },
  {
    id: 'hidralips-1',
    name: 'Hidralips (1 sesión)',
    category: 'Hidralips',
    price: 55000,
    duration: '45 min'
  },
  {
    id: 'hidralips-2',
    name: 'Hidralips (2 sesiones)',
    category: 'Hidralips',
    price: 95000,
    duration: '90 min'
  },
  {
    id: 'hidralips-3',
    name: 'Hidralips (3 sesiones)',
    category: 'Hidralips',
    price: 150000,
    duration: '135 min'
  }
];

// ──────────────────────────────────────────
// FUNCIONES DE DATOS (Supabase + LocalStorage fallback)
// ──────────────────────────────────────────

/**
 * Carga la agenda. Intenta Supabase primero; si falla usa localStorage.
 * Para mantener compatibilidad con código síncrono (agenda-admin.js),
 * también expone una versión síncrona que lee el caché local.
 */
function loadAgendaData() {
  // Versión síncrona: lee el caché en localStorage
  try {
    const raw = localStorage.getItem(AGENDA_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return getDefaultAgenda();
}

/**
 * Guarda la agenda. Escribe en localStorage de inmediato (síncrono)
 * y lanza la escritura a Supabase en paralelo (asíncrono).
 */
function saveAgendaData(data) {
  // 1. Guardar localmente de inmediato para que la UI no espere
  localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(data));

  // 2. Sincronizar con Supabase en segundo plano
  if (typeof saveAgendaToSupabase === 'function') {
    saveAgendaToSupabase(data).then(ok => {
      if (!ok) console.warn('⚠️ Agenda guardada solo localmente (Supabase no disponible).');
    });
  }
}

/**
 * Carga la agenda desde Supabase y actualiza el caché local.
 * Si Supabase está vacío pero localStorage tiene datos, sube esos datos a Supabase.
 * Llama al callback con los datos frescos. Usar al iniciar la app.
 */
async function loadAgendaDataFresh(onLoaded) {
  if (typeof fetchAgendaFromSupabase === 'function') {
    const remote = await fetchAgendaFromSupabase();
    if (remote && remote.days && remote.days.length > 0) {
      // Supabase tiene datos → actualizar caché local y usar esos
      localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(remote));
      if (typeof onLoaded === 'function') onLoaded(remote);
      return remote;
    }
    // Supabase vacío → tomar localStorage y subirlo a Supabase
    const local = loadAgendaData();
    if (local.days && local.days.length > 0 && typeof saveAgendaToSupabase === 'function') {
      saveAgendaToSupabase(local); // subir en segundo plano, no bloquear
    }
    if (typeof onLoaded === 'function') onLoaded(local);
    return local;
  }
  // Sin Supabase disponible → usar localStorage
  const local = loadAgendaData();
  if (typeof onLoaded === 'function') onLoaded(local);
  return local;
}

/**
 * Agenda por defecto (días de ejemplo para la demo)
 * El admin puede editarla y agregar/quitar días y horarios
 */
function getDefaultAgenda() {
  // Genera los próximos 30 días con algunos con horarios de ejemplo
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const defaultSlots = [
    '7:00 a.m.', '8:30 a.m.', '10:00 a.m.',
    '11:30 a.m.', '2:00 p.m.', '3:30 p.m.',
    '5:00 p.m.'
  ];

  for (let i = 1; i <= 35; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay();
    // Solo lunes a sábado (0=dom, 6=sab)
    if (dow === 0) continue;

    const dateStr = formatDateKey(d);
    // Por defecto: algunos días activos, otros no
    const active = i <= 25;

    if (active) {
      // Algunos slots marcados como tomados para efecto visual
      const slots = defaultSlots.map((time, idx) => ({
        time,
        status: (i % 7 === 0 && idx === 2) || (i % 5 === 0 && idx === 4) ? 'taken' : 'available'
      }));
      days.push({ date: dateStr, slots });
    }
  }

  return { days, updatedAt: new Date().toISOString() };
}

/**
 * Formatea una fecha como clave: "2025-12-20"
 */
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parsea una clave de fecha a objeto Date
 */
function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Formatea fecha para mostrar en UI: "Viernes 20 de diciembre"
 */
function formatDateDisplay(dateStr) {
  const d = parseDateKey(dateStr);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
}

/**
 * Formatea fecha corta para cards de calendario: { dow: "LUN", num: "20", month: "dic" }
 */
function formatDateShort(dateStr) {
  const d = parseDateKey(dateStr);
  const dows = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                  'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return {
    dow: dows[d.getDay()],
    num: d.getDate(),
    month: months[d.getMonth()]
  };
}

/**
 * Formatea precio en pesos colombianos
 */
function formatPrice(amount) {
  return '$' + amount.toLocaleString('es-CO');
}

/**
 * Calcula el abono del 50%
 */
function calcAbono(price) {
  return Math.ceil(price / 2 / 1000) * 1000; // Redondear al mil más cercano
}
