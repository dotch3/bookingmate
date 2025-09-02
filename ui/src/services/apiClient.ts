interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    uid: string;
    email: string;
    role: string;
  };
}

interface User {
  id: string;
  email: string;
  role: string;
  displayName?: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface ApiUser {
  uid: string;
  email: string;
  role: string;
  displayName?: string;
  createdAt: any;
  updatedAt?: any;
  lastLogin?: any;
  disabled?: boolean;
}

interface Reservation {
  id: string;
  date: string;
  slot: string;
  userId: string; // Legacy field for compatibility
  userName: string; // Legacy field for compatibility
  creatorId: string; // Actual field from backend
  creatorName: string; // Actual field from backend
  notes?: string;
  status?: 'active' | 'cancelled';
  createdAt: Date;
  updatedAt?: Date;
}

interface SlotAvailability {
  date: string;
  slot: string;
  available: boolean;
  capacity: number;
  reserved: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    // Try to get token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // The API returns the response directly, not wrapped in a data field
    const loginData = response as any;
    
    if (loginData?.token) {
      this.setToken(loginData.token);
    }

    return loginData;
  }

  async getProfile(): Promise<User> {
    const response = await this.request<User>('/api/auth/profile');
    // The API returns user data in the 'user' field, not 'data'
    const apiUser = (response as any).user || response.data;
    
    if (!apiUser) {
      throw new Error('User profile data not found in response');
    }
    
    // Map API user format (uid) to frontend User interface (id)
    return {
      id: apiUser.uid || '', // Map uid to id for frontend compatibility
      email: apiUser.email || '',
      role: apiUser.role || 'user',
      displayName: apiUser.displayName,
      createdAt: apiUser.createdAt ? new Date(apiUser.createdAt.seconds ? apiUser.createdAt.seconds * 1000 : apiUser.createdAt) : new Date(),
      updatedAt: apiUser.updatedAt ? new Date(apiUser.updatedAt.seconds ? apiUser.updatedAt.seconds * 1000 : apiUser.updatedAt) : (apiUser.lastLogin ? new Date(apiUser.lastLogin.seconds ? apiUser.lastLogin.seconds * 1000 : apiUser.lastLogin) : undefined)
    };
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      await this.request('/health');
      return true;
    } catch {
      return false;
    }
  }

  // User methods
  async getUsers(params?: { limit?: number; offset?: number; role?: string }): Promise<{ users: User[]; total: number; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.role) queryParams.append('role', params.role);
    
    const url = `/api/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await this.request<any>(url);
    const apiUsers: ApiUser[] = (response as any).users || [];
    
    // Map API users to frontend User interface with null checks
    const users = apiUsers.filter(apiUser => apiUser && apiUser.uid).map(apiUser => ({
      id: apiUser.uid || '',
      email: apiUser.email || '',
      role: apiUser.role || 'user',
      displayName: apiUser.displayName,
      createdAt: apiUser.createdAt ? new Date(apiUser.createdAt.seconds ? apiUser.createdAt.seconds * 1000 : apiUser.createdAt) : new Date(),
      updatedAt: apiUser.updatedAt ? new Date(apiUser.updatedAt.seconds ? apiUser.updatedAt.seconds * 1000 : apiUser.updatedAt) : (apiUser.lastLogin ? new Date(apiUser.lastLogin.seconds ? apiUser.lastLogin.seconds * 1000 : apiUser.lastLogin) : undefined)
    }));
    
    return {
      users,
      total: (response as any).total || users.length,
      hasMore: (response as any).hasMore || false
    };
  }

  async getUser(id: string): Promise<User> {
    const response = await this.request<any>(`/api/users/${id}`);
    const apiUser = (response as any).user;
    
    if (!apiUser) {
      throw new Error('User data not found in response');
    }
    
    // Map API user format (uid) to frontend User interface (id)
    return {
      id: apiUser.uid || '',
      email: apiUser.email || '',
      role: apiUser.role || 'user',
      displayName: apiUser.displayName,
      createdAt: apiUser.createdAt ? new Date(apiUser.createdAt.seconds ? apiUser.createdAt.seconds * 1000 : apiUser.createdAt) : new Date(),
      updatedAt: apiUser.lastLogin ? new Date(apiUser.lastLogin.seconds ? apiUser.lastLogin.seconds * 1000 : apiUser.lastLogin) : undefined
    };
  }

  async deleteUser(id: string): Promise<void> {
    await this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  async createUser(userData: { email: string; password: string; role: string; displayName?: string }): Promise<User> {
    const response = await this.request<any>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    const apiUser = (response as any).user;
    
    if (!apiUser) {
      throw new Error('User data not found in response');
    }
    
    // Map API user format (uid) to frontend User interface (id)
    return {
      id: apiUser.uid || '',
      email: apiUser.email || '',
      role: apiUser.role || 'user',
      displayName: apiUser.displayName,
      createdAt: apiUser.createdAt ? new Date(apiUser.createdAt.seconds ? apiUser.createdAt.seconds * 1000 : apiUser.createdAt) : new Date(),
      updatedAt: apiUser.updatedAt ? new Date(apiUser.updatedAt.seconds ? apiUser.updatedAt.seconds * 1000 : apiUser.updatedAt) : undefined
    };
  }

  async getDatabaseStats(): Promise<{ users: number; reservations: number; slotCaps: number; reservationHistory: number }> {
    const response = await this.request<any>('/api/users/stats/database');
    
    // Handle case where response or stats might be undefined
    const responseData = response as any;
    const stats = responseData?.stats || responseData?.data?.stats;
    if (!stats) {
      // Return default stats if no data is available
      return {
        users: 0,
        reservations: 0,
        slotCaps: 0,
        reservationHistory: 0
      };
    }
    
    return stats;
  }

  // Reservation methods
  // Helper method to map backend reservation data to frontend interface
  private mapReservationData(reservation: any): Reservation {
    return {
      ...reservation,
      userId: reservation.creatorId || reservation.userId, // Map creatorId to userId for compatibility
      userName: reservation.creatorName || reservation.userName || 'Unknown User',
      createdAt: reservation.createdAt ? new Date(reservation.createdAt) : new Date(),
      updatedAt: reservation.updatedAt ? new Date(reservation.updatedAt) : undefined
    };
  }

  async getReservations(params?: { date?: string; userId?: string; limit?: number; offset?: number }): Promise<{ reservations: Reservation[]; total: number; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const endpoint = `/api/reservations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(endpoint);
    const reservationsData = (response as any).reservations || [];
    
    // Map backend fields to frontend interface
    const reservations = reservationsData.map((reservation: any) => this.mapReservationData(reservation));
    
    return {
      reservations,
      total: (response as any).total || reservations.length,
      hasMore: (response as any).hasMore || false
    };
  }

  async createReservation(reservation: { date: string; slot: string; notes?: string }): Promise<Reservation> {
    const response = await this.request<any>('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(reservation),
    });
    return this.mapReservationData((response as any).reservation);
  }

  async updateReservation(id: string, updates: { date?: string; slot?: string; notes?: string }): Promise<Reservation> {
    const response = await this.request<any>(`/api/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return this.mapReservationData((response as any).reservation);
  }

  async deleteReservation(id: string): Promise<void> {
    await this.request(`/api/reservations/${id}`, {
      method: 'DELETE',
    });
  }

  // Slot methods
  async getSlotAvailability(date: string): Promise<SlotAvailability[]> {
    const response = await this.request<any>(`/api/slots/availability?date=${date}`);
    return (response as any).slots || [];
  }

  async getSlotCapacity(date: string, slot: string): Promise<{ capacity: number; reserved: number }> {
    const response = await this.request<any>(`/api/slots/capacity?date=${date}&slot=${slot}`);
    return (response as any);
  }

  // Slot configuration methods
  async getSlotConfig(): Promise<any> {
    const response = await this.request<any>('/api/slots/config');
    return response;
  }

  async updateSlotConfig(config: { slotNames: string[]; maxCapacityPerSlot: number }): Promise<any> {
    const response = await this.request<any>('/api/slots/config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
    return response.data;
  }

  // Setup wizard methods
  async getSetupStatus(): Promise<{ isFirstTime: boolean; needsSetup: boolean }> {
    const response = await this.request<{ isFirstTime: boolean; needsSetup: boolean }>('/api/auth/setup/status');
    return response as { isFirstTime: boolean; needsSetup: boolean };
  }

  async checkEmailExists(email: string): Promise<{ exists: boolean }> {
    const response = await this.request<{ exists: boolean }>('/api/auth/setup/check-email', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return response.data || { exists: false };
  }

  async createMasterAdmin(credentials: { email: string; password: string }): Promise<{ uid: string; message: string }> {
    const response = await this.request<{ uid: string; message: string }>('/api/auth/setup', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    return response.data || { uid: '', message: '' };
  }

  async resetDatabase(): Promise<{ message: string; timestamp: string; collectionsCleared: string[] }> {
    const response = await this.post<{ message: string; timestamp: string; collectionsCleared: string[] }>('/api/users/reset-database');
    if (response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to reset database');
  }
}

// Create a singleton instance
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const apiClient = new ApiClient(apiUrl);
export default apiClient;

// Export types for use in components
export type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  User,
  Reservation,
  SlotAvailability,
};