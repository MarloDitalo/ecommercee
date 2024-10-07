<?php
require_once __DIR__ . '/config/Config.php';

// Allow CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit;
}

// Initialize database connection and classes
try {
    $db = new Connection();
    $pdo = $db->connect();
    $gm = new GlobalMethods($pdo);
    $post = new Post($pdo);
    $get = new Get($pdo);
    $auth = new Auth($pdo);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection error: " . $e->getMessage()]);
    exit;
}

// Parse the request URL
$request = isset($_REQUEST['request']) ? rtrim($_REQUEST['request'], '/') : 'errorcatcher';
$req = explode('/', $request);

$data = json_decode(file_get_contents('php://input'));

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        switch ($req[0]) {
            case 'signup':
                if ($data) {
                    echo json_encode($auth->signup($data), JSON_PRETTY_PRINT);
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Missing signup data"]);
                }
                break;

            case 'login':
                if ($data) {
                    echo json_encode($auth->login($data), JSON_PRETTY_PRINT);
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Missing login data"]);
                }
                break;

            case 'deleteProduct':
                if ($data) {
                    echo json_encode($post->deleteProduct($data), JSON_PRETTY_PRINT);
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Missing delete data"]);
                }
                break;

            case 'uploadProduct':
                if (isset($_FILES['image']) || $data) {
                    echo json_encode($post->uploadProduct(), JSON_PRETTY_PRINT); // Note: uploadProduct might not use $data
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Missing upload product data"]);
                }
                break;

            case 'orderProduct':
                if ($data) {
                    echo json_encode($post->orderProduct($data), JSON_PRETTY_PRINT);
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Missing order data"]);
                }
                break;

            // case 'addToCart':
            //     if ($data) {
            //         echo json_encode($post->addToCart($data), JSON_PRETTY_PRINT);
            //     } else {
            //         http_response_code(400);
            //         echo json_encode(["error" => "Missing cart data"]);
            //     }
            //     break;

            // case 'getCartItems':
            //     if (!empty($data->userId)) {
            //         echo json_encode($post->getCartItems($data->userId), JSON_PRETTY_PRINT);
            //     } else {
            //         http_response_code(400);
            //         echo json_encode(["error" => "Missing user ID"]);
            //     }
            //     break;



            default:
                http_response_code(404);
                echo json_encode(["error" => "Invalid POST request"]);
                break;
        }
        break;

    case 'GET':
        switch ($req[0]) {

            case 'getProducts':
                echo json_encode($get->getProducts(), JSON_PRETTY_PRINT);
                break;

            default:
                http_response_code(404);
                echo json_encode(["error" => "Invalid GET request"]);
                break;
        }
        break;

    default:
        http_response_code(403);
        echo json_encode(["error" => "Forbidden request"]);
        break;
}
