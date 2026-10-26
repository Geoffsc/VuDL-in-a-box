FROM node:20-bookworm

ARG TIKA_VERSION=3.2.3

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        default-jre-headless \
        ffmpeg \
        g++ \
        imagemagick \
        make \
        ocrmypdf \
        python3 \
        tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL "https://repo.maven.apache.org/maven2/org/apache/tika/tika-app/${TIKA_VERSION}/tika-app-${TIKA_VERSION}.jar" \
    -o /usr/local/lib/tika-app.jar

WORKDIR /app

COPY package.json package-lock.json ./
COPY api/package.json api/package-lock.json ./api/
COPY client/package.json client/package-lock.json ./client/
RUN npm ci --ignore-scripts \
    && cd api \
    && npm ci \
    && npm_config_build_from_source=true npm rebuild sqlite3 \
    && cd /app \
    && mkdir -p client/public \
    && npm ci --prefix client

COPY . .

EXPOSE 3000 9000

CMD ["npm", "run", "dev"]
