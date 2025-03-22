document.getElementById("formContacto").addEventListener("submit", function(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const asunto = document.getElementById("asunto").value;
    const mensaje = document.getElementById("mensaje").value;

    // Aquí puedes agregar la lógica para enviar el formulario, por ejemplo, usando fetch para enviar los datos a tu servidor
    console.log("Formulario enviado:", { nombre, email, asunto, mensaje });

    // Mostrar un mensaje de éxito o redirigir a otra página
    alert("Gracias por contactarnos. Hemos recibido tu mensaje.");
    document.getElementById("formContacto").reset();
});