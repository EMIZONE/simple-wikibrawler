// Arreglo global que funciona como base de datos en memoria para almacenar los registros de personajes.
let db = [];
// Variable de estado que mantiene la referencia del identificador del personaje actualmente seleccionado para visualización o edición.
let currentId = null;

// Procedimiento asíncrono de inicialización. 
// Verifica la existencia de datos en el almacenamiento local (localStorage). 
// Si no existen, realiza una petición de red para extraer un archivo JSON semilla, lo parsea, lo guarda en memoria y lo persiste localmente. 
// Finalmente, invoca la función de renderizado.
async function init() {
    const data = localStorage.getItem('wiki_data');
    if (data) db = JSON.parse(data);
    else {
        const res = await fetch('./json/personajes.json');
        db = await res.json();
        localStorage.setItem('wiki_data', JSON.stringify(db));
    }
    filterData();
}

// Función de mapeo para la asignación de temas visuales.
// Recibe el nombre de la franquicia y devuelve la cadena correspondiente utilizada en las clases CSS.
function getTheme(juego) {
    const themes = {
        'Overwatch': 'overwatch',
        'Super Smash Bros': 'smash',
        'Marvel Rivals': 'marvel',
        'Mortal Kombat': 'mk',
        'Deadlock': 'deadlock'
    };
    return themes[juego] || 'custom';
}

// Motor central de filtrado, ordenamiento y renderizado del DOM.
// Extrae los valores actuales de los elementos de entrada (búsqueda, juego, orden).
// Evalúa la base de datos en memoria y genera una vista renderizada en el contenedor HTML.
function filterData() {
    const q = document.getElementById('search').value.toLowerCase();
    const g = document.getElementById('game').value;
    const s = document.getElementById('sort').value;

    // Filtra los registros comparando el término de búsqueda con el nombre y rol, e interceptando con el filtro de juego.
    let filtered = db.filter(c => 
        (c.nombre.toLowerCase().includes(q) || c.rol.toLowerCase().includes(q)) && 
        (!g || c.juego === g)
    );

    // Aplica el ordenamiento lexicográfico sobre el arreglo filtrado dependiendo de la selección del usuario.
    if (s === 'asc') filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (s === 'desc') filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));

    // Actualiza el contador de resultados en la interfaz.
    document.getElementById('count').textContent = filtered.length;
    
    // Inyecta el marcado HTML dinámico interpolando los datos del arreglo resultante.
    document.getElementById('grid').innerHTML = filtered.map(c => {
        const theme = getTheme(c.juego);
        return `
        <div class="column is-12-mobile is-6-tablet is-4-desktop">
            <div class="card border-${theme}" onclick="viewChar('${c.id}')">
                <div class="card-image"><img src="./images/${c.imagen}" onerror="this.src='./images/placeholder.png'"></div>
                <div class="card-content">
                    <span class="tag badge-${theme} mb-2">${c.juego}</span>
                    <h3 class="title is-3 has-text-white">${c.nombre}</h3>
                    <p class="subtitle is-5 has-text-grey-light">${c.rol}</p>
                </div>
            </div>
        </div>`;
    }).join('');
}

// Controlador de estado para las ventanas modales.
// Utiliza la manipulación de clases CSS (is-active) para modificar la visibilidad.
// Incluye una validación condicional para limpiar el formulario cuando se invoca para crear un nuevo registro.
function openModal(id, show) {
    document.getElementById(id).classList.toggle('is-active', show);
    if(id === 'formModal' && show && !currentId) document.getElementById('charForm').reset();
}

// Procesador de la vista de detalles.
// Localiza el registro en la memoria a partir de su ID, actualiza la variable de estado currentId y puebla los nodos del DOM del modal de detalles.
function viewChar(id) {
    const c = db.find(x => x.id === id);
    const theme = getTheme(c.juego);
    currentId = id;
    
    document.getElementById('d-name').textContent = c.nombre;
    
    // Gestión del recurso gráfico con respaldo de errores (fallback).
    // Prioriza la carga de la variante de imagen "-close". Si el archivo no existe, el evento onerror intercepta el fallo y carga la imagen estándar.
    const imgTag = document.getElementById('d-img');
    if (c.imagen) {
        const imagenClose = c.imagen.replace('-portrait.webp', '-close.webp');
        imgTag.onerror = function() {
            this.src = `./images/${c.imagen}`;
            this.onerror = null; 
        };
        imgTag.src = `./images/${imagenClose}`;
    } else {
        imgTag.src = './images/placeholder.png';
    }
    
    // Asignación de propiedades textuales y temáticas.
    const gameBadge = document.getElementById('d-game');
    gameBadge.textContent = c.juego;
    gameBadge.className = `tag badge-${theme} mb-2`; 
    
    document.getElementById('d-role').textContent = c.rol;
    document.getElementById('d-origin').textContent = c.origen || 'N/A';
    document.getElementById('d-desc').textContent = c.descripcion;
    
    // Vinculación de eventos destructivos y de modificación a los botones de acción del modal.
    document.getElementById('btn-del').onclick = () => { if(confirm('¿Eliminar?')) { db = db.filter(x => x.id !== id); sync(); openModal('detailModal', false); } };
    document.getElementById('btn-edit').onclick = () => { editChar(c); };
    
    openModal('detailModal', true);
}

// Procedimiento de transición entre la vista de detalles y el formulario de edición.
// Oculta el modal actual e inyecta los valores del objeto seleccionado en los campos de entrada correspondientes del formulario.
function editChar(c) {
    openModal('detailModal', false);
    document.getElementById('f-id').value = c.id;
    // Mapeo iterativo de las propiedades del objeto hacia los elementos del DOM.
    ['name', 'game', 'role', 'origin', 'desc', 'img'].forEach(k => {
        document.getElementById(`f-${k}`).value = c[k === 'name' ? 'nombre' : k === 'game' ? 'juego' : k === 'role' ? 'rol' : k === 'origin' ? 'origen' : k === 'desc' ? 'descripcion' : 'imagen'];
    });
    openModal('formModal', true);
}

// Interceptor del evento de envío del formulario (submit).
// Previene el comportamiento por defecto del navegador, recolecta los datos de los campos de texto, construye un objeto y determina si es una operación de inserción (unshift) o actualización (sobrescritura por índice).
function saveChar(e) {
    e.preventDefault();
    const char = {
        id: document.getElementById('f-id').value || Date.now().toString(),
        nombre: document.getElementById('f-name').value,
        juego: document.getElementById('f-game').value,
        rol: document.getElementById('f-role').value,
        origen: document.getElementById('f-origin').value,
        descripcion: document.getElementById('f-desc').value,
        imagen: document.getElementById('f-img').value
    };

    const idx = db.findIndex(x => x.id === char.id);
    if (idx > -1) db[idx] = char;
    else db.unshift(char);

    // Delega la persistencia de datos y actualización de interfaz.
    sync();
    openModal('formModal', false);
}

// Procedimiento de sincronización de estado.
// Transforma el arreglo en memoria a una cadena JSON, lo almacena en localStorage y fuerza la recarga de la cuadrícula visual llamando a filterData().
function sync() {
    localStorage.setItem('wiki_data', JSON.stringify(db));
    filterData();
}

// Establece el punto de entrada de la aplicación al finalizar el análisis estructural del documento HTML.
document.addEventListener('DOMContentLoaded', init);