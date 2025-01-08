# Use the official Node.js image as a base image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 8040

# Start the application
CMD ["npm", "start"]
