import { z } from "zod";

// Paste schema for Supabase
export interface Paste {
  id: string;
  slug: string;
  title: string | null;
  content: string;
  language: string | null;
  privacy: 'public' | 'unlisted' | 'private';
  secret_token: string;
  created_at: string;
  expires_at: string | null;
  views: number;
}

// Insert paste schema
export const insertPasteSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  language: z.string().optional(),
  privacy: z.enum(['public', 'unlisted', 'private']).default('unlisted'),
  expiration: z.enum(['1h', '1d', '1w', 'never']).default('never'),
});

export type InsertPaste = z.infer<typeof insertPasteSchema>;

// Update paste schema
export const updatePasteSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  language: z.string().optional(),
  secret_token: z.string().min(1, "Secret token is required"),
});

export type UpdatePaste = z.infer<typeof updatePasteSchema>;

// Delete paste schema
export const deletePasteSchema = z.object({
  secret_token: z.string().min(1, "Secret token is required"),
});

export type DeletePaste = z.infer<typeof deletePasteSchema>;

// Common programming languages
export const LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
] as const;
