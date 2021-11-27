FROM node:16

WORKDIR /apibackendapp/

COPY package*.json .
RUN npm install --unsafe-perm
COPY . .

EXPOSE 9081
EXPOSE 9443

CMD npm start