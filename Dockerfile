FROM node:12-alpine
WORKDIR /interactive-map
ADD . /interactive-map
EXPOSE 3000
CMD ["npm", "run", "start"]
