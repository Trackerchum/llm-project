# llm-project

This is a monorepo containing multiple frontend, backend, and infrastructure projects that are developed and run together in a single Docker Compose environment. Node ≥22 and pnpm ≥10 are required on the host only for local tooling and IDE support; all runtime code executes inside Linux Docker containers. Package manager choice is transitional and will likely change (e.g. npm or yarn). The key components and projects are as follows: 

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
│   │   │   ├── Dockerfile.development
│   │   │   ├── tsconfig.json
│   │   │   ├── package.json
│   │   │   └── tsup.config.json
│   │   ├── server
│   │   │   ├── src
│   │   │   │   └── ...
│   │   │   ├── Dockerfile.development
│   │   │   ├── tsconfig.json
│   │   │   ├── package.json
│   │   │   └── tsup.config.json
│   │   └── shared
│   │       ├── src
│   │       │   └── ...
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
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md

This setup is development-only; production images and deployment will be handled separately. Docker Compose is used to bring up all projects and components with a single command. The root docker-compose.development.yml file references all project-level Dockerfile.development files. RedisInsight is included only via a prebuilt image defined directly in the compose file. The project will be developed by hosts using Windows, macOS and Linux, and all Docker containers are built Linux based. Operating system compatibility and developer experience on development hosts is key. Any developer on any of those three main operating systems should be able to pull the repository from GitHub, and run the command "docker compose -f docker-compose.development.yml up --build" to run everything with minimal to no setup after installing Docker.

Once running, all external traffic is routed through NGINX. NGINX listens on port 80 and proxies requests to internal services; RedisInsight is exposed separately for development convenience.
- Frontend: http://localhost
- API: http://localhost:5001
- Identity server: http://localhost:8001
- RedisInsight: http://localhost:6479
