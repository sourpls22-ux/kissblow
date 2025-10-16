import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Girl from './pages/Girl'
import Dashboard from './pages/Dashboard'
import TopUp from './pages/TopUp'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Settings from './pages/Settings'
import PaymentHistory from './pages/PaymentHistory'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import About from './pages/About'
import ContactDMCA from './pages/ContactDMCA'
import HowItWorks from './pages/HowItWorks'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import NotFound from './pages/NotFound'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import AgeVerificationModal from './components/AgeVerificationModal'
import './utils/ageVerification' // Initialize age verification utilities

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <Router>
            <ScrollToTop />
            <div className="min-h-screen theme-bg w-full overflow-x-hidden">
              <AgeVerificationModal />
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Browse />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/browse/:keyword" element={<Browse />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/girl/:id" element={<Girl />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/topup" element={
                    <ProtectedRoute>
                      <TopUp />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/payment-history" element={
                    <ProtectedRoute>
                      <PaymentHistory />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/contact-dmca" element={<ContactDMCA />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogPost />} />
                  {/* Catch-all route for 404 pages */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
            </Router>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
