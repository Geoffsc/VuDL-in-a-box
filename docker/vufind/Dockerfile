FROM php:8.2-apache-bookworm

ARG VUFIND_VERSION=v11.1.0
ARG VUFDL_COMMIT=326a826d4ea0915ccace7f694531d505a5634fcc

ENV VUFIND_HOME=/usr/local/vufind
ENV VUFIND_LOCAL_DIR=/usr/local/vufind/local

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        git \
        libcurl4-openssl-dev \
        libfreetype6-dev \
        libicu-dev \
        libjpeg62-turbo-dev \
        libonig-dev \
        libpng-dev \
        libsqlite3-dev \
        libxml2-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" curl gd intl mbstring mysqli pdo_mysql pdo_sqlite soap zip \
    && a2enmod proxy proxy_http rewrite \
    && sed -i 's/Listen 80/Listen 8081/' /etc/apache2/ports.conf \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /usr/local/vufind

RUN mkdir -p /usr/local/vufind /usr/local/vufind/local/cache \
    && curl -fsSL "https://github.com/vufind-org/vufind/archive/refs/tags/${VUFIND_VERSION}.tar.gz" \
        | tar -xz --strip-components=1 -C /usr/local/vufind \
    && mkdir -p /tmp/vufdl \
    && curl -fsSL "https://github.com/FalveyLibraryTechnology/VuFindVuDL/archive/${VUFDL_COMMIT}.tar.gz" \
        | tar -xz --strip-components=1 -C /tmp/vufdl \
    && cp -a /tmp/vufdl/module/DigLib /usr/local/vufind/module/ \
    && cp -a /tmp/vufdl/themes/vudiglib5 /usr/local/vufind/themes/ \
    && sed -i 's/Laminas\\Config\\Config/VuFind\\Config\\Config/g' \
        /usr/local/vufind/module/DigLib/src/DigLib/RecordDriver/SolrVudl.php \
        /usr/local/vufind/module/DigLib/src/DigLib/DatastreamProxy.php \
    && sed -i "s/fromQuery('cache'))/fromQuery('cache', ''))/" \
        /usr/local/vufind/module/DigLib/src/DigLib/Controller/VuDLController.php \
    && sed -i '/\$licenseData =/i\
        if (null === $license || "" === $license) {\
            return [\
                "label" => ["en" => ["License"]],\
                "value" => ["en" => ["No license information available"]],\
            ];\
        }' \
        /usr/local/vufind/module/DigLib/src/DigLib/IIIF/ManifestGenerator.php \
    && php -r '$json = json_decode(file_get_contents("composer.json"), true); $json["autoload"]["psr-4"]["DigLib\\"] = ["module/DigLib/src/DigLib", "module/DigLib"]; file_put_contents("composer.json", json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL);' \
    && COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev --no-interaction --no-scripts --prefer-dist --optimize-autoloader \
    && mkdir -p /usr/local/vufind/local/config/vufind \
    && cp /usr/local/vufind/config/vufind/config.ini /usr/local/vufind/local/config/vufind/config.ini \
    && sed -i \
        -e '/^\[Site\]/,/^\[/ s#^url[[:space:]]*=.*#url = http://localhost:8081#' \
        -e '/^\[Site\]/,/^\[/ s#^timezone[[:space:]]*=.*#timezone = UTC#' \
        -e '/^\[Catalog\]/,/^\[/ s#^driver[[:space:]]*=.*#driver = NoILS#' \
        -e '/^\[Index\]/,/^\[/ s#^url[[:space:]]*=.*#url = http://solr:8983/solr#' \
        -e '/^\[Database\]/,/^\[/ s#^database[[:space:]]*=.*#database = mysql://vufind:vufind@mariadb/vufind#' \
        /usr/local/vufind/local/config/vufind/config.ini \
    && chown -R www-data:www-data /usr/local/vufind/local \
    && rm -rf /tmp/vufdl

COPY apache.conf /etc/apache2/sites-available/000-default.conf

EXPOSE 8081

CMD ["apache2-foreground"]
