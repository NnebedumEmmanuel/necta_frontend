// Pricing helpers and constants
export const TAX_RATE = 0.075; // 7.5%
export const FREE_SHIPPING_THRESHOLD = 150000; // currency units (e.g., NGN)

export const SHIPPING_ZONES = {
  Lagos: 2500,
  Abuja: 4500,
  Default: 6000,
};

// Lightweight list of Nigerian states (used for dropdowns)
export const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta',
  'Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi',
  'Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara','FCT'
];

// Full STATE -> LGA map for Nigeria (36 states + FCT). Each key is a state name with an array of LGAs.
export const STATE_LGA_MAP = {
  'Abia': ['Aba North','Aba South','Arochukwu','Bende','Ikwuano','Isiala Ngwa North','Isiala Ngwa South','Isuikwuato','Obi Ngwa','Ohafia','Osisioma','Ugwunagbo','Ukwa East','Ukwa West','Umuahia North','Umuahia South','Umu Nneochi'],
  'Adamawa': ['Demsa','Fufore','Ganye','Girei','Gombi','Guyuk','Hong','Jada','Lamurde','Madagali','Maiha','Mayo Belwa','Michika','Mubi North','Mubi South','Numan','Shelleng','Song','Toungo','Yola North','Yola South'],
  'Akwa Ibom': ['Abak','Eastern Obolo','Eket','Esit Eket','Essien Udim','Etim Ekpo','Etinan','Ibeno','Ibesikpo Asutan','Ibiono-Ibom','Ika','Ikono','Ikot Abasi','Ikot Ekpene','Ini','Itu','Mbo','Mkpat-Enin','Nsit-Atai','Nsit-Ibom','Nsit-Ubium','Obot Akara','Okobo','Onna','Oron','Oruk Anam','Udung-Uko','Ukanafun','Uruan','Urue-Offong/Oruko','Uyo'],
  'Anambra': ['Aguata','Anambra East','Anambra West','Anaocha','Awka North','Awka South','Ayamelum','Dunukofia','Ekwusigo','Idemili North','Idemili South','Ihiala','Njikoka','Nnewi North','Nnewi South','Ogbaru','Onitsha North','Onitsha South','Orumba North','Orumba South','Oyi'],
  'Bauchi': ['Alkaleri','Bogoro','Damban','Darazo','Dass','Gamawa','Ganjuwa','Giade','Itas/Gadau','Jamaare','Katagum','Kirfi','Misau','Ningi','Shira','Tafawa Balewa','Toro','Warji','Zaki'],
  'Bayelsa': ['Brass','Ekeremor','Kolokuma/Opokuma','Nembe','Ogbia','Sagbama','Southern Ijaw','Yenagoa'],
  'Benue': ['Ado','Agatu','Apa','Buruku','Gboko','Guma','Gwer East','Gwer West','Katsina-Ala','Konshisha','Kwande','Logo','Makurdi','Obi','Ogbadibo','Ohimini','Oju','Okpokwu','Otukpo','Tarka','Ukum','Ushongo','Vandeikya'],
  'Borno': ['Abadam','Askira/Uba','Bama','Bayo','Biu','Chibok','Damboa','Dikwa','Gubio','Guzamala','Gwoza','Hawul','Jere','Kaga','Kala/Balge','Konduga','Kukawa','Kwaya Kusar','Mafa','Magumeri','Maiduguri','Marte','Mobbar','Monguno','Ngala','Nganzai','Shani'],
  'Cross River': ['Akamkpa','Biase','Calabar Municipal','Calabar South','Etung','Ikom','Obanliku','Obubra','Obudu','Odukpani','Ogoja','Yakuur','Yala'],
  'Delta': ['Aniocha North','Aniocha South','Bomadi','Burutu','Ethiope East','Ethiope West','Ika North-East','Ika South','Isoko North','Isoko South','Ndokwa East','Ndokwa West','Okpe','Oshimili North','Oshimili South','Patani','Sapele','Udu','Ughelli North','Ughelli South','Ukwuani','Uvwie','Warri North','Warri South','Warri South West'],
  'Ebonyi': ['Abakaliki','Afikpo North','Afikpo South (Edda)','Ebonyi','Ezza North','Ezza South','Ikwo','Ishielu','Ivo','Izzi','Ohaozara','Ohaukwu','Onicha'],
  'Edo': ['Akoko-Edo','Egor','Esan Central','Esan North-East','Esan South-East','Esan West','Etsako Central','Etsako East','Etsako West','Igueben','Ikpoba-Okha','Oredo','Orhionmwon','Ovia North-East','Ovia South-West','Owan East','Owan West','Uhunmwonde'],
  'Ekiti': ['Ado Ekiti','Efon','Ekiti East','Ekiti South-West','Ekiti West','Emure/Ile Oluji','Gbonyin','Ido Osi','Ijero','Ikere','Ikole','Irepodun/Ifelodun','Ise/Orun','Moba','Oye'],
  'Enugu': ['Aninri','Awgu','Enugu East','Enugu North','Enugu South','Ezeagu','Igbo Etiti','Igbo Eze North','Igbo Eze South','Isi Uzo','Nkanu East','Nkanu West','Nsukka','Oji River','Udenu','Udi','Uzo-Uwani'],
  'Gombe': ['Akko','Balanga','Billiri','Dukku','Funakaye','Gombe','Kaltungo','Kwami','Nafada/Bajoga','Shongom','Yamaltu/Deba'],
  'Imo': ['Aboh Mbaise','Ahiazu Mbaise','Ehime Mbano','Ezinihitte','Ideato North','Ideato South','Ihitte/Uboma','Ikeduru','Isiala Mbano','Isu','Mbaitoli','Ngor Okpala','Njaba','Nkwerre','Nwangele','Obowo','Oguta','Ohaji/Egbema','Okigwe','Onuimo','Orlu','Orsu','Oru East','Oru West','Owerri Municipal','Owerri North','Owerri West'],
  'Jigawa': ['Auyo','Babura','Birnin Kudu','Biriniwa','Buji','Dutse','Gagarawa','Garki','Gumel','Guri','Gwaram','Gwiwa','Hadejia','Jahun','Kafin Hausa','Kaugama','Kazaure','Kiri Kasama','Kiyawa','Maigatari','Malam Madori','Miga','Ringim','Roni','Sule Tankarkar','Taura','Yankwashi'],
  'Kaduna': ['Birnin Gwari','Chikun','Giwa','Igabi','Ikara','Jaba','Jema`a','Kachia','Kaduna North','Kaduna South','Kagarko','Kajuru','Kaura','Kauru','Kubau','Kudan','Lere','Makarfi','Sabon Gari','Sanga','Soba','Zangon Kataf','Zaria'],
  'Kano': ['Ajingi','Albasu','Bagwai','Bebeji','Bichi','Bunkure','Dala','Dambatta','Dawakin Kudu','Dawakin Tofa','Doguwa','Fagge','Gabasawa','Garko','Garun Mallam','Gaya','Gezawa','Gwale','Gwarzo','Kabo','Kano Municipal','Kumbotso','Kunchi','Kura','Madobi','Makoda','Minjibir','Nasarawa','Rano','Rimin Gado','Rogo','Shanono','Sumaila','Takai','Tarauni','Tofa','Tsanyawa','Tudun Wada','Ungogo','Warawa','Wudil'],
  'Katsina': ['Bakori','Batagarawa','Batsari','Baure','Bindawa','Charanchi','Dandume','Danja','Daura','Dutsi','Dutsin-Ma','Faskari','Funtua','Ingawa','Jibia','Kafur','Kaita','Kankara','Kankia','Katsina','Kurfi','Kusada','Mai\'Adua','Malumfashi','Mani','Mashi','Matazu','Musawa','Rimi','Sabuwa','Safana','Sandamu','Zango'],
  'Kebbi': ['Aleiro','Arewa Dandi','Argungu','Auya','Bagudo','Birnin Kebbi','Bunza','Dandi','Fakai','Gwandu','Jega','Kalgo','Koko/Besse','Maiyama','Ngaski','Sakaba','Shanga','Suru','Wasagu/Danko','Yauri','Zuru'],
  'Kogi': ['Adavi','Ajaokuta','Ankpa','Bassa','Dekina','Ibaji','Idah','Igalamela Odolu','Ijumu','Kabba/Bunu','Kogi','Lokoja','Mopa Muro','Ofu','Ogori/Magongo','Okehi','Okene','Olamaboro','Omala','Yagba East','Yagba West'],
  'Kwara': ['Asa','Baruten','Edu','Ekiti','Ifelodun','Ilorin East','Ilorin South','Ilorin West','Irepodun','Isin','Kaiama','Moro','Offa','Oke Ero','Oyun','Pategi'],
  'Lagos': ['Agege','Ajeromi-Ifelodun','Alimosho','Amuwo-Odofin','Apapa','Badagry','Epe','Eti-Osa','Ibeju-Lekki','Ifako-Ijaiye','Ikeja','Ikorodu','Kosofe','Lagos Island','Lagos Mainland','Mushin','Ojo','Ojodu','Oshodi-Isolo','Shomolu','Surulere'],
  'Nasarawa': ['Akwanga','Awe','Doma','Karu','Keana','Keffi','Kokona','Lafia','Nassarawa','Nassarawa-Eggon','Obi','Toto','Wamba'],
  'Niger': ['Agaie','Agwara','Bida','Borgu','Bosso','Chanchaga','Edati','Gbako','Gurara','Katcha','Kontagora','Lapai','Lavun','Magama','Mokwa','Muya','Pailoro','Rafi','Rijau','Shiroro','Suleja','Tafa','Wushishi'],
  'Ogun': ['Abeokuta North','Abeokuta South','Ado-Odo/Ota','Egbado North (Yewa North)','Egbado South (Yewa South)','Ewekoro','Ifo','Ijebu East','Ijebu North','Ijebu North East','Ijebu Ode','Ikenne','Imeko Afon','Ipokia','Obafemi-Owode','Odogbolu','Ogun Waterside','Remo North','Shagamu','Sagamu'],
  'Ondo': ['Akoko North-East','Akoko North-West','Akoko South-East','Akoko South-West','Akure North','Akure South','Ese Odo','Idanre','Ifedore','Igbara Odo','Ilaje','Ile Oluji/Okeigbo','Irele','Odigbo','Okitipupa','Ondo East','Ondo West','Ose','Owo'],
  'Osun': ['Atakunmosa East','Atakunmosa West','Aiyedaade','Aiyedire','Boluwaduro','Boripe','Ede North','Ede South','Egbedore','Ejigbo','Ife Central','Ife East','Ife North','Ife South','Ifedayo','Ifelodun','Ila','Ilesa East','Ilesa West','Irepodun','Irewole','Isokan','Iwo','Obokun','Odo Otin','Ola Oluwa','Olorunda','Oriade','Orolu','Osogbo'],
  'Oyo': ['Afijio','Akinyele','Atiba','Atisbo','Egbeda','Ibadan North','Ibadan North-East','Ibadan North-West','Ibadan South-West','Ibadan South-East','Ibarapa Central','Ibarapa East','Ibarapa North','Ido','Irepo','Iseyin','Itesiwaju','Iwajowa','Kajola','Lagelu','Ogo Oluwa','Ogbomosho North','Ogbomosho South','Olorunsogo','Oluyole','Ona Ara','Orelope','Ori Ire','Oyo East','Oyo West','Saki East','Saki West','Surulere'],
  'Plateau': ['Barkin Ladi','Bassa','Bokkos','Jos East','Jos North','Jos South','Kanam','Kanke','Langtang North','Langtang South','Mangu','Mikang','Pankshin','Qua\'an Pan','Riyom','Shendam','Wase'],
  'Rivers': ['Abua/Odual','Ahoada East','Ahoada West','Akuku-Toru','Andoni','Asari-Toru','Bonny','Degema','Emohua','Eleme','Etche','Gokana','Ikwerre','Khana','Obio/Akpor','Ogba/Egbema/Ndoni','Ogu/Bolo','Okrika','Omuma','Opobo/Nkoro','Oyigbo','Port Harcourt','Tai'],
  'Sokoto': ['Binji','Bodinga','Dange Shuni','Gada','Goronyo','Gudu','Gwadabawa','Illela','Isa','Kebbe','Kware','Rabah','Sabon Birni','Shagari','Sokoto North','Sokoto South','Tambuwal','Tangaza','Tureta','Wamako','Wurno','Yabo'],
  'Taraba': ['Ardo Kola','Bali','Donga','Gashaka','Gassol','Ibi','Jalingo','Karim Lamido','Kumi','Lau','Sardauna','Takum','Ussa','Wukari','Yorro','Zing'],
  'Yobe': ['Bade','Bursari','Damaturu','Fika','Fune','Geidam','Gujba','Gulani','Jakusko','Kaga','Karasuwa','Machina','Nangere','Nguru','Potiskum','Tarmuwa','Yunusari','Yusufari'],
  'Zamfara': ['Anka','Bakura','Birnin Magaji/Kiyaw','Bukkuyum','Bungudu','Gummi','Gusau','Kaura Namoda','Kiyawa','Maradun','Maru','Shinkafi','Talata Mafara','Tsafe','Zurmi'],
  'FCT': ['Abaji','Bwari','Gwagwalada','Kuje','Kwali','Municipal Area Council']
};

export function getShippingFee(state, subtotal) {
  try {
    const sub = Number(subtotal || 0);
    if (Number.isFinite(sub) && sub >= Number(FREE_SHIPPING_THRESHOLD)) return 0;

    if (!state) return SHIPPING_ZONES.Default;
    // Normalize state key for lookup (trim + title case-ish)
    const key = String(state).trim();
    if (Object.prototype.hasOwnProperty.call(SHIPPING_ZONES, key)) {
      return SHIPPING_ZONES[key];
    }

    // Try case-insensitive match
    const found = Object.keys(SHIPPING_ZONES).find(k => k.toLowerCase() === key.toLowerCase());
    if (found) return SHIPPING_ZONES[found];

    return SHIPPING_ZONES.Default;
  } catch (err) {
    return SHIPPING_ZONES.Default;
  }
}

export default {
  TAX_RATE,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_ZONES,
  getShippingFee,
  NIGERIAN_STATES,
  STATE_LGA_MAP,
};

