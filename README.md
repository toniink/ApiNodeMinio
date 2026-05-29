# ApiNodeMinio
Criacao de uma API Node.js para armazenamento e listagem de objetos utilizando o MinIO.

## Ferramentas Utilizadas

- Node.js: Servidor Express, middleware Multer para upload de arquivos e MinIO SDK para integracao nativa.

- Docker Compose: Para padronizacao e isolamento do ambiente.

- MinIO: Para simular localmente um bucket compativel com o AWS S3.

## Passos para Execucao

Clone o repositorio executando o comando: `git clone https://github.com/toniink/ApiNodeMinio/

Acesse a pasta do projeto clonado e suba os containers com o comando: `docker compose up --build`

### Como Enviar Arquivos (Upload)
3. Acesse o painel web do MinIO Console pelo seu navegador (geralmente em http://localhost:9001).
4. Clique em Create a Bucket e crie um bucket com o nome exato de meu-bucket.
5. Abra o seu cliente HTTP de preferencia.
6. Crie uma requisicao do tipo POST para o endereco: http://localhost:3000/upload
7. Configure o corpo da requisicao (Body) como Multipart Form, defina a chave como file e anexe o arquivo desejado.
8. Envie a requisicao. O servidor devera retornar um JSON com a mensagem de sucesso.

### Como Listar os Arquivos do Bucket
9. No seu cliente HTTP, crie uma requisicao do tipo GET para o endereco: http://localhost:3000/files
10. Envie a requisicao. O retorno sera um JSON contendo a quantidade total de arquivos e uma lista com os detalhes de cada objeto, incluindo nome, tamanho, data de ultima modificacao e o identificador unico.

## Desafios Encontrados

### Ausencia de Ferramentas do Docker Compose
A principio, o Dockerfile buildava normalmente de forma isolada, mas o comando docker compose dava como inexistente no sistema operacional Linux baseado em Debian. A instalacao do pacote docker-compose-plugin nao conseguia alcancar o repositorio da mantenedora do Docker. Para resolver isso, foi necessario atualizar os certificados de seguranca (ca-certificates) e apontar para os repositorios oficiais manualmente via terminal. Apos esse ajuste, a instalacao foi concluida com sucesso e o ambiente rodou perfeitamente.

## Escolha do Cliente HTTP e Conflito com FUSE no Ubuntu 24.04
Por costume de utilizar a extensao Thunder Client no VS Code para requisicoes JSON simples, descobri durante o projeto que o envio de arquivos multipart nela exige um plano premium. Como alternativas populares como Postman e Insomnia agora exigem a criacao obrigatoria de uma conta para login, optei por utilizar o Bruno, um cliente HTTP de codigo aberto.

A maior dificuldade foi inicializar o aplicativo, pois a versao AppImage necessitava da dependencia do FUSE (que cria pontos de montagem virtuais sem permissao de root). O Ubuntu 24.04 compartilha de uma arquitetura diferente e tentar instalar a libfuse convencional via apt acabou quebrando a interface grafica do sistema operacional. Foi necessario restaurar a interface do Ubuntu via terminal puro, mas, apos o susto, a ferramenta Bruno funcionou perfeitamente e permitiu validar com sucesso o fluxo de envio e listagem de arquivos da API.
