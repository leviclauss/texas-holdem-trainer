import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import RangeTrainer from './pages/RangeTrainer';
import Concepts from './pages/Concepts';
import ConceptDetail from './pages/ConceptDetail';
import Daily from './pages/Daily';
import Profile from './pages/Profile';

export default function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-felt-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/range-trainer" element={<RangeTrainer />} />
            <Route path="/concepts" element={<Concepts />} />
            <Route path="/concepts/:id" element={<ConceptDetail />} />
            <Route path="/daily" element={<Daily />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </UserProvider>
  );
}
