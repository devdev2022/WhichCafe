-- migrate:up
CREATE TABLE photos (
    id                INT             NOT NULL    AUTO_INCREMENT,
    url               VARCHAR(2083)   NULL,
    html_attributions VARCHAR(1024)   NULL,
    PRIMARY KEY(id)
);

-- migrate:down
DROP TABLE photos