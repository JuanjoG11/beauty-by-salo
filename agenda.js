// ==========================================
// BEAUTY STUDIO BY SALOMÉ OSORIO
// Agenda Navideña — Script Principal
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

  // ──────────────────────────────────────
  // NIEVE NAVIDEÑA REALISTA
  // ──────────────────────────────────────
  const snowContainer = document.getElementById('snowContainer');
  if (snowContainer) {
    // Copos en 3 tamaños: pequeños, medianos, grandes
    const flakeSizes = [
      { size: 6,  count: 20, speed: [12, 18], opacity: 0.7 },
      { size: 10, count: 18, speed: [9,  14], opacity: 0.8 },
      { size: 15, count: 12, speed: [7,  11], opacity: 0.9 },
    ];

    flakeSizes.forEach(({ size, count, speed, opacity }) => {
      for (let i = 0; i < count; i++) {
        const flake = document.createElement('span');
        flake.className = 'snowflake';

        // Posición horizontal aleatoria, incluyendo fuera del viewport para efecto natural
        flake.style.left = (Math.random() * 110 - 5) + 'vw';

        // Duración y delay aleatorios para que no caigan sincronizadas
        const dur = speed[0] + Math.random() * (speed[1] - speed[0]);
        flake.style.animationDuration = dur + 's';
        flake.style.animationDelay   = -(Math.random() * dur) + 's'; // delay negativo = ya están cayendo al cargar

        flake.style.fontSize  = size + 'px';
        flake.style.opacity   = opacity;

        // Alternar entre círculo blanco CSS y carácter Unicode
        if (Math.random() > 0.5) {
          flake.textContent = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
          flake.style.color = 'rgba(255,255,255,0.95)';
          flake.style.textShadow = '0 0 8px rgba(201,91,132,0.4)';
        } else {
          flake.style.width        = size + 'px';
          flake.style.height       = size + 'px';
          flake.style.borderRadius = '50%';
          flake.style.background   = 'rgba(255,255,255,0.9)';
          flake.style.display      = 'inline-block';
          flake.style.boxShadow    = `0 0 ${size}px rgba(255,255,255,0.7), 0 0 ${size*2}px rgba(201,91,132,0.2)`;
          flake.style.fontSize     = '0';
        }

        snowContainer.appendChild(flake);
      }
    });
  }

  // ──────────────────────────────────────
  // ESTADO DE BOOKING
  // ──────────────────────────────────────
  const state = {
    step: 1,
    selectedService: null,   // { id, name, emoji, price, ... }
    selectedDate: null,       // "2025-12-20"
    selectedTime: null,       // "3:30 p.m."
    agendaData: null
  };

  // ──────────────────────────────────────
  // NAVEGACIÓN ENTRE PASOS
  // ──────────────────────────────────────
  const goToStep = (n) => {
    document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step').forEach((s, i) => {
      s.classList.toggle('active', i + 1 === n);
      s.classList.toggle('done', i + 1 < n);
    });
    const stepEl = document.getElementById(`step${n}`);
    if (stepEl) {
      stepEl.classList.add('active');
      setTimeout(() => {
        stepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
    state.step = n;
  };

  // ──────────────────────────────────────
  // PASO 1: SERVICIOS
  // ──────────────────────────────────────
  const servicesSelectorGrid = document.getElementById('servicesSelectorGrid');
  const toStep2Btn = document.getElementById('toStep2Btn');

  const renderServicesGrid = () => {
    if (!servicesSelectorGrid) return;

    // Agrupar por categoría
    const categories = {};
    BOOKING_SERVICES.forEach(s => {
      if (!categories[s.category]) categories[s.category] = [];
      categories[s.category].push(s);
    });

    servicesSelectorGrid.innerHTML = '';

    Object.entries(categories).forEach(([catName, services]) => {
      const catBlock = document.createElement('div');
      catBlock.className = 'service-category-block';

      const catTitle = document.createElement('h3');
      catTitle.className = 'cat-title';
      catTitle.textContent = catName;
      catBlock.appendChild(catTitle);

      const grid = document.createElement('div');
      grid.className = 'service-cards-row';

      services.forEach(svc => {
        const card = document.createElement('button');
        card.type = 'button';
        const isPromo = svc.category.includes('Promo');
        card.className = `service-pick-card${isPromo ? ' promo-pick-card' : ''}`;
        card.dataset.id = svc.id;

        if (isPromo) {
          card.innerHTML = `
            <span class="svc-promo-badge">🎁 Promo navideña</span>
            <span class="svc-name">${svc.name}</span>
            <span class="svc-tag">${svc.tag}</span>
            <span class="svc-price">${formatPrice(svc.price)}</span>
          `;
        } else {
          card.innerHTML = `
            <span class="svc-dot"></span>
            <span class="svc-name">${svc.name}</span>
            <span class="svc-price">${formatPrice(svc.price)}</span>
          `;
        }

        card.addEventListener('click', () => {
          document.querySelectorAll('.service-pick-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          state.selectedService = svc;
          if (toStep2Btn) toStep2Btn.disabled = false;
          toStep2Btn.classList.add('ready');
        });

        grid.appendChild(card);
      });

      catBlock.appendChild(grid);
      servicesSelectorGrid.appendChild(catBlock);
    });
  };

  renderServicesGrid();

  if (toStep2Btn) {
    toStep2Btn.addEventListener('click', () => {
      if (!state.selectedService) return;
      state.agendaData = loadAgendaData();
      renderCalendar();
      goToStep(2);
    });
  }

  // ──────────────────────────────────────
  // PASO 2: CALENDARIO
  // ──────────────────────────────────────
  const calendarScroll = document.getElementById('calendarScroll');
  const toStep3Btn = document.getElementById('toStep3Btn');
  const backTo1Btn = document.getElementById('backTo1Btn');

  const renderCalendar = () => {
    if (!calendarScroll || !state.agendaData) return;
    calendarScroll.innerHTML = '';

    // Solo días con slots disponibles
    const availableDays = state.agendaData.days.filter(day => {
      const hasAvailable = day.slots && day.slots.some(s => s.status === 'available');
      // Solo fechas futuras o de hoy
      const d = parseDateKey(day.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return hasAvailable && d >= today;
    });

    if (availableDays.length === 0) {
      calendarScroll.innerHTML = '<div class="no-days-msg">🎄 No hay fechas disponibles por el momento. Vuelve pronto o escríbenos a WhatsApp.</div>';
      return;
    }

    availableDays.forEach(day => {
      const short = formatDateShort(day.date);
      const freeCount = day.slots.filter(s => s.status === 'available').length;

      const card = document.createElement('button');
      card.type = 'button';
      card.className = `day-card ${state.selectedDate === day.date ? 'selected' : ''}`;
      card.innerHTML = `
        <span class="day-dow">${short.dow}</span>
        <span class="day-num">${short.num}</span>
        <span class="day-month">${short.month}</span>
        <span class="day-free">${freeCount} libre${freeCount !== 1 ? 's' : ''}</span>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.day-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.selectedDate = day.date;
        state.selectedTime = null;
        if (toStep3Btn) {
          toStep3Btn.disabled = false;
          toStep3Btn.classList.add('ready');
        }
      });

      calendarScroll.appendChild(card);
    });
  };

  if (backTo1Btn) backTo1Btn.addEventListener('click', () => goToStep(1));

  if (toStep3Btn) {
    toStep3Btn.addEventListener('click', () => {
      if (!state.selectedDate) return;
      renderTimes();
      goToStep(3);
    });
  }

  // ──────────────────────────────────────
  // PASO 3: HORARIOS
  // ──────────────────────────────────────
  const timesGrid = document.getElementById('timesGrid');
  const step3DateLabel = document.getElementById('step3DateLabel');
  const toStep4Btn = document.getElementById('toStep4Btn');
  const backTo2Btn = document.getElementById('backTo2Btn');

  const renderTimes = () => {
    if (!timesGrid || !state.agendaData) return;
    timesGrid.innerHTML = '';

    if (step3DateLabel) {
      step3DateLabel.textContent = formatDateDisplay(state.selectedDate);
    }

    const dayData = state.agendaData.days.find(d => d.date === state.selectedDate);
    if (!dayData || !dayData.slots) {
      timesGrid.innerHTML = '<p class="no-slots-msg">No hay horarios configurados para este día.</p>';
      return;
    }

    dayData.slots.forEach(slot => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `time-btn ${slot.status} ${state.selectedTime === slot.time ? 'selected' : ''}`;
      btn.textContent = slot.time;
      btn.disabled = slot.status === 'taken';

      if (slot.status === 'available') {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          state.selectedTime = slot.time;
          if (toStep4Btn) {
            toStep4Btn.disabled = false;
            toStep4Btn.classList.add('ready');
          }
        });
      }

      timesGrid.appendChild(btn);
    });
  };

  if (backTo2Btn) backTo2Btn.addEventListener('click', () => {
    state.selectedTime = null;
    renderCalendar();
    goToStep(2);
  });

  if (toStep4Btn) {
    toStep4Btn.addEventListener('click', () => {
      if (!state.selectedTime) return;
      renderSummary();
      goToStep(4);
    });
  }

  // ──────────────────────────────────────
  // PASO 4: RESUMEN Y CONFIRMACIÓN
  // ──────────────────────────────────────
  const backTo3Btn = document.getElementById('backTo3Btn');
  const confirmBookingBtn = document.getElementById('confirmBookingBtn');

  const renderSummary = () => {
    const svc = state.selectedService;
    const abono = calcAbono(svc.price);

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('sum-service', svc.name);
    setText('sum-date', formatDateDisplay(state.selectedDate));
    setText('sum-time', state.selectedTime);
    setText('sum-price', formatPrice(svc.price));
    setText('sum-abono', formatPrice(abono));

    // Actualizar pill de monto en la caja de pago
    const pill = document.getElementById('paymentAmountPill');
    if (pill) pill.textContent = formatPrice(abono);

    // Inicializar botones de copiar
    document.querySelectorAll('.pm-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const num = btn.dataset.copy;
        navigator.clipboard.writeText(num).then(() => {
          btn.classList.add('copied');
          setTimeout(() => btn.classList.remove('copied'), 1800);
        }).catch(() => {
          // Fallback para navegadores sin clipboard API
          const ta = document.createElement('textarea');
          ta.value = num;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          btn.classList.add('copied');
          setTimeout(() => btn.classList.remove('copied'), 1800);
        });
      });
    });
  };

  if (backTo3Btn) backTo3Btn.addEventListener('click', () => {
    renderTimes();
    goToStep(3);
  });

  if (confirmBookingBtn) {
    confirmBookingBtn.addEventListener('click', () => {
      const nameEl = document.getElementById('clientName');
      const noteEl = document.getElementById('clientNote');

      const name = nameEl ? nameEl.value.trim() : '';
      if (!name) {
        nameEl.focus();
        nameEl.style.borderColor = '#e07ea3';
        nameEl.placeholder = '¡Necesitamos tu nombre! 💕';
        return;
      }

      const svc = state.selectedService;
      const abono = calcAbono(svc.price);
      const note = noteEl ? noteEl.value.trim() : '';

      // Construir mensaje de WhatsApp con emojis de texto
      const msgLines = [
        `¡Hola Salomé! 💕 Quiero agendar mi cita navideña 2026 🎄`,
        ``,
        `👤 *Nombre:* ${name}`,
        `💅 *Servicio:* ${svc.name}`,
        `📅 *Fecha:* ${formatDateDisplay(state.selectedDate)}`,
        `⏰ *Hora:* ${state.selectedTime}`,
        `💰 *Precio:* ${formatPrice(svc.price)}`,
        `💳 *Abono (50%):* ${formatPrice(abono)}`,
      ];

      if (note) msgLines.push(`📝 *Nota:* ${note}`);

      msgLines.push(``);
      msgLines.push(`Entiendo que mi cita se confirma únicamente por WhatsApp, después de realizar el abono del 50% (${formatPrice(abono)}) 💖`);
      msgLines.push(`Adjunto captura de la transferencia 🩷`);

      const waMsg = encodeURIComponent(msgLines.join('\n'));
      const waUrl = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;

      // Marcar el slot como tomado en localStorage (reserva optimista)
      markSlotAsTaken(state.selectedDate, state.selectedTime);

      // Redirigir a WhatsApp
      window.open(waUrl, '_blank');

      // Mostrar pantalla de éxito
      showSuccessScreen(name, svc, abono);
    });
  }

  // ──────────────────────────────────────
  // MARCAR SLOT COMO TOMADO (reserva optimista local)
  // ──────────────────────────────────────
  const markSlotAsTaken = (dateStr, time) => {
    const data = loadAgendaData();
    const day = data.days.find(d => d.date === dateStr);
    if (day) {
      const slot = day.slots.find(s => s.time === time);
      if (slot) slot.status = 'pending'; // pending = esperando confirmación
      saveAgendaData(data);
    }
  };

  // ──────────────────────────────────────
  // PANTALLA DE ÉXITO
  // ──────────────────────────────────────
  const showSuccessScreen = (name, svc, abono) => {
    const main = document.getElementById('bookingMain');
    if (!main) return;

    main.innerHTML = `
      <div class="success-screen">
        <div class="success-confetti" id="confettiContainer"></div>
        <div class="success-card">
          <div class="success-icon">🌸</div>
          <h2>¡Tu solicitud fue enviada!</h2>
          <p class="success-name">Gracias, <strong>${name}</strong> 💕</p>
          <p class="success-msg">Tu mensaje fue enviado a WhatsApp con todos los detalles de tu cita.</p>

          <div class="success-reminder">
            <div class="reminder-icon">·</div>
            <div>
              <strong>No olvides tu abono</strong>
              <p>Recuerda enviar el <strong>50% del servicio (${formatPrice(abono)})</strong> para confirmar tu cita. Sin abono, la cita no queda separada.</p>
            </div>
          </div>

          <div class="success-detail-box">
            <div class="sd-row"><span>Servicio</span> <strong>${svc.name}</strong></div>
            <div class="sd-row"><span>Fecha</span> <strong>${formatDateDisplay(state.selectedDate)}</strong></div>
            <div class="sd-row"><span>Hora</span> <strong>${state.selectedTime}</strong></div>
          </div>

          <div class="success-actions">
            <a href="https://wa.me/${WA_NUMBER}" target="_blank" class="btn-wa-final">Ir a WhatsApp</a>
            <a href="agenda.html" class="btn-new-booking">Nueva cita</a>
          </div>

          <p class="success-tagline">Gracias por confiar en mi trabajo 💕</p>
        </div>
      </div>
    `;

    // Confetti en rosa suave
    const confetti = document.getElementById('confettiContainer');
    if (confetti) {
      const items = ['❄', '·', '✦', '❅', '·', '✦', '·'];
      for (let i = 0; i < 22; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        piece.textContent = items[Math.floor(Math.random() * items.length)];
        piece.style.left = Math.random() * 100 + '%';
        piece.style.color = `rgba(201,91,132,${(Math.random() * 0.4 + 0.2).toFixed(2)})`;
        piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
        piece.style.animationDelay = (Math.random() * 1.2) + 's';
        piece.style.fontSize = (Math.random() * 10 + 10) + 'px';
        confetti.appendChild(piece);
      }
    }

    main.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ──────────────────────────────────────
  // INIT
  // ──────────────────────────────────────
  goToStep(1);

});
