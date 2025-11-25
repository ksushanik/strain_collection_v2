-- Migration script to convert existing JSON taxonomy16s to string format
-- This updates all existing strains to have string taxonomy16s

UPDATE "Strain" 
SET taxonomy_16s = 
  CASE 
    WHEN taxonomy_16s IS NULL THEN NULL
    WHEN taxonomy_16s::text = 'null' THEN NULL
    ELSE CONCAT(
      COALESCE(taxonomy_16s->>'genus', ''), 
      ' ',
      COALESCE(taxonomy_16s->>'species', '')
    )
  END
WHERE taxonomy_16s IS NOT NULL;

-- Clean up any empty strings
UPDATE "Strain"
SET taxonomy_16s = NULL
WHERE taxonomy_16s = '' OR taxonomy_16s = ' ';
