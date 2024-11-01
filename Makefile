.PHONY: build start next stop clean test

DOCKER_COMPOSE = docker-compose

build:
	@echo "Building containers..."
	$(DOCKER_COMPOSE) build

start:
	@echo "Starting services..."
	$(DOCKER_COMPOSE) up -d

next:
	@echo "Starting services..."
	$(DOCKER_COMPOSE) up app

stop:
	@echo "Stopping services..."
	$(DOCKER_COMPOSE) down

clean: stop
	@echo "Cleaning up..."
	$(DOCKER_COMPOSE) down -v
	rm -rf uploads/*

logs:
	$(DOCKER_COMPOSE) logs -f

test:
	$(DOCKER_COMPOSE) exec app npm test

init-db:
	$(DOCKER_COMPOSE) exec postgres psql -U fileserver -d fileserver -f /docker-entrypoint-initdb.d/init.sql