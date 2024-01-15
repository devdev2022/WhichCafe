-- migrate:up
CREATE TABLE refreshtokens (
    id              INT            NOT NULL    AUTO_INCREMENT,
    user_id         BINARY(16)     NOT NULL    UNIQUE,
    account         VARCHAR(50)    NOT NULL    UNIQUE,
    refresh_token   VARCHAR(255)   NOT NULL,
    device_info     VARCHAR(255),
    created_at      TIMESTAMP      NOT NULL DEFAULT current_timestamp,
    expires_at      TIMESTAMP      NOT NULL DEFAULT (current_timestamp + INTERVAL 14 DAY),

    PRIMARY KEY(id),
    CONSTRAINT fk_refreshtokens_users FOREIGN KEY(user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE TRIGGER before_refreshtoken_insert
BEFORE INSERT ON refreshtokens
FOR EACH ROW
BEGIN
   SET NEW.expires_at = CURRENT_TIMESTAMP + INTERVAL 14 DAY;
END;


-- migrate:down
DROP TRIGGER IF EXISTS before_refreshtoken_insert;
DROP TABLE IF EXISTS refreshtokens;