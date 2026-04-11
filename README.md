# TestMentor Frontend

Frontend part of the **TestMentor** project.  
Built with **React** and **Vite**.

## Overview

The frontend provides the user interface for:

- registration and login
- role-based navigation
- quiz creation and AI generation
- mentor review workflow
- quiz taking
- viewing results and statistics
- user profile page

##

<img width="500" alt="Снимок экрана 2026-03-30 201857" src="https://github.com/user-attachments/assets/ca3d8517-7c86-4fc6-8199-3b4be4661c8f" />
<img width="500" alt="Снимок экрана 2026-03-30 201910" src="https://github.com/user-attachments/assets/7429e2f9-2c68-4be2-85b9-4855c9a0970d" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/70544efb-f489-400a-8356-5669e5260a15" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/54c95db1-14ab-4560-99e5-5886b7c35fe7" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/148029eb-0fc8-44e7-9beb-cbb96c911519" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/f6101536-c72f-49ed-8737-caea1e1c251b" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/dab01ef7-9ef8-46ba-81ee-62801063df10" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/3d6b24b7-cdd6-4e2f-a01a-28d842feae80" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/66e9cba6-58e3-4761-956a-af05b4b5582b" />
<img width="434" height="130" alt="image" src="https://github.com/user-attachments/assets/278f5ba4-1fbc-423e-8a46-1e111285adb9" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/c2e6ae9b-cd07-4fde-9f8a-32a6b9a00a70" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/c77bc39e-7a9b-4d73-87f4-beed85161dfc" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/e727edbc-c6ca-43d3-bfc7-f221cec8a550" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/eb13c9d8-ffe6-446d-8a07-f9d37512f872" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/87aefcf8-4fe8-46ce-9c8d-86015d019c41" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/8149eb38-1a58-4b2d-b414-e91836c91933" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/c78db424-e2ab-46d8-86c6-3dab66961d66" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/930752b4-fbba-4124-9d3f-e7f4358cf8b8" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/6ea28d6a-7835-4be7-9ff2-60a0970d29d5" />
<img width="500" alt="image" src="https://github.com/user-attachments/assets/4263a53a-4b16-4e6d-ad45-18ce4cc3a5da" />

## Tech stack

- React 19
- React Router DOM 7
- Vite 7
- CSS

## Requirements

Before running the frontend, install:

- **Node.js**
- **npm**

Check versions:

```bash
node -v
npm -v
```

## Installation

From the frontend folder:

```bash
cd testmentor-front
npm install
```

## How to run

```bash
npm run dev
```

By default, Vite starts the app at:

```text
http://localhost:5173
```

## Available scripts

```bash
npm run dev      # start development server
npm run build    # create production build
npm run preview  # preview production build locally
npm run lint     # run ESLint
```

## Backend connection

The frontend is configured to proxy API requests to the backend during development.

Vite config:

```js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
}
```

This means:

- frontend runs on `http://localhost:5173`
- backend runs on `http://localhost:8080`
- requests to `/api/...` are automatically forwarded to the backend

## Authentication

The frontend uses an auth context located in:

```text
src/auth/AuthContext.jsx
```

It is responsible for handling the current user and authentication token.

## UI components

Reusable UI elements include:

- `Navbar`
- `Toast`

Styles are written with plain CSS files next to components/pages.

## Build for production

```bash
npm run build
```

Production files will be generated in:

```text
dist/
```

## Common issues

### 1. `npm install` fails
Check that Node.js is installed correctly and try:

```bash
npm cache clean --force
npm install
```

### 2. Frontend opens but API does not work
Check that:

- backend is running on `http://localhost:8080`
- requests use `/api/...`
- there are no backend startup errors

### 3. CORS or network error
In development this is usually solved by making sure Vite proxy is active and the backend is running.

## Typical startup order

1. Start PostgreSQL
2. Start backend
3. Start frontend

## Author

Frontend for the project **TestMentor** by **Saya Amangeldinova**.
