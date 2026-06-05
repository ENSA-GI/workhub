# Stage 1: Build
FROM node:18-slim AS build
WORKDIR /app
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_BASE_URL=http://localhost:8888
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:stable
COPY --from=build /app/dist /usr/share/nginx/html
# Copie d'une config nginx personnalisée si nécessaire
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
