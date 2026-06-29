// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Blog from './pages/Blog';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import PostDetail from './pages/PostDetail';
import EditUser from './pages/EditUser';
import Albums from './pages/Albums';
import AlbumDetail from './pages/AlbumDetail';
import UrlShortener from './pages/UrlShortener';
import ProtectedRoute from './components/Common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* ── Public ────────────────────────────────── */}
            <Route path="/"         element={<Home />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/post/:id" element={<PostDetail />} />

            {/* ── Protected (logged-in users only) ──────── */}
            <Route path="/edit-user" element={<ProtectedRoute><EditUser /></ProtectedRoute>} />
            <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
            <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/edit-post/:id" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
            <Route path="/url-shortener" element={<ProtectedRoute><UrlShortener /></ProtectedRoute>} />

            {/* Albums — registered users only */}
            <Route path="/profile/:username/albums" element={<ProtectedRoute><Albums /></ProtectedRoute>} />
            <Route path="/albums/:id" element={<ProtectedRoute><AlbumDetail /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
