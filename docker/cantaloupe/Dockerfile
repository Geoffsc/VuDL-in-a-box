FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl openjdk-17-jre-headless unzip \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /opt/cantaloupe \
    && curl -fsSL https://github.com/cantaloupe-project/cantaloupe/releases/download/v5.0.7/cantaloupe-5.0.7.zip \
        -o /tmp/cantaloupe.zip \
    && unzip -q /tmp/cantaloupe.zip -d /opt/cantaloupe \
    && rm /tmp/cantaloupe.zip

EXPOSE 8182

CMD ["java", "-Xmx512m", "-Dcantaloupe.config=/etc/cantaloupe.properties", "-cp", "/opt/cantaloupe/cantaloupe-5.0.7/cantaloupe-5.0.7.jar", "edu.illinois.library.cantaloupe.StandaloneEntry"]
