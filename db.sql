-- Main table for all applicant information
CREATE TABLE `channel_partners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_reference_id` VARCHAR(50) UNIQUE,
  `application_date` DATE,
  `application_ref_by` VARCHAR(100),
  `applicant_class` VARCHAR(50),
  `first_name` VARCHAR(100) NOT NULL,
  `middle_name` VARCHAR(100),
  `last_name` VARCHAR(100) NOT NULL,
  `date_of_birth` DATE,
  `age` INT,
  `gender` ENUM('Male', 'Female', 'Other'),
  `aadhar_number` VARCHAR(20) UNIQUE,
  `pan_card_number` VARCHAR(10) UNIQUE,
  `mobile_number` VARCHAR(15) NOT NULL UNIQUE,
  `email_id` VARCHAR(255) UNIQUE,
  `marital_status` ENUM('Single', 'Married', 'Divorced', 'Widowed'),
  `spouse_name` VARCHAR(200),
  `mother_name` VARCHAR(200),
  `education` VARCHAR(100),
  `occupation` VARCHAR(100),
  `applicant_photo_url` VARCHAR(255),
  `current_address` TEXT,
  `current_pincode` VARCHAR(10),
  `current_state` VARCHAR(100),
  `current_district` VARCHAR(100),
  `current_city` VARCHAR(100),
  `permanent_address` TEXT,
  `permanent_pincode` VARCHAR(10),
  `permanent_state` VARCHAR(100),
  `permanent_district` VARCHAR(100),
  `permanent_city` VARCHAR(100),
  `bank_name` VARCHAR(100),
  `account_holder_name` VARCHAR(200),
  `bank_account_number` VARCHAR(50),
  `ifsc_code` VARCHAR(20),
  `branch_name` VARCHAR(100),
  `bank_account_type` ENUM('Saving', 'Current'),

  -- NEW: Section-wise status tracking
  `applicant_details_status` ENUM('Approved', 'Rejected', 'Pending') DEFAULT 'Pending',
  `current_address_status` ENUM('Approved', 'Rejected', 'Pending') DEFAULT 'Pending',
  `permanent_address_status` ENUM('Approved', 'Rejected', 'Pending') DEFAULT 'Pending',
  `kyc_documents_status` ENUM('Approved', 'Rejected', 'Pending') DEFAULT 'Pending',
  `banking_details_status` ENUM('Approved', 'Rejected', 'Pending') DEFAULT 'Pending',

  `applicant_details_reason` TEXT,
  `current_address_reason` TEXT,
  `permanent_address_reason` TEXT,
  `kyc_documents_reason` TEXT,
  `banking_details_reason` TEXT,
  
  -- Section 6: Final Authority Decision (Official Use Only)
  `final_decision` ENUM('Approved', 'Rejected', 'Pending') DEFAULT 'Pending',
  `final_decision_reason` TEXT,
  `authorized_person_signature_url` VARCHAR(255),
  `digital_otp` VARCHAR(10),
  
  -- Section 7: Authorized Person Details (Internal Use Only)
  `lc_code` VARCHAR(50),
  `uc_code` VARCHAR(50),
  `authorized_person_name` VARCHAR(200),
  `authorized_person_designation` VARCHAR(100),
  `authorized_person_employee_id` VARCHAR(50),
  `approval_date` DATETIME,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for storing paths to uploaded documents
CREATE TABLE `partner_documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `partner_id` INT NOT NULL,
  `document_proof_type` VARCHAR(100),
  `document_type` VARCHAR(100),
  `document_number` VARCHAR(100),
  `front_side_url` VARCHAR(255),
  `back_side_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`partner_id`) REFERENCES `channel_partners`(`id`) ON DELETE CASCADE
);

