import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.tsx';
import { CheckoutSuccess } from './components/CheckoutSuccess.tsx';
import { CheckoutFailure } from './components/CheckoutFailure.tsx';
import { CheckoutPending } from './components/CheckoutPending.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      {/* Rotas de confirmação de pagamento */}
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/checkout/failure" element={<CheckoutFailure />} />
      <Route path="/checkout/pending" element={<CheckoutPending />} />
    </Routes>
  </BrowserRouter>
);
