import jwt from 'jsonwebtoken';

export const API_BASE_URL = 'https://handy.felipelino.online/api/v1';

export function getHeaders() {
  const adminSecret = process.env.ADMIN_JWT_SECRET;
  const devSecret = process.env.DEV_JWT_SECRET;
  const userSecret = process.env.JWT_SECRET;

  if (!adminSecret || !devSecret || !userSecret) {
    throw new Error("As chaves secretas não estão configuradas no .env");
  }

  const adminToken = jwt.sign({ role: 'super_admin', generated_by: 'handy-admin-cli' }, adminSecret);
  const devToken = jwt.sign({ role: 'dev', generated_by: 'handy-admin-cli' }, devSecret);
  const userToken = jwt.sign({ user_id: 9999, email: 'cli@handy.com' }, userSecret);

  return {
    'Content-Type': 'application/json',
    'x-admin-token': adminToken,
    'x-dev-token': devToken,
    'Authorization': `Bearer ${userToken}`
  };
}

export const userCache = new Map<number, string>();

export async function resolveEmailsForIds(ids: number[]) {
  const uniqueIds = Array.from(new Set(ids)).filter(id => !userCache.has(id));
  
  await Promise.all(uniqueIds.map(async (id) => {
    let res = await handleApiRequest('GET', `${API_BASE_URL}/client/view-client/${id}`);
    if (res.success && res.data?.email) {
      userCache.set(id, res.data.email);
      return;
    }
    res = await handleApiRequest('GET', `${API_BASE_URL}/provider/view-service-provider/${id}`);
    if (res.success && res.data?.email) {
      userCache.set(id, res.data.email);
      return;
    }
    userCache.set(id, `ID:${id}`);
  }));
}

export async function handleApiRequest(method: string, url: string, body?: any): Promise<{success: boolean, data?: any, error?: string}> {
  try {
    const reqInit: RequestInit = {
      method,
      headers: getHeaders()
    };
    if (body) {
      reqInit.body = JSON.stringify(body);
    }
    const res = await fetch(url, reqInit);
    
    let data: any = null;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json().catch(() => null);
    } else {
      const text = await res.text().catch(() => null);
      if (text) data = { message: text };
    }

    if (!res.ok) {
      throw new Error(data?.message || data?.error || `Erro HTTP: ${res.status}`);
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
