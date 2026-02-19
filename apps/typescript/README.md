# Capacity Planner

Enterprise capacity planning application built with NestJS backend and Next.js frontend, deployed as a monolithic container to Azure Container Apps.

## Architecture

- **Backend**: NestJS with Prisma ORM
- **Frontend**: Next.js (static export served by NestJS)
- **Database**: PostgreSQL
- **Port**: 8080

## Local Development

### Using Docker Compose (Recommended)

The easiest way to run the full stack locally:

**1. Create environment file:**
```bash
cp .env.docker.example .env.docker
```

**2. Edit `.env.docker` and set a password:**
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-local-password
POSTGRES_DB=capacity_planner
```

**3. Start services:**
```bash
# Load env and start (PostgreSQL + App)
docker-compose --env-file .env.docker up

# Or run in background
docker-compose --env-file .env.docker up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

This will start:
- **PostgreSQL** on `localhost:5432`
- **Application** on `localhost:8080`

> **Note:** The `.env.docker` file is gitignored to prevent committing credentials.

### Manual Development Setup

If you prefer to run services individually:

**1. Start PostgreSQL:**
```bash
docker run -d --name postgres-dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=capacity_planner \
  -p 5432:5432 \
  postgres:16-alpine
```

**2. Install dependencies:**
```bash
npm install
```

**3. Set up environment:**
```bash
cp .env.example .env
```

**4. Run Prisma migrations:**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

**5. Start the backend:**
```bash
npm run start:dev
```

**6. (Optional) Build and serve frontend:**
```bash
cd frontend
npm install
npm run build
cp -r out ../public
```

## Health Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/health/live` | Liveness probe - process is running |
| `/health/ready` | Readiness probe - database connected |
| `/health` | Legacy health endpoint |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `NODE_ENV` | Environment mode | `development` |

## Project Structure

```
apps/typescript/
├── src/                    # NestJS backend source
│   ├── main.ts             # Application entry point
│   ├── app.module.ts       # Root module
│   ├── health/             # Health check endpoints
│   └── prisma/             # Prisma service
├── frontend/               # Next.js frontend
│   ├── app/                # App router pages
│   └── package.json        # Frontend dependencies
├── prisma/                 # Database schema
│   └── schema.prisma       # Prisma schema
├── Dockerfile              # Multi-stage container build
├── docker-compose.yml      # Local development stack
├── entrypoint.sh           # Container startup script
└── package.json            # Backend dependencies
```

## Building the Container

```bash
# Build the image
docker build -t capacity-planner .

# Run with database
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  capacity-planner
```

## Database Migrations

Migrations run automatically on container startup via `entrypoint.sh`.

For local development:
```bash
# Create a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```
