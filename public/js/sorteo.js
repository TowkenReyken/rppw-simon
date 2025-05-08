document.addEventListener("DOMContentLoaded", function () {
    const inputFecha = document.getElementById("fechaSorteo");
    const contador = document.getElementById("contador");

    // Verificar si es admin
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isAdmin = payload.rol === "admin";
            
            // Solo mostrar el input si es admin
            if (isAdmin) {
                inputFecha.style.display = 'block';
            }
        } catch (error) {
            console.error("Error al decodificar el token:", error);
        }
    }

    // Cargar fecha guardada en localStorage
    if (localStorage.getItem("fechaSorteo")) {
        inputFecha.value = localStorage.getItem("fechaSorteo");
    }

    function actualizarContador() {
        const fechaSeleccionada = new Date(inputFecha.value).getTime();
        const ahora = new Date().getTime();
        const diferencia = fechaSeleccionada - ahora;

        if (isNaN(fechaSeleccionada)) {
            contador.innerHTML = "Selecciona una fecha para iniciar el sorteo.";
            return;
        }

        if (diferencia <= 0) {
            contador.innerHTML = "¡Sorteo finalizado!";
            return;
        }

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        contador.innerHTML = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
    }

    // Guardar la fecha en localStorage cuando el usuario seleccione una
    inputFecha.addEventListener("change", function () {
        localStorage.setItem("fechaSorteo", inputFecha.value);
        actualizarContador();
    });

    // Actualizar el contador cada segundo
    setInterval(actualizarContador, 1000);
});
