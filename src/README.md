# Mini CRM System

A simple and elegant CRM system built with React, TypeScript, and Tailwind CSS, ready to be integrated with Supabase for backend functionality.

## Features

### Client Management
- ✅ Add new clients with comprehensive information
- ✅ View detailed client profiles with multiple information blocks
- ✅ Edit and update client data
- ✅ Archive/restore clients
- ✅ Search clients by name, email, or business
- ✅ Responsive card-based client list

### Client Information Tabs
- **Information Tab**
  - Basic contact information (name, email, phone, business)
  - Credit score tracking
  - Company details (industry, date organized, revenue estimates)
  - Lead source tracking
  - Project details (type, budget, purpose)
  - Additional notes section

- **Notes Tab**
  - Create, edit, and delete notes for each client
  - Timestamp tracking (creation and last update)
  - Rich text support with line breaks
  - Edit history tracking

- **Tasks Tab**
  - Create tasks with title, description, due date
  - Set priority levels (low, medium, high)
  - Track status (in-progress, completed)
  - Drag-and-drop status management
  - Visual priority indicators
  - Overdue task highlighting

### Additional Features
- 🎨 Clean, modern UI with consistent design system
- 📱 Fully responsive mobile and desktop layouts
- 🔍 Real-time search functionality
- 📊 Task statistics on dashboard
- 🎯 Priority-based task highlighting
- 📋 Archive system with separate tabs
- 🎭 Professional login screen
- ⚡ Quick actions panel

## Project Structure

```
├── App.tsx                      # Main application component
├── components/
│   ├── AddClientModal.tsx       # Modal for adding new clients
│   ├── ClientCard.tsx           # Client card component
│   ├── ClientDetailsModal.tsx   # Detailed client view with tabs
│   ├── Dashboard.tsx            # Main dashboard layout
│   ├── LoginForm.tsx            # Authentication form
│   ├── NotesSection.tsx         # Notes management
│   ├── TasksSection.tsx         # Tasks management with drag-drop
│   └── ui/                      # Reusable UI components (shadcn/ui)
├── types/
│   └── index.ts                 # TypeScript type definitions
├── styles/
│   └── globals.css              # Global styles and design tokens
├── SUPABASE_SETUP.md           # Database setup guide
└── INTEGRATION_GUIDE.md        # Supabase integration guide
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for backend integration)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd mini-crm-system
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

The application will run on `http://localhost:5173`

## Database Setup

The application is ready to be integrated with Supabase. Follow these guides:

1. **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete database schema, tables, triggers, and RLS policies
2. **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Step-by-step integration guide with code examples

### Quick Database Setup

1. Create a Supabase project
2. Run the SQL script from `SUPABASE_SETUP.md` in your Supabase SQL Editor
3. Create `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
4. Follow the integration guide to connect the app

## Database Schema

### Tables

**clients** - Main client information
- Basic contact info (name, email, phone, business)
- Company details (industry, revenue, organization date)
- Project information (type, budget, purpose)
- Lead tracking and notes
- Archive status

**notes** - Client notes with edit history
- Content with timestamps
- Creation and update tracking
- Linked to clients via foreign key

**tasks** - Client tasks and todos
- Title, description, due date
- Status (in-progress, completed)
- Priority (low, medium, high)
- Linked to clients via foreign key

All tables include:
- Row Level Security (RLS) for multi-user support
- Automatic timestamp updates
- User authentication integration
- Cascade deletion for data integrity

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Drag & Drop**: react-dnd
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Build Tool**: Vite

## Features in Detail

### Client Cards
- Visual priority badges
- Task count indicators
- Quick archive/restore actions
- Clickable badges to jump to specific tabs
- Responsive grid layout

### Task Management
- Drag and drop between status columns
- Color-coded priority indicators
- Overdue task highlighting
- Due date visualization
- Task counters by status

### Notes System
- Create unlimited notes per client
- Edit notes with timestamp tracking
- Shows "edited" indicator with last update time
- Delete notes with confirmation
- Chronological ordering

### Search & Filter
- Real-time search across client data
- Search by name, email, or business
- Archive/Active filtering with tabs
- Maintains search state across tabs

## Current State

✅ **Ready for production** - Frontend fully implemented
⏳ **Backend integration** - Ready to connect to Supabase
📚 **Documentation** - Complete setup and integration guides provided

The application currently uses local state management. All handlers are ready to be replaced with Supabase API calls following the integration guide.

## Next Steps for Deployment

1. Set up Supabase project
2. Run database setup script
3. Configure environment variables
4. Integrate Supabase client (follow INTEGRATION_GUIDE.md)
5. Test authentication flow
6. Deploy to hosting platform (Vercel, Netlify, etc.)

## Design Principles

- **Minimalist UI**: Clean, uncluttered interface with focus on usability
- **Consistent Colors**: Blue primary color without gradients
- **Responsive Design**: Mobile-first approach with breakpoints
- **Type Safety**: Full TypeScript coverage
- **Component Reusability**: Modular, composable components
- **Accessibility**: Semantic HTML and ARIA labels

## Support & Documentation

- See `SUPABASE_SETUP.md` for database schema details
- See `INTEGRATION_GUIDE.md` for backend integration
- UI components documentation: [shadcn/ui](https://ui.shadcn.com/)

## License

This project is ready for commercial use.

## Future Enhancements

- [ ] Real-time collaboration
- [ ] Document generation and storage
- [ ] Email integration
- [ ] Calendar integration
- [ ] Reports and analytics
- [ ] Custom fields for clients
- [ ] Role-based access control
- [ ] Export/import functionality
- [ ] Mobile app (React Native)
- [ ] Webhooks and API integrations
