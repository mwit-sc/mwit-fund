# MWIT Fund - Deployment Guide to GHCR

This guide explains how to deploy the MWIT Fund application to GitHub Container Registry (GHCR).

## Prerequisites

1. **GitHub Repository**: Ensure your code is in a GitHub repository
2. **GitHub Packages**: Enable GitHub Packages for your repository
3. **Environment Variables**: Set up required environment variables

## Required Environment Variables

Create a `.env.local` file (development) or set these in your production environment:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=mwit_fund

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudflare R2 (File Upload)
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-public-domain.com
```

## Deployment Process

### 1. Automatic Deployment via GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/docker-build-deploy.yml`) that automatically:

- Builds the Docker image on every push to `main` branch
- Pushes to GitHub Container Registry (GHCR)
- Supports both `linux/amd64` and `linux/arm64` platforms
- Creates tags for branches, PRs, and semantic versions

#### To trigger deployment:

```bash
# Push to main branch
git push origin main

# Or create a version tag
git tag v1.0.0
git push origin v1.0.0
```

### 2. Manual Docker Build

If you want to build locally:

```bash
# Build the image
docker build -t ghcr.io/your-username/mwit-fund:latest .

# Push to GHCR (requires authentication)
docker push ghcr.io/your-username/mwit-fund:latest
```

### 3. Running the Container

```bash
# Pull and run the image
docker run -d \
  --name mwit-fund \
  -p 3000:3000 \
  --env-file .env.local \
  ghcr.io/your-username/mwit-fund:latest
```

### 4. Docker Compose Deployment

Use the included `docker-compose.yml`:

```bash
# Start all services (app + database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## GitHub Container Registry Setup

### 1. Enable GitHub Packages

1. Go to your repository settings
2. Navigate to "Actions" → "General"
3. Under "Workflow permissions", select "Read and write permissions"
4. Enable "Allow GitHub Actions to create and approve pull requests"

### 2. Package Visibility

1. Go to your repository
2. Navigate to "Packages" tab
3. Click on your package
4. Change visibility to "Public" or "Private" as needed

### 3. Authentication for Pulling Images

```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u your-username --password-stdin

# Or use personal access token
echo $PAT | docker login ghcr.io -u your-username --password-stdin
```

## Production Deployment Options

### 1. Cloud Providers

**AWS ECS/Fargate**:
```bash
# Create ECS task definition with:
# Image: ghcr.io/your-username/mwit-fund:latest
# Port: 3000
# Environment variables from above
```

**Google Cloud Run**:
```bash
gcloud run deploy mwit-fund \
  --image=ghcr.io/your-username/mwit-fund:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=3000
```

**Azure Container Instances**:
```bash
az container create \
  --resource-group myResourceGroup \
  --name mwit-fund \
  --image ghcr.io/your-username/mwit-fund:latest \
  --ports 3000 \
  --environment-variables $(cat .env.local)
```

### 2. Kubernetes Deployment

Create `k8s-deployment.yml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mwit-fund
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mwit-fund
  template:
    metadata:
      labels:
        app: mwit-fund
    spec:
      containers:
      - name: mwit-fund
        image: ghcr.io/your-username/mwit-fund:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: mwit-fund-secrets
---
apiVersion: v1
kind: Service
metadata:
  name: mwit-fund-service
spec:
  selector:
    app: mwit-fund
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Monitoring and Logs

### 1. Container Logs
```bash
docker logs -f mwit-fund
```

### 2. Health Check
```bash
curl http://localhost:3000/api/health
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check TypeScript errors and dependencies
2. **Runtime Errors**: Verify environment variables are set
3. **Database Connection**: Ensure DATABASE_URL is accessible
4. **File Upload Issues**: Verify R2 credentials and bucket permissions

### Debug Commands

```bash
# Check container status
docker ps -a

# Inspect container
docker inspect mwit-fund

# Execute shell in container
docker exec -it mwit-fund sh

# Check environment variables
docker exec mwit-fund env
```

## Security Considerations

1. **Environment Variables**: Never commit secrets to repository
2. **Image Scanning**: Enable Dependabot and security scanning
3. **Network Security**: Use HTTPS in production
4. **Database Security**: Use secure connection strings
5. **Regular Updates**: Keep base images and dependencies updated

## Performance Optimization

1. **Multi-stage Builds**: Already implemented in Dockerfile
2. **Image Size**: Optimized with Alpine Linux base
3. **Caching**: GitHub Actions cache enabled
4. **CDN**: Consider using CDN for static assets

For more details, see the main [README.md](./README.md) file.