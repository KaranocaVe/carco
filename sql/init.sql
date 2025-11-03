-- CarCo Database Initialization (OpenGauss/PostgreSQL compatible)
-- Schema, tables, constraints, triggers, indexes, and views
-- NOTE: No sample data is inserted in this script.

BEGIN;

-- 1) Reset schema idempotently
DROP SCHEMA IF EXISTS carco CASCADE;
CREATE SCHEMA carco;
SET search_path TO carco, public;

-- 2) Master data tables
CREATE TABLE carco.brand (
  brand_id       BIGSERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE carco.model (
  model_id       BIGSERIAL PRIMARY KEY,
  brand_id       BIGINT NOT NULL REFERENCES carco.brand(brand_id),
  name           VARCHAR(100) NOT NULL,
  UNIQUE (brand_id, name)
);

CREATE TABLE carco.color (
  color_id       BIGSERIAL PRIMARY KEY,
  name           VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE carco.part_category (
  category_id    BIGSERIAL PRIMARY KEY,
  name           VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE carco.part_spec (
  part_spec_id   BIGSERIAL PRIMARY KEY,
  category_id    BIGINT NOT NULL REFERENCES carco.part_category(category_id),
  name           VARCHAR(100) NOT NULL,
  spec_code      VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE carco.supplier (
  supplier_id    BIGSERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL UNIQUE
);

-- Many-to-many mapping tables
CREATE TABLE carco.supplier_part_spec (
  supplier_id    BIGINT NOT NULL REFERENCES carco.supplier(supplier_id),
  part_spec_id   BIGINT NOT NULL REFERENCES carco.part_spec(part_spec_id),
  PRIMARY KEY (supplier_id, part_spec_id)
);

CREATE TABLE carco.model_part_spec (
  model_id       BIGINT NOT NULL REFERENCES carco.model(model_id),
  part_spec_id   BIGINT NOT NULL REFERENCES carco.part_spec(part_spec_id),
  PRIMARY KEY (model_id, part_spec_id)
);

-- Vehicle configuration & parts
CREATE TABLE carco.configuration (
  config_id              BIGSERIAL PRIMARY KEY,
  model_id               BIGINT NOT NULL REFERENCES carco.model(model_id),
  engine_displacement    NUMERIC(4,1) NOT NULL CHECK (engine_displacement > 0),
  transmission_spec_id   BIGINT NOT NULL REFERENCES carco.part_spec(part_spec_id)
);

CREATE TABLE carco.transmission_unit (
  transmission_unit_id   BIGSERIAL PRIMARY KEY,
  part_spec_id           BIGINT NOT NULL REFERENCES carco.part_spec(part_spec_id),
  supplier_id            BIGINT NOT NULL REFERENCES carco.supplier(supplier_id),
  serial_number          VARCHAR(100) NOT NULL UNIQUE,
  production_date        DATE NOT NULL
);

-- Vehicles, dealers, inventory & sales
CREATE TABLE carco.vehicle (
  vehicle_id            BIGSERIAL PRIMARY KEY,
  vin                   VARCHAR(40) NOT NULL UNIQUE,
  model_id              BIGINT NOT NULL REFERENCES carco.model(model_id),
  config_id             BIGINT NOT NULL REFERENCES carco.configuration(config_id),
  color_id              BIGINT NOT NULL REFERENCES carco.color(color_id),
  transmission_unit_id  BIGINT NOT NULL UNIQUE REFERENCES carco.transmission_unit(transmission_unit_id),
  manufacture_date      DATE NOT NULL
);

CREATE TABLE carco.dealer (
  dealer_id     BIGSERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL UNIQUE,
  city          VARCHAR(100) NOT NULL,
  province      VARCHAR(100) NOT NULL
);

-- No cross-store transfers: at most one inventory record per vehicle
CREATE TABLE carco.inventory_assignment (
  vehicle_id     BIGINT PRIMARY KEY REFERENCES carco.vehicle(vehicle_id),
  dealer_id      BIGINT NOT NULL REFERENCES carco.dealer(dealer_id),
  received_at    DATE NOT NULL
);

CREATE TABLE carco.customer (
  customer_id    BIGSERIAL PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  gender         CHAR(1) NOT NULL CHECK (gender IN ('M','F')),
  income         NUMERIC(12,2) CHECK (income >= 0),
  city           VARCHAR(100)
);

CREATE TABLE carco.sale (
  sale_id        BIGSERIAL PRIMARY KEY,
  vehicle_id     BIGINT NOT NULL UNIQUE REFERENCES carco.vehicle(vehicle_id),
  dealer_id      BIGINT NOT NULL REFERENCES carco.dealer(dealer_id),
  customer_id    BIGINT NOT NULL REFERENCES carco.customer(customer_id),
  sale_date      DATE NOT NULL,
  sale_price     NUMERIC(12,2) NOT NULL CHECK (sale_price > 0)
);

-- 3) Triggers to enforce cross-table business rules

-- Ensure configuration.transmission_spec_id refers to a Transmission part_spec
CREATE OR REPLACE FUNCTION carco.ensure_configuration_transmission_spec()
RETURNS trigger AS $$
DECLARE
  v_is_transmission BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM carco.part_spec ps
    JOIN carco.part_category pc ON pc.category_id = ps.category_id
    WHERE ps.part_spec_id = NEW.transmission_spec_id
      AND lower(pc.name) = 'transmission'
  ) INTO v_is_transmission;

  IF NOT v_is_transmission THEN
    RAISE EXCEPTION 'configuration.transmission_spec_id % must be a Transmission part_spec', NEW.transmission_spec_id;
  END IF;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_configuration_transmission_spec
BEFORE INSERT OR UPDATE OF transmission_spec_id
ON carco.configuration
FOR EACH ROW
EXECUTE PROCEDURE carco.ensure_configuration_transmission_spec();

-- Ensure vehicle.transmission_unit_id matches configuration.transmission_spec_id and is Transmission
CREATE OR REPLACE FUNCTION carco.ensure_vehicle_transmission_matches_configuration()
RETURNS trigger AS $$
DECLARE
  v_part_spec_id BIGINT;
  v_is_transmission BOOLEAN;
BEGIN
  SELECT tu.part_spec_id INTO v_part_spec_id
  FROM carco.transmission_unit tu
  WHERE tu.transmission_unit_id = NEW.transmission_unit_id;

  IF v_part_spec_id IS NULL THEN
    RAISE EXCEPTION 'transmission_unit % not found', NEW.transmission_unit_id;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM carco.part_spec ps
    JOIN carco.part_category pc ON pc.category_id = ps.category_id
    WHERE ps.part_spec_id = v_part_spec_id
      AND lower(pc.name) = 'transmission'
  ) INTO v_is_transmission;

  IF NOT v_is_transmission THEN
    RAISE EXCEPTION 'vehicle.transmission_unit_id % is not a Transmission unit', NEW.transmission_unit_id;
  END IF;

  PERFORM 1
  FROM carco.configuration c
  WHERE c.config_id = NEW.config_id
    AND c.transmission_spec_id = v_part_spec_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'vehicle.transmission_unit % spec does not match configuration %', NEW.transmission_unit_id, NEW.config_id;
  END IF;

  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vehicle_transmission_matches_config
BEFORE INSERT OR UPDATE OF transmission_unit_id, config_id
ON carco.vehicle
FOR EACH ROW
EXECUTE PROCEDURE carco.ensure_vehicle_transmission_matches_configuration();

-- 4) Indexes to support common queries
CREATE INDEX idx_sale_date                 ON carco.sale(sale_date);
CREATE INDEX idx_vehicle_model             ON carco.vehicle(model_id, vehicle_id);
CREATE INDEX idx_model_brand               ON carco.model(brand_id, model_id);
CREATE INDEX idx_transmission_supplier_dt  ON carco.transmission_unit(supplier_id, production_date);
CREATE INDEX idx_sale_dealer_date          ON carco.sale(dealer_id, sale_date);
CREATE INDEX idx_inventory_dealer_recv     ON carco.inventory_assignment(dealer_id, received_at);
CREATE INDEX idx_sale_customer             ON carco.sale(customer_id);
CREATE INDEX idx_vehicle_config            ON carco.vehicle(config_id);
CREATE INDEX idx_vehicle_color             ON carco.vehicle(color_id);

-- 5) Convenience views (no data inserted)
CREATE OR REPLACE VIEW carco.v_sales_detail AS
SELECT
  s.sale_id, s.sale_date, s.sale_price,
  s.vehicle_id, v.vin, v.model_id, v.config_id, v.color_id,
  m.name AS model_name, b.brand_id, b.name AS brand_name,
  c.customer_id, c.name AS customer_name, c.gender AS customer_gender, c.income AS customer_income,
  d.dealer_id, d.name AS dealer_name, d.city AS dealer_city, d.province AS dealer_province
FROM carco.sale s
JOIN carco.vehicle v ON v.vehicle_id = s.vehicle_id
JOIN carco.model m ON m.model_id = v.model_id
JOIN carco.brand b ON b.brand_id = m.brand_id
JOIN carco.customer c ON c.customer_id = s.customer_id
JOIN carco.dealer d ON d.dealer_id = s.dealer_id;

CREATE OR REPLACE VIEW carco.v_dealer_inventory_dwell AS
SELECT
  ia.dealer_id,
  ia.vehicle_id,
  ia.received_at,
  s.sale_date,
  (s.sale_date - ia.received_at) AS days_in_inventory
FROM carco.inventory_assignment ia
LEFT JOIN carco.sale s ON s.vehicle_id = ia.vehicle_id;

CREATE OR REPLACE VIEW carco.v_transmission_installs AS
SELECT
  v.vehicle_id, v.vin,
  tu.transmission_unit_id, tu.serial_number, tu.production_date,
  sup.supplier_id, sup.name AS supplier_name,
  ps.part_spec_id, ps.spec_code, ps.name AS part_spec_name,
  s.sale_id, s.sale_date, s.customer_id, cust.name AS customer_name
FROM carco.vehicle v
JOIN carco.transmission_unit tu ON tu.transmission_unit_id = v.transmission_unit_id
JOIN carco.part_spec ps ON ps.part_spec_id = tu.part_spec_id
JOIN carco.supplier sup ON sup.supplier_id = tu.supplier_id
LEFT JOIN carco.sale s ON s.vehicle_id = v.vehicle_id
LEFT JOIN carco.customer cust ON cust.customer_id = s.customer_id;

COMMIT;


