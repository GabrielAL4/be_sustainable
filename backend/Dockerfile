FROM node:18-alpine

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install
RUN npm install -g ts-node-dev

# Copiar o resto dos arquivos
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"] 