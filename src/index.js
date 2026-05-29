const express = require('express');
const multer = require('multer');
const Minio = require('minio');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Inicializando o cliente oficial do MinIO
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_HOST,  // Apenas o nome do serviço (ex: 'minio')
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: false,                     // Como é local, usamos HTTP (false)
    accessKey: process.env.MINIO_ROOT_USER,
    secretKey: process.env.MINIO_ROOT_PASSWORD,
});

// Rota de Upload
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    const bucketName = 'meu-bucket';
    const objectName = `${Date.now()}-${req.file.originalname}`;

    try {
        // O SDK do MinIO aceita Buffers diretamente no putObject
        // É necessário passar o tamanho do arquivo (req.file.size)
        await minioClient.putObject(
            bucketName, 
            objectName, 
            req.file.buffer, 
            req.file.size,
            { 'Content-Type': req.file.mimetype } // Metadados (opcional)
        );

        res.status(200).json({ 
            message: 'Arquivo enviado com sucesso via MinIO SDK!',
            filename: objectName 
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).send('Erro ao enviar arquivo para o MinIO.');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Node.js rodando na porta ${PORT}`);
});