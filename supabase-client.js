// ==========================================
// BEAUTY STUDIO BY SALOMÉ OSORIO
// Supabase Client & Data Storage Manager
// ==========================================

const SUPABASE_URL = 'https://dtjgjehnabkiqrhyekpe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0amdqZWhuYWJraXFyaHlla3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMDY0ODcsImV4cCI6MjEwMTg4MjQ4N30.sDaz6csKjRhUQ3dTzljHhAOqXHoiZwKRRaM79juxvVE';

let supabaseClient = null;

if (typeof supabase !== 'undefined') {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('🌸 Supabase inicializado correctamente.');
  } catch (err) {
    console.warn('⚠️ Error iniciando cliente Supabase, usando almacenamiento local:', err);
  }
}

// Datos iniciales por defecto (semilla local)
const DEFAULT_SERVICES = [
  {
    id: 'efecto-natural',
    title: 'Efecto Natural',
    category: 'pestañas',
    badge: '🌸 Sutil & Delicado',
    description: 'Acabado suave y sutil, perfecto si buscas resaltar tus pestañas de forma 100% natural para el día a día.',
    price_main: '$70.000',
    price_retouch: '$45.000',
    wa_link: 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20el%20*Efecto%20Natural*.',
    cover_url: 'img/efecto-natural.jpg',
    photos: ['img/efecto-natural.jpg', 'img/efecto-natural-2.jpg']
  },
  {
    id: 'efecto-pestanina',
    title: 'Efecto Pestañina',
    category: 'pestañas',
    badge: '💄 Efecto Rímel',
    description: 'Resalta tu mirada con el acabado de la pestaña recién maquillada con rímel: definido, oscuro y con brillo.',
    price_main: '$80.000',
    price_retouch: '$50.000',
    wa_link: 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20el%20*Efecto%20Pesta%C3%B1ina*.',
    cover_url: 'img/efecto-pestanina.jpg',
    photos: ['img/efecto-pestanina.jpg']
  },
  {
    id: 'efecto-2d',
    title: 'Efecto 2D',
    category: 'pestañas',
    badge: '⭐ Volumen Intermedio',
    description: 'Dos extensiones livianas por pestaña natural. Aporta más densidad y tupidez manteniendo ligereza.',
    price_main: '$85.000',
    price_retouch: '$50.000',
    wa_link: 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20el%20*Efecto%202D*.',
    cover_url: 'img/efecto-2d.jpg',
    photos: ['img/efecto-2d.jpg', 'img/efecto-2d-2.jpg']
  },
  {
    id: 'efecto-3d-sutil',
    title: 'Efecto 3D Sutil',
    category: 'pestañas',
    badge: '✨ Elegancia 3D',
    description: 'Abanicos delgados de 3 fibras con acabado volumétrico pero muy armonioso y libre de pesadez.',
    price_main: '$90.000',
    price_retouch: '$65.000',
    wa_link: 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20el%20*Efecto%203D%20Sutil*.',
    cover_url: 'img/efecto-3d-sutil.jpg',
    photos: ['img/efecto-3d-sutil.jpg']
  },
  {
    id: 'efecto-3d',
    title: 'Efecto 3D',
    category: 'pestañas',
    badge: '🔥 Máximo Volumen',
    description: 'Volumen completo, tupido y despampanante. Ideal para quienes aman una mirada intensa y deslumbrante.',
    price_main: '$100.000',
    price_retouch: '$65.000',
    wa_link: 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20el%20*Efecto%203D*.',
    cover_url: 'img/efecto-3d.jpg',
    photos: ['img/efecto-3d.jpg']
  },
  {
    id: 'efecto-whispy',
    title: 'Efecto Whispy',
    category: 'pestañas',
    badge: '👑 Tendencia Kim K',
    description: 'Juego de picos y alturas con textura desestructurada. Súper chic, coqueto y de última tendencia.',
    price_main: '$110.000',
    price_retouch: '$70.000',
    wa_link: 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20el%20*Efecto%20Whispy*.',
    cover_url: 'img/efecto-whispy.jpg',
    photos: ['img/efecto-whispy.jpg']
  },
  {
    id: 'tecnorimel',
    title: 'Tecno Rímel',
    category: 'pestañas',
    badge: '💎 Tecno Rímel',
    description: 'Efecto tecnológico que simula el acabado del rímel: oscuro, definido y de larga duración.',
    price_main: '$85.000',
    price_retouch: '$50.000',
    wa_link: 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20el%20*Tecno%20R%C3%ADmel*.',
    cover_url: 'img/efecto-whispy.jpg',
    photos: ['img/efecto-whispy.jpg']
  },
  {
    id: 'hidratacion-facial',
    title: 'Hidratación Facial',
    category: 'faciales',
    badge: '💧 Piel Radiante',
    description: 'Nutrición e hidratación profunda con sueros concentrados para devolver la vitalidad a tu rostro.',
    price_main: '$55.000',
    price_retouch: '',
    wa_link: 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20una%20*Hidrataci%C3%B3n%20Facial*.',
    cover_url: 'img/hidratacion-facial.jpg',
    photos: ['img/hidratacion-facial.jpg']
  },
  {
    id: 'limpieza-facial',
    title: 'Limpieza Facial',
    category: 'faciales',
    badge: '🌿 Renovación Cutánea',
    description: 'Desintoxicación de poros, exfoliación y extracción profunda para una piel limpia y sana.',
    price_main: '$70.000',
    price_retouch: '',
    wa_link: 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20una%20*Limpieza%20Facial*.',
    cover_url: 'img/limpieza-facial.jpg',
    photos: ['img/limpieza-facial.jpg']
  },
  {
    id: 'hidralips',
    title: 'Hidralips',
    category: 'hidralips',
    badge: '💋 Labios Hidratados',
    description: 'Tratamiento de ultrahidratación labial que restaura el volumen natural y suaviza líneas.',
    price_main: '$55.000 (1 ses) / $95.000 (2 ses)',
    price_retouch: '$150.000 (3 ses)',
    wa_link: 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20*Hidralips*.',
    cover_url: 'img/hidralips.jpg',
    photos: ['img/hidralips.jpg']
  },
  {
    id: 'adicionales',
    title: 'Adicionales & Retiros',
    category: 'adicionales',
    badge: '✨ Complementos',
    description: 'Detalles de color, pedrería o servicio de retiro seguro para tus pestañas.',
    price_main: '$7.000 / $5.000',
    price_retouch: '$5.000 / $10.000',
    wa_link: 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20un%20*Servicio%20Adicional*.',
    cover_url: 'img/adicionales.jpg',
    photos: ['img/adicionales.jpg']
  }
];

// Helper de almacenamiento local
const LOCAL_STORAGE_KEY = 'salome_beauty_services_v2';

function getLocalServices() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      // Verificar que tecnorimel esté — si no, agregarlo
      const hasTecno = parsed.some(s => s.id === 'tecnorimel');
      if (!hasTecno) {
        const tecno = DEFAULT_SERVICES.find(s => s.id === 'tecnorimel');
        if (tecno) {
          parsed.push(tecno);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        }
      }
      return parsed;
    } catch(e) {}
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SERVICES));
  return DEFAULT_SERVICES;
}

function saveLocalServices(services) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(services));
}

// Cargar todos los servicios (Intenta Supabase primero, luego LocalStorage)
async function fetchAllServices() {
  if (supabaseClient) {
    try {
      // 1. Obtener de tabla `services`
      const { data: dbServices, error: servErr } = await supabaseClient
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (!servErr && dbServices && dbServices.length > 0) {
        // 2. Obtener fotos de `service_photos`
        const { data: dbPhotos, error: photoErr } = await supabaseClient
          .from('service_photos')
          .select('*')
          .order('display_order', { ascending: true });

        const mappedServices = dbServices.map(serv => {
          const servPhotos = (!photoErr && dbPhotos)
            ? dbPhotos.filter(p => p.service_id === serv.id)
            : [];
          
          let photoUrls = servPhotos.map(p => p.photo_url);
          const coverPhoto = servPhotos.find(p => p.is_cover);

          if (photoUrls.length === 0 && serv.cover_url) {
            photoUrls = [serv.cover_url];
          }

          return {
            id: serv.id,
            title: serv.title,
            category: serv.category || 'pestañas',
            badge: serv.badge || '',
            description: serv.description || '',
            price_main: serv.price_main || '',
            price_retouch: serv.price_retouch || '',
            wa_link: serv.wa_link || `https://wa.me/573126879434?text=Hola%20Salom%C3%A9!%20Me%20interesa%20agendar%20${encodeURIComponent(serv.title)}`,
            cover_url: (coverPhoto ? coverPhoto.photo_url : serv.cover_url) || photoUrls[0] || 'img/efecto-natural.jpg',
            photos: photoUrls.length > 0 ? photoUrls : ['img/efecto-natural.jpg']
          };
        });

        // Actualizar cache local
        saveLocalServices(mappedServices);
        return mappedServices;
      }
    } catch (err) {
      console.warn('⚠️ Supabase no configurado o sin conexión. Usando LocalStorage:', err);
    }
  }

  return getLocalServices();
}

// Guardar/Actualizar servicio en Supabase y LocalStorage
async function saveServiceData(serviceObj) {
  // 1. Guardar en LocalStorage
  const localList = getLocalServices();
  const index = localList.findIndex(s => s.id === serviceObj.id);
  if (index >= 0) {
    localList[index] = serviceObj;
  } else {
    localList.push(serviceObj);
  }
  saveLocalServices(localList);

  // 2. Intentar guardar en Supabase si está disponible
  if (supabaseClient) {
    try {
      await supabaseClient.from('services').upsert({
        id: serviceObj.id,
        title: serviceObj.title,
        category: serviceObj.category,
        badge: serviceObj.badge,
        description: serviceObj.description,
        price_main: serviceObj.price_main,
        price_retouch: serviceObj.price_retouch,
        wa_link: serviceObj.wa_link,
        cover_url: serviceObj.cover_url
      });

      // Sincronizar fotos
      if (serviceObj.photos && serviceObj.photos.length > 0) {
        // Eliminar fotos antiguas del servicio en DB
        await supabaseClient.from('service_photos').delete().eq('service_id', serviceObj.id);
        
        // Insertar nuevas fotos
        const photoInserts = serviceObj.photos.map((url, idx) => ({
          service_id: serviceObj.id,
          photo_url: url,
          is_cover: url === serviceObj.cover_url,
          display_order: idx
        }));
        await supabaseClient.from('service_photos').insert(photoInserts);
      }
    } catch (err) {
      console.warn('⚠️ Error guardando en Supabase DB:', err);
    }
  }
  return true;
}

// Suscribirse a cambios en tiempo real en Supabase (Multi-dispositivo)
function subscribeToRealtimeChanges(onUpdateCallback) {
  if (supabaseClient) {
    try {
      supabaseClient
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, async () => {
          const freshData = await fetchAllServices();
          if (typeof onUpdateCallback === 'function') onUpdateCallback(freshData);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'service_photos' }, async () => {
          const freshData = await fetchAllServices();
          if (typeof onUpdateCallback === 'function') onUpdateCallback(freshData);
        })
        .subscribe();
    } catch (err) {
      console.warn('⚠️ No se pudo suscribir a Realtime Supabase:', err);
    }
  }

  // Polling de respaldo cada 12 segundos para sincronización multiplataforma
  setInterval(async () => {
    const freshData = await fetchAllServices();
    if (typeof onUpdateCallback === 'function') onUpdateCallback(freshData);
  }, 12000);
}


// Subir foto a Supabase Storage (o fallback base64)
async function uploadPhotoFile(file, serviceId) {
  if (supabaseClient) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${serviceId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `services/${fileName}`;

      const { data, error } = await supabaseClient.storage
        .from('service-photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabaseClient.storage
          .from('service-photos')
          .getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      } else {
        console.warn('⚠️ Error subiendo a bucket de Supabase, usando Base64:', error);
      }
    } catch (err) {
      console.warn('⚠️ Excepción subiendo imagen a Supabase:', err);
    }
  }

  // Fallback: convertir archivo a Data URL Base64
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// Generador de SQL para inicializar Supabase
const SQL_INIT_SCHEMA = `
-- Script de Creación de Tablas y Datos Semilla para Beauty Studio Salomé Osorio
-- Copia y pega esto en la pestaña SQL Editor de tu Dashboard de Supabase

-- 1. Tabla de Servicios
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'pestañas',
  badge TEXT,
  description TEXT,
  price_main TEXT,
  price_retouch TEXT,
  wa_link TEXT,
  cover_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Fotos de Servicios
CREATE TABLE IF NOT EXISTS public.service_photos (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  service_id TEXT REFERENCES public.services(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_cover BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS y políticas públicas
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de servicios" ON public.services;
DROP POLICY IF EXISTS "Escritura pública de servicios" ON public.services;
CREATE POLICY "Lectura pública de servicios" ON public.services FOR SELECT USING (true);
CREATE POLICY "Escritura pública de servicios" ON public.services FOR ALL USING (true);

DROP POLICY IF EXISTS "Lectura pública de fotos" ON public.service_photos;
DROP POLICY IF EXISTS "Escritura pública de fotos" ON public.service_photos;
CREATE POLICY "Lectura pública de fotos" ON public.service_photos FOR SELECT USING (true);
CREATE POLICY "Escritura pública de fotos" ON public.service_photos FOR ALL USING (true);

-- 4. Crear bucket de almacenamiento para fotos (público)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-photos', 'service-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Lectura pública de bucket service-photos" ON storage.objects;
DROP POLICY IF EXISTS "Subida pública a bucket service-photos" ON storage.objects;
CREATE POLICY "Lectura pública de bucket service-photos" ON storage.objects FOR SELECT USING (bucket_id = 'service-photos');
CREATE POLICY "Subida pública a bucket service-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'service-photos');

-- 5. Insertar datos de servicios iniciales
INSERT INTO public.services (id, title, category, badge, description, price_main, price_retouch, wa_link, cover_url, display_order)
VALUES 
('efecto-natural', 'Efecto Natural', 'pestañas', '🌸 Sutil & Delicado', 'Acabado suave y sutil, perfecto si buscas resaltar tus pestañas de forma 100% natural para el día a día.', '$70.000', '$45.000', 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20el%20*Efecto%20Natural*.', 'img/efecto-natural.jpg', 1),
('efecto-pestanina', 'Efecto Pestañina', 'pestañas', '💄 Efecto Rímel', 'Resalta tu mirada con el acabado de la pestaña recién maquillada con rímel: definido, oscuro y con brillo.', '$80.000', '$50.000', 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20el%20*Efecto%20Pesta%C3%B1ina*.', 'img/efecto-pestanina.jpg', 2),
('efecto-2d', 'Efecto 2D', 'pestañas', '⭐ Volumen Intermedio', 'Dos extensiones livianas por pestaña natural. Aporta más densidad y tupidez manteniendo ligereza.', '$85.000', '$50.000', 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20el%20*Efecto%202D*.', 'img/efecto-2d.jpg', 3),
('efecto-3d-sutil', 'Efecto 3D Sutil', 'pestañas', '✨ Elegancia 3D', 'Abanicos delgados de 3 fibras con acabado volumétrico pero muy armonioso y libre de pesadez.', '$90.000', '$65.000', 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20el%20*Efecto%203D%20Sutil*.', 'img/efecto-3d-sutil.jpg', 4),
('efecto-3d', 'Efecto 3D', 'pestañas', '🔥 Máximo Volumen', 'Volumen completo, tupido y despampanante. Ideal para quienes aman una mirada intensa y deslumbrante.', '$100.000', '$65.000', 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20el%20*Efecto%203D*.', 'img/efecto-3d.jpg', 5),
('efecto-whispy', 'Efecto Whispy', 'pestañas', '👑 Tendencia Kim K', 'Juego de picos y alturas con textura desestructurada. Súper chic, coqueto y de última tendencia.', '$110.000', '$70.000', 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20el%20*Efecto%20Whispy*.', 'img/efecto-whispy.jpg', 6),
('hidratacion-facial', 'Hidratación Facial', 'faciales', '💧 Piel Radiante', 'Nutrición e hidratación profunda con sueros concentrados para devolver la vitalidad a tu rostro.', '$55.000', '', 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20una%20*Hidrataci%C3%B3n%20Facial*.', 'img/hidratacion-facial.jpg', 7),
('limpieza-facial', 'Limpieza Facial', 'faciales', '🌿 Renovación Cutánea', 'Desintoxicación de poros, exfoliación y extracción profunda para una piel limpia y sana.', '$70.000', '', 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20una%20*Limpieza%20Facial*.', 'img/limpieza-facial.jpg', 8),
('hidralips', 'Hidralips', 'hidralips', '💋 Labios Hidratados', 'Tratamiento de ultrahidratación labial que restaura el volumen natural y suaviza líneas.', '$55.000 / $95.000', '$150.000', 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20*Hidralips*.', 'img/hidralips.jpg', 9),
('adicionales', 'Adicionales & Retiros', 'adicionales', '✨ Complementos', 'Detalles de color, pedrería o servicio de retiro seguro para tus pestañas.', '$7.000 / $5.000', '$5.000 / $10.000', 'https://wa.me/573126879434?text=%C2%A1Hola%20Salom%C3%A9!%20%F0%9F%8C%B8%20Me%20interesa%20agendar%20un%20*Servicio%20Adicional*.', 'img/adicionales.jpg', 10)
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  description = EXCLUDED.description,
  price_main = EXCLUDED.price_main,
  price_retouch = EXCLUDED.price_retouch,
  wa_link = EXCLUDED.wa_link,
  cover_url = EXCLUDED.cover_url;

-- Insertar fotos de demostración iniciales
INSERT INTO public.service_photos (service_id, photo_url, is_cover, display_order)
VALUES
('efecto-natural', 'img/efecto-natural.jpg', true, 1),
('efecto-natural', 'img/efecto-natural-2.jpg', false, 2),
('efecto-pestanina', 'img/efecto-pestanina.jpg', true, 1),
('efecto-2d', 'img/efecto-2d.jpg', true, 1),
('efecto-2d', 'img/efecto-2d-2.jpg', false, 2),
('efecto-3d-sutil', 'img/efecto-3d-sutil.jpg', true, 1),
('efecto-3d', 'img/efecto-3d.jpg', true, 1),
('efecto-whispy', 'img/efecto-whispy.jpg', true, 1),
('hidratacion-facial', 'img/hidratacion-facial.jpg', true, 1),
('limpieza-facial', 'img/limpieza-facial.jpg', true, 1),
('hidralips', 'img/hidralips.jpg', true, 1),
('adicionales', 'img/adicionales.jpg', true, 1);
`;

