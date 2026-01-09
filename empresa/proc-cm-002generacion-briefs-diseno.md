--------------------------------------------------------------------------------
Metadatos del Proceso
id: PROC-CM-002 title: Generación Automatizada de Briefs de Diseño area: Operaciones (CM) responsable_rol:
• Community Manager estado: Activo fecha_creacion: 2025-09-16 fecha_revision: 2025-09-16 propietario: Pixely nocodb_relacion:
• Tasks
• FichasCliente
--------------------------------------------------------------------------------
Proceso: Generación Automatizada de Briefs de Diseño
Objetivo: Generar y asignar las tareas de diseño (Hilos de Trabajo) derivadas de las recomendaciones estratégicas (Q9), proporcionando al equipo creativo instrucciones claras y priorizadas directamente en la plataforma.
Activación del Proceso (Trigger)
Este proceso se activa una vez que el análisis Q9 (Recomendaciones) ha sido revisado y aprobado por el Community Manager (PROC-CM-001).
Pasos a Seguir
1. Generación Automática de Hilos de Trabajo:
    ◦ En el Dashboard de Pixely Partners, navegar a la sección "Recomendaciones (Q9)".
    ◦ Ejecutar la acción "Generar Hilos de Trabajo".
    ◦ El sistema convertirá las recomendaciones estratégicas en registros de la tabla Tasks, asignando automáticamente:
        ▪ title: Título de la acción.
        ▪ description: Brief inicial (descripción detallada de 5 líneas).
        ▪ area_estrategica: Pilar de contenido asociado.
        ▪ urgencia / prioridad: Basado en el impacto calculado.
2. Refinamiento y Planificación (Semanal):
    ◦ El CM revisa las tareas generadas en la vista de Kanban o Lista.
    ◦ Edición del Brief: Si es necesario, enriquecer el campo description con detalles específicos para el diseñador (referencias visuales, textos obligatorios).
    ◦ Asignación Temporal: Asignar cada tarea a una semana específica del ciclo (week: 1, 2, 3, 4) para balancear la carga de trabajo.
3. Activación de Tareas:
    ◦ Cambiar el estado de las tareas validadas de PENDIENTE a ASIGNADO (o el estado equivalente en el flujo de trabajo).
    ◦ Esto notificará automáticamente al equipo de diseño (o aparecerá en su Dashboard de tareas pendientes).
Quién y Cuándo
• Responsable Principal: Community Manager.
• Plazo: La generación y asignación de tareas debe realizarse dentro de las 24 horas siguientes a la aprobación de la estrategia.
Recursos
• Dashboard de Tareas (Kanban): [Link al Dashboard]
• Modelo de Datos: api_models_tasks.py (Estructura de Task).