## Objetivo
- Ordenar y optimizar la web manteniendo los mismos colores e identidad.
- Mejorar UX, rendimiento, accesibilidad, SEO y mantenibilidad sin introducir frameworks.

## Arquitectura de proyecto
- Reorganizar carpetas: `index.html`, `comprar.html`, `css/`, `js/`, `assets/`.
- Separar estilos en `css/base.css`, `css/layout.css`, `css/components.css`, `css/pages/index.css`, `css/pages/comprar.css`.
- Modularizar JS: `js/core/scroll.js`, `js/core/observer.js`, `js/pages/index.js`, `js/pages/comprar.js`, `js/utils/dom.js`.

## Estilos (sin cambiar colores)
- Introducir variables CSS para la paleta actual (`--color-primario`, `--color-secundario`, `--color-fondo`, `--color-texto`).
- Definir escala tipográfica con `clamp()` y sistema de espaciado (`--space-xxs`…`--space-xxl`).
- Unificar componentes: botones, tarjetas, tablas de precios, formularios con estados `hover`/`focus` consistentes.
- Limpiar reglas duplicadas y adoptar nomenclatura BEM para clases.

## Layout y componentes
- Contenedores responsivos con `max-width` y `padding` coherente.
- Estructurar secciones con grid/flex: hero, quienes, servicios, resultados, precios, contacto.
- Encabezado sticky y navegación con indicador de sección activa.
- Crear componentes reutilizables: `Card`, `PricingTable`, `FeatureList`, `CTA`.

## Accesibilidad
- Landmarks semánticos (`header`, `nav`, `main`, `section`, `footer`) y jerarquía de encabezados.
- Etiquetas y `aria-*` en navegación y formularios; foco visible.
- Respeto a `prefers-reduced-motion` para animaciones.
- Alternativas textuales en imágenes y contraste verificado.

## Rendimiento
- `loading="lazy"` y tamaños responsivos en imágenes.
- Optimizar `assets/banner.png` y `assets/logo.png` sin alterar apariencia.
- Preconexión a fuentes y `font-display: swap`.
- CSS crítico inline en `index.html` y carga diferida del resto.
- Minificar CSS/JS de forma simple (sin tooling obligatorio).

## SEO
- Títulos y meta descripciones por página.
- Open Graph y Twitter Card con el logo y banner.
- `link rel="canonical"` y favicon correcto.
- JSON-LD básico de `Organization`.

## JS y flujo de compra
- Encapsular `IntersectionObserver` y smooth scroll en módulos.
- Validación accesible de formularios con mensajes claros.
- Mejorar `comprar.js`: persistir selección/cantidad, formateo de moneda, resumen, validaciones.
- Mantener `mailto:` como envío, estructurando el cuerpo del mensaje.

## Responsividad
- Breakpoints coherentes (360, 768, 1024, 1280).
- Tipografía fluida y rejillas adaptativas.
- Menú móvil accesible (hamburguesa) sin frameworks.

## Limpieza y coherencia
- Resolver discrepancia `banner.jpg` vs `banner.png` y eliminar assets no usados.
- Normalizar nombres de clases y utilidades.

## Entregables
- Estructura de archivos ordenada.
- HTML semántico actualizado.
- CSS modular con tokens de diseño.
- JS modular y utilidades.
- Assets optimizados y metadatos SEO.
- Documentación breve de estilos/componentes.

## Verificación
- Pruebas manuales de navegación, formularios, foco y scroll.
- Revisiones con Lighthouse para rendimiento, accesibilidad y SEO.

## Alcance
- Se mantienen los colores y la identidad; se mejora orden, calidad y experiencia.