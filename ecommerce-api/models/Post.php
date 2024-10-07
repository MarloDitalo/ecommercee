<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class Post
{
    protected $gm, $pdo, $get;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->gm = new GlobalMethods($pdo);
        $this->get = new Get($pdo);
    }

    public function uploadProduct()
    {
        header('Content-Type: application/json');

        try {
            if (empty($_FILES['image']) || empty($_POST['name']) || empty($_POST['price']) || empty($_POST['description'])) {
                throw new Exception("Missing required parameters.");
            }

            $file = $_FILES['image'];
            $name = trim($_POST['name']);
            $price = trim($_POST['price']);
            $description = trim($_POST['description']);

            // Debugging file info
            error_log(print_r($file, true));
            error_log("Name: " . $name);
            error_log("Price: " . $price);
            error_log("Description: " . $description);

            if ($file['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("Error uploading file: " . $file['error']);
            }

            $maxFileSize = 20 * 1024 * 1024;
            if ($file['size'] > $maxFileSize) {
                throw new Exception("File size exceeds 20 MB.");
            }

            $validImageTypes = ['image/jpeg', 'image/png'];
            if (!in_array($file['type'], $validImageTypes)) {
                throw new Exception("Only JPG, JPEG, PNG files are allowed.");
            }

            $uniqueFileName = uniqid() . '_' . basename($file['name']);
            $targetDir = "uploads/";
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
            $targetFile = $targetDir . $uniqueFileName;

            if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
                throw new Exception("Error moving uploaded file.");
            }

            chmod($targetFile, 0644);

            $insertData = [
                'file_name' => $uniqueFileName,
                'file_type' => $file['type'],
                'file_size' => $file['size'],
                'uploaded_at' => date('Y-m-d H:i:s'),
                'name' => $name,
                'price' => $price,
                'description' => $description
            ];

            $stmt = $this->pdo->prepare("INSERT INTO products (file_name, file_type, file_size, uploaded_at, name, price, description) VALUES (:file_name, :file_type, :file_size, :uploaded_at, :name, :price, :description)");
            $stmt->execute($insertData);

            $response = [
                "code" => 200,
                "message" => "The file {$uniqueFileName} has been uploaded and saved in the database."
            ];

            echo json_encode($response);
            exit;
        } catch (Exception $e) {
            error_log("Upload Product Error: " . $e->getMessage(), 3, __DIR__ . '/error.log');

            $response = [
                "code" => 500,
                "message" => "Error uploading image: " . $e->getMessage()
            ];

            echo json_encode($response);
            exit;
        }
    }

    public function deleteProduct($data)
    {
        header('Content-Type: application/json');

        try {
            if (empty($data->id)) {
                throw new Exception("ID parameter is required.");
            }

            $id = (int)$data->id; // Ensure ID is an integer

            // Prepare SQL statement to delete the product by ID
            $stmt = $this->pdo->prepare("DELETE FROM products WHERE id = :id");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            // Check if the delete was successful
            if ($stmt->rowCount() > 0) {
                $response = [
                    "code" => 200,
                    "message" => "Product deleted successfully."
                ];
            } else {
                $response = [
                    "code" => 404,
                    "message" => "Product not found."
                ];
            }

            echo json_encode($response);
            exit;
        } catch (Exception $e) {
            // Log error details to a file
            error_log($e->getMessage(), 3, __DIR__ . '/error.log');

            // Prepare error response
            $response = [
                "code" => 500,
                "message" => "Error deleting product: " . $e->getMessage()
            ];

            echo json_encode($response);
            exit;
        }
    }
    public function orderProduct($data)
    {
        header('Content-Type: application/json');

        try {
            // Log the incoming data for debugging
            error_log("Received order data: " . print_r($data, true));

            // Validate required fields
            // if (empty($data->userId)) {
            //     throw new Exception("Missing required parameter: userId");
            // }
            if (empty($data->items) || !is_array($data->items)) {
                throw new Exception("Missing or invalid items array");
            }
            // if (!isset($data->totalAmount)) {
            //     throw new Exception("Missing required parameter: totalAmount");
            // }

            // Validate product IDs and quantities
            foreach ($data->items as $item) {
                if (empty($item->productId) || empty($item->quantity)) {
                    throw new Exception("Missing productId or quantity in items array");
                }
                if (!is_numeric($item->quantity) || $item->quantity <= 0) {
                    throw new Exception("Quantity must be a positive number");
                }
            }

            // Insert the order into the database
            $orderStmt = $this->pdo->prepare("INSERT INTO orders (user_id, total_amount) VALUES (:userId, :totalAmount)");
            $orderStmt->execute([
                ':userId' => $data->userId,
                ':totalAmount' => $data->totalAmount,
            ]);
            $orderId = $this->pdo->lastInsertId(); // Get the last inserted order ID

            // Insert each item into the order_items table
            $orderItemStmt = $this->pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity) VALUES (:orderId, :productId, :quantity)");
            foreach ($data->items as $item) {
                $orderItemStmt->execute([
                    ':orderId' => $orderId,
                    ':productId' => $item->productId,
                    ':quantity' => $item->quantity,
                ]);
            }

            // Return success response
            $response = [
                "code" => 200,
                "message" => "Order placed successfully",
                "orderId" => $orderId
            ];
            echo json_encode($response);
            exit;
        } catch (Exception $e) {
            // Enhanced error logging
            // error_log("Order placement error: " . $e->getMessage() . " | Data: " . print_r($data, true));
            // $response = [
            //     "code" => 500,
            //     "message" => "Error placing order: " . $e->getMessage()
            // ];
            // echo json_encode($response);
            exit;
        }
    }

//     public function addToCart($data)
// {
//     header('Content-Type: application/json');

//     try {
//         // Log the incoming data for debugging
//         error_log("Received add to cart data: " . print_r($data, true));

//         // Validate required fields
//         if (empty($data->userId)) {
//             throw new Exception("Missing required parameter: userId");
//         }
//         if (empty($data->productId)) {
//             throw new Exception("Missing required parameter: productId");
//         }
//         if (!isset($data->quantity) || !is_numeric($data->quantity) || $data->quantity <= 0) {
//             throw new Exception("Quantity must be a positive number");
//         }

//         // Check if the product already exists in the cart for the user
//         $stmt = $this->pdo->prepare("SELECT id FROM cart WHERE user_id = :userId AND product_id = :productId");
//         $stmt->execute([
//             ':userId' => $data->userId,
//             ':productId' => $data->productId,
//         ]);
//         $existingItem = $stmt->fetch();

//         if ($existingItem) {
//             // Update the quantity if the item already exists
//             $updateStmt = $this->pdo->prepare("UPDATE cart SET quantity = quantity + :quantity WHERE id = :id");
//             $updateStmt->execute([
//                 ':quantity' => $data->quantity,
//                 ':id' => $existingItem['id'],
//             ]);
//             $response = [
//                 "code" => 200,
//                 "message" => "Cart updated successfully"
//             ];
//         } else {
//             // Insert a new item into the cart
//             $insertStmt = $this->pdo->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (:userId, :productId, :quantity)");
//             $insertStmt->execute([
//                 ':userId' => $data->userId,
//                 ':productId' => $data->productId,
//                 ':quantity' => $data->quantity,
//             ]);
//             $response = [
//                 "code" => 200,
//                 "message" => "Item added to cart successfully"
//             ];
//         }

//         echo json_encode($response);
//         exit;
//     } catch (Exception $e) {
//         error_log("Add to cart error: " . $e->getMessage() . " | Data: " . print_r($data, true));
//         $response = [
//             "code" => 500,
//             "message" => "Error adding item to cart: " . $e->getMessage()
//         ];
//         echo json_encode($response);
//         exit;
//     }
// }

// public function getCartItems($userId)
// {
//     header('Content-Type: application/json');

//     try {
//         // Validate required field
//         if (empty($userId)) {
//             throw new Exception("Missing required parameter: userId");
//         }

//         // Fetch cart items for the user
//         $stmt = $this->pdo->prepare("SELECT c.id, c.product_id, c.quantity, p.name, p.price 
//                                       FROM cart c 
//                                       JOIN products p ON c.product_id = p.id 
//                                       WHERE c.user_id = :userId");
//         $stmt->execute([':userId' => $userId]);
//         $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

//         // Return success response
//         $response = [
//             "code" => 200,
//             "items" => $cartItems
//         ];
//         echo json_encode($response);
//         exit;
//     } catch (Exception $e) {
//         error_log("Get cart items error: " . $e->getMessage());
//         $response = [
//             "code" => 500,
//             "message" => "Error retrieving cart items: " . $e->getMessage()
//         ];
//         echo json_encode($response);
//         exit;
//     }
// }


}
