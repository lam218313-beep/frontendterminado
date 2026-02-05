# Plan Access Configuration

Configure qué features tiene acceso cada plan. Edita este archivo y los cambios se reflejarán en la app.

---

## Planes Disponibles

| Plan | Descripción |
|------|-------------|
| `free_trial` | Prueba gratis (30 días) |
| `lite` | Plan básico |
| `basic` | Plan estándar |
| `pro` | Plan profesional |
| `premium` | Plan completo |

---

## Acceso por Feature

### Paneles del Workflow

| Feature ID | Descripción | Planes con Acceso |
|------------|-------------|-------------------|
| `entrevista` | Formulario de entrevista inicial | free_trial, lite, basic, pro, premium |
| `brand` | Brand Book / Manual de Marca | basic, pro, premium |
| `analisis_basico` | Lab - Vista básica | free_trial, lite, basic, pro, premium |
| `analisis_completo` | Lab - Análisis completo con IA | basic, pro, premium |
| `estrategia` | Mapa estratégico | pro, premium |
| `validacion` | Validación de contenido | pro, premium |
| `planificacion` | Plan de contenido | basic, pro, premium |

---

### Beneficios (BenefitsView)

| Benefit ID | Descripción | Planes con Acceso |
|------------|-------------|-------------------|
| `benefit_1` | Generador de Posts IA | lite, basic, pro, premium |
| `benefit_2` | Calendario Editorial | basic, pro, premium |
| `benefit_3` | Banco de Ideas | basic, pro, premium |
| `benefit_4` | Reportes Automáticos | pro, premium |
| `benefit_5` | Soporte Prioritario | premium |

---

## Cómo Funciona

1. Los planes están ordenados de menor a mayor: `free_trial` < `lite` < `basic` < `pro` < `premium`
2. Si un usuario tiene plan `pro`, tiene acceso a todo lo que `pro` puede hacer, más todo lo de planes inferiores **que estén listados**
3. El sistema verifica `planExpiresAt` - si expiró, trata al usuario como `free_trial`

---

## Ejemplo de Uso

Para agregar un nuevo feature:

1. Define el `feature_id` único
2. Lista los planes que tienen acceso
3. Actualiza `usePlanAccess.ts` → `FEATURE_ACCESS`

```typescript
// En usePlanAccess.ts
const FEATURE_ACCESS: Record<string, string[]> = {
    mi_nuevo_feature: ['basic', 'pro', 'premium'],
    // ...
};
```

4. Usa en el componente:
```tsx
const { hasAccess, requiredPlanName } = usePlanAccess('mi_nuevo_feature');

{!hasAccess && <DemoModePopup viewId="mi_feature" requiredPlanName={requiredPlanName} />}
```
