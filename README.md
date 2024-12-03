# [Preprocesador de reportes de conciliación de Galicia](https://pregal.binderplus.com.ar/)

Este proyecto modifica el reporte de movimientos del Galicia para facilitar su importación a Odoo.

Específicamente, hace lo siguiente:
 - Elimina filas vacías
 - Elimina movimientos en estado Pendiente. Esto se podría hacer desde un filtro en el Office Banking si no fuese porque eso pone la columna saldo en 0.