import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { LandingPage } from '@/pages/LandingPage';
import { ReportPage } from '@/pages/ReportPage';
import { SignalsPage } from '@/pages/SignalsPage';
import { SignalDetailPage } from '@/pages/SignalDetailPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { MapPage } from '@/pages/MapPage';
import { AboutPage } from '@/pages/AboutPage';
import { DemoPage } from '@/pages/DemoPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/signals" element={<SignalsPage />} />
          <Route path="/signals/:id" element={<SignalDetailPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Route>
        <Route element={<Layout fullWidth />}>
          <Route path="/map" element={<MapPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
