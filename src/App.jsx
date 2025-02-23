// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import TcgSeriesPage from './pages/TcgSeriesPage';
import SeriesPage from './pages/SeriesPage';
import SetPage from './pages/SetPage';
import CardDetailPage from './pages/CardDetailPage';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cards" element={<TcgSeriesPage />} />
        <Route path="/cards/:seriesId" element={<SeriesPage />} />
        <Route path="/cards/:seriesId/sets/:setId" element={<SetPage />} />
        <Route path="/cards/:seriesId/sets/:setId/card/:cardId" element={<CardDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
