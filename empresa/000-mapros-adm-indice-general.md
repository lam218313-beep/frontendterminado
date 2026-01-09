--------------------------------------------------------------------------------
Metadatos del Documento
id: MAPROS-INDEX title: Flujo de Trabajo General y Manual de Procesos (MAPROS) area: General responsable_rol:
• Administrador estado: Activo fecha_creacion: 2025-09-16 fecha_revision: 2025-09-16 propietario: Pixely
--------------------------------------------------------------------------------
Flujo de Trabajo General y Manual de Procesos (MAPROS)
Objetivo: Describir la arquitectura del sistema de operaciones de la agencia, servir como índice central para todos los procesos documentados y establecer las directrices para la gestión del conocimiento y la operativa diaria.
1. Arquitectura del Sistema
El sistema operativo de la agencia se fundamenta en dos componentes principales que trabajan en conjunto, orquestados por un asistente de IA (chatbot):
• Base de Conocimiento (RAG): Construida sobre una serie de documentos estructurados (.md o "Playbooks"). Contiene el "cómo" y el "porqué" de nuestras operaciones. Es la fuente de verdad sobre nuestros procesos y metodologías.
• Base de Datos de Operaciones (NocoDB): Es el sistema transaccional que almacena el "qué" y el "quién". Contiene los datos en tiempo real de clientes, pagos, proyectos, etc. Su diseño está directamente dictado por las necesidades de los procesos definidos en el RAG.
2. Estructura de los Playbooks (.md)
Cada proceso está documentado en un archivo .md individual que sigue un formato estándar. Este formato incluye:
• Metadatos (YAML Frontmatter): Una cabecera con el ID, título, responsable y relaciones con las tablas de la BD.
• Objetivo: Una descripción clara del propósito del proceso.
• Pasos a Seguir: Las instrucciones detalladas para el usuario.
• Bloques de Acción (JSON): Instrucciones precisas y no ambiguas para la IA, que conectan el conocimiento del proceso con una acción específica en la Base de Datos de Operaciones.
--------------------------------------------------------------------------------
3. Índice de Procesos del Administrador
A continuación se detallan los procesos definidos para el rol de Administrador, clasificados por su naturaleza.
3.1 Flujo Principal (En Cadena): Ciclo de Vida del Cliente
Esta es la secuencia principal de acciones que ocurren desde que se capta un nuevo cliente hasta que se activan sus beneficios.
1. PROC-ADM-001: Registro de Clientes
    ◦ Descripción: Proceso para el ingreso inicial de los datos de un nuevo cliente en el sistema.
2. PROC-ADM-002: Formalización de Cliente (Contrato y Pago)
    ◦ Descripción: Gestión del contrato firmado y registro del pago inicial del cliente.
3. PROC-ADM-003: Registro y Cálculo de Comisiones
    ◦ Descripción: Cálculo y registro de la comisión generada por un pago de cliente.
4. PROC-ADM-004: Registro de Beneficios por Continuidad
    ◦ Descripción: Proceso para identificar y asignar los beneficios a clientes que cumplen 3 meses de servicio.
3.2 Procesos Independientes (Activados por Eventos)
Estos procesos no siguen una secuencia fija y se inician cuando ocurre un evento externo específico.
• PROC-ADM-005: Gestión de Contratación de Personal
    ◦ Descripción: Proceso para la gestión de vacantes, desde la publicación hasta la contratación de nuevos colaboradores.
• PROC-ADM-006: Atención al Cliente y Reclamos
    ◦ Descripción: Gestión centralizada de las consultas, reclamos y solicitudes de los clientes a través de un sistema de tickets.
3.3 Procesos Automatizados y Gobernanza
Los siguientes procesos manuales del MAPROS original han sido eliminados para ser reemplazados por automatizaciones y un sistema de mejora continua:
• Actualización de Base de Datos y Vencimientos
• Coordinación interna
• Evaluación de Desempeño Interno
La mejora continua del sistema se gestionará a través de una tabla de control externa, diseñada para el análisis y la crítica constructiva de los flujos de trabajo.
--------------------------------------------------------------------------------
4. Índice de Anexos
Esta sección centralizará los documentos de apoyo que contienen información detallada o plantillas.
• ANX-FIN-001: Esquema de Comisiones Vigente
• ANX-COM-001: Plantillas de Comunicación con Clientes