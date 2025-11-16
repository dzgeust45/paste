import { type Paste, type InsertPaste } from "@shared/schema";
import { nanoid } from "nanoid";

const PASTES_KEY = "pastes";

interface StoredPaste extends Paste {
  secret_token: string;
}

// Generate a random slug
function generateSlug(): string {
  return nanoid(8);
}

// Generate a random secret token
function generateToken(): string {
  return nanoid(64);
}

// Get all pastes from localStorage
function getAllPastes(): StoredPaste[] {
  try {
    const data = localStorage.getItem(PASTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save pastes to localStorage
function savePastes(pastes: StoredPaste[]): void {
  localStorage.setItem(PASTES_KEY, JSON.stringify(pastes));
}

// Create a new paste
export function createPaste(data: InsertPaste) {
  const pastes = getAllPastes();
  const slug = generateSlug();
  const secret_token = generateToken();

  const newPaste: StoredPaste = {
    id: Math.random().toString(36).substring(7),
    slug,
    title: data.title || null,
    content: data.content,
    language: data.language || "plaintext",
    privacy: data.privacy || "unlisted",
    secret_token,
    created_at: new Date().toISOString(),
    expires_at: null,
    views: 0,
  };

  // Calculate expiration if needed
  if (data.expiration && data.expiration !== "never") {
    const now = new Date();
    if (data.expiration === "1h") {
      now.setHours(now.getHours() + 1);
    } else if (data.expiration === "1d") {
      now.setDate(now.getDate() + 1);
    } else if (data.expiration === "1w") {
      now.setDate(now.getDate() + 7);
    }
    newPaste.expires_at = now.toISOString();
  }

  pastes.push(newPaste);
  savePastes(pastes);

  return {
    slug,
    secret_token,
  };
}

// Get a paste by slug
export function getPaste(slug: string, token?: string): StoredPaste | null {
  const pastes = getAllPastes();
  const paste = pastes.find((p) => p.slug === slug);

  if (!paste) return null;

  // Check if expired
  if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
    // Remove expired paste
    const filtered = pastes.filter((p) => p.slug !== slug);
    savePastes(filtered);
    return null;
  }

  // Check privacy
  if (paste.privacy === "private") {
    if (!token || token !== paste.secret_token) {
      return null;
    }
  }

  // Increment view count
  paste.views = (paste.views || 0) + 1;
  savePastes(pastes);

  return paste;
}

// Update a paste
export function updatePaste(
  slug: string,
  updates: { title?: string; content?: string; language?: string },
  secret_token: string
): StoredPaste | null {
  const pastes = getAllPastes();
  const paste = pastes.find((p) => p.slug === slug);

  if (!paste) return null;
  if (paste.secret_token !== secret_token) return null;

  if (updates.title !== undefined) paste.title = updates.title;
  if (updates.content !== undefined) paste.content = updates.content;
  if (updates.language !== undefined) paste.language = updates.language;

  savePastes(pastes);
  return paste;
}

// Delete a paste
export function deletePaste(slug: string, secret_token: string): boolean {
  const pastes = getAllPastes();
  const paste = pastes.find((p) => p.slug === slug);

  if (!paste) return false;
  if (paste.secret_token !== secret_token) return false;

  const filtered = pastes.filter((p) => p.slug !== slug);
  savePastes(filtered);
  return true;
}

// List public pastes
export function listPublicPastes(): StoredPaste[] {
  const pastes = getAllPastes();
  return pastes.filter((p) => p.privacy === "public" && (!p.expires_at || new Date(p.expires_at) > new Date()));
}
