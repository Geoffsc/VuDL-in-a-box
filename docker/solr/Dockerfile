FROM solr:9.11.0

USER root

ARG VUFIND_VERSION=v11.1.0

RUN mkdir -p /tmp/vufind \
    && curl -fsSL "https://github.com/vufind-org/vufind/archive/refs/tags/${VUFIND_VERSION}.tar.gz" \
        | tar -xz --strip-components=1 -C /tmp/vufind \
    && cp -a /tmp/vufind/solr /var/solr/ \
    && cp -a /tmp/vufind/import /var/solr/ \
    && mkdir -p /var/solr/solr/vendor/modules \
    && ln -s /opt/solr/modules/analysis-extras /var/solr/solr/vendor/modules/analysis-extras \
    && chown -R solr:solr /var/solr \
    && rm -rf /tmp/vufind

ENV SOLR_MODULES=analysis-extras \
    SOLR_SECURITY_MANAGER_ENABLED=false

USER solr

CMD ["solr-foreground", "-s", "/var/solr/solr/vufind", "--user-managed", "--jvm-opts", "-Ddisable.configEdit=true -Dsolr.config.lib.enabled=true"]
