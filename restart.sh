#!/bin/bash

# Capacity Planner - Restart Script
# Restarts all services in the stack

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
echo -e "${BLUE}  Capacity Planner - Restart Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

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

# Check current status
echo -e "${BLUE}Checking current status...${NC}"

if any_running; then
    echo -e "${YELLOW}Currently running services:${NC}"
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps --format "table {{.Name}}\t{{.Status}}"
    echo ""
else
    echo -e "${YELLOW}No services currently running. Starting fresh...${NC}"
    echo ""
fi

# Parse arguments
REBUILD=false
SERVICE=""

for arg in "$@"; do
    case $arg in
        --rebuild|-r)
            REBUILD=true
            ;;
        --service=*)
            SERVICE="${arg#*=}"
            ;;
        -s)
            # Next argument is the service name
            shift
            SERVICE="$1"
            ;;
    esac
done

cd "$COMPOSE_DIR"

# Restart specific service or all services
if [ -n "$SERVICE" ]; then
    echo -e "${BLUE}Restarting service: $SERVICE${NC}"
    echo ""

    if [ "$REBUILD" = true ]; then
        echo -e "${YELLOW}Rebuilding $SERVICE...${NC}"
        docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile mock --profile dev build "$SERVICE"
    fi

    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile mock --profile dev restart "$SERVICE"
else
    echo -e "${BLUE}Restarting all services...${NC}"
    echo ""

    # Stop all services
    echo -e "${YELLOW}Stopping services...${NC}"
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile mock --profile dev down

    echo ""

    # Rebuild if requested
    if [ "$REBUILD" = true ]; then
        echo -e "${YELLOW}Rebuilding images...${NC}"
        docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile mock build
    fi

    # Start services
    echo -e "${YELLOW}Starting services...${NC}"
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile mock up -d
fi

echo ""
echo -e "${BLUE}Waiting for services to initialize...${NC}"
sleep 5

# Verify health
echo ""
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
    echo -e "${YELLOW}[WARN]${NC} Backend API may still be initializing"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  Restart Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Services:"
echo -e "  ${GREEN}Database:${NC}     postgresql://localhost:5435"
echo -e "  ${GREEN}Mock Jira:${NC}    http://localhost:8443"
echo -e "  ${GREEN}Mock Tempo:${NC}   http://localhost:8444"
echo -e "  ${GREEN}Backend API:${NC}  http://localhost:8001"
echo ""
echo -e "Options:"
echo -e "  ${YELLOW}./restart.sh --rebuild${NC}           Rebuild images before starting"
echo -e "  ${YELLOW}./restart.sh --service=mock-jira${NC} Restart specific service only"
echo -e "  ${YELLOW}./restart.sh -r -s mock-tempo${NC}    Rebuild and restart specific service"
echo ""
