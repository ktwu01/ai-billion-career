# AI Career Dashboard Tech Stack

## Project Structure Overview
This is an AI career development platform with a React-based frontend dashboard and Supabase backend for data management and user authentication. The project includes data analysis components using Python for career insights and visualizations.

## Frontend Technologies

### Core Framework & Build Tools
- **React 18.3.1** - Modern JavaScript library for building user interfaces
- **TypeScript 5.6.2** - Static type checking for JavaScript
- **Vite 6.0.1** - Fast frontend build tool and dev server
- **@vitejs/plugin-react 4.3.4** - React plugin for Vite

### UI & Component Libraries
- **Radix UI** - Comprehensive collection of low-level UI primitives:
  - @radix-ui/react-accordion, react-alert-dialog, react-avatar, react-checkbox
  - @radix-ui/react-dialog, react-dropdown-menu, react-popover, react-tabs
  - @radix-ui/react-toast, react-tooltip, and many more components
- **Lucide React 0.364.0** - Beautiful & consistent icon toolkit
- **Tailwind CSS v3.4.16** - Utility-first CSS framework
- **tailwindcss-animate 1.0.7** - Animation utilities for Tailwind CSS
- **PostCSS 8.4.49** - Tool for transforming CSS with JavaScript plugins
- **Autoprefixer 10.4.20** - PostCSS plugin to parse CSS and add vendor prefixes

### Routing & Navigation
- **React Router DOM v6** - Declarative routing for React applications

### Data Visualization & Charts
- **Recharts 2.12.4** - Composable charting library built on React components
- **Plotly.js 3.1.0** - Scientific charting library
- **react-plotly.js 2.6.0** - React component for Plotly.js

### Form Handling & Validation
- **React Hook Form 7.54.2** - Performant, flexible forms with easy validation
- **@hookform/resolvers 3.10.0** - Validation resolvers for React Hook Form
- **Zod 3.24.1** - TypeScript-first schema validation library

### Utility Libraries
- **clsx 2.1.1** - Utility for constructing className strings conditionally
- **tailwind-merge 2.6.0** - Utility to efficiently merge Tailwind CSS classes
- **class-variance-authority 0.7.1** - Utility for creating type-safe component APIs
- **date-fns 3.0.0** - Modern JavaScript date utility library
- **cmdk 1.0.0** - Fast, composable, unstyled command menu for React

### Advanced UI Components
- **next-themes 0.4.4** - Theme switching library
- **react-day-picker 8.10.1** - Date picker component
- **react-resizable-panels 2.1.7** - Resizable panel components
- **embla-carousel-react 8.5.2** - Carousel library for React
- **input-otp 1.4.2** - OTP (One-Time Password) input component
- **vaul 1.1.2** - Drawer/modal component
- **sonner 1.7.2** - Toast notification library

## Backend & Database

### Database & Authentication
- **Supabase** - Open source Firebase alternative providing:
  - **PostgreSQL Database** - Robust relational database
  - **Real-time subscriptions** - Live data updates
  - **Authentication & authorization** - User management system
  - **Row Level Security (RLS)** - Database security policies
- **@supabase/supabase-js 2.55.0** - JavaScript client library for Supabase

### SQL Database Schema
The project includes comprehensive **SQL** database structure with:
- **User management tables**: `user_profiles` with UUID primary keys
- **Career tracking tables**: `career_goals`, `skill_assessments`, `progress_records`
- **Learning system**: `learning_activities`, `assessment_responses`
- **Networking features**: `network_contacts`, mentors and follows system
- **Portfolio management**: `project_portfolio`, `achievements`
- **Recommendation engine**: `recommendations` table
- **Migration system**: Structured database migrations in `/supabase/migrations/`

### Database Features
- **JSONB data types** for flexible schema design (personality_traits, social_preferences, etc.)
- **UUID primary keys** for scalability and security
- **Foreign key relationships** with cascade delete policies
- **Timestamp tracking** with timezone support
- **Structured migrations** for version control of database schema changes

## Data Analysis & Visualization

### Python Data Science Stack
- **Python 3.x** - Core programming language for data analysis
- **matplotlib** - Comprehensive plotting library for static visualizations
- **seaborn** - Statistical data visualization based on matplotlib
- **pandas** - Data manipulation and analysis library
- **numpy** - Numerical computing library

### Analysis Features
- **Career trajectory analysis** - AICS vs MLE salary comparisons
- **Market trend visualization** - AI chip market and investment analysis
- **Skills assessment charts** - Radar charts for skill requirement comparison
- **Career path modeling** - Timeline visualizations for career progression
- **Salary benchmarking** - Heatmaps for company-specific compensation data

## Development Tools & Quality

### Code Quality & Linting
- **ESLint 9.15.0** - JavaScript/TypeScript linting utility
- **@eslint/js 9.15.0** - ESLint JavaScript configurations
- **typescript-eslint 8.15.0** - ESLint rules for TypeScript
- **eslint-plugin-react-hooks 5.0.0** - ESLint rules for React Hooks
- **eslint-plugin-react-refresh 0.4.14** - ESLint plugin for React Fast Refresh

### Development Environment
- **Node.js** - JavaScript runtime environment
- **npm** - Package manager for Node.js
- **TypeScript compiler** - Static type checking and compilation
- **Vite dev server** - Fast development server with Hot Module Replacement (HMR)

## Environment Configuration
- **Environment variables** management with `.env` files
- **Supabase configuration** - Database URL and API keys
- **Build configurations** - Development and production build modes
- **Source maps** - Debugging support for development

## Project Management & Documentation
- **.cursor/** - AI-assisted development workspace
- **Comprehensive documentation** - Markdown files for project planning and analysis
- **Memory system** - JSON-based metadata and research results storage
- **Chart generation** - Automated visualization output to `/charts/` directory

## Key Technical Highlights
1. **Modern React Architecture** - Functional components with hooks
2. **Type Safety** - Comprehensive TypeScript implementation
3. **Component-First Design** - Modular, reusable UI components
4. **Real-time Capabilities** - Supabase real-time subscriptions
5. **Responsive Design** - Mobile-first approach with Tailwind CSS
6. **Data-Driven Insights** - Python-based analysis with visualization
7. **Scalable Database Design** - PostgreSQL with proper normalization
8. **Security-First** - Row Level Security and UUID-based architecture

This tech stack represents a modern, scalable approach to building data-driven career development applications with real-time capabilities and comprehensive analytics.