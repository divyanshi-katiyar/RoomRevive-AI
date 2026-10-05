import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AssistantModal } from './components/AssistantModal';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';

import { Home } from './pages/Home';
import { Designer } from './pages/Designer';
import { DesignResult } from './pages/DesignResult';
import { Studio } from './pages/Studio';
import { MyDesigns } from './pages/MyDesigns';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';

export function App() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-[#E2D4C3] selection:text-[#2A231C]">
        {/* Navigation Bar */}
        <Navbar onOpenAssistant={() => setIsAssistantOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/design" element={<Designer onToast={addToast} />} />
            <Route path="/design/result" element={<DesignResult onToast={addToast} />} />
            <Route path="/studio" element={<Studio onToast={addToast} />} />
            <Route path="/my-designs" element={<MyDesigns onToast={addToast} />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />

        {/* AI Interior Assistant Modal */}
        <AssistantModal
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
        />

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    </Router>
  );
}

export default App;
