<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

	class Auth {
		protected $gm;
		protected $pdo;
    

		public function __construct(\PDO $pdo) {
			$this->gm = new GlobalMethods($pdo);
			$this->pdo = $pdo;
		}
		
	
		protected function generateHeader() {
			$h=[
				"typ"=>"JWT",
				"alg"=>'HS256',
				"app"=>"Ecommerce",
				"dev"=>"Marlo"
			];
			return str_replace(['+','/','='],['-','_',''], base64_encode(json_encode($h)));
		}

		protected function generatePayload($uid, $un, $fn) {
			$p = [   
				'uid'=>$uid,
				'un'=>$un,
				'fn'=>$fn,
				'iby'=>'Marlo',
				'ie'=>'',
				'idate'=>date_create()
			];
			return str_replace(['+','/','='],['-','_',''], base64_encode(json_encode($p)));
		}

		protected function generateToken($userid, $uname, $fullname) {
			$header = $this->generateHeader();
			$payload = $this->generatePayload($userid, $uname, $fullname);
			$signature = hash_hmac('sha256', "$header.$payload", "www.gordoncollege.edu.ph");
			return str_replace(['+','/','='],['-','_',''], base64_encode($signature));
		}

		public function encrypt_password($pword) {
			$hashFormat="$2y$10$";
		    $saltLength=22;
		    $salt=$this->generate_salt($saltLength);
		    return crypt($pword,$hashFormat.$salt);
		}


        protected function generate_salt($len) {
			$urs=md5(uniqid(mt_rand(), true));
	    $b64String=base64_encode($urs);
	    $mb64String=str_replace('+','.', $b64String);
	    return substr($mb64String,0,$len);
		}

        public function pword_check($pword, $existingHash) {
			$hash=crypt($pword, $existingHash);
			if($hash===$existingHash){
				return true;
			}
			return false;
		}


		public function signup($dt) {
			$payload = "";
			$remarks = "";
			$message = "";
			
			// Extracting user inputs from $dt object
			$username = $dt->username;
			$email = $dt->email;
			$password = $dt->password;
		
			// Encrypting password
			$encryptedPassword = $this->encrypt_password($password);
		
		
			// Creating payload with user inputs
			$payload = array(
				'username' => $username,
				'password' => $encryptedPassword,
			);
		
			// SQL query to insert user data into database
			$sql = "INSERT INTO users(username, email, password) 
					VALUES ('$username', '$email', '$encryptedPassword')";
		
			$data = array(); 
			$code = 0; 
			$errmsg = "";
		
			try {
				// Execute SQL query
				if ($this->pdo->query($sql)) {
					$code = 200; 
					$message = "Successfully Registered User"; 
					$remarks = "success";
					return array("code" => 200, "remarks" => "success");
				}
			} catch (\PDOException $e) {
				$errmsg = $e->getMessage();
				$code = 403;
			}
		
			// Return response
			return $this->gm->sendPayload($payload, $remarks, $message, $code);                
		}


		public function login($dt) {
			$payload = $dt;
			$email = $dt->email;
			$password = $dt->password;
			$payload = "";
			$remarks = "";
			$message = "";
			$code = 0;
		
			// Check if the user exists
			$sql = "SELECT * FROM users WHERE email='$email' LIMIT 1";
			$res = $this->gm->generalQuery($sql, "Incorrect username or password");
			if ($res['code'] == 200) {
				$user = $res['data'][0];
				$user_id = $user['user_id'];
				$username = $user['username'];
				$is_seller = $user['is_seller']; // Fetching is_seller
		
				if ($this->pword_check($password, $user['password'])) {
					$code = 200;
					$remarks = "success";
					$message = "Logged in successfully";
					$payload = array("user_id" => $user_id, "email" => $email, "username" => $username, "is_seller" => $is_seller);
				} else {
					$payload = null;
					$remarks = "failed";
					$message = "Incorrect username or password";
				}
			} else {
				$payload = null;
				$remarks = "failed";
				$message = "Incorrect username or password";
			}
			return $this->gm->sendPayload($payload, $remarks, $message, $code);
		}
		

		
    }
?>