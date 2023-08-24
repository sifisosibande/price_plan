CREATE TABLE totals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price_plan_id INTEGER,
    actions VARCHAR(500),
    total_amount REAL,
    FOREIGN KEY (price_plan_id) REFERENCES price_plan(id)
);