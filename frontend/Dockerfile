# Base stage for building
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package*.json ./

# Copy shared and frontend modules
COPY shared/ ./shared/
COPY frontend/ ./frontend/

# Install all dependencies
RUN npm install

# Build shared library
RUN npm run build --workspace=shared

# Build Next.js app
RUN npm run build --workspace=frontend

# Production stage
FROM node:18-alpine

WORKDIR /app

# Set production context
ENV NODE_ENV production

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/package.json ./frontend/package.json
COPY --from=builder /app/node_modules ./node_modules

# Cloud Run expects port 8080 by default
EXPOSE 8080
ENV PORT 8080

CMD ["npm", "run", "start", "--workspace=frontend"]
