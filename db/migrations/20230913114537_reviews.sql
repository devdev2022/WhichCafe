-- migrate:up
CREATE TABLE reviews (
    id        INT             NOT NULL    AUTO_INCREMENT,
    cafe_id   INT             NOT NULL,
    content   VARCHAR(255)    NULL,
    user_id   CHAR(36)        NULL UNIQUE,

    PRIMARY KEY(id),
    CONSTRAINT fk_cafes_id FOREIGN KEY(cafe_id)
        REFERENCES cafes (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- migrate:down
DROP TABLE reviews
