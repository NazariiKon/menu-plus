import ReactDOM from 'react-dom/client'
import AppRouter from './router/main'
import './index.css';
import { Provider } from 'react-redux';
import store from './store/store';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <AppRouter />
  </Provider>,
)
