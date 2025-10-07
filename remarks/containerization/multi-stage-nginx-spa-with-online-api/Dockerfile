# Stage 1: Build the Application (Named 'build')
FROM node:20-alpine AS build

# 1. Define the ARG (Argument) to hold the API URL
# This value will be passed during the `docker build` command.
# Use a placeholder default value for safety/development.
ARG VITE_API_URL=http://localhost:3000/api

# 2. Set the ENV (Environment Variable)
# This makes the ARG available to your build process (npm run build).
ENV VITE_API_URL=$VITE_API_URL

# Set the working directory inside the container
WORKDIR /app

# Optimization: Copy package*.json first to leverage Docker's build cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build:deploy

# ---
# Stage 2: Serve the Application with Nginx (Named 'final')
FROM docker.io/library/nginx:stable-alpine AS final

# 🛠️ TWEAK: Ensure the default server config is REMOVED
# This is usually the source of the persistent port 80 bind.
RUN rm -f /etc/nginx/conf.d/default.conf

# Remove the base image's main nginx.conf before copying ours
RUN rm /etc/nginx/nginx.conf

# 🛠️ NEW STEP: Copy our custom main Nginx configuration
COPY nginx-main.conf /etc/nginx/nginx.conf

# 🛠️ FIX: Ensure cache and run directories are owned by the non-root user
RUN mkdir -p /var/run/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/run/nginx

# Copy our custom server block (nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/

# Copy the static built files from the 'build' stage to the Nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the port Nginx is running on (default HTTP port)
EXPOSE 8080

# 🛠️ Security Improvement: Run as a non-root user
# Nginx stable-alpine often provides a user named 'nginx'
# We switch to this user for the final running stage.
USER nginx

# Command to run Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
