import { DataProvider, fetchUtils } from 'react-admin';
import { API_URL, API_KEY } from './config';
import { ApiError } from './types';

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
  
  const json = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const error = new Error(json.message || json.error || 'Request failed') as ApiError;
    error.status = response.status;
    error.body = json;
    
    if (response.status === 401 && json.error && typeof json.error === 'string' && 
        (json.error.includes('Only companies') || 
         json.error.includes('access') || 
         json.error.includes('permission'))) {
      error.isPermissionError = true;
    }
    
    throw error;
  }
  
  return { json };
};

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const limit = perPage;
    const offset = (page - 1) * perPage;
    
    const query = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    const url = `${API_URL}/${resource}?${query.toString()}`;
    
    try {
      const { json } = await httpClient(url);
    
    let data: Record<string, unknown>[] = [];
    let total = 0;
    
    if (Array.isArray(json)) {
      data = json;
      total = json.length;
    } else if (json && Array.isArray(json.data)) {
      data = json.data;
      total = json.total || json.count || json.data.length;
    } else if (json && json.items && Array.isArray(json.items)) {
      data = json.items;
      total = json.total || json.count || json.items.length;
    } else if (json && json.products && Array.isArray(json.products)) {
      data = json.products;
      total = json.pagination?.total || json.pagination?.count || json.products.length;
    } else if ((resource === 'company/analytics' || resource === 'statistics') && json && typeof json === 'object') {
      data = [json];
      total = 1;
    } else {
      data = [];
      total = 0;
    }
    
      return {
        data,
        total,
      };
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.isPermissionError) {
        return {
          data: [],
          total: 0,
        };
      }
      throw error;
    }
  },

  getOne: async (resource, params) => {
    const url = `${API_URL}/${resource}/${params.id}`;
    try {
      const { json } = await httpClient(url);
      return { data: json };
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.isPermissionError) {
        throw new Error('Нет доступа к этому ресурсу');
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
      [params.target]: params.id,
    });
    
    const url = `${API_URL}/${resource}?${query.toString()}`;
    try {
      const { json } = await httpClient(url);
      
      return {
        data: json.data || json,
        total: json.total || json.length || 0,
      };
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.isPermissionError) {
        return {
          data: [],
          total: 0,
        };
      }
      throw error;
    }
  },

  create: async (resource, params) => {
    const url = `${API_URL}/${resource}`;
    try {
      const { json } = await httpClient(url, {
        method: 'POST',
        body: JSON.stringify(params.data),
      });
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
      return { data: { id: params.id } };
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

