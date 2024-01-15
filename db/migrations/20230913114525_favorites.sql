-- migrate:up
CREATE TABLE favorites (
    id        INT         NOT NULL    AUTO_INCREMENT PRIMARY KEY,
    user_id   BINARY(16)  NOT NULL,
    cafe_id   INT         NOT NULL,
    
    CONSTRAINT fk_favorites_users FOREIGN KEY(user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_favorites_cafes FOREIGN KEY(cafe_id)
        REFERENCES cafes (id) ON DELETE CASCADE ON UPDATE RESTRICT
);
-- migrate:down
DROP TABLE favorites