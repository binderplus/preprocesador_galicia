import {test} from 'node:test'
import assert from 'node:assert/strict'
import {calcularReferencia, parsearImporte} from './reglasReferencia.js'

const credito = (descripcion, importe = 1000) => ({'Descripción': descripcion, 'Créditos': importe, 'Débitos': 0})
const debito = (descripcion, importe = 1000) => ({'Descripción': descripcion, 'Créditos': 0, 'Débitos': importe})

test('eCheq Galicia: completa el número con ceros hasta 8 dígitos', () => {
    assert.equal(calcularReferencia(credito('G. De Echeq Galicia Q    13380')), '00013380')
    assert.equal(calcularReferencia(credito('G. De Echeq Galicia Q      36')), '00000036')
})

test('eCheq Galicia: no toca números de 8 dígitos o más', () => {
    assert.equal(calcularReferencia(credito('G. De Echeq Galicia Q 12345678')), '12345678')
    assert.equal(calcularReferencia(credito('G. De Echeq Galicia Q 123456789')), '123456789')
})

test('créditos que se marcan como Transferencia', () => {
    assert.equal(calcularReferencia(credito('Transferencias Cash Proveedores')), 'Transferencia')
    assert.equal(calcularReferencia(credito('Servicio Pago A Proveedores')), 'Transferencia')
    assert.equal(calcularReferencia(credito('Snp Pago A Proveedores')), 'Transferencia')
    assert.equal(calcularReferencia(credito('Transf.fondos Entre Bancos-recibida')), 'Transferencia')
})

test('débitos que se marcan como Transferencia', () => {
    assert.equal(calcularReferencia(debito('Trf Inmed Proveed')), 'Transferencia')
    assert.equal(calcularReferencia(debito('Pago De Servicios')), 'Transferencia')
    assert.equal(calcularReferencia(debito('Deb. Autom. De Serv.')), 'Transferencia')
})

test('tipos sin regla quedan vacíos', () => {
    assert.equal(calcularReferencia(debito('Servicio Acreditamiento De Haberes')), '')
    assert.equal(calcularReferencia(credito('G.de Echeq   Q00000716 Bol38578441')), '')
    assert.equal(calcularReferencia(debito('Transf. Afip')), '')
    assert.equal(calcularReferencia(credito('Acreditamiento Canje Galicia')), '')
})

test('la regla solo aplica en el sentido indicado', () => {
    assert.equal(calcularReferencia(credito('Trf Inmed Proveed')), '')
    assert.equal(calcularReferencia(debito('Transferencias Cash Proveedores')), '')
    assert.equal(calcularReferencia(debito('G. De Echeq Galicia Q 13380')), '')
})

test('ignora mayúsculas y espacios de más en la descripción', () => {
    assert.equal(calcularReferencia(credito('  TRANSFERENCIAS   cash proveedores  ')), 'Transferencia')
    assert.equal(calcularReferencia(debito('Trf Inmed Proveed 30-12345678-9')), 'Transferencia')
    assert.equal(calcularReferencia(credito('g. de echeq galicia q 77')), '00000077')
})

test('acepta importes como texto con coma decimal', () => {
    const row = {'Descripción': 'Trf Inmed Proveed', 'Créditos': '0,00', 'Débitos': '1.234,56'}
    assert.equal(calcularReferencia(row), 'Transferencia')
})

test('sin importes no hay sentido y queda vacío', () => {
    assert.equal(calcularReferencia({'Descripción': 'Trf Inmed Proveed'}), '')
    assert.equal(calcularReferencia({'Descripción': 'Trf Inmed Proveed', 'Créditos': '', 'Débitos': ''}), '')
})

test('parsearImporte', () => {
    assert.equal(parsearImporte(1500.5), 1500.5)
    assert.equal(parsearImporte('1.234,56'), 1234.56)
    assert.equal(parsearImporte('-50,00'), -50)
    assert.equal(parsearImporte('0,00'), 0)
    assert.equal(parsearImporte(''), 0)
    assert.equal(parsearImporte(undefined), 0)
})
