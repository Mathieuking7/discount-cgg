-- Mise a jour des tarifs du cheval fiscal par region pour 2026

-- Auvergne-Rhone-Alpes : 43 EUR
UPDATE department_tariffs SET tarif = 43 WHERE code IN ('01','03','07','15','26','38','42','43','63','69','73','74');

-- Bourgogne-Franche-Comte : 60 EUR
UPDATE department_tariffs SET tarif = 60 WHERE code IN ('21','25','39','58','70','71','89','90');

-- Bretagne : 60 EUR
UPDATE department_tariffs SET tarif = 60 WHERE code IN ('22','29','35','56');

-- Centre-Val de Loire : 60 EUR
UPDATE department_tariffs SET tarif = 60 WHERE code IN ('18','28','36','37','41','45');

-- Corse : 53 EUR
UPDATE department_tariffs SET tarif = 53 WHERE code IN ('2A','2B');

-- Grand Est : 60 EUR
UPDATE department_tariffs SET tarif = 60 WHERE code IN ('08','10','51','52','54','55','57','67','68','88');

-- Hauts-de-France : 42 EUR (43 EUR a partir du 1er avril 2026 - on met 42 pour l'instant)
UPDATE department_tariffs SET tarif = 42 WHERE code IN ('02','59','60','62','80');

-- Ile-de-France : 54.95 EUR (tarif de base, hors surcharge de 14 EUR)
-- Le tarif total est 68.95 EUR = 54.95 + 14 EUR surcharge
-- On stocke 54.95 car la surcharge est geree separement dans le calcul
-- CORRECTION: on stocke 68.95 car c'est le tarif tout compris par CV
UPDATE department_tariffs SET tarif = 68.95 WHERE code IN ('75','77','78','91','92','93','94','95');

-- Normandie : 60 EUR
UPDATE department_tariffs SET tarif = 60 WHERE code IN ('14','27','50','61','76');

-- Nouvelle-Aquitaine : 58 EUR (a partir du 1er mars 2026)
UPDATE department_tariffs SET tarif = 58 WHERE code IN ('16','17','19','23','24','33','40','47','64','79','86','87');

-- Occitanie : 59.50 EUR
UPDATE department_tariffs SET tarif = 59.50 WHERE code IN ('09','11','12','30','31','32','34','46','48','65','66','81','82');

-- Pays de la Loire : 51 EUR
UPDATE department_tariffs SET tarif = 51 WHERE code IN ('44','49','53','72','85');

-- Provence-Alpes-Cote-d'Azur : 60 EUR
UPDATE department_tariffs SET tarif = 60 WHERE code IN ('04','05','06','13','83','84');

-- DOM-TOM
-- Guadeloupe : 41 EUR
UPDATE department_tariffs SET tarif = 41 WHERE code = '971';

-- Guyane : 42.50 EUR
UPDATE department_tariffs SET tarif = 42.50 WHERE code = '973';

-- Martinique : 53 EUR
UPDATE department_tariffs SET tarif = 53 WHERE code = '972';

-- La Reunion : 60 EUR
UPDATE department_tariffs SET tarif = 60 WHERE code = '974';

-- Mayotte : 30 EUR
UPDATE department_tariffs SET tarif = 30 WHERE code = '976';
