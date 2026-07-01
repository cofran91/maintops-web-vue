# Vue Modules Refactor Recommendations

## Estado

Aplicado.

Este documento queda como registro de la ronda de refactorizacion aplicada sobre `src/modules`. Las recomendaciones pendientes del documento anterior fueron ejecutadas y ya no se mantienen como backlog activo.

## Cambios Aplicados

### Analytics

`src/modules/analytics/views/AnalyticsView.vue` quedo como orquestador de pagina.

Se agregaron:

- `src/modules/analytics/composables/useAnalyticsOverview.js`
- `src/modules/analytics/utils/analyticsFormatters.js`
- `src/modules/analytics/utils/analyticsLabels.js`
- `src/modules/analytics/components/AnalyticsFilters.vue`
- `src/modules/analytics/components/AnalyticsSummaryCards.vue`
- `src/modules/analytics/components/TechnicianEfficiencyPanel.vue`
- `src/modules/analytics/components/WorkshopBottlenecksPanel.vue`
- `src/modules/analytics/components/WorkloadForecastPanel.vue`
- `src/modules/analytics/components/RiskAlertsPanel.vue`
- `src/modules/analytics/components/RecommendationsPanel.vue`

### Workshops

`src/modules/workshops/views/WorkshopFormView.vue` conserva permisos, carga, submit y navegacion.

Se agregaron:

- `src/modules/workshops/composables/useWorkshopForm.js`
- `src/modules/workshops/composables/useWorkshopTechnicians.js`
- `src/modules/workshops/utils/workshopSchedule.js`
- `src/modules/workshops/components/WorkshopGeneralFields.vue`
- `src/modules/workshops/components/WorkshopVehicleSystemsField.vue`
- `src/modules/workshops/components/WorkshopScheduleField.vue`
- `src/modules/workshops/components/WorkshopFilters.vue`

### Maintenance Orders

El listado y detalle de ordenes quedaron separados por filtros, tabla, resumen, items y refresco realtime.

Se agregaron:

- `src/modules/maintenance-orders/components/MaintenanceOrderFilters.vue`
- `src/modules/maintenance-orders/components/MaintenanceOrdersTable.vue`
- `src/modules/maintenance-orders/components/MaintenanceOrderRowActions.vue`
- `src/modules/maintenance-orders/components/MaintenanceOrderSummary.vue`
- `src/modules/maintenance-orders/components/MaintenanceOrderItemsTable.vue`
- `src/modules/maintenance-orders/composables/useMaintenanceOrderRealtimeRefresh.js`
- `src/modules/maintenance-orders/composables/useMaintenanceOrderDetail.js`
- `src/modules/maintenance-orders/utils/orderListFormatters.js`
- `src/modules/maintenance-orders/utils/orderDetailFormatters.js`

### Filtros De Listados

Se extrajeron filtros de listados a componentes del dominio:

- `src/modules/workshops/components/WorkshopFilters.vue`
- `src/modules/vehicles/components/VehicleFilters.vue`
- `src/modules/maintenance-tasks/components/MaintenanceTaskFilters.vue`
- `src/modules/maintenance-plans/components/MaintenancePlanFilters.vue`
- `src/modules/users/components/UserFilters.vue`
- `src/modules/owners/components/OwnerFilters.vue`

### Multi-select Asincrono

`MaintenanceTaskMultiSelect.vue` quedo como wrapper del dominio.

Se agrego:

- `src/modules/shared/components/AsyncEntityMultiSelect.vue`

### Formularios Medianos

Se extrajeron secciones visuales de formularios:

- `src/modules/users/components/UserAccountFields.vue`
- `src/modules/users/components/UserRoleFields.vue`
- `src/modules/users/components/UserPasswordFields.vue`
- `src/modules/maintenance-tasks/components/MaintenanceTaskGeneralFields.vue`
- `src/modules/maintenance-tasks/components/MaintenanceTaskScopeFields.vue`
- `src/modules/maintenance-plans/components/MaintenancePlanGeneralFields.vue`
- `src/modules/maintenance-plans/components/MaintenancePlanTaskSelectionField.vue`

## Resultado De Tamano

Referencias despues del refactor:

| Archivo | Lineas aprox. |
| --- | ---: |
| `src/modules/analytics/views/AnalyticsView.vue` | 122 |
| `src/modules/maintenance-orders/views/MaintenanceOrderDetailView.vue` | 126 |
| `src/modules/maintenance-orders/views/MaintenanceOrdersListView.vue` | 292 |
| `src/modules/workshops/views/WorkshopFormView.vue` | 285 |
| `src/modules/maintenance-tasks/components/MaintenanceTaskMultiSelect.vue` | 86 |

Algunos listados siguen sobre 400 lineas porque todavia contienen tabla, import/export y modales. Ya no mezclan filtros largos dentro de la vista.

## Validacion

- `npm run build`: correcto.
- `npx eslint src`: correcto.
- `npx eslint .`: falla por errores existentes fuera de `src`, principalmente en `.laravel-guide` y `vite.config.js`.

## Seguimiento Recomendado

- Validar manualmente filtros avanzados en ordenes, workshops, vehicles, maintenance tasks y maintenance plans.
- Validar manualmente create/edit de workshops, users, maintenance tasks y maintenance plans.
- No partir `AsyncEntityCombobox.vue` por ahora; quedo como seguimiento condicionado si vuelve a crecer.
