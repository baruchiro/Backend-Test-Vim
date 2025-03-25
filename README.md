# User Notifications Manager

A TypeScript-based service for managing user notifications, with rate limiting and integration with a notification service.

## Prerequisites

- Node.js v20
- Yarn package manager
- Docker and Docker Compose

## Installation

```bash
# Install dependencies
yarn install

# Build the project
yarn build
```

## Environment Variables

For CLI/local development, you need to set these environment variables:

```bash
NOTIFICATION_SERVICE_URL=http://localhost:5001
RATE_LIMIT_WINDOW_MS=1000
EMAIL_RATE_LIMIT=1
SMS_RATE_LIMIT=1
```

## Development

```bash
# Start development server with hot-reload
yarn dev

# Build the project
yarn build

# Start production server
yarn start
```

## Docker Setup

The project includes two services:
- user-notifications-manager (main service, port 8080)
- notification-service (external service, port 5001)

To run the complete setup:

```bash
docker compose up --build
```

Environment variables are pre-configured in the docker-compose.yml file.

## Testing

```bash
# Run unit tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run integration tests (requires Docker)
yarn test:integration
```

The integration tests will automatically:
1. Start the required Docker containers
2. Run the tests
3. Shut down the containers afterward
