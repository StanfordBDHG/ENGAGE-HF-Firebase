FROM node:22-bullseye-slim

RUN apt update -y && apt install -y openjdk-11-jdk bash curl

RUN npm install -g firebase-tools

COPY . .

RUN npm run prepare

EXPOSE 5001 9099 8080 9199 4000

ENV IN_DOCKER_CONTAINER=true

ENTRYPOINT ["/bin/bash", "-c", "npm run serve:seeded && sleep infinity"]
