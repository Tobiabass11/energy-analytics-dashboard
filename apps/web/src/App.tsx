import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { LineDetailPage } from './pages/LineDetailPage';
import { OverviewPage } from './pages/OverviewPage';

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/lines/:lineId" element={<LineDetailPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
