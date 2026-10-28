// Reglas para la columna «Referencia». En Odoo la conciliación automática solo valida
// un movimiento si algún texto coincide exactamente con el nombre de la línea del pago
// o recibo (casi siempre «Transferencia»), así que acá se completa ese texto para los
// tipos de movimiento del Galicia que no lo traen.
//
// Cada regla tiene:
//  - sentido: 'credito' o 'debito'
//  - prefijo (string, sin distinguir mayúsculas) o regex (se prueba contra la descripción normalizada)
//  - valor: string, o función que recibe el resultado de la regex y devuelve el string

export const CREDITO = 'credito'
export const DEBITO = 'debito'

export const REGLAS = [
    {sentido: CREDITO, prefijo: 'Transferencias Cash Proveedores', valor: 'Transferencia'},
    {sentido: CREDITO, prefijo: 'Servicio Pago A Proveedores', valor: 'Transferencia'},
    {sentido: CREDITO, prefijo: 'Snp Pago A Proveedores', valor: 'Transferencia'},
    {sentido: CREDITO, prefijo: 'Transf.fondos Entre Bancos-recibida', valor: 'Transferencia'},
    {
        sentido: CREDITO,
        regex: /^G\. De Echeq Galicia Q\s*(\d+)/i,
        valor: (match) => match[1].padStart(8, '0'),
    },
    {sentido: DEBITO, prefijo: 'Trf Inmed Proveed', valor: 'Transferencia'},
    {sentido: DEBITO, prefijo: 'Pago De Servicios', valor: 'Transferencia'},
    {sentido: DEBITO, prefijo: 'Deb. Autom. De Serv.', valor: 'Transferencia'},
]

export function calcularReferencia(row, reglas = REGLAS) {
    const sentido = obtenerSentido(row)
    if (!sentido) return ''

    const descripcion = normalizarEspacios(row['Descripción'])

    for (const regla of reglas) {
        if (regla.sentido !== sentido) continue

        let match = null
        if (regla.regex) {
            match = descripcion.match(regla.regex)
            if (!match) continue
        } else if (!descripcion.toLowerCase().startsWith(normalizarEspacios(regla.prefijo).toLowerCase())) {
            continue
        }

        return typeof regla.valor === 'function' ? regla.valor(match) : regla.valor
    }

    return ''
}

function obtenerSentido(row) {
    const credito = parsearImporte(row['Créditos'])
    const debito = parsearImporte(row['Débitos'])

    if (credito !== 0 && debito === 0) return CREDITO
    if (debito !== 0 && credito === 0) return DEBITO
    return null
}

// Acepta números o texto con coma decimal (p. ej. "1.234,56"). Vacío o inválido cuenta como 0.
export function parsearImporte(valor) {
    if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0
    if (typeof valor !== 'string') return 0

    let texto = valor.replace(/[\s$]/g, '')
    if (texto.includes(',')) texto = texto.replace(/\./g, '').replace(',', '.')

    const numero = Number(texto)
    return Number.isFinite(numero) ? numero : 0
}

function normalizarEspacios(texto) {
    return String(texto ?? '').trim().replace(/\s+/g, ' ')
}
