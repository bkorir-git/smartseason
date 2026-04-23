
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'agent') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  crop_type VARCHAR(120) NOT NULL,
  planting_date DATE NOT NULL,
  current_stage ENUM('Planted', 'Growing', 'Ready', 'Harvested') NOT NULL DEFAULT 'Planted',
  assigned_agent_id INT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_fields_agent
    FOREIGN KEY (assigned_agent_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_fields_creator
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_fields_assigned_agent_id (assigned_agent_id),
  INDEX idx_fields_current_stage (current_stage)
);

CREATE TABLE IF NOT EXISTS field_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_id INT NOT NULL,
  agent_id INT NOT NULL,
  stage ENUM('Planted', 'Growing', 'Ready', 'Harvested') NOT NULL,
  notes TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_updates_field
    FOREIGN KEY (field_id) REFERENCES fields(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_updates_agent
    FOREIGN KEY (agent_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_updates_field_id (field_id),
  INDEX idx_updates_agent_id (agent_id),
  INDEX idx_updates_created_at (created_at)
);
