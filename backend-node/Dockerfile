FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY prisma ./prisma/
RUN npx prisma generate || true
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
