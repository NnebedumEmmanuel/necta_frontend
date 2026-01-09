import React from "react";

const CheckoutForm = ({ formData, setFormData }) => {

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
