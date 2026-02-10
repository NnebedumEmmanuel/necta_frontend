// Centralized product rating helper
// Trust backend rating when present; otherwise compute average from reviews array.
export function getProductRating(product) {
  if (!product) return 0;
  // 1. Calculate from Real Reviews (Highest Priority)
  if (Array.isArray(product.reviews) && product.reviews.length > 0) {
    const validReviews = product.reviews.filter(r => Number(r?.rating) > 0);
    if (validReviews.length === 0) return 0;
    const total = validReviews.reduce((acc, rev) => acc + Number(rev.rating), 0);
    return total / validReviews.length;
  }

  // 2. Use Backend Pre-Calculated (DB Column)
  const avg = parseFloat(product.average_rating ?? product.averageRating);
  if (!isNaN(avg) && avg > 0) return avg;

  // 3. Fallback to 'rating' column (Handle string values like "4.00")
  const fallback = parseFloat(product.rating);
  if (!isNaN(fallback) && fallback > 0) return fallback;

  return 0;
}

export default getProductRating;
