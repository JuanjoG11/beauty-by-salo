// ==========================================
// BEAUTY STUDIO BY SALOMÉ OSORIO
// JavaScript Panel de Administración
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {

  const ADMIN_PIN = 'salo2026'; // Clave por defecto para el Admin
  const AUTH_KEY = 'salome_admin_auth';

  const pinModalOverlay = document.getElementById('pinModalOverlay');
  const pinForm = document.getElementById('pinForm');
  const pinInput = document.getElementById('pinInput');
  const adminApp = document.getElementById('adminApp');
  const logoutBtn = document.getElementById('logoutBtn');

  // Elements
  const serviceMenuList = document.getElementById('serviceMenuList');
  const activeServiceTitle = document.getElementById('activeServiceTitle');
  const activeServiceId = document.getElementById('activeServiceId');
  const activeCategoryPill = document.getElementById('activeCategoryPill');
  const activePhotoCount = document.getElementById('activePhotoCount');
  const photosGrid = document.getElementById('photosGrid');
  const uploadDropzone = document.getElementById('uploadDropzone');
  const photoFileInput = document.getElementById('photoFileInput');
  const saveServiceBtn = document.getElementById('saveServiceBtn');

  // Form inputs
  const editTitle = document.getElementById('editTitle');
  const editBadge = document.getElementById('editBadge');
  const editDescription = document.getElementById('editDescription');
  const editPriceMain = document.getElementById('editPriceMain');
  const editPriceRetouch = document.getElementById('editPriceRetouch');
  const editWaLink = document.getElementById('editWaLink');

  // SQL code box
  const sqlCodePreview = document.getElementById('sqlCodePreview');
  const copySqlBtn = document.getElementById('copySqlBtn');

  if (sqlCodePreview && typeof SQL_INIT_SCHEMA !== 'undefined') {
    sqlCodePreview.textContent = SQL_INIT_SCHEMA.trim();
  }

  if (copySqlBtn) {
    copySqlBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(SQL_INIT_SCHEMA.trim());
      showAdminToast('¡Script SQL copiado al portapapeles! 📋');
    });
  }

  // ───────────────────────────
  // 1. Autenticación por PIN
  // ───────────────────────────
  const checkAuth = () => {
    const isAuthenticated = sessionStorage.getItem(AUTH_KEY) === 'true';
    if (isAuthenticated) {
      pinModalOverlay.style.display = 'none';
      adminApp.style.display = 'block';
    } else {
      pinModalOverlay.style.display = 'flex';
      adminApp.style.display = 'none';
    }
  };
  checkAuth();

  pinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = pinInput.value.trim();
    if (pin === ADMIN_PIN || pin === 'admin') {
      sessionStorage.setItem(AUTH_KEY, 'true');
      checkAuth();
      showAdminToast('¡Bienvenida al Panel Admin, Salomé! 💕');
    } else {
      alert('Clave PIN incorrecta. Inténtalo de nuevo (Clave por defecto: salo2026).');
      pinInput.value = '';
      pinInput.focus();
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(AUTH_KEY);
      checkAuth();
    });
  }

  // ───────────────────────────
  // 2. Estado de Servicios & Carga
  // ───────────────────────────
  let services = [];
  let currentServiceId = 'efecto-natural';

  const loadData = async () => {
    if (typeof fetchAllServices === 'function') {
      services = await fetchAllServices();
    } else {
      services = getLocalServices();
    }
    renderSidebarMenu();
    selectService(currentServiceId);
  };

  if (typeof subscribeToRealtimeChanges === 'function') {
    subscribeToRealtimeChanges(async (freshServices) => {
      services = freshServices;
      renderSidebarMenu();
      selectService(currentServiceId);
    });
  }

  const renderSidebarMenu = () => {
    if (!serviceMenuList) return;
    serviceMenuList.innerHTML = '';

    services.forEach(s => {
      const li = document.createElement('li');
      li.className = `menu-item ${s.id === currentServiceId ? 'active' : ''}`;
      
      const count = s.photos ? s.photos.length : 1;
      li.innerHTML = `
        <div class="menu-item-info">
          <strong>${s.title}</strong>
          <span class="menu-category">${s.category || 'pestañas'}</span>
        </div>
        <span class="photo-badge">${count} 📸</span>
      `;

      li.addEventListener('click', () => selectService(s.id));
      serviceMenuList.appendChild(li);
    });
  };

  const selectService = (serviceId) => {
    currentServiceId = serviceId;
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    // Actualizar sidebar active state
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    renderSidebarMenu();

    // Llenar header
    activeServiceTitle.textContent = service.title;
    activeServiceId.textContent = service.id;
    activeCategoryPill.textContent = (service.category || 'pestañas').toUpperCase();
    activePhotoCount.textContent = `${service.photos ? service.photos.length : 0} fotos subidas`;

    // Llenar formulario
    editTitle.value = service.title || '';
    editBadge.value = service.badge || '';
    editDescription.value = service.description || '';
    editPriceMain.value = service.price_main || '';
    editPriceRetouch.value = service.price_retouch || '';
    editWaLink.value = service.wa_link || '';

    // Renderear fotos
    renderPhotosGrid(service);
  };

  const renderPhotosGrid = (service) => {
    if (!photosGrid) return;
    photosGrid.innerHTML = '';

    const photoList = service.photos || [service.cover_url];
    const coverUrl = service.cover_url || photoList[0];

    photoList.forEach((photoUrl, index) => {
      const isCover = photoUrl === coverUrl;
      const card = document.createElement('div');
      card.className = `admin-photo-card ${isCover ? 'is-cover' : ''}`;

      card.innerHTML = `
        <div class="photo-preview">
          <img src="${photoUrl}" alt="Foto ${index + 1}" />
          ${isCover ? '<span class="cover-tag">⭐ PORTADA</span>' : ''}
        </div>
        <div class="photo-actions">
          ${!isCover ? `<button class="admin-btn cover-btn" data-url="${photoUrl}">⭐ Definir Portada</button>` : '<span class="cover-active-lbl">Portada Principal</span>'}
          <button class="admin-btn delete-btn" data-url="${photoUrl}" title="Eliminar foto">&times;</button>
        </div>
      `;

      // Event listener definir portada
      const coverBtn = card.querySelector('.cover-btn');
      if (coverBtn) {
        coverBtn.addEventListener('click', () => {
          service.cover_url = photoUrl;
          saveServiceData(service);
          renderSidebarMenu();
          renderPhotosGrid(service);
          showAdminToast(`"⭐ ${service.title}" portada actualizada ✨`);
        });
      }

      // Event listener eliminar foto
      const deleteBtn = card.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if (service.photos.length <= 1) {
            alert('Debes mantener al menos una foto para el servicio.');
            return;
          }
          if (confirm('¿Deseas eliminar esta foto?')) {
            service.photos = service.photos.filter(p => p !== photoUrl);
            if (service.cover_url === photoUrl) {
              service.cover_url = service.photos[0];
            }
            saveServiceData(service);
            renderSidebarMenu();
            renderPhotosGrid(service);
            showAdminToast('Foto eliminada correctamente 🗑️');
          }
        });
      }

      photosGrid.appendChild(card);
    });
  };

  // ───────────────────────────
  // 3. Subida de Fotos
  // ───────────────────────────
  if (uploadDropzone && photoFileInput) {
    uploadDropzone.addEventListener('click', () => photoFileInput.click());

    uploadDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadDropzone.classList.add('dragover');
    });

    uploadDropzone.addEventListener('dragleave', () => {
      uploadDropzone.classList.remove('dragover');
    });

    uploadDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadDropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        handleFilesUpload(e.dataTransfer.files);
      }
    });

    photoFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFilesUpload(e.target.files);
      }
    });
  }

  const handleFilesUpload = async (filesList) => {
    const service = services.find(s => s.id === currentServiceId);
    if (!service) return;

    showAdminToast('Subiendo fotos... Por favor espera ✨');

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const uploadedUrl = await uploadPhotoFile(file, service.id);
      if (uploadedUrl) {
        if (!service.photos) service.photos = [];
        service.photos.push(uploadedUrl);
        if (!service.cover_url) service.cover_url = uploadedUrl;
      }
    }

    await saveServiceData(service);
    renderSidebarMenu();
    renderPhotosGrid(service);
    showAdminToast('¡Nuevas fotos agregadas con éxito! 📸💕');
  };

  // Guardar fotos button
  const savePhotosBtn = document.getElementById('savePhotosBtn');
  if (savePhotosBtn) {
    savePhotosBtn.addEventListener('click', async () => {
      const service = services.find(s => s.id === currentServiceId);
      if (!service) return;
      await saveServiceData(service);
      renderSidebarMenu();
      renderPhotosGrid(service);
      activePhotoCount.textContent = `${service.photos ? service.photos.length : 0} fotos subidas`;
      showAdminToast('📸 Fotos guardadas con éxito!');
    });
  }

  // ───────────────────────────
  // 4. Guardar Detalles de Formulario
  // ───────────────────────────
  if (saveServiceBtn) {
    saveServiceBtn.addEventListener('click', async () => {
      const service = services.find(s => s.id === currentServiceId);
      if (!service) return;

      service.title = editTitle.value.trim() || service.title;
      service.badge = editBadge.value.trim();
      service.description = editDescription.value.trim();
      service.price_main = editPriceMain.value.trim();
      service.price_retouch = editPriceRetouch.value.trim();
      service.wa_link = editWaLink.value.trim();

      await saveServiceData(service);
      renderSidebarMenu();
      showAdminToast(`¡Servicio "${service.title}" guardado con éxito! 💖`);
    });
  }

  // ───────────────────────────
  // Toast Admin
  // ───────────────────────────
  function showAdminToast(msg) {
    const old = document.querySelector('.admin-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.textContent = msg;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('visible');
      });
    });

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  // Carga inicial
  loadData();
});
