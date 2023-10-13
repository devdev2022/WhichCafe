-- migrate:up
CREATE TABLE photos (
    id                INT             NOT NULL    AUTO_INCREMENT,
    url               VARCHAR(2083)   NULL,
    cafe_id           INT             NULL,
    html_attributions VARCHAR(1024)   NULL,

    PRIMARY KEY(id),
    CONSTRAINT fk_photos_cafes FOREIGN KEY(cafe_id)
        REFERENCES cafes (id) ON DELETE CASCADE ON UPDATE RESTRICT
);

-- migrate:down
DROP TABLE photos