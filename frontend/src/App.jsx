import { useState } from 'react';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import HeaderNav from './components/HeaderNav';
import RescueCopilot from './components/RescueCopilot';
import HomeHero from './pages/HomeHero';
import Overview from './pages/Overview';
import TransactionExplorer from './pages/TransactionExplorer';
import AIDecisionView from './pages/AIDecisionView';
import AuditTrail from './pages/AuditTrail';
import Exceptions from './pages/Exceptions';
import BatchEvaluation from './pages/BatchEvaluation';

const PAGES = {
  home: HomeHero,
  overview: Overview,
  transactions: TransactionExplorer,
  ai_decision: AIDecisionView,
  audit: AuditTrail,
  exceptions: Exceptions,
  batch: BatchEvaluation
};

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedTxnId, setSelectedTxnId] = useState(null);

  const PageComponent = PAGES[activePage] || HomeHero;

  const navigateTo = (page, txnId = null) => {
    setActivePage(page);
    if (txnId) setSelectedTxnId(txnId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <div className={`app-shell ${activePage === 'home' ? 'is-home-page' : ''}`}>
        {/* Top Floating Command Navigation Bar */}
        <HeaderNav activePage={activePage} onNavigate={navigateTo} />

        {/* Main Responsive Canvas */}
        <main className={activePage === 'home' ? 'hero-main-container' : 'content-container'}>
          <PageComponent
            onNavigate={navigateTo}
            selectedTxnId={selectedTxnId}
            setSelectedTxnId={setSelectedTxnId}
          />
        </main>

        {/* Floating RescueCopilot Assistant */}
        <RescueCopilot
          selectedTxnId={selectedTxnId}
          onNavigate={navigateTo}
        />
      </div>
    </AuthProvider>
  );
}
