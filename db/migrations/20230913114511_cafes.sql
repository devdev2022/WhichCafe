-- migrate:up
CREATE TABLE cafes (
    id                 INT          NOT NULL   AUTO_INCREMENT,
    name               VARCHAR(100) NOT NULL,
    cafe_address_id    INT          NOT NULL,
    photo_id           INT          NULL,

    PRIMARY KEY(id),
    CONSTRAINT fk_cafe_address_id FOREIGN KEY(cafe_address_id)
        REFERENCES cafe_address (id) ON DELETE RESTRICT ON UPDATE RESTRICT, 
    CONSTRAINT fk_photos_id FOREIGN KEY(photo_id)
        REFERENCES photos (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- migrate:down
DROP TABLE cafes
