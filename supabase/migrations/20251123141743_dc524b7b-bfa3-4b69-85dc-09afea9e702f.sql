-- Add missing fields from API to vehicules table for complete vehicle data storage
ALTER TABLE vehicules ADD COLUMN IF NOT EXISTS carrosserie text;
ALTER TABLE vehicules ADD COLUMN IF NOT EXISTS genre text;
ALTER TABLE vehicules ADD COLUMN IF NOT EXISTS couleur text;
ALTER TABLE vehicules ADD COLUMN IF NOT EXISTS energie text;
ALTER TABLE vehicules ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE vehicules ADD COLUMN IF NOT EXISTS version text;
ALTER TABLE vehicules ADD COLUMN IF NOT EXISTS numero_formule text;
ALTER TABLE vehicules ADD COLUMN IF NOT EXISTS puiss_ch numeric;
ALTER TABLE vehicules ADD COLUMN IF NOT EXISTS cylindree numeric;
ALTER TABLE vehicules ADD COLUMN IF NOT EXISTS co2 numeric;
ALTER TABLE vehicules ADD COLUMN IF NOT EXISTS ptr numeric;
ALTER TABLE vehicules ADD COLUMN IF NOT EXISTS date_cg date;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vehicules_immatriculation ON vehicules(immatriculation);
CREATE INDEX IF NOT EXISTS idx_vehicules_garage_type ON vehicules(garage_id, immatriculation);