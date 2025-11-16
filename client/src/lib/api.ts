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
    const { data, error } = await supabase
      .from('pastes')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Paste not found');
      }
      throw new Error(error.message);
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      // Delete expired paste
      await supabase.from('pastes').delete().eq('slug', slug);
      throw new Error('Paste has expired');
    }

    // Check privacy
    if (data.privacy === 'private') {
      if (!token || token !== data.secret_token) {
        const error = new Error('This paste is private');
        (error as any).requiresToken = true;
        throw error;
      }
    }

    // Increment view count
    await supabase
      .from('pastes')
      .update({ views: (data.views || 0) + 1 })
      .eq('slug', slug);

    return data;
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
  const { data: paste, error: fetchError } = await supabase
    .from('pastes')
    .select('*')
    .eq('slug', slug)
    .single();

  if (fetchError) throw new Error('Paste not found');
  if (paste.secret_token !== secret_token) {
    throw new Error('Invalid token');
  }

  const { error: updateError } = await supabase
    .from('pastes')
    .update(updates)
    .eq('slug', slug);

  if (updateError) throw new Error(updateError.message);

  return { ...paste, ...updates };
}

export async function deletePasteAPI(slug: string, secret_token: string) {
  const { data: paste, error: fetchError } = await supabase
    .from('pastes')
    .select('*')
    .eq('slug', slug)
    .single();

  if (fetchError) throw new Error('Paste not found');
  if (paste.secret_token !== secret_token) {
    throw new Error('Invalid token');
  }

  const { error: deleteError } = await supabase
    .from('pastes')
    .delete()
    .eq('slug', slug);

  if (deleteError) throw new Error(deleteError.message);

  return true;
}
