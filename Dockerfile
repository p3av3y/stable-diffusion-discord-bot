# Use the official Node.js LTS (Long Term Support) image as a base image
FROM node:current

RUN apt update && apt install -y gettext-base

RUN git clone https://github.com/p3av3y/stable-diffusion-discord-bot.git /srv/stable-diffusion-discordf-bot/

# Set the working directory inside the container
WORKDIR /srv/stable-diffusion-discordf-bot/

# Copy package.json and package-lock.json to the working directory
#COPY package*.json ./

# Install dependencies
RUN npm install

# Use envsubst to replace placeholders in the config file with environment variables
RUN [ -f /srv/stable-diffusion-discordf-bot/config.json.template ] && cat /srv/stable-diffusion-discordf-bot/config.json.template | envsubst > /srv/stable-diffusion-discordf-bot/config.json || true


# Copy the rest of your app's source code into the working directory
#COPY . .

# Copy the .env file to the container
#COPY .env .

# Expose the port that your Node.js application will run on
#EXPOSE 3000

# Define the command to run your Node.js application
#CMD ["node", "index.js"]
