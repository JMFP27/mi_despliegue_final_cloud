# Practicas/Metricas aplicadas a lo largo del proyecto

- Arquitectura hexagonal

- Nombramiento de archivos con `kebab-case` y extensión descriptiva (ej. `usuario.entidad.ts` o `postgres.repository.ts`)

- Uso *minimo* de primitivos en las clases de dominio [articulo relacionado](https://medium.com/better-programming/why-you-should-avoid-using-primitive-types-cb55857baa39)

- Exportación conjunta en módulos utilizando `barrel exports` [articulo relacionado](https://alirezahamid.medium.com/simplify-your-javascript-and-typescript-projects-with-barrel-exports-20b73680cbfe)

- Manejo de errores con clases definidas a partir de clase utilitaria `BaseError` [articulo relacionado](https://engineering.udacity.com/handling-errors-like-a-pro-in-typescript-d7a314ad4991)

- Nombramiento de funciones y variables siguiendo practicas Clean-Code

# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

## Branch kevin

Short-lived feature branch used for collaborative fixes and CI adjustments. See `WORKING_ON_KEVIN.md` for notes.
