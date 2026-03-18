# llm-project

This is a monorepo containing multiple frontend, backend, infrastructure projects and an Ollama LLM runtime that are developed and run together in a single Docker Compose environment. Node ≥22 and npm ≥10 are required on the host only for local tooling and IDE support; all runtime code executes inside Linux Docker containers. The package manager is npm and uses workspaces, to install a package within a workspace use `npm install -w ./src/<path-to-project> <package-name>` in the root of the repository. The key components and projects are as follows: 

- A TypeScript/React frontend.
- A TypeScript/Express server.
- A TypeScript/Express MCP server.
- A TypeScript/Express identity server responsible for authentication and authorization.
- A TypeScript project with components such as base controllers and utils, shared between the two backend servers.
- A Redis database.
- A MongoDB database.
- An NGINX reverse proxy.
- An Ollama LLM instance with models pulled during startup.
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
    │   │   ├── mcp-server
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

Hot reload polling is enabled via `CHOKIDAR_USEPOLLING` and `WATCHPACK_POLLING`. THIS SETUP IS DEVELOPMENT-ONLY; production images and deployment will be handled separately. Once the `.env` files are created in the relevant projects specified above, Docker Compose is used to bring up all projects and components with a single command. The required `.env` variables can be found in the `.env.template` files in the same directory. The root `docker-compose.development.yml` file references all project-level `Dockerfile.development` files. RedisInsight is included only via a prebuilt image defined directly in the compose file. The project will be developed by hosts using Windows, macOS and Linux, and all Docker containers are built Linux based. Operating system compatibility and developer experience on development hosts is key. Any developer on any of those three main operating systems should be able to pull the repository from GitHub, and run the command `docker compose -f docker-compose.development.yml up --build` (or `npm run dev` in the repository root) to run everything with minimal setup after installing Docker. Note this will take a few minutes on first run due to the size of the LLM.

NGINX on port 80 is the recommended entrypoint. For convenience/debugging, the frontend and APIs are also exposed directly on their own ports. Services are isolated into frontend/server networks; only NGINX bridges them. NGINX listens on port 80 and proxies requests to internal services; RedisInsight is exposed separately for development convenience.

NGINX (recommended): http://localhost
- Frontend: http://localhost/
- API: http://localhost/api/
- MCP: http://localhost/api/mcp/
- Identity: http://localhost/api/user/

Direct ports (optional / debugging):
- Frontend dev server: http://localhost:3000
- API server: http://localhost:5001
- MCP server: http://localhost:6001
- Identity server: http://localhost:8001
- RedisInsight: http://localhost:6479
- Redis: http://localhost:6379
- MongoDB: mongodb://localhost:27017

MongoDB defaults (development only):
- Host (inside Docker network): `db-mongo`
- Port: `27017`
- Root user: `root`
- Root password: `dev_root_password_change_me`
- App database: `llm_project`
- App user: `llm_project_app`
- App user password: `dev_app_password_change_me`
- Backend `MONGO_URL` value (inside Docker network): `mongodb://llm_project_app:dev_app_password_change_me@db-mongo:27017/llm_project?authSource=llm_project`

Ollama models are configured in `docker-compose.development.yml` under the `llm-ollama-init` service. The `OLLAMA_MODELS` environment variable controls which models are pulled on startup.

To add a model, append it to the space-delimited list in `OLLAMA_MODELS`, for example:

`OLLAMA_MODELS: "model-a model-b model-c"`

After changing `OLLAMA_MODELS`, rerun `npm run dev` in root so `llm-ollama-init` runs again and pulls newly added models.

If things get weird with NPM dependencies, run `docker compose -f docker-compose.development.yml down -v` to nuke it and start fresh. NOTE: This also nukes Redis, MongoDB, RedisInsight and Ollama data.