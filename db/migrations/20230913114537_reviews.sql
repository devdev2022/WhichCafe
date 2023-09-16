-- migrate:up
CREATE TABLE reviews (
    id        INT             NOT NULL    AUTO_INCREMENT,
    user_id   CHAR(36)        NOT NULL,
    cafe_id   INT             NOT NULL,
    content   VARCHAR(255)    NOT NULL,
    score     INT             NOT NULL,

    PRIMARY KEY(id)
    UNIQUE(user_id, cafe_id),
    CONSTRAINT fk_users_id FOREIGN KEY(user_id)
        REFERENCES users (id) ON DELETE RESTRICT ON UPDATE RESTRICT, 
    CONSTRAINT fk_cafes_id FOREIGN KEY(cafe_id)
        REFERENCES cafes (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- migrate:down
DROP TABLE reviews
