document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const formTitle = document.getElementById("form-title");
    const toggleForm = document.getElementById("toggleForm");
    const toggleFormBack = document.getElementById("toggleFormBack");

    toggleForm.addEventListener("click", function (e) {
        e.preventDefault();
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        formTitle.innerText = "Registro";
    });

    toggleFormBack.addEventListener("click", function (e) {
        e.preventDefault();
        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        formTitle.innerText = "Iniciar Sesión";
    });
});
