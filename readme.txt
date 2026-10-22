# 🎮 WikiBrawler — Multiverse Character Hub

**WikiBrawler** es una aplicación web interactiva de tipo wiki diseñada como un centro multiverso para la gestión y exploración de héroes, luchadores y personajes propios (OCs). Desarrollada con HTML5, Bulma CSS y JavaScript vainilla, cuenta con persistencia de datos local y un sistema dinámico de visualización de imágenes adaptativo.

---

## ✨ Características Principales

* **Roster Multiversal**: Organizado por universos y franquicias (Overwatch, Super Smash Bros, Marvel Rivals, Mortal Kombat, Deadlock y Creación Propia).
* **Búsqueda y Filtrado Global**: Filtra personajes instantáneamente por nombre, rol, franquicia u origen, con opciones de ordenamiento alfabético (A - Z, Z - A).
* **Gestión CRUD Local (`localStorage`)**: Permite agregar nuevos personajes, editar perfiles existentes o eliminarlos directamente desde la interfaz, almacenando los cambios en el navegador.
* **Sistema de Imágenes Inteligente**:
  * Carga automática de retratos optimizados en formato `.webp`.
  * Sistema de respaldo integrado en JavaScript: busca una variante de primer plano (`-close.webp`) para el modal de detalles y recurre automáticamente al retrato principal (`-portrait.webp`) si no la encuentra.
  * Escalado responsivo mediante `object-fit: contain` para evitar recortes indeseados en los modales de visualización.
* **Navegación Fluida**: Permite navegar entre personajes mediante flechas laterales con transiciones animadas sin necesidad de cerrar el modal de detalles.

---

## 📂 Estructura del Proyecto

```text
wiki-brawler/
├── css/
│   └── styles.css          # Estilos personalizados, variables y animaciones
├── js/
│   └── app_logic.js        # Lógica principal, CRUD, filtros y gestión de imágenes
├── json/
│   └── personajes.json     # Archivo de semilla inicial con los datos del roster
├── images/                 # Contenedor de activos gráficos organizados por universos
│   ├── deadlock/
│   ├── marvel-rivals/
│   ├── mortal-kombat/
│   ├── overwach/
│   └── ssb/
└── index.html              # Estructura principal de la aplicación y modales