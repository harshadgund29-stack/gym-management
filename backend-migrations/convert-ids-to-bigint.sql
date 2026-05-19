-- =============================================================================
-- Migration: convert-ids-to-bigint.sql
-- Purpose:   Ensure all primary key and foreign key columns use BIGINT
-- Applies to: MySQL (primary) and PostgreSQL (secondary variant)
-- Runbook:
--   1. BACKUP your database before running this script.
--   2. Run on staging first and execute acceptance tests.
--   3. Schedule a maintenance window for production.
--   4. Run on production during the maintenance window.
--   5. Verify acceptance tests pass on production.
--   6. Keep rollback script ready (see ROLLBACK section below).
-- =============================================================================

-- ─── MySQL Variant ────────────────────────────────────────────────────────────

-- Step 1: Drop foreign key constraints that reference the columns being altered
ALTER TABLE password_reset_tokens DROP FOREIGN KEY IF EXISTS fk_prt_user;
ALTER TABLE memberships           DROP FOREIGN KEY IF EXISTS fk_membership_member;
ALTER TABLE memberships           DROP FOREIGN KEY IF EXISTS fk_membership_plan;
ALTER TABLE payments              DROP FOREIGN KEY IF EXISTS fk_payment_member;
ALTER TABLE payments              DROP FOREIGN KEY IF EXISTS fk_payment_membership;
ALTER TABLE training_sessions     DROP FOREIGN KEY IF EXISTS fk_session_trainer;
ALTER TABLE training_sessions     DROP FOREIGN KEY IF EXISTS fk_session_member;
ALTER TABLE workout_plans         DROP FOREIGN KEY IF EXISTS fk_workout_trainer;
ALTER TABLE workout_plans         DROP FOREIGN KEY IF EXISTS fk_workout_member;
ALTER TABLE attendance            DROP FOREIGN KEY IF EXISTS fk_attendance_user;
ALTER TABLE vendors               DROP FOREIGN KEY IF EXISTS fk_vendor_user;

-- Step 2: Alter primary key columns to BIGINT AUTO_INCREMENT
ALTER TABLE users                 MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE membership_plans      MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE memberships           MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE payments              MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE training_sessions     MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE workout_plans         MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE password_reset_tokens MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE attendance            MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE vendors               MODIFY COLUMN v_id          BIGINT NOT NULL AUTO_INCREMENT;

-- Step 3: Alter foreign key columns to BIGINT
ALTER TABLE password_reset_tokens MODIFY COLUMN user_id       BIGINT NOT NULL;
ALTER TABLE memberships           MODIFY COLUMN member_id     BIGINT NOT NULL;
ALTER TABLE memberships           MODIFY COLUMN plan_id       BIGINT NOT NULL;
ALTER TABLE payments              MODIFY COLUMN member_id     BIGINT;
ALTER TABLE payments              MODIFY COLUMN membership_id BIGINT;
ALTER TABLE training_sessions     MODIFY COLUMN trainer_id    BIGINT NOT NULL;
ALTER TABLE training_sessions     MODIFY COLUMN member_id     BIGINT NOT NULL;
ALTER TABLE workout_plans         MODIFY COLUMN trainer_id    BIGINT;
ALTER TABLE workout_plans         MODIFY COLUMN member_id     BIGINT;
ALTER TABLE attendance            MODIFY COLUMN user_id       BIGINT NOT NULL;
ALTER TABLE vendors               MODIFY COLUMN user_id       BIGINT NOT NULL;

-- Step 4: Re-add foreign key constraints
ALTER TABLE password_reset_tokens ADD CONSTRAINT fk_prt_user          FOREIGN KEY (user_id)       REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE memberships           ADD CONSTRAINT fk_membership_member  FOREIGN KEY (member_id)     REFERENCES users(id);
ALTER TABLE memberships           ADD CONSTRAINT fk_membership_plan    FOREIGN KEY (plan_id)       REFERENCES membership_plans(id);
ALTER TABLE payments              ADD CONSTRAINT fk_payment_member     FOREIGN KEY (member_id)     REFERENCES users(id);
ALTER TABLE payments              ADD CONSTRAINT fk_payment_membership FOREIGN KEY (membership_id) REFERENCES memberships(id);
ALTER TABLE training_sessions     ADD CONSTRAINT fk_session_trainer    FOREIGN KEY (trainer_id)    REFERENCES users(id);
ALTER TABLE training_sessions     ADD CONSTRAINT fk_session_member     FOREIGN KEY (member_id)     REFERENCES users(id);
ALTER TABLE workout_plans         ADD CONSTRAINT fk_workout_trainer    FOREIGN KEY (trainer_id)    REFERENCES users(id);
ALTER TABLE workout_plans         ADD CONSTRAINT fk_workout_member     FOREIGN KEY (member_id)     REFERENCES users(id);
ALTER TABLE attendance            ADD CONSTRAINT fk_attendance_user    FOREIGN KEY (user_id)       REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE vendors               ADD CONSTRAINT fk_vendor_user        FOREIGN KEY (user_id)       REFERENCES users(id) ON DELETE CASCADE;


-- ─── PostgreSQL Variant ───────────────────────────────────────────────────────
-- Uncomment and run this block instead of the MySQL block above for PostgreSQL.

/*
ALTER TABLE password_reset_tokens DROP CONSTRAINT IF EXISTS fk_prt_user;
ALTER TABLE memberships           DROP CONSTRAINT IF EXISTS fk_membership_member;
ALTER TABLE memberships           DROP CONSTRAINT IF EXISTS fk_membership_plan;
ALTER TABLE payments              DROP CONSTRAINT IF EXISTS fk_payment_member;
ALTER TABLE payments              DROP CONSTRAINT IF EXISTS fk_payment_membership;
ALTER TABLE training_sessions     DROP CONSTRAINT IF EXISTS fk_session_trainer;
ALTER TABLE training_sessions     DROP CONSTRAINT IF EXISTS fk_session_member;
ALTER TABLE workout_plans         DROP CONSTRAINT IF EXISTS fk_workout_trainer;
ALTER TABLE workout_plans         DROP CONSTRAINT IF EXISTS fk_workout_member;
ALTER TABLE attendance            DROP CONSTRAINT IF EXISTS fk_attendance_user;
ALTER TABLE vendors               DROP CONSTRAINT IF EXISTS fk_vendor_user;

ALTER TABLE users                 ALTER COLUMN id            TYPE BIGINT;
ALTER TABLE membership_plans      ALTER COLUMN id            TYPE BIGINT;
ALTER TABLE memberships           ALTER COLUMN id            TYPE BIGINT;
ALTER TABLE payments              ALTER COLUMN id            TYPE BIGINT;
ALTER TABLE training_sessions     ALTER COLUMN id            TYPE BIGINT;
ALTER TABLE workout_plans         ALTER COLUMN id            TYPE BIGINT;
ALTER TABLE password_reset_tokens ALTER COLUMN id            TYPE BIGINT;
ALTER TABLE attendance            ALTER COLUMN id            TYPE BIGINT;
ALTER TABLE vendors               ALTER COLUMN v_id          TYPE BIGINT;

ALTER TABLE password_reset_tokens ALTER COLUMN user_id       TYPE BIGINT;
ALTER TABLE memberships           ALTER COLUMN member_id     TYPE BIGINT;
ALTER TABLE memberships           ALTER COLUMN plan_id       TYPE BIGINT;
ALTER TABLE payments              ALTER COLUMN member_id     TYPE BIGINT;
ALTER TABLE payments              ALTER COLUMN membership_id TYPE BIGINT;
ALTER TABLE training_sessions     ALTER COLUMN trainer_id    TYPE BIGINT;
ALTER TABLE training_sessions     ALTER COLUMN member_id     TYPE BIGINT;
ALTER TABLE workout_plans         ALTER COLUMN trainer_id    TYPE BIGINT;
ALTER TABLE workout_plans         ALTER COLUMN member_id     TYPE BIGINT;
ALTER TABLE attendance            ALTER COLUMN user_id       TYPE BIGINT;
ALTER TABLE vendors               ALTER COLUMN user_id       TYPE BIGINT;

ALTER TABLE password_reset_tokens ADD CONSTRAINT fk_prt_user          FOREIGN KEY (user_id)       REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE memberships           ADD CONSTRAINT fk_membership_member  FOREIGN KEY (member_id)     REFERENCES users(id);
ALTER TABLE memberships           ADD CONSTRAINT fk_membership_plan    FOREIGN KEY (plan_id)       REFERENCES membership_plans(id);
ALTER TABLE payments              ADD CONSTRAINT fk_payment_member     FOREIGN KEY (member_id)     REFERENCES users(id);
ALTER TABLE payments              ADD CONSTRAINT fk_payment_membership FOREIGN KEY (membership_id) REFERENCES memberships(id);
ALTER TABLE training_sessions     ADD CONSTRAINT fk_session_trainer    FOREIGN KEY (trainer_id)    REFERENCES users(id);
ALTER TABLE training_sessions     ADD CONSTRAINT fk_session_member     FOREIGN KEY (member_id)     REFERENCES users(id);
ALTER TABLE workout_plans         ADD CONSTRAINT fk_workout_trainer    FOREIGN KEY (trainer_id)    REFERENCES users(id);
ALTER TABLE workout_plans         ADD CONSTRAINT fk_workout_member     FOREIGN KEY (member_id)     REFERENCES users(id);
ALTER TABLE attendance            ADD CONSTRAINT fk_attendance_user    FOREIGN KEY (user_id)       REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE vendors               ADD CONSTRAINT fk_vendor_user        FOREIGN KEY (user_id)       REFERENCES users(id) ON DELETE CASCADE;
*/


-- ─── ROLLBACK ─────────────────────────────────────────────────────────────────
-- To rollback: restore from the backup taken in Step 1 of the runbook.
-- There is no safe in-place rollback for BIGINT conversion once data exists.
-- Always backup before running this migration.
