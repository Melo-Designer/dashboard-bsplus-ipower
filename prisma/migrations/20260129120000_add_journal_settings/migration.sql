-- Add journal page settings for both BS Plus and iPower websites
-- Using INSERT ... ON CONFLICT DO NOTHING to avoid overwriting existing values

-- ============================================
-- BS PLUS JOURNAL SETTINGS
-- ============================================

-- SectionTextImage (Archive page)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'journal_text_image_active', 'false', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_text_image_title', 'Über BSplus', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_text_image_content', 'Erfahren Sie mehr über unsere Expertise im Bereich BHKW Service und Gasmotoren.', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_text_image_image', '/uploads/2026/01/1769673411-wn4m43ck.webp', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_text_image_image_alt', 'Über BSplus', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_text_image_align', 'left', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_text_image_mode', 'light', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_text_image_button_text', '', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_text_image_button_link', '', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_text_image_button_style', 'secondary', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Archive CTA section (dark)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'journal_cta_active', 'false', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_cta_title', 'Ihr Partner für BHKW Service', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_cta_content', 'Mit jahrzehntelanger Erfahrung und einem hochqualifizierten Team stehen wir Ihnen bei allen Fragen rund um Gasmotoren und BHKW zur Seite.', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_cta_image', '', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_cta_button1_text', 'Kontakt aufnehmen', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_cta_button1_link', '/kontakt', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_cta_button1_style', 'primary', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_cta_button2_text', '', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_cta_button2_link', '', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_cta_button2_style', 'secondary', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Single Post CTA section (dark)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'journal_single_cta_active', 'false', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_single_cta_title', 'Ihr Partner für BHKW Service', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_single_cta_content', 'Mit jahrzehntelanger Erfahrung und einem hochqualifizierten Team stehen wir Ihnen bei allen Fragen rund um Gasmotoren und BHKW zur Seite.', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_single_cta_image', '', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_single_cta_button1_text', 'Kontakt aufnehmen', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_single_cta_button1_link', '/kontakt', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_single_cta_button1_style', 'primary', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_single_cta_button2_text', '', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_single_cta_button2_link', '', NOW(), NOW()),
  (gen_random_uuid(), 'bs_plus', 'journal_single_cta_button2_style', 'secondary', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- BS Plus Journal PageHeader
INSERT INTO "PageHeader" (id, website, "pageSlug", title, description, "backgroundImage", "overlayColor", "textColor", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'bs_plus', 'journal', 'Journal', 'Neuigkeiten und Einblicke aus der Welt der BHKW und Gasmotoren', '/uploads/2026/01/1769673411-woyb79zh.webp', 'rgba(0, 0, 0, 0.4)', 'light', NOW(), NOW())
ON CONFLICT (website, "pageSlug") DO NOTHING;


-- ============================================
-- IPOWER JOURNAL SETTINGS
-- ============================================

-- SectionTextImage (Archive page)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'journal_text_image_active', 'true', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_text_image_title', 'Über iPower', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_text_image_content', 'Erat sit eget nascetur ultricies sed non vestibulum. Dui quam cursus dignissim in molestie sit amet quisque magna. Ultricies gravida ante faucibus non netus justo amet. Consectetur in justo natoque auctor eget. Pellentesque lectus facilisis pretium eget mauris tempor est nunc. Faucibus vitae ac magna blandit.', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_text_image_image', '/uploads/2026/01/1769673146-xxmulnug.jpg', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_text_image_image_alt', 'Über iPower', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_text_image_align', 'left', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_text_image_mode', 'light', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_text_image_button_text', 'Mehr über iPower', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_text_image_button_link', '/ueber-uns', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_text_image_button_style', 'secondary', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Archive CTA section (dark)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'journal_cta_active', 'true', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_cta_title', 'Wärmewende 100% erneuerbar', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_cta_content', 'Erneuerbare Wärmenetze unterscheiden sich von herkömmlichen Nah- und Fernwärmenetzen, weil sie auf fossile Brennstoffe verzichten. Wir setzten auf ungenutzte Abwärmepotenziale, vernetzen Sektoren und nutzen grüne Energie.', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_cta_image', '/uploads/2026/01/1769673146-y6yxs079.jpg', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_cta_button1_text', 'Termin vereinbaren', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_cta_button1_link', '/kontakt', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_cta_button1_style', 'primary', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_cta_button2_text', 'Angebot holen', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_cta_button2_link', '/kontakt', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_cta_button2_style', 'secondary', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- Single Post CTA section (dark)
INSERT INTO "Setting" (id, website, key, value, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'journal_single_cta_active', 'true', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_single_cta_title', 'Wärmewende 100% erneuerbar', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_single_cta_content', 'Erneuerbare Wärmenetze unterscheiden sich von herkömmlichen Nah- und Fernwärmenetzen, weil sie auf fossile Brennstoffe verzichten. Wir setzten auf ungenutzte Abwärmepotenziale, vernetzen Sektoren und nutzen grüne Energie.', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_single_cta_image', '/uploads/2026/01/1769673146-y6yxs079.jpg', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_single_cta_button1_text', 'Termin vereinbaren', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_single_cta_button1_link', '/kontakt', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_single_cta_button1_style', 'primary', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_single_cta_button2_text', 'Angebot holen', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_single_cta_button2_link', '/kontakt', NOW(), NOW()),
  (gen_random_uuid(), 'ipower', 'journal_single_cta_button2_style', 'secondary', NOW(), NOW())
ON CONFLICT (website, key) DO NOTHING;

-- iPower Journal PageHeader
INSERT INTO "PageHeader" (id, website, "pageSlug", title, description, "backgroundImage", "overlayColor", "textColor", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ipower', 'journal', 'Journal', 'Neuigkeiten und Einblicke aus der Welt der erneuerbaren Energien', '/uploads/2026/01/1769673132-4racdfx6.jpg', 'rgba(0, 0, 0, 0.4)', 'light', NOW(), NOW())
ON CONFLICT (website, "pageSlug") DO NOTHING;
