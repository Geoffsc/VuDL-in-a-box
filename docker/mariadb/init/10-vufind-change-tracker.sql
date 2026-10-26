CREATE TABLE IF NOT EXISTS change_tracker (
    core VARCHAR(30) NOT NULL,
    id VARCHAR(120) NOT NULL,
    first_indexed DATETIME DEFAULT NULL,
    last_indexed DATETIME DEFAULT NULL,
    last_record_change DATETIME DEFAULT NULL,
    deleted DATETIME DEFAULT NULL,
    PRIMARY KEY (core, id),
    KEY change_tracker_deleted_idx (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
