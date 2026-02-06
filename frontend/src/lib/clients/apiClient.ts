const STORAGE_KEY_URL = 'inkshelf_api_url';
const STORAGE_KEY_TOKEN = 'inkshelf_access_token';
const DEFAULT_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private baseUrl: string = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_URL;

  private isDev(): boolean {
    return (
      (window as any).process?.env?.NODE_ENV !== 'production' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );
  }

  public normalizeUrl(url: string): string {
    let target = url.trim();
    if (!target) return '';

    if (!/^https?:\/\//i.test(target)) {
      target = `https://${target}`;
    }

    target = target.replace(/\/+$/, '');

    const versionRegex = /\/api\/v\d+$/i;
    if (!versionRegex.test(target)) {
      target = `${target}/api/v1`;
    }

    return target;
  }

  setBaseUrl(url: string) {
    this.baseUrl = this.normalizeUrl(url);
    localStorage.setItem(STORAGE_KEY_URL, this.baseUrl);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  resolve(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return this.buildUrl(path);
  }

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  }

  private buildHeaders(includeAuth: boolean = true, isFormData: boolean = false): Headers {
    const headers = new Headers();
    headers.set('Accept', 'application/json');

    if (!isFormData) {
      headers.set('Content-Type', 'application/json');
    }

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    if (this.isDev()) {
      headers.set('ngrok-skip-browser-warning', 'true');
    }

    return headers;
  }

  async checkHealth(url: string): Promise<{ ok: boolean; error?: string }> {
    const normalizedTarget = this.normalizeUrl(url);
    if (!normalizedTarget) {
      return { ok: false, error: 'La URL es requerida' };
    }

    try {
      const response = await fetch(`${normalizedTarget}/health`, {
        method: 'GET',
        mode: 'cors',
        headers: this.buildHeaders(false)
      });

      return {
        ok: response.ok,
        error: response.ok ? undefined : `Server error: ${response.status}`
      };
    } catch (e: any) {
      return {
        ok: false,
        error: 'Cannot connect to the server.'
      };
    }
  }

  private buildUrl(path: string): string {
    if (!this.baseUrl) {
      throw new Error('Server not found');
    }

    const cleanPath = path.startsWith('/api/v')
      ? path.replace(/^\/api\/v\d+/, '')
      : path;

    return `${this.baseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const isFormData = options.body instanceof FormData;
    const url = this.buildUrl(path);
    const headers = this.buildHeaders(true, isFormData);

    // Merge custom headers if provided
    if (options.headers) {
      const customHeaders = new Headers(options.headers);
      customHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 401 && !url.includes('/auth/login')) {
        this.setToken(null);
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        throw new Error('Sesión expirada');
      }

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.message || `Error ${response.status}: ${response.statusText}`);
      }

      // If response has pagination, return as PaginatedResponse format
      if (responseData.pagination) {
        return {
          data: responseData.data,
          pagination: responseData.pagination
        } as T;
      }

      // Otherwise unwrap data if present, or return raw response
      return (responseData.data !== undefined ? responseData.data : responseData) as T;
    } catch (e: any) {
      if (e.name === 'TypeError') {
        throw new Error('Network error: Could not connect to the server.');
      }
      throw e;
    }
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: any): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined)
    });
  }

  patch<T>(path: string, body?: any): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined)
    });
  }

  put<T>(path: string, body?: any): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined)
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();