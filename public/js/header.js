document.getElementById("menu-icon").addEventListener("click", function() {
    const nav = document.querySelector("header nav");
    nav.classList.toggle("nav-active");
});

document.getElementById("search-icon").addEventListener("click", function() {
    const searchBox = document.getElementById("search-box");
    searchBox.style.display = searchBox.style.display === "block" ? "none" : "block";
});