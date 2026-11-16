// El botón solo se muestra si el menú puede abrirse con JavaScript.
{
    const barra = document.querySelector('.cabecera');
    const boton = barra.querySelector('.boton-menu');
    const menu = document.getElementById(boton.getAttribute('aria-controls'));
    const vistaMovil = window.matchMedia('(max-width: 700px)');

    function abrirMenu(abierto) {
        boton.setAttribute('aria-expanded', String(abierto));
        barra.classList.toggle('menu-abierto', abierto);
    }

    if (barra.classList.contains('cabecera-inicio')) {
        function actualizarFondo() {
            barra.classList.toggle('con-scroll', window.scrollY > 40);
        }

        actualizarFondo();
        window.addEventListener('scroll', actualizarFondo, { passive: true });
        // Cubre también el regreso mediante Atrás y la restauración del scroll.
        window.addEventListener('pageshow', () => {
            actualizarFondo();
            requestAnimationFrame(actualizarFondo);
        });
    }

    boton.hidden = false;
    boton.addEventListener('click', () => {
        abrirMenu(boton.getAttribute('aria-expanded') === 'false');
    });

    barra.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') {
            abrirMenu(false);
            boton.focus();
        }
    });

    menu.addEventListener('click', (evento) => {
        const enlace = evento.target.closest('a');
        if (!vistaMovil.matches || !enlace || evento.ctrlKey || evento.metaKey
            || evento.shiftKey || evento.altKey) return;
        abrirMenu(false);
        if (menu.contains(document.activeElement)) boton.focus({ preventScroll: true });
    });

    vistaMovil.addEventListener('change', () => {
        const devolverFoco = vistaMovil.matches && menu.contains(document.activeElement);
        abrirMenu(false);
        if (devolverFoco) boton.focus();
    });
}
