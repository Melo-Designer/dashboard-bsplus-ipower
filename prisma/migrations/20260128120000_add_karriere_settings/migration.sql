-- Add karriere page settings for both BS Plus and iPower websites
-- Using INSERT ... ON CONFLICT DO NOTHING to avoid overwriting existing values

-- ============================================
-- BS PLUS KARRIERE SETTINGS
-- ============================================

-- Hero section
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'karriere_hero_button_text', 'Stelle finden', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_hero_button_link', '#stellen', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_section_hero_color', 'primary', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Benefits section (3 columns)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'karriere_benefits_active', 'true', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_benefit_1_title', 'Gestalte die Zukunft mit uns', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_benefit_1_content', 'Werde Teil eines innovativen Teams und entwickle nachhaltige Energielösungen für morgen.', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_benefit_2_title', 'Von der Idee zur Umsetzung', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_benefit_2_content', 'Bei uns kannst du deine Ideen einbringen und aktiv an spannenden Projekten mitwirken.', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_benefit_3_title', 'Gemeinsam Großes bewegen!', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_benefit_3_content', 'In einem starken Team arbeiten wir zusammen an nachhaltigen Lösungen für die Energiewende.', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Jobs section
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'karriere_jobs_title', 'Offene Stellen', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Empty state (when no jobs)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'karriere_empty_title', 'Aktuell keine offenen Stellen', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_empty_description', 'Derzeit haben wir keine offenen Positionen. Schauen Sie bald wieder vorbei oder senden Sie uns eine Initiativbewerbung!', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_empty_button_text', 'Initiativbewerbung senden', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_empty_button_link', '/kontakt', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- About section (text + image)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'karriere_about_active', 'true', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_about_title', 'Über uns', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_about_content', 'BSplus MotorenService GmbH ist Ihr kompetenter Partner für die Wartung, Reparatur und Optimierung von Gasmotoren auf Energieanlagen. Mit jahrelanger Erfahrung bieten wir professionelle Lösungen für BHKW-Betreiber.', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_about_button_text', 'Mehr über uns', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_about_button_link', '/ueber-uns', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_about_image', '', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_about_image_alt', 'Unser Team', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Archive CTA section (dark)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'karriere_archive_cta_active', 'true', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_archive_cta_title', 'Wärmewende 100% erneuerbar', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_archive_cta_description', 'Wir begleiten Sie auf dem Weg zu einer nachhaltigen und dezentralen Energieversorgung.', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_archive_cta_button1_text', 'Kontakt aufnehmen', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_archive_cta_button1_link', '/kontakt', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_archive_cta_button2_text', '', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_archive_cta_button2_link', '', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_archive_cta_image', '', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Section headings (single job page)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'karriere_detail_apply_button', 'Jetzt bewerben', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_detail_tasks_title', 'Ihre Aufgaben', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_detail_profile_title', 'Ihr Profil', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_detail_benefits_title', 'Was wir bieten', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_detail_overview_title', 'Auf einen Blick', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Application form
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'karriere_form_title', 'Jetzt bewerben', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_form_submit_button', 'Bewerbung abschicken', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_form_success_message', 'Vielen Dank für Ihre Bewerbung! Wir werden uns in Kürze bei Ihnen melden.', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_form_error_message', 'Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Single CTA section (dark)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'karriere_single_cta_active', 'true', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_single_cta_title', 'Interesse geweckt?', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_single_cta_description', 'Wir freuen uns auf Ihre Bewerbung und darauf, Sie kennenzulernen!', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_single_cta_button1_text', 'Kontakt aufnehmen', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_single_cta_button1_link', '/kontakt', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_single_cta_button2_text', 'Mehr über uns', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_single_cta_button2_link', '/ueber-uns', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'karriere_single_cta_image', '', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;


-- ============================================
-- IPOWER KARRIERE SETTINGS
-- ============================================

-- Hero section
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'karriere_hero_button_text', 'Stelle finden', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_hero_button_link', '#stellen', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_section_hero_color', 'secondary', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Benefits section (3 columns)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'karriere_benefits_active', 'true', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_benefit_1_title', 'Gestalte die Zukunft mit uns', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_benefit_1_content', 'Werde Teil eines innovativen Teams und entwickle nachhaltige Energielösungen für morgen.', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_benefit_2_title', 'Von der Idee zur Umsetzung', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_benefit_2_content', 'Bei uns kannst du deine Ideen einbringen und aktiv an spannenden Projekten mitwirken.', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_benefit_3_title', 'Gemeinsam Großes bewegen!', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_benefit_3_content', 'In einem starken Team arbeiten wir zusammen an nachhaltigen Lösungen für die Energiewende.', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Jobs section
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'karriere_jobs_title', 'Offene Stellen', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Empty state (when no jobs)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'karriere_empty_title', 'Aktuell keine offenen Stellen', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_empty_description', 'Derzeit haben wir keine offenen Positionen. Schauen Sie bald wieder vorbei oder senden Sie uns eine Initiativbewerbung!', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_empty_button_text', 'Initiativbewerbung senden', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_empty_button_link', '/kontakt', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- About section (text + image)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'karriere_about_active', 'true', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_about_title', 'Über uns', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_about_content', 'iPower bietet Planungs- und Ingenieurlösungen in den Bereichen Energie, Wärme, Infrastruktur und Bau an. Mit unserer Expertise unterstützen wir die Energiewende und entwickeln nachhaltige Konzepte.', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_about_button_text', 'Mehr über uns', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_about_button_link', '/ueber-uns', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_about_image', '', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_about_image_alt', 'Unser Team', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Archive CTA section (dark)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'karriere_archive_cta_active', 'true', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_archive_cta_title', 'Wärmewende 100% erneuerbar', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_archive_cta_description', 'Wir begleiten Sie auf dem Weg zu einer nachhaltigen und dezentralen Energieversorgung.', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_archive_cta_button1_text', 'Kontakt aufnehmen', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_archive_cta_button1_link', '/kontakt', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_archive_cta_button2_text', '', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_archive_cta_button2_link', '', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_archive_cta_image', '', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Section headings (single job page)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'karriere_detail_apply_button', 'Jetzt bewerben', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_detail_tasks_title', 'Ihre Aufgaben', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_detail_profile_title', 'Ihr Profil', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_detail_benefits_title', 'Was wir bieten', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_detail_overview_title', 'Auf einen Blick', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Application form
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'karriere_form_title', 'Jetzt bewerben', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_form_submit_button', 'Bewerbung abschicken', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_form_success_message', 'Vielen Dank für Ihre Bewerbung! Wir werden uns in Kürze bei Ihnen melden.', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_form_error_message', 'Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Single CTA section (dark)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'karriere_single_cta_active', 'true', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_single_cta_title', 'Interesse geweckt?', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_single_cta_description', 'Wir freuen uns auf Ihre Bewerbung und darauf, Sie kennenzulernen!', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_single_cta_button1_text', 'Kontakt aufnehmen', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_single_cta_button1_link', '/kontakt', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_single_cta_button2_text', 'Mehr über uns', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_single_cta_button2_link', '/ueber-uns', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'karriere_single_cta_image', '', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;
