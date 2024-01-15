-- migrate:up
CREATE TABLE users (
    id                 BINARY(16)     NOT NULL DEFAULT (UUID_TO_BIN(UUID())) UNIQUE,
    account            VARCHAR(50)    NOT NULL UNIQUE,
    password           VARCHAR(64)    NOT NULL,
    nickname           VARCHAR(50)    NOT NULL,
    question_answer    VARCHAR(32)    NOT NULL,
    created_at         TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- migrate:down
DROP TABLE users