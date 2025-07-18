# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a Next.js 14 web application for managing Garage Object Storage Service. The project is a modern React-based frontend providing comprehensive Garage administration capabilities including:

### Core Management Features

- **Dashboard**: Real-time health status, cluster statistics, and system overview
- **Cluster Management**: Node monitoring, layout configuration, and cluster operations
- **Bucket Management**: Complete lifecycle management with object browser
- **Access Key Management**: Key creation, permissions, and bucket bindings
- **Authentication System**: Secure admin token-based access control

### S3 Object Storage Features

- **File Upload/Download**: Drag-and-drop interface with progress tracking
- **Object Browser**: Navigate and manage stored objects
- **Smart Authentication**: Automatic credential selection for S3 operations
- **AWS CLI Compatibility**: Full compatibility with standard S3 tools

### Advanced Capabilities

- **Real-time Monitoring**: Live cluster health and performance metrics
- **Permission Management**: Granular access control for buckets and keys
- **Multi-API Integration**: Seamless Garage Admin API v2 and S3 API integration
- **Responsive Design**: Modern UI optimized for desktop and mobile devices

### Current Implementation Status

- **Overall Completion**: 75% (Production-ready for core operations)
- **Admin API Integration**: 70% (22/32 endpoints implemented)
- **S3 Integration**: 92% (Complete object storage functionality)
- **UI/UX**: 75% (All core features with modern interface)

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
│   ├── api/            # API routes (proxy layer)
│   │   ├── auth/       # Authentication endpoints
│   │   ├── garage/     # Garage Admin API v2 proxy (32 endpoints)
│   │   │   ├── v2/     # Complete v2 API implementation
│   │   │   └── bucket/ # S3 upload and object management
│   │   └── health/     # Health check endpoints
│   ├── buckets/        # Bucket management pages
│   │   └── [id]/       # Bucket details and object browser
│   ├── cluster/        # Cluster management pages
│   │   └── layout/     # Cluster layout management
│   ├── keys/           # Access key management
│   ├── login/          # Authentication pages
│   └── (dashboard)/    # Main dashboard page
├── components/         # Feature-organized UI components
│   ├── auth/          # Authentication components
│   ├── buckets/       # Bucket management UI
│   │   ├── detail/    # Bucket detail views
│   │   └── objects/   # Object browser and management
│   ├── cluster/       # Cluster management UI
│   │   └── layout/    # Layout management components
│   ├── dashboard/     # Dashboard widgets
│   ├── keys/          # Access key management UI
│   ├── layout/        # App layout components
│   ├── upload/        # File upload components
│   └── ui/            # Reusable UI primitives
├── lib/               # Core utilities and configurations
│   ├── garage-api-v2.ts    # Garage Admin API v2 client
│   ├── garage-api-adapter.ts # API adapter layer
│   ├── s3-auth.ts          # S3 authentication utilities
│   ├── api-client.ts       # HTTP client configuration
│   └── utils.ts            # General utilities
├── hooks/             # Custom React hooks
│   ├── api/          # API-specific hooks (React Query)
│   └── use-api.ts    # General API hooks
├── providers/         # React context providers
├── stores/           # Zustand global state stores
├── types/            # TypeScript type definitions
│   └── garage-api-v2.ts   # Complete API type definitions
└── docs/             # Documentation
    ├── garage-admin-api-v2-spec.md  # Complete API specification
    ├── S3_UPLOAD_AUTH.md            # S3 authentication guide
    └── S3_KEYS_RELATIONSHIP.md      # S3 integration guide
```

## API Integration

The application provides a comprehensive integration with Garage storage service through multiple API layers:

### Garage Admin API v2 Integration (70% Complete)

- **Complete proxy layer**: 32 endpoints implemented in `/api/garage/v2/`
- **Cluster management**: Health monitoring, status tracking, layout management
- **Bucket operations**: CRUD operations, quotas, website configuration
- **Access key management**: Key lifecycle, permission management
- **Admin token management**: Token CRUD (API complete, UI pending)

### S3 Compatible API Integration (92% Complete)

- **File upload/download**: Multi-part upload with intelligent key selection
- **Object management**: Browse, delete, inspect objects
- **Authentication**: AWS Signature v1 with automatic credential selection
- **Bucket operations**: S3-compatible bucket management
- **CLI compatibility**: Full AWS CLI support

### Authentication & Authorization

- **Admin token authentication**: Secure API access
- **Smart credential management**: Automatic S3 key selection
- **Permission-based access**: Role-based bucket and key permissions
- **Session management**: Secure login/logout flow

### Key Features

- **Intelligent key selection**: Automatically uses appropriate credentials
- **Unified error handling**: Consistent error reporting across all APIs
- **Type-safe integration**: Complete TypeScript definitions
- **Real-time monitoring**: Live cluster status and health checks

## UI/UX Guidelines

- Use consistent spacing and typography
- Implement responsive design patterns
- Provide loading states and error handling
- Use semantic HTML and proper accessibility attributes
- Follow modern web design principles

## Development Guidelines

### Environment Setup

- Configure `GARAGE_API_BASE_URL` and `GARAGE_API_ADMIN_KEY` for Admin API access
- Set `NEXT_PUBLIC_S3_ENDPOINT_URL` for S3 operations
- Optional: Configure S3 credentials for enhanced upload functionality

### Code Organization

- **Feature-based structure**: Components organized by functional areas
- **API-first approach**: All data operations through typed API clients
- **Separation of concerns**: Clear distinction between UI, logic, and data layers
- **Type safety**: Complete TypeScript coverage with generated API types

### Testing and Quality

- Use provided test scripts for S3 functionality (`test-s3-*.sh`)
- Validate API integrations with real Garage instances
- Ensure responsive design across device sizes
- Follow accessibility best practices

### Documentation Standards

- Maintain API documentation in `/docs` directory
- Update architecture diagrams when adding major features
- Document configuration changes and environment variables
- Include setup instructions for new developers
