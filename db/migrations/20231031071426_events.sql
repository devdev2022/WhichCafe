-- migrate:up
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS clean_expired_tokens
ON SCHEDULE EVERY 1 HOUR
DO
  DELETE FROM refreshtokens WHERE expires_at < NOW();

-- migrate:down
DROP EVENT IF EXISTS clean_expired_tokens;
