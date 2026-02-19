#!/bin/bash

# Capacity Planner - Shutdown Script
# Stops all services in the stack

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

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Capacity Planner - Shutdown Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if any containers are running
any_running() {
    local count=$(docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps -q 2>/dev/null | wc -l | tr -d ' ')
    [ "$count" -gt 0 ]
}

# Check if services are running
echo -e "${BLUE}Checking current status...${NC}"

if ! any_running; then
    echo -e "${YELLOW}No services are currently running.${NC}"
    echo ""
    exit 0
fi

# Show current status
echo -e "${YELLOW}Currently running services:${NC}"
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Confirm shutdown (unless -y flag is passed)
if [ "$1" != "-y" ] && [ "$1" != "--yes" ]; then
    read -p "Are you sure you want to stop all services? [y/N] " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Shutdown cancelled.${NC}"
        exit 0
    fi
fi

echo ""
echo -e "${BLUE}Stopping services...${NC}"

cd "$COMPOSE_DIR"

# Stop all services (including all profiles)
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile mock --profile dev down

echo ""
echo -e "${GREEN}All services stopped.${NC}"
echo ""

# Option to remove volumes
if [ "$1" = "--clean" ] || [ "$2" = "--clean" ]; then
    echo -e "${YELLOW}Removing volumes (database data will be lost)...${NC}"
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile mock --profile dev down -v
    echo -e "${GREEN}Volumes removed.${NC}"
    echo ""
fi

# Option to remove images
if [ "$1" = "--purge" ] || [ "$2" = "--purge" ]; then
    echo -e "${YELLOW}Removing images...${NC}"
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile mock --profile dev down --rmi local
    echo -e "${GREEN}Images removed.${NC}"
    echo ""
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  Shutdown Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Options:"
echo -e "  ${YELLOW}./shutdown.sh -y${NC}        Skip confirmation prompt"
echo -e "  ${YELLOW}./shutdown.sh --clean${NC}   Also remove volumes (database data)"
echo -e "  ${YELLOW}./shutdown.sh --purge${NC}   Also remove built images"
echo ""
