# PPE Inspector 2.0

A Progressive Web Application for managing and inspecting Personal Protective Equipment (PPE).

## Features

- 🔒 Secure authentication with role-based access control
- 📱 Fully responsive design for all devices
- 📊 Comprehensive analytics dashboard
- 📝 Detailed PPE inspection workflow
- 📷 QR code scanning for equipment identification
- 📑 Advanced reporting capabilities (PDF/Excel)
- 🔄 Offline functionality with sync
- 🌐 Multi-language support framework

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query v5
- **State Management**: Zustand
- **UI Components**: Shadcn UI
- **Backend**: Supabase (auth, database, storage)
- **Validation**: Zod
- **Testing**: Vitest & Testing Library

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
📁 src
├── 📁 app (Routing with layouts & pages)
├── 📁 components (UI components using atomic design)
│   ├── 📁 ui (Base UI components)
│   ├── 📁 features (Feature-specific components)
│   └── 📁 layout (Layout components)
├── 📁 hooks (Custom React hooks)
├── 📁 lib (Utility libraries)
├── 📁 services (API/data services)
├── 📁 store (State management)
├── 📁 types (TypeScript types/interfaces)
└── 📁 utils (Utility functions)
```

## License

This project is private and proprietary.
