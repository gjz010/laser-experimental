FROM node
COPY package.json /app/package.json
WORKDIR /app
RUN npm install
COPY ./ /app
CMD ["node", "index.js"]
