# build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
# allow overriding API base URL at build time
ARG VITE_API_BASE_URL=http://localhost:5175
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build:prod

# serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]


