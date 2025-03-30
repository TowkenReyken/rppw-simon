// Funciones para abrir y cerrar el formulario de agregar producto
function abrirFormulario() {
    document.getElementById("modalProducto").style.display = "block";
}

function cerrarFormulario() {
    document.getElementById("modalProducto").style.display = "none";
}

// Ejemplo: Capturar el envío del formulario
document.getElementById("formProducto").addEventListener("submit", function(e) {
    e.preventDefault();
    // Lógica para agregar el producto (aquí se podría integrar con una base de datos)
    alert("Producto agregado (simulación).");
    cerrarFormulario();
});
