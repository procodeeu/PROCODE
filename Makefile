.PHONY: dev prod-like prod-local clean logs stats help

# Default target
help:
	@echo "PROCODE Development Commands:"
	@echo ""
	@echo "  make dev        - Development with production constraints"
	@echo "  make prod-like  - Production build with dev data"
	@echo "  make prod-local - Full production test locally"
	@echo "  make clean      - Clean all containers and volumes"
	@echo "  make logs       - Follow container logs"
	@echo "  make stats      - Monitor resource usage"
	@echo "  make setup      - Initial setup with swap file"
	@echo ""

# Development with production resource constraints
dev:
	NODE_ENV=development docker-compose --env-file .env.development down
	NODE_ENV=development docker-compose --env-file .env.development up --build

# Production build with development data
prod-like:
	NODE_ENV=production docker-compose --env-file .env.development down
	NODE_ENV=production docker-compose --env-file .env.development up --build

# Full production setup locally
prod-local:
	NODE_ENV=production docker-compose --env-file .env.production down
	NODE_ENV=production docker-compose --env-file .env.production up --build

# Production deployment (for VPS)
deploy:
	NODE_ENV=production docker-compose --env-file .env.production up -d --build

# Clean everything
clean:
	docker-compose down -v
	docker system prune -f
	docker volume prune -f

# View logs
logs:
	docker-compose logs -f

# Monitor resource usage
stats:
	@echo "=== Container Resource Usage ==="
	docker stats --no-stream
	@echo ""
	@echo "=== Memory Usage Breakdown ==="
	@docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.CPUPerc}}"

# Initial setup with swap file (for VPS)
setup:
	@echo "Setting up swap file for VPS deployment..."
	@if [ ! -f /swapfile ]; then \
		echo "Creating 1GB swap file..."; \
		sudo fallocate -l 1G /swapfile; \
		sudo chmod 600 /swapfile; \
		sudo mkswap /swapfile; \
		sudo swapon /swapfile; \
		echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab; \
		echo "Swap file created successfully!"; \
	else \
		echo "Swap file already exists."; \
	fi
	@echo "Setup complete!"

# Quick resource check
check:
	@echo "=== System Resources ==="
	@echo "Total Memory: $$(free -h | awk '/^Mem:/ {print $$2}')"
	@echo "Available Memory: $$(free -h | awk '/^Mem:/ {print $$7}')"
	@echo "Swap Usage: $$(free -h | awk '/^Swap:/ {print $$3 "/" $$2}')"
	@echo ""
	@echo "=== Docker Usage ==="
	@docker system df