-- Fix require_vehicle_info for demarches that should NOT require a plate
-- IMMAT_CYCLO_ANCIEN: cyclomoteur ancien non immatricule -> pas de plaque
-- DEMANDE_IMMAT: vehicule non enregistre au SIV -> pas de plaque

UPDATE guest_demarche_types
SET require_vehicle_info = false
WHERE code IN ('IMMAT_CYCLO_ANCIEN', 'DEMANDE_IMMAT');
