FROM node:24-alpine

WORKDIR /app

# Dependencies are installed in the image. The host only needs Docker.
COPY package.json package-lock.json ./
RUN npm ci

COPY . ./

EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
