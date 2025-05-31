CREATE TABLE `user` (
  `user_id` varchar(20) NOT NULL,
  `nickname` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `book` (
  `book_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `author` varchar(50) DEFAULT NULL,
  `genre` varchar(20) DEFAULT NULL,
  `publisher` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`book_id`),
  UNIQUE KEY `isbn` (`isbn`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `book_review` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) NOT NULL,
  `book_id` int NOT NULL,
  `content` text,
  `rating` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `user_id` (`user_id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `book_review_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `book_review_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `book` (`book_id`),
  CONSTRAINT `book_review_chk_1` CHECK ((`rating` between 0 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `community_comment` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) NOT NULL,
  `post_id` int NOT NULL,
  `content` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `user_id` (`user_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `community_comment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `community_comment_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `community_post` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `community_post` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) NOT NULL,
  `title` varchar(100) NOT NULL,
  `content` text,
  `view_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `community_post_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `favorite_library` (
  `user_id` varchar(20) NOT NULL,
  `library_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`library_id`),
  KEY `library_id` (`library_id`),
  CONSTRAINT `favorite_library_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `favorite_library_ibfk_2` FOREIGN KEY (`library_id`) REFERENCES `library` (`library_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `image` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `image_url` varchar(225) NOT NULL,
  PRIMARY KEY (`image_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `image_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `community_post` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `library` (
  `library_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `address` varchar(100) NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`library_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `library_book_inventory` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `book_id` int NOT NULL,
  `library_id` int NOT NULL,
  `storage_status` varchar(50) NOT NULL,
  `loan_status` varchar(20) NOT NULL,
  PRIMARY KEY (`inventory_id`),
  KEY `book_id` (`book_id`),
  KEY `library_id` (`library_id`),
  CONSTRAINT `library_book_inventory_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `book` (`book_id`),
  CONSTRAINT `library_book_inventory_ibfk_2` FOREIGN KEY (`library_id`) REFERENCES `library` (`library_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `library_review` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) NOT NULL,
  `library_id` int NOT NULL,
  `content` text,
  `rating` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `user_id` (`user_id`),
  KEY `library_id` (`library_id`),
  CONSTRAINT `library_review_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `library_review_ibfk_2` FOREIGN KEY (`library_id`) REFERENCES `library` (`library_id`),
  CONSTRAINT `library_review_chk_1` CHECK ((`rating` between 0 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `preferred_region` (
  `region_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) NOT NULL,
  `region_level1` varchar(20) DEFAULT NULL,
  `region_level2` varchar(20) DEFAULT NULL,
  `region_level3` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`region_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `preferred_region_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
