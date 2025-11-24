# Microbiological Data Management System

A full-stack web application for managing microbiological strain collections, field samples, and storage systems.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![NestJS](https://img.shields.io/badge/NestJS-10-red)

## 🎯 Features

- **Strain Management**: Complete CRUD operations for microbial strains with taxonomy, sequencing data, and biochemical properties
- **Sample Tracking**: Field sample collection with geolocation, metadata, and photo support
- **Storage System**: Interactive grid-based storage management with box and cell allocation
- **Flexible Structure**: Dynamic UI configuration through database-driven field packs and profiles
- **Real-time Dashboard**: Live statistics and analytics
- **Media & Legend**: Nutrient media catalog linked to strains; editable legend for UI codes.
- **In-app Wiki**: `/docs` renders `docs/wiki` (архитектура, API, playbooks, changelog).

## Wiki

Up-to-date documentation lives in docs/wiki/index.md (architecture, backend/frontend, API, storage, media, legend, testing, playbooks, changelog).


## Wiki

Up-to-date documentation lives in docs/wiki/index.md (architecture, backend/frontend, API, storage, media, legend, testing, playbooks, changelog).


## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Next.js        │◄────►│  NestJS         │◄────►│  PostgreSQL     │
│  Frontend       │      │  Backend        │      │  Database       │
│  (Port 3001)    │      │  (Port 3000)    │      │  (Docker)       │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

**Tech Stack:**
- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: NestJS, Prisma ORM, TypeScript
- **Database**: PostgreSQL 16 (Docker)
- **Dev Tools**: Docker Compose, ESLint, Prettier

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ksushanik/strain_collection_v2.git
   cd strain_collection_v2
   ```

2. **Start PostgreSQL database**
   ```bash
   docker-compose up -d
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   npm run start:dev
   ```
   Backend will be available at http://localhost:3000

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev -- -p 3001
   ```
   Frontend will be available at http://localhost:3001

## 📊 Database Schema

Key models:
- **Sample**: Field samples with geolocation and metadata
- **Strain**: Microbial strains with taxonomy and properties
- **StorageBox/StorageCell**: Physical storage management
- **UiBinding**: Dynamic UI configuration

See [schema.prisma](backend/prisma/schema.prisma) for complete schema.

## 🔌 API Endpoints

### Settings
- `GET /api/v1/settings/ui-bindings` - Get UI configuration

### Strains
- `GET /api/v1/strains` - List strains (with filters)
- `POST /api/v1/strains` - Create strain
- `GET /api/v1/strains/:id` - Get strain details
- `PUT /api/v1/strains/:id` - Update strain
- `DELETE /api/v1/strains/:id` - Delete strain

### Samples
- `GET /api/v1/samples` - List samples
- `POST /api/v1/samples` - Create sample
- `GET /api/v1/samples/:id` - Get sample details
- `PUT /api/v1/samples/:id` - Update sample
- `DELETE /api/v1/samples/:id` - Delete sample

### Storage
- `GET /api/v1/storage/boxes` - List storage boxes
- `GET /api/v1/storage/boxes/:id` - Get box with cells
- `POST /api/v1/storage/boxes` - Create storage box
- `POST /api/v1/storage/allocate` - Allocate strain to cell
- `DELETE /api/v1/storage/allocate/:id` - Deallocate strain

## 📁 Project Structure

```
strain_collection_v2/
├── backend/                 # NestJS backend
│   ├── prisma/             # Database schema and migrations
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── strains/        # Strains module
│       ├── samples/        # Samples module
│       ├── storage/        # Storage module
│       └── settings/       # Settings module
├── frontend/               # Next.js frontend
│   └── src/
│       ├── app/           # App router pages
│       ├── components/    # React components
│       │   ├── domain/   # Domain components (StrainList, etc)
│       │   ├── layout/   # Layout components
│       │   └── ui/       # Shadcn UI components
│       ├── services/     # API client
# Microbiological Data Management System

A full-stack web application for managing microbiological strain collections, field samples, and storage systems.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![NestJS](https://img.shields.io/badge/NestJS-10-red)

## 🎯 Features

- **Strain Management**: Complete CRUD operations for microbial strains with taxonomy, sequencing data, and biochemical properties
- **Sample Tracking**: Field sample collection with geolocation, metadata, and photo support
- **Storage System**: Interactive grid-based storage management with box and cell allocation
- **Flexible Structure**: Dynamic UI configuration through database-driven field packs and profiles
- **Real-time Dashboard**: Live statistics and analytics
- **Media & Legend**: Nutrient media catalog linked to strains; editable legend for UI codes.
- **In-app Wiki**: `/docs` renders `docs/wiki` (архитектура, API, playbooks, changelog).

## Wiki

Up-to-date documentation lives in docs/wiki/index.md (architecture, backend/frontend, API, storage, media, legend, testing, playbooks, changelog).


## Wiki

Up-to-date documentation lives in docs/wiki/index.md (architecture, backend/frontend, API, storage, media, legend, testing, playbooks, changelog).


## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Next.js        │◄────►│  NestJS         │◄────►│  PostgreSQL     │
│  Frontend       │      │  Backend        │      │  Database       │
│  (Port 3001)    │      │  (Port 3000)    │      │  (Docker)       │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

**Tech Stack:**
- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: NestJS, Prisma ORM, TypeScript
- **Database**: PostgreSQL 16 (Docker)
- **Dev Tools**: Docker Compose, ESLint, Prettier

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ksushanik/strain_collection_v2.git
   cd strain_collection_v2
   ```

2. **Start PostgreSQL database**
   ```bash
   docker-compose up -d
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   npm run start:dev
   ```
   Backend will be available at http://localhost:3000

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev -- -p 3001
   ```
   Frontend will be available at http://localhost:3001

## 📊 Database Schema

Key models:
- **Sample**: Field samples with geolocation and metadata
- **Strain**: Microbial strains with taxonomy and properties
- **StorageBox/StorageCell**: Physical storage management
- **UiBinding**: Dynamic UI configuration

See [schema.prisma](backend/prisma/schema.prisma) for complete schema.

## 🔌 API Endpoints

### Settings
- `GET /api/v1/settings/ui-bindings` - Get UI configuration

### Strains
- `GET /api/v1/strains` - List strains (with filters)
- `POST /api/v1/strains` - Create strain
- `GET /api/v1/strains/:id` - Get strain details
- `PUT /api/v1/strains/:id` - Update strain
- `DELETE /api/v1/strains/:id` - Delete strain

### Samples
- `GET /api/v1/samples` - List samples
- `POST /api/v1/samples` - Create sample
- `GET /api/v1/samples/:id` - Get sample details
- `PUT /api/v1/samples/:id` - Update sample
- `DELETE /api/v1/samples/:id` - Delete sample

### Storage
- `GET /api/v1/storage/boxes` - List storage boxes
- `GET /api/v1/storage/boxes/:id` - Get box with cells
- `POST /api/v1/storage/boxes` - Create storage box
- `POST /api/v1/storage/allocate` - Allocate strain to cell
- `DELETE /api/v1/storage/allocate/:id` - Deallocate strain

## 📁 Project Structure

```
strain_collection_v2/
├── backend/                 # NestJS backend
│   ├── prisma/             # Database schema and migrations
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── strains/        # Strains module
│       ├── samples/        # Samples module
│       ├── storage/        # Storage module
│       └── settings/       # Settings module
├── frontend/               # Next.js frontend
│   └── src/
│       ├── app/           # App router pages
│       ├── components/    # React components
│       │   ├── domain/   # Domain components (StrainList, etc)
│       │   ├── layout/   # Layout components
│       │   └── ui/       # Shadcn UI components
│       ├── services/     # API client
│       └── types/        # TypeScript types
└── docker-compose.yml    # PostgreSQL container
```

## 🧪 Development

### Development Workflow (Hybrid)

We use a hybrid approach for development: infrastructure runs in Docker, while backend and frontend run locally for hot-reloading.

1. **Start Infrastructure (Postgres & Redis)**
   ```bash
   make dev-env
   ```

2. **Start Backend (Terminal 2)**
   ```bash
   make dev-backend
   ```
   Backend: http://localhost:3000
   AdminJS: http://localhost:3000/admin

3. **Start Frontend (Terminal 3)**
   ```bash
   make dev-frontend
   ```
   Frontend: http://localhost:3001

### Running Tests
```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev --name description_of_changes
```

### Reset Database
```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

## 🎨 UI Components

The frontend uses a flexible field pack system that allows dynamic UI configuration:
- **taxonomy** - Taxonomy information (16S, other)
- **growth_characteristics** - Gram stain, phosphates, siderophores
- **biochemistry** - Biochemical assays and properties
- **site_info** - Geolocation and collection metadata

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/strain_collection_v2?schema=public"
PORT=3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🚀 Production Deploy (Docker + Make)

Простой поток деплоя через Makefile (образы публикуются в Docker Hub):

```bash
# 1) Собрать и запушить образы (использует REGISTRY=gimmyhat, TAG=latest, API_URL=https://culturedb.elcity.ru; wiki из docs/wiki теперь копируется в образ фронта)
make push-all

# 2) Подтянуть образы на проде и перезапустить docker compose (ssh alias 4feb)
make deploy-prod
# Windows/PowerShell: если ssh не находится из make, используйте
# make deploy-prod-win
```

Параметры можно переопределить: `make TAG=v1.2.3 REGISTRY=myrepo push-all`.

## 📝 License

This project is private and proprietary.

## 👥 Contributors

- Development Team

## 🐛 Known Issues

- File upload for sample photos pending
- Detail pages in development

## 🗺️ Roadmap

- [x] User authentication and authorization (RBAC)
- [x] Audit log
- [ ] Detail pages for strains and samples
- [ ] Create/Edit forms with validation
- [ ] File upload for sample photos
- [ ] Advanced search and filtering
- [ ] Export functionality (CSV, Excel)
- [ ] Production deployment guide
