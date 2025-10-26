
# GBS CRM System

A modern CRM (Customer Relationship Management) system built with React, TypeScript, and Supabase.

## Features

- ✅ **Client Management** - Add, view, edit, and archive clients
- ✅ **Notes System** - Create and edit notes with timestamps
- ✅ **Task Management** - Drag-and-drop task management with priorities
- ✅ **Search & Filtering** - Real-time search across clients
- ✅ **Authentication** - Secure user authentication with Supabase
- ✅ **Responsive Design** - Works on desktop and mobile devices
- ✅ **Row Level Security** - Each user sees only their own data

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Build Tool**: Vite
- **Drag & Drop**: react-dnd

## Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd gbs-crm-dev
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
cp .env.example .env
```
Fill in your Supabase credentials in `.env`

### 4. Setup Supabase database
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `src/database_setup.sql`

### 5. Start development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Database Schema

The system uses three main tables with `gbs_crm_` prefix:

- `gbs_crm_clients` - Client information
- `gbs_crm_notes` - Client notes with edit history
- `gbs_crm_tasks` - Client-related tasks

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── LoginForm.tsx   # Authentication form
│   └── ...
├── lib/                # Utilities and API
│   ├── supabase.ts     # Supabase client
│   ├── api.ts          # API functions
│   └── database.types.ts
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary to Grand Business Solutions.
  