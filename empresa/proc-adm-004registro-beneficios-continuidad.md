--------------------------------------------------------------------------------
Metadatos del Proceso
id: PROC-ADM-004 title: Registro de Beneficios por Continuidad area: Administración responsable_rol:
• Administrador estado: Activo fecha_creacion: 2025-09-16 fecha_revision: 2025-09-16 propietario: Pixely nocodb_relacion:
• Clientes
• Control de Beneficios
--------------------------------------------------------------------------------
Proceso: Registro de Beneficios por Continuidad
Objetivo: Determinar qué clientes son aptos para recibir beneficios por continuidad, coordinar la selección de estos con el cliente y registrar su correcta asignación en un único control.
Activación del Proceso (Trigger)
Este es un proceso periódico. Durante la primera semana de cada mes, el Administrador debe revisar la tabla Clientes para identificar a todos aquellos que están cumpliendo su tercer mes de servicio.
Pasos a Seguir
1. Identificación de Clientes Elegibles:
    ◦ Filtrar la tabla Clientes para encontrar aquellos que cumplen 3 meses de antigüedad el día 01 del mes en curso.
    ◦ Verificar el plan del cliente (Lite, Basic, Pro) para determinar la cantidad de beneficios que le corresponden.
2. Notificación y Selección por parte del Cliente:
    ◦ Contactar a cada cliente elegible.
    ◦ Presentarle la lista de beneficios disponibles y solicitarle que elija la cantidad que le corresponde según su plan.
    ◦ Cantidad de Beneficios por Plan:
        ▪ Lite: 1 beneficio.
        ▪ Basic: 3 beneficios.
        ▪ Pro: 5 beneficios.
    ◦ Lista de Beneficios Disponibles:
        ▪ Estudios de mercado gratuitos.
        ▪ Publicaciones adicionales sin costo.
        ▪ Optimización de estrategia.
        ▪ Consultoría en modelo de negocio.
        ▪ Asesoría en Meta Ads.
        ▪ Análisis de competidores.
3. Registro Centralizado de Beneficios:
    ◦ Una vez que el cliente ha elegido, crear un único registro en la tabla Control de Beneficios, llenando las casillas correspondientes a los beneficios seleccionados.
    ◦ Notificar al equipo operativo sobre el nuevo registro para que coordinen la entrega.
Quién y Cuándo
• Responsable Principal: Administrador.
• Plazo: La identificación y notificación al cliente debe realizarse durante los primeros 5 días hábiles de cada mes.
Proceso Siguiente
• Este es el último proceso de la cadena principal del ciclo de vida del cliente. Las acciones posteriores corresponden a la gestión operativa del servicio.