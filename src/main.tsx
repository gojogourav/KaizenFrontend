import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { LazyMotion, domAnimation } from 'motion/react';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domAnimation} strict>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LazyMotion>
  </StrictMode>,
);

