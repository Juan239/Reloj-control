import fs from 'fs';
import { filterDataHelper } from '../utils/helpers.js';

let fileContent = null;

export const uploadFile = (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No se ha cargado ningún archivo.');
    }

    fs.readFile(file.path, 'utf8', (err, data) => {
        if (err) {
            console.error('Error leyendo el archivo', err);
            return res.status(500).send('Error leyendo el archivo');
        }

        fileContent = data;
        console.log('Archivo cargado y leído correctamente.');
        res.send('Archivo cargado y leído correctamente.');
    });
};

export const filterData = (req, res) => {
    const { startDate, endDate } = req.body;
    console.log(startDate, endDate);

    if (!fileContent || !startDate || !endDate) {
        return res.status(400).send('Faltan datos necesarios para filtrar.');
    }

    const filteredData = filterDataHelper(fileContent, startDate, endDate);

    if (filteredData.length === 0) {
        return res.status(404).send('No se encontraron datos en el rango de fechas seleccionado.');
    }

    res.json(filteredData);
};
