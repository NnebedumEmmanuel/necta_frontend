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

// A minimal STATE -> LGA map. Populate LGAs as needed. This exports a map with keys for all
// Nigerian states while providing full LGA lists for Lagos and Imo as examples.
export const STATE_LGA_MAP = (() => {
  const map = {};
  NIGERIAN_STATES.forEach(s => { map[s] = []; });

  // Example populated LGAs for Imo and Lagos
  map['Imo'] = [
    'Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South',
    'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba',
    'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Onuimo', 'Orlu', 'Orsu',
    'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West'
  ];

  map['Lagos'] = [
    'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Coker-Aguda',
    'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island',
    'Lagos Mainland', 'Mushin', 'Ojo', 'Ojodu', 'Oshodi-Isolo', 'Shomolu', 'Surulere'
  ];

  return map;
})();

/**
 * Get shipping fee for a given state and subtotal.
 * Returns 0 when subtotal meets or exceeds the free shipping threshold.
 * Falls back to SHIPPING_ZONES.Default when state not listed.
 */
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
};
