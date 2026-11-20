// ==========================================
// BEAUTY STUDIO BY SALOMÉ OSORIO
// Módulo de Citas — Registro & Calendario
// ==========================================

const CITAS_KEY = 'salome_citas_v1';

// ── ESTADOS ──────────────────────────────
const ESTADOS = {
  pendiente:  { label: 'Pendiente',  color: '#f4a7c3', bg: '#fff0f5', icon: '⏳' },
  confirmada: { label: 'Confirmada', color: '#27ae60', bg: '#e8f8f0', icon: '✅' },
  completada: { label: 'Completada', color: '#7b4d6a', bg: '#f3eaf6', icon: '🌸' },
  cancelada:  { label: 'Cancelada',  color: '#e74c3c', bg: '#fdf2f2', icon: '❌' },
};

// ── CARGA / GUARDA ───────────────────────
function loadCitas() {
  try {
    const raw = localStorage.getItem(CITAS_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return [];
}

function saveCitas(list) {
  localStorage.setItem(CITAS_KEY, JSON.stringify(list));
}

/**
 * Carga citas frescas desde Supabase y actualiza el caché local.
 *
 * REGLA DE ORO: nunca reemplazar el localStorage con una lista más corta
 * que lo que ya hay guardado localmente. Esto evita que un fallo temporal
 * de Supabase, un canal realtime disparado antes de que las citas se suban,
 * o una tabla vacía en Supabase borren citas reales.
 */
async function loadCitasFresh() {
  if (typeof fetchCitasFromSupabase === 'function') {
    let remote = null;
    try {
      remote = await fetchCitasFromSupabase();
    } catch(e) {
      console.warn('loadCitasFresh: error al consultar Supabase', e);
    }

    if (remote !== null) {
      const localCitas = loadCitas();

      // Si Supabase devuelve menos citas que el localStorage, conservar local
      // y aprovechar para subir las que faltan en Supabase.
      if (remote.length < localCitas.length) {
        console.warn(
          `⚠️ Supabase devolvió ${remote.length} citas pero localStorage tiene ${localCitas.length}.`,
          'Conservando localStorage y subiendo las citas faltantes a Supabase.'
        );
        if (typeof saveCitaToSupabase === 'function') {
          // Subir solo las que no están en Supabase (por id)
          const remoteIds = new Set(remote.map(r => r.id));
          for (const cita of localCitas) {
            if (!remoteIds.has(cita.id)) {
              saveCitaToSupabase(cita); // fire-and-forget
            }
          }
        }
        return localCitas;
      }

      // Supabase tiene igual o más citas → es la fuente de verdad
      localStorage.setItem(CITAS_KEY, JSON.stringify(remote));
      return remote;
    }
  }
  return loadCitas();
}

// ── SINCRONIZACIÓN CITAS ↔ AGENDA ────────
const ESTADO_A_SLOT = {
  pendiente:  'pending',
  confirmada: 'taken',
  completada: 'taken',
  cancelada:  'available',
};

function syncSlotDesdeEstadoCita(fecha, hora, estadoCita) {
  try {
    const slotStatus = ESTADO_A_SLOT[estadoCita] ?? 'pending';
    const data = loadAgendaData();
    const day = data.days.find(d => d.date === fecha);
    if (day) {
      const slot = day.slots.find(s => s.time === hora);
      if (slot) {
        slot.status = slotStatus;
        saveAgendaData(data);
      }
    }
  } catch(e) {
    console.warn('syncSlotDesdeEstadoCita error:', e);
  }
}

// ── REGISTRAR CITA (llamado desde agenda.js) ──
function registrarCita(data) {
  const citas = loadCitas();
  const cita = {
    id:        'cita-' + Date.now(),
    nombre:    data.nombre,
    servicio:  data.servicio,
    fecha:     data.fecha,
    hora:      data.hora,
    precio:    data.precio,
    abono:     data.abono,
    nota:      data.nota || '',
    estado:    'pendiente',
    createdAt: new Date().toISOString(),
  };
  citas.push(cita);
  saveCitas(citas);
  if (typeof saveCitaToSupabase === 'function') saveCitaToSupabase(cita);
  syncSlotDesdeEstadoCita(cita.fecha, cita.hora, cita.estado);
  return cita;
}

// ── INIT PANEL DE CITAS ──────────────────
let _citasPanelInitialized = false;

function initCitasPanel() {

  let citas        = loadCitas();
  let currentWeek  = getWeekStart(new Date());
  let filterDate   = null;

  const container = document.getElementById('citasPanel');
  if (!container) return;

  // ── RENDER PRINCIPAL ──────────────────
  const render = () => {
    container.innerHTML = '';

    // TOOLBAR
    const toolbar = document.createElement('div');
    toolbar.className = 'citas-toolbar';
    toolbar.innerHTML = `
      <div class="citas-toolbar-left">
        <button class="citas-nav-btn" id="citasPrevWeek">‹</button>
        <span class="citas-week-label" id="citasWeekLabel"></span>
        <button class="citas-nav-btn" id="citasNextWeek">›</button>
        <button class="citas-today-btn" id="citasTodayBtn">Hoy</button>
      </div>
      <div class="citas-toolbar-right">
        <input type="date" id="citasDateFilter" class="citas-date-filter" title="Filtrar por fecha" />
        <button class="citas-clear-filter" id="citasClearFilter" style="display:none">× Quitar filtro</button>
        <button class="btn-primary" id="citasNewBtn" style="font-size:0.82rem;padding:8px 14px;">+ Nueva cita</button>
      </div>
    `;
    container.appendChild(toolbar);

    // ESTADÍSTICAS RÁPIDAS
    const stats = document.createElement('div');
    stats.className = 'citas-stats-row';
    const hoy = formatDateKey(new Date());
    const citasHoy    = citas.filter(c => c.fecha === hoy);
    const citasSemana = citas.filter(c => {
      const d = parseDateKey(c.fecha);
      const end = new Date(currentWeek); end.setDate(end.getDate() + 6);
      return d >= currentWeek && d <= end;
    });
    const pendientes  = citas.filter(c => c.estado === 'pendiente').length;
    const confirmadas = citas.filter(c => c.estado === 'confirmada' && c.fecha >= hoy).length;

    stats.innerHTML = `
      <div class="citas-stat"><span>${citasHoy.length}</span><label>Hoy</label></div>
      <div class="citas-stat"><span>${citasSemana.length}</span><label>Esta semana</label></div>
      <div class="citas-stat pending"><span>${pendientes}</span><label>Pendientes</label></div>
      <div class="citas-stat confirmed"><span>${confirmadas}</span><label>Confirmadas</label></div>
    `;
    container.appendChild(stats);

    renderCalendario(container);

    document.getElementById('citasPrevWeek').addEventListener('click', () => {
      currentWeek = new Date(currentWeek); currentWeek.setDate(currentWeek.getDate() - 7);
      filterDate = null;
      render();
    });
    document.getElementById('citasNextWeek').addEventListener('click', () => {
      currentWeek = new Date(currentWeek); currentWeek.setDate(currentWeek.getDate() + 7);
      filterDate = null;
      render();
    });
    document.getElementById('citasTodayBtn').addEventListener('click', () => {
      currentWeek = getWeekStart(new Date());
      filterDate = null;
      render();
    });

    const dateFilter = document.getElementById('citasDateFilter');
    if (filterDate) dateFilter.value = filterDate;
    dateFilter.addEventListener('change', (e) => {
      filterDate = e.target.value || null;
      if (filterDate) currentWeek = getWeekStart(parseDateKey(filterDate));
      document.getElementById('citasClearFilter').style.display = filterDate ? 'inline-flex' : 'none';
      render();
    });

    document.getElementById('citasClearFilter').addEventListener('click', () => {
      filterDate = null;
      render();
    });

    document.getElementById('citasNewBtn').addEventListener('click', () => openCitaModal(null));
  };

  // ── CALENDARIO ────────────────────────
  const renderCalendario = (parent) => {
    const cal = document.createElement('div');
    cal.className = 'citas-calendar';

    const weekEnd = new Date(currentWeek); weekEnd.setDate(weekEnd.getDate() + 6);
    const weekLabel = document.getElementById('citasWeekLabel');
    if (weekLabel) weekLabel.textContent = `${formatShortDate(currentWeek)} — ${formatShortDate(weekEnd)}`;

    const dows = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeek); d.setDate(d.getDate() + i);
      days.push(d);
    }

    const displayDays = filterDate ? [parseDateKey(filterDate)] : days;

    displayDays.forEach(d => {
      const dateStr  = formatDateKey(d);
      const isToday  = dateStr === formatDateKey(new Date());
      const dow      = dows[d.getDay() === 0 ? 6 : d.getDay() - 1];
      const citasDia = citas.filter(c => c.fecha === dateStr);

      const col = document.createElement('div');
      col.className = `cal-col${isToday ? ' today' : ''}`;

      const colHeader = document.createElement('div');
      colHeader.className = 'cal-col-header';
      colHeader.innerHTML = `
        <span class="cal-dow">${dow}</span>
        <span class="cal-date">${d.getDate()}</span>
        <span class="cal-month">${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][d.getMonth()]}</span>
        ${citasDia.length > 0 ? `<span class="cal-count">${citasDia.length}</span>` : ''}
      `;
      col.appendChild(colHeader);

      const sorted = [...citasDia].sort((a, b) => compareTimeStr(a.hora, b.hora));

      if (sorted.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'cal-empty';
        empty.textContent = 'Sin citas';
        col.appendChild(empty);
      } else {
        sorted.forEach(cita => {
          const card = document.createElement('div');
          card.className = `cal-cita-card estado-${cita.estado}`;
          const est = ESTADOS[cita.estado] || ESTADOS.pendiente;
          card.innerHTML = `
            <div class="cal-cita-hora">${cita.hora}</div>
            <div class="cal-cita-nombre">${cita.nombre}</div>
            <div class="cal-cita-servicio">${cita.servicio}</div>
            <div class="cal-cita-estado" style="background:${est.bg};color:${est.color}">${est.icon} ${est.label}</div>
          `;
          card.addEventListener('click', () => openCitaModal(cita.id));
          col.appendChild(card);
        });
      }

      colHeader.addEventListener('click', () => {
        openCitaModal(null, dateStr);
      });

      cal.appendChild(col);
    });

    parent.appendChild(cal);
  };

  // ── MODAL CITA ────────────────────────
  const openCitaModal = (citaId, defaultDate = null) => {
    const isNew = !citaId;
    const cita  = citaId ? citas.find(c => c.id === citaId) : null;

    const overlay = document.createElement('div');
    overlay.className = 'cita-modal-overlay';

    const card = document.createElement('div');
    card.className = 'cita-modal-card';

    const estadosHtml = Object.entries(ESTADOS).map(([key, val]) => `
      <label class="estado-option ${cita?.estado === key ? 'selected' : ''}">
        <input type="radio" name="citaEstado" value="${key}" ${cita?.estado === key || (isNew && key === 'pendiente') ? 'checked' : ''} />
        <span style="background:${val.bg};color:${val.color}">${val.icon} ${val.label}</span>
      </label>
    `).join('');

    let svcsOptions = '<option value="">Selecciona...</option>';
    try {
      const svcs = (typeof loadCustomServices === 'function')
        ? loadCustomServices()
        : (typeof BOOKING_SERVICES !== 'undefined' ? BOOKING_SERVICES : []);
      svcs.forEach(s => {
        svcsOptions += `<option value="${s.name}" ${cita?.servicio === s.name ? 'selected' : ''}>${s.name} — $${s.price.toLocaleString('es-CO')}</option>`;
      });
    } catch(e) {}

    card.innerHTML = `
      <div class="cita-modal-header">
        <h3>${isNew ? 'Nueva cita' : 'Editar cita'}</h3>
        <button class="cita-modal-close" id="citaModalClose">×</button>
      </div>
      <div class="cita-modal-body">
        <div class="cita-form-grid">
          <div class="cita-field full">
            <label>Nombre de la clienta *</label>
            <input type="text" id="cf-nombre" value="${cita?.nombre || ''}" placeholder="Ej: María Paz García" />
          </div>
          <div class="cita-field full">
            <label>Servicio *</label>
            <select id="cf-servicio">
              ${svcsOptions}
            </select>
          </div>
          <div class="cita-field">
            <label>Fecha *</label>
            <input type="date" id="cf-fecha" value="${cita?.fecha || defaultDate || formatDateKey(new Date())}" />
          </div>
          <div class="cita-field">
            <label>Hora *</label>
            <input type="time" id="cf-hora" value="${cita ? convertTo24(cita.hora) : '09:00'}" />
          </div>
          <div class="cita-field">
            <label>Precio</label>
            <input type="number" id="cf-precio" value="${cita?.precio || ''}" placeholder="80000" step="1000" />
          </div>
          <div class="cita-field">
            <label>Abono recibido</label>
            <input type="number" id="cf-abono" value="${cita?.abono || ''}" placeholder="40000" step="1000" />
          </div>
          <div class="cita-field full">
            <label>Nota</label>
            <input type="text" id="cf-nota" value="${cita?.nota || ''}" placeholder="Algún detalle especial..." />
          </div>
          <div class="cita-field full">
            <label>Estado</label>
            <div class="estados-selector">${estadosHtml}</div>
          </div>
        </div>
      </div>
      <div class="cita-modal-footer">
        ${!isNew ? '<button class="btn-danger cita-delete-btn" id="citaDeleteBtn">Eliminar</button>' : ''}
        <button class="btn-back-svc" id="citaCancelBtn">Cancelar</button>
        <button class="btn-primary" id="citaSaveBtn">Guardar cita</button>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    const close = () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
    };

    document.getElementById('citaModalClose').addEventListener('click', close);
    document.getElementById('citaCancelBtn').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    document.getElementById('cf-servicio').addEventListener('change', e => {
      try {
        const svcs = (typeof loadCustomServices === 'function') ? loadCustomServices() : BOOKING_SERVICES;
        const svc = svcs.find(s => s.name === e.target.value);
        if (svc) {
          document.getElementById('cf-precio').value = svc.price;
          document.getElementById('cf-abono').value  = calcAbono(svc.price);
        }
      } catch(err) {}
    });

    card.querySelectorAll('.estado-option').forEach(opt => {
      opt.addEventListener('click', () => {
        card.querySelectorAll('.estado-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    // ── GUARDAR ──
    document.getElementById('citaSaveBtn').addEventListener('click', () => {
      const nombre   = document.getElementById('cf-nombre').value.trim();
      const servicio = document.getElementById('cf-servicio').value;
      const fecha    = document.getElementById('cf-fecha').value;
      const horaRaw  = document.getElementById('cf-hora').value;
      const precio   = parseInt(document.getElementById('cf-precio').value) || 0;
      const abono    = parseInt(document.getElementById('cf-abono').value) || 0;
      const nota     = document.getElementById('cf-nota').value.trim();
      const estado   = card.querySelector('input[name="citaEstado"]:checked')?.value || 'pendiente';

      if (!nombre) { document.getElementById('cf-nombre').focus(); showCitaToast('El nombre es obligatorio.'); return; }
      if (!fecha)  { document.getElementById('cf-fecha').focus();  showCitaToast('La fecha es obligatoria.');  return; }

      const hora = formatTime24to12Citas(horaRaw);
      const citaData = { nombre, servicio, fecha, hora, precio, abono, nota, estado };

      if (isNew) {
        const nueva = {
          id: 'cita-' + Date.now(),
          ...citaData,
          createdAt: new Date().toISOString(),
        };
        citas.push(nueva);
        saveCitas(citas);
        if (typeof saveCitaToSupabase === 'function') saveCitaToSupabase(nueva);
        syncSlotDesdeEstadoCita(nueva.fecha, nueva.hora, nueva.estado);
      } else {
        const idx = citas.findIndex(c => c.id === citaId);
        if (idx !== -1) {
          const anterior = citas[idx];
          citas[idx] = { ...anterior, ...citaData };
          saveCitas(citas);
          if (typeof saveCitaToSupabase === 'function') saveCitaToSupabase(citas[idx]);
          if (anterior.fecha !== citaData.fecha || anterior.hora !== citaData.hora) {
            syncSlotDesdeEstadoCita(anterior.fecha, anterior.hora, 'cancelada');
          }
          syncSlotDesdeEstadoCita(citaData.fecha, citaData.hora, citaData.estado);
        }
      }
      close();
      render();
      showCitaToast(isNew ? 'Cita registrada.' : 'Cita actualizada.');
    });

    // ── ELIMINAR ──
    const delBtn = document.getElementById('citaDeleteBtn');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        if (!confirm('¿Eliminar esta cita?')) return;
        const citaAEliminar = citas.find(c => c.id === citaId);
        citas = citas.filter(c => c.id !== citaId);
        saveCitas(citas);
        if (citaAEliminar) {
          if (typeof deleteCitaFromSupabase === 'function') deleteCitaFromSupabase(citaId);
          syncSlotDesdeEstadoCita(citaAEliminar.fecha, citaAEliminar.hora, 'cancelada');
        }
        close();
        render();
        showCitaToast('Cita eliminada.');
      });
    }
  };

  // ── TOAST ────────────────────────────
  const showCitaToast = (msg) => {
    const el = document.getElementById('adminToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 2500);
  };

  // ── INICIO: cargar frescos de Supabase ──
  loadCitasFresh().then(fresh => {
    console.log('🌸 initCitasPanel: citas cargadas →', fresh.length);
    citas = fresh;
    // No sobreescribir localStorage aquí — loadCitasFresh ya lo hizo si correspondía
    render();
  });

  // ── REALTIME: solo suscribirse una vez ──
  if (!_citasPanelInitialized) {
    _citasPanelInitialized = true;
    if (typeof subscribeToCitasChanges === 'function') {
      subscribeToCitasChanges((fresh) => {
        // Misma regla de oro: no reemplazar con una lista más corta
        if (fresh.length >= citas.length) {
          citas = fresh;
          saveCitas(citas);
          render();
        } else {
          console.warn(
            `⚠️ Realtime devolvió ${fresh.length} citas vs ${citas.length} en memoria. Ignorando actualización parcial.`
          );
        }
      });
    }
  }
}

// ── UTILIDADES ───────────────────────────
function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatShortDate(d) {
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function compareTimeStr(a, b) {
  const toMin = s => {
    const isPm = s.includes('p.m.');
    const clean = s.replace(/[ap]\.m\./g,'').trim();
    let [h, m] = clean.split(':').map(Number);
    if (isPm && h !== 12) h += 12;
    if (!isPm && h === 12) h = 0;
    return h * 60 + (m || 0);
  };
  return toMin(a) - toMin(b);
}

function convertTo24(timeStr) {
  if (!timeStr) return '09:00';
  const isPm = timeStr.includes('p.m.');
  const clean = timeStr.replace(/[ap]\.m\./g,'').trim();
  let [h, m] = clean.split(':').map(Number);
  if (isPm && h !== 12) h += 12;
  if (!isPm && h === 12) h = 0;
  return `${String(h).padStart(2,'0')}:${String(m||0).padStart(2,'0')}`;
}

function formatTime24to12Citas(t) {
  if (!t) return '9:00 a.m.';
  const [hStr, mStr] = t.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'p.m.' : 'a.m.';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${period}`;
}

function registrarCitaDesdeAgenda(data) {
  registrarCita(data);
}
