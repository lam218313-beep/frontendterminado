--------------------------------------------------------------------------------
Metadatos del Proceso
id: PROC-CM-001 title: Ejecución de Diagnóstico Inicial y Carga de Datos area: Operaciones (CM) responsable_rol:
• Community Manager estado: Activo fecha_creacion: 2025-09-16 fecha_revision: 2025-09-16 propietario: Pixely nocodb_relacion:
• Clientes
• FichasCliente
• SocialMediaPost
• SocialMediaInsight
--------------------------------------------------------------------------------
Proceso: Ejecución de Diagnóstico Inicial y Carga de Datos
Objetivo: Recopilar la información fundamental del negocio y ejecutar el pipeline de análisis de Inteligencia Artificial (Orchestrator Q1-Q10) en la plataforma Pixely Partners para generar la estrategia basada en datos.
Activación del Proceso (Trigger)
Este proceso se activa al recibir la notificación del Administrador de que un nuevo cliente ha completado su formalización (pago inicial registrado) y su FichaCliente ha sido creada.
Pasos a Seguir
1. Agendar y Realizar Entrevista Guiada:
    ◦ Contactar al cliente en un plazo máximo de 24 horas para agendar la llamada de diagnóstico.
    ◦ En la llamada, realizar la entrevista utilizando el "Formulario Inicial Pixely" para validar los datos técnicos ya registrados (Arquetipo, Tono de Voz, Competidores).
    ◦ Output: Confirmación de los parámetros de la FichaCliente.
2. Ingesta de Datos Históricos (Data Ingestion):
    ◦ Acceder al módulo de "Ingesta de Datos" en el Dashboard de Pixely Partners.
    ◦ Cargar el historial de publicaciones de la marca (últimos 3-6 meses) en la tabla SocialMediaPost.
    ◦ Esto se puede realizar mediante:
        ▪ Conexión API directa (si las credenciales están disponibles).
        ▪ Carga masiva de CSV/Excel con los campos: post_url, content_text, post_date, likes, comments_count.
3. Ejecución del Orchestrator (Análisis Q1-Q10):
    ◦ Desde el Dashboard, navegar a la sección de "Análisis" del cliente.
    ◦ Iniciar el proceso de "Ejecución Completa (Full Run)".
    ◦ El sistema ejecutará secuencialmente los módulos de IA:
        ▪ Q1-Q2: Análisis de Emociones y Personalidad de Marca.
        ▪ Q3-Q8: Tópicos, Narrativas, Influenciadores, Oportunidades, Sentimiento, Temporalidad.
        ▪ Q9: Generación de Recomendaciones Estratégicas.
        ▪ Q10: Generación del Resumen Ejecutivo.
4. Revisión y Validación de Insights (SocialMediaInsight):
    ◦ Una vez finalizado el análisis (Estado: completed), revisar los resultados en el Dashboard:
        ▪ Verificar que la Personalidad de Marca (Q2) detectada coincida con la deseada.
        ▪ Revisar las Recomendaciones (Q9) generadas por el sistema.
    ◦ Si los resultados son coherentes, aprobar el análisis para su uso en la generación de contenido.
Quién y Cuándo
• Responsable Principal: Community Manager.
• Plazo: El proceso completo, desde la entrevista hasta la validación de insights, debe finalizarse en un máximo de 72 horas hábiles.
Recursos
• Plataforma Pixely Partners: [Link al Dashboard]
• Módulo de Ingesta: [Link a Ingesta]
• Documentación Técnica: api_models.py (Referencia de estructura de datos).