import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      {/* Redirecionar todas as rotas de checkout para home */}
      <Route path="/checkout/*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
