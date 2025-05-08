document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const toggleToRegister = document.getElementById("toggleForm");
    const toggleToLogin = document.getElementById("toggleFormBack");
    const formTitle = document.getElementById("form-title");

    // Alternar al formulario de registro
    toggleToRegister.addEventListener("click", function (e) {
        e.preventDefault();
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        formTitle.textContent = "Registrarse";
    });

    // Alternar al formulario de inicio de sesión
    toggleToLogin.addEventListener("click", function (e) {
        e.preventDefault();
        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        formTitle.textContent = "Iniciar Sesión";
    });

    // Manejar el registro
    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                localStorage.setItem("token", result.token); // Guardar el token en localStorage
                document.cookie = `token=${result.token}; path=/`;  // Añade esta línea
                window.location.href = "/"; // Redirigir al inicio
            } else {
                const result = await response.json();
                alert(result.error);
            }
        } catch (error) {
            console.error("Error al registrar:", error);
            alert("Ocurrió un error al registrar.");
        }
    });

    // Manejar el inicio de sesión
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
    
        const correo = document.getElementById("email").value.trim();
        const contrasena = document.getElementById("password").value.trim();
    
        if (!correo || !contrasena) {
            alert("Por favor, ingresa tu correo y contraseña.");
            return;
        }
    
        const data = { correo, contrasena };
    
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                localStorage.setItem("token", result.token);
                document.cookie = `token=${result.token}; path=/`;  // Añade esta línea
                window.location.href = "/productos";
            } else {
                const result = await response.json();
                alert(result.error);
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            alert("Ocurrió un error al iniciar sesión.");
        }
    });
});