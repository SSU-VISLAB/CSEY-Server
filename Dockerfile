FROM node:14

WORKDIR /home/chanil/CSEY-Server/project

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . /home/chanil/CSEY-Server/project

CMD [ "npm","start" ]