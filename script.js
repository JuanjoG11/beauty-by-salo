// ===========================
// BEAUTY STUDIO BY SALOMÉ OSORIO
// Script Principal
// ===========================

document.addEventListener('DOMContentLoaded', () => {

  // ───────────────────────────
  // 1. Avatar: ocultar placeholder si hay imagen real
  // ───────────────────────────
  const avatarImg = document.getElementById('avatarImg');
  const avatarPlaceholder = document.getElementById('avatarPlaceholder');

  if (avatarImg) {
    avatarImg.addEventListener('load', () => {
      // La imagen cargó correctamente → ocultar placeholder
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
      avatarImg.style.display = 'block';
    });

    avatarImg.addEventListener('error', () => {
      // No se encontró avatar.png → mostrar placeholder floral
      avatarImg.style.display = 'none';
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
    });

    // Si ya estaba cacheada
    if (avatarImg.complete && avatarImg.naturalWidth > 0) {
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
      avatarImg.style.display = 'block';
    } else if (avatarImg.complete) {
      avatarImg.style.display = 'none';
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
    }
  }

  // ───────────────────────────
  // 2. Scroll animations (AOS simplificado)
  // ───────────────────────────
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
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  animatedEls.forEach((el) => observer.observe(el));

  // ───────────────────────────
  // 3. Formulario → WhatsApp
  // ───────────────────────────
  const form = document.getElementById('citaForm');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre   = document.getElementById('nombre').value.trim();
      const servicio = document.getElementById('servicio').value;
      const mensaje  = document.getElementById('mensaje').value.trim();

      if (!nombre || !servicio) {
        showToast('Por favor completa tu nombre y el servicio 💕');
        return;
      }

      // Número de WhatsApp — cambia por el número real de Salomé
      const numero = '573000000000';

      let texto = `¡Hola Salomé! 🌸 Soy *${nombre}* y me interesa el servicio de *${servicio}*.`;
      if (mensaje) texto += ` ${mensaje}`;
      texto += ` ¿Podrías darme información y agendar una cita? ✨`;

      const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
      window.open(url, '_blank', 'noopener');

      showToast('¡Redirigiendo a WhatsApp! 💬💕');
      form.reset();
    });
  }

  // ───────────────────────────
  // 4. Toast notification
  // ───────────────────────────
  function showToast(msg) {
    // Eliminar toast existente
    const old = document.querySelector('.beauty-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = 'beauty-toast';
    toast.textContent = msg;

    Object.assign(toast.style, {
      position:       'fixed',
      bottom:         '30px',
      left:           '50%',
      transform:      'translateX(-50%) translateY(20px)',
      background:     'linear-gradient(135deg, #f4a7c3, #e07ea3)',
      color:          '#fff',
      padding:        '14px 28px',
      borderRadius:   '50px',
      fontSize:       '0.9rem',
      fontFamily:     "'Poppins', sans-serif",
      fontWeight:     '500',
      boxShadow:      '0 8px 32px rgba(192,80,130,0.4)',
      zIndex:         '9999',
      opacity:        '0',
      transition:     'all 0.4s ease',
      whiteSpace:     'nowrap',
    });

    document.body.appendChild(toast);

    // Animar entrada
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });
    });

    // Animar salida
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // ───────────────────────────
  // 5. Smooth scroll para nav links
  // ───────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ───────────────────────────
  // 6. Efecto sparkle al hacer hover en cards
  // ───────────────────────────
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('mouseenter', (e) => {
      createSparkle(e.currentTarget);
    });
  });

  function createSparkle(el) {
    const sparkle = document.createElement('span');
    const size = Math.random() * 16 + 8;
    const x = Math.random() * el.offsetWidth;
    const y = Math.random() * el.offsetHeight;

    Object.assign(sparkle.style, {
      position:     'absolute',
      left:         x + 'px',
      top:          y + 'px',
      width:        size + 'px',
      height:       size + 'px',
      background:   'radial-gradient(circle, rgba(244,167,195,0.9) 0%, transparent 70%)',
      borderRadius: '50%',
      pointerEvents:'none',
      animation:    'sparkleAnim 0.6s ease forwards',
      zIndex:       '0',
    });

    el.style.position = 'relative';
    el.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
  }

  // Inyectar keyframe de sparkle
  if (!document.querySelector('#sparkle-style')) {
    const style = document.createElement('style');
    style.id = 'sparkle-style';
    style.textContent = `
      @keyframes sparkleAnim {
        0%   { transform: scale(0); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

});
