<?php
// Configuración de CORS
header("Access-Control-Allow-Origin: http://localhost:3000"); // Permitir solicitudes desde localhost:3000
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Métodos permitidos
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Encabezados permitidos

// Manejar solicitudes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configuración de la base de datos
$host = 'aws-0-us-east-1.pooler.supabase.com';
$dbname = 'postgres';
$user = 'postgres.wukzuhcyiqzlzowcqsad';
$password = 'sSU2fU3J9cQUOxow';
$port = '6543';

// Crear conexión con PDO
try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

// Manejar solicitudes
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener productos
    try {
        $stmt = $pdo->query("SELECT * FROM productos");
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        header('Content-Type: application/json');
        echo json_encode($productos);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al obtener productos: ' . $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Insertar producto
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['nombre'], $input['precio'], $input['categoria'], $input['imagen'])) {
        http_response_code(400);
        echo json_encode(["error" => "Todos los campos son obligatorios"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO productos (nombre, precio, descuento, categoria, imagen) VALUES (:nombre, :precio, :descuento, :categoria, :imagen)");
        $stmt->execute([
            ':nombre' => $input['nombre'],
            ':precio' => $input['precio'],
            ':descuento' => $input['descuento'] ?? 0,
            ':categoria' => $input['categoria'],
            ':imagen' => $input['imagen']
        ]);
        http_response_code(201);
        echo json_encode(["message" => "Producto agregado exitosamente"]);
    } catch (PDOException $e) {
        error_log("Error al insertar producto: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error al insertar producto: ' . $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
?>