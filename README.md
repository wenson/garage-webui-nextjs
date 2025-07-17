# Garage Web UI - Next.js Edition

A modern, Next.js 14-based admin interface for [Garage Object Storage Service](https://garagehq.deuxfleurs.fr/). This is a complete rewrite of the original [garage-webui](https://github.com/khairul169/garage-webui) project using Next.js and modern React patterns.

![Garage Web UI Screenshot](https://via.placeholder.com/800x400/0066cc/ffffff?text=Garage+Web+UI+Dashboard)

## ✨ Features

- **📊 Dashboard**: Real-time cluster health monitoring and statistics
- **🏗️ Cluster Management**: Node status, layout management, and cluster operations
- **🪣 Bucket Management**: Complete bucket lifecycle with integrated object browser
- **🔑 Access Key Management**: Create, manage, and configure S3 access keys
- **🔐 Authentication**: Secure login with bcrypt password hashing
- **🎨 Modern UI**: Clean, responsive design with dark mode support
- **⚡ Performance**: Server-side rendering with React Query caching
- **🔧 Developer Experience**: TypeScript, ESLint, and modern tooling

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Development**: ESLint, Prettier

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Running Garage instance with admin API enabled

## 🛠️ Installation

### Method 1: Clone and Run

```bash
# Clone the repository
git clone https://github.com/your-username/garage-webui-nextjs.git
cd garage-webui-nextjs

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your Garage connection (see Configuration section)
# Edit .env.local with your Garage settings

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Method 2: Docker (Coming Soon)

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://your-garage:3903 \
  -e NEXT_PUBLIC_API_ADMIN_KEY=your-admin-token \
  garage-webui-nextjs:latest
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Garage API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3903
NEXT_PUBLIC_API_ADMIN_KEY=your-admin-token-here

# S3 API Configuration
NEXT_PUBLIC_S3_ENDPOINT_URL=http://localhost:3900
NEXT_PUBLIC_S3_REGION=garage

# Authentication (optional)
AUTH_USER_PASS=admin:$2y$10$DSTi9o... # bcrypt hash

# Application Settings
NEXT_PUBLIC_BASE_PATH=                    # Base path for deployment
```

### Garage Configuration

Ensure your `garage.toml` has the admin API enabled:

```toml
[admin]
api_bind_addr = "[::]:3903"
admin_token = "your-admin-token-here"
metrics_token = "your-metrics-token"
```

## 🏃‍♂️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard
│   ├── login/             # Authentication
│   ├── cluster/           # Cluster management
│   ├── buckets/           # Bucket management
│   └── keys/              # Access key management
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   └── [feature]/        # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
├── stores/               # Zustand state stores
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

## 🐳 Docker Deployment

```dockerfile
# Build the container
docker build -t garage-webui-nextjs .

# Run with environment variables
docker run -d \
  --name garage-webui \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://garage:3903 \
  -e NEXT_PUBLIC_API_ADMIN_KEY=your-admin-token \
  garage-webui-nextjs
```

## 🔧 API Integration

The application integrates with Garage through multiple APIs:

- **Admin API**: Cluster management, node status, bucket operations
- **S3 API**: Object storage operations, file upload/download
- **Metrics API**: Performance monitoring and statistics

See [API_REFERENCE.md](./API_REFERENCE.md) for detailed API documentation.

## 🎯 Key Features

### Dashboard

- Real-time cluster health monitoring
- Node status and connectivity
- Storage usage statistics
- Partition status tracking

### Cluster Management

- Node discovery and management
- Layout configuration
- Zone and capacity management
- Performance monitoring

### Bucket Management

- Create, delete, and configure buckets
- Set quotas and permissions
- Website hosting configuration
- Integrated file browser

### Object Browser

- Upload and download files
- Folder navigation
- Batch operations
- File metadata viewing

### Access Key Management

- Generate S3 access keys
- Configure bucket permissions
- Role-based access control
- Key rotation support

## 🔒 Security

- Secure authentication with bcrypt password hashing
- JWT token-based session management
- Admin API token validation
- CSRF protection
- Secure headers and content policies

## 🔄 Migration from Original

This Next.js version maintains feature parity with the original React + Vite version while adding:

- Server-side rendering for better performance
- Improved SEO and initial load times
- Modern React patterns (App Router, Server Components)
- Enhanced developer experience
- Better TypeScript integration

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration information.

## 📚 Documentation

- [📋 Feature Overview](./GARAGE_WEBUI_FEATURES.md)
- [🏗️ Architecture Guide](./ARCHITECTURE.md)
- [🔄 Migration Guide](./MIGRATION_GUIDE.md)
- [📡 API Reference](./API_REFERENCE.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original [garage-webui](https://github.com/khairul169/garage-webui) by [khairul169](https://github.com/khairul169)
- [Garage](https://garagehq.deuxfleurs.fr/) object storage service by Deuxfleurs
- The amazing React and Next.js communities

## 📞 Support

- 🐛 [Report Issues](https://github.com/your-username/garage-webui-nextjs/issues)
- 💬 [GitHub Discussions](https://github.com/your-username/garage-webui-nextjs/discussions)
- 📖 [Documentation](./docs/)

---

**Built with ❤️ using Next.js 14**
