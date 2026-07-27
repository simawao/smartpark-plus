export type KocaeliPark = {
  name: string;
  district: string;
  neighborhood: string;
  occupancy: number;
  detail: string;
};

export const KOCAELI_DISTRICTS = [
  "Başiskele", "Çayırova", "Darıca", "Derince", "Dilovası", "Gebze",
  "Gölcük", "İzmit", "Kandıra", "Karamürsel", "Kartepe", "Körfez",
] as const;

export const KOCAELI_PARKS: KocaeliPark[] = [
  { name:"Seymen Millet Bahçesi", district:"Başiskele", neighborhood:"Seymen", occupancy:51, detail:"Çocuk oyun ve yeşil alanları" },
  { name:"Başiskele Sahili Parkı", district:"Başiskele", neighborhood:"Sahil", occupancy:63, detail:"Sahil yürüyüş ve bisiklet alanı" },
  { name:"Barbaros Mahallesi Parkı", district:"Başiskele", neighborhood:"Barbaros", occupancy:34, detail:"Mahalle parkı ve oyun alanı" },
  { name:"Bahçecik Mesire Alanı", district:"Başiskele", neighborhood:"Bahçecik", occupancy:42, detail:"Mesire ve piknik alanı" },
  { name:"Yuvacık Baraj Parkı", district:"Başiskele", neighborhood:"Yuvacık", occupancy:48, detail:"Seyir ve dinlenme alanı" },

  { name:"Çayırova Millet Bahçesi", district:"Çayırova", neighborhood:"Akse", occupancy:57, detail:"Spor, piknik ve oyun alanları" },
  { name:"Çayırova Şelale Parkı", district:"Çayırova", neighborhood:"Cumhuriyet", occupancy:46, detail:"Dinlenme ve yürüyüş alanı" },
  { name:"Prof. Dr. Necmettin Erbakan Parkı", district:"Çayırova", neighborhood:"Özgürlük", occupancy:39, detail:"Mahalle yaşam alanı" },
  { name:"Çağdaşkent Mesire Alanı", district:"Çayırova", neighborhood:"Çağdaşkent", occupancy:33, detail:"Piknik ve rekreasyon alanı" },

  { name:"Darıca Millet Bahçesi", district:"Darıca", neighborhood:"Bayramoğlu", occupancy:79, detail:"Sahil ve tematik bahçeler" },
  { name:"Darıca Sahil Parkı", district:"Darıca", neighborhood:"Cami", occupancy:71, detail:"Sahil yürüyüş alanı" },
  { name:"Bayramoğlu Balyanoz Koyu Parkı", district:"Darıca", neighborhood:"Bayramoğlu", occupancy:68, detail:"Kıyı ve dinlenme alanı" },
  { name:"Darıca Dudayev Parkı", district:"Darıca", neighborhood:"Kazım Karabekir", occupancy:43, detail:"Çocuk oyun ve spor alanı" },
  { name:"Nenehatun Parkı", district:"Darıca", neighborhood:"Nenehatun", occupancy:37, detail:"Mahalle parkı" },

  { name:"Derince Millet Bahçesi", district:"Derince", neighborhood:"Çınarlı", occupancy:44, detail:"Yürüyüş ve bisiklet yolları" },
  { name:"Harikalar Sahili", district:"Derince", neighborhood:"Yenikent", occupancy:72, detail:"Sahil ve tematik oyun alanları" },
  { name:"Çınarlıdere Mesire Alanı", district:"Derince", neighborhood:"Çınarlı", occupancy:38, detail:"Doğa ve piknik alanı" },
  { name:"60 Evler Sahil Parkı", district:"Derince", neighborhood:"60 Evler", occupancy:52, detail:"Sahil dinlenme alanı" },

  { name:"Dilovası Millet Bahçesi", district:"Dilovası", neighborhood:"Orhangazi", occupancy:47, detail:"Yaya ve bisiklet yolları" },
  { name:"Tavşancıl Sahil Parkı", district:"Dilovası", neighborhood:"Tavşancıl", occupancy:41, detail:"Sahil ve dinlenme alanı" },
  { name:"Diliskelesi Sahil Parkı", district:"Dilovası", neighborhood:"Diliskelesi", occupancy:36, detail:"Kıyı rekreasyon alanı" },
  { name:"Kayapınar Mahalle Parkı", district:"Dilovası", neighborhood:"Kayapınar", occupancy:28, detail:"Çocuk oyun alanı" },

  { name:"Gebze Millet Bahçesi", district:"Gebze", neighborhood:"Tatlıkuyu", occupancy:62, detail:"Spor ve rekreasyon alanları" },
  { name:"Eskihisar Sahil Parkı", district:"Gebze", neighborhood:"Eskihisar", occupancy:66, detail:"Sahil yürüyüş ve seyir alanı" },
  { name:"Gazilerdağı Tabiat Parkı", district:"Gebze", neighborhood:"Gaziler", occupancy:54, detail:"Doğa parkurları ve mesire alanı" },
  { name:"Tatlıkuyu Vadisi", district:"Gebze", neighborhood:"Tatlıkuyu", occupancy:45, detail:"Yürüyüş ve yeşil alan" },
  { name:"Beylikbağı Parkı", district:"Gebze", neighborhood:"Beylikbağı", occupancy:40, detail:"Mahalle yaşam alanı" },

  { name:"Gölcük Örcün Millet Bahçesi", district:"Gölcük", neighborhood:"Örcün", occupancy:55, detail:"Tematik bahçeler ve yürüyüş yolları" },
  { name:"Değirmendere Çınarlık Meydanı ve Sahili", district:"Gölcük", neighborhood:"Değirmendere", occupancy:69, detail:"Sahil ve anıt ağaç alanı" },
  { name:"Kavaklı Sahil Parkı", district:"Gölcük", neighborhood:"Kavaklı", occupancy:64, detail:"Spor ve sahil yürüyüş alanı" },
  { name:"Yazlık Ilıca Parkı", district:"Gölcük", neighborhood:"Yazlık", occupancy:31, detail:"Termal çevresi dinlenme alanı" },
  { name:"Hisareyn Spor ve Dinlenme Parkı", district:"Gölcük", neighborhood:"Hisareyn", occupancy:35, detail:"Spor ve çocuk oyun alanı" },

  { name:"Sekapark", district:"İzmit", neighborhood:"Kozluk", occupancy:82, detail:"Sahil, spor ve kültür alanları" },
  { name:"İzmit Millet Bahçesi", district:"İzmit", neighborhood:"Yahya Kaptan", occupancy:58, detail:"Kent parkı ve etkinlik alanları" },
  { name:"Doğu Kışla Gençlik Parkı", district:"İzmit", neighborhood:"Mehmet Ali Paşa", occupancy:61, detail:"Spor ve gençlik alanları" },
  { name:"Cephanelik Mesire Alanı", district:"İzmit", neighborhood:"Tepeköy", occupancy:49, detail:"Mesire ve yürüyüş parkurları" },
  { name:"Kuruçeşme Sahil Parkı", district:"İzmit", neighborhood:"Kuruçeşme", occupancy:53, detail:"Sahil dinlenme alanı" },
  { name:"Yahya Kaptan Şehit Polis Recep Topaloğlu Parkı", district:"İzmit", neighborhood:"Yahya Kaptan", occupancy:46, detail:"Mahalle parkı ve spor alanı" },

  { name:"Kandıra Millet Bahçesi", district:"Kandıra", neighborhood:"Akdurak", occupancy:38, detail:"Kent parkı ve rekreasyon alanı" },
  { name:"Kefken Sahil Parkı", district:"Kandıra", neighborhood:"Kefken", occupancy:74, detail:"Sahil ve dinlenme alanı" },
  { name:"Kerpe Sahil Parkı", district:"Kandıra", neighborhood:"Kerpe", occupancy:77, detail:"Kıyı yürüyüş ve seyir alanı" },
  { name:"Cebeci Sahil Parkı", district:"Kandıra", neighborhood:"Cebeci", occupancy:70, detail:"Sahil rekreasyon alanı" },
  { name:"Bağırganlı Sahil Parkı", district:"Kandıra", neighborhood:"Bağırganlı", occupancy:59, detail:"Kıyı ve piknik alanı" },

  { name:"Karamürsel Millet Bahçesi", district:"Karamürsel", neighborhood:"Kayacık", occupancy:45, detail:"Kent yaşam ve yeşil alanı" },
  { name:"Karamürsel Sahil Parkı", district:"Karamürsel", neighborhood:"4 Temmuz", occupancy:60, detail:"Sahil yürüyüş alanı" },
  { name:"Başdeğirmen Mesire Alanı", district:"Karamürsel", neighborhood:"Oluklu", occupancy:36, detail:"Doğa ve piknik alanı" },
  { name:"Altınkemer Halk Plajı Parkı", district:"Karamürsel", neighborhood:"Ereğli", occupancy:56, detail:"Kıyı ve rekreasyon alanı" },

  { name:"Ormanya Doğal Yaşam Parkı", district:"Kartepe", neighborhood:"Uzuntarla", occupancy:65, detail:"Doğa parkurları ve yaşam alanları" },
  { name:"Kartepe Kent Meydanı Parkı", district:"Kartepe", neighborhood:"Köseköy", occupancy:42, detail:"Kent meydanı ve yeşil alan" },
  { name:"Eşme Sahil Parkı", district:"Kartepe", neighborhood:"Eşme", occupancy:50, detail:"Göl kıyısı dinlenme alanı" },
  { name:"Acısu Parkı", district:"Kartepe", neighborhood:"Acısu", occupancy:34, detail:"Mahalle parkı ve oyun alanı" },
  { name:"Uzuntarla Mesire Alanı", district:"Kartepe", neighborhood:"Uzuntarla", occupancy:37, detail:"Mesire ve piknik alanı" },

  { name:"İlimtepe Millet Bahçesi", district:"Körfez", neighborhood:"İlimtepe", occupancy:48, detail:"Seyir, macera ve yürüyüş alanı" },
  { name:"Tütünçiftlik Sahil Parkı", district:"Körfez", neighborhood:"Tütünçiftlik", occupancy:67, detail:"Sahil yürüyüş ve spor alanı" },
  { name:"Yarımca Sahil Parkı", district:"Körfez", neighborhood:"Yarımca", occupancy:58, detail:"Kıyı ve dinlenme alanı" },
  { name:"Hereke Sahil Parkı", district:"Körfez", neighborhood:"Hereke", occupancy:51, detail:"Sahil ve kültürel çevre" },
  { name:"Kirazlıyalı Sahil Parkı", district:"Körfez", neighborhood:"Kirazlıyalı", occupancy:43, detail:"Mahalle sahil parkı" },
];

export function parksForDistrict(district: string) {
  return KOCAELI_PARKS.filter((park) => park.district === district);
}
