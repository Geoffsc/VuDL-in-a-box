# VuDL System Architecture

This document describes the VuDL application and the local Docker Compose
environment in this repository. It covers the primary components, how they
communicate, and where persistent data lives.

## System context

VuDL is an ingest and repository-management application for a Fedora-based
digital library. It helps staff prepare batches of files, create and edit
repository objects, run background processing, and keep the public discovery
index current. VuFind provides the public discovery interface; Fedora is the
repository of record.

```text
Staff browser
    │
    ├── VuDL React/Next.js client :3000
    │       │ authenticated HTTP requests
    │       ▼
    └── VuDL Express API :9000 ────────────────┐
             │                                 │
             ├── local ingest files            ├── Fedora :8080
             ├── SQLite auth/session data       ├── Solr biblio :8983
             └── Redis/BullMQ :6379             └── VuFind :8081
                         │                            │
                         ▼                            ├── Fedora
                    VuDL worker                       ├── Solr
                         │                            └── Cantaloupe IIIF :8182
                         ├── Fedora
                         ├── Solr
                         ├── VuFind manifests
                         └── local processing tools

Public user browser ── VuFind :8081 ── Solr / Fedora / Cantaloupe
```

The diagram shows logical flows, not every route or protocol. Within Compose,
services address one another by service name (for example, `fedora` and
`cantaloupe`). Ports bound to `127.0.0.1` are intended for local host access.

## Components

### VuDL client

The React/Next.js application provides the staff interface for batch review and
pagination, repository editing, bulk operations, PDF generation, and Solr
indexing. It runs on port `3000` in the local stack and calls the API on port
`9000`. It obtains an API token through the authentication endpoints and sends
that token with protected API requests. Browser UI theme preference is stored
in browser storage; it is separate from server-side persistence.

### VuDL API

The Node.js/Express service is the application's HTTP boundary. It serves the
API and the sign-in page, handles authentication and token minting, and provides
routes for ingest, object editing, queue management, and Fedora/Camel
notifications. It coordinates Fedora and Solr operations through application
services and submits long-running work to Redis-backed queues.

In the local Compose setup, the API and client are run in the same `app`
container as separate development processes. They remain distinct application
services and listen on separate ports.

### Background worker and BullMQ

The worker consumes jobs from Redis using BullMQ. The API and worker are
separate processes: the API accepts requests and queues work, while the worker
performs operations that can take longer or involve external tools. Job types
include ingest, derivatives, PDF generation, metadata, notifications,
reindexing, and indexing.

Redis stores queue state and coordinates the API and worker. It is not the
repository or search index. The optional Bull Arena queue UI is hosted by the
API process at port `4567` inside the container and is exposed through the
authenticated `/queue` route.

### Fedora Commons

Fedora 6 is the authoritative repository for digital objects and their
datastreams. VuDL creates and updates objects through Fedora's REST API.
Objects can represent collections, images, documents, audio, or video; their
datastreams hold source files, derivatives, metadata, and transcripts. The
local service is available at `http://localhost:8080/fcrepo/rest/`.

### Apache Solr

Solr is the searchable index used by VuDL and VuFind. The local `biblio` core
is built from VuFind 11.1.0's Solr configuration. VuDL reads and writes indexed
records through Solr's HTTP API. Fedora remains the source of truth; Solr is a
search-optimized projection that can be rebuilt or refreshed by indexing
objects.

### VuFind

VuFind is the discovery interface. The local instance uses the VuDL integration
module and connects to Fedora, Solr, MariaDB, and Cantaloupe. It serves the
public-facing search and item views on port `8081`.

VuFind uses MariaDB for its relational database. This is separate from VuDL's
own local SQLite database, which is configured for application authentication
and session-related data.

### Cantaloupe and IIIF

Cantaloupe reads image datastreams from Fedora and exposes them as IIIF Image
API resources. VuFind publishes browser-facing IIIF URLs using its Cantaloupe
route. VuDL's PDF worker instead uses the internal Compose address
`http://cantaloupe:8182` to retrieve full-resolution images; this avoids making
container-to-container requests through the host's `localhost`.

### MariaDB

MariaDB supports VuFind, not VuDL's configured SQLite database. The Compose
initialization script creates VuFind's `change_tracker` table when MariaDB
initializes a new database volume. Initialization scripts are not rerun for an
existing volume.

### Local processing tools

The Debian `app` image includes Node.js and processing dependencies such as
FFmpeg, ImageMagick, OCRmyPDF, Tesseract, Java, and Apache Tika. VuDL invokes
the relevant tools for media derivatives, OCR, and text extraction. The local
stack does not include FITS or the Fedora Camel Toolbox; workflows that require
those integrations need separately configured services/tools.

## Primary interactions and data flows

### Sign-in and staff API requests

1. A staff member opens the client at `http://localhost:3000`.
2. The client requests a token from the API. The API authenticates the user
   using the configured strategy and stores authentication/session data in the
   configured VuDL database (SQLite in this Compose setup).
3. The client sends the token with protected API requests.
4. API routes read or update Fedora, query or update Solr, inspect holding-area
   files, or enqueue jobs in Redis as appropriate.

The API serves the sign-in page at `/api/auth/login`; its static stylesheet is
served by the API at `/stylesheets/style.css`.

### Batch preparation and ingest

1. Input jobs are placed in the configured holding area, arranged by category
   and job. A category may include `batch-params.ini` to control settings such
   as the destination collection, OCR, and PDF generation.
2. The client uses the ingest API to inspect categories and jobs, review
   metadata and page order, request derivatives, and start ingest.
3. The API submits asynchronous work to Redis. The worker reads the files
   mounted in the holding area and runs the required processing tools.
4. The worker creates the Fedora object hierarchy and uploads source files,
   derivatives, and supported metadata/datastreams to Fedora.
5. The holding and processed paths are configured independently; the local
   Compose setup persists `/data` in the `vudl_data` volume.

### Repository editing

The client calls protected edit routes for catalog/model information, object
details, relationships, datastreams, and Solr queries. The API validates
operations and uses Fedora for authoritative object changes. Solr is queried
for search and browse operations; after repository changes, affected records
may need indexing to reflect those changes in discovery.

### Indexing and Fedora notifications

When enabled in a deployment, Fedora change events can be delivered by the
Fedora Camel Toolbox to the API's `/messenger/camel` endpoint. The API maps
create, update, delete, and purge events to queue operations; the worker then
updates or removes the corresponding Solr record.

The local Compose stack does not include Camel Toolbox, so Fedora changes do
not automatically trigger this flow. For local development, a PID can instead
be indexed directly through the authenticated `/messenger/solrindex/<PID>`
endpoint or via the client indexing workflow.

### PDF generation

1. A request to `/messenger/pdfgenerator/<PID>` queues a PDF job.
2. The worker requests the item's IIIF manifest from VuFind and obtains image
   resources for its canvases.
3. It fetches full-resolution JPEGs from Cantaloupe using the internal Compose
   URL and assembles them into a PDF. OCRmyPDF is used when configured.
4. The PDF is saved to Fedora as a child document with `MASTER` and a
   FITS-compatible `MASTER-MD` stream containing MIME type and file size.
5. Index the generated record and, when required, its parent in Solr so VuFind
   can expose the PDF as a manifest rendering.

### Public discovery and image delivery

1. A public user searches or opens an item in VuFind.
2. VuFind queries the `biblio` Solr core for indexed metadata.
3. VuFind uses Fedora for repository content and metadata as needed.
4. For image presentation, the browser requests IIIF resources through VuFind's
   Cantaloupe endpoint. Cantaloupe retrieves image datastreams from Fedora and
   returns the requested image or derivative.

## Configuration and persistence

Application integration settings are read from `api/vudl.ini`. The Docker
setup mounts `docker/vudl.ini` there; it configures internal service URLs,
credentials, queue connection, data paths, model/datastream definitions, and
the local authentication/database settings. VuFind's integration settings and
Cantaloupe's Fedora source are configured under `docker/`.

Compose named volumes persist the following state:

| Volume | Contents |
| --- | --- |
| `vudl_data` | VuDL SQLite database and `/data` holding/processed files |
| `fedora_data` | Fedora repository |
| `solr_data` | Solr indexes and configuration state |
| `vufind_db` | VuFind MariaDB database |
| `vufind_cache` | VuFind cache |
| Node modules volumes | Installed JavaScript dependencies for development |

Redis queue data is not mounted to a named volume in the current Compose file.
Removing containers with `docker compose down` retains named data volumes;
`docker compose down -v` removes them and their data.

## Local deployment boundaries

The Compose environment is a development/demo system, not a production security
profile. It uses sample credentials and local-development CORS, ports, and
service settings. Replace credentials and secrets and review network exposure
before adapting it for shared or production use. The local stack also omits
automatic Fedora-to-VuDL change notifications through Camel Toolbox and FITS
characterization; add and configure those integrations if a workflow depends
on them.
