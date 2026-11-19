// La plantilla mantiene el mapa inactivo hasta que el visitante lo permite.
const plantilla = document.querySelector('#plantilla-mapa');
const opciones = document.querySelector('#opciones-mapa');
const aceptar = document.querySelector('#aceptar-mapa');
const rechazar = document.querySelector('#rechazar-mapa');
const estado = document.querySelector('#estado-mapa');
const clave = 'preferencia-mapa';

function mostrarEleccion(eleccion) {
    const activo = eleccion === 'aceptado';
    const mapa = document.querySelector('.tarjeta-mapa iframe');
    if (activo && !mapa) plantilla.after(plantilla.content.cloneNode(true));
    if (!activo && mapa) mapa.remove();

    aceptar.setAttribute('aria-pressed', String(activo));
    rechazar.setAttribute('aria-pressed', String(eleccion === 'rechazado'));
    estado.textContent = activo ? 'Mapa activado.' : 'Mapa desactivado.';
}

function elegir(eleccion) {
    mostrarEleccion(eleccion);
    try {
        sessionStorage.setItem(clave, eleccion);
    } catch {
        // Si el navegador bloquea el almacenamiento, la elección vale para esta visita.
    }
}

function restaurarEleccion() {
    try {
        mostrarEleccion(sessionStorage.getItem(clave));
    } catch {
        mostrarEleccion(null);
    }
}

aceptar.addEventListener('click', () => elegir('aceptado'));
rechazar.addEventListener('click', () => elegir('rechazado'));
opciones.hidden = false;
restaurarEleccion();
window.addEventListener('pageshow', restaurarEleccion);
