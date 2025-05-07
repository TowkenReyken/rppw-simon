<?php
// Configuración de CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $searchQuery = $_GET['q'] ?? ''; // Obtener el término de búsqueda (si existe)

    try {
        if (!empty($searchQuery)) {
            // Filtrar productos por nombre o categoría
            $stmt = $pdo->prepare("
                SELECT p.id, p.nombre, p.precio, p.descuento, p.stock, p.imagen, c.nombre AS categoria
                FROM productos p
                INNER JOIN categoria c ON p.categoria_id = c.id
                WHERE LOWER(p.nombre) LIKE LOWER(:searchQuery) OR LOWER(c.nombre) LIKE LOWER(:searchQuery)
            ");
            $stmt->execute([':searchQuery' => '%' . $searchQuery . '%']);
        } else {
            // Obtener todos los productos si no hay búsqueda
            $stmt = $pdo->query("
                SELECT p.id, p.nombre, p.precio, p.descuento, p.stock, p.imagen, c.nombre AS categoria
                FROM productos p
                INNER JOIN categoria c ON p.categoria_id = c.id
            ");
        }

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
            RETURNING id, nombre, precio, descuento, stock, imagen, (SELECT nombre FROM categoria WHERE id = :categoria_id) AS categoria
        ");
        $stmt->execute([
            ':nombre' => $input['nombre'],
            ':precio' => (float)$input['precio'],
            ':descuento' => (int)($input['descuento'] ?? 0),
            ':stock' => (int)$input['stock'],
            ':categoria_id' => (int)$input['categoria_id'],
            ':imagen' => $input['imagen']
        ]);
        
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);
        http_response_code(201);
        echo json_encode($producto);
    } catch (PDOException $e) {
        error_log("Error al insertar producto: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error al insertar producto: ' . $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Actualizar producto
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['id'], $input['nombre'], $input['precio'], $input['categoria_id'], $input['imagen'], $input['stock'])) {
        http_response_code(400);
        echo json_encode(["error" => "Todos los campos son obligatorios"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE productos
            SET nombre = :nombre, precio = :precio, descuento = :descuento, stock = :stock, categoria_id = :categoria_id, imagen = :imagen
            WHERE id = :id
            RETURNING id, nombre, precio, descuento, stock, imagen, (SELECT nombre FROM categoria WHERE id = :categoria_id) AS categoria
        ");
        $stmt->execute([
            ':id' => (int)$input['id'],
            ':nombre' => $input['nombre'],
            ':precio' => (float)$input['precio'],
            ':descuento' => (int)($input['descuento'] ?? 0),
            ':stock' => (int)$input['stock'],
            ':categoria_id' => (int)$input['categoria_id'],
            ':imagen' => $input['imagen']
        ]);
        
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$producto) {
            http_response_code(404);
            echo json_encode(["error" => "Producto no encontrado"]);
            exit;
        }
        
        http_response_code(200);
        echo json_encode($producto);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al actualizar producto: ' . $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Eliminar producto
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID del producto es obligatorio"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM productos WHERE id = :id");
        $stmt->execute([':id' => $id]);
        http_response_code(200);
        echo json_encode(["message" => "Producto eliminado exitosamente"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al eliminar producto: ' . $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $searchQuery = $_GET['q'] ?? ''; // Obtener el término de búsqueda (si existe)

    try {
        if (!empty($searchQuery)) {
            // Filtrar productos por nombre o categoría
            $stmt = $pdo->prepare("
                SELECT p.id, p.nombre, p.precio, p.descuento, p.stock, p.imagen, c.nombre AS categoria
                FROM productos p
                INNER JOIN categoria c ON p.categoria_id = c.id
                WHERE p.nombre ILIKE :searchQuery OR c.nombre ILIKE :searchQuery
            ");
            $stmt->execute([':searchQuery' => '%' . $searchQuery . '%']);
        } else {
            // Obtener todos los productos si no hay búsqueda
            $stmt = $pdo->query("
                SELECT p.id, p.nombre, p.precio, p.descuento, p.stock, p.imagen, c.nombre AS categoria
                FROM productos p
                INNER JOIN categoria c ON p.categoria_id = c.id
            ");
        }

        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        header('Content-Type: application/json');
        echo json_encode($productos);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al obtener productos: ' . $e->getMessage()]);
    }
    exit;
}

// Si el método no está permitido
http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
?>