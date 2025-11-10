const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  // Return null if token is empty string or null
  return token && token.trim() !== '' ? token : null;
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  // Build headers object
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge with any existing headers from options first
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  // Add Authorization header last (always set if token exists)
  // This ensures we always use the latest token from localStorage
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Token found, adding to request headers');
  } else {
    console.warn('⚠️ No auth token found in localStorage');
  }

  console.log(`📡 Making ${options.method || 'GET'} request to ${API_BASE_URL}${endpoint}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  console.log(`📥 Response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    console.error('❌ API Error:', error);
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest<{ success: boolean; data: { user: any; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  register: async (email: string, password: string, name: string) => {
    return apiRequest<{ success: boolean; data: { user: any; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },
};

// Library API
export const libraryAPI = {
  getAll: async (includeAllReviews = false) => {
    const params = includeAllReviews ? '?includeAllReviews=true' : '';
    return apiRequest<{ success: boolean; data: any[]; pagination: any }>(`/library${params}`);
  },
  getById: async (id: string, includeAllReviews = false) => {
    const params = includeAllReviews ? '?includeAllReviews=true' : '';
    return apiRequest<{ success: boolean; data: any }>(`/library/${id}${params}`);
  },
  create: async (formData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/library`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  update: async (id: string, formData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/library/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  delete: async (id: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/library/${id}`, {
      method: 'DELETE',
    });
  },
  approveReview: async (bookId: string, reviewId: string) => {
    return apiRequest<{ success: boolean; data: any }>(`/library/${bookId}/reviews/${reviewId}/approve`, {
      method: 'PUT',
    });
  },
  rejectReview: async (bookId: string, reviewId: string) => {
    return apiRequest<{ success: boolean; data: any }>(`/library/${bookId}/reviews/${reviewId}/reject`, {
      method: 'PUT',
    });
  },
};

// Blog API
export const blogAPI = {
  getAll: async (includeAllComments = false) => {
    const params = includeAllComments ? '?includeAllComments=true' : '';
    return apiRequest<{ success: boolean; data: any[]; pagination: any }>(`/blogs${params}`);
  },
  getById: async (id: string, includeAllComments = false) => {
    const params = includeAllComments ? '?includeAllComments=true' : '';
    return apiRequest<{ success: boolean; data: any }>(`/blogs/${id}${params}`);
  },
  create: async (blogData: any) => {
    return apiRequest<{ success: boolean; data: any }>('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  },
  update: async (id: string, blogData: any) => {
    return apiRequest<{ success: boolean; data: any }>(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  },
  delete: async (id: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/blogs/${id}`, {
      method: 'DELETE',
    });
  },
  approveComment: async (blogId: string, commentId: string) => {
    return apiRequest<{ success: boolean; data: any }>(`/blogs/${blogId}/comments/${commentId}/approve`, {
      method: 'PUT',
    });
  },
  rejectComment: async (blogId: string, commentId: string) => {
    return apiRequest<{ success: boolean; data: any }>(`/blogs/${blogId}/comments/${commentId}/reject`, {
      method: 'PUT',
    });
  },
};

// Gallery API
export const galleryAPI = {
  getAll: async () => {
    return apiRequest<{ success: boolean; data: any[]; pagination: any }>('/gallery/items');
  },
  getById: async (id: string) => {
    return apiRequest<{ success: boolean; data: any }>(`/gallery/items/${id}`);
  },
  getCategories: async () => {
    return apiRequest<{ success: boolean; data: any[] }>('/gallery/categories');
  },
  create: async (formData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/gallery/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  update: async (id: string, formData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/gallery/items/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  delete: async (id: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/gallery/items/${id}`, {
      method: 'DELETE',
    });
  },
};

export default apiRequest;

