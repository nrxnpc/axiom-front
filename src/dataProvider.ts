import { DataProvider, fetchUtils } from 'react-admin';
import { API_URL, API_KEY } from './config';
import { ApiError } from './types';
import { userStore } from './userStore';

const getAuthToken = (): string => {
  const auth = localStorage.getItem('auth');
  if (!auth) {
    return API_KEY;
  }
  try {
    const authData = JSON.parse(auth);
    return authData.access_token || API_KEY;
  } catch {
    return API_KEY;
  }
};

const handleUnauthorized = () => {
  userStore.clearUser();
  localStorage.removeItem('auth');
  window.location.replace('/login');
};

const httpClient = async (url: string, options: fetchUtils.Options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  const headers = options.headers as Headers;
  headers.set('X-API-Key', API_KEY);
  headers.set('Content-Type', 'application/json');
  
  const token = getAuthToken();
  headers.set('Authorization', `Bearer ${token}`);
  
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: headers as any,
    body: options.body,
  });
  
  let json: any = {};
  try {
    const text = await response.text();
    if (text && text.trim()) {
      json = JSON.parse(text);
    }
  } catch (parseError) {
    json = {};
  }
  
  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      const error = new Error('Сессия истекла. Пожалуйста, войдите снова.') as ApiError;
      error.status = 401;
      error.body = json;
      throw error;
    }
    
    const error = new Error(json.message || json.error || 'Request failed') as ApiError;
    error.status = response.status;
    error.body = json;
    
    throw error;
  }
  
  return { json };
};

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    let url: string;
    
    if (resource === 'parts') {
      resource = 'spare-parts';
    }
    
    if (resource === 'admin/users') {
      const { page, perPage } = params.pagination;
      const limit = perPage;
      const offset = (page - 1) * perPage;
      
      const query = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      
      if (params.filter) {
        if (params.filter.name) {
          query.set('name', params.filter.name);
        }
        if (params.filter.email) {
          query.set('email', params.filter.email);
        }
        if (params.filter.phone) {
          query.set('phone', params.filter.phone);
        }
        if (params.filter.role) {
          query.set('role', params.filter.role);
        }
        if (params.filter.userType) {
          query.set('userType', params.filter.userType);
        }
        if (params.filter.isActive !== undefined && params.filter.isActive !== null) {
          query.set('isActive', params.filter.isActive.toString());
        }
      }
      
      url = `${API_URL}/${resource}?${query.toString()}`;
    } else if (resource === 'statistics' || resource === 'company/analytics') {
      url = `${API_URL}/${resource}`;
    } else {
      const { page, perPage } = params.pagination;
      const limit = perPage;
      const offset = (page - 1) * perPage;
      
      const query = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      
      url = `${API_URL}/${resource}?${query.toString()}`;
    }
    
    try {
      const { json } = await httpClient(url);
      
      let data: Record<string, unknown>[] = [];
      let total = 0;
    
    if (resource === 'statistics' || resource === 'company/analytics') {
      if (json && typeof json === 'object' && !Array.isArray(json) && Object.keys(json).length > 0) {
        const dataWithId = { ...json, id: resource === 'statistics' ? 'statistics' : 'analytics' };
        data = [dataWithId];
        total = 1;
      } else {
        data = [];
        total = 0;
      }
    } else if (resource === 'admin/users' && json && json.users && Array.isArray(json.users)) {
      data = json.users;
      total = json.pagination?.total || json.users.length;
    } else if (resource === 'user/transactions' && json && json.transactions && Array.isArray(json.transactions)) {
      data = json.transactions;
      total = json.pagination?.total || json.transactions.length;
    } else if (resource === 'campaigns' && json && json.campaigns && Array.isArray(json.campaigns)) {
      data = json.campaigns;
      total = json.pagination?.total || json.campaigns.length;
    } else if (resource === 'news' && json && json.news && Array.isArray(json.news)) {
      data = json.news;
      total = json.pagination?.total || json.news.length;
    } else if (resource === 'cars' && json && json.cars && Array.isArray(json.cars)) {
      data = json.cars;
      total = json.pagination?.total || json.cars.length;
    } else if (resource === 'spare-parts' && json && json.spare_parts && Array.isArray(json.spare_parts)) {
      data = json.spare_parts.map((part: any) => ({
        id: part.id,
        productName: part.sku,
        productCategory: part.category,
        pointsEarned: part.points,
      }));
      total = json.pagination?.total || json.spare_parts.length;
    } else if (resource === 'spare-parts' && Array.isArray(json)) {
      data = json.map((part: any) => ({
        id: part.id,
        productName: part.sku,
        productCategory: part.category,
        pointsEarned: part.points,
      }));
      total = json.length;
    } else if (Array.isArray(json)) {
      data = json;
      total = json.length;
    } else if (json && Array.isArray(json.data)) {
      data = json.data;
      total = json.total || json.count || json.data.length;
    } else if (json && json.items && Array.isArray(json.items)) {
      data = json.items;
      total = json.total || json.count || json.items.length;
    } else if (json && json.products && Array.isArray(json.products)) {

      data = json.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        pointsCost: product.points_cost ?? product.pointsCost,
        stockQuantity: product.stock_quantity ?? product.stockQuantity,
        imageURL: product.image_url ?? product.imageURL,
        description: product.description,
        isActive: product.is_active ?? product.isActive,
        createdAt: product.created_at ?? product.createdAt,
      }));
      total = json.pagination?.total || json.pagination?.count || json.products.length;
    } else {
      data = [];
      total = 0;
    }
    
      return {
        data: data as any,
        total,
      };
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.isPermissionError) {
        return {
          data: [] as any,
          total: 0,
        };
      }
      throw error;
    }
  },

  getOne: async (resource, params) => {

    if (resource === 'products') {
      return {
        data: {
          id: params.id,
        },
      };
    }
    
    const url = `${API_URL}/${resource}/${params.id}`;
    try {
      const { json } = await httpClient(url);
      return { data: json };
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.isPermissionError) {
        throw new Error('Нет доступа к этому ресурсу');
      }
      if (apiError.status === 405 || apiError.status === 404) {
        return {
          data: {
            id: params.id,
          },
        };
      }
      throw error;
    }
  },

  getMany: async (resource, params) => {
    const url = `${API_URL}/${resource}`;
    try {
      const { json } = await httpClient(url);
      const data = Array.isArray(json) ? json : (json.data || []);
      return { data: data.filter((item: { id: string | number }) => params.ids.includes(item.id)) };
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.isPermissionError) {
        return { data: [] };
      }
      throw error;
    }
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const limit = perPage;
    const offset = (page - 1) * perPage;
    
    const query = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      [params.target]: String(params.id),
    });
    
    const url = `${API_URL}/${resource}?${query.toString()}`;
    try {
      const { json } = await httpClient(url);
      
      return {
        data: (json.data || json) as any,
        total: json.total || json.length || 0,
      };
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.isPermissionError) {
        return {
          data: [] as any,
          total: 0,
        };
      }
      throw error;
    }
  },

  create: async (resource, params) => {
    let url: string;
    let requestData = params.data;
    
    if (resource === 'parts') {
      resource = 'spare-parts';
      requestData = {
        sku: params.data.productName,
        category: params.data.productCategory,
        points: params.data.pointsEarned,
      };
    }
    
    url = `${API_URL}/${resource}`;
    try {
      const { json } = await httpClient(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      if (resource === 'news' && json && json.article_id) {
        return { data: { id: json.article_id, ...json } };
      }
      if (resource === 'cars' && json && json.car_id) {
        return { data: { id: json.car_id, ...json } };
      }
      if (resource === 'products' && json && json.product_id) {
        return { data: { id: json.product_id, ...json } };
      }
      if (resource === 'spare-parts' && json) {
        const sparePart = json.spare_part || json;
        return {
          data: {
            id: sparePart.id || json.spare_part_id,
            productName: sparePart.sku,
            productCategory: sparePart.category,
            pointsEarned: sparePart.points,
          },
        };
      }
      if (!json || !json.id) {
        if (json && typeof json === 'object' && Object.keys(json).length > 0) {
          return { data: json };
        }
        throw new Error('Сервер вернул неожиданный формат ответа');
      }
      return { data: json };
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.isPermissionError) {
        throw new Error('Нет доступа для создания этого ресурса');
      }
      throw error;
    }
  },

  update: async (resource, params) => {
    const url = `${API_URL}/${resource}/${params.id}`;
    try {
      const { json } = await httpClient(url, {
        method: 'PUT',
        body: JSON.stringify(params.data),
      });
      
      if (resource === 'products' && json && json.product) {
        const product = json.product;
        return {
          data: {
            id: product.id,
            name: product.name,
            category: product.category,
            pointsCost: product.points_cost,
            stockQuantity: product.stock_quantity,
            imageURL: product.image_url,
            description: product.description,
            isActive: product.is_active,
          },
        };
      }

      return { data: json };
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.isPermissionError) {
        throw new Error('Нет доступа для редактирования этого ресурса');
      }
      throw error;
    }
  },

  updateMany: async (resource, params) => {
    try {
      const promises = params.ids.map(id =>
        httpClient(`${API_URL}/${resource}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(params.data),
        })
      );
      const responses = await Promise.all(promises);
      return { data: responses.map(({ json }) => json.id) };
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.isPermissionError) {
        throw new Error('Нет доступа для редактирования этого ресурса');
      }
      throw error;
    }
  },

  delete: async (resource, params) => {
    const url = `${API_URL}/${resource}/${params.id}`;
    try {
      await httpClient(url, {
        method: 'DELETE',
      });
      return { data: { id: params.id } as any };
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.isPermissionError) {
        throw new Error('Нет доступа для удаления этого ресурса');
      }
      throw error;
    }
  },

  deleteMany: async (resource, params) => {
    try {
      const promises = params.ids.map(id =>
        httpClient(`${API_URL}/${resource}/${id}`, {
          method: 'DELETE',
        })
      );
      await Promise.all(promises);
      return { data: params.ids };
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.isPermissionError) {
        throw new Error('Нет доступа для удаления этого ресурса');
      }
      throw error;
    }
  },
};

