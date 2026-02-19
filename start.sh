#!/bin/bash

# Capacity Planner - Start Script
# Starts the full stack including mock-jira and mock-tempo

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$SCRIPT_DIR/apps/typescript"
COMPOSE_FILE="$COMPOSE_DIR/docker-compose.yml"
PROJECT_NAME="capacity-planner"

# Load environment variables if .env exists
if [ -f "$COMPOSE_DIR/.env" ]; then
    export $(grep -v '^#' "$COMPOSE_DIR/.env" | xargs)
fi

# Default POSTGRES_PASSWORD if not set
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-development}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Capacity Planner - Start Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if a container is running
is_running() {
    local service=$1
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps --status running "$service" 2>/dev/null | grep -q "$service"
}

# Function to check if any containers are running
any_running() {
    local count=$(docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps -q 2>/dev/null | wc -l | tr -d ' ')
    [ "$count" -gt 0 ]
}

# Function to wait for service health
wait_for_health() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    echo -e "${YELLOW}Waiting for $service to be healthy...${NC}"
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null | grep -q "200"; then
            echo -e "${GREEN}$service is healthy${NC}"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    echo -e "${RED}$service health check timed out${NC}"
    return 1
}

# Check if services are already running
echo -e "${BLUE}Checking current status...${NC}"

if any_running; then
    echo -e "${YELLOW}Some services are already running:${NC}"
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo -e "${YELLOW}Use ./restart.sh to restart or ./shutdown.sh to stop first.${NC}"
    exit 1
fi

echo -e "${GREEN}No services currently running. Starting stack...${NC}"
echo ""

# Build and start all services with mock profile
echo -e "${BLUE}Building and starting services...${NC}"
echo -e "${YELLOW}This may take a few minutes on first run...${NC}"
echo ""

cd "$COMPOSE_DIR"

# Start services with mock profile (includes mock-jira and mock-tempo)
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile mock up -d --build

echo ""
echo -e "${BLUE}Waiting for services to initialize...${NC}"
echo ""

# Wait for health checks
sleep 5

# Check health endpoints
echo -e "${BLUE}Verifying service health...${NC}"
echo ""

# Check database
if docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps --status running db 2>/dev/null | grep -q "db"; then
    echo -e "${GREEN}[OK]${NC} PostgreSQL database is running"
else
    echo -e "${RED}[FAIL]${NC} PostgreSQL database is not running"
fi

# Check mock-jira
wait_for_health "mock-jira" "http://localhost:8443/health" && \
    echo -e "${GREEN}[OK]${NC} Mock Jira API is running on http://localhost:8443" || \
    echo -e "${RED}[FAIL]${NC} Mock Jira API failed to start"

# Check mock-tempo
wait_for_health "mock-tempo" "http://localhost:8444/health" && \
    echo -e "${GREEN}[OK]${NC} Mock Tempo API is running on http://localhost:8444" || \
    echo -e "${RED}[FAIL]${NC} Mock Tempo API failed to start"

# Check app
wait_for_health "app" "http://localhost:8001/health" && \
    echo -e "${GREEN}[OK]${NC} Backend API is running on http://localhost:8001" || \
    echo -e "${YELLOW}[WARN]${NC} Backend API may still be initializing on http://localhost:8001"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  Stack Started Successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Services:"
echo -e "  ${GREEN}Database:${NC}     postgresql://localhost:5435"
echo -e "  ${GREEN}Mock Jira:${NC}    http://localhost:8443"
echo -e "  ${GREEN}Mock Tempo:${NC}   http://localhost:8444"
echo -e "  ${GREEN}Backend API:${NC}  http://localhost:8001"
echo ""
echo -e "Useful commands:"
echo -e "  ${YELLOW}View logs:${NC}      docker compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f"
echo -e "  ${YELLOW}View status:${NC}   docker compose -f $COMPOSE_FILE -p $PROJECT_NAME ps"
echo -e "  ${YELLOW}Stop stack:${NC}    ./shutdown.sh"
echo -e "  ${YELLOW}Restart stack:${NC} ./restart.sh"
echo ""

# Optional: Start frontend with dev profile
if [ "$1" = "--with-frontend" ] || [ "$1" = "-f" ]; then
    echo -e "${BLUE}Starting frontend development server...${NC}"
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile dev up -d frontend
    echo -e "${GREEN}[OK]${NC} Frontend is running on http://localhost:3000"
    echo ""
fi
