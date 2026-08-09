// ==========================================
// BEAUTY STUDIO BY SALOMÉ OSORIO
// Script Principal & Visor Galería Interactivo
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {

  // ───────────────────────────
  // 1. Manejo de Avatar
  // ───────────────────────────
  const avatarImg = document.getElementById('avatarImg');
  const avatarPlaceholder = document.getElementById('avatarPlaceholder');

  if (avatarImg) {
    avatarImg.addEventListener('load', () => {
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
      avatarImg.style.display = 'block';
    });

    avatarImg.addEventListener('error', () => {
      avatarImg.style.display = 'none';
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
    });

    if (avatarImg.complete && avatarImg.naturalWidth > 0) {
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
      avatarImg.style.display = 'block';
    } else if (avatarImg.complete) {
      avatarImg.style.display = 'none';
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
    }
  }

  // ───────────────────────────
  // 2. Animaciones al hacer Scroll (IntersectionObserver)
  // ───────────────────────────
  const initScrollAnimations = () => {
    const animatedEls = document.querySelectorAll('[data-aos]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );

    animatedEls.forEach((el) => observer.observe(el));
  };
  initScrollAnimations();

  // ───────────────────────────
  // 3. Sincronización dinámica de datos desde Supabase / LocalStorage
  // ───────────────────────────
  let loadedServices = [];

  const updateGridFromServices = (services) => {
    loadedServices = services;
    services.forEach(service => {
      const card = document.querySelector(`[data-service-id="${service.id}"]`);
      if (card) {
        // Actualizar foto portada si cambió
        const imgEl = card.querySelector('.effect-img');
        if (imgEl && service.cover_url) {
          imgEl.src = service.cover_url;
        }

        // Actualizar photos attribute
        const imgWrapper = card.querySelector('.effect-img-wrapper');
        if (imgWrapper) {
          imgWrapper.dataset.photos = (service.photos || [service.cover_url]).join(',');
          imgWrapper.dataset.title = service.title;
          imgWrapper.dataset.desc = service.description;
          imgWrapper.dataset.wa = service.wa_link;
        }

        // Actualizar contador de fotos
        const photoCount = service.photos ? service.photos.length : 1;
        const hintEl = card.querySelector('.photo-hint');
        if (hintEl) {
          hintEl.innerHTML = `📸 ${photoCount} foto${photoCount > 1 ? 's' : ''} · Toca para ver`;
        }

        // Actualizar precios si existen
        const mainPriceEl = card.querySelector('.price-row.main-set .price-amount');
        if (mainPriceEl && service.price_main) mainPriceEl.textContent = service.price_main;

        const retouchPriceEl = card.querySelector('.price-row.retouch-set .price-amount');
        if (retouchPriceEl && service.price_retouch) retouchPriceEl.textContent = service.price_retouch;
      }
    });
  };

  // Cargar datos asincrónicos
  if (typeof fetchAllServices === 'function') {
    const servicesData = await fetchAllServices();
    updateGridFromServices(servicesData);
  }

  // ───────────────────────────
  // 4. Modal / Visor de Fotos Galería Interactivo
  // ───────────────────────────
  const modal = document.getElementById('photoModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalWaBtn = document.getElementById('modalWaBtn');
  const prevSlideBtn = document.getElementById('prevSlide');
  const nextSlideBtn = document.getElementById('nextSlide');
  const thumbnailsContainer = document.getElementById('modalThumbnails');
  const photoCounter = document.getElementById('photoCounter');
  const priceTagMain = document.getElementById('modalPriceMain');
  const priceTagRetouch = document.getElementById('modalPriceRetouch');

  let currentPhotosList = [];
  let currentPhotoIndex = 0;

  const openGalleryModal = (serviceId, clickedImgUrl = null) => {
    let service = loadedServices.find(s => s.id === serviceId);

    // Fallback si no se encontró en loadedServices
    if (!service) {
      const card = document.querySelector(`[data-service-id="${serviceId}"]`);
      if (card) {
        const wrapper = card.querySelector('.effect-img-wrapper');
        const photosAttr = wrapper ? wrapper.dataset.photos : '';
        const photos = photosAttr ? photosAttr.split(',') : [card.querySelector('.effect-img').src];
        service = {
          id: serviceId,
          title: wrapper ? wrapper.dataset.title : 'Servicio',
          description: wrapper ? wrapper.dataset.desc : '',
          wa_link: wrapper ? wrapper.dataset.wa : 'https://wa.me/573126879434',
          photos: photos,
          price_main: card.querySelector('.price-row.main-set .price-amount')?.textContent || '',
          price_retouch: card.querySelector('.price-row.retouch-set .price-amount')?.textContent || ''
        };
      }
    }

    if (!service) return;

    currentPhotosList = service.photos && service.photos.length > 0
      ? service.photos
      : [service.cover_url || 'img/efecto-natural.jpg'];

    // Si se hizo click en una foto específica
    if (clickedImgUrl && currentPhotosList.includes(clickedImgUrl)) {
      currentPhotoIndex = currentPhotosList.indexOf(clickedImgUrl);
    } else {
      currentPhotoIndex = 0;
    }

    // Llenar información modal
    modalTitle.textContent = service.title;
    modalDesc.textContent = service.description;
    modalWaBtn.href = service.wa_link || `https://wa.me/573126879434?text=Hola%20Salom%C3%A9!%20Quiero%20agendar%20el%20*${encodeURIComponent(service.title)}*`;

    if (priceTagMain) priceTagMain.textContent = service.price_main || '';
    if (priceTagRetouch) priceTagRetouch.textContent = service.price_retouch || '';

    // Renderizar miniaturas
    renderThumbnails();

    // Mostrar foto seleccionada
    updateModalPhoto(currentPhotoIndex);

    // Mostrar modal con animación
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Bloquear scroll de fondo
  };

  const closeGalleryModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const renderThumbnails = () => {
    if (!thumbnailsContainer) return;
    thumbnailsContainer.innerHTML = '';

    if (currentPhotosList.length <= 1) {
      thumbnailsContainer.style.display = 'none';
      if (prevSlideBtn) prevSlideBtn.style.display = 'none';
      if (nextSlideBtn) nextSlideBtn.style.display = 'none';
      return;
    }

    thumbnailsContainer.style.display = 'flex';
    if (prevSlideBtn) prevSlideBtn.style.display = 'flex';
    if (nextSlideBtn) nextSlideBtn.style.display = 'flex';

    currentPhotosList.forEach((photoUrl, index) => {
      const thumb = document.createElement('div');
      thumb.className = `modal-thumb ${index === currentPhotoIndex ? 'active' : ''}`;
      
      const img = document.createElement('img');
      img.src = photoUrl;
      img.alt = `Vista ${index + 1}`;
      
      thumb.appendChild(img);

      thumb.addEventListener('click', () => {
        currentPhotoIndex = index;
        updateModalPhoto(currentPhotoIndex);
      });

      thumbnailsContainer.appendChild(thumb);
    });
  };

  const updateModalPhoto = (index) => {
    if (currentPhotosList.length === 0) return;

    // Asegurar índice dentro de rango circular
    if (index < 0) currentPhotoIndex = currentPhotosList.length - 1;
    else if (index >= currentPhotosList.length) currentPhotoIndex = 0;
    else currentPhotoIndex = index;

    const targetUrl = currentPhotosList[currentPhotoIndex];

    // Transición suave
    modalImg.style.opacity = '0';
    modalImg.style.transform = 'scale(0.96)';

    setTimeout(() => {
      modalImg.src = targetUrl;
      modalImg.onload = () => {
        modalImg.style.opacity = '1';
        modalImg.style.transform = 'scale(1)';
      };
      // Si la imagen está cacheada
      if (modalImg.complete) {
        modalImg.style.opacity = '1';
        modalImg.style.transform = 'scale(1)';
      }
    }, 120);

    // Actualizar contador
    if (photoCounter) {
      photoCounter.textContent = `Foto ${currentPhotoIndex + 1} de ${currentPhotosList.length}`;
    }

    // Actualizar clase activa en miniaturas
    if (thumbnailsContainer) {
      const thumbs = thumbnailsContainer.querySelectorAll('.modal-thumb');
      thumbs.forEach((t, i) => {
        if (i === currentPhotoIndex) {
          t.classList.add('active');
          t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          t.classList.remove('active');
        }
      });
    }
  };

  // Event Listeners para abrir modal al tocar cualquier card
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.effect-card');
    // Si se hace clic en el botón de WhatsApp directo en la card, dejar actuar al link
    if (e.target.closest('.effect-btn')) return;

    if (card) {
      const serviceId = card.dataset.serviceId;
      const clickedImg = e.target.closest('.effect-img');
      const clickedUrl = clickedImg ? clickedImg.src : null;
      if (serviceId) {
        openGalleryModal(serviceId, clickedUrl);
      }
    }
  });

  // Botones anterior/siguiente
  if (prevSlideBtn) {
    prevSlideBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateModalPhoto(currentPhotoIndex - 1);
    });
  }

  if (nextSlideBtn) {
    nextSlideBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateModalPhoto(currentPhotoIndex + 1);
    });
  }

  // Cerrar modal
  if (modalClose) modalClose.addEventListener('click', closeGalleryModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeGalleryModal);

  // Teclado (Esc, Izquierda, Derecha)
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeGalleryModal();
    if (e.key === 'ArrowLeft') updateModalPhoto(currentPhotoIndex - 1);
    if (e.key === 'ArrowRight') updateModalPhoto(currentPhotoIndex + 1);
  });

  // Gestos táctiles (Swipe izquierda / derecha en móviles)
  let touchStartX = 0;
  let touchEndX = 0;

  const modalSliderContainer = document.querySelector('.modal-slider');
  if (modalSliderContainer) {
    modalSliderContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modalSliderContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  const handleSwipe = () => {
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) > 40) {
      if (swipeDistance < 0) {
        // Deslizar izquierda -> siguiente
        updateModalPhoto(currentPhotoIndex + 1);
      } else {
        // Deslizar derecha -> anterior
        updateModalPhoto(currentPhotoIndex - 1);
      }
    }
  };

  // ───────────────────────────
  // 5. Smooth Scroll para Enlaces
  // ───────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ───────────────────────────
  // 6. Notificación Toast
  // ───────────────────────────
  window.showToast = (msg) => {
    const old = document.querySelector('.beauty-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = 'beauty-toast';
    toast.textContent = msg;

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      background: 'linear-gradient(135deg, #f4a7c3, #c95b84)',
      color: '#fff',
      padding: '14px 28px',
      borderRadius: '50px',
      fontSize: '0.92rem',
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '500',
      boxShadow: '0 8px 32px rgba(192,80,130,0.4)',
      zIndex: '99999',
      opacity: '0',
      transition: 'all 0.4s ease',
      whiteSpace: 'nowrap'
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  };

});
