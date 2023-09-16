-- migrate:up
CREATE TABLE users (
    id          CHAR(36)       NOT NULL DEFAULT (UUID()),
    account     VARCHAR(50)    NOT NULL,
    password    VARCHAR(256)   NOT NULL,
    nickname    VARCHAR(50)    NOT NULL,  
    created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
);

-- migrate:down
DROP TABLE users
