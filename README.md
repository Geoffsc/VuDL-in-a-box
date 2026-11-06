# VuDL in a box

VuDL is the ingest and management platform that powers [Villanova University's Digital Library](https://digital.library.villanova.edu/).

## About this Project

The Villanova Unviersity Digital Library is a complex project which contains many software components communicating with each other (Redis, Fedora Commons, Apache Solr, VuFind, etc.) So, I created a docker image that spins up the entire thing as a working Digital Library (and ingest system) running in a Docker virtual machine. This is primarily to help folks more easily understand how a Fedora-based Digital Library works and play around with it.

## About VuDL

See the [VuDL project](https://github.com/FalveyLibraryTechnology/VuDL) for more information. For a holistic overview of the components and their interactions in this setup, see the [system architecture guide](architecture.md).

## Starting the Application

The demo runs in Docker and Docker Compose. Install Docker Desktop (or Docker
Engine with the Compose plugin), then run these commands from the repository
root:

```sh
docker compose up --build
```

Compose builds the application image and starts the supporting services. The
first start can take several minutes while images are downloaded and services
initialize. When startup is complete, open [http://localhost:3000](http://localhost:3000)
to use VuDL.

Press `Ctrl+C` to stop the running services. To stop and remove the containers
later, run:

```sh
docker compose down
```

Application and service data is stored in Docker volumes and is retained when
you stop the containers.

VuFind is also available at [http://localhost:8081](http://localhost:8081).
Its VuDL theme includes the Universal Viewer and uses Cantaloupe for IIIF image
requests. The running demo includes a generated test image at
[http://localhost:8081/Item/vudl:4/Viewer](http://localhost:8081/Item/vudl:4/Viewer).
On a fresh repository, ingest or create an image object in Fedora to view it
with Universal Viewer.

## System Resources

For a local demo, allow Docker at least 4 CPU cores, 8 GB of memory, and 20 GB
of free disk space for images, build cache, and application data. For smoother
development or ingest work, 8 CPU cores, 16 GB of Docker memory, and at least
40 GB of free disk space are recommended. Ingesting larger collections can
require additional memory and storage.

## Main Functions

The screenshots below show the VuDL staff interface running with the local
Docker demo data. The client defaults to dark mode; use the theme toggle in the
upper-right corner to switch to light mode.

### Home dashboard

The dashboard links to the core ingest and repository tools.

![VuDL home dashboard](screenshots/home.png)

### Job paginator

The paginator lists batch categories and jobs from the configured holding area.
Open a job to review its pages, set their order and labels, preview images, and
prepare the job for ingest. The current local demo holding area has no sample
batches, so this tool is not pictured.

### Object editor

The editor browses Fedora collections and objects. It supports creating
objects, managing parent/child relationships, viewing datastreams, and editing
metadata and object state.

![VuDL object editor](screenshots/object-editor.png)

### Bulk editor

The bulk editor selects repository records with a search query or parent PID,
then applies changes to multiple selected records.

![VuDL bulk editor](screenshots/bulk-editor.png)

### PDF generator

Enter an image-based Fedora object's PID to queue PDF generation from its IIIF
manifest. The worker stores the generated PDF as a child object in Fedora.

![VuDL PDF generator](screenshots/pdf-generator.png)

### Solr indexer

Preview or index one Fedora PID, or queue indexing for a numeric PID range.
This tool refreshes VuFind's search index after repository updates.

![VuDL Solr indexer](screenshots/solr-indexer.png)
