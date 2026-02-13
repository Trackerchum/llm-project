# llm-project

This is a monorepo containing multiple frontend, backend, and infrastructure projects that are developed and run together in a single Docker Compose environment. Node ≥22 and npm ≥10 are required on the host only for local tooling and IDE support; all runtime code executes inside Linux Docker containers. The package manager is npm and uses workspaces, to install a package within a workspace use `npm install -w .\src\<path-to-project> <package-name>` in the root of the repository. The key components and projects are as follows: 

- A TypeScript/React frontend.
- A TypeScript/Express server.
- A TypeScript/Express identity server responsible for authentication and authorization.
- A TypeScript project with components such as base controllers and utils, shared between the two backend servers.
- A Redis database.
- An NGINX reverse proxy.
- For development, a RedisInsight instance.

The main directory structure is as follows:

├── src
│   ├── backend
│   │   ├── identity-server
│   │   │   ├── src
│   │   │   │   └── ...
│   │   │   ├── .env
│   │   │   ├── Dockerfile.development
│   │   │   ├── tsconfig.json
│   │   │   ├── package.json
│   │   │   └── tsup.config.json
│   │   ├── server
│   │   │   ├── src
│   │   │   │   └── ...
│   │   │   ├── .env
│   │   │   ├── Dockerfile.development
│   │   │   ├── tsconfig.json
│   │   │   ├── package.json
│   │   │   └── tsup.config.json
│   │   └── shared
│   │       ├── src
│   │       │   └── ...
│   │       ├── .env
│   │       ├── Dockerfile.development
│   │       ├── tsconfig.json
│   │       ├── package.json
│   │       └── tsup.config.json
│   ├── db
│   │   └── redis
│   │       └── Dockerfile.development
│   ├── frontend
│   │   └── main-ui
│   │       ├── src
│   │       │   └── ...
│   │       ├── Dockerfile.development
│   │       ├── tsconfig.json
│   │       └── package.json
│   └── proxy
│       └── nginx
│           ├── default.conf
│           └── Dockerfile.development
├── .dockerignore
├── .gitignore
├── docker-compose.development.yml
├── package-lock.json
├── package.json
└── README.md

Hot reload polling is enabled via `CHOKIDAR_USEPOLLING` and `WATCHPACK_POLLING`. This setup is development-only; production images and deployment will be handled separately. Once the `.env` files are created in the relevant projects, specified above, Docker Compose is used to bring up all projects and components with a single command. The required `.env` variables can be found in the `.env.template` files in the same directory. The root `docker-compose.development.yml` file references all project-level `Dockerfile.development` files. RedisInsight is included only via a prebuilt image defined directly in the compose file. The project will be developed by hosts using Windows, macOS and Linux, and all Docker containers are built Linux based. Operating system compatibility and developer experience on development hosts is key. Any developer on any of those three main operating systems should be able to pull the repository from GitHub, and run the command `docker compose -f docker-compose.development.yml up --build` (or `npm run dev` in the repository root) to run everything with minimal setup after installing Docker. Note this will take a few minutes on first run due to the size of the LLM.

NGINX on port 80 is the recommended entrypoint. For convenience/debugging, the frontend and APIs are also exposed directly on their own ports. Services are isolated into frontend/server networks; only NGINX bridges them. NGINX listens on port 80 and proxies requests to internal services; RedisInsight is exposed separately for development convenience.

NGINX (recommended): http://localhost
- Frontend: http://localhost/
- API: http://localhost/api/
- Identity: http://localhost/api/user/

Direct ports (optional / debugging):
- Frontend dev server: http://localhost:3000
- API server: http://localhost:5001
- Identity server: http://localhost:8001
- RedisInsight: http://localhost:6479
- Redis: localhost:6379

If things get weird with NPM dependencies, run `docker compose -f docker-compose.development.yml down -v` to nuke it and start fresh. NOTE: This also nukes redis, redisinsight and ollama data.