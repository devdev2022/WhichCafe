-- migrate:up
CREATE TABLE cafe_address (
    id          INT             NOT NULL   AUTO_INCREMENT,
    address     VARCHAR(100)    NOT NULL,
    latitude    DECIMAL(9,6),
    longitude   DECIMAL(10,6),

    PRIMARY KEY(id)
);

-- migrate:down
DROP TABLE cafe_address
