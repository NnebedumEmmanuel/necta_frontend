const addToCart = (product) => {
  setCartItems(prev => {
    const existing = prev.find(item => item.name === product.name);
    if (existing) {
      return prev.map(item =>
        item.name === product.name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );  
    }
    return [...prev, { ...product, quantity: 1 }];
  });
};
