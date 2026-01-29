import React, { useEffect } from "react";
import supabase from '../../lib/supabaseClient'

const CheckoutForm = ({ formData, setFormData }) => {
  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (userId) => {
      try {
        console.log('CheckoutForm: Fetching profile for:', userId);
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.warn('CheckoutForm: profile query error', error);
          return;
        }

        if (profile && mounted) {
          console.log('CheckoutForm: Found Profile:', profile);
          setFormData(prev => ({
            ...prev,
            fullName: profile.name || prev.fullName,
            phone: profile.phone || prev.phone,
            address: profile.shipping_address || profile.address || prev.address,
            city: profile.city || prev.city,
            state: profile.state || prev.state,
            email: profile.email || prev.email,
          }));
        }
      } catch (err) {
        console.warn('CheckoutForm: error fetching profile', err);
      }
    };

    // 1. Check current session immediately
    if (supabase && supabase.auth && typeof supabase.auth.getUser === 'function') {
      supabase.auth.getUser().then(res => {
        const supUser = res?.data?.user ?? res?.user ?? null;
        if (supUser) {
          // ensure email is set immediately
          setFormData(prev => ({ ...prev, email: supUser.email || prev.email }));
          fetchProfile(supUser.id);
        }
      }).catch(err => {
        console.warn('CheckoutForm: getUser() error', err);
      });
    }

    // 2. ALSO listen for auth changes (in case of slow load)
    let subscription = null;
    try {
      const subRes = supabase.auth.onAuthStateChange((event, session) => {
        const uid = session?.user?.id ?? null;
        if (uid) fetchProfile(uid);
      });
      // older/newer clients return different shapes; normalize
      subscription = subRes?.data?.subscription ?? subRes?.subscription ?? subRes;
    } catch (err) {
      console.warn('CheckoutForm: failed to subscribe to auth changes', err);
    }

    return () => {
      mounted = false;
      try {
        if (subscription?.unsubscribe) subscription.unsubscribe();
        else if (typeof subscription === 'function') subscription();
      } catch (err) {
        // silent
      }
    };
  }, [setFormData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      className="
        bg-white 
        p-6 
        rounded-2xl 
        shadow-lg 
        border 
        border-yellow-100
      "
    >
      {}
      <h2 className="text-2xl font-bold mb-2 text-gray-800">
        Shipping Details
      </h2>

      {}
      <div className="w-16 h-1 bg-yellow-400 rounded-full mb-6" />

      {}
      <div className="grid md:grid-cols-2 gap-4">
        {}
        <input
          type="text"
          name="fullName"
          placeholder="Full Name *"
          value={formData.fullName}
          onChange={handleChange}
          className="
            border 
            p-3 
            rounded-lg 
            w-full 
            focus:outline-none 
            focus:ring-2 
            focus:ring-yellow-400
          "
        />

        {}
        <input
          type="email"
          name="email"
          placeholder="Email *"
          value={formData.email}
          onChange={handleChange}
          className="
            border 
            p-3 
            rounded-lg 
            w-full 
            focus:outline-none 
            focus:ring-2 
            focus:ring-yellow-400
          "
        />

        {}
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number *"
          value={formData.phone}
          onChange={handleChange}
          className="
            border 
            p-3 
            rounded-lg 
            w-full 
            focus:outline-none 
            focus:ring-2 
            focus:ring-yellow-400
          "
        />

        {}
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="
            border 
            p-3 
            rounded-lg 
            w-full 
            focus:outline-none 
            focus:ring-2 
            focus:ring-yellow-400
          "
        />
      </div>

      {}
      <textarea
        name="address"
        placeholder="Delivery Address *"
        value={formData.address}
        onChange={handleChange}
        rows={4}
        className="
          border 
          p-3 
          rounded-lg 
          w-full 
          mt-4 
          focus:outline-none 
          focus:ring-2 
          focus:ring-yellow-400
        "
      />

      {}
      <input
        type="text"
        name="state"
        placeholder="State"
        value={formData.state}
        onChange={handleChange}
        className="
          border 
          p-3 
          rounded-lg 
          w-full 
          mt-4 
          focus:outline-none 
          focus:ring-2 
          focus:ring-yellow-400
        "
      />

      {}
      <p className="text-sm text-gray-500 mt-4">
        <span className="text-yellow-500 font-semibold">*</span> Required fields
      </p>
    </div>
  );
};

export default CheckoutForm;
