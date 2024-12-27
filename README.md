# Universal Study Portal - Backend

Backend service for the **Universal Study Portal** built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. This backend serves as the foundation for the Universal Study Portal, providing robust APIs for managing data, real-time updates, and seamless integrations with MongoDB for scalable database operations. The project is designed to handle all backend functionality for the portal efficiently and follows industry best practices for development and deployment.

## **Features**

- Built with **Node.js**, **Express**, **TypeScript**, and **MongoDB** for a scalable and maintainable backend.
- **Swagger** for comprehensive API documentation and testing.
- Environment-specific configurations for **development**, **staging**, and **production**.
- Strict linting and formatting with **ESLint** and **Prettier**.
- Modular and scalable folder structure to support future feature expansions.
- Easy-to-use scripts for development, linting, and formatting.
- Designed to handle real-time updates and large-scale data operations.

## **Project Setup**

### Prerequisites

- **Node.js** (v16+ recommended)
- **npm** (v7+ recommended)
- **MongoDB**

### **Installation**

1. Clone the repository:

   ```bash
   git clone https://github.com/RahulRaj97/usp-backend.git
   cd usp-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment configuration:

   - This project uses separate configuration files for each environment located in the `src/config` directory.
   - For additional flexibility (e.g., local overrides), you can also use a `.env` file in conjunction with these configs:
     - Create a `.env` file in the project root (e.g., `.env.development` for development).
     - Reference the `.env.example` file for required variables.

4. Start the server:

- For development:

  ```bash
  npm run dev
  ```

- For production:

  ```bash
  npm start
  ```
