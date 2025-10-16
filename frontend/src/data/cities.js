// Список городов для автокомплита
const citiesList = [
  // США
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington',
  'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore',
  'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs',
  'Raleigh', 'Miami', 'Virginia Beach', 'Omaha', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans',

  // Канада
  'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener',
  'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'Regina', 'Sherbrooke', 'St. Johns', 'Barrie',

  // Великобритания
  'London UK', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Leicester',
  'Coventry', 'Cardiff', 'Belfast', 'Nottingham', 'Hull', 'Newcastle UK', 'Stoke-on-Trent', 'Southampton', 'Derby', 'Portsmouth',

  // Германия
  'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig',
  'Bremen', 'Dresden', 'Hannover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster',

  // Франция
  'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille',
  'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne',

  // Испания
  'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao',
  'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet', 'Vitoria', 'A Coruña', 'Granada', 'Elche',

  // Италия
  'Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania',
  'Venice', 'Verona', 'Messina', 'Padua', 'Trieste', 'Brescia', 'Parma', 'Taranto', 'Prato', 'Modena',

  // Россия
  'Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod', 'Kazan', 'Chelyabinsk', 'Omsk', 'Samara', 'Rostov-on-Don',
  'Ufa', 'Krasnoyarsk', 'Perm', 'Voronezh', 'Volgograd', 'Krasnodar', 'Saratov', 'Tyumen', 'Tolyatti', 'Izhevsk',

  // Украина
  'Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Donetsk', 'Zaporizhzhia', 'Lviv', 'Kryvyi Rih', 'Mykolaiv', 'Mariupol',
  'Luhansk', 'Vinnytsia', 'Kherson', 'Poltava', 'Chernihiv', 'Cherkasy', 'Zhytomyr', 'Sumy', 'Khmelnytskyi', 'Rivne',

  // Польша
  'Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Katowice',
  'Białystok', 'Gdynia', 'Częstochowa', 'Radom', 'Sosnowiec', 'Toruń', 'Kielce', 'Gliwice', 'Zabrze', 'Bytom',

  // Нидерланды
  'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen',
  'Enschede', 'Haarlem', 'Arnhem', 'Zaanstad', 'Amersfoort', 'Apeldoorn', 'Hoofddorp', 'Maastricht', 'Leiden', 'Dordrecht',

  // Бельгия
  'Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons', 'Aalst',
  'Mechelen', 'La Louvière', 'Kortrijk', 'Hasselt', 'Ostend', 'Sint-Niklaas', 'Tournai', 'Genk', 'Seraing', 'Roeselare',

  // Швейцария
  'Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Winterthur', 'Lucerne', 'St. Gallen', 'Lugano', 'Biel',
  'Thun', 'Köniz', 'La Chaux-de-Fonds', 'Fribourg', 'Schaffhausen', 'Chur', 'Vernier', 'Neuchâtel', 'Uster', 'Sion',

  // Австрия
  'Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten', 'Dornbirn',
  'Steyr', 'Wiener Neustadt', 'Feldkirch', 'Bregenz', 'Leonding', 'Klosterneuburg', 'Baden', 'Wolfsberg', 'Leoben', 'Krems',

  // Швеция
  'Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping',
  'Lund', 'Umeå', 'Gävle', 'Borås', 'Södertälje', 'Karlstad', 'Eskilstuna', 'Sundsvall', 'Halmstad', 'Växjö',

  // Норвегия
  'Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Bærum', 'Kristiansand', 'Fredrikstad', 'Tromsø', 'Drammen', 'Skien',
  'Ålesund', 'Tønsberg', 'Moss', 'Haugesund', 'Sandefjord', 'Arendal', 'Sandnes', 'Bodø', 'Hamar',

  // Дания
  'Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens', 'Vejle', 'Roskilde',
  'Herning', 'Silkeborg', 'Næstved', 'Fredericia', 'Viborg', 'Køge', 'Holstebro', 'Taastrup', 'Slagelse', 'Hillerød',

  // Финляндия
  'Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Turku', 'Oulu', 'Jyväskylä', 'Lahti', 'Kuopio', 'Pori',
  'Kouvola', 'Joensuu', 'Lappeenranta', 'Hämeenlinna', 'Vaasa', 'Seinäjoki', 'Rovaniemi', 'Mikkeli', 'Kotka', 'Salo',

  // Австралия
  'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle AU', 'Canberra', 'Sunshine Coast', 'Wollongong',
  'Hobart', 'Geelong', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston',

  // Япония
  'Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki', 'Kyoto', 'Saitama',
  'Hiroshima', 'Sendai', 'Kitakyushu', 'Chiba', 'Sakai', 'Niigata', 'Hamamatsu', 'Okayama', 'Sagamihara', 'Kumamoto',

  // Южная Корея
  'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang',
  'Yongin', 'Bucheon', 'Ansan', 'Anyang', 'Namyangju', 'Hwaseong', 'Cheongju', 'Jeonju', 'Cheonan', 'Gimhae',

  // Китай
  'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Tianjin', 'Wuhan', 'Dongguan', 'Chengdu', 'Nanjing', 'Xi\'an',
  'Hangzhou', 'Foshan', 'Shenyang', 'Harbin', 'Qingdao', 'Dalian', 'Jinan', 'Zhengzhou', 'Changsha', 'Kunming',

  // Индия
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',

  // Бразилия
  'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia',
  'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Natal', 'Teresina',

  // Мексика
  'Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Torreón', 'Querétaro', 'San Luis Potosí',
  'Mérida', 'Mexicali', 'Aguascalientes', 'Acapulco', 'Culiacán', 'Saltillo', 'Hermosillo', 'Morelia', 'Reynosa', 'Tampico',

  // Аргентина
  'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Tucumán', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan',
  'Resistencia', 'Neuquén', 'Santiago del Estero', 'Corrientes', 'Posadas', 'San Salvador de Jujuy', 'Bahía Blanca', 'Paraná', 'Formosa', 'San Luis',

  // Чили
  'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Arica', 'Chillán',
  'Iquique', 'Los Ángeles', 'Puerto Montt', 'Valdivia', 'Osorno', 'Quilpué', 'Curicó', 'Villa Alemana', 'Coronel', 'San Antonio CL',

  // Колумбия
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué',
  'Pasto', 'Manizales', 'Neiva', 'Villavicencio', 'Armenia', 'Valledupar', 'Montería', 'Sincelejo', 'Popayán', 'Buenaventura',

  // Перу
  'Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco', 'Chimbote', 'Huancayo', 'Tacna',
  'Ica', 'Juliaca', 'Sullana', 'Chincha Alta', 'Huaraz', 'Cajamarca', 'Puno', 'Tumbes', 'Talara', 'Huaral',

  // Венесуэла
  'Caracas', 'Maracaibo', 'Valencia VE', 'Barquisimeto', 'Maracay', 'Ciudad Guayana', 'San Cristóbal', 'Maturín', 'Ciudad Bolívar', 'Cumana',
  'Cabimas', 'Mérida', 'Puerto La Cruz', 'Barinas', 'Los Teques', 'Punto Fijo', 'Guarenas', 'Acarigua', 'Turmero', 'Carora',

  // Египет
  'Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Suez', 'Luxor', 'Mansoura', 'El Mahalla El Kubra', 'Tanta',
  'Asyut', 'Ismailia', 'Faiyum', 'Zagazig', 'Aswan', 'Damietta', 'Minya', 'Beni Suef', 'Hurghada', 'Qena',

  // ЮАР
  'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Pietermaritzburg', 'Nelspruit', 'Kimberley',
  'Polokwane', 'Rustenburg', 'Welkom', 'Potchefstroom', 'Klerksdorp', 'Middelburg', 'Vereeniging', 'Soweto', 'Tembisa', 'Umlazi',

  // Нигерия
  'Lagos', 'Kano', 'Ibadan', 'Benin City', 'Port Harcourt', 'Jos', 'Ilorin', 'Abuja', 'Kaduna', 'Maiduguri',
  'Zaria', 'Aba', 'Ilesa', 'Onitsha', 'Iwo', 'Ado-Ekiti', 'Uyo', 'Owerri', 'Abeokuta', 'Sokoto',

  // Кения
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Malindi', 'Kitale', 'Garissa', 'Kakamega', 'Nyeri',
  'Meru', 'Machakos', 'Thika', 'Embu', 'Nanyuki', 'Kericho', 'Bungoma', 'Busia', 'Homa Bay', 'Migori',

  // Марокко
  'Casablanca', 'Rabat', 'Fez', 'Marrakech', 'Agadir', 'Tangier', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan',
  'Safi', 'Mohammedia', 'Khouribga', 'Beni Mellal', 'El Jadida', 'Taza', 'Nador', 'Settat', 'Larache', 'Ksar El Kebir',

  // Турция
  'Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Antalya', 'Kayseri', 'Mersin',
  'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli', 'Şanlıurfa', 'Adapazarı', 'Malatya', 'Kahramanmaraş', 'Erzurum', 'Van',

  // Израиль
  'Jerusalem', 'Tel Aviv', 'Haifa', 'Rishon LeZion', 'Petah Tikva', 'Ashdod', 'Netanya', 'Beer Sheva', 'Holon', 'Bnei Brak',
  'Ramat Gan', 'Bat Yam', 'Ashkelon', 'Rehovot', 'Herzliya', 'Kfar Saba', 'Hadera', 'Raanana', 'Modiin', 'Nazareth',

  // ОАЭ
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain',

  // Саудовская Аравия
  'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran', 'Taif', 'Buraidah', 'Tabuk',
  'Khamis Mushait', 'Hail', 'Najran', 'Al Bahah', 'Yanbu', 'Abha', 'Sakaka', 'Jizan', 'Al Qunfudhah', 'Arar',

  // Таиланд
  'Bangkok', 'Nonthaburi', 'Nakhon Ratchasima', 'Chiang Mai', 'Hat Yai', 'Udon Thani', 'Pak Kret', 'Khon Kaen', 'Ubon Ratchathani', 'Nakhon Si Thammarat',
  'Nakhon Sawan', 'Phitsanulok', 'Chonburi', 'Nakhon Pathom', 'Lampang', 'Ratchaburi', 'Surat Thani', 'Krabi', 'Phuket', 'Pattaya',

  // Вьетнам
  'Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hai Phong', 'Can Tho', 'Bien Hoa', 'Hue', 'Nha Trang', 'Buon Ma Thuot', 'Qui Nhon',
  'Vung Tau', 'Thai Nguyen', 'Thanh Hoa', 'Nam Dinh', 'Vinh', 'Long Xuyen', 'Rach Gia', 'My Tho', 'Ca Mau', 'Bac Lieu',

  // Филиппины
  'Manila', 'Quezon City', 'Caloocan', 'Davao', 'Cebu City', 'Zamboanga', 'Antipolo', 'Pasig', 'Taguig', 'Valenzuela',
  'Parañaque', 'Las Piñas', 'Makati', 'Bacolod', 'General Santos', 'Marikina', 'Muntinlupa', 'Calamba', 'San Jose del Monte', 'Cagayan de Oro',

  // Индонезия
  'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Palembang', 'Tangerang', 'Makassar', 'Depok', 'Bekasi',
  'Padang', 'Malang', 'Pekanbaru', 'Tegal', 'Bogor', 'Cirebon', 'Surakarta', 'Banjarmasin', 'Pontianak', 'Manado',

  // Малайзия
  'Kuala Lumpur', 'George Town', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Klang', 'Johor Bahru', 'Subang Jaya', 'Kuching', 'Kota Kinabalu',
  'Kajang', 'Ampang', 'Kuala Terengganu', 'Miri', 'Taiping', 'Kota Bharu', 'Kulim', 'Sandakan', 'Seremban', 'Alor Setar',

  // Сингапур
  'Singapore',

  // Гонконг
  'Hong Kong',

  // Тайвань
  'Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Banqiao', 'Hsinchu', 'Taoyuan', 'Keelung', 'Chiayi', 'Changhua',
  'Yunlin', 'Pingtung', 'Taitung', 'Hualien', 'Nantou', 'Yilan', 'Kinmen', 'Penghu', 'Matsu', 'Lienchiang'
].sort() // Сортируем по алфавиту

// Популярные города (показываются при фокусе на пустом поле)
export const popularCities = [
  'New York', 'London', 'Paris', 'Tokyo', 'Hong Kong', 'Bangkok', 'Singapore', 'Dubai', 'Moscow', 'Berlin',
  'Amsterdam', 'Barcelona', 'Rome', 'Vienna', 'Prague', 'Istanbul', 'Cairo', 'Cape Town', 'Sydney', 'Melbourne'
]

// Синонимы городов для улучшенного поиска
export const citySynonyms = {
  // Русские синонимы
  'Москва': 'Moscow',
  'Санкт-Петербург': 'Saint Petersburg',
  'Питер': 'Saint Petersburg',
  'СПб': 'Saint Petersburg',
  'СП': 'Saint Petersburg',
  'Новосибирск': 'Novosibirsk',
  'Екатеринбург': 'Yekaterinburg',
  'Нижний Новгород': 'Nizhny Novgorod',
  'Казань': 'Kazan',
  'Челябинск': 'Chelyabinsk',
  'Омск': 'Omsk',
  'Самара': 'Samara',
  'Ростов-на-Дону': 'Rostov-on-Don',
  'Уфа': 'Ufa',
  'Красноярск': 'Krasnoyarsk',
  'Пермь': 'Perm',
  'Воронеж': 'Voronezh',
  'Волгоград': 'Volgograd',
  'Краснодар': 'Krasnodar',
  'Саратов': 'Saratov',
  'Тюмень': 'Tyumen',
  'Тольятти': 'Tolyatti',
  'Ижевск': 'Izhevsk',
  
  // Украинские синонимы
  'Киев': 'Kyiv',
  'Харьков': 'Kharkiv',
  'Одесса': 'Odesa',
  'Днепр': 'Dnipro',
  'Донецк': 'Donetsk',
  'Запорожье': 'Zaporizhzhia',
  'Львов': 'Lviv',
  'Кривой Рог': 'Kryvyi Rih',
  'Николаев': 'Mykolaiv',
  'Мариуполь': 'Mariupol',
  
  // Английские сокращения и альтернативные названия
  'NYC': 'New York',
  'NY': 'New York',
  'LA': 'Los Angeles',
  'SF': 'San Francisco',
  'DC': 'Washington',
  'Miami': 'Miami',
  'Vegas': 'Las Vegas',
  'Philly': 'Philadelphia',
  'Chi-Town': 'Chicago',
  'Beantown': 'Boston',
  'Motor City': 'Detroit',
  'Music City': 'Nashville',
  'Windy City': 'Chicago',
  'Big Apple': 'New York',
  'City of Angels': 'Los Angeles',
  'Sin City': 'Las Vegas',
  'Space City': 'Houston',
  'Steel City': 'Pittsburgh',
  'Emerald City': 'Seattle',
  'Mile High City': 'Denver',
  'Motor City': 'Detroit',
  'Music City': 'Nashville',
  'Windy City': 'Chicago',
  'Big Apple': 'New York',
  'City of Angels': 'Los Angeles',
  'Sin City': 'Las Vegas',
  'Space City': 'Houston',
  'Steel City': 'Pittsburgh',
  'Emerald City': 'Seattle',
  'Mile High City': 'Denver',
  
  // Европейские синонимы
  'Лондон': 'London UK',
  'Париж': 'Paris',
  'Берлин': 'Berlin',
  'Рим': 'Rome',
  'Мадрид': 'Madrid',
  'Барселона': 'Barcelona',
  'Амстердам': 'Amsterdam',
  'Вена': 'Vienna',
  'Прага': 'Prague',
  'Будапешт': 'Budapest',
  'Варшава': 'Warsaw',
  'Краков': 'Kraków',
  'Стокгольм': 'Stockholm',
  'Копенгаген': 'Copenhagen',
  'Осло': 'Oslo',
  'Хельсинки': 'Helsinki',
  'Цюрих': 'Zurich',
  'Женева': 'Geneva',
  'Базель': 'Basel',
  'Берн': 'Bern',
  'Брюссель': 'Brussels',
  'Антверпен': 'Antwerp',
  'Гент': 'Ghent',
  'Лиссабон': 'Lisbon',
  'Порту': 'Porto',
  'Афины': 'Athens',
  'Стамбул': 'Istanbul',
  'Анкара': 'Ankara',
  'Измир': 'Izmir',
  
  // Азиатские синонимы
  'Токио': 'Tokyo',
  'Осака': 'Osaka',
  'Киото': 'Kyoto',
  'Йокогама': 'Yokohama',
  'Сеул': 'Seoul',
  'Пусан': 'Busan',
  'Пекин': 'Beijing',
  'Шанхай': 'Shanghai',
  'Гуанчжоу': 'Guangzhou',
  'Шэньчжэнь': 'Shenzhen',
  'Гонконг': 'Hong Kong',
  'Сингапур': 'Singapore',
  'Бангкок': 'Bangkok',
  'Чиангмай': 'Chiang Mai',
  'Пхукет': 'Phuket',
  'Хошимин': 'Ho Chi Minh City',
  'Ханой': 'Hanoi',
  'Манила': 'Manila',
  'Джакарта': 'Jakarta',
  'Сурабая': 'Surabaya',
  'Куала-Лумпур': 'Kuala Lumpur',
  'Дубай': 'Dubai',
  'Абу-Даби': 'Abu Dhabi',
  'Доха': 'Doha',
  'Эр-Рияд': 'Riyadh',
  'Джидда': 'Jeddah',
  'Тель-Авив': 'Tel Aviv',
  'Иерусалим': 'Jerusalem',
  'Хайфа': 'Haifa',
  
  // Американские синонимы
  'Торонто': 'Toronto',
  'Монреаль': 'Montreal',
  'Ванкувер': 'Vancouver',
  'Калгари': 'Calgary',
  'Эдмонтон': 'Edmonton',
  'Оттава': 'Ottawa',
  'Мехико': 'Mexico City',
  'Гвадалахара': 'Guadalajara',
  'Монтеррей': 'Monterrey',
  'Сан-Паулу': 'São Paulo',
  'Рио-де-Жанейро': 'Rio de Janeiro',
  'Бразилиа': 'Brasília',
  'Буэнос-Айрес': 'Buenos Aires',
  'Кордова': 'Córdoba',
  'Сантьяго': 'Santiago',
  'Вальпараисо': 'Valparaíso',
  'Богота': 'Bogotá',
  'Медельин': 'Medellín',
  'Кали': 'Cali',
  'Лима': 'Lima',
  'Арекипа': 'Arequipa',
  'Каракас': 'Caracas',
  'Маракайбо': 'Maracaibo',
  
  // Африканские синонимы
  'Каир': 'Cairo',
  'Александрия': 'Alexandria',
  'Йоханнесбург': 'Johannesburg',
  'Кейптаун': 'Cape Town',
  'Дурбан': 'Durban',
  'Претория': 'Pretoria',
  'Лагос': 'Lagos',
  'Кано': 'Kano',
  'Абуджа': 'Abuja',
  'Найроби': 'Nairobi',
  'Момбаса': 'Mombasa',
  'Касабланка': 'Casablanca',
  'Рабат': 'Rabat',
  'Фес': 'Fez',
  'Марракеш': 'Marrakech',
  'Агадир': 'Agadir',
  
  // Австралийские синонимы
  'Сидней': 'Sydney',
  'Мельбурн': 'Melbourne',
  'Брисбен': 'Brisbane',
  'Перт': 'Perth',
  'Аделаида': 'Adelaide',
  'Канберра': 'Canberra'
}

// Функция для поиска городов с поддержкой синонимов и нечеткого поиска
export const searchCities = (query, limit = 10) => {
  if (!query || query.trim().length === 0) {
    return popularCities.slice(0, limit)
  }
  
  const searchTerm = query.toLowerCase().trim()
  const results = new Set()
  
  // 1. Точное совпадение
  citiesList.forEach(city => {
    if (city.toLowerCase() === searchTerm) {
      results.add(city)
    }
  })
  
  // 2. Поиск по синонимам
  Object.entries(citySynonyms).forEach(([synonym, city]) => {
    if (synonym.toLowerCase() === searchTerm) {
      results.add(city)
    }
  })
  
  // 3. Начинается с поискового запроса
  citiesList.forEach(city => {
    if (city.toLowerCase().startsWith(searchTerm) && !results.has(city)) {
      results.add(city)
    }
  })
  
  // 4. Содержит поисковый запрос
  citiesList.forEach(city => {
    if (city.toLowerCase().includes(searchTerm) && !results.has(city)) {
      results.add(city)
    }
  })
  
  // 5. Поиск по синонимам (содержит)
  Object.entries(citySynonyms).forEach(([synonym, city]) => {
    if (synonym.toLowerCase().includes(searchTerm) && !results.has(city)) {
      results.add(city)
    }
  })
  
  // 6. Нечеткий поиск (расстояние Левенштейна)
  const fuzzyResults = []
  citiesList.forEach(city => {
    if (!results.has(city)) {
      const distance = levenshteinDistance(searchTerm, city.toLowerCase())
      if (distance <= 2 && city.length > 3) { // Максимум 2 ошибки для городов длиннее 3 символов
        fuzzyResults.push({ city, distance })
      }
    }
  })
  
  // Сортируем нечеткие результаты по расстоянию
  fuzzyResults.sort((a, b) => a.distance - b.distance)
  fuzzyResults.forEach(({ city }) => results.add(city))
  
  return Array.from(results).slice(0, limit)
}

// Функция для вычисления расстояния Левенштейна
const levenshteinDistance = (str1, str2) => {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// Экспортируем основной массив городов
export const cities = citiesList
