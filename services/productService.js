import { publicApi as api, handleApiError, API_BASE_URL } from '../src/lib/api';

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

class ProductService {
  
  async getProducts(limit = 10, page = 1, search = '', filters = null) {
    try {
      if (typeof limit === 'object' && limit !== null) {
        const opts = limit;
        limit = opts.limit ?? 10;
        page = opts.page ?? 1;
        search = opts.search ?? '';
        filters = opts.filters ?? null;
      }

      const params = new URLSearchParams();
  if (limit != null) params.set('limit', String(limit));
  if (page != null) params.set('page', String(page));

      if (filters && typeof filters === 'object') {
        const filterParams = buildProductsQuery(filters);
        for (const [k, v] of filterParams.entries()) params.set(k, v);
      }

      if (search && String(search).trim() !== '') {
        params.set('q', String(search).trim());
      }

      // Append a timestamp to force fresh responses and avoid stale caching
      params.set('t', String(new Date().getTime()));

      const url = `/products?${params.toString()}`;

      const response = await api.get(url, { params: undefined });
      const body = response.data || {};

      // Prefer the new canonical shape: { items: Product[], pagination: { page, limit, total } }
      const items = Array.isArray(body.items)
        ? body.items
        : Array.isArray(body.data)
        ? body.data
        : Array.isArray(body.products)
        ? body.products
        : Array.isArray(body)
        ? body
        : [];

      const total = body?.pagination?.total ?? body.total ?? body.count ?? 0;

      // Debug: surface raw and normalized shapes to help during migration
      try {
        // Avoid noisy logs in production by checking environment when available
        // but keep logs useful during development
        // eslint-disable-next-line no-console
        console.debug('[productService] raw response body', body);
        // eslint-disable-next-line no-console
        console.debug('[productService] normalized', { products: items.length, total, page: body?.pagination?.page ?? page });
      } catch (e) {}

      // Normalize page from response when present
      const respPage = body?.pagination?.page ?? page;
      return { products: items, total, page: respPage };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getProduct(id) {
    try {
  const response = await api.get(`/products/${id}`);
      const body = response.data || null;
      // Accept multiple backend shapes for compatibility:
      // - { product: {...} }
      // - { data: {...} } or { data: { product: {...} } }
      // - product (raw object)
      return (
        body?.product ??
        body?.data?.product ??
        body?.data ??
        body ??
        null
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getRelated(id, limit = 8) {
    try {
      if (!id) return { products: [], total: 0 }
      const url = `/products/${id}/related?limit=${encodeURIComponent(String(limit))}`
      const response = await api.get(url)
      const body = response.data || {}
      const items = Array.isArray(body.data) ? body.data : []
      return { products: items }
    } catch (error) {
      // keep calling code resilient
      // eslint-disable-next-line no-console
      console.error('[productService.getRelated] error', error)
      return { products: [] }
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
