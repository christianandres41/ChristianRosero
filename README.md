
## Requisitos 

- Node.js (16+)
- npm

## Instalación y ejecución

1. Levantar el backend:
    ```bash
    cd backend
    npm install
    npm run start:dev
    ```
2. Instalar las dependencias y levantar el frontend:
   ```bash
   npm install
   ```

    ```bash
    npm run start
    ```

La app se levanta en `http://localhost:4200/`.

## Pruebas unitarias

Las pruebas se ejecutan con **Jest** en lugar de Vitest. Para lanzarlas:

```bash
npm run test
```

El comando arranca Jest en modo único y mostrará un resumen de cobertura. Para ver los tests en modo observador añade `-- --watch`.

## Estructura relevante

- `src/app/features/products` — componentes, servicios y modelos relacionados con productos.
- `src/environments` — configuración de entornos de Angular.
- `src/styles/` — estilos globales para la app.