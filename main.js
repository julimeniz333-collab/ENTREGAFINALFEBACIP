function agregarAporte(asociacionId) {
    if (confirmando) return;
    const existente = estado.aportes.find((aporte) => aporte.asociacionId === asociacionId);
    if (existente) {
        mostrarMensaje("Esta asociación ya está en tus aportes. Podés modificar su monto.");
        document.querySelector(`#monto-${asociacionId}`).focus();
        return;
    }
    if (guardarEstado({ ...estado, aportes: [...estado.aportes, { asociacionId, monto: MONTO_INICIAL }] })) {
        mostrarMensaje("Aporte agregado. Podés cambiar el monto en Mis aportes.");
    }
}

function modificarMonto(evento) {
    const campo = evento.target.closest("[data-monto]");
    if (!campo || confirmando) return;
    const asociacionId = Number(campo.dataset.monto);
    const monto = Number(campo.value);
    if (!montoValido(monto)) {
        mostrarMensaje("Ingresá un monto entero entre $100 y $1.000.000. Se conserva el monto anterior.");
        campo.value = estado.aportes.find((aporte) => aporte.asociacionId === asociacionId).monto;
        return;
    }
    const aportes = estado.aportes.map((aporte) => aporte.asociacionId === asociacionId ? { ...aporte, monto } : aporte);
    if (!guardarEstado({ ...estado, aportes })) renderizarAportes();
}

function renderizarHistorial() {
    listaHistorial.replaceChildren();
    estado.historial.forEach(({ id, fecha, aportes, total }) => {
        const comprobante = document.createElement("article");
        comprobante.className = "comprobante";
        comprobante.innerHTML = `
            <h3>Donación simulada · ${formatoMoneda.format(total)}</h3>
            <p>${formatoFecha.format(new Date(fecha))} · Comprobante ${escaparTexto(id)}</p>
            <ul>${aportes.map(({ nombre, monto }) => `<li>${escaparTexto(nombre)}: ${formatoMoneda.format(monto)}</li>`).join("")}</ul>`;
        listaHistorial.append(comprobante);
    });
    const totalHistorico = estado.historial.reduce((total, donacion) => total + donacion.total, 0);
    document.querySelector("#resumen-historial").textContent = estado.historial.length > 0
        ? `${estado.historial.length} donaciones simuladas · Total acumulado: ${formatoMoneda.format(totalHistorico)}`
        : "Tus donaciones confirmadas aparecerán acá. Todavía no hay movimientos.";
    botonBorrarHistorial.disabled = estado.historial.length === 0 || confirmando || !window.Swal;
}

async function confirmarDonacion() {
    if (confirmando || estado.aportes.length === 0 || !window.Swal) return;
    confirmando = true;
    renderizarAportes();
    renderizarAsociaciones();
    renderizarHistorial();
    try {
        const { isConfirmed } = await Swal.fire({
            icon: "question", title: "Revisá tu aporte",
            html: `<p>Vas a simular una donación a ${estado.aportes.length} asociaciones.</p>
                <ul>${estado.aportes.map(({ asociacionId, monto }) => {
                    const { nombre } = asociaciones.find(({ id }) => id === asociacionId);
                    return `<li>${escaparTexto(nombre)}: ${formatoMoneda.format(monto)}</li>`;
                }).join("")}</ul>
                <p><strong>Total: ${formatoMoneda.format(calcularTotal())}</strong></p><p>No se realizará ningún cobro real.</p>`,
            showCancelButton: true, confirmButtonText: "Confirmar simulación", cancelButtonText: "Seguir editando"
        });
        if (!isConfirmed) return;
        const donacion = {
            id: crypto.randomUUID(), fecha: new Date().toISOString(), total: calcularTotal(),
            aportes: estado.aportes.map(({ asociacionId, monto }) => {
                const { nombre } = asociaciones.find(({ id }) => id === asociacionId);
                return { asociacionId, nombre, monto };
            })
        };
        if (guardarEstado({ aportes: [], historial: [donacion, ...estado.historial] })) {
            await Swal.fire({ icon: "success", title: "¡Gracias por sumar!", text: "La donación simulada se guardó en tu historial. No se realizó ningún pago.", confirmButtonText: "Ver historial" });
            document.querySelector("#historial").scrollIntoView();
        }
    } finally {
        confirmando = false;
        renderizarAportes();
        renderizarAsociaciones();
        renderizarHistorial();
    }
}

async function vaciarSeccion(seccion) {
    if (confirmando || !window.Swal || estado[seccion].length === 0) return;
    const esHistorial = seccion === "historial";
    const { isConfirmed } = await Swal.fire({
        icon: "warning", title: esHistorial ? "¿Borrar el historial?" : "¿Vaciar tus aportes?",
        text: esHistorial ? "Se eliminarán los comprobantes guardados en este navegador." : "Se quitarán todos los aportes pendientes. Tu historial se conserva.",
        showCancelButton: true, confirmButtonText: "Sí, borrar", cancelButtonText: "Cancelar"
    });
    if (isConfirmed && !confirmando) guardarEstado({ ...estado, [seccion]: [] });
}

busqueda.addEventListener("input", renderizarAsociaciones);
categoria.addEventListener("change", renderizarAsociaciones);
botonReintentar.addEventListener("click", iniciarAplicacion);
contenedorAsociaciones.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-agregar]");
    if (boton) agregarAporte(Number(boton.dataset.agregar));
});
listaAportes.addEventListener("change", modificarMonto);
listaAportes.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-quitar]");
    if (!boton || confirmando) return;
    const asociacionId = Number(boton.dataset.quitar);
    guardarEstado({ ...estado, aportes: estado.aportes.filter((aporte) => aporte.asociacionId !== asociacionId) });
});
botonConfirmar.addEventListener("click", confirmarDonacion);
botonVaciar.addEventListener("click", () => vaciarSeccion("aportes"));
botonBorrarHistorial.addEventListener("click", () => vaciarSeccion("historial"));
iniciarAplicacion();
