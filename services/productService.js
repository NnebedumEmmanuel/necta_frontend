// services/productService.js — use central API client
import { api, handleApiError, API_BASE_URL } from '../src/lib/api';

/**
 * Convert a filters object into URLSearchParams.
 * - Only includes params that have values
 * - Arrays are converted into comma-separated strings
 * Supported filter keys (inputs):
 *   minPrice, maxPrice, rating, brands, categories, collections, page
 */
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
    // keep any other passthrough keys if present (e.g., q, sort)
    ...rest
  } = filters;

  if (minPrice != null && minPrice !== '') params.set('min_price', String(minPrice));
  if (maxPrice != null && maxPrice !== '') params.set('max_price', String(maxPrice));
  if (rating != null && rating !== '') params.set('min_rating', String(rating));

  const pushArray = (key, value) => {
    if (Array.isArray(value) && value.length > 0) {
      params.set(key, value.join(','));
    } else if (value != null && value !== '') {
      // allow single string/number
      params.set(key, String(value));
    }
  };

  pushArray('brands', brands);
  pushArray('categories', categories);
  pushArray('collections', collections);

  if (page != null && page !== '') params.set('page', String(page));

  // include any remaining known passthrough keys (e.g., q, sort)
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

class ProductService {
  /**
   * getProducts supports both legacy positional args and modern options:
   * - getProducts(limit = 10, skip = 0, search = '')
   * - getProducts({ limit=10, skip=0, search='', filters: {..} })
   */
  async getProducts(limit = 10, skip = 0, search = '', filters = null) {
    try {
      // Backwards compatibility: if first arg is an object, treat as options
      if (typeof limit === 'object' && limit !== null) {
        const opts = limit;
        limit = opts.limit ?? 10;
        skip = opts.skip ?? 0;
        search = opts.search ?? '';
        filters = opts.filters ?? null;
      }

      // Build base params
      const params = new URLSearchParams();
      if (limit != null) params.set('limit', String(limit));
      if (skip != null) params.set('skip', String(skip));

      // If a filters object is supplied, convert into params and merge
      if (filters && typeof filters === 'object') {
        const filterParams = buildProductsQuery(filters);
        for (const [k, v] of filterParams.entries()) params.set(k, v);
      }

      // Search param handled as `q` in the backend; keep backward compatibility
      if (search && String(search).trim() !== '') {
        params.set('q', String(search).trim());
      }

  const url = `${API_BASE_URL}/products?${params.toString()}`;

  // Use a plain fetch call with cache: 'no-store' to ensure fresh data on every call.
  const response = await fetch(url, { method: 'GET', cache: 'no-store', headers: { 'Accept': 'application/json' } });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        const msg = text || `Request failed with status ${response.status}`;
        const err = new Error(msg);
        err.status = response.status;
        throw err;
      }

      const body = await response.json().catch(() => ({}));

      // Normalize to an array for callers
      const items = Array.isArray(body.data)
        ? body.data
        : Array.isArray(body.items)
        ? body.items
        : Array.isArray(body.products)
        ? body.products
        : Array.isArray(body)
        ? body
        : [];

      const total = body.total ?? body.count ?? 0;

      return { products: items, total };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getProduct(id) {
    try {
  const response = await api.get(`/products/${id}`);
      const body = response.data || null;
      // Backend may return { product: {...} } or the product directly
      return body?.product ?? body ?? null;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async addProduct(product) {
    try {
  const response = await api.post(`/products/add`, product);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateProduct(id, product) {
    try {
  const response = await api.put(`/products/${id}`, product);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async deleteProduct(id) {
    try {
  const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const productService = new ProductService();
export default productService;
