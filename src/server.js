import express from 'express';
import pkg from 'body-parser';
import cors from 'cors'; // Agregamos el paquete cors
import fileRoutes from './routes/file.routes.js';
import pdfRoutes from './routes/pdf.routes.js';

const { json, urlencoded } = pkg;

const app = express();
const port = 3000;

app.use(cors(
    {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    }
)); // Agregamos el middleware cors para permitir peticiones de todos los dominios


app.use(json());
app.use(urlencoded({ extended: true }));

app.use('/api/files', fileRoutes);
app.use('/api/pdf', pdfRoutes);

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
