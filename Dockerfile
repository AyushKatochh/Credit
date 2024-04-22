FROM node:lts
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]# --- Stage 1: Build the Node.js Application ---
    FROM node:16-alpine  
    
    # Create a working directory inside the container
    WORKDIR /app 
    
    # Copy project dependencies
    COPY package.json .
    RUN npm install
    
    # Copy the rest of your application code
    COPY . . 
    
    # Expose the port your Node.js application listens on
    EXPOSE 3000
    
    # Start the application when the container runs
    CMD ["npm", "start"] 
    
    # --- Stage 2: PostgreSQL Image ---
    FROM postgres:14-alpine
    
    # Environment variables for PostgreSQL (adjust if needed)
    ENV POSTGRES_USER=postgres     
    ENV POSTGRES_PASSWORD=ayush       
    ENV POSTGRES_DB=my_new_database       
    
    # Initialize the database (optional, if you want to pre-populate the DB)
    COPY ./database_init.sql /docker-entrypoint-initdb.d/
    
