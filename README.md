# Trilogia de Sabor — Sistema de gestión

Reemplaza el Excel de finanzas del negocio (recetas/costos, inventario, pedidos, nómina y gastos) por un sistema en módulos, con descuento automático de inventario al vender.

## Estructura

- `api/` — Node.js + Express + Prisma + PostgreSQL
- `web/` — React + Vite + Redux Toolkit (funciona en PC y celular, instalable como PWA)
- `docker-compose.yml` — levanta todo junto (Postgres + API + Web)

## Correr en local (con Docker, recomendado para la jefa)

```bash
docker compose up -d --build
```

- Web: http://localhost:5173
- API: http://localhost:3000
- Usuario admin inicial: el correo/clave definidos en `api/.env` (`ADMIN_CORREO` / `ADMIN_PASSWORD`), por defecto `admin@trilogiadesabor.com` / `cambiar123`. **Cámbiala después de entrar la primera vez.**

## Correr en desarrollo (sin Docker, para seguir programando)

```bash
docker compose up -d db          # solo la base de datos
cd api && npm install && npx prisma generate && npx prisma db push && npm run seed && npm run dev
cd web && npm install && npm run dev
```

## Importar los datos del Excel existente

Con la API y la base de datos corriendo:

```bash
cd api
node scripts/importarExcel.js "C:\ruta\a\FINANAZAS TRILOGIA ACTUALIZADO.xlsx"
```

Es una importación "best effort": el Excel tiene texto libre y formatos inconsistentes entre filas, así que el script deja un reporte de advertencias al final (insumos sin costo real detectado, deducciones de nómina no reconocidas, etc.) para revisar a mano. Los costos de insumos importados se recalculan como precio del paquete ÷ tamaño del paquete (más preciso que el Excel, donde el costo por línea de receta se escribía a mano).

Después de importar, corre el script de reconciliación para resolver automáticamente insumos que quedaron sin clasificar por diferencias menores de nombre entre la receta y el Inventario (ej. "Pan Artesanal" vs "Pan Hamburguesa"):

```bash
node scripts/reconciliarInsumos.js            # modo simulación: muestra qué haría
node scripts/reconciliarInsumos.js --aplicar  # aplica los cambios
```

Al final revisa la lista de "sub-preparaciones con costo por unidad sospechosamente alto": significa que el campo "Rendimiento" de esa receta en el Excel no estaba en la misma unidad (gramos) que usan las demás recetas — corrígelo a mano desde Recetas.

## Desplegar en línea (Render + Neon)

Ya tienes cuenta en Render y Neon. Cada carpeta (`api/`, `web/`) es su propio repositorio de GitHub y ya trae su `render.yaml`, así que Render detecta todo automáticamente:

1. **Base de datos**: en Neon, crea un proyecto/base nueva y copia el `DATABASE_URL` (con `?sslmode=require`).
2. **API**: en Render, "New" → "Blueprint" → conecta el repo `Trilogia-api`. Cuando pida las variables marcadas como manuales, carga:
   - `DATABASE_URL`: la de Neon.
   - `JWT_SECRET`: una cadena aleatoria larga (ej. genera una con `openssl rand -hex 32`).
   - `FRONTEND_URL` y `CORS_ORIGINS`: la URL que Render le va a asignar al sitio web (ej. `https://trilogia-web.onrender.com`) — puedes dejarlas pendientes y volver a editarlas después de crear el sitio web si aún no la sabes.
   - `ADMIN_NOMBRE`, `ADMIN_CORREO`, `ADMIN_PASSWORD`: los del usuario administrador inicial.
3. **Web**: "New" → "Blueprint" → conecta el repo `Trilogia-Front`. En `VITE_API_URL` carga la URL pública que Render le asignó a `trilogia-api` (ej. `https://trilogia-api.onrender.com`).
4. Si `FRONTEND_URL`/`CORS_ORIGINS` quedaron pendientes en el paso 2, vuelve a la API y edítalas ahora con la URL real del sitio web, y espera a que redeploye.
5. Entra a la URL del sitio web, inicia sesión con el admin del paso 2 y cambia la contraseña.

## Módulos

- **Inventario**: insumos, stock, alertas de stock bajo, historial de movimientos.
- **Recetas/Productos**: platos, bebidas y sub-preparaciones (reutilizables entre recetas), con motor de costeo automático.
- **Pedidos**: nombre del cliente (opcional), dirección obligatoria si es a domicilio, descuento automático de inventario según receta.
- **Empleados y turnos**: valor por hora, cálculo automático de pago por turno (horas × valor hora + propina − deducciones).
- **Gastos**: registro de compras/gastos del negocio.
- **Resumen**: ventas, nómina, gastos y utilidad estimada del día/semana/mes, con alertas de stock bajo.
