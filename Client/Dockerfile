# Use the official Node.js LTS image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React application using Vite
RUN npm run build

# Install a simple web server to serve the built React app
RUN npm install -g serve

# Expose the port the app will run on
EXPOSE 5000

# Start the app with the 'serve' command to serve the build folder
CMD ["serve", "-s", "dist", "-l", "5173"]
