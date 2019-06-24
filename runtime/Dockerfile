FROM node
COPY package.json /runtime/package.json
COPY package-lock.json /runtime/package-lock.json
WORKDIR /runtime
RUN npm install
COPY ./ /runtime
CMD ["node", "index.js"]
