import React from "react";
import ReactDOM from "react-dom";
import "./Home.css";
import "./Swipescreen.css";

import App from "./App.js";
import { BrowserRouter } from 'react-router-dom'

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
    , document.getElementById('root')
);

