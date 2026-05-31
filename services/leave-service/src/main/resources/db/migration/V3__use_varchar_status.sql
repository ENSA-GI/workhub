ALTER TABLE leave_requests
    ALTER COLUMN status TYPE VARCHAR(20) USING status::text;
