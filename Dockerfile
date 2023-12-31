FROM node:latest

# Install Git
RUN apt-get update && apt-get install -y git

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

#EXPOSE 9000

RUN npx prisma generate

CMD ["npm", "run", "dev"]
