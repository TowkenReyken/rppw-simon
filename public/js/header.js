document.addEventListener("DOMContentLoaded", () => {
    const userLink = document.getElementById("user-link");
    const userDropdown = document.getElementById("user-dropdown");
    const logoutButton = document.getElementById("logout-button");
    const userStatus = document.getElementById("user-status");

    // Verificar si el usuario está logueado
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar el payload del token
            const userName = payload.nombre || "Usuario"; // Obtener el nombre del usuario del token

            // Mostrar el nombre del usuario junto al punto verde
            userStatus.classList.add("logged-in"); // Mostrar el indicador de estado
            userStatus.textContent = userName; // Agregar el nombre del usuario

            if (payload.rol_id === 2) {
                // Mostrar opciones específicas para administradores
                const adminLink = document.createElement('li');
                adminLink.innerHTML = '<a href="/admin">Panel de Administración</a>';
                userDropdown.insertBefore(adminLink, logoutButton.parentElement);
            }

            userLink.href = "#"; // Deshabilitar el enlace al inicio de sesión
            userDropdown.classList.add("hidden"); // Asegurar que el menú esté cerrado por defecto
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            localStorage.removeItem("token"); // Eliminar el token si es inválido
        }
    } else {
        userDropdown.classList.add("hidden"); // Ocultar el menú desplegable
        userLink.href = "/inicio-registro-sesion"; // Redirigir al inicio de sesión
        userStatus.classList.remove("logged-in"); // Ocultar el indicador de estado
        userStatus.textContent = ""; // Limpiar el texto del estado
    }

    // Mostrar/ocultar el menú desplegable al hacer clic en el ícono de usuario
    userLink.addEventListener("click", (e) => {
        e.preventDefault();
        if (localStorage.getItem("token")) {
            userDropdown.classList.toggle("hidden");
        } else {
            window.location.href = "/inicio-registro-sesion"; // Redirigir al inicio de sesión si no está logueado
        }
    });

    // Manejar el cierre de sesión
    logoutButton?.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token"); // Eliminar el token
        window.location.href = "/"; // Redirigir al menú principal
    });

    const searchIcon = document.getElementById("search-icon");
    const searchBox = document.getElementById("search-box");
    const searchInput = document.getElementById("search-input");

    // Mostrar/ocultar el buscador al hacer clic en el ícono
    searchIcon.addEventListener("click", (e) => {
        e.preventDefault(); // Prevenir el comportamiento predeterminado
        searchBox.classList.toggle("active");
        if (searchBox.classList.contains("active")) {
            searchInput.focus(); // Enfocar el input cuando se muestre
        }
    });

    // Cerrar el buscador si se hace clic fuera de él
    document.addEventListener("click", (e) => {
        if (!searchBox.contains(e.target) && e.target !== searchIcon) {
            searchBox.classList.remove("active");
        }
    });

    // Ocultar el botón de búsqueda en el header si estamos en el apartado de productos
    if (window.location.pathname === "/productos") {
        searchIcon.style.display = "none";
    }

    const menuIcon = document.getElementById("menu-icon");
    const navLinks = document.getElementById("nav-links");

    // Alternar la clase para mostrar/ocultar el menú
    menuIcon.addEventListener("click", () => {
        navLinks.classList.toggle("nav-active");
    });

    // Cerrar el menú si se hace clic fuera de él
    document.addEventListener("click", (e) => {
        if (!navLinks.contains(e.target) && e.target !== menuIcon) {
            navLinks.classList.remove("nav-active");
        }
    });
});