# Docker Deployment Guide

This guide explains how to build, run, and deploy the Kwark application using Docker.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose v2.0 or later (optional, for using docker-compose)

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Stop and remove volumes (WARNING: This will delete your database)
docker-compose down -v
```

### Using Docker CLI

```bash
# Build the image
docker build -t kwark:latest .

# Run the container
docker run -d \
  --name kwark \
  -p 3000:3000 \
  -v kwark-data:/app/data \
  -e NODE_ENV=production \
  -e DATABASE_PATH=/app/data/ \
  kwark:latest

# View logs
docker logs -f kwark

# Stop and remove container
docker stop kwark && docker rm kwark
```

## Environment Variables

Configure the following environment variables in your `.env` file or docker-compose.yml:

- `DATABASE_PATH` - Path to SQLite database directory (default: `/app/data/`)
- `PORT` - Port to run the application on (default: `3000`)
- `HOST` - Host to bind to (default: `0.0.0.0`)
- `NODE_ENV` - Environment mode (default: `production`)

## GitHub Container Registry

The application is automatically built and pushed to GitHub Container Registry on every commit to main branch or tag.

### Pull from GitHub Container Registry

```bash
# Pull the latest image
docker pull ghcr.io/YOUR_USERNAME/kwark:latest

# Run the pulled image
docker run -d \
  --name kwark \
  -p 3000:3000 \
  -v kwark-data:/app/data \
  ghcr.io/YOUR_USERNAME/kwark:latest
```

### Using specific versions

```bash
# Pull specific version
docker pull ghcr.io/YOUR_USERNAME/kwark:v1.0.0

# Pull from specific branch
docker pull ghcr.io/YOUR_USERNAME/kwark:develop
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automatically:

1. **On Push/PR**: Runs tests and linting
2. **On Push to Main**:
   - Builds Docker image
   - Pushes to GitHub Container Registry
   - Tags as `latest` and `main-<sha>`
3. **On Version Tag** (e.g., `v1.0.0`):
   - Builds and pushes with version tags
   - Tags as `1.0.0`, `1.0`, `1`, and `latest`

### Setting Up GitHub Container Registry

1. Go to your repository settings
2. Navigate to "Actions" → "General"
3. Ensure "Read and write permissions" is enabled for workflows
4. The workflow will automatically push to `ghcr.io/YOUR_USERNAME/kwark`

### Triggering Deployments

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# This will trigger:
# - Build and test
# - Multi-platform Docker image build (amd64, arm64)
# - Push to GitHub Container Registry with version tags
```

## Multi-Platform Builds

The workflow builds images for both AMD64 and ARM64 architectures:

```bash
# Manually build multi-platform image
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t kwark:latest \
  --push .
```

## Health Checks

The container includes health checks that ping the application every 30 seconds:

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' kwark
```

## Data Persistence

The SQLite database is stored in a Docker volume to persist data across container restarts:

```bash
# List volumes
docker volume ls

# Backup database
docker run --rm \
  -v kwark-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/kwark-backup.tar.gz -C /data .

# Restore database
docker run --rm \
  -v kwark-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/kwark-backup.tar.gz"
```

## Development

For local development, you can mount your source code:

```bash
docker run -d \
  --name kwark-dev \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  -e NODE_ENV=development \
  kwark:latest \
  sh -c "pnpm install && pnpm run dev"
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs kwark

# Check if port is already in use
netstat -tlnp | grep 3000

# Run container in foreground for debugging
docker run --rm -it kwark:latest
```

### Database issues

```bash
# Access container shell
docker exec -it kwark sh

# Check database directory
ls -la /app/data/
```

### Build issues

```bash
# Clear build cache
docker builder prune

# Build without cache
docker build --no-cache -t kwark:latest .
```

## Production Deployment

For production deployments, consider:

1. **Using a reverse proxy** (nginx, Traefik, Caddy)
2. **Setting up SSL/TLS certificates**
3. **Implementing proper backup strategies**
4. **Monitoring and logging** (Prometheus, Grafana, Loki)
5. **Using Docker Swarm or Kubernetes** for orchestration

Example with nginx and Let's Encrypt:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  kwark:
    image: ghcr.io/YOUR_USERNAME/kwark:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - kwark-data:/app/data
    networks:
      - web

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - kwark
    networks:
      - web

volumes:
  kwark-data:

networks:
  web:
    external: true
```

## Support

For issues or questions, please open an issue on GitHub.
