--------------------------------------------------------------------------------
Metadatos del Proceso
id: PROC-DG-001 title: Recepción de Estrategia y Creación de Manual de Marca area: Diseño Gráfico responsable_rol:
• Community Manager
• Diseñador Gráfico estado: Activo fecha_creacion: 2025-09-16 fecha_revision: 2025-09-16 propietario: Pixely nocodb_relacion:
• Clientes
• Proyectos_Branding
--------------------------------------------------------------------------------
Proceso: Recepción de Estrategia y Creación de Manual de Marca
Objetivo: Asegurar una transición fluida de la estrategia de contenido al equipo de diseño, y establecer la línea gráfica a través de la creación y aprobación de un Manual de Marca para el cliente.
Activación del Proceso (Trigger)
Este proceso se activa una vez que el Community Manager ha completado el PROC-CM-001, teniendo listos los documentos de Estrategia y Cronograma, y habiendo cargado toda la información en la base de datos.
Pasos a Seguir
1. Handoff del Community Manager al Diseñador:
    ◦ El CM notifica al Diseñador Gráfico que un nuevo cliente está listo para la fase de diseño.
    ◦ El CM comparte el link a la carpeta de Drive que contiene los documentos de "Estrategia del Cliente" y "Cronograma del Cliente".
2. Revisión y Creación por parte del Diseñador:
    ◦ El Diseñador Gráfico revisa a fondo la estrategia para comprender los objetivos, la audiencia y el tono de la comunicación.
    ◦ Basado en este análisis, el Diseñador crea una propuesta de "Manual de Marca".
    ◦ El Diseñador sube el borrador del manual a la carpeta de "Manual de Marca" en Drive.
3. Registro y Notificación para Aprobación:
    ◦ El Diseñador crea un nuevo registro en la tabla Proyectos_Branding para llevar el control del estado del manual.
    ◦ Una vez registrado, el Diseñador notifica al CM que el manual está listo para su revisión.
4. Validación del Community Manager:
    ◦ El CM revisa la propuesta de Manual de Marca.
    ◦ Si se aprueba: El CM actualiza el Estado_Manual_Marca a "Aprobado" en la tabla Proyectos_Branding.
    ◦ Si requiere cambios: El CM deja comentarios o solicita una reunión con el Diseñador. El estado permanece "En Revisión" hasta que se suba una nueva versión.
Quién y Cuándo
• Responsable Principal: Diseñador Gráfico (para la creación), Community Manager (para la validación).
• Plazo: El Diseñador debe presentar la primera versión del Manual de Marca en un plazo de 48 horas hábiles tras recibir la notificación del CM.
Recursos
• Carpeta para Estrategia y Cronograma (Input): https://drive.google.com/drive/folders/1SAnxmlweN13vQqMX6AFC6DpFR0ZrTLFg?usp=sharing
• Carpeta para Manual de Marca (Output): https://drive.google.com/drive/folders/1Q4PCTFKDBxjjvwY9ID1Qb67O5mdG7ccQ?usp=sharing
Proceso Siguiente
• Una vez que el Manual de Marca está "Aprobado", el Diseñador Gráfico tiene luz verde para comenzar con la producción de las piezas gráficas definidas en el cronograma.
--------------------------------------------------------------------------------
Metadatos del Proceso
id: PROC-DG-002 title: Diseño de Publicaciones Mensuales area: Diseño Gráfico responsable_rol:
• Diseñador Gráfico estado: Activo fecha_creacion: 2025-09-16 fecha_revision: 2025-09-16 propietario: Pixely nocodb_relacion:
• Briefs_Diseno
--------------------------------------------------------------------------------
Proceso: Diseño de Publicaciones Mensuales
Objetivo: Diseñar y producir todas las piezas gráficas y audiovisuales definidas en el cronograma mensual, asegurando que cada pieza cumpla con el Manual de Marca, el Manual de Edición y los requerimientos específicos de su brief.
Activación del Proceso (Trigger)
Este proceso se activa una vez que el Community Manager ha completado el PROC-CM-002, notificando al Diseñador Gráfico que todos los briefs de diseño para el mes han sido generados y registrados.
Pasos a Seguir
1. Revisión Integral de Insumos (Inputs):
    ◦ El Diseñador debe analizar todos los documentos estratégicos y de marca antes de comenzar a diseñar:
        ▪ Manual de Marca Aprobado: Para entender la identidad visual.
        ▪ Estrategia y Cronograma: Para comprender el contexto y los objetivos de cada publicación.
        ▪ Brief por Publicación: Para conocer los requerimientos artísticos y técnicos específicos de cada pieza.
        ▪ Manual de Edición: Como guía técnica para la pre-edición y edición de imágenes y videos.
2. Producción de Piezas Gráficas:
    ◦ Diseñar cada una de las publicaciones listadas en la tabla Publicaciones, siguiendo al pie de la letra las indicaciones de su brief correspondiente.
    ◦ Aplicar las directrices técnicas del "Manual de Edición" en cada fase del diseño.
    ◦ Subir las piezas finales (borradores o versiones finales) a la carpeta de "Inputs del Diseñador".
3. Actualización del Estado en Base de Datos:
    ◦ Una vez que una pieza gráfica ha sido finalizada y subida a Drive, el Diseñador debe actualizar el registro correspondiente en la tabla Briefs_Diseno.
    ◦ Esta acción notifica al sistema que el diseño está listo para la siguiente fase (revisión por parte del CM).
Quién y Cuándo
• Responsable Principal: Diseñador Gráfico.
• Plazo: El plazo de entrega para cada pieza será el estipulado en el brief correspondiente.
Recursos
• Manual de Edición: Este documento contiene las guías técnicas para la producción.
• Carpeta de Inputs del Diseñador (Output): https://drive.google.com/drive/folders/18KRbPxfDg-cCB8mHWJfjS6HyyIlzajRo?usp=sharing
Proceso Siguiente
• Una vez que el estado de un brief cambia a "Diseño Finalizado", se activa el proceso de revisión y validación por parte del Community Manager antes de la publicación final.