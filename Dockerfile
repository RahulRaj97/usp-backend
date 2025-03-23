FROM node:22.13.1

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]
