/**
 * API Client for ClothFit Backend
 * 
 * Type-safe fetch wrapper with authentication handling
 * Uses in-memory storage for access tokens and HTTP-only cookies for refresh tokens
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/** Error response from API */
interface ApiError {
    error: string;
    code: string;
}

/** Token response from auth endpoints */
export interface TokenResponse {
    access_token: string;
    token_type: string;
}

/** User response */
export interface UserResponse {
    id: number;
    email: string;
    created_at: string;
}

/** Job status enum */
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** Try-on job response */
export interface TryonJobResponse {
    id: number;
    user_id: number;
    model_url: string;
    cloth_url: string;
    result_urls: string[];
    resolution: string;
    aspect_ratio: string;
    image_count: number;
    status: JobStatus;
    error_message: string | null;
    created_at: string;
}

/** Try-on history response */
export interface TryonHistoryResponse {
    jobs: TryonJobResponse[];
    total: number;
}

/** Custom API error class */
export class ApiClientError extends Error {
    code: string;
    status: number;

    constructor(message: string, code: string, status: number) {
        super(message);
        this.code = code;
        this.status = status;
        this.name = 'ApiClientError';
    }
}

// ============ Token Management ============

// In-memory storage for access token (more secure than localStorage)
let accessToken: string | null = null;

// Flag to prevent multiple refresh attempts
let isRefreshing = false;

// Queue of requests waiting for token refresh
let refreshSubscribers: ((token: string | null) => void)[] = [];

/** Subscribe to token refresh completion */
function subscribeToTokenRefresh(callback: (token: string | null) => void): void {
    refreshSubscribers.push(callback);
}

/** Notify all subscribers that refresh is complete */
function notifyRefreshSubscribers(token: string | null): void {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
}

/** Get access token from memory */
function getToken(): string | null {
    return accessToken;
}

/** Set access token in memory */
export function setToken(token: string | null): void {
    accessToken = token;
}

/** Check if user has a token (may be expired) */
export function hasToken(): boolean {
    return !!accessToken;
}

/** 
 * Check if user is authenticated
 * This tries to refresh the token if we don't have one
 */
export async function isAuthenticated(): Promise<boolean> {
    if (accessToken) {
        return true;
    }

    // Try to refresh token using the HTTP-only cookie
    try {
        await refreshAccessToken();
        return !!accessToken;
    } catch {
        return false;
    }
}

/** Synchronous check for token (for initial render) */
export function hasAccessToken(): boolean {
    return !!accessToken;
}

/** Refresh access token using refresh token cookie */
export async function refreshAccessToken(): Promise<boolean> {
    if (isRefreshing) {
        // Wait for ongoing refresh to complete
        return new Promise((resolve) => {
            subscribeToTokenRefresh((token) => {
                resolve(!!token);
            });
        });
    }

    isRefreshing = true;

    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include', // Include cookies
        });

        if (!response.ok) {
            accessToken = null;
            notifyRefreshSubscribers(null);
            return false;
        }

        const data: TokenResponse = await response.json();
        accessToken = data.access_token;
        notifyRefreshSubscribers(accessToken);
        return true;
    } catch {
        accessToken = null;
        notifyRefreshSubscribers(null);
        return false;
    } finally {
        isRefreshing = false;
    }
}

/** Make an authenticated API request with automatic token refresh */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnUnauthorized = true
): Promise<T> {
    const token = getToken();

    const headers: HeadersInit = {
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
        (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Always include cookies for refresh token
    });

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && retryOnUnauthorized) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            // Retry the original request with new token
            return apiRequest<T>(endpoint, options, false);
        }
        // Refresh failed, throw error
        throw new ApiClientError('Session expired', 'SESSION_EXPIRED', 401);
    }

    if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
            error: 'Unknown error',
            code: 'UNKNOWN_ERROR',
        }));

        throw new ApiClientError(errorData.error, errorData.code, response.status);
    }

    return response.json();
}

// ============ Auth API ============

/** Register a new user */
export async function register(email: string, password: string): Promise<TokenResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Receive refresh token cookie
    });

    if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
            error: 'Registration failed',
            code: 'REGISTRATION_ERROR',
        }));
        throw new ApiClientError(errorData.error, errorData.code, response.status);
    }

    const data: TokenResponse = await response.json();
    setToken(data.access_token);
    return data;
}

/** Login with email and password */
export async function login(email: string, password: string): Promise<TokenResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Receive refresh token cookie
    });

    if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
            error: 'Login failed',
            code: 'LOGIN_ERROR',
        }));
        throw new ApiClientError(errorData.error, errorData.code, response.status);
    }

    const data: TokenResponse = await response.json();
    setToken(data.access_token);
    return data;
}

/** Get current user info */
export async function getCurrentUser(): Promise<UserResponse> {
    return apiRequest<UserResponse>('/auth/me');
}

/** Logout - revoke refresh token and clear access token */
export async function logout(): Promise<void> {
    try {
        // Call backend to revoke refresh token
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include', // Send refresh token cookie
        });
    } catch {
        // Ignore errors during logout
    } finally {
        // Always clear the access token
        setToken(null);
    }
}

// ============ Try-On API ============

/** Generate try-on images */
export async function generateTryon(
    modelPhoto: File,
    clothPhoto: File,
    aspectRatio: string,
    resolution: string,
    imageCount: number,
    prompt?: string
): Promise<TryonJobResponse> {
    const formData = new FormData();
    formData.append('model_photo', modelPhoto);
    formData.append('cloth_photo', clothPhoto);
    formData.append('aspect_ratio', aspectRatio);
    formData.append('resolution', resolution);
    formData.append('image_count', imageCount.toString());

    if (prompt) {
        formData.append('prompt', prompt);
    }

    return apiRequest<TryonJobResponse>('/tryon/generate', {
        method: 'POST',
        body: formData,
    });
}

/** Get job status */
export async function getJob(jobId: number): Promise<TryonJobResponse> {
    return apiRequest<TryonJobResponse>(`/tryon/job/${jobId}`);
}

/** Get generation history */
export async function getHistory(limit = 20, offset = 0): Promise<TryonHistoryResponse> {
    return apiRequest<TryonHistoryResponse>(`/tryon/history?limit=${limit}&offset=${offset}`);
}

/** Poll job until completion */
export async function pollJobUntilComplete(
    jobId: number,
    onUpdate?: (job: TryonJobResponse) => void,
    intervalMs = 2000,
    maxAttempts = 60
): Promise<TryonJobResponse> {
    let attempts = 0;

    while (attempts < maxAttempts) {
        const job = await getJob(jobId);

        if (onUpdate) {
            onUpdate(job);
        }

        if (job.status === 'completed' || job.status === 'failed') {
            return job;
        }

        await new Promise(resolve => setTimeout(resolve, intervalMs));
        attempts++;
    }

    throw new ApiClientError('Job polling timeout', 'POLLING_TIMEOUT', 408);
}
