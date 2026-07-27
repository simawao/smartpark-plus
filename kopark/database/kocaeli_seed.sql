USE smartpark_plus;

INSERT IGNORE INTO roles (id, name, description) VALUES
(1, 'admin', 'Sistem yöneticisi'),
(2, 'operator', 'Kocaeli park operasyon görevlisi'),
(3, 'staff', 'Saha personeli'),
(4, 'citizen', 'Vatandaş');

INSERT IGNORE INTO districts (id, name) VALUES
(1, 'Başiskele'), (2, 'Çayırova'), (3, 'Darıca'), (4, 'Derince'),
(5, 'Dilovası'), (6, 'Gebze'), (7, 'Gölcük'), (8, 'İzmit'),
(9, 'Kandıra'), (10, 'Karamürsel'), (11, 'Kartepe'), (12, 'Körfez');

INSERT IGNORE INTO neighborhoods (id, district_id, name) VALUES
(1, 8, 'Kozluk'), (2, 8, 'Yahya Kaptan'), (3, 11, 'Uzuntarla'),
(4, 3, 'Bayramoğlu'), (5, 6, 'Tatlıkuyu'), (6, 4, 'Çınarlı'),
(7, 7, 'Örcün'), (8, 5, 'Orhangazi'), (9, 1, 'Seymen');

INSERT IGNORE INTO parks
(id, district_id, neighborhood_id, name, description, latitude, longitude, capacity, density, opening_time, closing_time, status)
VALUES
(1, 8, 1, 'Sekapark', 'İzmit Körfezi kıyısındaki kültür, spor ve rekreasyon parkı.', 40.7584000, 29.9050000, 3000, 82, '06:00', '23:59', 'maintenance'),
(2, 8, 2, 'İzmit Millet Bahçesi', 'İzmit Fuar Park alanındaki kent parkı.', 40.7592000, 29.9367000, 2500, 58, '06:00', '23:00', 'active'),
(3, 11, 3, 'Ormanya Doğal Yaşam Parkı', 'Kartepe doğal yaşam, eğitim ve rekreasyon alanı.', 40.7078000, 30.1597000, 5000, 65, '09:00', '20:00', 'active'),
(4, 3, 4, 'Darıca Millet Bahçesi', 'Sahil, tematik bahçeler ve sosyal donatı alanları.', 40.7544000, 29.3845000, 4500, 79, '06:00', '23:00', 'maintenance'),
(5, 6, 5, 'Gebze Millet Bahçesi', 'Gebze yeşil alan ve spor odaklı kent parkı.', 40.7970000, 29.4305000, 3200, 62, '06:00', '23:00', 'active'),
(6, 4, 6, 'Derince Millet Bahçesi', 'Yürüyüş ve bisiklet yollarına sahip rekreasyon alanı.', 40.7678000, 29.8172000, 1400, 44, '06:00', '22:00', 'active'),
(7, 7, 7, 'Gölcük Örcün Millet Bahçesi', 'Tematik bahçeler ve yürüyüş yollarına sahip yaşam alanı.', 40.7034000, 29.8269000, 1100, 55, '06:00', '22:00', 'maintenance'),
(8, 5, 8, 'Dilovası Millet Bahçesi', 'Yaya ve bisiklet yollarıyla ilçenin ortak yaşam alanı.', 40.7877000, 29.5384000, 1800, 47, '06:00', '22:00', 'active'),
(9, 1, 9, 'Seymen Millet Bahçesi', 'Başiskele yeşil koridor ve çocuk oyun alanları.', 40.6781000, 29.9504000, 2400, 51, '06:00', '22:00', 'active');

INSERT IGNORE INTO equipment_types (id, name, maintenance_interval_days) VALUES
(1, 'Bank', 180), (2, 'Kamelya', 180), (3, 'Çocuk Oyun Grubu', 90),
(4, 'Fitness Alanı', 90), (5, 'Aydınlatma', 60), (6, 'Çöp Kutusu', 30),
(7, 'Çeşme', 60), (8, 'Tuvalet', 30), (9, 'Spor Sahası', 90);
