# creditpulse

This repository contains a Node.js Express application that is dockerized with a MySQL database using Docker containers. It provides a simple guide to set up and run the application locally.

## Prerequisites (Without Docker)

Before you begin, ensure you have the following prerequisites installed on your system:

- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/) (if you want to run the application without Docker)
- [MySQL Client](https://dev.mysql.com/downloads/mysql/) (if you want to interact with the database outside of the Docker container)

## Setup

1. Clone this repository to your local machine:

  https://github.com/Shashwat803/creditpulse.git

2. Create a .env file in the root directory with your environment variables. You can use the .env.example file as a reference:

dotenv 
DB_HOST=db
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database


# Build and start the Docker containers using docker-compose:
docker-compose up --build


# For Development
  npm start
