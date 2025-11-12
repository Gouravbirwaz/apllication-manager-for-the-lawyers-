# -------------------------------
# 1️⃣ Base build stage
# -------------------------------
FROM node:20-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (no dev cache leftovers)
RUN npm ci

# Copy all frontend files
COPY . .

# Build the Next.js app
RUN npm run build

# -------------------------------
# 2️⃣ Production stage (lightweight)
# -------------------------------
FROM node:20-alpine AS runner

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copy only the build output and necessary files from the builder
COPY --from=builder /app/.next ./.next

COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Expose the app port
EXPOSE 3000

# Run the Next.js app
CMD ["npm", "start"]
