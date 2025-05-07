document.getElementById("formContacto").addEventListener("submit", async function(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const asunto = document.getElementById("asunto").value;
    const mensaje = document.getElementById("mensaje").value;

    try {
        const response = await fetch("/api/contacto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, asunto, mensaje })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Gracias por contactarnos. Hemos recibido tu mensaje.");
            document.getElementById("formContacto").reset();
        } else {
            alert(result.error || "Error al enviar el mensaje.");
        }
    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        alert("Ocurrió un error al enviar el mensaje.");
    }
});