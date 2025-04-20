<?php
// filepath: c:\Users\reyke\OneDrive\Desktop\PPW-SIMON\src\supabase.php

class Supabase {
    private $url;
    private $apiKey;

    public function __construct($url, $apiKey) {
        $this->url = $url;
        $this->apiKey = $apiKey;
    }

    // Método para obtener productos
    public function getProducts() {
        $endpoint = $this->url . "/rest/v1/productos";
        $headers = [
            "apikey: " . $this->apiKey,
            "Authorization: Bearer " . $this->apiKey
        ];

        $ch = curl_init($endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return ["error" => $error];
        }

        return json_decode($response, true);
    }

    // Método para insertar un producto
    public function insertProduct($product) {
        $endpoint = $this->url . "/rest/v1/productos";
        $headers = [
            "Content-Type: application/json",
            "apikey: " . $this->apiKey,
            "Authorization: Bearer " . $this->apiKey
        ];

        $data = json_encode($product);

        $ch = curl_init($endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return ["error" => $error];
        }

        return json_decode($response, true);
    }
}
?>