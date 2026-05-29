const express = require('express');
const multer = require('multer');
const Minio = require('minio');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Inicializando o cliente oficial do MinIO
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_HOST,  
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

// Rota para listar todos os arquivos do bucket
app.get('/files', (req, res) => {
    const bucketName = 'meu-bucket';
    const objectsList = [];

    // listObjectsV2(bucket, prefixo, recursivo)
    // O prefixo vazio '' significa "buscar tudo". O 'true' indica busca recursiva (inclui subpastas)
    const stream = minioClient.listObjectsV2(bucketName, '', true);

    // O SDK do MinIO envia os dados em partes (Stream de eventos)
    stream.on('data', (obj) => {
        objectsList.push({
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
            etag: obj.name.endsWith('/') ? null : obj.etag // Pastas não têm etag
        });
    });

    // Quando o stream terminar de ler todos os objetos, enviamos a resposta JSON
    stream.on('end', () => {
        res.status(200).json({
            bucket: bucketName,
            total_files: objectsList.length,
            files: objectsList
        });
    });

    // Tratamento de erros no stream (ex: se o bucket não existir)
    stream.on('error', (error) => {
        console.error('Erro ao listar objetos:', error);
        res.status(500).json({ error: 'Não foi possível listar os arquivos do MinIO.' });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Node.js rodando na porta ${PORT}`);
});