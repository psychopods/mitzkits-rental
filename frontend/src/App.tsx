import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import StudentList from './pages/StudentList';
import KitList from './pages/KitList';
import BorrowList from './pages/BorrowList';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  return (
    <div className="app">
      <Navigation />
      <main>
        <Routes>
          <Route path="/students" element={<StudentList />} />
          <Route path="/kits" element={<KitList />} />
          <Route path="/borrow" element={<BorrowList />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;