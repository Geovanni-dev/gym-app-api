# usa uma versao estavel do node baseada em linux alpine para reduzir o tamanho da imagem
FROM node:22.20.0-alpine

# define o diretorio de trabalho interno do container onde o app vai rodar
WORKDIR /app

# copia os arquivos de mapeamento de dependencias antes do restante do codigo
COPY package*.json ./

# instala as dependencias de forma isolada dentro do container
RUN npm install

# copia todos os arquivos restantes do projeto para o container
COPY . .

# expoe a porta interna que a api vai utilizar para receber requisicoes
EXPOSE 3000

# executa o servidor com node puro para maxima performance em producao (vps)
CMD ["node", "server.js"]