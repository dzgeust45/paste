# Paste-Life 🚰

A minimal, developer-focused pastebin for sharing code snippets with syntax highlighting, expiration options, and privacy controls.

## Features

- ✨ **Syntax Highlighting** - Support for 25+ programming languages with Prism.js
- 🔒 **Privacy Controls** - Public, unlisted, or private pastes
- ⏰ **Expiration Options** - 1 hour, 1 day, 1 week, or never
- 📊 **View Counter** - Track paste popularity
- ✏️ **Edit & Delete** - Update or remove pastes with secret token
- 🎨 **Dark Mode UI** - Beautiful, minimal developer-focused interface
- 🚀 **Fast & Secure** - Built with React, Express, and Supabase
- 📱 **Responsive** - Works perfectly on all devices

## Tech Stack

**Frontend:**
- React with TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query for data fetching
- Wouter for routing
- Prism.js for syntax highlighting

**Backend:**
- Express.js
- Supabase (PostgreSQL)
- Rate limiting
- Input validation with Zod

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up free](https://supabase.com))
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/paste-life.git
cd paste-life
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in your project details
4. Wait for the database to be created

#### Create the Database Table

1. In your Supabase dashboard, go to the **SQL Editor**
2. Run this SQL query to create the `pastes` table:

```sql
-- Create the pastes table
create table public.pastes (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text,
  content text not null,
  language text,
  privacy text not null default 'unlisted',
  secret_token text not null,
  created_at timestamptz default now(),
  expires_at timestamptz,
  views int default 0
);

-- Create indexes for better performance
create index on public.pastes (created_at desc);
create index on public.pastes (slug);
create index on public.pastes using gin (
  to_tsvector('english', coalesce(title,'') || ' ' || content)
);

-- Enable Row Level Security (RLS)
alter table public.pastes enable row level security;

-- Allow anonymous users to insert pastes
create policy "Anyone can insert pastes"
  on public.pastes
  for insert
  to anon
  with check (true);

-- Allow anonymous users to select public and unlisted pastes
create policy "Anyone can view public and unlisted pastes"
  on public.pastes
  for select
  to anon
  using (privacy in ('public', 'unlisted'));

-- Note: Private pastes require secret token verification
-- This is handled by the backend service role key
```

#### Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Project Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - **Keep this secret!**

### 4. Configure Environment Variables

Create a `.env` file in the project root (or use Replit Secrets if on Replit):

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ Important:** Never commit the `.env` file or expose your service role key publicly!

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

### Creating a Paste

1. Visit the homepage
2. Enter your code or text
3. (Optional) Add a title
4. Select the programming language for syntax highlighting
5. Choose expiration time (1h, 1d, 1w, or never)
6. Select privacy level:
   - **Public** - Searchable and visible to everyone
   - **Unlisted** - Only accessible via URL
   - **Private** - Requires secret token to view
7. Click "Create Paste"
8. **Save your secret token!** You'll need it to edit or delete later

### Viewing a Paste

- Navigate to `/{slug}` to view the paste
- Click "Copy" to copy the content
- Click "Raw" to view plain text version

### Editing a Paste

1. Click the "Edit" button on a paste
2. Enter your secret token
3. Make your changes
4. Click "Save Changes"

### Deleting a Paste

1. Click the "Delete" button on a paste
2. Enter your secret token
3. Confirm deletion

## API Endpoints

### `POST /api/pastes`
Create a new paste

**Request body:**
```json
{
  "title": "Optional title",
  "content": "Paste content (required)",
  "language": "javascript",
  "privacy": "unlisted",
  "expiration": "1d"
}
```

**Response:**
```json
{
  "slug": "aBcD1234",
  "secret_token": "your-secret-token-here"
}
```

### `GET /api/pastes/:slug`
Get a paste by slug

**Response:**
```json
{
  "id": "uuid",
  "slug": "aBcD1234",
  "title": "My Paste",
  "content": "console.log('Hello');",
  "language": "javascript",
  "privacy": "unlisted",
  "created_at": "2024-01-15T10:30:00Z",
  "expires_at": null,
  "views": 42
}
```

### `PUT /api/pastes/:slug`
Update a paste (requires secret token)

**Request body:**
```json
{
  "title": "Updated title",
  "content": "Updated content",
  "language": "typescript",
  "secret_token": "your-secret-token-here"
}
```

### `DELETE /api/pastes/:slug`
Delete a paste (requires secret token)

**Request body:**
```json
{
  "secret_token": "your-secret-token-here"
}
```

## Security Features

- **Row Level Security (RLS)** - Database-level access control
- **Rate Limiting** - 10 requests per minute per IP
- **Secret Tokens** - Required for edit/delete operations
- **Input Validation** - All inputs validated with Zod
- **XSS Protection** - Content rendered safely in code blocks
- **Service Role Key** - Never exposed to frontend

## Deployment

### Deploy to Replit

This app is ready to deploy on Replit:

1. Import this repository to Replit
2. Add your Supabase credentials to Replit Secrets
3. Click "Run"
4. Your app is live!

### Deploy to Vercel/Netlify

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider

3. Set up environment variables in your hosting dashboard

4. Configure your backend API URL

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure you've created the `.env` file with all required variables
- On Replit, ensure secrets are added in the Secrets tab

### "Paste not found" errors
- Verify your Supabase table is created correctly
- Check that RLS policies are set up
- Ensure your anon key has proper permissions

### "Failed to create paste"
- Check browser console for detailed errors
- Verify your Supabase credentials are correct
- Make sure the `pastes` table exists

### Rate limiting errors
- Wait 60 seconds and try again
- You're limited to 10 requests per minute per IP

### Syntax highlighting not working
- Ensure Prism.js scripts are loaded (check browser console)
- Verify the language name matches Prism.js supported languages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Syntax highlighting by [Prism.js](https://prismjs.com/)
- Icons from [Lucide](https://lucide.dev/)
- Database by [Supabase](https://supabase.com/)
