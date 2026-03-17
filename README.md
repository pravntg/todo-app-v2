# Fullstack Todo Application

This project is a complete Todo management system that handles everything from user accounts to persistent task storage. I've designed it to be reliable and easy to deploy using modern containerization tools.

## Project Overview

The application is built to handle multiple users, each with their own private list of tasks. I've implemented a full system for managing these tasks, including the ability to add new ones, mark them as finished, and a safety feature that allows you to "delete" tasks to a bin before removing them for good.

### What has been done

I've completed the following work on this project:

- Database Integration: Connected the entire application to MongoDB Atlas for permanent storage. This ensures that your tasks and user accounts are saved even if the server restarts.
- Authentication System: Built a secure login and signup system using JSON Web Tokens (JWT). This keeps user data private and ensures only you can see your own tasks.
- Advanced Task Logic: Implemented a soft-delete mechanism. When you delete a task, it goes to a "Deleted" tab where you can either restore it or delete it permanently.
- Dockerization: Set up Docker and Docker Compose for the entire stack. The backend and frontend run in their own isolated containers, making the app much more portable and stable.
- Production Server Setup: Configured the application to run on a Google Cloud Platform (GCP) instance, including opening the necessary firewall ports and setting up Nginx to serve the frontend.
- Dynamic Environment Detection: Updated the frontend to automatically find the correct backend address whether it's running on a local machine or a cloud server.

### Technologies used

I used a modern stack to build this application:

- Frontend: Built with React and the Vite build tool. I used Axios for making API calls and React Icons for the interface elements.
- Backend: Developed using Node.js and the Express framework.
- Security: Used Bcrypt for hashing passwords and JSON Web Tokens for handling secure sessions.
- Database: MongoDB Atlas was chosen for its reliability, and I used Mongoose to interact with it from the code.
- DevOps and Hosting: Docker and Docker Compose were used for containerization. The application is hosted on Google Cloud Platform (GCP), with Nginx serving as the web server for the frontend.

## How to run the project

To get this project running on your own machine, you only need to have Docker installed.

1. Clone the repository and navigate into the folder.
2. Run the command: `docker-compose up --build -d`

The application will be available at http://localhost.
