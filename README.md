# EDGELESS Function Repository Front-end APP

![](edgeless-logo-64-40.png)

**Part of the [EDGELESS](https://edgeless-project.eu/) Project**

## Overview

The **Function Repository Front-end** is a  component of [EDGELESS](https://edgeless-project.eu/), designed to store and manage both functions and workflows. This APP provides a user-friendly interface for handling workflows and functions, including their creation, update, deletion, and retrieval. It also allows for the use of a users and API keys system to manage roles and permissions, ensuring that only authorized users and their respective API keys can access specific functionalities.

## Features

- **Function Management**:
    - Create, update, delete, and retrieve functions.
    - Manage multiple versions of a function.
    - Manage multiple types of a function.
    - Upload and download function code files.
    - Retrieve function versions.

- **Workflow Management**:
    - Create, update, delete, and retrieve workflows.
    - Define workflows using JSON, referencing existing functions in the repository.

- **Workflow UI**:
    - Visualization of workflows using React Flow.
    - Drag, drop, and connect functions to create workflows.
    - Edit functions properties as input or output to connect with other functions.
    - Edit workflow properties as types and.

- **User Management**:
    - Create, update, delete, and retrieve users.
    - Change user passwords.
    - Manage user roles.

- **API Key Management**:
    - Create, delete, and retrieve API keys.
    - Manage API key permissions.

## Usage

This APP is intended for:
- **Function Developers (funcdev)**: To manage functions.
- **Application Developers (appdev)**: To manage workflows and functions.
- **Cluster Administrators (clusteradmin)**: To manage workflows, functions, users, and API keys.
- **API Keys**: Creation of API keys for users to access the API repository, a key has the same role permissions as the user that creates the key.

## Technology Stack

- **TypeScript**
- **Nest.js**
- **MongoDB**
- **Redux**
- **Tailwind CSS**
- **React Flow**
- **Dagre**
- **ESLint**
- **JWTAuth**

## Development

### NPM scripts

- `npm run dev` - Start application development mode
- `npm run build` - Build application
- `npm run start` - Start application in production mode

### Installation

1. Go to project folder and install dependencies:
 ```sh
 npm install
 ```

2. Launch development server, and open [http://localhost:3000](http://localhost:3000) in your browser:
 ```sh
 npm run dev
 ```

3. Access the application with the default user, by default is email is **admin@admin.com** but the credentials can be specified as explained in the [API](https://github.com/edgeless-project/function-repository-api?tab=readme-ov-file#security).

----------


## License

The Repository is licensed under the MIT License.

## Funding

EDGELESS received funding from the [European Health and Digital Executive Agency
(HADEA)](https://hadea.ec.europa.eu/) program under Grant Agreement No 101092950.

Front-end app for the EDGELESS Function Repository.

