# Guide to Containerizing a Modern JavaScript SPA (Vue/Vite/React) with a Multi-Stage Nginx Build 🚀

## Introduction

This guide outlines the professional, multi-stage Docker strategy required to package a built Single Page Application (SPA), ensuring the final image is secure, minimal, and correctly configured to serve the application and handle remote API calls. This architecture is valid for **Vue, Vite, React, Angular, or Svelte** applications.

---

## 1\. Multi-Stage Dockerfile: Build vs. Serve

This file uses a two-stage build to drastically reduce the final image size (eliminating Node.js and build tools) and enhance security.

```dockerfile
# Dockerfile

# Stage 1: Build the Application (AS build)
FROM docker.io/node:20-alpine AS build

# 1. Inject API URL at build time
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:deploy

# ---

# Stage 2: Serve the Application (AS final)
FROM docker.io/library/nginx:stable-alpine AS final

# 1. Custom Nginx Configuration Setup
RUN rm /etc/nginx/nginx.conf
COPY nginx-main.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/

# 2. Grant Non-Root User Permissions (CRITICAL for security & stability)
# Fixes 'mkdir() "/var/cache/nginx/client_temp" failed (13: Permission denied)'
RUN mkdir -p /var/run/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/run/nginx

# 3. Copy only the required static files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

# 4. Run as Non-Root User (Security Best Practice)
USER nginx

CMD ["nginx", "-g", "daemon off;"]
```

---

## 2\. Nginx Configuration Files (The Missing Pieces)

These custom files are necessary to resolve critical permission and port errors when running Nginx as a non-root user.

### A. Main Configuration (`nginx-main.conf`)

This file replaces the default `/etc/nginx/nginx.conf`. It controls the Master Process directives.

```nginx
# nginx-main.conf (Copied to /etc/nginx/nginx.conf)

# Fixes 'open() "/run/nginx.pid" failed (13: Permission denied)'
# This MUST be in the main context.
pid /var/run/nginx/nginx.pid;

# Sets the user for worker processes (ignored by Dockerfile's USER, but good practice)
user  nginx;
worker_processes  auto;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    # Include our custom server block
    include /etc/nginx/conf.d/*.conf;
}
```

### B. Server Block (`nginx.conf`)

This file defines how your application is served and is placed in the `conf.d` directory.

```nginx
# nginx.conf (Copied to /etc/nginx/conf.d/nginx.conf)

server {
    # Fixes 'bind() to 0.0.0.0:80 failed (13: Permission denied)'
    # Nginx listens on a high port (>1024) which the non-root user can bind to.
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;

    # Security: Hides the Nginx version
    server_tokens off;

    # SPA Routing: Directs all unmatched requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security: Block access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

---

## 3\. Local Development with Podman Compose

Using a `docker-compose.yaml` file automates the entire process.

```yaml
version: "3.8"

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_API_URL: https://admin.radiowebapp.com

    container_name: frontend-container

    # Maps host's 8080 port to the container's 8080 listening port
    ports:
      - "8080:8080"

    image: my-frontend-app:v1.0.0
    restart: always
```

### Essential Podman Compose Commands

| Command                | Action                                                         |
| :--------------------- | :------------------------------------------------------------- |
| `podman compose build` | Executes the `Dockerfile` with the specified `args`.           |
| `podman compose up -d` | Builds (if needed) and starts the container in the background. |
| `podman compose ps`    | Checks the running status of the service(s).                   |
| `podman compose down`  | Stops and removes the container(s) and network.                |

---

## 4\. Guide Reusability and Troubleshooting

This architecture is reusable for nearly any SPA. Just update the **`VITE_API_URL`** in `docker-compose.yaml` and adjust the build script (`npm run build:deploy`) and output folder (`/app/dist`) in the `Dockerfile` if needed.

The most critical errors encountered and resolved are:

| Error Logged                      | Cause                                                                    | Solution in this Guide                                           |
| :-------------------------------- | :----------------------------------------------------------------------- | :--------------------------------------------------------------- |
| `bind() to 0.0.0.0:80 failed`     | Non-root user attempting to use privileged port 80.                      | Change `listen` to **`8080`** in `nginx.conf`.                   |
| `open() "/run/nginx.pid" failed`  | Non-root user lacking write permission to the default PID file location. | Add **`pid /var/run/nginx/nginx.pid;`** to `nginx-main.conf`.    |
| `mkdir() "/var/cache/..." failed` | Non-root user lacking permission to Nginx cache directory.               | Add **`chown -R nginx:nginx /var/cache/nginx`** to `Dockerfile`. |

You can see all these solutions implemented in the provided configuration files at the same level as this guide.

---

## 5\. Conclusion

By implementing this Multi-Stage Build and carefully configuring Nginx for a non-root user, you've achieved the trifecta of modern container deployment: security, stability, and speed. Every step—from moving the PID file to changing the listen port—is a direct defense against common production pitfalls and security vulnerabilities. This standardized approach is the most reliable way to ship any modern JavaScript SPA, ensuring your application moves seamlessly from local development to production. You are now equipped with the knowledge to troubleshoot the most common containerization challenges and build a robust, production-ready frontend environment. 🥳
