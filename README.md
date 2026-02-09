# llm-project

This is a monorepo with mulitple components and projects, all interacting with each other. The key components are as followed: 

- A TypeScript/React frontend.
- A TypeScript/Express server.
- A TypeScript/Express indentity server.
- A TypeScript project with components such as base controllers and utils, shared between the two backend servers.
- A Redis database.
- An NGINX reverse proxy.
- For development, a Redis insight instance.

The main directory structure is as followed:

├── src
│   └── backend
│       ├── identity-server
│           ├── src
│               └── ...
│           ├── Dockerfile.developement
│           ├── tsconfig.json
│           ├── package.json
│           └── tsup.config.json
│       ├── server
│           ├── src
│               └── ...
│           ├── Dockerfile.developement
│           ├── tsconfig.json
│           ├── package.json
│           └── tsup.config.json
│       └── shared
│           ├── src
│               └── ...
│           ├── Dockerfile.developement
│           ├── tsconfig.json
│           ├── package.json
│           └── tsup.config.json
│   ├── db
│       └── redis
│           └── Dockerfile.developement
│   ├── frontend
│       └── main-ui
│           ├── src
│               └── ...
│           ├── Dockerfile.developement
│           ├── tsconfig.json
│           └── package.json
│   └── proxy
│       └── nginx
│           ├── default.conf
│           └── Dockerfile.developement
├── .dockerignore
├── .gitignore
├── docker-compose.development.yml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md

The repo's node veersion is >=22, and pnpm >=10.