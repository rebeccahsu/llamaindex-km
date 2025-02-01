FROM node:20.12.2

# client
EXPOSE 3000
WORKDIR /app

# from local
COPY . .

# for liveness probe
RUN touch /tmp/healthy

RUN corepack enable \
  && yarn set version stable \
  && yarn config set nodeLinker node-modules \
  && yarn workspaces focus --production

CMD ["yarn", "start"]
