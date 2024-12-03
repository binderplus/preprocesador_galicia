import './App.css'
import {FileHandler} from "./FileHandler.jsx";

function App() {

    return (
        <>
            <h1 className="title">
                Preprocesador de reportes de conciliación de Galicia
            </h1>

            <p className="read-the-docs">
                Cargue el reporte de movimientos del Galicia para obtener un reporte modificado apto para importar a Odoo.

                Para un correcto funcionamiento, configure el reporte para que incluya todas las columnas. <a href="https://github.com/binderplus/preprocesador_galicia/">Más información.</a>
            </p>

            <FileHandler/>

        </>
    )
}

export default App
