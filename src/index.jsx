// import * as serviceWorker from './serviceWorker';\
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();

import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "spectre.css/dist/spectre.min.css";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
