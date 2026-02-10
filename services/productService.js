import { publicApi as api, handleApiError } from '../src/lib/api';

export function buildProductsQuery(filters = {}) {
	const params = new URLSearchParams();

	if (!filters || typeof filters !== 'object') return params;

	const {
		minPrice,
		maxPrice,
		rating,
		brands,
		categories,
		collections,
		page,
		...rest
	} = filters;

	if (minPrice != null && minPrice !== '') params.set('min_price', String(minPrice));
	if (maxPrice != null && maxPrice !== '') params.set('max_price', String(maxPrice));
	if (rating != null && rating !== '') params.set('min_rating', String(rating));

	const pushArray = (key, value) => {
		if (Array.isArray(value) && value.length > 0) {
			params.set(key, value.join(','));
		} else if (value != null && value !== '') {
			params.set(key, String(value));
		}
	};

	pushArray('brands', brands);
	pushArray('categories', categories);
	pushArray('collections', collections);

	if (page != null && page !== '') params.set('page', String(page));

	for (const [k, v] of Object.entries(rest)) {
		if (v == null || v === '') continue;
		if (Array.isArray(v)) {
			if (v.length > 0) params.set(k, v.join(','));
		} else {
			params.set(k, String(v));
		}
	}

	return params;
}

export const productService = {
	async getProducts(params = {}) {
		try {
 		// 1. Fetch the list (may contain broken/zero ratings)
 		const response = await api.get('/products', { params: { ...params, t: Date.now() } });
 		const body = response?.data ?? {};

 		const rawItems = Array.isArray(body.items)
 			? body.items
 			: Array.isArray(body.data)
 			? body.data
 			: Array.isArray(body.products)
 			? body.products
 			: Array.isArray(body)
 			? body
 			: [];
 		let items = Array.isArray(rawItems) ? rawItems : [];

 		// 2. DEEP FETCH: Parallel fetch of single-product endpoints to obtain true ratings/reviews
 		if (items.length > 0) {
 			const detailPromises = items.map((p) =>
 				api
 					.get(`/products/${encodeURIComponent(String(p.id))}`)
 					.then((res) => res?.data?.data ?? res?.data ?? null)
 					.catch(() => null)
 				);

 			const details = await Promise.all(detailPromises);

 			// Merge fresh details back into the list
 			items = items.map((p, index) => {
 				const fresh = details[index];
 				const freshRating = fresh ? (Number(fresh.rating) || Number(fresh.average_rating) || Number(fresh.averageRating) || 0) : 0;
 				const listRating = Number(p.rating) || Number(p.average_rating) || Number(p.averageRating) || 0;

 				const rating = freshRating || listRating || 0;

 				const freshReviewCount = fresh
 					? Number(fresh.reviewCount) || Number(fresh.review_count) || (Array.isArray(fresh.reviews) ? fresh.reviews.length : 0) || 0
 					: 0;
 				const listReviewCount = Number(p.reviewCount) || Number(p.review_count) || (Array.isArray(p.reviews) ? p.reviews.length : 0) || 0;

 				return {
 					...p,
 					rating,
 					reviewCount: fresh ? freshReviewCount : listReviewCount,
 					reviews: Array.isArray(fresh?.reviews) ? fresh.reviews : Array.isArray(p?.reviews) ? p.reviews : []
 				};
 			});
 		}

 		const total = body?.pagination?.total ?? body.total ?? items.length ?? 0;
 		const respPage = body?.pagination?.page ?? params.page ?? 1;

 		// Development-only sample log
 		// eslint-disable-next-line no-console
 		if (process.env.NODE_ENV !== 'production') console.debug('[productService] deep-normalized sample', { sample: items.slice(0, 3) });

 		return { products: items, total, page: respPage };
		} catch (error) {
			throw handleApiError(error);
		}
	},

		async getProductReviews(id) {
			try {
				const response = await api.get(`/products/${encodeURIComponent(String(id))}/reviews`);
				const data = response?.data ?? response;
				// Accept multiple shapes: direct array, { reviews: [...] }, or { data: [...] }
				if (Array.isArray(data)) return data;
				if (Array.isArray(data.reviews)) return data.reviews;
				if (Array.isArray(data.data)) return data.data;
				return [];
			} catch (error) {
				// Log and return empty reviews to avoid crashing the UI
				// eslint-disable-next-line no-console
				console.error('Error fetching reviews:', error);
				return [];
			}
		},

	async getProduct(id) {
		try {
			const response = await api.get(`/products/${encodeURIComponent(String(id))}`);
			const body = response.data ?? response;

			// Accept multiple backend shapes
			const prod = body?.data?.product ?? body?.product ?? body?.data ?? body ?? null;
			if (!prod) return null;

			const ratingRaw = prod?.rating ?? prod?.average_rating ?? prod?.averageRating ?? prod?.avg_rating ?? prod?.avgRating ?? prod?.review_score ?? 0;
			let rating = Number(ratingRaw);
			if (!Number.isFinite(rating)) rating = 0;

			if (rating === 0 && Array.isArray(prod?.reviews) && prod.reviews.length > 0) {
				const sum = prod.reviews.reduce((s, r) => s + (Number(r?.rating) || 0), 0);
				rating = sum ? sum / prod.reviews.length : 0;
			}

			const reviewCount = Number(
				prod?.reviewCount ?? prod?.review_count ?? prod?.reviews_count ?? prod?.reviewsCount ?? (Array.isArray(prod?.reviews) ? prod.reviews.length : 0) ?? 0
			) || 0;

			return { ...prod, rating, reviewCount };
		} catch (error) {
			throw handleApiError(error);
		}
	}
};

export default productService;

