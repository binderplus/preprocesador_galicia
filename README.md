# [Preprocesador de reportes de conciliación de Galicia](https://pregal.binderplus.com.ar/)

Este proyecto modifica el reporte de movimientos del Galicia para facilitar su importación a Odoo.

Específicamente, hace lo siguiente:
 - Elimina filas vacías
 - Elimina movimientos en estado Pendiente. Esto se podría hacer desde un filtro en el Office Banking si no fuese porque eso pone la columna saldo en 0.
 - Agrega al final la columna «Referencia», que Odoo importa en el campo Referencia del movimiento. Para los tipos de movimiento que no traen la palabra «Transferencia» (por ejemplo «Transferencias Cash Proveedores» o «Trf Inmed Proveed») pone `Transferencia`, y para los eCheq «G. De Echeq Galicia Q …» pone el número de cheque con 8 dígitos. Así coincide con el nombre de la línea del pago o recibo y la conciliación automática puede validar el movimiento. Las reglas están en `src/reglasReferencia.js`.