<?php
// filepath: c:\Users\reyke\OneDrive\Desktop\PPW-SIMON\src\conexion_test.php

// Configuración de la base de datos
$host = 'aws-0-us-east-1.pooler.supabase.com';
$dbname = 'postgres';
$user = 'postgres.wukzuhcyiqzlzowcqsad';
$password = 'sSU2fU3J9cQUOxow';
$port = '6543';

try {
    // Crear conexión con PDO
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Ejecutar una consulta simple
    $stmt = $pdo->query("SELECT 1");
    $result = $stmt->fetch();

    // Si la consulta se ejecuta correctamente
    echo json_encode(["message" => "Conexión exitosa a la base de datos", "result" => $result]);
} catch (PDOException $e) {
    // Si ocurre un error en la conexión
    echo json_encode(["error" => "Error de conexión: " . $e->getMessage()]);
}
?>