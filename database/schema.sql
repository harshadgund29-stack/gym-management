-- ============================================================
-- Gym Management System — MySQL Schema
-- Run this script to create the database and all tables.
-- Note: Spring Boot with ddl-auto=update will also create
--       tables automatically, but this script is useful for
--       manual setup or production deployments.
-- ============================================================

CREATE DATABASE IF NOT EXISTS gym_management
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gym_management;

-- ============================================================
-- Table: users
-- Stores all users: admins, trainers, and members
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(100)        NOT NULL,
    last_name   VARCHAR(100)        NOT NULL,
    email       VARCHAR(255)        NOT NULL UNIQUE,
    password    VARCHAR(255)        NOT NULL,   -- BCrypt hash
    role        ENUM('ADMIN','TRAINER','MEMBER') NOT NULL,
    phone       VARCHAR(20),
    address     TEXT,
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- Table: membership_plans
-- Plans that admin creates (Basic, Premium, VIP, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS membership_plans (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(100)   NOT NULL UNIQUE,
    description      TEXT,
    price            DECIMAL(10,2)  NOT NULL,
    duration_months  INT            NOT NULL,
    features         TEXT,
    active           BOOLEAN        NOT NULL DEFAULT TRUE
);

-- ============================================================
-- Table: memberships
-- Links a member to a plan with start/end dates
-- ============================================================
CREATE TABLE IF NOT EXISTS memberships (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id   BIGINT          NOT NULL,
    plan_id     BIGINT          NOT NULL,
    start_date  DATE            NOT NULL,
    end_date    DATE            NOT NULL,
    status      ENUM('ACTIVE','EXPIRED','CANCELLED','PENDING') NOT NULL DEFAULT 'ACTIVE',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id)   REFERENCES membership_plans(id) ON DELETE RESTRICT
);

-- ============================================================
-- Table: payments
-- Records every payment transaction
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id       BIGINT          NOT NULL,
    membership_id   BIGINT          NOT NULL,
    amount          DECIMAL(10,2)   NOT NULL,
    status          ENUM('COMPLETED','PENDING','FAILED','REFUNDED') NOT NULL DEFAULT 'COMPLETED',
    payment_method  ENUM('CASH','CREDIT_CARD','DEBIT_CARD','ONLINE'),
    transaction_id  VARCHAR(100),
    payment_date    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id)     REFERENCES users(id)        ON DELETE CASCADE,
    FOREIGN KEY (membership_id) REFERENCES memberships(id)  ON DELETE CASCADE
);

-- ============================================================
-- Table: training_sessions
-- Scheduled sessions between a trainer and a member
-- ============================================================
CREATE TABLE IF NOT EXISTS training_sessions (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    trainer_id       BIGINT          NOT NULL,
    member_id        BIGINT          NOT NULL,
    title            VARCHAR(200)    NOT NULL,
    description      TEXT,
    session_date     DATETIME        NOT NULL,
    duration_minutes INT,
    status           ENUM('SCHEDULED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    notes            TEXT,
    created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id)  REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Table: workout_plans
-- Workout plans created by trainers for members
-- ============================================================
CREATE TABLE IF NOT EXISTS workout_plans (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    trainer_id    BIGINT          NOT NULL,
    member_id     BIGINT          NOT NULL,
    title         VARCHAR(200)    NOT NULL,
    description   TEXT,
    exercises     TEXT,
    goal          VARCHAR(200),
    week_duration INT,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id)  REFERENCES users(id) ON DELETE CASCADE
);
