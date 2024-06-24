import fs from 'fs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import path from 'path';

import { getDataForId, calculateHoursWorked, getDayName } from '../utils/helpers.js';

const rutaDestino = "/Users/Juan/Desktop";

export const generatePdf = (req, res) => {
    const { id, startDate, endDate, nombreArchivo } = req.body;

    if (!nombreArchivo || !id || !startDate || !endDate) {
        return res.status(400).send('Faltan datos necesarios para generar el PDF.');
    }
    
    try {
        
        const fileContent = fs.readFileSync(`./src/uploads/${nombreArchivo}`, 'utf8');

        if (!fileContent) {
            return res.status(404).send('El archivo especificado no pudo ser encontrado.');
        }

        const dataForId = getDataForId(fileContent, id, startDate, endDate);

        if (!dataForId) {
            return res.status(404).send('No se encontraron datos para el ID especificado.');
        }

        const doc = new jsPDF(); // Crear un nuevo documento PDF

        // Agregar un título al PDF
        doc.setFontSize(18);
        doc.text(`Reporte de asistencia para ID: ${id}`, 14, 22);

        // Definir las columnas y los datos para la tabla
        const columns = ["Fecha", "Día", "Entrada", "Salida", "Horas Trabajadas"];
        const rows = [];
        let totalHorasTrabajadas = 0;
        let totalMinutosTrabajados = 0;

        for (const date in dataForId) {
            if (dataForId.hasOwnProperty(date)) {
                const entry = dataForId[date];
                let horasTrabajadas = calculateHoursWorked(entry.entrada, entry.salida);
                if (/^\d{1,2}:\d{2}$/.test(horasTrabajadas)) {
                    const [hours, minutes] = horasTrabajadas.split(":");
                    totalHorasTrabajadas += parseInt(hours);
                    totalMinutosTrabajados += parseInt(minutes);
                } else {
                    horasTrabajadas = "Error";
                }
                rows.push([
                    date,
                    entry.dayOfWeek,
                    entry.entrada || "Ausente",
                    entry.salida || "Ausente",
                    horasTrabajadas,
                ]);
            }
        }

        // Convertir los minutos a horas y minutos
        totalHorasTrabajadas += Math.floor(totalMinutosTrabajados / 60);
        totalMinutosTrabajados = totalMinutosTrabajados % 60;

        // Formatear las horas y minutos en el formato deseado
        const totalHorasTrabajadasFormatted = `${totalHorasTrabajadas} horas : ${totalMinutosTrabajados.toString().padStart(2, "0")} minutos`;

        // Usar autoTable para crear la tabla
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 30,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [22, 160, 133] },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            margin: { top: 10 },
            pageBreak: "auto",
        });

        // Agregar el total de horas trabajadas al final del PDF
        doc.setFontSize(12);
        doc.text(`Total de horas trabajadas: ${totalHorasTrabajadasFormatted}`, 14, doc.autoTable.previous.finalY + 10);

        // Guardar el PDF en la carpeta src/uploads
         // Guardar el PDF en la carpeta src/uploads
         try {
            // Guardar el PDF en la carpeta src/downloads
            const fileName = `Registro de asistencia ID:${id}.pdf`;
            const outputPath = path.resolve(rutaDestino, fileName);
            doc.save(outputPath);
            console.log('PDF generado:', outputPath);
    
            /* // Enviar el PDF como respuesta al cliente para descargar
             const fileStream = fs.createReadStream(outputPath);
            fileStream.pipe(res);
            fileStream.on('error', (err) => {
                console.error('Error al enviar el archivo al navegador', err);
                res.status(500).send('Error al enviar el archivo al navegador');
            });
            fileStream.on('close', () => {
                fs.unlink(outputPath, (err) => {
                    if (err) console.error('Error al eliminar el archivo', err);
                });
            });  */
    
        } catch (error) {
            console.error('Error al generar y enviar el PDF:', error);
            res.status(500).send('Error al generar y enviar el PDF');
        }

    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send('Error al generar el PDF');
    }
};
