import { httpRequest } from './httpClient';

export async function login(payload: { email: string; password: string }): Promise<{ status: string }> {
  return await httpRequest<{ status: string }>('/api/login', {
    method: 'POST',
    body: payload,
  });
}

export async function logout(): Promise<{ status: string }> {
  return await httpRequest<{ status: string }>('/api/logout', {
    method: 'POST',
  });
}

export interface MeInfo {
  email: string;
  first_name: string;
  last_name: string;
}

export async function me(): Promise<MeInfo> {
  return await httpRequest<MeInfo>('/api/users/me/');
}


