# AI Billion Career Platform

A comprehensive AI-powered career platform designed to help users navigate and plan their professional journey in the AI industry.

## Features

- **Interactive Dashboard**: Comprehensive career tracking and progress visualization
- **Career Assessment**: Personalized skill evaluation and career path recommendations
- **Goal Setting**: Set and track career milestones with intelligent suggestions
- **Progress Visualization**: Charts and analytics to monitor career advancement
- **Skill Development**: Tailored learning paths and skill development recommendations
- **Industry Insights**: Real-time AI industry trends and salary information

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/ui components
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Backend**: Supabase (Database, Auth, Storage)
- **Build Tool**: Vite
- **Package Manager**: npm/pnpm

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v18 or higher)
- npm or pnpm package manager

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-career-dashboard
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using pnpm:
```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory and configure your environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Development Server

Start the development server:

```bash
npm run dev
```

Or with pnpm:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production

To build the project for production:

```bash
npm run build
```

Or with pnpm:
```bash
pnpm build
```

The built files will be in the `dist` directory.

### 6. Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   └── Header.tsx      # Application header
├── lib/                # Utility functions and configurations
│   ├── supabase.ts     # Supabase client configuration
│   └── utils.ts        # Common utility functions
├── pages/              # Application pages
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   └── SetupPage.tsx
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Styling

This project uses:
- **Tailwind CSS** for utility-first styling
- **Shadcn/ui** for pre-built accessible components
- **Custom yellow theme** with professional color scheme

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

The project is configured for easy deployment on platforms like:
- Vercel
- Netlify
- GitHub Pages
- Custom hosting solutions

For automated deployment, the build artifacts are located in the `dist` directory after running the build command.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support or questions, please contact the development team.

---

**AI Billion Career Platform** - Empowering your AI career journey
