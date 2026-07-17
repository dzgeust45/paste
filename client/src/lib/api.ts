import { supabase } from './supabase';
import { type InsertPaste } from '@shared/schema';
import { nanoid } from 'nanoid';

export async function createPasteAPI(data: InsertPaste) {
  try {
    const slug = nanoid(8);
    const secret_token = nanoid(64);

    // Calculate expiration if needed
    let expires_at = null;
    if (data.expiration && data.expiration !== 'never') {
      const now = new Date();
      if (data.expiration === '1h') {
        now.setHours(now.getHours() + 1);
      } else if (data.expiration === '1d') {
        now.setDate(now.getDate() + 1);
      } else if (data.expiration === '1w') {
        now.setDate(now.getDate() + 7);
      }
      expires_at = now.toISOString();
    }

    const { error } = await supabase.from('pastes').insert({
      slug,
      title: data.title || null,
      content: data.content,
      language: data.language || 'plaintext',
      privacy: data.privacy || 'unlisted',
      secret_token,
      created_at: new Date().toISOString(),
      expires_at,
      views: 0,
    });

    if (error) throw new Error(error.message);

    return { slug, secret_token };
  } catch (err: any) {
    console.error('createPasteAPI error:', err);
    throw err;
  }
}

export async function getPasteAPI(slug: string, token?: string) {
  try {
    const url = token
      ? `/api/pastes/${slug}?token=${encodeURIComponent(token)}`
      : `/api/pastes/${slug}`;

    const res = await fetch(url, { credentials: 'include' });

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
  } catch (err: any) {
    console.error('getPasteAPI error:', err);
    throw err;
  }
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
