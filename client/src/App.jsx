import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext.jsx';
import HomePage from './pages/HomePage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { background: '#1a1a2e', color: '#fff', borderRadius: '12px' }
          }}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
