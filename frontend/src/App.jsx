import { useState } from 'react';
import './index.css';
import HeaderNav from './components/HeaderNav';
import RescueCopilot from './components/RescueCopilot';
import Overview from './pages/Overview';
import TransactionExplorer from './pages/TransactionExplorer';
import AIDecisionView from './pages/AIDecisionView';
import AuditTrail from './pages/AuditTrail';
import Exceptions from './pages/Exceptions';
import BatchEvaluation from './pages/BatchEvaluation';

const PAGES = {
  overview: Overview,
  transactions: TransactionExplorer,
  ai_decision: AIDecisionView,
  audit: AuditTrail,
  exceptions: Exceptions,
  batch: BatchEvaluation
};

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [selectedTxnId, setSelectedTxnId] = useState(null);

  const PageComponent = PAGES[activePage] || Overview;

  const navigateTo = (page, txnId = null) => {
    setActivePage(page);
    if (txnId) setSelectedTxnId(txnId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      {/* Top Floating Command Navigation Bar */}
      <HeaderNav activePage={activePage} onNavigate={navigateTo} />

      {/* Main Responsive Canvas */}
      <main className="content-container">
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
  );
}
