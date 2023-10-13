-- migrate:up
CREATE TABLE reviews (
    id        INT             NOT NULL    AUTO_INCREMENT,
    cafes_id   INT             NOT NULL,
    score     INT             NOT NULL,
    content   VARCHAR(255)    NOT NULL,
    user_id   INT             NULL,

    PRIMARY KEY(id),
    CONSTRAINT fk_cafes_id FOREIGN KEY(cafes_id)
        REFERENCES cafes (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- migrate:down
DROP TABLE reviews
