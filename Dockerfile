FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for audio/video processing and image manipulation
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ backend/

# Copy pre-built frontend dist files
COPY dist/ dist/

# Create media directory for file uploads
RUN mkdir -p /app/backend/media && chmod 777 /app/backend/media

# Set working directory to backend folder
WORKDIR /app/backend

# Run migrations and start server
CMD python manage.py migrate && python manage.py runserver 0.0.0.0:8000