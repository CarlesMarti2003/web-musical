const portadaCartas = document.querySelector('main > .tarjetas-carta');
const contenido = document.querySelector('.contenido-carta');
const paneles = contenido.querySelectorAll('.panel-carta');

// El fragmento identifica un menú o una categoría dentro de ese menú.
function mostrarDestino() {
    let id = location.hash.slice(1);
    if (id === 'menus') id = 'menu-diario'; // Enlaces de la primera versión.
    const destino = document.getElementById(id);
    const panelActivo = destino?.closest('.panel-carta');
    portadaCartas.hidden = Boolean(panelActivo);
    contenido.hidden = !panelActivo;
    for (const panel of paneles) panel.hidden = panel !== panelActivo;

    if (panelActivo) {
        const titulo = destino === panelActivo ? panelActivo.querySelector('h2') : destino;
        titulo.focus({ preventScroll: true });
        titulo.scrollIntoView();
    } else if (id === 'opciones') {
        document.getElementById('opciones').focus({ preventScroll: true });
        window.scrollTo(0, 0);
    }
}

window.addEventListener('hashchange', mostrarDestino);
mostrarDestino();

document.querySelector('.volver-arriba').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
