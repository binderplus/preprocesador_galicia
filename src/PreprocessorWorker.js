import {read, write, utils} from "xlsx";
import {calcularReferencia} from "./reglasReferencia.js";

const COLUMNA_REFERENCIA = 'Referencia'

self.addEventListener('unhandledrejection', function (event) {
    throw event.reason;
});

onmessage = async function (event) {
    const inputFile = event.data
    const [inFileName, inFileExtension] = getNameAndExtension(inputFile);

    const wb = read(await inputFile.arrayBuffer(), {type: "array", cellDates: true})
    const sheet = wb.SheetNames[0];
    let data = utils.sheet_to_json(wb.Sheets[sheet], {});

    data = processData(data)

    wb.Sheets[sheet] = utils.json_to_sheet(data, {header: getHeader(data), cellDates: true, dateNF: 'dd"/"mm"/"yyyy'});
    const outFile = new File(
        [write(wb, {bookType: inFileExtension, type: "array", FS: ";"})],
        `${inFileName}.procesado.${inFileExtension}`,
        {type: inputFile.type}
    )
    postMessage(outFile)
}

function processData(data) {
    let outData = []

    console.log("IN: ", data)

    for (let row of data) {
        const replacementRows = getReplacementRows(row)
        outData.push(...replacementRows)
    }

    console.log("OUT: ", outData)
    return outData
}

function getReplacementRows(row) {
    // Filtra filas vacías o no imputadas
    if ((!('Tipo de movimiento' in row) || (row['Tipo de movimiento'] !== 'Imputado'))) return []

    if (!('ID de movimiento' in row)) throw new Error('El extracto debe incluir la columna "ID de movimiento"')

    return [{...row, [COLUMNA_REFERENCIA]: calcularReferencia(row)}]
}

// Mismo orden de columnas que armaría json_to_sheet, pero con «Referencia» siempre presente y al final
function getHeader(data) {
    const header = new Set()
    for (const row of data) {
        for (const key of Object.keys(row)) {
            if (key !== COLUMNA_REFERENCIA) header.add(key)
        }
    }
    return [...header, COLUMNA_REFERENCIA]
}

function getNameAndExtension(file) {
    const path = file.name

    const path_arr = path.split(".")
    const name = path_arr.slice(0, path_arr.length - 1).join(".")
    const extension = path_arr[path_arr.length - 1];

    return [name, extension]

}