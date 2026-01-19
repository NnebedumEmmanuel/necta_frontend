import { useState } from 'react';

export default function ReviewSection({ product }) {
  if (!product.reviews) return null;

  const { reviews } = product;

  const [visibleReviewsCount, setVisibleReviewsCount] = useState(1);

  const reviewsArray = Array.isArray(reviews.reviews) ? reviews.reviews : [];
  const arrayCount = reviewsArray.length;

  const displayAverage = arrayCount > 0
    ? reviewsArray.reduce((s, r) => s + (Number(r.rating) || 0), 0) / arrayCount
    : (typeof reviews.averageRating === 'number' ? reviews.averageRating : 0);

  const displayTotal = arrayCount > 0
    ? arrayCount
    : (typeof reviews.totalReviews === 'number' ? reviews.totalReviews : 0);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  const getRatingPercentage = (count) => {
    const total = displayTotal;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <section className="mt-12 bg-[#FAFAFA] p-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Customer Reviews</h2>

        {}
        <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-gray-200">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {Number.isFinite(displayAverage) ? displayAverage.toFixed(1) : '0.0'}
            </div>
            <div className="flex mb-2">
              {renderStars(Math.round(displayAverage))}
            </div>
            <div className="text-gray-600 text-sm">
              {arrayCount > 0 ? (
                reviews.totalReviews && reviews.totalReviews > arrayCount ? (
                  <span>Showing {arrayCount} of {reviews.totalReviews} reviews</span>
                ) : (
                  <span>Based on {arrayCount} review{arrayCount !== 1 ? 's' : ''}</span>
                )
              ) : (
                reviews.totalReviews ? (
                  <span>Based on {reviews.totalReviews} review{reviews.totalReviews !== 1 ? 's' : ''}</span>
                ) : (
                  <span>No reviews yet</span>
                )
              )}
            </div>
          </div>

          {}
          <div className="flex-1">
            {Object.entries(reviews.ratingCounts).map(([rating, count]) => {
                const percentage = getRatingPercentage(count);
                const label = rating.charAt(0).toUpperCase() + rating.slice(1);

                return (
                  <div key={rating} className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-600 w-24">{label}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
          </div>

          {}
          <div className="flex items-center">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-6 rounded-lg transition duration-200">
              Write a Review
            </button>
          </div>
        </div>

        {}
        <div className="space-y-8">
          {reviews.reviews && reviews.reviews.length > 0 ? (
            reviews.reviews.slice(0, visibleReviewsCount).map((review) => (
              <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      {review.avatar ? (
                        <img 
                          src={review.avatar} 
                          alt={review.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                          {review.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{review.name}</h4>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                
                {}
                <div className="flex items-center gap-4 mt-4">
                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Helpful
                  </button>
                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    Not Helpful
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-900 ml-auto">
                    Report
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>

        {}
        {reviews.reviews && reviews.reviews.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleReviewsCount((c) => Math.min(reviews.reviews.length, c + 2))}
              disabled={visibleReviewsCount >= reviews.reviews.length}
              className={`text-gray-700 border border-gray-300 rounded-lg px-6 py-2.5 hover:bg-gray-50 flex items-center gap-2 transition duration-200 font-medium ${visibleReviewsCount >= reviews.reviews.length ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {visibleReviewsCount >= reviews.reviews.length ? 'All Reviews Loaded' : 'Load More Reviews'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}