import React, { useState, useEffect } from 'react';
import Modal from './Modal';

// Define the BeforeInstallPromptEvent type for TypeScript
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}


const PwaInstallPrompt: React.FC = () => {
  const [modalState, setModalState] = useState<'hidden' | 'ios' | 'android'>('hidden');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Check if the prompt has already been shown and the app isn't installed
      const hasSeenPrompt = localStorage.getItem('hasSeenPwaInstallPrompt');
      if (!hasSeenPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
          setDeferredPrompt(e as BeforeInstallPromptEvent);
          setModalState('android');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const hasSeenPrompt = localStorage.getItem('hasSeenPwaInstallPrompt');

    if (isIOS && !isInStandaloneMode && !hasSeenPrompt) {
      setModalState('ios');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Hide our custom modal
    setModalState('hidden');
    localStorage.setItem('hasSeenPwaInstallPrompt', 'true');
    
    // Show the browser's install prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
    }
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    localStorage.setItem('hasSeenPwaInstallPrompt', 'true');
    setModalState('hidden');
  };
  
  const renderContent = () => {
    if (modalState === 'android') {
        return (
             <div className="text-center text-gray-700 dark:text-gray-300">
                <p className="mb-4">Para a melhor experiência, instale o Reis Fit em seu dispositivo.</p>
                <p className="mb-6 text-sm">Ele funcionará offline e terá acesso rápido na sua tela inicial.</p>
                <button
                  onClick={handleInstallClick}
                  className="mb-2 w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Instalar Aplicativo
                </button>
                 <button
                  onClick={handleClose}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Agora não
                </button>
            </div>
        )
    }
    
    if (modalState === 'ios') {
        return (
            <div className="text-center text-gray-700 dark:text-gray-300">
                <p className="mb-4">Para a melhor experiência, adicione este aplicativo à sua tela de início.</p>
                <div className="text-left space-y-2 bg-gray-100 dark:bg-slate-700 p-3 rounded-md">
                    <p>1. Toque no ícone de <strong>Compartilhar</strong> na barra de ferramentas do Safari.</p>
                    <p>2. Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</p>
                    <p>3. Toque em <strong>"Adicionar"</strong> no canto superior direito.</p>
                </div>
                <button
                    onClick={handleClose}
                    className="mt-6 w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Entendi
                </button>
            </div>
        );
    }
    
    return null;
  }

  return (
    <Modal isOpen={modalState !== 'hidden'} onClose={handleClose} title="Instale o Reis Fit">
      {renderContent()}
    </Modal>
  );
};

export default PwaInstallPrompt;
