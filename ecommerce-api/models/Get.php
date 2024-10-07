<?php


class Get {
    protected $gm, $pdo;

    public function __construct(\PDO $pdo) {
        $this->pdo = $pdo;
        $this->gm = new GlobalMethods($pdo);
    }

        // Method to get all images
		public function getImages() {
			$sql = "SELECT * FROM images ORDER BY uploaded_at DESC"; // Adjust query as needed
	
			$res = $this->gm->generalQuery($sql, "No images found.");
			if ($res['code'] == 200) {
				return $res['data']; // Return the fetched images data
			} else {
				return []; // Return an empty array if no images found or error occurred
			}
		}

		public function getProducts() {
			$sql = "SELECT * FROM products ORDER BY uploaded_at DESC";
			$res = $this->gm->generalQuery($sql, "No products found.");
		
			if ($res['code'] == 200) {
				return ['code' => 200, 'data' => $res['data']];
			} else {
				return ['code' => 404, 'message' => 'No products found.'];
			}
		}
		// public function getSoldProducts() {
		// 	$sql = "SELECT * FROM order_items ORDER BY order_item_id DESC";
		// 	$res = $this->gm->generalQuery($sql, "No products found.");
			
		// 	if ($res['code'] == 200) {
		// 		return ['code' => 200, 'data' => $res['data']];
		// 	} else {
		// 		return ['code' => 404, 'message' => 'No products found.'];
		// 	}
		// }
		public function getSoldProducts() {
			$sql = "
				SELECT 
					product_id, 
					SUM(quantity) as sold 
				FROM 
					order_items 
				GROUP BY 
					product_id 
				ORDER BY 
					sold DESC";
		
			$res = $this->gm->generalQuery($sql, "No products found.");
		
			if ($res['code'] == 200) {
				return ['code' => 200, 'data' => $res['data']];
			} else {
				return ['code' => 404, 'message' => 'No products found.'];
			}
		}
		
		
		

		// public function getMostSoldProducts() {
		// 	$sql = "SELECT p.*, SUM(oi.quantity) as sold
		// 			FROM products p
		// 			JOIN order_items oi ON p.id = oi.product_id
		// 			GROUP BY p.id
		// 			ORDER BY sold DESC";
		// 	$res = $this->gm->generalQuery($sql, "No products found.");
	
		// 	if ($res['code'] == 200) {
		// 		return ['code' => 200, 'data' => $res['data']];
		// 	} else {
		// 		return ['code' => 404, 'message' => 'No products found.'];
		// 	}
		// }

}