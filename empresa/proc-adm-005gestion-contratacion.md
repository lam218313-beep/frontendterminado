--------------------------------------------------------------------------------
Metadatos del Proceso
id: PROC-ADM-005 title: Gestión de Contratación de Personal area: Administración responsable_rol:
• Administrador estado: Activo fecha_creacion: 2025-09-16 fecha_revision: 2025-09-16 propietario: Pixely nocodb_relacion:
• Convocatorias
• Candidatos
--------------------------------------------------------------------------------
Proceso: Gestión de Contratación de Personal
Objetivo: Gestionar el proceso completo de captación, evaluación y contratación de nuevos colaboradores de manera ordenada, utilizando un sistema de control basado en dos tablas relacionales.
Activación del Proceso (Trigger)
Este proceso se activa cuando surge la necesidad de cubrir una o más vacantes para un puesto de trabajo.
Flujo del Proceso y Estructura de Datos
El proceso se gestiona a través de dos tablas interconectadas en la base de datos de operaciones.
--------------------------------------------------------------------------------
1. Creación de la Convocatoria
• Descripción: El primer paso es abrir una nueva convocatoria para el puesto requerido. Esto crea el registro principal al cual se asociarán todos los candidatos.
• Acción: Crear un único registro en la tabla Convocatorias.
• Headers Conceptuales Convocatorias:
    ◦ ID_Convocatoria: Identificador único (Ej: SEO-003).
    ◦ Puesto: Nombre del rol a contratar.
    ◦ Estado_Convocatoria: (Abierta, En Entrevistas, Cerrada).
    ◦ Link_Publicacion_1: Link al anuncio de trabajo.
    ◦ Link_Publicacion_2: Link a otro anuncio.
    ◦ Fecha_Apertura: Cuándo se publicó.
    ◦ Fecha_Cierre: Límite para recibir postulaciones.
--------------------------------------------------------------------------------
2. Registro y Seguimiento de Candidatos
• Descripción: A medida que los postulantes envían sus CVs, se registra a cada uno en la tabla Candidatos, vinculándolo a la convocatoria correspondiente.
• Acción: Crear un registro por cada candidato en la tabla Candidatos.
• Headers Conceptuales Candidatos:
    ◦ ID_Candidato: Identificador único del postulante.
    ◦ ID_Convocatoria: Vincula al candidato con la convocatoria correcta.
    ◦ Nombre_Candidato: Nombre completo.
    ◦ CV: Link al currículum.
    ◦ Estado_Proceso: (Recibido, En Revisión, Entrevistado, Descartado, Contratado).
    ◦ Fecha_Entrevista.
    ◦ Estado_Contrato: (Pendiente, Enviado, Firmado).
    ◦ Fecha_Incorporacion.
    ◦ Observaciones.
Quién y Cuándo
• Responsable Principal: Administrador.
• Plazo: El registro de candidatos debe realizarse a medida que se reciben las postulaciones. El estado del proceso debe actualizarse después de cada fase (ej: después de las entrevistas).