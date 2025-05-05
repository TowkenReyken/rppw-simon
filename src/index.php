<?php
// Incluir los archivos que ya tienes
include 'supabase.php';
include 'productos.php';
include 'categorias.php';

// Lógica básica de ruteo (opcional)
$request_uri = $_SERVER['REQUEST_URI'];

if (strpos($request_uri, 'productos') !== false) {
    include 'productos.php';
} elseif (strpos($request_uri, 'categorias') !== false) {
    include 'categorias.php';
} else {
    // Si no se encuentra, se puede manejar como una página por defecto o un error
    echo "Página no encontrada";
}
?>