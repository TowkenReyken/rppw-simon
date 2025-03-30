// Abrir el formulario modal
function abrirFormulario() {
    const modal = document.getElementById("modalProducto");
    modal.style.display = "flex";
}

// Cerrar el formulario modal
function cerrarFormulario() {
    const modal = document.getElementById("modalProducto");
    modal.style.display = "none";
}

// Cerrar el modal al hacer clic fuera del contenido
window.onclick = function (event) {
    const modal = document.getElementById("modalProducto");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Manejar el envío del formulario
document.getElementById("formProducto").addEventListener("submit", function (event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const nombre = document.getElementById("nombre").value;
    const precio = document.getElementById("precio").value;
    const descuento = document.getElementById("descuento").value;
    const categoria = document.getElementById("categoria").value;
    const imagen = document.getElementById("imagen").value;

    // Aquí puedes agregar la lógica para guardar el producto
    console.log({
        nombre,
        precio,
        descuento,
        categoria,
        imagen,
    });

    // Cerrar el formulario después de guardar
    cerrarFormulario();
});

// Asegúrate de que el modal esté oculto al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modalProducto");
    modal.style.display = "none"; // Ocultar el modal al cargar
});