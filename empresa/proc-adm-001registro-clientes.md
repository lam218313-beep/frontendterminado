--------------------------------------------------------------------------------
Metadatos del Proceso
id: PROC-ADM-001 title: Registro de Clientes area: Administración responsable_rol:
• Administrador estado: Activo fecha_creacion: 2025-09-16 fecha_revision: 2025-09-16 propietario: Pixely nocodb_relacion:
• Clientes
• FichasCliente (Solo Premium)
--------------------------------------------------------------------------------
Proceso: Registro de Clientes
Objetivo: Ingresar la información de los nuevos clientes de forma precisa y organizada en la base de datos de operaciones para asegurar un inicio de servicio correcto.
Pasos a Seguir
1. Recepción de Ficha de Registro:
    ◦ El rol comercial correspondiente entrega la "Ficha de Registro de Cliente" completa.
    ◦ Todas las fichas de registro se encuentran en la siguiente ubicación central: https://drive.google.com/drive/folders/1J2EZZycnXH1fSOt_YkzYwNVJMQWAaTaQ?usp=sharing
2. Verificación de Datos:
    ◦ Revisar que todos los campos de la ficha estén completos y sean correctos, según el formato establecido.
3. Ingreso en la Base de Datos de Operaciones:
    ◦ Registrar toda la información del cliente en la tabla Clientes. Este registro debe ser inequívoco y corresponder a los campos de la ficha.
4. Registro en Sistema Pixely Partners (Solo Planes Premium/Partners):
    ◦ Condición: Este paso aplica exclusivamente si el cliente ha contratado el Plan Premium o el servicio de "Pixely Partners".
    ◦ Acción: Registrar los datos técnicos de la marca en la tabla FichasCliente del sistema de Inteligencia de Mercado. Esto habilitará el acceso al Dashboard y a los análisis Q1-Q10.
    ◦ Datos Requeridos (Insumos Técnicos):
        ▪ brand_name: Nombre comercial de la marca.
        ▪ industry: Industria o sector del mercado.
        ▪ brand_archetype: Arquetipo de marca inicial (hipótesis).
        ▪ tone_of_voice: Tono de voz deseado.
        ▪ target_audience: Descripción del público objetivo.
        ▪ competitors: Lista de competidores directos (para monitoreo).
        ▪ tenant_id: ID de la organización (Agencia).
Quién y Cuándo
• Responsable Principal: Administrador.
• Participantes: Rol Comercial.
• Plazo: La información debe ser registrada en un máximo de 24 horas hábiles desde la recepción de la ficha.
Proceso Siguiente
• Una vez completado el registro del cliente en la base de datos, se debe iniciar el playbook: PROC-ADM-002: Formalización de Cliente (Contrato y Pago).