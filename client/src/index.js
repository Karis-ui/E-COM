import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import { store } from './store';

const root = ReactDOM.createRoot(document.getElementById('root'));

if(process.env.NODE_ENV === 'production') {
  console.log('🚀 K-TECH Running in Production Mode');
  console.info(`📡 API: ${process.env.REACT_APP_API_URL}`);
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
