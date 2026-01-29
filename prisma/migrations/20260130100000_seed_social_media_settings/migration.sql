-- Seed social media settings for iPower
INSERT INTO "Setting" ("id", "website", "key", "value", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'social_facebook', 'https://www.facebook.com/profile.php?id=61583672984078', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'social_linkedin', 'https://www.linkedin.com/company/ipower-gmbh/', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'social_instagram', 'https://instagram.com/ipower.gmbh', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'social_whatsapp', 'https://api.whatsapp.com/send?phone=494475918480', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'social_google_maps', 'https://maps.google.com/maps?ll=52.842602,7.908625&z=14&t=m&hl=en&gl=BR&mapclient=embed&cid=11269629673434630514', NOW(), NOW())
ON CONFLICT ("website", "key") DO NOTHING;

-- Seed social media settings for BS Plus
INSERT INTO "Setting" ("id", "website", "key", "value", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'social_facebook', 'https://www.facebook.com/BSPlusMotorenServiceGmbH', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'social_linkedin', 'https://www.linkedin.com/company/bsplus-motorenservice-gmbh', NOW(), NOW())
ON CONFLICT ("website", "key") DO NOTHING;
