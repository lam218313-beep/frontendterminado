--------------------------------------------------------------------------------
Metadatos del Proceso
id: PROC-ADM-002 title: Formalización de Cliente (Contrato y Pago) area: Administración responsable_rol:
• Administrador estado: Activo fecha_creacion: 2025-09-16 fecha_revision: 2025-09-16 propietario: Pixely nocodb_relacion:
• Clientes
• Pagos
--------------------------------------------------------------------------------
Proceso: Formalización de Cliente (Contrato y Pago)
Objetivo: Formalizar el acuerdo comercial con el cliente a través de la gestión de su contrato y asegurar el registro correcto de su pago inicial para dar comienzo oficial al servicio.
Procedimientos por Evento
Este proceso se activa mediante dos eventos clave que ocurren después del registro inicial del cliente (PROC-ADM-001).
--------------------------------------------------------------------------------
1. Al Recibir el Contrato Firmado
• Descripción: Una vez que el cliente devuelve el contrato debidamente firmado, se debe registrar el documento en la base de datos para mantener un registro centralizado.
• Pasos a Seguir:
    1. Verificar que el contrato esté correctamente firmado por ambas partes.
    2. Subir el documento a la carpeta de contratos correspondiente.
    3. Obtener el link del archivo subido.
    4. Actualizar el registro del cliente en la tabla Clientes con el link del contrato.
    5. Notificar al Community Manager (CM) asignado que el cliente ha completado su formalización y que puede iniciar el PROC-CM-001: Ejecución de Diagnóstico Inicial en un plazo máximo de 24 horas.**
--------------------------------------------------------------------------------
2. Al Recibir el Comprobante de Pago (Voucher)
• Descripción: El cliente tiene 24 horas después de firmar el contrato para realizar el pago. Al recibir el comprobante, se debe registrar la transacción.
• Pasos a Seguir:
    1. Verificar que el monto del comprobante coincida con el precio negociado.
        ▪ Nota para Planes Premium: Si el cliente contrató el plan Premium o el add-on "Pixely Partners", verificar que el monto incluya el fee correspondiente a la licencia de la plataforma.
    2. Subir una copia del comprobante a la carpeta de pagos.
    3. Crear un nuevo registro en la tabla Pagos con toda la información de la transacción.
--------------------------------------------------------------------------------
Recursos
• Carpeta de Contratos: https://drive.google.com/drive/folders/1btmPLlCqrix0Gj0Vx0AXbGHvD1_bv8Qp?usp=sharing
• Carpeta de Pagos (Vouchers): https://drive.google.com/drive/folders/1Ja4g6Y25q7eLZYjyo1CrAFe_mrp7RmJb?usp=sharing
Proceso Siguiente
• Una vez que el contrato está registrado y el pago inicial verificado, se debe iniciar el playbook: PROC-ADM-003: Coordinación Interna para Kick-Off.