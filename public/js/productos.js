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

// Asegurar que el modal esté oculto al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modalProducto");
    modal.style.display = "none"; // Ocultar el modal al cargar

    // Manejar el envío del formulario
    const form = document.getElementById("formProducto");
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Evitar el comportamiento predeterminado del formulario

        // Obtener los datos del formulario
        const nombre = document.getElementById("nombre").value.trim();
        const precio = parseFloat(document.getElementById("precio").value);
        const descuento = parseInt(document.getElementById("descuento").value) || 0;
        const categoria = document.getElementById("categoria").value.trim();
        const imagen = document.getElementById("imagen").value.trim();

        // Validar los datos
        if (!nombre || !precio || !categoria || !imagen) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        // Crear el objeto del producto
        const producto = { nombre, precio, descuento, categoria, imagen };

        try {
            // Enviar los datos al servidor PHP
            const response = await fetch('http://localhost:3001/src/productos.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(producto),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || "Producto agregado exitosamente.");
                cerrarFormulario();
                location.reload(); // Recargar la página para mostrar el nuevo producto
            } else {
                alert(result.error || "Error al agregar el producto.");
            }
        } catch (error) {
            console.error("Error al enviar el producto:", error);
            alert("Ocurrió un error al agregar el producto.");
        }
    });
});