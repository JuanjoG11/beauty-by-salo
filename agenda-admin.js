// ==========================================
// BEAUTY STUDIO BY SALOMÉ OSORIO
// Admin Agenda Navideña — JavaScript
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

  const ADMIN_PIN = 'salo2026';
  const AUTH_KEY  = 'salome_admin_agenda_auth';

  // ── ELEMENTOS ──────────────────────────
  const pinOverlay    = document.getElementById('pinOverlay');
  const pinForm       = document.getElementById('pinForm');
  const pinInput      = document.getElementById('pinInput');
  const adminApp      = document.getElementById('adminApp');
  const logoutBtn     = document.getElementById('logoutBtn');

  const newDayInput   = document.getElementById('newDayInput');
  const addDayBtn     = document.getElementById('addDayBtn');
  const newTimeInput  = document.getElementById('newTimeInput');
  const addTimeBtn    = document.getElementById('addTimeBtn');

  const daysList      = document.getElementById('daysList');
  const dayEditor     = document.getElementById('dayEditor');
  const editorDayTitle = document.getElementById('editorDayTitle');
  const slotsManager  = document.getElementById('slotsManager');
  const saveDayBtn    = document.getElementById('saveDayBtn');
  const deleteDayBtn  = document.getElementById('deleteDayBtn');
  const clearDaySlotsBtn = document.getElementById('clearDaySlotsBtn');
  const emptyAgendaMsg = document.getElementById('emptyAgendaMsg');
  const selectedDayLabel = document.getElementById('selectedDayLabel');

  const exportBtn     = document.getElementById('exportBtn');
  const importBtn     = document.getElementById('importBtn');
  const importFileInput = document.getElementById('importFileInput');
  const clearAllBtn   = document.getElementById('clearAllBtn');

  let agendaData  = null;
  let selectedDay = null; // dateStr "2025-12-20"

  // ── AUTENTICACIÓN ──────────────────────
  const checkAuth = () => {
    const ok = sessionStorage.getItem(AUTH_KEY) === 'true';
    pinOverlay.style.display = ok ? 'none' : 'flex';
    adminApp.style.display   = ok ? 'block' : 'none';
    if (ok) init();
  };

  pinForm.addEventListener('submit', e => {
    e.preventDefault();
    if (pinInput.value.trim() === ADMIN_PIN) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      checkAuth();
    } else {
      pinInput.value = '';
      pinInput.style.borderColor = '#e74c3c';
      showToast('❌ Clave incorrecta. Intenta de nuevo.');
      setTimeout(() => { pinInput.style.borderColor = ''; }, 1500);
    }
  });

  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_KEY);
    location.reload();
  });

  // ── INIT ───────────────────────────────
  const init = () => {
    agendaData = loadAgendaData();

    // Setear fecha mínima del input = hoy
    const today = new Date();
    newDayInput.min = formatDateKey(today);
    newDayInput.value = formatDateKey(new Date(today.getTime() + 86400000)); // mañana por defecto

    renderDaysList();
    updateStats();
  };

  // ── RENDER LISTA DE DÍAS ───────────────
  const renderDaysList = () => {
    if (!daysList) return;
    daysList.innerHTML = '';

    // Ordenar por fecha
    const sortedDays = [...agendaData.days].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    if (sortedDays.length === 0) {
      emptyAgendaMsg.style.display = 'flex';
      dayEditor.style.display = 'none';
      return;
    }

    emptyAgendaMsg.style.display = 'none';

    sortedDays.forEach(day => {
      const short     = formatDateShort(day.date);
      const totalSlots = day.slots ? day.slots.length : 0;
      const freeSlots  = day.slots ? day.slots.filter(s => s.status === 'available').length : 0;
      const takenSlots = totalSlots - freeSlots;

      const isPast = parseDateKey(day.date) < new Date().setHours(0,0,0,0);

      const item = document.createElement('div');
      item.className = `day-list-item ${selectedDay === day.date ? 'selected' : ''} ${isPast ? 'past' : ''}`;
      item.dataset.date = day.date;

      item.innerHTML = `
        <div class="dli-date">
          <span class="dli-dow">${short.dow}</span>
          <span class="dli-num">${short.num}</span>
          <span class="dli-month">${short.month}</span>
          ${isPast ? '<span class="past-tag">Pasado</span>' : ''}
        </div>
        <div class="dli-info">
          <div class="dli-slots-row">
            <span class="slot-badge available">${freeSlots} libre${freeSlots !== 1 ? 's' : ''}</span>
            ${takenSlots > 0 ? `<span class="slot-badge taken">${takenSlots} reservado${takenSlots !== 1 ? 's' : ''}</span>` : ''}
          </div>
          <div class="dli-times">
            ${(day.slots || []).slice(0, 5).map(s =>
              `<span class="mini-slot ${s.status}">${s.time}</span>`
            ).join('')}
            ${totalSlots > 5 ? `<span class="mini-slot more">+${totalSlots - 5}</span>` : ''}
          </div>
        </div>
        <button class="dli-delete" data-date="${day.date}" title="Eliminar día">×</button>
      `;

      item.addEventListener('click', e => {
        if (e.target.closest('.dli-delete')) {
          deleteDay(day.date);
          return;
        }
        selectDay(day.date);
      });

      daysList.appendChild(item);
    });
  };

  // ── SELECCIONAR DÍA ───────────────────
  const selectDay = (dateStr) => {
    selectedDay = dateStr;
    renderDaysList();
    renderDayEditor(dateStr);
    if (selectedDayLabel) {
      selectedDayLabel.textContent = `Editando: ${formatDateDisplay(dateStr)}`;
    }
  };

  // ── RENDER EDITOR DE DÍA ──────────────
  const renderDayEditor = (dateStr) => {
    dayEditor.style.display = 'block';
    editorDayTitle.textContent = formatDateDisplay(dateStr);

    const day = agendaData.days.find(d => d.date === dateStr);
    if (!day) return;

    slotsManager.innerHTML = '';

    if (!day.slots || day.slots.length === 0) {
      slotsManager.innerHTML = '<p class="no-slots-hint">No hay horarios. Agrega uno usando el panel izquierdo.</p>';
      return;
    }

    // Ordenar por hora (básico: comparar strings de hora)
    const sorted = [...day.slots].sort((a, b) => compareTimeStrings(a.time, b.time));

    sorted.forEach((slot, idx) => {
      const slotEl = document.createElement('div');
      slotEl.className = `slot-row ${slot.status}`;

      const statusLabels = {
        available: '✅ Disponible',
        taken:     '🔴 Reservado',
        pending:   '🟡 Pendiente'
      };

      slotEl.innerHTML = `
        <span class="slot-time-text">${slot.time}</span>
        <div class="slot-status-toggle">
          <button class="status-btn ${slot.status === 'available' ? 'active-btn' : ''}"
                  data-time="${slot.time}" data-status="available">✅ Libre</button>
          <button class="status-btn pending-btn ${slot.status === 'pending' ? 'active-btn' : ''}"
                  data-time="${slot.time}" data-status="pending">🟡 Pendiente</button>
          <button class="status-btn taken-btn ${slot.status === 'taken' ? 'active-btn' : ''}"
                  data-time="${slot.time}" data-status="taken">🔴 Reservado</button>
        </div>
        <button class="slot-delete-btn" data-time="${slot.time}" title="Eliminar hora">🗑️</button>
      `;

      // Cambiar estado
      slotEl.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const time = btn.dataset.time;
          const newStatus = btn.dataset.status;
          const dayData = agendaData.days.find(d => d.date === selectedDay);
          if (dayData) {
            const slotItem = dayData.slots.find(s => s.time === time);
            if (slotItem) slotItem.status = newStatus;
            renderDayEditor(selectedDay);
            updateStats();
          }
        });
      });

      // Eliminar hora
      const delBtn = slotEl.querySelector('.slot-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          const time = delBtn.dataset.time;
          const dayData = agendaData.days.find(d => d.date === selectedDay);
          if (dayData) {
            dayData.slots = dayData.slots.filter(s => s.time !== time);
            renderDayEditor(selectedDay);
            renderDaysList();
            updateStats();
          }
        });
      }

      slotsManager.appendChild(slotEl);
    });
  };

  // ── AGREGAR DÍA ───────────────────────
  if (addDayBtn) {
    addDayBtn.addEventListener('click', () => {
      const dateStr = newDayInput.value;
      if (!dateStr) {
        showToast('⚠️ Selecciona una fecha primero.');
        return;
      }

      const exists = agendaData.days.find(d => d.date === dateStr);
      if (exists) {
        showToast('⚠️ Este día ya existe en la agenda.');
        selectDay(dateStr);
        return;
      }

      agendaData.days.push({ date: dateStr, slots: [] });
      emptyAgendaMsg.style.display = 'none';
      renderDaysList();
      selectDay(dateStr);
      updateStats();
      showToast(`✅ Día ${formatDateDisplay(dateStr)} agregado.`);
    });
  }

  // ── AGREGAR HORA MANUAL ───────────────
  if (addTimeBtn) {
    addTimeBtn.addEventListener('click', () => {
      if (!selectedDay) {
        showToast('⚠️ Primero selecciona un día del listado.');
        return;
      }

      const timeVal = newTimeInput.value;
      if (!timeVal) {
        showToast('⚠️ Ingresa una hora válida.');
        return;
      }

      const formatted = formatTime24to12(timeVal);
      const dayData = agendaData.days.find(d => d.date === selectedDay);
      if (!dayData) return;

      if (dayData.slots.find(s => s.time === formatted)) {
        showToast('⚠️ Esa hora ya existe en este día.');
        return;
      }

      dayData.slots.push({ time: formatted, status: 'available' });
      renderDayEditor(selectedDay);
      renderDaysList();
      updateStats();
      showToast(`✅ Hora ${formatted} agregada.`);
    });
  }

  // ── PLANTILLAS DE HORARIOS ────────────
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!selectedDay) {
        showToast('⚠️ Primero selecciona un día del listado.');
        return;
      }

      const slots = JSON.parse(btn.dataset.slots);
      const dayData = agendaData.days.find(d => d.date === selectedDay);
      if (!dayData) return;

      const confirmMsg = dayData.slots.length > 0
        ? '¿Reemplazar los horarios actuales con esta plantilla?'
        : null;

      if (confirmMsg && !confirm(confirmMsg)) return;

      dayData.slots = slots.map(time => ({ time, status: 'available' }));
      renderDayEditor(selectedDay);
      renderDaysList();
      updateStats();
      showToast(`✅ Plantilla aplicada: ${slots.length} horarios.`);
    });
  });

  // ── GUARDAR DÍA ───────────────────────
  if (saveDayBtn) {
    saveDayBtn.addEventListener('click', () => {
      saveAgendaData(agendaData);
      showToast('💾 ¡Agenda guardada con éxito! 🎄');
      renderDaysList();
    });
  }

  // ── ELIMINAR DÍA ──────────────────────
  if (deleteDayBtn) {
    deleteDayBtn.addEventListener('click', () => {
      if (!selectedDay) return;
      if (!confirm(`¿Eliminar el día ${formatDateDisplay(selectedDay)} y todos sus horarios?`)) return;
      deleteDay(selectedDay);
    });
  }

  const deleteDay = (dateStr) => {
    agendaData.days = agendaData.days.filter(d => d.date !== dateStr);
    if (selectedDay === dateStr) {
      selectedDay = null;
      dayEditor.style.display = 'none';
      selectedDayLabel.textContent = 'Selecciona un día del listado para editar sus horarios.';
    }
    saveAgendaData(agendaData);
    renderDaysList();
    updateStats();
    showToast(`🗑️ Día eliminado.`);
  };

  // ── LIMPIAR HORARIOS DEL DÍA ─────────
  if (clearDaySlotsBtn) {
    clearDaySlotsBtn.addEventListener('click', () => {
      if (!selectedDay) return;
      if (!confirm('¿Limpiar todos los horarios de este día?')) return;
      const dayData = agendaData.days.find(d => d.date === selectedDay);
      if (dayData) {
        dayData.slots = [];
        renderDayEditor(selectedDay);
        renderDaysList();
        updateStats();
        showToast('🗑️ Horarios del día eliminados.');
      }
    });
  }

  // ── ESTADÍSTICAS ──────────────────────
  const updateStats = () => {
    const today = new Date().setHours(0,0,0,0);
    const futureDays = agendaData.days.filter(d => parseDateKey(d.date) >= today);
    let totalSlots = 0, availableSlots = 0, takenSlots = 0;

    futureDays.forEach(day => {
      (day.slots || []).forEach(slot => {
        totalSlots++;
        if (slot.status === 'available') availableSlots++;
        else takenSlots++;
      });
    });

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('stat-days', futureDays.length);
    set('stat-slots', totalSlots);
    set('stat-available', availableSlots);
    set('stat-taken', takenSlots);
  };

  // ── EXPORTAR ──────────────────────────
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const json = JSON.stringify(agendaData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `agenda-salome-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('📋 Agenda exportada.');
    });
  }

  // ── IMPORTAR ──────────────────────────
  if (importBtn) importBtn.addEventListener('click', () => importFileInput.click());

  if (importFileInput) {
    importFileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (parsed && Array.isArray(parsed.days)) {
            agendaData = parsed;
            saveAgendaData(agendaData);
            selectedDay = null;
            dayEditor.style.display = 'none';
            renderDaysList();
            updateStats();
            showToast('📥 Agenda importada correctamente.');
          } else {
            showToast('❌ El archivo no tiene el formato correcto.');
          }
        } catch {
          showToast('❌ No se pudo leer el archivo JSON.');
        }
      };
      reader.readAsText(file);
      importFileInput.value = '';
    });
  }

  // ── BORRAR TODO ───────────────────────
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (!confirm('⚠️ ¿Borrar TODA la agenda? Esta acción no se puede deshacer.')) return;
      agendaData = { days: [], updatedAt: new Date().toISOString() };
      saveAgendaData(agendaData);
      selectedDay = null;
      dayEditor.style.display = 'none';
      selectedDayLabel.textContent = 'Selecciona un día del listado para editar sus horarios.';
      renderDaysList();
      updateStats();
      showToast('🗑️ Agenda borrada.');
    });
  }

  // ── TOAST ──────────────────────────────
  const toastEl = document.getElementById('adminToast');
  let toastTimer;
  const showToast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 3000);
  };

  // ── UTILIDADES ────────────────────────
  /**
   * Convierte "09:30" -> "9:30 a.m." / "14:30" -> "2:30 p.m."
   */
  const formatTime24to12 = (t) => {
    const [hStr, mStr] = t.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const period = h >= 12 ? 'p.m.' : 'a.m.';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return m === '00' ? `${h}:00 ${period}` : `${h}:${m} ${period}`;
  };

  /**
   * Compara "9:00 a.m." vs "2:00 p.m." para ordenar
   */
  const compareTimeStrings = (a, b) => {
    const toMin = (s) => {
      const isPm = s.includes('p.m.');
      const clean = s.replace(/[ap]\.m\./g, '').trim();
      let [h, m] = clean.split(':').map(Number);
      if (isPm && h !== 12) h += 12;
      if (!isPm && h === 12) h = 0;
      return h * 60 + (m || 0);
    };
    return toMin(a) - toMin(b);
  };

  // ── INICIO ────────────────────────────
  checkAuth();
});
