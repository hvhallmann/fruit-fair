# Feira da Fruta (Fruit Fair React)

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-13.1.0-FFCA28.svg)](https://firebase.google.com/)
[![Spectre.css](https://img.shields.io/badge/Spectre.css-0.5.6-5755D9.svg)](https://picturepan2.github.io/spectre/)

A responsive React web application that helps consumers discover which fruits and produce are currently in season in Brazil. Consuming seasonal produce ensures better flavor, higher nutritional density, lower pesticide use, and more accessible prices.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Migration from Create React App to Vite](#migration-from-create-react-app-to-vite)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Seasonality Logic](#seasonality-logic)

---

## Features

- **Automated Seasonal Recommendations:** Dynamically evaluates the current calendar month to display fruits at their peak harvest.
- **Previous & Upcoming Season Insights:** Highlights items that were in peak season last month, as well as fruits coming into season next month.
- **Extended Availability:** Shows fruits with moderate availability ("Médio") across current, previous, and next months.
- **Visual Grid UI:** Responsive card layout styled with Spectre.css displaying fruit illustrations and names.
- **Firebase Analytics:** Integrated Firebase app configuration and Google Analytics tracking.

---

## Tech Stack

- **Framework:** [React 18](https://react.dev/) (Class components, `createRoot`)
- **Build Tool & Dev Server:** [Vite 5](https://vitejs.dev/) with [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)
- **Analytics & Backend Services:** [Firebase 13](https://firebase.google.com/)
- **Styling:** [Spectre.css](https://picturepan2.github.io/spectre/) + Custom CSS
- **Language / Environment:** Modern JavaScript (ES Modules, Node.js 18+)

---

## Migration from Create React App to Vite

The project has been migrated from Create React App (`react-scripts`) to **Vite 5** (v2.0.0).

### Why the Migration?

- **Deprecation of CRA:** Create React App is no longer actively maintained.
- **Instant Server Start & Fast HMR:** Vite leverages native ES Modules (ESM) and esbuild, eliminating slow Webpack bundling during development.
- **Optimized Builds:** Rollup-driven production builds generate leaner, faster bundles.
- **Lightweight Dependencies:** Replaced hundreds of transitive dependencies from `react-scripts` with minimal, modern Vite tooling.

### Summary of Changes

1. **Dependency Overhaul:**
   - Removed `react-scripts`.
   - Added `vite` and `@vitejs/plugin-react` as development dependencies.
   - Configured `"type": "module"` in `package.json`.
2. **Configuration (`vite.config.js`):**
   - Added Vite configuration using `@vitejs/plugin-react`.
   - Configured the development server to run on port `3000` with automatic browser opening.
3. **HTML Entry Relocation:**
   - Moved `public/index.html` to the project root (`/index.html`), as required by Vite.
   - Added direct module script tag: `<script type="module" src="/src/index.jsx"></script>`.
   - Removed CRA-specific `%PUBLIC_URL%` placeholders in favor of root-relative asset URLs (`/favicon.ico`, `/manifest.json`).
4. **JSX File Extension Standards:**
   - Renamed files containing JSX from `.js` to `.jsx` (`App.jsx`, `index.jsx`, `Card.jsx`) to adhere to Vite's strict ES module parser.
5. **Modern Dynamic Asset Loading:**
   - Updated `Card.jsx` to load fruit images dynamically using Vite's ESM standard:
     ```javascript
     const imageUrl = new URL(`./assets/images/${this.props.image}.png`, import.meta.url).href;
     ```
6. **React 18 Upgrade:**
   - Updated entry point (`src/index.jsx`) to use React 18's `createRoot` API instead of legacy `ReactDOM.render`.
7. **Output Directory & Gitignore:**
   - Production output now builds to `/dist` instead of `/build`.
   - Added `/dist` to `.gitignore`.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 26 or newer; Node 26.x tested)
- [npm](https://www.npmjs.com/) (version 9+)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/fruit-fair-react.git
   cd fruit-fair-react
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` *(or `npm start`)* | Starts the Vite local development server at `http://localhost:3000`. |
| `npm run build` | Compiles and bundles production assets into the `dist/` directory. |
| `npm run preview` | Locally serves the production build in `dist/` for verification. |

---

## Project Structure

```text
fruit-fair-react/
├── index.html              # Vite entry HTML
├── vite.config.js          # Vite configuration (port 3000, React plugin)
├── package.json            # Scripts and dependencies
├── public/                 # Static public assets
│   ├── favicon.ico
│   └── manifest.json
└── src/
    ├── assets/images/      # Fruit and produce illustration images (.png)
    ├── db/
    │   └── db.js           # Seasonal database of fruits and produce
    ├── App.jsx             # Main application component & seasonality logic
    ├── App.css             # Main styling
    ├── Card.jsx            # Product card component
    ├── Card.css            # Card styling
    ├── index.jsx           # React DOM client entry (createRoot)
    └── index.css           # Global CSS styles
```

---

## Seasonality Logic

The application classifies items dynamically by comparing the current date (`new Date().getMonth()`, 0–11) against the matrix defined in `src/db/db.js`:

1. **Sugestão Principal (Current Month):** Items whose season rating for the active month is `"Forte"`.
2. **Boa pedida do mês anterior (Previous Month):** Items whose season rating in the preceding month was `"Forte"`.
3. **Saindo do forno para o próximo mês (Next Month):** Items whose peak season begins next month.
4. **Ainda disponíveis (Moderate Availability):** Items with a `"Medio"` rating across the previous, current, or next month.
