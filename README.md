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


##


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
