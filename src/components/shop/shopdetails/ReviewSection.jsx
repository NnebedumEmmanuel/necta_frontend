import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastProvider';
import api from '@/lib/api';

export default function ReviewSection({ productId, onReviewSubmitted }) {
  if (!productId) return null;

  const [visibleReviewsCount, setVisibleReviewsCount] = useState(1);
  // localReviews is the UI source of truth and is refreshed from the backend.
  const [localReviews, setLocalReviews] = useState([]);
  // backendTotal is populated from the server response when available. If
  // server-side pagination or partial shapes are returned, this lets the UI
  // show "Showing X of Y reviews" transparently.
  const [backendTotal, setBackendTotal] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formErrors, setFormErrors] = useState({});
  // local optimistic helpful/not-helpful toggles: { [reviewId]: 'helpful' | 'not' }
  const [helpfulToggles, setHelpfulToggles] = useState({});
  const { showToast } = useToast() || { showToast: () => {} };

  const reviewsArray = localReviews;
  const arrayCount = reviewsArray.length;

  // Only derive average/total from the reviews.reviews array. Do not fall back
  // to backend-provided averages for display — that would give a false sense
  // of confidence when we only have a partial sample.
  const displayAverage = arrayCount > 0
    ? reviewsArray.reduce((s, r) => s + (Number(r.rating) || 0), 0) / arrayCount
    : null;

  const displayTotal = arrayCount;

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

  // Compute rating counts and percentages solely from the reviews.reviews array.
  // We ignore any backend-provided `ratingCounts` to avoid optimistic UI.
  const ratingCountsFromArray = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
  if (arrayCount > 0) {
    reviewsArray.forEach((r) => {
      const rating = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 0)));
      const key = String(rating);
      if (ratingCountsFromArray[key] !== undefined) ratingCountsFromArray[key] += 1;
    });
  }

  const getRatingPercentage = (count) => {
    const total = arrayCount; // percentage denominator is the sample size
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  // Load reviews from backend for this productId and populate local state.
  async function loadReviews() {
    if (!productId) return;
    try {
      const res = await api.get(`/products/${productId}/reviews`);
      const body = res?.data ?? {};
      const fetched = Array.isArray(body?.reviews) ? body.reviews : [];
      setLocalReviews(fetched);
      setBackendTotal(typeof body?.totalReviews === 'number' ? body.totalReviews : fetched.length);
    } catch (e) {
      console.error('Failed to load reviews', e);
      setLocalReviews([]);
      setBackendTotal(null);
    }
  }

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return (
    <section className="mt-12 bg-[#FAFAFA] p-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Customer Reviews</h2>

        {}
        <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-gray-200">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {displayAverage !== null ? displayAverage.toFixed(1) : '—'}
            </div>
            <div className="flex mb-2">
              {displayAverage !== null ? renderStars(Math.round(displayAverage)) : null}
            </div>
            <div className="text-gray-600 text-sm">
              {backendTotal != null && backendTotal > arrayCount ? (
                <span>Showing {arrayCount} of {backendTotal} reviews</span>
              ) : arrayCount > 0 ? (
                <span>Based on {arrayCount} review{arrayCount !== 1 ? 's' : ''}</span>
              ) : (
                <span>No reviews yet</span>
              )}
            </div>
          </div>

          {}
          <div className="flex-1">
            {arrayCount > 0 ? (
              [5,4,3,2,1].map((rating) => {
                const count = ratingCountsFromArray[String(rating)] || 0;
                const percentage = getRatingPercentage(count);
                const label = `${rating} star${rating !== 1 ? 's' : ''}`;

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
              })
            ) : (
              <div className="text-sm text-gray-600">No rating breakdown available</div>
            )}
          </div>

          {}
          <div className="flex items-center">
            <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-6 rounded-lg transition duration-200">
              Write a Review
            </button>
          </div>
        </div>

        {/* Modal (frontend-only). Form is validated and appended to localReviews on submit. */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setIsModalOpen(false)} />
            <div className="bg-white rounded-lg shadow-xl z-10 w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

              <div className="space-y-3">
                {/* Name removed: reviews are anonymous and stored without a name field */}

                <div>
                  <label className="block text-sm text-gray-700">Rating</label>
                  <select value={formRating} onChange={(e) => setFormRating(Number(e.target.value))} className="w-full border rounded px-3 py-2 mt-1">
                    {[5,4,3,2,1].map((r) => (
                      <option key={r} value={r}>{r} star{r !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  {formErrors.rating && <div className="text-red-500 text-sm mt-1">{formErrors.rating}</div>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700">Comment</label>
                  <textarea value={formComment} onChange={(e) => setFormComment(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" rows={4} />
                  {formErrors.comment && <div className="text-red-500 text-sm mt-1">{formErrors.comment}</div>}
                </div>

                <div className="flex items-center justify-end gap-3 mt-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
                  <button onClick={() => {
                    // Validate
                    const errs = {};
                    if (!formRating || formRating < 1 || formRating > 5) errs.rating = 'Please select a rating between 1 and 5';
                    if (!formComment || String(formComment).trim().length < 3) errs.comment = 'Please enter a comment (min 3 chars)';
                    setFormErrors(errs);
                    if (Object.keys(errs).length > 0) return;

                      // Submit to backend
                      (async () => {
                        try {
                          const payload = { rating: Number(formRating), comment: String(formComment).trim() };
                          try {
                            const res = await api.post(`/products/${productId}/reviews`, payload);
                            const body = res?.data ?? {};
                            if (!res || (res.status && res.status >= 400)) {
                              setFormErrors({ submit: body?.error || 'Failed to submit review' });
                              return;
                            }
                          } catch (err) {
                            const msg = err?.response?.data?.error || err?.message || 'Failed to submit review';
                            setFormErrors({ submit: msg });
                            return;
                          }


                          // Re-fetch authoritative reviews from backend
                          await loadReviews();

                          // Notify parent page to refresh product data (cache-buster)
                          try { if (typeof onReviewSubmitted === 'function') await onReviewSubmitted(); } catch (e) { console.debug('onReviewSubmitted failed', e); }

                  // Reset and close
                  setFormRating(5); setFormComment(''); setFormErrors({}); setIsModalOpen(false);
                          setVisibleReviewsCount((c) => Math.max(1, c));
                        } catch (e) {
                          setFormErrors({ submit: String(e) });
                        }
                      })();
                  }} className="px-4 py-2 rounded bg-orange-500 text-white">Submit</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        <div className="space-y-8">
          {reviewsArray && reviewsArray.length > 0 ? (
            reviewsArray.slice(0, visibleReviewsCount).map((review) => (
              <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-600">
                        {/* No name/avatar stored in reviews table; show generic avatar */}
                        <span className="text-lg font-medium">👤</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Customer</h4>
                        <p className="text-sm text-gray-500">{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                
                {}
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => {
                      // optimistic toggle: mark helpful
                      setHelpfulToggles(prev => {
                        const key = String(review.id);
                        const was = prev[key];
                        const next = { ...prev };
                        if (was === 'helpful') delete next[key];
                        else next[key] = 'helpful';
                        return next;
                      });
                      showToast('Thanks for your feedback!');
                      console.log(`API Call: Mark review ${review.id} as helpful`);
                    }}
                    className="flex items-center gap-1 text-sm"
                    aria-pressed={helpfulToggles[String(review.id)] === 'helpful'}
                  >
                    <svg className={`w-4 h-4 ${helpfulToggles[String(review.id)] === 'helpful' ? 'text-green-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span className={`text-sm ${helpfulToggles[String(review.id)] === 'helpful' ? 'text-green-600' : 'text-gray-600'}`}>Helpful</span>
                  </button>

                  <button
                    onClick={() => {
                      // optimistic toggle: mark not helpful
                      setHelpfulToggles(prev => {
                        const key = String(review.id);
                        const was = prev[key];
                        const next = { ...prev };
                        if (was === 'not') delete next[key];
                        else next[key] = 'not';
                        return next;
                      });
                      showToast('Thanks for your feedback!');
                      console.log(`API Call: Mark review ${review.id} as not helpful`);
                    }}
                    className="flex items-center gap-1 text-sm"
                    aria-pressed={helpfulToggles[String(review.id)] === 'not'}
                  >
                    <svg className={`w-4 h-4 ${helpfulToggles[String(review.id)] === 'not' ? 'text-blue-500' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    <span className={`text-sm ${helpfulToggles[String(review.id)] === 'not' ? 'text-blue-500' : 'text-gray-600'}`}>Not Helpful</span>
                  </button>

                  <button className="text-sm text-gray-600 hover:text-gray-900 ml-auto">Report</button>
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
        {reviewsArray && reviewsArray.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleReviewsCount((c) => Math.min(reviewsArray.length, c + 2))}
              disabled={visibleReviewsCount >= reviewsArray.length}
              className={`text-gray-700 border border-gray-300 rounded-lg px-6 py-2.5 hover:bg-gray-50 flex items-center gap-2 transition duration-200 font-medium ${visibleReviewsCount >= reviewsArray.length ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {visibleReviewsCount >= reviewsArray.length ? 'All Reviews Loaded' : 'Load More Reviews'}
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