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
document.getElementById("formProducto").addEventListener("submit", async function (event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const nombre = document.getElementById("nombre").value;
    const precio = document.getElementById("precio").value;
    const descuento = document.getElementById("descuento").value || 0;
    const categoria = document.getElementById("categoria").value;
    const imagen = document.getElementById("imagen").value;

    const producto = { nombre, precio, descuento, categoria, imagen };

    try {
        const response = await fetch("http://localhost:3000/api/productos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(producto)
        });

        const data = await response.json();
        alert(data.message);

        cerrarFormulario();
        document.getElementById("formProducto").reset();
        // Recargar la lista de productos para incluir el nuevo
        cargarProductos();
    } catch (error) {
        console.error("❌ Error al enviar datos:", error);
        alert("Hubo un error al guardar el producto");
    }
});

// Asegurar que el modal esté oculto al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modalProducto");
    modal.style.display = "none"; // Ocultar el modal al cargar
});
