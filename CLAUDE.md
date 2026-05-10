# Entreprenly - Sales BC Context

## Proyecto
Plataforma peruana de emprendimiento. Trabajando en el módulo de Ventas (Sales BC).

## Stack
- **Frontend:** Angular 20 + TypeScript 5.8 (este repo)
- **Backend (planeado):** Java 25 LTS / Spring Boot 3.5 / MySQL 9.2
- **Fake API actual:** JSON-Server con `server/db.json`

## Arquitectura DDD
Patrón daos-language-reference de UPC. Cada BC tiene 4 capas:
- `domain/model/` — entities, VOs, enums (anémicos: solo getters/setters)
- `application/` — stores con signals
- `infrastructure/` — responses, assemblers, api-endpoints, api
- `presentation/` — views, components

## BCs del Sistema (5 total)
1. Auth
2. Profile
3. Subscription
4. Inventory
5. **Sales** ← yo trabajo en este
6. Chatbot

## Decisiones Arquitectónicas Clave
- Sales BC = solo ventas presenciales (cajero confirma pagos manualmente)
- Caja vive en Sales BC. Agrupa Tarjeta+Yape+Plin como "digital" (un total)
- Stock: Inventario tiene 3 commands (DecrementStock, ReserveStock, ReleaseStock)
- Pedidos WhatsApp viven en Chatbot BC (NO es BC separado)
- Balanza IoT: sistema detecta automáticamente si hay balanza conectada
- Cada día empieza en S/0.00, persiste en db.json con fecha del día

## User Stories implementadas
- US-24: Buscar producto con autocompletado + validación tipo
- US-25: Modal "Registrar Cantidad" para unidades + validación stock
- US-26: Modal "Registrar Peso" — balanza IoT auto / manual / stock insuficiente
- US-27: Eliminar item del ticket (icono basurero)
- US-28: Selección método de pago + validación "Por favor seleccione método"
- US-29: Finalizar Venta + modal "Venta Exitosa" / validación "No hay productos"
- US-30, US-31: Resumen de Caja con persistencia entre secciones

## Estado actual del código

### Layout del equipo (NO TOCAR sin coordinación)
- `src/app/shared/presentation/components/dashboard-layout/` — sidebar naranja
- `src/app/shared/infrastructure/` — base-entity, base-response, base-assembler, base-api, base-api-endpoint
- Ya arreglé bug: `<ng-content/>` → `<router-outlet/>` en dashboard-layout
- Rutas: `/dashboard/sales` carga `sales.routes.ts` lazy

### Mi código (Sales BC)
**Domain Layer:**
- `sale.entity.ts`, `sale-item.entity.ts`, `payment-receipt.entity.ts`
- `cash-register.entity.ts`, `product-summary.entity.ts`
- `payment-method.enum.ts`, `sale-status.enum.ts`, `caja-update-source.enum.ts`

**Infrastructure Layer:**
- `products-response.ts`, `product-assembler.ts`, `products-api-endpoint.ts`
- `sales-api.ts` (con getProducts, getProduct, getScaleStatus)

**Application Layer:**
- `sales-store.ts` (carga productos al iniciar, signals para products/loading/error)

**Presentation Layer:**
- `views/sales-page/` — página principal
- `components/quantity-modal/` — modal cantidad por unidad
- `components/weight-modal/` — modal cantidad por peso (con balanza IoT simulada)

### Funcionalidad implementada (Iteraciones 1-7)
- ✅ Buscador con autocompletado + validación "Producto no encontrado"
- ✅ Modal Registrar Cantidad con teclado numérico + validación stock
- ✅ Modal Registrar Peso con 2 modos:
  - Balanza IoT automática (lee de db.json + auto-confirma después de mostrar peso 800ms)
  - Manual con teclado decimal cuando connected:false
- ✅ Eliminar items del ticket
- ✅ Resumen lateral en tiempo real (subtotal, items, total)
- ✅ Selección método de pago (Efectivo / Tarjeta-Yape/Plin)
- ✅ Finalizar Venta con validaciones:
  - "No hay productos en el ticket" (auto-oculta 3s)
  - "Por favor, seleccione un método de pago" (auto-oculta 3s)
- ✅ Modal "Venta Exitosa" con auto-cierre 2s + opción X manual
- ✅ Reset del ticket después de venta exitosa

## Pendiente: Iteración 8 — Persistencia del Resumen de Caja

**Problema actual:** Total del Día / Efectivo / Digital se pierden al recargar.

**Solución:** Conectar con `cash-registers` del db.json:
1. Crear `cash-register-response.ts`, `cash-register-assembler.ts`, `cash-registers-api-endpoint.ts`
2. Agregar a `sales-api.ts`: `getTodayCashRegister()` y `updateCashRegister(data)`
3. En `sales-store.ts`: cargar cash-register del día al iniciar
4. Después de venta exitosa: llamar al PUT para persistir totales
5. Al volver a `/dashboard/sales`: re-cargar desde API

## db.json estructura
```json
{
  "products": "[8 productos peruanos: Arroz, Pollo, Coca Cola, Pan, Inca Kola, Queso, Galleta, Aceite]",
  "sales": "[ventas históricas]",
  "cash-registers": [
    { "id": 1, "date": "2026-05-10", "totalCash": 0, "totalDigital": 0 }
  ],
  "iot-scale": { "id": 1, "connected": true, "deviceId": "SCALE-001" }
}
```

## Environments
`environment.development.ts` y `environment.ts` tienen:
- `salesProviderApiBaseUrl: 'http://localhost:3000/api/v1'`
- `salesProviderSalesEndpointPath: '/sales'`
- `salesProviderProductsEndpointPath: '/products'`
- `salesProviderCashRegistersEndpointPath: '/cash-registers'`

## Comandos importantes
- Frontend: `ng serve --port 4200`
- JSON-Server: `json-server --watch server/db.json --routes server/routes.json`
- routes.json: `{"/api/v1/*": "/$1"}`

## Estilo de código
- Signals en lugar de RxJS donde sea posible
- Inyección con `inject()` (no constructor)
- Standalone components (no NgModules)
- DDD estricto: cada capa con su responsabilidad
- Nombres en inglés (código), traducciones en es.json/en.json

## Equipo y Git
- Repositorio en GitHub
- Trabajo en rama `feature/sales`
- Develop tiene el DashboardLayout base
- Avisar al equipo antes de tocar código compartido (shared/)
