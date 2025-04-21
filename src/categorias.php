<?php
// Configuración de CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Configuración de la base de datos
$host = getenv('host') ?: 'aws-0-us-east-1.pooler.supabase.com';
$dbname = getenv('dbname') ?: 'postgres';
$user = getenv('user') ?: 'postgres.wukzuhcyiqzlzowcqsad';
$password = getenv('password') ?: 'sSU2fU3J9cQUOxow';
$port = getenv('db_port') ?: '6543';

// Crear conexión con PDO
try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

// Obtener categorías
try {
    $stmt = $pdo->query("SELECT id, nombre FROM categoria");
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    header('Content-Type: application/json');
    echo json_encode($categorias);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener categorías: ' . $e->getMessage()]);
}
?>