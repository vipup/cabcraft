# 🐳 Traffic Simulator - Docker Setup

## 🚀 One-Command Startup

The Traffic Simulator can now be started with a single command using Docker!

### **Quick Start**

```bash
# Start with Docker (recommended)
./start.sh docker

# Or start development mode
./start.sh dev

# Or start locally with Node.js
./start.sh local
```

## 📋 Available Commands

| Command | Description | URL | Use Case |
|---------|-------------|-----|----------|
| `./start.sh docker` | Production Docker container | http://localhost:8080 | **Recommended for production** |
| `./start.sh dev` | Development Docker container | http://localhost:8000 | Development with hot reload |
| `./start.sh local` | Local Node.js development | http://localhost:8000 | Local development |
| `./start.sh prod` | Local production build | http://localhost:4173 | Test production locally |
| `./start.sh stop` | Stop all containers | - | Cleanup |
| `./start.sh logs` | Show container logs | - | Debugging |
| `./start.sh status` | Show container status | - | Monitoring |

## 🐳 Docker Architecture

### **Multi-Stage Build**
- **Builder Stage**: Node.js 18 Alpine - builds the application
- **Production Stage**: Nginx Alpine - serves the built application

### **Features**
- ✅ **Optimized Nginx configuration** with proper MIME types
- ✅ **PWA support** with service worker and manifest
- ✅ **Gzip compression** for better performance
- ✅ **Security headers** for production safety
- ✅ **Health checks** for monitoring
- ✅ **Static asset caching** for optimal performance

## 🔧 Configuration Files

### **Dockerfile**
- Multi-stage build for optimal image size
- Production-ready Nginx setup
- Health checks included

### **nginx.conf**
- SPA routing support (all routes → index.html)
- Proper MIME types for JavaScript/CSS
- Service worker caching rules
- Gzip compression
- Security headers

### **docker-compose.yml**
- Production service on port 8080
- Optional development service on port 8000
- Health checks and restart policies
- Volume mounts for logs

## 🌐 URLs & Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Production | 8080 | http://localhost:8080 | Main application |
| Development | 8000 | http://localhost:8000 | Dev server with hot reload |
| Health Check | 8080 | http://localhost:8080/health | Container health status |

## 📱 Mobile & PWA Features

The Docker setup includes full support for:
- ✅ **Mobile optimization** (pinch-to-zoom, touch events)
- ✅ **PWA installation** (manifest.json, service worker)
- ✅ **Offline functionality** (service worker caching)
- ✅ **Mobile-responsive layout**

## 🚀 Production Deployment

### **Local Testing**
```bash
# Test production build locally
./start.sh prod
```

### **Docker Production**
```bash
# Start production container
./start.sh docker

# Check health
curl http://localhost:8080/health
```

### **Deploy to Server**
```bash
# Build and push to registry
docker build -t traffic-simulator:latest .
docker tag traffic-simulator:latest your-registry/traffic-simulator:latest
docker push your-registry/traffic-simulator:latest

# Deploy on server
docker run -d -p 80:80 --name traffic-simulator your-registry/traffic-simulator:latest
```

## 🔍 Monitoring & Debugging

### **Container Status**
```bash
./start.sh status
```

### **View Logs**
```bash
./start.sh logs
```

### **Health Check**
```bash
curl http://localhost:8080/health
```

### **Stop Containers**
```bash
./start.sh stop
```

## 🛠️ Development Workflow

### **Option 1: Docker Development**
```bash
# Start development container
./start.sh dev

# View logs
docker-compose --profile dev logs -f traffic-simulator-dev
```

### **Option 2: Local Development**
```bash
# Start local development
./start.sh local

# Or manually
npm install
npm run dev
```

## 📦 Image Details

### **Production Image**
- **Base**: nginx:alpine
- **Size**: ~50MB (optimized)
- **Port**: 80 (mapped to 8080)
- **Health Check**: Built-in

### **Development Image**
- **Base**: node:18-alpine
- **Size**: ~200MB (includes dev dependencies)
- **Port**: 8000
- **Features**: Hot reload, source maps

## 🔒 Security Features

- ✅ **Security headers** (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ **Non-root user** (nginx user)
- ✅ **Minimal attack surface** (Alpine Linux)
- ✅ **No unnecessary packages** in production image

## 🎯 Performance Optimizations

- ✅ **Multi-stage build** reduces final image size
- ✅ **Gzip compression** reduces bandwidth
- ✅ **Static asset caching** improves load times
- ✅ **Nginx optimization** for high concurrency

## 🚨 Troubleshooting

### **Container Won't Start**
```bash
# Check logs
./start.sh logs

# Check status
./start.sh status

# Restart
./start.sh stop
./start.sh docker
```

### **Port Already in Use**
```bash
# Check what's using the port
sudo netstat -tlnp | grep :8080

# Stop conflicting services
sudo systemctl stop nginx  # if nginx is running
```

### **Build Failures**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
```

## 🎉 Success!

Once started, you can:
1. **Open** http://localhost:8080 in your browser
2. **Test mobile features** by resizing the browser
3. **Install as PWA** using browser's "Add to Home Screen"
4. **Test offline functionality** by disconnecting internet

**The Traffic Simulator is now ready for production deployment! 🚀**
