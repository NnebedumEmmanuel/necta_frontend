import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '@/context/CartContext';
import { orderService } from "../../../services/orderService";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastProvider';

// 🚨 GIG LOGISTICS MAPPING: Dependent Dropdown Dictionary
const STATE_LGA_MAP = {
  "Abia": ["Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma", "Ugwunagbo", "Ukwa East", "Ukwa West", "Umuahia North", "Umuahia South", "Umu Nneochi"],
  "Adamawa": ["Demsa", "Fufure", "Ganye", "Gayuk", "Gombi", "Grie", "Hong", "Jada", "Lamurde", "Madagali", "Maiha", "Mayo Belwa", "Michika", "Mubi North", "Mubi South", "Numan", "Shelleng", "Song", "Toungo", "Yola North", "Yola South"],
  "Akwa Ibom": ["Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo", "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono-Ibom", "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", "Ini", "Itu", "Mbo", "Mkpat-Enin", "Nsit-Atai", "Nsit-Ibom", "Nsit-Ubium", "Obot Akara", "Okobo", "Onna", "Oron", "Oruk Anam", "Udung-Uko", "Ukanafun", "Uruan", "Urue-Offong/Oruko", "Uyo"],
  "Anambra": ["Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", "Awka South", "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", "Idemili South", "Ihiala", "Njikoka", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha North", "Onitsha South", "Orumba North", "Orumba South", "Oyi"],
  "Bauchi": ["Alkaleri", "Bauchi", "Bogoro", "Damban", "Darazo", "Dass", "Gamawa", "Ganjuwa", "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi", "Shira", "Tafawa Balewa", "Toro", "Warji", "Zaki"],
  "Bayelsa": ["Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", "Sagbama", "Southern Ijaw", "Yenagoa"],
  "Benue": ["Ado", "Agatu", "Apa", "Buruku", "Gboko", "Guma", "Gwer East", "Gwer West", "Katsina-Ala", "Konshisha", "Kwande", "Logo", "Makurdi", "Obi", "Ogbadibo", "Ohimini", "Oju", "Okpokwu", "Otukpo", "Tarka", "Ukum", "Ushongo", "Vandeikya"],
  "Borno": ["Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", "Dikwa", "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", "Kala/Balge", "Konduga", "Kukawa", "Kwaya Kusar", "Mafa", "Magumeri", "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", "Nganzai", "Shani"],
  "Cross River": ["Abi", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarra", "Biase", "Boki", "Calabar Municipal", "Calabar South", "Etung", "Ikom", "Obanliku", "Obubra", "Obudu", "Odukpani", "Ogoja", "Yakuur", "Yala"],
  "Delta": ["Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East", "Ethiope West", "Ika North East", "Ika South", "Isoko North", "Isoko South", "Ndokwa East", "Ndokwa West", "Okpe", "Oshimili North", "Oshimili South", "Patani", "Sapele", "Udu", "Ughelli North", "Ughelli South", "Ukwuani", "Uvwie", "Warri North", "Warri South", "Warri South West"],
  "Ebonyi": ["Abakaliki", "Afikpo North", "Afikpo South", "Ebonyi", "Ezza North", "Ezza South", "Ikwo", "Ishielu", "Ivo", "Izzi", "Ohaozara", "Ohaukwu", "Onicha"],
  "Edo": ["Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East", "Esan West", "Etsako Central", "Etsako East", "Etsako West", "Igueben", "Ikpoba Okha", "Orhionmwon", "Oredo", "Ovia North-East", "Ovia South-West", "Owan East", "Owan West", "Uhunmwonde"],
  "Ekiti": ["Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West", "Emure", "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", "Irepodun/Ifelodun", "Ise/Orun", "Moba", "Oye"],
  "Enugu": ["Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu", "Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Nkanu East", "Nkanu West", "Nsukka", "Oji River", "Udenu", "Udi", "Uzo Uwani"],
  "FCT": ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"],
  "Gombe": ["Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo", "Kwami", "Nafada", "Shongom", "Yamaltu/Deba"],
  "Imo": ["Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North", "Ideato South", "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli", "Ngor Okpala", "Njaba", "Nkwerre", "Nwangele", "Obowo", "Oguta", "Ohaji/Egbema", "Okigwe", "Orlu", "Orsu", "Oru East", "Oru West", "Owerri Municipal", "Owerri North", "Owerri West", "Unuimo"],
  "Jigawa": ["Auyo", "Babura", "Biriniwa", "Birnin Kudu", "Buji", "Dutse", "Gagarawa", "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa", "Kaugama", "Kazaure", "Kiri Kasama", "Kiyawa", "Kaugama", "Maigatari", "Malam Madori", "Miga", "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"],
  "Kaduna": ["Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a", "Kachia", "Kaduna North", "Kaduna South", "Kagarko", "Kajuru", "Kaura", "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga", "Soba", "Zangon Kataf", "Zaria"],
  "Kano": ["Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta", "Dawakin Kudu", "Dawakin Tofa", "Doguwa", "Fagge", "Gabasawa", "Garko", "Garun Mallam", "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo", "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi", "Kura", "Madobi", "Makoda", "Minjibir", "Nasarawa", "Rano", "Rimin Gado", "Rogo", "Shanono", "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", "Ungogo", "Warawa", "Wudil"],
  "Katsina": ["Bakori", "Batagarawa", "Batsari", "Baure", "Bindawa", "Charanchi", "Dandume", "Danja", "Dan Musa", "Daura", "Dutsi", "Dutsin Ma", "Faskari", "Funtua", "Ingawa", "Jibia", "Kafur", "Kaita", "Kankara", "Kankia", "Katsina", "Kurfi", "Kusada", "Mai'Adua", "Malumfashi", "Mani", "Mashi", "Matazu", "Musawa", "Rimi", "Sabuwa", "Safana", "Sandamu", "Zango"],
  "Kebbi": ["Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi", "Bunza", "Dandi", "Fakai", "Gwandu", "Jega", "Kalgo", "Koko/Besse", "Maiyama", "Ngaski", "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru"],
  "Kogi": ["Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela Odolu", "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa Muro", "Ofu", "Ogori/Magongo", "Okehi", "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"],
  "Kwara": ["Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South", "Ilorin West", "Irepodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi"],
  "Lagos": ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"],
  "Nasarawa": ["Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Kokona", "Lafia", "Nasarawa", "Nasarawa Egon", "Obi", "Toto", "Wamba"],
  "Niger": ["Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", "Gbako", "Gurara", "Katcha", "Kontagora", "Lapai", "Lavun", "Magama", "Mariga", "Mashegu", "Mokwa", "Moya", "Paikoro", "Rafi", "Rijau", "Shiroro", "Suleja", "Tafa", "Wushishi"],
  "Ogun": ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North", "Egbado South", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", "Remo North", "Shagamu"],
  "Ondo": ["Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West", "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje", "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West", "Ose", "Owo"],
  "Osun": ["Atakunmosa East", "Atakunmosa West", "Aiyedaade", "Aiyedire", "Boluwaduro", "Boripe", "Ede North", "Ede South", "Ife Central", "Ife East", "Ife North", "Ife South", "Egbedore", "Ejigbo", "Ifedayo", "Ifelodun", "Ila", "Ilesa East", "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo", "Obokun", "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"],
  "Oyo": ["Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Ogo Oluwa", "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo", "Oyo East", "Saki East", "Saki West", "Surulere"],
  "Plateau": ["Bokkos", "Barkin Ladi", "Bassa", "Jos East", "Jos North", "Jos South", "Kanam", "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang", "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase"],
  "Rivers": ["Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru", "Bonny", "Degema", "Eleme", "Emuoha", "Etche", "Gokana", "Ikwerre", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Oyigbo", "Port Harcourt", "Tai"],
  "Sokoto": ["Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa", "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari", "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza", "Tureta", "Wamako", "Wurno", "Yabo"],
  "Taraba": ["Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", "Karim Lamido", "Kumi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari", "Yorro", "Zing"],
  "Yobe": ["Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Jakusko", "Karasuwa", "Machina", "Nangere", "Nguru", "Potiskum", "Tarmuwa", "Yunusari", "Yusufari"],
  "Zamfara": ["Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Gummi", "Gusau", "Kaura Namoda", "Maradun", "Maru", "Shinkafi", "Talata Mafara", "Chafe", "Zurmi"]
};
const NIGERIAN_STATES = Object.keys(STATE_LGA_MAP).sort();

const CheckoutPage = () => {
  const { cartItems, state, deliveryState, setDeliveryState, clearCart } = useCart() || {};
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const safeSetDeliveryState = typeof setDeliveryState === 'function' ? setDeliveryState : () => {};

  const realItems = (Array.isArray(cartItems) && cartItems.length > 0) ? cartItems : (Array.isArray(state?.items) ? state.items : []);
  const [formData, setFormData] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user?.name || ""),
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    lga: "",
    state: deliveryState || "",
  });

  const subtotal = (Array.isArray(realItems) ? realItems : []).reduce((acc, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '').replace(/[^0-9.-]+/g, '')) || 0;
    const qty = Number(item.quantity || item.qty || 1) || 0;
    return acc + (price * qty);
  }, 0);

  const SHIPPING_RATES = { Lagos: 2500, Default: 4500, FreeThreshold: 5000000 };

  const shippingCost = React.useMemo(() => {
    const stateSelected = formData?.state || '';
    if (!stateSelected) return 0;
    if (subtotal > (SHIPPING_RATES.FreeThreshold / 100)) return 0;
    if (String(stateSelected).toLowerCase() === 'lagos') return SHIPPING_RATES.Lagos;
    return SHIPPING_RATES.Default;
  }, [formData?.state, subtotal]);

  const tax = subtotal * 0.075;
  const grandTotal = subtotal + tax + shippingCost;

  React.useEffect(() => {
    if (!user) return;
    setFormData(prev => ({
      fullName: prev.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user?.name || "")),
      email: prev.email || user?.email || "",
      phone: prev.phone || user?.phone || user?.user_metadata?.phone || "",
      address: prev.address || user?.address || "",
      city: prev.city || user?.city || "",
      lga: prev.lga || user?.lga || user?.address?.lga || "",
      state: prev.state || deliveryState || user?.state || "",
    }));
  }, [user]);

  React.useEffect(() => {
    if (deliveryState && deliveryState !== formData.state) {
      setFormData(prev => ({ ...prev, state: deliveryState }));
    }
  }, [deliveryState]);

  React.useEffect(() => {
    if (formData.state !== deliveryState) {
      safeSetDeliveryState(formData.state || "");
    }
  }, [formData.state]);

  const handlePlaceOrder = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.lga || !formData.state) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    // 🚨 BULLETPROOF PHONE VALIDATION
    const phoneRegex = /^(0|\+?234)[789][01]\d{8}$/;
    const cleanPhone = formData.phone.replace(/\s+/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
      showToast("Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678).", "error");
      return;
    }

    if (!user?.id) {
      showToast("Please log in to place an order.", "error");
      return;
    }

    if (!Array.isArray(realItems) || realItems.length === 0) {
      showToast('Cart is empty!', 'error');
      return;
    }

    const orderItems = realItems.map(item => ({
      product_id: item.product_id || item._id || item.id,
      quantity: Number(item.quantity || item.qty || 1) || 1,
      price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '').replace(/[^0-9.-]+/g, '')) || 0,
      name: item.name || item.title || '',
      weight: Number(item.weight) || 2.5 
    }));

    if (orderItems.some(item => !item.product_id)) {
      showToast("Please remove and re-add items to your cart before checkout.", "error");
      return;
    }

    const shippingAddress = [formData.address, formData.city, formData.lga, formData.state].filter(Boolean).join(', ');

    const orderData = {
      customer: {
        userId: user?.id,
        name: formData.fullName,
        email: formData.email,
        phone: cleanPhone, // Save the cleaned, validated number
        address: formData.address,
        city: formData.city,
        lga: formData.lga,
        state: formData.state
      },
      items: orderItems,
      subtotal: Number(subtotal).toFixed(2),
      tax: Number(tax).toFixed(2),
      total: Number(grandTotal).toFixed(2),
      amountKobo: Math.round(Number(grandTotal) * 100),
      shippingAddress,
      lga: formData.lga,
      status: 'pending'
    };

    try {
      const res = await orderService.addOrder(orderData);

      if (res?.success) {
        const order = res.data?.order;
        const paystack = res.data?.paystack;

        const authorizationUrl = paystack?.authorization_url || paystack?.data?.authorization_url;
        if (authorizationUrl) {
          clearCart();
          window.location.href = authorizationUrl;
          return;
        }

        if (order?.id) {
          clearCart();
          showToast(`Order placed successfully! Order Number: ${order.id}`, "success");
          navigate(`/order/${order.id}`);
          return;
        }
      }
      showToast("Failed to place order. Please try again.", "error");
    } catch (error) {
      console.error("Error placing order:", error);
      showToast(error?.response?.data?.error || error?.message || "Failed to place order. Please try again.", "error");
    }
  };

  const needsState = Number(shippingCost) === 0 && !formData.state;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <section className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-medium mb-4">Shipping Details</h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full name</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Recipient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <select
                    className="w-full border p-2 rounded"
                    value={formData.state}
                    onChange={(e) => {
                      const s = e.target.value;
                      setFormData(prev => ({ ...prev, state: s, lga: "" }));
                      safeSetDeliveryState(s);
                    }}
                  >
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">LGA</label>
                  <select
                    className="w-full border p-2 rounded bg-white"
                    value={formData.lga}
                    onChange={(e) => setFormData(prev => ({ ...prev, lga: e.target.value }))}
                    disabled={!formData.state} 
                  >
                    <option value="">Select LGA</option>
                    {formData.state && STATE_LGA_MAP[formData.state]?.map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                />
              </div>
            </div>
          </div>
        </section>

        <aside className="bg-gray-50 p-6 rounded-lg shadow-sm h-fit sticky top-20">
          <h2 className="text-lg font-medium mb-4">Order Summary</h2>

          <div className="space-y-3 text-sm text-gray-700">
              {(Array.isArray(realItems) ? realItems : []).map(item => {
              const rawPrice = item?.price;
              const price = typeof rawPrice === 'number' ? Number(rawPrice || 0) : parseFloat(String(item.price || '').replace(/[^\d.-]/g, '')) || 0;
              const qty = Number(item.quantity || item.qty || 1) || 0;
              return (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} × <span className="font-medium">{qty}</span></span>
                  <span className="font-medium">{(price * qty).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 })}</span>
                </div>
              );
            })}

            <hr className="my-4 border-gray-200" />

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{Number(subtotal || 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>{Number(tax || 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium">{Number(shippingCost) === 0 ? 'Free' : Number(shippingCost).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
              <span>Grand Total</span>
              <span className="text-yellow-500">{Number(grandTotal || 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="mt-6">
            {needsState ? (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold cursor-not-allowed"
              >
                Please select a delivery state
              </button>
            ) : (
              <div key={grandTotal} className="w-full">
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600"
                >
                  Pay with Paystack
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
};

export default CheckoutPage;