-- migrate:up
CREATE TABLE refreshtokens (
    id              INT            NOT NULL    AUTO_INCREMENT,
    user_id         CHAR(36)       NOT NULL    UNIQUE,
    account         VARCHAR(50)    NOT NULL    UNIQUE,
    refresh_token   VARCHAR(255)   NOT NULL,
    device_info     VARCHAR(255),
    created_at      TIMESTAMP      NOT NULL DEFAULT current_timestamp,
    expires_at      TIMESTAMP      NOT NULL,

    PRIMARY KEY(id),
    CONSTRAINT fk_refreshtokens_users FOREIGN KEY(user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE RESTRICT
);

-- migrate:down
DROP TABLE refreshtokens
