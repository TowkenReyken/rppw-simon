<?php
// Configuración de CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Manejar solicitudes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configuración de la base de datos usando variables de entorno
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

// Manejar solicitudes
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener productos con sus categorías
    try {
        $stmt = $pdo->query("
            SELECT p.id, p.nombre, p.precio, p.descuento, p.stock, p.imagen, c.nombre AS categoria
            FROM productos p
            INNER JOIN categoria c ON p.categoria_id = c.id
        ");
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

    if (!isset($input['nombre'], $input['precio'], $input['categoria_id'], $input['imagen'], $input['stock'])) {
        http_response_code(400);
        echo json_encode(["error" => "Todos los campos son obligatorios"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO productos (nombre, precio, descuento, stock, categoria_id, imagen)
            VALUES (:nombre, :precio, :descuento, :stock, :categoria_id, :imagen)
        ");
        $stmt->execute([
            ':nombre' => $input['nombre'],
            ':precio' => $input['precio'],
            ':descuento' => $input['descuento'] ?? 0,
            ':stock' => $input['stock'],
            ':categoria_id' => $input['categoria_id'],
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

// Si el método no está permitido
http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
?>