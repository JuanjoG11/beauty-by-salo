# 🌸 Beauty Studio by Salomé Osorio — Instrucciones de Personalización

## Cómo poner tu avatar

1. Guarda tu imagen de avatar con el nombre **`avatar.png`** en la misma carpeta que `index.html`
2. ¡Listo! La web la detectará automáticamente
3. Si no encuentras el archivo, se mostrará un ícono floral de reemplazo

> El avatar se muestra en círculo. Funciona mejor con imágenes cuadradas o de cara/busto.

---

## Cómo actualizar el número de WhatsApp

En el archivo `script.js`, línea ~52, cambia:
```js
const numero = '573000000000';
```
Por tu número real (código de país + número, sin espacios ni guiones):
```js
const numero = '573152345678';  // ejemplo Colombia
```

También actualiza los links en `index.html`:
- Busca `wa.me/573000000000` y reemplaza con tu número real

---

## Cómo cambiar el usuario de Instagram

En `index.html`, busca `beautystudio.salome` y reemplázalo con tu usuario real.

---

## Cómo agregar fotos a la galería

En `index.html`, busca la sección `<!-- ✨ GALERÍA / RESULTADOS -->`.

Reemplaza cada `.galeria-placeholder` por una imagen real:
```html
<div class="galeria-item">
  <img src="fotos/trabajo1.jpg" alt="Extensiones Classic" />
</div>
```

---

## Personalizar servicios y precios

Edita las cards en la sección `<!-- ✨ SECCIÓN SERVICIOS -->` del `index.html`.
Puedes agregar o quitar items de cada lista de servicios.

---

## Colores principales

En `styles.css` al inicio (variables CSS):
- `--pink-main` → rosa principal
- `--pink-dark` → rosa oscuro (botones, acentos)
- `--text-dark` → texto principal

¡Listo! 💖
