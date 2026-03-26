FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY package-lock.json ./
RUN npm install --production

# Copy source
COPY . .

# Create required directories
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]
