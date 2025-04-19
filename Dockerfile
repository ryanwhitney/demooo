FROM node:18-alpine as frontend-build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY public/ public/
COPY src/ src/
COPY tsconfig.json vite.config.ts index.html ./

ARG API_BASE_URL
ENV VITE_API_BASE_URL $API_BASE_URL

RUN npm run build

FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ backend/

COPY --from=frontend-build /app/dist /app/dist

RUN mkdir -p /app/backend/media && chmod 777 /app/backend/media

WORKDIR /app/backend

# port 80 for Fly.io
CMD python manage.py migrate && python manage.py runserver 0.0.0.0:80