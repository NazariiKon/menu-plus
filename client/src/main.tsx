import ReactDOM from 'react-dom/client'
import AppRouter from './router/main'
import './index.css';
import { Provider } from 'react-redux';
import store from './store/store';
import { useEffect } from 'react';

useEffect(() => {
  fetch('https://menu-plus-server.onrender.com/ping')
    .catch(() => console.log("Server waking up..."));
}, []);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <AppRouter />
  </Provider>,
)
