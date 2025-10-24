#!/bin/bash

# Traffic Simulator - One-Command Startup Script
# This script provides multiple ways to start the Traffic Simulator

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Function to check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
}

# Function to start with Docker
start_docker() {
    print_status "Starting Traffic Simulator with Docker..."
    
    check_docker
    
    # Build and start the container
    docker-compose up --build -d
    
    print_success "Traffic Simulator is starting up..."
    print_status "The application will be available at: http://localhost:8080"
    print_status "Health check: http://localhost:8080/health"
    
    # Wait a moment and check if it's running
    sleep 5
    if curl -f http://localhost:8080/health &> /dev/null; then
        print_success "Traffic Simulator is running successfully!"
        print_status "Open your browser and go to: http://localhost:8080"
    else
        print_warning "Container is starting up, please wait a moment..."
        print_status "Check logs with: docker-compose logs -f"
    fi
}

# Function to start development mode with Docker
start_docker_dev() {
    print_status "Starting Traffic Simulator in development mode with Docker..."
    
    check_docker
    
    # Start development container
    docker-compose --profile dev up --build -d traffic-simulator-dev
    
    print_success "Traffic Simulator development server is starting..."
    print_status "The development server will be available at: http://localhost:8000"
    print_status "Hot reload is enabled for development"
    
    # Show logs
    docker-compose --profile dev logs -f traffic-simulator-dev
}

# Function to start with Node.js (local development)
start_local() {
    print_status "Starting Traffic Simulator with Node.js (local development)..."
    
    check_node
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    # Start development server
    print_success "Starting development server..."
    npm run dev
}

# Function to start production build locally
start_production() {
    print_status "Starting Traffic Simulator in production mode (local)..."
    
    check_node
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    # Build for production
    print_status "Building for production..."
    npm run build:prod
    
    # Start production preview
    print_success "Starting production server..."
    npm run preview:prod
}

# Function to show help
show_help() {
    echo "Traffic Simulator - One-Command Startup"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  docker      Start with Docker (production mode) - http://localhost:8080"
    echo "  dev         Start with Docker (development mode) - http://localhost:8000"
    echo "  local       Start with Node.js (local development) - http://localhost:8000"
    echo "  prod        Start production build locally - http://localhost:4173"
    echo "  stop        Stop all Docker containers"
    echo "  logs        Show Docker container logs"
    echo "  status      Show container status"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 docker    # Start with Docker (recommended for production)"
    echo "  $0 dev       # Start development mode with Docker"
    echo "  $0 local     # Start local development with Node.js"
    echo "  $0 prod      # Start production build locally"
    echo ""
}

# Function to stop containers
stop_containers() {
    print_status "Stopping Traffic Simulator containers..."
    docker-compose down
    docker-compose --profile dev down
    print_success "All containers stopped."
}

# Function to show logs
show_logs() {
    print_status "Showing Traffic Simulator logs..."
    docker-compose logs -f
}

# Function to show status
show_status() {
    print_status "Traffic Simulator container status:"
    docker-compose ps
}

# Main script logic
case "${1:-docker}" in
    "docker")
        start_docker
        ;;
    "dev")
        start_docker_dev
        ;;
    "local")
        start_local
        ;;
    "prod")
        start_production
        ;;
    "stop")
        stop_containers
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
