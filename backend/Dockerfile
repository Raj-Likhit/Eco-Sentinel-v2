# Base stage for building
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package*.json ./

# Copy shared and backend modules
COPY shared/ ./shared/
COPY backend/ ./backend/

# Install all dependencies at once (monorepo approach)
RUN npm install

# Build the shared contract first
RUN npm run build --workspace=shared

# Build the backend
RUN npm run build --workspace=backend

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/node_modules ./node_modules

# Cloud Run defaults to port 8080, but our server uses 3001 or PORT env
ENV PORT=3001
EXPOSE 3001

# Start the backend
CMD ["node", "backend/dist/server.js"]
