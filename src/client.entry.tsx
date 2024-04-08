import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import "./styles.css";
import viteasset from "./vite.svg"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
      <div>{viteasset}</div>
  </React.StrictMode>,
)
