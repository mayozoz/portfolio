import React from 'react'
import ReactDOM from 'react-dom/client'
import PersonalRPGPortfolio from './App'
import RecruiterPortfolio from './RecruiterPortfolio'
import './index.css'

const mode = new URLSearchParams(window.location.search).get('mode')
const resumeUrl = `${import.meta.env.BASE_URL || '/'}resume.pdf`
const Root = mode === 'rpg' ? PersonalRPGPortfolio : RecruiterPortfolio

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root resumeUrl={resumeUrl} />
  </React.StrictMode>
)

// import React from "react";
// import { createRoot } from "react-dom/client";
// import App from "./App.jsx";
// import "./index.css";

// const container = document.getElementById("root");
// const root = createRoot(container);
// root.render(<App />);