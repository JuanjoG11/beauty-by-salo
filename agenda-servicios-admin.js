// ==========================================
// BEAUTY STUDIO BY SALOMÉ OSORIO
// Admin — Gestión de Servicios & Categorías
// ==========================================

const SERVICES_STORAGE_KEY = 'salome_booking_services_v1';

// ── CARGA / GUARDA ──────────────────────────────────
function loadCustomServices() {
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  // Primera vez: cargar desde BOOKING_SERVICES (definido en agenda-data.js)
  return JSON.parse(JSON.stringify(BOOKING_SERVICES));
}

function saveCustomServices(list) {
  localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(list));
}

// ── INIT ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  // Esperar a que el admin esté autenticado antes de inicializar servicios
  const waitAuth = setInterval(() => {
    const app = document.getElementById('adminApp');
    if (app && app.style.display !== 'none') {
      clearInterval(waitAuth);
      initServiciosAdmin();
    }
  }, 300);
});

function initServiciosAdmin() {

  let services  = loadCustomServices();
  let editingId = null; // null = nuevo

  // ── ELEMENTOS ──────────────────────────
  const svcList        = document.getElementById('svcList');
  const svcFilterCat   = document.getElementById('svcFilterCat');
  const newSvcBtn      = document.getElementById('newSvcBtn');
  const svcEditorEmpty = document.getElementById('svcEditorEmpty');
  const svcEditorForm  = document.getElementById('svcEditorForm');
  const svcFormTitle   = document.getElementById('svcFormTitle');
  const deleteSvcBtn   = document.getElementById('deleteSvcBtn');
  const saveSvcBtn     = document.getElementById('saveSvcBtn');
  const cancelSvcBtn   = document.getElementById('cancelSvcBtn');

  const fName          = document.getElementById('svcName');
  const fCat           = document.getElementById('svcCat');
  const fPrice         = document.getElementById('svcPrice');
  const fOriginalPrice = document.getElementById('svcOriginalPrice');
  const fTag           = document.getElementById('svcTag');
  const fDuration      = document.getElementById('svcDuration');

  const previewName    = document.getElementById('previewName');
  const previewPrice   = document.getElementById('previewPrice');
  const previewCard    = document.getElementById('previewCard');

  const catList        = document.getElementById('catList');
  const newCatInput    = document.getElementById('newCatInput');
  const addCatConfirmBtn = document.getElementById('addCatConfirmBtn');
  const newCatBtn      = document.getElementById('newCatBtn');

  // ── CATEGORÍAS ─────────────────────────
  const getCategories = () => {
    const cats = [];
    services.forEach(s => {
      if (!cats.includes(s.category)) cats.push(s.category);
    });
    // Cargar también categorías guardadas aparte
    try {
      const saved = JSON.parse(localStorage.getItem('salome_categories') || '[]');
      saved.forEach(c => { if (!cats.includes(c)) cats.push(c); });
    } catch(e) {}
    return cats;
  };

  const saveCategories = (cats) => {
    localStorage.setItem('salome_categories', JSON.stringify(cats));
  };

  const renderCategorySelects = () => {
    const cats = getCategories();

    // Select del formulario
    fCat.innerHTML = '<option value="">Selecciona...</option>';
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      fCat.appendChild(opt);
    });

    // Select filtro
    svcFilterCat.innerHTML = '<option value="">Todas las categorías</option>';
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      svcFilterCat.appendChild(opt);
    });
  };

  const renderCatList = () => {
    const cats = getCategories();
    catList.innerHTML = '';

    if (cats.length === 0) {
      catList.innerHTML = '<p class="no-slots-hint">No hay categorías.</p>';
      return;
    }

    cats.forEach(cat => {
      const row = document.createElement('div');
      row.className = 'cat-row';
      const count = services.filter(s => s.category === cat).length;
      row.innerHTML = `
        <span class="cat-row-name">${cat}</span>
        <span class="cat-row-count">${count} servicio${count !== 1 ? 's' : ''}</span>
        <button class="cat-delete-btn" data-cat="${cat}" title="Eliminar categoría">×</button>
      `;

      row.querySelector('.cat-delete-btn').addEventListener('click', () => {
        const inUse = services.some(s => s.category === cat);
        if (inUse) {
          showSvcToast('No puedes eliminar una categoría que tiene servicios.');
          return;
        }
        if (!confirm(`Eliminar la categoría "${cat}"?`)) return;
        const saved = getCategories().filter(c => c !== cat);
        saveCategories(saved);
        renderCatList();
        renderCategorySelects();
        showSvcToast('Categoría eliminada.');
      });

      catList.appendChild(row);
    });
  };

  // Agregar categoría nueva
  const addCategory = (name) => {
    name = name.trim();
    if (!name) return;
    const cats = getCategories();
    if (cats.includes(name)) {
      showSvcToast('Esa categoría ya existe.');
      return;
    }
    cats.push(name);
    saveCategories(cats);
    renderCatList();
    renderCategorySelects();
    showSvcToast(`Categoría "${name}" creada.`);
  };

  if (addCatConfirmBtn) {
    addCatConfirmBtn.addEventListener('click', () => {
      addCategory(newCatInput.value);
      newCatInput.value = '';
    });
  }

  if (newCatBtn) {
    newCatBtn.addEventListener('click', () => {
      const name = prompt('Nombre de la nueva categoría:');
      if (name) addCategory(name);
    });
  }

  newCatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { addCategory(newCatInput.value); newCatInput.value = ''; }
  });

  // ── LISTA DE SERVICIOS ─────────────────
  const renderSvcList = () => {
    const filterCat = svcFilterCat.value;
    svcList.innerHTML = '';

    const filtered = filterCat
      ? services.filter(s => s.category === filterCat)
      : services;

    if (filtered.length === 0) {
      svcList.innerHTML = '<p class="no-slots-hint">No hay servicios. Crea uno con "+ Nuevo".</p>';
      return;
    }

    // Agrupar por categoría
    const grouped = {};
    filtered.forEach(s => {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    });

    Object.entries(grouped).forEach(([cat, svcs]) => {
      const catHeader = document.createElement('div');
      catHeader.className = 'svc-list-cat-header';
      catHeader.textContent = cat;
      svcList.appendChild(catHeader);

      svcs.forEach(svc => {
        const item = document.createElement('div');
        item.className = `svc-list-item ${editingId === svc.id ? 'selected' : ''}`;
        const isPromo = svc.originalPrice;
        item.innerHTML = `
          <div class="sli-info">
            <span class="sli-name">${svc.name}</span>
            ${isPromo ? '<span class="sli-promo-tag">PROMO</span>' : ''}
          </div>
          <span class="sli-price">$${svc.price.toLocaleString('es-CO')}</span>
        `;
        item.addEventListener('click', () => openEdit(svc.id));
        svcList.appendChild(item);
      });
    });
  };

  svcFilterCat.addEventListener('change', renderSvcList);

  // ── ABRIR EDITOR ──────────────────────
  const openEdit = (id) => {
    editingId = id;
    const svc = services.find(s => s.id === id);
    if (!svc) return;

    svcFormTitle.textContent = 'Editar servicio';
    deleteSvcBtn.style.display = 'inline-flex';

    fName.value          = svc.name;
    fCat.value           = svc.category;
    fPrice.value         = svc.price;
    fOriginalPrice.value = svc.originalPrice || '';
    fTag.value           = svc.tag || '';
    fDuration.value      = svc.duration || '';

    updatePreview();
    showForm();
    renderSvcList();
  };

  const openNew = () => {
    editingId = null;
    svcFormTitle.textContent = 'Nuevo servicio';
    deleteSvcBtn.style.display = 'none';

    fName.value = '';
    fCat.value = '';
    fPrice.value = '';
    fOriginalPrice.value = '';
    fTag.value = '';
    fDuration.value = '';

    updatePreview();
    showForm();
  };

  const showForm = () => {
    svcEditorEmpty.style.display = 'none';
    svcEditorForm.style.display  = 'block';
    fName.focus();
  };

  const hideForm = () => {
    editingId = null;
    svcEditorEmpty.style.display = 'flex';
    svcEditorForm.style.display  = 'none';
    renderSvcList();
  };

  if (newSvcBtn)    newSvcBtn.addEventListener('click', openNew);
  if (cancelSvcBtn) cancelSvcBtn.addEventListener('click', hideForm);

  // ── PREVIEW EN TIEMPO REAL ─────────────
  const updatePreview = () => {
    const name  = fName.value.trim() || 'Nombre del servicio';
    const price = parseInt(fPrice.value) || 0;
    const isPromo = !!fOriginalPrice.value;

    previewName.textContent  = name;
    previewPrice.textContent = '$' + price.toLocaleString('es-CO');
    previewCard.className    = `preview-card${isPromo ? ' preview-promo' : ''}`;
  };

  [fName, fPrice, fOriginalPrice, fTag].forEach(el => {
    el.addEventListener('input', updatePreview);
  });

  // ── GUARDAR SERVICIO ──────────────────
  if (saveSvcBtn) {
    saveSvcBtn.addEventListener('click', () => {
      const name  = fName.value.trim();
      const cat   = fCat.value.trim();
      const price = parseInt(fPrice.value);

      if (!name) { fName.focus(); showSvcToast('El nombre es obligatorio.'); return; }
      if (!cat)  { fCat.focus();  showSvcToast('La categoría es obligatoria.'); return; }
      if (!price || price <= 0) { fPrice.focus(); showSvcToast('El precio es obligatorio.'); return; }

      const svcData = {
        id:            editingId || generateId(name),
        name,
        category:      cat,
        price,
        originalPrice: parseInt(fOriginalPrice.value) || null,
        tag:           fTag.value.trim() || null,
        duration:      fDuration.value.trim() || null,
      };

      if (editingId) {
        const idx = services.findIndex(s => s.id === editingId);
        if (idx !== -1) services[idx] = svcData;
        showSvcToast('Servicio actualizado.');
      } else {
        services.push(svcData);
        showSvcToast('Servicio creado.');
      }

      saveCustomServices(services);
      renderSvcList();
      renderCatList();
      hideForm();
    });
  }

  // ── ELIMINAR SERVICIO ─────────────────
  if (deleteSvcBtn) {
    deleteSvcBtn.addEventListener('click', () => {
      if (!editingId) return;
      const svc = services.find(s => s.id === editingId);
      if (!confirm(`Eliminar "${svc?.name}"? Esta acción no se puede deshacer.`)) return;
      services = services.filter(s => s.id !== editingId);
      saveCustomServices(services);
      renderSvcList();
      renderCatList();
      hideForm();
      showSvcToast('Servicio eliminado.');
    });
  }

  // ── UTILIDADES ────────────────────────
  const generateId = (name) => {
    return name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);
  };

  const showSvcToast = (msg) => {
    const el = document.getElementById('adminToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 2800);
  };

  // ── RENDER INICIAL ────────────────────
  renderCategorySelects();
  renderCatList();
  renderSvcList();
}

// ── SOBRESCRIBIR loadBookingServices en agenda.js ──
// Si existen servicios personalizados en localStorage, usarlos en lugar de los default
(function patchBookingServices() {
  try {
    const raw = localStorage.getItem('salome_booking_services_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Reemplazar el array global BOOKING_SERVICES
        BOOKING_SERVICES.length = 0;
        parsed.forEach(s => BOOKING_SERVICES.push(s));
      }
    }
  } catch(e) {}
})();
