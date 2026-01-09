--------------------------------------------------------------------------------
Metadatos del Proceso
id: PROC-ADM-006 title: Atención al Cliente y Reclamos area: Administración responsable_rol:
• Administrador estado: Activo fecha_creacion: 2025-09-16 fecha_revision: 2025-09-16 propietario: Pixely nocodb_relacion:
• Clientes
• Tickets
--------------------------------------------------------------------------------
Proceso: Atención al Cliente y Reclamos
Objetivo: Brindar atención oportuna a los clientes, gestionando sus consultas y reclamos de manera eficiente a través de un sistema centralizado de tickets para asegurar su resolución en los plazos establecidos.
Activación del Proceso (Trigger)
Este proceso se activa cada vez que se recibe una consulta, solicitud o reclamo por parte de un cliente a través de los canales de comunicación oficiales (correo electrónico, WhatsApp Business).
Pasos a Seguir
1. Recepción y Análisis Inicial:
    ◦ Recibir la comunicación del cliente.
    ◦ Realizar un análisis rápido para determinar el Tipo_Incidencia (Consulta, Reclamo, Sugerencia) y la Prioridad (Baja, Media, Alta).
2. Registro del Ticket en la Base de Datos:
    ◦ Crear un nuevo registro en la tabla Tickets con toda la información disponible sobre el caso. Es crucial registrar cada interacción para mantener un historial completo.
3. Gestión y Resolución:
    ◦ Asignar el ticket al responsable correspondiente si no es el Administrador.
    ◦ Gestionar o coordinar las acciones necesarias para solucionar el caso.
    ◦ Mantener comunicación con el cliente utilizando las plantillas de respuesta estandarizadas.
4. Cierre del Ticket:
    ◦ Una vez que el caso ha sido resuelto y el cliente ha confirmado su conformidad, actualizar el registro en la tabla Tickets.
    ◦ Cambiar el Estado a "Resuelto" y registrar la Fecha_Resolucion.
Quién y Cuándo
• Responsable Principal: Administrador.
• Plazo: Se debe dar una primera respuesta al cliente en un plazo máximo de 24 horas. La resolución completa del caso debe buscarse en un plazo máximo de 48 horas hábiles.
Recursos
• Las plantillas de comunicación para cada tipo de incidencia se encuentran detalladas en el anexo: ANX-COM-001: Plantillas de Comunicación con Clientes.