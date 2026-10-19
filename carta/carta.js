// Pestañas, navegación y altura de las dos barras.
const cabecera = document.querySelector('.cabecera');
const selector = document.querySelector('.selector-carta');
const listaPestanas = document.querySelector('.pestanas-carta');
const pestanas = Array.from(document.querySelectorAll('.pestana-carta'));
const paneles = Array.from(document.querySelectorAll('.panel-carta'));
const contenido = document.querySelector('.contenido-carta');

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
    const limiteSuperior = cabecera.getBoundingClientRect().height
        + selector.getBoundingClientRect().height;
    const posicionContenido = contenido.getBoundingClientRect().top;
    if (posicionContenido < limiteSuperior) {
        window.scrollTo({ top: Math.max(0, window.scrollY + posicionContenido - limiteSuperior) });
    }
}

pestanas.forEach((pestana, indice) => {
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

// El navegador puede enfocar la sección al abrir un enlace como #carta.
// Quitamos solo ese foco automático: trasladarlo a la pestaña también
// dibujaba un recuadro al entrar. La navegación con Tab sigue disponible.
function ajustarFocoDelDestino() {
    const panelEnfocado = paneles.find((panel) => panel === document.activeElement);
    if (panelEnfocado) panelEnfocado.blur();
}

// Pulsar otra vez el mismo enlace no dispara "hashchange".
// Gestionamos los enlaces a paneles de esta página para que el navegador
// no enfoque toda la sección al repetir el toque en móvil.
document.addEventListener('click', (evento) => {
    if (evento.defaultPrevented || evento.ctrlKey || evento.metaKey
        || evento.shiftKey || evento.altKey || evento.button !== 0) return;

    const enlace = evento.target.closest('a[href]');
    if (!enlace || enlace.hasAttribute('download')
        || (enlace.target && enlace.target !== '_self')) return;

    const destino = new URL(enlace.href, window.location.href);
    if (destino.origin !== window.location.origin
        || destino.pathname !== window.location.pathname
        || destino.search !== window.location.search) return;

    const panel = paneles.find((elemento) => destino.hash === '#' + elemento.id);
    if (!panel) return;

    evento.preventDefault();
    if (enlace.classList.contains('pestana-carta')) {
        mostrarDesdePestana(enlace);
        return;
    }

    seleccionarPanel(panel.id, { guardarHistorial: true });
    ajustarFocoDelDestino();
    panel.scrollIntoView({ block: 'start' });
});

// Los cambios de fragmento, incluidos Atrás/Adelante, actualizan el panel.
window.addEventListener('hashchange', () => {
    seleccionarPanel(obtenerDestino());
    requestAnimationFrame(ajustarFocoDelDestino);
});
window.addEventListener('load', () => requestAnimationFrame(ajustarFocoDelDestino));
seleccionarPanel(obtenerDestino());

// Vuelve al principio con animación sin cambiar la pestaña seleccionada.
const botonVolverArriba = document.querySelector('.volver-arriba');
botonVolverArriba.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
