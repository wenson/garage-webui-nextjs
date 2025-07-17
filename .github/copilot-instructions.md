# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a Next.js 14 web application for managing Garage Object Storage Service. The project is a modern React-based frontend for Garage admin operations including:

- Dashboard with health status and statistics
- Cluster management
- Bucket management with object browser
- Access key management
- Authentication system

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner

## Code Style Guidelines

- Use TypeScript for all components and utilities
- Follow Next.js App Router conventions
- Use server components where possible, client components when needed
- Implement proper error boundaries
- Use React Query for API calls and caching
- Use Zustand for global state management
- Follow consistent file naming conventions (kebab-case for files, PascalCase for components)
- Use Tailwind CSS for styling with consistent design patterns

## Architecture

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                # Utilities and configurations
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## API Integration

The application integrates with Garage storage service APIs:

- Admin API for cluster and node management
- S3 API for bucket and object operations
- Authentication via admin tokens

## UI/UX Guidelines

- Use consistent spacing and typography
- Implement responsive design patterns
- Provide loading states and error handling
- Use semantic HTML and proper accessibility attributes
- Follow modern web design principles
