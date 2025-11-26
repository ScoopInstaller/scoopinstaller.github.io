import { HelmetProvider } from '@dr.pogodin/react-helmet';
import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
