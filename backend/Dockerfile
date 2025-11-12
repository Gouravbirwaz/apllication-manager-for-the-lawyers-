# Stage 1: Builder
FROM python:3.12-slim AS builder
WORKDIR /app

# Install required system packages for building mysqlclient
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for layer caching
COPY requirements.txt .

# Install dependencies into a local path
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime
FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir --default-timeout=1000 faiss-cpu==1.8.0
# Copy installed Python dependencies from builder
COPY --from=builder /install /usr/local

# Copy project files
COPY . .

# Expose your app’s port
EXPOSE 5000

# Use gunicorn as a production server
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:create_app()"]

