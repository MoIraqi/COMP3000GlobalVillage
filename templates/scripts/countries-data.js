// scripts/countries-data.js
// Dataset for Global Village — each entry contains cultural information.

window.GV_COUNTRIES = [
  // === ASIA ===
  {
    name: 'Japan',
    continent: 'Asia',
    code: 'jp',
    flag: 'https://flagcdn.com/w320/jp.png',
    holidays: ['Golden Week', 'Obon'],
    foods: [
      { name: 'Sushi', image: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Sushi_platter.jpg' },
      { name: 'Ramen', image: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Tonkotsu_ramen_by_Matsuri.jpg' }
    ],
    clothes: [
      { name: 'Kimono', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Japanese_Kimono.jpg' },
      { name: 'Yukata', image: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Yukata_girls.jpg' }
    ]
  },
  {
    name: 'China',
    continent: 'Asia',
    code: 'cn',
    flag: 'https://flagcdn.com/w320/cn.png',
    holidays: ['Spring Festival', 'Mid-Autumn Festival'],
    foods: [
      { name: 'Dumplings', image: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Jiaozi_dumplings.jpg' },
      { name: 'Hot Pot', image: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Chinese_hot_pot.jpg' }
    ],
    clothes: [
      { name: 'Qipao', image: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Qipao_2018.jpg' },
      { name: 'Hanfu', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Hanfu_Women.jpg' }
    ]
  },
  {
    name: 'Palestine',
    continent: 'Asia',
    code: 'ps',
    flag: 'https://flagcdn.com/w320/ps.png',
    holidays: ['Eid al-Fitr', 'Eid al-Adha'],
    foods: [
      { name: 'Musakhan', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Musakhan.jpg' },
      { name: 'Maqluba', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Maqluba.jpg' }
    ],
    clothes: [
      { name: 'Thobe', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Palestinian_thobe.jpg' },
      { name: 'Keffiyeh', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Keffiyeh_black_and_white.jpg' }
    ]
  },
  {
    name: 'Thailand',
    continent: 'Asia',
    code: 'th',
    flag: 'https://flagcdn.com/w320/th.png',
    holidays: ['Songkran', 'Loy Krathong'],
    foods: [
      { name: 'Pad Thai', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Pad_Thai_Bangkok.jpg' },
      { name: 'Tom Yum', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Tom_yum_goong_2.jpg' }
    ],
    clothes: [
      { name: 'Chut Thai', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Thai_Traditional_Dress.jpg' },
      { name: 'Sabai', image: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Sabai_Thai_Traditional.jpg' }
    ]
  },

  // === EUROPE ===
  {
    name: 'Italy',
    continent: 'Europe',
    code: 'it',
    flag: 'https://flagcdn.com/w320/it.png',
    holidays: ['Ferragosto', 'Carnevale di Venezia'],
    foods: [
      { name: 'Pizza', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Supreme_pizza.jpg' },
      { name: 'Pasta', image: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Spaghetti_alla_Carbonara.jpg' }
    ],
    clothes: [
      { name: 'Folk Costume', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Italian_folk_costume.jpg' },
      { name: 'Modern Fashion', image: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Milan_fashion_week.jpg' }
    ]
  },
  {
    name: 'Greece',
    continent: 'Europe',
    code: 'gr',
    flag: 'https://flagcdn.com/w320/gr.png',
    holidays: ['Ohi Day', 'Greek Easter'],
    foods: [
      { name: 'Moussaka', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Moussaka_Greek_2017.jpg' },
      { name: 'Souvlaki', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Souvlaki_Plate.jpg' }
    ],
    clothes: [
      { name: 'Fustanella', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Greek_fustanella.jpg' },
      { name: 'Evzone Uniform', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Evzone_guard_Athens.jpg' }
    ]
  },

  // === AFRICA ===
  {
    name: 'Morocco',
    continent: 'Africa',
    code: 'ma',
    flag: 'https://flagcdn.com/w320/ma.png',
    holidays: ['Eid al-Fitr', 'Mawlid'],
    foods: [
      { name: 'Tagine', image: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Moroccan_tagine.jpg' },
      { name: 'Couscous', image: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Couscous_royal.jpg' }
    ],
    clothes: [
      { name: 'Djellaba', image: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Moroccan_Djellaba.jpg' },
      { name: 'Kaftan', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Moroccan_Kaftan_2017.jpg' }
    ]
  },
  {
    name: 'South Africa',
    continent: 'Africa',
    code: 'za',
    flag: 'https://flagcdn.com/w320/za.png',
    holidays: ['Heritage Day', 'Freedom Day'],
    foods: [
      { name: 'Bobotie', image: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Bobotie_of_South_Africa.jpg' },
      { name: 'Biltong', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Biltong.jpg' }
    ],
    clothes: [
      { name: 'Madiba Shirt', image: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Madiba_Shirt.jpg' },
      { name: 'Traditional Prints', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Zulu_attire_SA.jpg' }
    ]
  },

  // === AMERICAS ===
  {
    name: 'Mexico',
    continent: 'North America',
    code: 'mx',
    flag: 'https://flagcdn.com/w320/mx.png',
    holidays: ['Día de Muertos', 'Cinco de Mayo'],
    foods: [
      { name: 'Tacos', image: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Tacos_de_asada.jpg' },
      { name: 'Mole', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Mole_Poblano.jpg' }
    ],
    clothes: [
      { name: 'Huipil', image: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Huipil_Mexico.jpg' },
      { name: 'Charro Suit', image: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Charro_Mariachi.jpg' }
    ]
  },
  {
    name: 'Brazil',
    continent: 'South America',
    code: 'br',
    flag: 'https://flagcdn.com/w320/br.png',
    holidays: ['Carnaval', 'Festas Juninas'],
    foods: [
      { name: 'Feijoada', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Feijoada.jpg' },
      { name: 'Brigadeiro', image: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Brigadeiro.jpg' }
    ],
    clothes: [
      { name: 'Baiana Dress', image: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Baiana_dress.jpg' },
      { name: 'Samba Costume', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Rio_Carnival_dancer.jpg' }
    ]
  },

  // === OCEANIA ===
  {
    name: 'Australia',
    continent: 'Oceania',
    code: 'au',
    flag: 'https://flagcdn.com/w320/au.png',
    holidays: ['Australia Day', 'ANZAC Day'],
    foods: [
      { name: 'Lamingtons', image: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Lamingtons.jpg' },
      { name: 'Pavlova', image: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Pavlova.jpg' }
    ],
    clothes: [
      { name: 'Akubra Hat', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Akubra_hat.jpg' },
      { name: 'Driza-Bone Coat', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Driza-bone_coat.jpg' }
    ]
  }
];
