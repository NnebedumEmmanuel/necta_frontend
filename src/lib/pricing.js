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
