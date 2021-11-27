FROM node:16

WORKDIR /apiproxyapp/

COPY package*.json .
RUN npm install --unsafe-perm
COPY . .

EXPOSE 8081
EXPOSE 8443
CMD npm start