FROM python:3.9-slim

# Install Node.js and npm for frontend building
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first to leverage Docker cache for node_modules
COPY package.json package-lock.json* /app/
RUN npm install

# Copy all project files
COPY . /app/

# Build React app
RUN npm run build

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories for configuration
RUN mkdir -p /config/settings /config/stateful /config/user /config/logs
RUN chmod -R 755 /config

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=9705

# Expose port
EXPOSE 9705

# Run the main application
CMD ["python3", "main.py"]