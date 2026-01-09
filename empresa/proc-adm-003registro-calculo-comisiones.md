--------------------------------------------------------------------------------
Metadatos del Proceso
id: PROC-ADM-003 title: Registro y Cálculo de Comisiones area: Administración responsable_rol:
• Administrador estado: Activo fecha_creacion: 2025-09-16 fecha_revision: 2025-09-16 propietario: Pixely nocodb_relacion:
• Clientes
• Pagos
• Comisiones
• Trabajadores
--------------------------------------------------------------------------------
Proceso: Registro y Cálculo de Comisiones
Objetivo: Calcular y registrar de manera precisa y oportuna la comisión correspondiente a un vendedor cada vez que un cliente captado por él realiza un pago.
Activación del Proceso (Trigger)
Este proceso se activa inmediatamente después de que un pago es verificado y registrado en la tabla Pagos (según PROC-ADM-002), siempre y cuando el cliente esté asociado a un vendedor.
Pasos a Seguir
1. Identificación de la Venta:
    ◦ Tras registrar un nuevo pago, identificar al cliente y al vendedor asociado a través de la tabla Clientes.
2. Recopilación de Datos para el Cálculo:
    ◦ Obtener los tres datos clave para el cálculo de la comisión:
        ▪ Precio Máximo: El precio de lista oficial del servicio.
        ▪ Precio Mínimo: El precio más bajo autorizado para la venta.
        ▪ Precio Final de Negociación: El monto que el cliente pagó, registrado en su contrato y en la tabla Pagos.
3. Aplicación del Esquema de Comisiones:
    ◦ Aplicar la fórmula de comisiones vigente utilizando las tres variables de precio recopiladas.
    ◦ Nota: La fórmula y las reglas específicas del esquema de comisiones se encuentran detalladas en el anexo ANX-FIN-001: Esquema de Comisiones Vigente].
4. Registro en la Base de Datos:
    ◦ Crear un nuevo registro en la tabla Comisiones con el resultado del cálculo y toda la información de referencia.
Quién y Cuándo
• Responsable Principal: Administrador.
• Plazo: La comisión debe ser calculada y registrada en un máximo de 48 horas hábiles después de la confirmación del pago.
Proceso Siguiente
• Una vez registrada la comisión, el siguiente proceso en la cadena del ciclo de vida del cliente es: PROC-ADM-004: Registro de Beneficios por Continuidad.