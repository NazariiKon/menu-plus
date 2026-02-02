import ReactDOM from 'react-dom/client'
import AppRouter from './router/main'
import './index.css';
import { Provider } from 'react-redux';
import store from './store/store';
import { CartProvider } from './context/CartContext';

ReactDOM.createRoot(document.getElementById('root')!).render(

  <CartProvider>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </CartProvider>
)
