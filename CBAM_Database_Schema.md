# CBAM Web Application Database Schema

## Overview
This document outlines the database schema for the CBAM web application, designed to store all data from the Excel template while supporting the wizard interface and calculation engine.

## Database Design Principles
1. **Normalization**: Normalized structure to reduce data redundancy
2. **Scalability**: Designed to handle multiple companies and reports
3. **Audit Trail**: Track changes to maintain data integrity
4. **Performance**: Optimized for the calculation engine and reporting
5. **Compliance**: Ensure data structure supports CBAM reporting requirements

## Entity Relationship Diagram (High Level)

```
+-------------+      +---------------+      +----------------+
|   Company   |      |     User      |      |    Report      |
+-------------+      +---------------+      +----------------+
| company_id  |      |   user_id     |      |   report_id    |
| name        |      |   company_id  |      |   company_id   |
| address     |      |   name        |      |   name         |
| country     |      |   email       |      |   period_start |
| tax_id      |      |   role        |      |   period_end   |
+-------------+      +---------------+      |   status       |
         |                   |            |   created_at    |
         |                   |            |   updated_at    |
         +-------------------+            +----------------+
                                               |
                                               |
      +------------------------+              |
      |      Installation      |--------------+
      +------------------------+
      |  installation_id       |
      |  report_id             |
      |  name                  |
      |  name_local            |
      |  address               |
      |  country               |
      |  sector                |
      |  capacity              |
      +------------------------+
               |
               |
+------------------------------+    +----------------------+
|          Fuel                |    |       Process        |
+------------------------------+    +----------------------+
|          fuel_id             |    |     process_id       |
|          installation_id     |    |   installation_id    |
|          fuel_type           |    |   process_type       |
|          consumption         |    |   production_route   |
|          unit                |    |   production_amount  |
|          biomass_percentage  |    |   unit               |
|          emission_factor     |    +----------------------+
+------------------------------+               |
               |                                     |
               |                                     |
+------------------------------+    +----------------------+
|          Energy              |    |       Product        |
+------------------------------+    +----------------------+
|          energy_id           |    |     product_id       |
|          installation_id     |    |   installation_id    |
|          energy_type         |    |   name               |
|          consumption         |    |   cn_code            |
|          unit                |    |   production_amount  |
|          is_renewable        |    |   unit               |
|          emission_factor     |    |   specific_emissions |
+------------------------------+    |   embedded_emissions  |
                                       +----------------------+
```

## Detailed Table Schemas

### 1. Companies Table

```sql
CREATE TABLE companies (
  company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  country VARCHAR(100),
  tax_id VARCHAR(50),
  contact_person VARCHAR(100),
  contact_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Users Table

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(company_id),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user', -- 'admin', 'user', 'viewer'
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Reports Table

```sql
CREATE TABLE reports (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(company_id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'completed', 'submitted'
  created_by UUID REFERENCES users(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Installations Table

```sql
CREATE TABLE installations (
  installation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(report_id),
  name VARCHAR(255) NOT NULL,
  name_local VARCHAR(255),
  address TEXT,
  country VARCHAR(100),
  postal_code VARCHAR(20),
  sector VARCHAR(100) NOT NULL, -- CBAM sector code
  main_products TEXT[], -- Array of main products
  production_capacity_value DECIMAL(15, 3),
  production_capacity_unit VARCHAR(50),
  installation_identifier VARCHAR(100),
  permit_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Fuels Table

```sql
CREATE TABLE fuels (
  fuel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES installations(installation_id),
  fuel_type VARCHAR(100) NOT NULL, -- CBAM fuel code
  fuel_name VARCHAR(255),
  consumption_value DECIMAL(15, 6) NOT NULL,
  consumption_unit VARCHAR(20) NOT NULL, -- 'tonnes', 'GJ', 'MWh', 'Nm3', etc.
  emission_factor DECIMAL(15, 6),
  emission_factor_unit VARCHAR(20), -- 'tCO2/TJ', 'tCO2/tonne', etc.
  biomass_percentage DECIMAL(5, 2) DEFAULT 0, -- 0-100
  source_type VARCHAR(50), -- 'MeasurementNational', 'MeasurementSector', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Energy Table

```sql
CREATE TABLE energy (
  energy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES installations(installation_id),
  energy_type VARCHAR(100) NOT NULL, -- 'electricity', 'heat', 'steam', etc.
  source VARCHAR(100), -- 'grid', 'own_generation', etc.
  consumption_value DECIMAL(15, 6) NOT NULL,
  consumption_unit VARCHAR(20) NOT NULL, -- 'MWh', 'GJ', 'TJ', etc.
  is_renewable BOOLEAN DEFAULT false,
  renewable_percentage DECIMAL(5, 2) DEFAULT 0, -- 0-100
  emission_factor DECIMAL(15, 6),
  emission_factor_unit VARCHAR(20), -- 'tCO2/MWh', etc.
  source_type VARCHAR(50), -- 'MeasurementNational', 'MeasurementSector', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Processes Table

```sql
CREATE TABLE processes (
  process_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES installations(installation_id),
  process_type VARCHAR(100) NOT NULL, -- CBAM process code
  process_name VARCHAR(255),
  production_route VARCHAR(255),
  production_amount DECIMAL(15, 6) NOT NULL,
  production_unit VARCHAR(20) NOT NULL, -- 'tonnes', 'units', etc.
  direct_emissions DECIMAL(15, 6), -- Calculated field
  indirect_emissions DECIMAL(15, 6), -- Calculated field
  total_emissions DECIMAL(15, 6), -- Calculated field
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 8. Process Inputs Table

```sql
CREATE TABLE process_inputs (
  input_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES processes(process_id),
  material_type VARCHAR(100) NOT NULL, -- 'raw_material', 'intermediate', 'precursor'
  material_name VARCHAR(255) NOT NULL,
  consumption_value DECIMAL(15, 6) NOT NULL,
  consumption_unit VARCHAR(20) NOT NULL,
  is_imported BOOLEAN DEFAULT false,
  embedded_emissions DECIMAL(15, 6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 9. Process Outputs Table

```sql
CREATE TABLE process_outputs (
  output_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES processes(process_id),
  product_type VARCHAR(100) NOT NULL, -- 'main_product', 'by_product', 'waste'
  product_name VARCHAR(255) NOT NULL,
  production_value DECIMAL(15, 6) NOT NULL,
  production_unit VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 10. Products Table

```sql
CREATE TABLE products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES installations(installation_id),
  name VARCHAR(255) NOT NULL,
  cn_code VARCHAR(20), -- Combined Nomenclature code
  production_amount DECIMAL(15, 6) NOT NULL,
  production_unit VARCHAR(20) NOT NULL,
  specific_emissions_direct DECIMAL(15, 6), -- kg CO2/tonne
  specific_emissions_indirect DECIMAL(15, 6), -- kg CO2/tonne
  specific_emissions_total DECIMAL(15, 6), -- kg CO2/tonne
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 11. Embedded Emissions Table

```sql
CREATE TABLE embedded_emissions (
  emission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(product_id),
  direct_embedded_emissions DECIMAL(15, 6),
  indirect_embedded_emissions DECIMAL(15, 6),
  total_embedded_emissions DECIMAL(15, 6),
  calculation_method VARCHAR(100),
  data_source VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 12. Calculation Results Table

```sql
CREATE TABLE calculation_results (
  result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(report_id),
  calculation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Direct emissions results
  total_direct_emissions DECIMAL(15, 6),
  direct_emissions_by_fuel JSONB, -- {"fuel_type": emissions}
  
  -- Process emissions results
  total_process_emissions DECIMAL(15, 6),
  process_emissions_by_process JSONB, -- {"process_id": emissions}
  
  -- Energy metrics
  total_energy_consumption DECIMAL(15, 6),
  renewable_energy_consumption DECIMAL(15, 6),
  renewable_energy_percentage DECIMAL(5, 2),
  
  -- Embedded emissions
  total_embedded_emissions DECIMAL(15, 6),
  embedded_emissions_by_product JSONB, -- {"product_id": emissions}
  
  -- Cumulative emissions
  total_cumulative_emissions DECIMAL(15, 6),
  
  -- Calculation metadata
  calculation_version VARCHAR(20),
  calculation_parameters JSONB
);
```

### 13. Reference Tables

#### Fuel Types Reference Table

```sql
CREATE TABLE fuel_types (
  fuel_code VARCHAR(50) PRIMARY KEY,
  fuel_name VARCHAR(255) NOT NULL,
  emission_factor DECIMAL(15, 6),
  emission_factor_unit VARCHAR(20),
  energy_content DECIMAL(15, 6),
  energy_content_unit VARCHAR(20),
  is_biomass BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Process Types Reference Table

```sql
CREATE TABLE process_types (
  process_code VARCHAR(50) PRIMARY KEY,
  process_name VARCHAR(255) NOT NULL,
  sector VARCHAR(100),
  direct_emission_factor DECIMAL(15, 6),
  direct_emission_factor_unit VARCHAR(20),
  indirect_emission_factor DECIMAL(15, 6),
  indirect_emission_factor_unit VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### CN Codes Reference Table

```sql
CREATE TABLE cn_codes (
  cn_code VARCHAR(20) PRIMARY KEY,
  description TEXT,
  sector VARCHAR(100),
  default_emission_factor DECIMAL(15, 6),
  default_emission_factor_unit VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 14. Audit Trail Table

```sql
CREATE TABLE audit_trail (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  operation VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES users(user_id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_reports_company_id ON reports(company_id);
CREATE INDEX idx_installations_report_id ON installations(report_id);
CREATE INDEX idx_fuels_installation_id ON fuels(installation_id);
CREATE INDEX idx_energy_installation_id ON energy(installation_id);
CREATE INDEX idx_processes_installation_id ON processes(installation_id);
CREATE INDEX idx_products_installation_id ON products(installation_id);
CREATE INDEX idx_calculation_results_report_id ON calculation_results(report_id);

-- Search indexes
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_period ON reports(reporting_period_start, reporting_period_end);
CREATE INDEX idx_installations_sector ON installations(sector);
CREATE INDEX idx_fuels_type ON fuels(fuel_type);
CREATE INDEX idx_processes_type ON processes(process_type);
```

## Views

### Installation Summary View

```sql
CREATE VIEW installation_summary AS
SELECT 
  i.installation_id,
  i.name,
  i.sector,
  r.report_id,
  r.name AS report_name,
  r.reporting_period_start,
  r.reporting_period_end,
  r.status,
  c.name AS company_name,
  -- Calculated fields
  (SELECT COALESCE(SUM(consumption_value), 0) FROM fuels WHERE installation_id = i.installation_id) AS total_fuel_consumption,
  (SELECT COALESCE(SUM(production_amount), 0) FROM processes WHERE installation_id = i.installation_id) AS total_production,
  (SELECT COALESCE(SUM(total_emissions), 0) FROM processes WHERE installation_id = i.installation_id) AS total_process_emissions
FROM installations i
JOIN reports r ON i.report_id = r.report_id
JOIN companies c ON r.company_id = c.company_id;
```

### Emissions Summary View

```sql
CREATE VIEW emissions_summary AS
SELECT 
  r.report_id,
  r.name AS report_name,
  c.name AS company_name,
  r.reporting_period_start,
  r.reporting_period_end,
  -- Direct emissions
  COALESCE(cr.total_direct_emissions, 0) AS total_direct_emissions,
  -- Process emissions
  COALESCE(cr.total_process_emissions, 0) AS total_process_emissions,
  -- Embedded emissions
  COALESCE(cr.total_embedded_emissions, 0) AS total_embedded_emissions,
  -- Total emissions
  COALESCE(cr.total_cumulative_emissions, 0) AS total_cumulative_emissions,
  -- Energy metrics
  COALESCE(cr.total_energy_consumption, 0) AS total_energy_consumption,
  COALESCE(cr.renewable_energy_consumption, 0) AS renewable_energy_consumption,
  COALESCE(cr.renewable_energy_percentage, 0) AS renewable_energy_percentage,
  -- Calculation date
  cr.calculation_date
FROM reports r
JOIN companies c ON r.company_id = c.company_id
LEFT JOIN calculation_results cr ON r.report_id = cr.report_id;
```

## Triggers

### Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Similar triggers for other tables...
```

### Audit Trail Trigger

```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_trail (table_name, record_id, operation, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), current_setting('app.current_user_id')::UUID);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_trail (table_name, record_id, operation, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), current_setting('app.current_user_id')::UUID);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_trail (table_name, record_id, operation, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), current_setting('app.current_user_id')::UUID);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables that need auditing
CREATE TRIGGER audit_fuel_trigger
    AFTER INSERT OR UPDATE OR DELETE ON fuels
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Similar triggers for other tables...
```

## Data Migration and Seeding

### Initial Reference Data

```sql
-- Seed fuel types reference table
INSERT INTO fuel_types (fuel_code, fuel_name, emission_factor, emission_factor_unit, energy_content, energy_content_unit, is_biomass) VALUES
('anthracite', 'Anthracite', 98.3, 'tCO2/TJ', 25.8, 'TJ/1000 tonnes', false),
('coking_coal', 'Coking coal', 94.6, 'tCO2/TJ', 28.2, 'TJ/1000 tonnes', false),
('natural_gas', 'Natural gas', 56.1, 'tCO2/TJ', 38.7, 'TJ/million Nm3', false),
('biomass', 'Biomass', 0.0, 'tCO2/TJ', 10.0, 'TJ/1000 tonnes', true);

-- Seed process types reference table
INSERT INTO process_types (process_code, process_name, sector, direct_emission_factor, direct_emission_factor_unit) VALUES
('cement_clinker', 'Cement clinker production', 'cement', 0.527, 'tCO2/t clinker'),
('basic_oxygen_furnace', 'Basic oxygen furnace', 'iron_steel', 0.350, 'tCO2/t steel'),
('primary_aluminum', 'Primary aluminum production', 'aluminum', 2.000, 'tCO2/t aluminum');

-- Seed CN codes reference table (sample data)
INSERT INTO cn_codes (cn_code, description, sector) VALUES
('2523', 'Portland cement', 'cement'),
('7208', 'Flat-rolled products of iron or non-alloy steel', 'iron_steel'),
('7601', 'Unwrought aluminium', 'aluminum');
```

## Conclusion
This database schema provides a comprehensive structure for storing all CBAM-related data while supporting the wizard interface and calculation engine. The design ensures data integrity, performance, and scalability for the web application.

The schema is normalized to reduce redundancy while maintaining the relationships needed for complex calculations. The audit trail ensures data changes are tracked for compliance purposes, and the reference tables provide the standardized values needed for consistent calculations.