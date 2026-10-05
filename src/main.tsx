import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ClerkProviderWrapper } from './components/ClerkProviderWrapper';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProviderWrapper>
        <App />
      </ClerkProviderWrapper>
    </ErrorBoundary>
  </StrictMode>,
);
