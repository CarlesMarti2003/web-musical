// Código completo: controla las pestañas y la altura de las dos barras.
const cabecera = document.querySelector('.cabecera');
const selector = document.querySelector('.selector-carta');
const listaPestanas = document.querySelector('.pestanas-carta');
const pestanas = Array.from(document.querySelectorAll('.pestana-carta'));
const paneles = Array.from(document.querySelectorAll('.panel-carta'));

// La cabecera cambia de altura en móvil. No usamos un número fijo en el CSS.
function actualizarAlturas() {
    document.documentElement.style.setProperty(
        '--altura-cabecera', `${cabecera.getBoundingClientRect().height}px`
    );
    document.documentElement.style.setProperty(
        '--altura-selector', `${selector.getBoundingClientRect().height}px`
    );
}

const observadorAlturas = new ResizeObserver(actualizarAlturas);
observadorAlturas.observe(cabecera);
observadorAlturas.observe(selector);
actualizarAlturas();

// Añadimos la semántica de pestañas solo si JavaScript está funcionando.
listaPestanas.setAttribute('role', 'tablist');
listaPestanas.setAttribute('aria-label', 'Selecciona una carta o menú');

pestanas.forEach((pestana) => {
    const idPanel = pestana.hash.slice(1);
    const panel = document.getElementById(idPanel);
    pestana.setAttribute('role', 'tab');
    pestana.setAttribute('aria-controls', idPanel);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', pestana.id);
    panel.tabIndex = 0;
});

function obtenerDestino() {
    const destino = window.location.hash.slice(1);
    // Compatibilidad con los enlaces #menus de la versión anterior.
    if (destino === 'menus') return 'menu-diario';
    return paneles.some((panel) => panel.id === destino) ? destino : 'carta';
}

function seleccionarPanel(idPanel, { guardarHistorial = false, enfocar = false } = {}) {
    paneles.forEach((panel) => {
        panel.hidden = panel.id !== idPanel;
    });

    pestanas.forEach((pestana) => {
        const activa = pestana.hash === `#${idPanel}`;
        pestana.setAttribute('aria-selected', String(activa));
        pestana.tabIndex = activa ? 0 : -1;

        if (activa) {
            if (enfocar) pestana.focus({ preventScroll: true });
            // Mantiene visible la opción activa dentro del selector móvil.
            const izquierda = pestana.offsetLeft - listaPestanas.offsetLeft;
            const derecha = izquierda + pestana.offsetWidth;
            if (izquierda < listaPestanas.scrollLeft) {
                listaPestanas.scrollLeft = izquierda;
            } else if (derecha > listaPestanas.scrollLeft + listaPestanas.clientWidth) {
                listaPestanas.scrollLeft = derecha - listaPestanas.clientWidth;
            }
        }
    });

    if (guardarHistorial && window.location.hash !== `#${idPanel}`) {
        window.history.pushState(null, '', `#${idPanel}`);
    }
}

function mostrarDesdePestana(pestana) {
    seleccionarPanel(pestana.hash.slice(1), { guardarHistorial: true, enfocar: true });

    // Si se cambia después de bajar mucho, vuelve al principio del contenido
    // dejando visibles la cabecera y el selector.
    const contenido = document.querySelector('.contenido-carta');
    const limiteSuperior = cabecera.getBoundingClientRect().height
        + selector.getBoundingClientRect().height;
    const posicionContenido = contenido.getBoundingClientRect().top;
    if (posicionContenido < limiteSuperior) {
        window.scrollTo({ top: Math.max(0, window.scrollY + posicionContenido - limiteSuperior) });
    }
}

pestanas.forEach((pestana, indice) => {
    pestana.addEventListener('click', (evento) => {
        // Conserva la posibilidad de abrir un enlace en otra pestaña.
        if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey || evento.button !== 0) return;
        evento.preventDefault();
        mostrarDesdePestana(pestana);
    });

    pestana.addEventListener('keydown', (evento) => {
        let siguiente;
        if (evento.key === 'ArrowRight') siguiente = (indice + 1) % pestanas.length;
        else if (evento.key === 'ArrowLeft') siguiente = (indice - 1 + pestanas.length) % pestanas.length;
        else if (evento.key === 'Home') siguiente = 0;
        else if (evento.key === 'End') siguiente = pestanas.length - 1;
        else if (evento.key === ' ') {
            evento.preventDefault();
            mostrarDesdePestana(pestana);
            return;
        } else return;

        evento.preventDefault();
        mostrarDesdePestana(pestanas[siguiente]);
    });
});

// Un enlace como #carta puede dar foco automáticamente a toda la sección.
// Si ocurre, lo trasladamos a su pestaña para evitar el contorno gigante
// alrededor del contenido y mantener un foco útil para navegar con teclado.
function ajustarFocoDelDestino() {
    const panelEnfocado = paneles.find((panel) => panel === document.activeElement);
    if (panelEnfocado) {
        const pestana = pestanas.find((elemento) => elemento.hash === `#${panelEnfocado.id}`);
        if (pestana) pestana.focus({ preventScroll: true });
    }
}

// Los enlaces de la cabecera y los botones Atrás/Adelante también actualizan el panel.
window.addEventListener('hashchange', () => {
    seleccionarPanel(obtenerDestino());
    requestAnimationFrame(ajustarFocoDelDestino);
});
window.addEventListener('popstate', () => seleccionarPanel(obtenerDestino()));
window.addEventListener('load', () => requestAnimationFrame(ajustarFocoDelDestino));
seleccionarPanel(obtenerDestino());

// Vuelve al principio con animación sin cambiar la pestaña seleccionada.
const botonVolverArriba = document.querySelector('.volver-arriba');
botonVolverArriba.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
