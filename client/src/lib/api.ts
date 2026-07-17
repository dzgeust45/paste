import { type InsertPaste } from '@shared/schema';

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { credentials: 'include', ...options });
  return res;
}

export async function createPasteAPI(data: InsertPaste) {
  const res = await apiFetch('/api/pastes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to create paste');
  }

  return res.json(); // { slug, secret_token }
}

export async function getPasteAPI(slug: string, token?: string) {
  const url = token
    ? `/api/pastes/${slug}?token=${encodeURIComponent(token)}`
    : `/api/pastes/${slug}`;

  const res = await apiFetch(url);

  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    if (body.requiresToken) {
      const err = new Error('This paste is private');
      (err as any).requiresToken = true;
      throw err;
    }
    throw new Error(body.error || 'Access denied');
  }

  if (res.status === 410) {
    throw new Error('Paste has expired');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Paste not found');
  }

  return res.json();
}

export async function updatePasteAPI(
  slug: string,
  updates: { title?: string; content?: string; language?: string },
  secret_token: string
) {
  const res = await fetch(`/api/pastes/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...updates, secret_token }),
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to update paste');
  }

  return res.json();
}

export async function deletePasteAPI(slug: string, secret_token: string) {
  const res = await fetch(`/api/pastes/${slug}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret_token }),
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to delete paste');
  }

  return true;
}
