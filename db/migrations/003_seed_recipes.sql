-- Migration 003: Seed recipes from Obsidian Vault
-- Imports 17 recipe files (deduplicated where needed)

-- 1. 55g Protein Nudeln
INSERT INTO recipes (title, description, ingredients, instructions, servings, category, language, tags, created_by) VALUES (
  '55g Protein Nudeln',
  'High-Protein Noodle Dish with Chicken and Vegetables',
  '[{"amount":"60g","item":"Chaai noodles"},{"amount":"1","item":"Red bell pepper"},{"amount":"1","item":"Onion"},{"amount":"150g","item":"Asparagus"},{"amount":"180g","item":"Chicken breast"},{"amount":"20g","item":"Soy sauce"},{"amount":"20g","item":"Oyster sauce"},{"amount":"10g","item":"Honey"},{"amount":"","item":"Cornstarch"},{"amount":"","item":"Oil"},{"amount":"","item":"Salt"},{"amount":"","item":"Black pepper"},{"amount":"1/2 tsp","item":"Garlic powder"}]',
  '1. Cook the chaai noodles according to the package instructions (60g dry noodles, boil 3-4 minutes).
2. Chop 1 red bell pepper, 1 onion, and 150g asparagus into bite-sized pieces.
3. Cut 180g chicken breast into thin strips, about 1 cm thick.
4. Mix sauce: 20g soy sauce, 20g oyster sauce, 10g honey, and cornstarch.
5. Heat oil, cook vegetables 5-6 minutes until translucent and caramelized.
6. Add more oil, cook chicken strips 1-2 minutes per side.
7. Add noodles and sauce, stir everything together until well coated.
8. Serve hot.',
  '1', 'protein', 'en', '{"protein","noodles","chicken"}', 'human'
);

-- 2. Beeren mit Marshmallow
INSERT INTO recipes (title, description, ingredients, instructions, category, language, tags, created_by) VALUES (
  'Beeren mit Marshmallow',
  'Gegrillte Beeren mit Marshmallow — schnelles Dessert',
  '[{"amount":"","item":"Gefrorene Himbeeren"},{"amount":"","item":"Gefrorene Erdbeeren"},{"amount":"","item":"Schokolade"},{"amount":"1","item":"Mr. Tom Erdnuss Riegel"},{"amount":"","item":"Marshmallow"}]',
  'Alle Zutaten in einer Pfanne auf den Grill backen und warm servieren.',
  'dessert', 'de', '{"dessert","schnell","grillen"}', 'human'
);

-- 3. Curry Gemüsepuffer
INSERT INTO recipes (title, description, ingredients, instructions, servings, category, language, tags, created_by) VALUES (
  'Curry Gemüsepuffer',
  'Knusprige Gemüsepuffer mit Curry aus dem Ofen',
  '[{"amount":"1","item":"Zucchini (mittelgroß)"},{"amount":"1","item":"Karotte (mittelgroß)"},{"amount":"","item":"Lauchzwiebel (ein wenig)"},{"amount":"3-4 EL","item":"Mais (vorgekocht)"},{"amount":"80g","item":"Mehl"},{"amount":"30g","item":"Geriebener Parmesan"},{"amount":"4 EL","item":"Hafermilch"},{"amount":"1 EL","item":"Olivenöl"},{"amount":"1-2 TL","item":"Curry"},{"amount":"","item":"Salz"},{"amount":"","item":"Pfeffer"}]',
  '1. Backofen auf 220°C Ober-/Unterhitze vorheizen.
2. Zucchini und Karotte grob raspeln.
3. In einer großen Schüssel Zucchini, Karotten, Mais mit Mehl, Parmesan, Olivenöl, Gewürzen und Hafermilch vermischen.
4. Backblech mit Backpapier auslegen und dünn einfetten.
5. Gemüsemischung gleichmäßig auf dem Blech verteilen und dünn streichen.
6. Oberseite mit geriebenem Parmesan bestreuen.
7. 20-25 Minuten backen, bis goldbraun und knusprig.',
  NULL, 'vegetarisch', 'de', '{"vegetarisch","curry","ofen"}', 'human'
);

-- 4. Gemüsebratlinge
INSERT INTO recipes (title, description, ingredients, instructions, servings, category, language, tags, created_by) VALUES (
  'Gemüsebratlinge',
  'Hirse-Gemüsebratlinge mit Ziegenkäse und Joghurt-Curry-Dip',
  '[{"amount":"280g","item":"Hirse"},{"amount":"240g","item":"Spinat"},{"amount":"320g","item":"Paprikaschote rot"},{"amount":"160g","item":"Tofu geräuchert"},{"amount":"120g","item":"Ziegen-Schnittkäse (45% Fett)"},{"amount":"4","item":"Eier"},{"amount":"20g","item":"Stärke"},{"amount":"20ml","item":"Olivenöl"},{"amount":"200g","item":"Joghurt (1,5% Fett) für Dip"},{"amount":"","item":"Salz, Pfeffer, Curry für Dip"}]',
  '1. Hirse nach Packungsanweisung zubereiten und abkühlen lassen.
2. Spinat grob hacken. Paprika halbieren, Kerne entfernen. Mit Tofu in kleine Würfel schneiden. Käse reiben.
3. Eier, Stärke, Hirse, Spinat, Paprika, Tofu und Käse gut vermengen. Mit Salz und Pfeffer würzen. Mit feuchten Händen zu Bratlingen formen und in erhitztem Öl von jeder Seite ca. 5 Minuten goldbraun braten.
4. Für den Dip Joghurt mit Salz und Curry abschmecken und servieren.',
  '4 Portionen', 'vegetarisch', 'de', '{"vegetarisch","hirse","bratlinge"}', 'human'
);

-- 5. Gulasch Rezept (Böhmi brutzelt)
INSERT INTO recipes (title, description, ingredients, instructions, cook_time, source_url, category, language, tags, created_by) VALUES (
  'Gulasch (Böhmi brutzelt)',
  'Klassisches Gulasch nach dem Rezept der Aler Pusterhütte',
  '[{"amount":"800g","item":"Rinder Beinscheibe"},{"amount":"800g","item":"Zwiebeln"},{"amount":"2-3","item":"Knoblauchzehen"},{"amount":"","item":"Salz"},{"amount":"","item":"Pfeffer"},{"amount":"","item":"Paprika (edelsüß + rosenscharf)"},{"amount":"","item":"Thymian (getrocknet)"},{"amount":"","item":"Majoran (getrocknet)"},{"amount":"","item":"Kümmel (gemahlen)"},{"amount":"","item":"Rinderfett oder Öl"},{"amount":"","item":"Gemüsebrühe oder Wasser"},{"amount":"","item":"Rotwein (trocken)"},{"amount":"","item":"Tomatenmark"},{"amount":"","item":"Honig oder Agavendicksaft"}]',
  '1. Fleisch mit Salz, Pfeffer und Knoblauchflocken marinieren. Rinderfett in großem Topf erhitzen.
2. Zwiebeln grob hacken und im Fett anschwitzen, bis leicht blond.
3. Etwas Mehl zu den Zwiebeln hinzufügen, gut umrühren.
4. Mariniertes Fleisch hinzugeben und kurz anbraten.
5. Paprika, Thymian, Majoran, Kümmel und etwas Honig hinzufügen.
6. Mit Rotwein ablöschen, dann Gemüsebrühe/Wasser und Tomatenmark einrühren.
7. Deckel drauf und mindestens 1 Stunde köcheln lassen (ideal: 2-3 Stunden).
8. Zu Salzkartoffeln servieren.',
  '2-3 Stunden', 'https://www.youtube.com/watch?v=ORKe5Tb7Xus',
  'german', 'de', '{"fleisch","deutsch","eintopf"}', 'human'
);

-- 6. Healthy Noodle Bowl
INSERT INTO recipes (title, description, ingredients, instructions, servings, category, language, tags, created_by) VALUES (
  'Healthy Noodle Bowl',
  'Udon noodle bowl with chicken, mushrooms, and pak choy',
  '[{"amount":"250g","item":"Udon noodles"},{"amount":"250g","item":"Mushrooms"},{"amount":"1 head","item":"Pak Choy"},{"amount":"50g","item":"Yellow onion"},{"amount":"180g","item":"Chicken breast"},{"amount":"20g","item":"Soy sauce"},{"amount":"20g","item":"Rice vinegar"},{"amount":"10g","item":"Hoisin sauce"},{"amount":"10g","item":"Oyster sauce"},{"amount":"","item":"Chili flakes"},{"amount":"1 tsp","item":"Cornstarch"},{"amount":"","item":"Water, oil, salt"}]',
  '1. Slice mushrooms and set aside. Cut pak choy into bite-sized pieces. Chop onion. Slice chicken breast into finger-sized pieces.
2. Mix sauce: 20g soy sauce, 20g rice vinegar, 10g hoisin sauce, 10g oyster sauce, chili flakes.
3. Mix cornstarch slurry in a separate glass.
4. Heat oil, cook chicken 2 min per side, set aside.
5. Cook mushrooms with splash of water for 4-5 min.
6. Add vegetables with oil, cook 3-4 min.
7. Boil udon noodles 2-3 min.
8. Add chicken, noodles, sauce and slurry to pan. Stir 30-60 seconds.
9. Serve hot.',
  '1', 'asian', 'en', '{"noodles","chicken","healthy"}', 'human'
);

-- 7. Healthy Protein Blondies
INSERT INTO recipes (title, description, ingredients, instructions, prep_time, cook_time, category, language, tags, created_by) VALUES (
  'Healthy Protein Blondies',
  'Healthy blondie breakfast cake with oat flour, casein protein, and peanut butter',
  '[{"amount":"100g","item":"Oat flour (or blended rolled oats)"},{"amount":"60g","item":"Casein protein powder"},{"amount":"1/4 tsp","item":"Baking soda"},{"amount":"100g","item":"Peanut butter"},{"amount":"200g","item":"Sugar-free applesauce"},{"amount":"100g","item":"Skyr or Greek yogurt"},{"amount":"100g","item":"Semi-skimmed milk"},{"amount":"50g","item":"Blueberries (optional)"},{"amount":"40g","item":"Chocolate chips (optional)"}]',
  '1. Preheat oven to 180°C (350°F).
2. Add 100g oat flour, 60g casein protein powder, and 1/4 tsp baking soda to bowl. Stir.
3. Add 100g peanut butter, 200g applesauce, 100g skyr, and 100g milk. Mix until cookie dough consistency.
4. (Optional) Fold in 50g blueberries and 40g chocolate chips.
5. Line 18x12cm baking dish with parchment, spread batter.
6. Bake 25-30 minutes until top is browned.
7. Cool 30 minutes until set.',
  '10 min', '25-30 min', 'baking', 'en', '{"protein","baking","breakfast"}', 'human'
);

-- 8. Hot Honey Beef Bowl
INSERT INTO recipes (title, description, ingredients, instructions, servings, category, language, tags, created_by) VALUES (
  'Hot Honey Beef Bowl',
  'Sweet potato base with gochujang beef, avocado, cottage cheese and hot honey drizzle',
  '[{"amount":"250g","item":"Sweet potato"},{"amount":"7g","item":"Olive oil"},{"amount":"","item":"Salt, black pepper, paprika"},{"amount":"180g","item":"Extra lean ground beef (5% fat)"},{"amount":"10g","item":"Gochujang"},{"amount":"25g","item":"Soy sauce"},{"amount":"1/2","item":"Avocado"},{"amount":"100g","item":"Cottage cheese"},{"amount":"15g","item":"Honey"},{"amount":"15g","item":"Hot sauce (Franks or Sriracha)"}]',
  '1. Peel and cube sweet potato. Season with olive oil, salt, pepper, paprika.
2. Air fry at 200°C for 10-12 minutes (or use oven).
3. Heat pan with oil, sear ground beef 1 min per side, then break into pieces. Season with black pepper.
4. Mix gochujang + soy sauce, pour into pan with beef, stir-fry 20 seconds.
5. Slice half an avocado.
6. Mix hot honey: honey + hot sauce.
7. Assemble: sweet potatoes as base, beef on top, add avocado and cottage cheese.
8. Drizzle hot honey over everything.',
  '1', 'bowl', 'en', '{"protein","beef","bowl"}', 'human'
);

-- 9. Kartoffeln mit Chicken und grüne Soße
INSERT INTO recipes (title, description, ingredients, instructions, servings, category, language, tags, created_by) VALUES (
  'Kartoffeln mit Chicken und grüne Soße',
  'Crispy potatoes and chicken with a cottage cheese green sauce',
  '[{"amount":"300g","item":"Potatoes"},{"amount":"180g","item":"Chicken breast"},{"amount":"100g","item":"Cottage cheese"},{"amount":"1","item":"Garlic clove"},{"amount":"8g","item":"Oil"},{"amount":"1/4 tsp","item":"Garlic powder"},{"amount":"1/4 tsp","item":"Onion powder"},{"amount":"1/4 tsp","item":"Cayenne pepper"},{"amount":"1/4 tsp","item":"Smoked paprika"},{"amount":"","item":"Salt, black pepper"},{"amount":"20g","item":"Parmigiano-Reggiano or cheddar"},{"amount":"20g","item":"Fresh basil or spicy sauce"}]',
  '1. Wash and cube potatoes. Microwave at 600W for 5 minutes.
2. Slice chicken breast into thin pieces, cut in half.
3. Mix spice blend: garlic powder, onion powder, cayenne, smoked paprika, black pepper.
4. Blend sauce: 100g cottage cheese, garlic clove, salt, plus either parmesan+basil or cheddar+hot sauce. Add milk if needed.
5. Heat pan with 5g oil, fry potatoes with salt 4-5 minutes until golden and crispy.
6. Push potatoes aside, add 3g oil, cook chicken 1 min per side.
7. Sprinkle seasoning mix over everything, stir 1 minute.
8. Plate and drizzle green sauce on top.',
  '1', 'protein', 'en', '{"protein","chicken","kartoffeln"}', 'human'
);

-- 10. Parm Chicken Breast
INSERT INTO recipes (title, description, ingredients, instructions, servings, category, language, tags, created_by) VALUES (
  'Parm Chicken Breast',
  'Low-calorie chicken parmigiana with tomato sauce and mozzarella — 448 kcal, 57g protein',
  '[{"amount":"80g","item":"Chicken breast"},{"amount":"1.8g","item":"Salt"},{"amount":"5g","item":"All-purpose flour"},{"amount":"30g","item":"Egg whites"},{"amount":"20g","item":"Panko breadcrumbs"},{"amount":"60g","item":"Tomato sauce (e.g. Barilla)"},{"amount":"","item":"Chili flakes (optional)"},{"amount":"60g","item":"Fresh mozzarella (or 30g shredded)"}]',
  '1. Dry brine chicken: sprinkle 1.8g salt on both sides. Refrigerate at least 1 hour or overnight.
2. Coat chicken with 5g flour on both sides.
3. Dip in 30g egg whites on both sides.
4. Coat with 20g panko breadcrumbs on both sides.
5. Air fry at 200°C for 8-10 minutes (slightly undercooked).
6. Spread 60g tomato sauce on top, add chili flakes.
7. Slice 60g fresh mozzarella, place on top.
8. Air fry 2-3 more minutes until cheese is melted and bubbly.',
  '1', 'protein', 'en', '{"protein","chicken","airfryer"}', 'human'
);

-- 11. Protein Rezepte — Overnight Oats
INSERT INTO recipes (title, description, ingredients, instructions, servings, category, language, tags, created_by) VALUES (
  'Overnight Oats (Protein)',
  'High-protein overnight oats with quark and peanut butter — 622 kcal, 38g protein',
  '[{"amount":"50g","item":"Oats"},{"amount":"10g","item":"Chia seeds"},{"amount":"13g","item":"Powdered peanuts"},{"amount":"10g","item":"Regular peanut butter"},{"amount":"100g","item":"Unsweetened applesauce"},{"amount":"150g","item":"Quark or non-fat Greek yogurt"},{"amount":"15g","item":"Honey"},{"amount":"100g","item":"1.5% fat or fat-free milk"}]',
  '1. In a bowl, combine oats, chia seeds, powdered peanuts, and peanut butter.
2. Add applesauce and mix well.
3. Add quark (or yogurt) and mix until smooth.
4. Add honey and mix well.
5. Add milk and mix until combined.
6. Refrigerate overnight and serve in the morning.',
  '1', 'protein', 'en', '{"protein","breakfast","mealprep"}', 'human'
);

-- 12. Protein Rezepte — Spicy Creamy Noodle Bowl
INSERT INTO recipes (title, description, ingredients, instructions, servings, category, language, tags, created_by) VALUES (
  'Spicy Creamy Noodle Bowl (Protein)',
  'High-protein udon noodle bowl with gochujang mayo sauce — 706 kcal, 49g protein',
  '[{"amount":"200g","item":"Udon noodles"},{"amount":"180g","item":"Chicken breast"},{"amount":"90g","item":"Chopped red bell peppers and onions"},{"amount":"25g","item":"Light mayonnaise"},{"amount":"15g","item":"Gochujang"},{"amount":"10g","item":"Honey"},{"amount":"3g","item":"Oil"},{"amount":"","item":"Salt, black pepper, garlic powder"}]',
  '1. Cook udon noodles according to package.
2. Slice chicken into bite-sized pieces, season with salt, pepper, garlic powder.
3. Heat oil, sauté vegetables until translucent.
4. Add chicken, cook until browned.
5. Mix sauce: mayonnaise, gochujang, honey.
6. Add noodles and sauce to pan, stir to combine.
7. Serve.',
  '1', 'protein', 'en', '{"protein","noodles","spicy"}', 'human'
);

-- 13. Protein Rezepte — Custard Banana Split
INSERT INTO recipes (title, description, ingredients, instructions, servings, category, language, tags, created_by) VALUES (
  'Protein Custard Banana Split',
  'High-protein vanilla custard with banana and yogurt — 315 kcal, 21g protein',
  '[{"amount":"40g","item":"Instant vanilla pudding powder"},{"amount":"200g","item":"Milk"},{"amount":"30g","item":"Vanilla casein protein powder"},{"amount":"100g","item":"Banana"},{"amount":"100g","item":"Non-fat Greek yogurt"},{"amount":"","item":"Blueberries (optional)"}]',
  '1. Mix pudding powder with milk, whisk until thickened.
2. Add casein protein powder, whisk until smooth.
3. Slice banana, top with custard and yogurt.
4. Add blueberries if desired.',
  '1', 'dessert', 'en', '{"protein","dessert","schnell"}', 'human'
);

-- 14. Protein Rezepte — Quesadillas
INSERT INTO recipes (title, description, ingredients, instructions, servings, category, language, tags, created_by) VALUES (
  'Protein Quesadillas',
  'High-protein quesadillas with deli meat and mozzarella — 716 kcal, 63g protein',
  '[{"amount":"2x 40g","item":"Protein tortillas"},{"amount":"120g","item":"Deli meat (chicken, pork or beef)"},{"amount":"50g","item":"Yellow onion"},{"amount":"50g","item":"Shredded mozzarella cheese"},{"amount":"3g","item":"Oil"},{"amount":"","item":"Salt, black pepper, garlic powder, cayenne"}]',
  '1. Chop deli meat and onion into bite-sized pieces.
2. Heat oil, cook meat and onions until caramelized.
3. Add shredded mozzarella, stir until melted.
4. Place mixture onto tortillas, fold in half.
5. Cook in pan until crispy and golden brown on both sides.',
  '1', 'protein', 'en', '{"protein","quesadilla","schnell"}', 'human'
);

-- 15. Ramen - Tokyo Style
INSERT INTO recipes (title, description, ingredients, instructions, prep_time, cook_time, servings, category, language, tags, created_by) VALUES (
  'Ramen - Tokyo Style',
  'Authentic Tokyo-style ramen with pork broth, tare sauce, and all the toppings',
  '[{"amount":"3180g","item":"Pork and chicken bones"},{"amount":"135g","item":"Ginger"},{"amount":"2","item":"Leeks"},{"amount":"900g","item":"Boneless pork shoulder"},{"amount":"15g","item":"Kosher salt"},{"amount":"35g","item":"Garlic"},{"amount":"20g","item":"Sesame oil"},{"amount":"500g","item":"Soy sauce"},{"amount":"200ml","item":"Sake"},{"amount":"100ml","item":"Mirin"},{"amount":"55g","item":"Chopped scallions"},{"amount":"6","item":"Eggs"},{"amount":"200g","item":"Hon shimeji mushrooms"},{"amount":"10g","item":"Sesame seeds"},{"amount":"200g","item":"Baby spinach"},{"amount":"300g","item":"Ramen noodles"}]',
  '1. Broth: Combine bones with cold water, boil, then simmer. Skim foam 10 min. Add ginger and leeks. Simmer 6+ hours (overnight ideal).
2. Pork: Cut 900g shoulder into chunks, salt with 15g kosher salt. Add to broth, simmer 2 hours.
3. Tare: In cold pan combine garlic, ginger, sesame oil. Heat 1 min. Add soy sauce, sake, mirin. Boil, turn off. Stir in scallions.
4. Marinate pork with tare sauce 30+ min. Soft-boil eggs (6 min), ice bath, peel.
5. Sauté mushrooms with water, salt, sesame oil. Toast sesame seeds, wilt spinach.
6. Cook ramen noodles per package.
7. Assemble: tare in bowl, add broth, noodles, top with pork, eggs, mushrooms, spinach, scallions.',
  '30 min', '6+ Stunden', '4-6', 'asian', 'en', '{"ramen","japanese","aufwendig"}', 'human'
);

-- 16. Shirataki Noodles for Weight Loss
INSERT INTO recipes (title, description, ingredients, instructions, servings, category, language, tags, created_by) VALUES (
  'Shirataki Noodles Stir-Fry',
  'Spicy shirataki noodle stir-fry with chicken — low calorie, high protein',
  '[{"amount":"200g","item":"Shirataki noodles"},{"amount":"50g","item":"White onion"},{"amount":"150g","item":"Chicken breast"},{"amount":"10g","item":"Gochujang"},{"amount":"10g","item":"Mirin"},{"amount":"10g","item":"Rice vinegar"},{"amount":"2 cloves","item":"Garlic"},{"amount":"2g","item":"Sesame oil (optional)"},{"amount":"","item":"Salt"},{"amount":"","item":"Black pepper"}]',
  '1. Wash and rinse shirataki noodles under cold water, let sit a few minutes.
2. Dice 50g onion into small chunks. Cut 150g chicken into small cubes.
3. Mix sauce: gochujang, mirin, rice vinegar, pressed garlic, sesame oil, salt, pepper.
4. Fry chicken until browned on one side.
5. Add onion, stir-fry 1-2 minutes.
6. Remove chicken and onion, set aside.
7. Fry shirataki noodles 2-3 minutes until liquid evaporates and noodles get crispy.
8. Add chicken and onion back, pour sauce over everything.
9. Stir-fry 1 more minute. Serve from pan.',
  '1', 'asian', 'en', '{"lowcal","noodles","chicken"}', 'human'
);

-- 17. Simple Vegan Kimchi
INSERT INTO recipes (title, description, ingredients, instructions, prep_time, cook_time, source_url, category, language, tags, created_by) VALUES (
  'Simple Vegan Kimchi',
  'Einfaches veganes Kimchi nach Pick Up Limes — fermentiert 1-3 Tage',
  '[{"amount":"1","item":"Napa-Kohl (in 2cm Stücke)"},{"amount":"27g","item":"Grobes Meersalz (ohne Jod)"},{"amount":"1/2","item":"Kleine Zwiebel"},{"amount":"5","item":"Knoblauchzehen"},{"amount":"1/2","item":"Rote Apfelhälfte"},{"amount":"1/2 EL","item":"Frischer Ingwer (gerieben)"},{"amount":"1/4 Tasse","item":"Gochugaru (koreanisches Chilipulver)"},{"amount":"1/2 Tasse","item":"Gemüsebrühe"},{"amount":"2 EL","item":"Reduzierte-Natrium-Sojasauce"},{"amount":"1 EL","item":"Weiße Miso-Paste"},{"amount":"3","item":"Frühlingszwiebel-Stängel (5cm Stücke)"},{"amount":"1","item":"Karotte (in Stifte)"}]',
  '1. Kohl und Salz in große Schüssel geben. 2-3 Minuten sanft massieren bis der Kohl weich wird.
2. Kimchi-Paste: Alle Paste-Zutaten (Zwiebel, Knoblauch, Apfel, Ingwer, Gochugaru, Brühe, Sojasauce, Miso) in Food Processor mixen bis glatt.
3. Paste mit Frühlingszwiebeln und Karotten mischen.
4. Kohl 2 Stunden stehen lassen, dann unter kaltem Wasser abspülen und abtropfen.
5. Paste + Kohl + Gemüse mit Händen gut durchmengen.
6. Fest in ein Glas drücken (2cm Platz oben lassen), verschließen.
7. Fermentation: Über Nacht (24h) bei Raumtemperatur. Täglich öffnen zum Entgasen. Für mehr Säure 1-3 Tage weiter fermentieren.
8. In den Kühlschrank stellen, 1-2 Wochen weiter reifen lassen. Haltbar ca. 3 Monate.',
  '30 min', '1-3 Tage Fermentation',
  NULL, 'vegan', 'de', '{"vegan","fermentation","koreanisch"}', 'human'
);

-- 18. Thai Protein Nudeln
INSERT INTO recipes (title, description, ingredients, instructions, servings, source_url, category, language, tags, created_by) VALUES (
  'Thai Protein Nudeln',
  'Thai-style rice noodle stir-fry with chicken — 729 kcal, 61g protein',
  '[{"amount":"60g","item":"Dry rice noodles"},{"amount":"1","item":"Red bell pepper"},{"amount":"50g","item":"Yellow onion"},{"amount":"150g","item":"Broccoli florets"},{"amount":"1 clove","item":"Garlic (grated)"},{"amount":"180g","item":"Chicken breast"},{"amount":"20g","item":"Light soy sauce"},{"amount":"20g","item":"Dark soy sauce"},{"amount":"10g","item":"Oyster sauce"},{"amount":"5g","item":"Rice vinegar"},{"amount":"5g","item":"Honey"},{"amount":"1","item":"Egg"},{"amount":"6g","item":"Oil (divided)"},{"amount":"","item":"Salt, black pepper"}]',
  '1. Cook broccoli in boiling water 2-3 minutes, set aside.
2. Soak rice noodles in hot water 15+ minutes, drain.
3. Heat 3g oil, cook chicken until browned (~2 min), set aside.
4. Add 3g oil, sauté peppers and onion 3 minutes.
5. Add broccoli, sauté 2 more minutes.
6. Add grated garlic, stir 15 seconds.
7. Crack in egg, mix with vegetables.
8. Add noodles and sauce (soy sauces, oyster sauce, vinegar, honey), stir together.
9. Add chicken back, stir until heated through.
10. Serve in bowl.',
  '1', 'https://youtu.be/WueYEMPWtfw?si=A5ke2aATclytkvvd',
  'asian', 'en', '{"protein","thai","noodles"}', 'human'
);

-- 19. Türkisches Fladenbrot
INSERT INTO recipes (title, description, ingredients, instructions, servings, source_url, category, language, tags, created_by) VALUES (
  'Türkisches Fladenbrot',
  'Weiches Fladenbrot aus der Pfanne — ohne Ofen',
  '[{"amount":"10g","item":"Trockenhefe (2 TL)"},{"amount":"10g","item":"Zucker (2 TL)"},{"amount":"165ml","item":"Warmes Wasser"},{"amount":"165ml","item":"Warme Milch"},{"amount":"500g","item":"Mehl"},{"amount":"5g","item":"Salz (1 TL)"},{"amount":"15ml","item":"Olivenöl (1 EL)"},{"amount":"","item":"Petersilie (gehackt)"},{"amount":"","item":"Roter Pfeffer"}]',
  '1. Trockenhefe und Zucker in Schüssel geben.
2. Warmes Wasser und warme Milch hinzufügen, rühren um Hefe aufzulösen.
3. 10 Minuten zudecken.
4. 500g Mehl sieben, 1 TL Salz hinzufügen.
5. Hefeflüssigkeit hinzugeben und mit Löffel mischen.
6. 1 EL Olivenöl hinzufügen.
7. Teig 2 Minuten mit Händen kneten (weich und etwas klebrig).
8. 1 Stunde abgedeckt an warmem Ort gehen lassen.
9. In 6 gleiche Teile teilen, Kugeln formen.
10. Jeden Teil zu einem Kreis (18cm Durchmesser, 5mm dick) ausrollen.
11. In heißer Pfanne ohne Öl bei mittlerer Hitze ca. 3 Minuten backen.
12. Wenn Blasen erscheinen, umdrehen. Beide Seiten goldbraun braten.
13. Sofort mit Geschirrtuch abdecken, damit sie weich bleiben.
14. Mit Olivenöl bepinseln, Petersilie und roten Pfeffer bestreuen.',
  '6 Stück', 'https://www.youtube.com/watch?v=QKlH8K0uMvQ',
  'german', 'de', '{"brot","tuerkisch","pfanne"}', 'human'
);
