##############################################
#### FISRT STAGE: BUILD THE APPLICATION ######
##############################################

# Use the official Node.js 20 image as a base
# FROM node:20.8.0 AS build
FROM node:22.8.0-bookworm-slim AS build

# Environment variables
ARG DATABASE_URL
ENV YARN_VERSION 4.4.1

# Install necessary dependencies for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY yarn.lock ./

# Copy yarnrc file
COPY .yarnrc.yml ./

# Set up Corepack and Yarn
RUN corepack enable && \
    corepack prepare yarn@$YARN_VERSION --activate && \
    yarn set version $YARN_VERSION

# Install dependencies, including 'puppeteer'
RUN yarn install --check-cache

# Copy the rest of your application's code into the container
COPY . .

# Prisma
# COPY --from=deps /app/node_modules ./node_modules
# COPY src/database/schema.prisma ./prisma/
# RUN npx prisma generate

# Build project
RUN yarn run build

##############################################
#### SECOND STAGE: RUN THE APPLICATION #######
##############################################

# Use the official Node.js 20 image as a base
# FROM node:20.8.0
FROM node:22.8.0-bookworm-slim AS production

# Set environment variables to optimize the container
ENV NODE_ENV production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH "/usr/bin/google-chrome-stable"
ENV YARN_VERSION 4.4.1

# Install necessary dependencies for Puppeteer's Chrome
# These dependencies are required to run Puppeteer/Chrome in a headless environment
RUN apt-get update && \
    apt-get install -y wget gnupg2 ca-certificates apt-transport-https software-properties-common && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install -y google-chrome-stable fonts-hosny-amiri --no-install-recommends && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Install necessary dependencies for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY yarn.lock ./

# Copy yarnrc file
COPY .yarnrc.yml ./

# Copy the rest of your application's code into the container
COPY --from=build /app/build ./build

# Copy static files
COPY static ./static

# Set up Corepack and Yarn
RUN corepack enable && \
    corepack prepare yarn@$YARN_VERSION --activate && \
    yarn set version $YARN_VERSION

# Install dependencies, including 'puppeteer'
RUN yarn install --check-cache

# Prisma
# COPY prisma ./prisma
COPY --from=build /app/node_modules/.prisma/client ./node_modules/.prisma/client

# Expose the port your app runs on
EXPOSE 3000
EXPOSE 7700

# Specify the command to run your app
CMD ["yarn", "run", "start"]
