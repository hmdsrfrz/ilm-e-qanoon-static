// src/App.tsx — full rewrite keeping all existing routes inside Shell
import { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useUiStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import LandingPage from '@/features/landing/LandingPage';
import { Shell } from '@/components/layout/Shell';

const HARDCODED_SESSION_ID = '2f327dd1-c218-4c5e-bd78-8b85e09c9fad';

// Lazy load routes
const WelcomeScreen = lazy(() => import('@/features/welcome/WelcomeScreen'));
const ChatView = lazy(() => import('@/features/chat/ChatView'));
const DocumentsPage = lazy(() => import('@/features/documents/DocumentsPage'));
const GraphPage = lazy(() => import('@/features/graph/GraphPage'));

// Framer Motion variants
const landingVariants = {
  initial: { y: '-100vh', opacity: 0 },   /* starts above — enters from top */
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] as const, delay: 0.1 },
  },
  exit: {
    y: '-100vh',
    opacity: 0,
    transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] as const },
  },
};

const chatVariants = {
  initial: { y: '100vh', opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.85,
      ease: [0.76, 0, 0.24, 1] as const,
      delay: 0.1,   // slight delay so landing starts moving first
    },
  },
  exit: {
    y: '100vh',      /* drops downward — reverse of the entry */
    opacity: 0,
    transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const },
  },
};

function RouteLoading() {
  return (
    <div className="flex h-full items-center justify-center bg-pk-black">
      <div className="flex flex-col items-center gap-4">
        <span className="font-mono text-[10px] text-pk-green uppercase tracking-[0.3em] animate-pulse">
          Retrieving Archive...
        </span>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route 
          path="/" 
          element={
            <Suspense fallback={<RouteLoading />}>
              <WelcomeScreen />
            </Suspense>
          } 
        />
        <Route 
          path="/chat/:sessionId" 
          element={
            <Suspense fallback={<RouteLoading />}>
              <ChatView />
            </Suspense>
          } 
        />
        <Route
          path="/documents"
          element={
            <Suspense fallback={<RouteLoading />}>
              <DocumentsPage />
            </Suspense>
          }
        />
        <Route
          path="/graph"
          element={
            <Suspense fallback={<RouteLoading />}>
              <GraphPage />
            </Suspense>
          }
        />
        {/* Fallback route */}
        <Route 
          path="*" 
          element={
            <Suspense fallback={<RouteLoading />}>
              <WelcomeScreen />
            </Suspense>
          } 
        />
      </Route>
    </Routes>
  );
}

function SessionRedirect() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const hasEnteredApp  = useUiStore((s) => s.hasEnteredApp);
  const selectSession  = useChatStore((s) => s.selectSession);

  useEffect(() => {
    if (!hasEnteredApp) return;
    // Only redirect from the welcome screen — leave /graph, /documents, /chat alone
    if (location.pathname !== '/') return;
    selectSession(HARDCODED_SESSION_ID);
    navigate(`/chat/${HARDCODED_SESSION_ID}`, { replace: true });
  }, [hasEnteredApp, location.pathname, navigate, selectSession]);

  return null;
}

export default function App() {
  const hasEnteredApp = useUiStore((s) => s.hasEnteredApp);
  const loadSessions  = useChatStore((s) => s.loadSessions);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <BrowserRouter>
      <SessionRedirect />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            color: '#F5F0E8',
            border: '1px solid #2a2a2a',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '12px',
          },
        }}
      />

      {/* Outer container — clips the flying animation */}
      <div
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',  /* clips the flying animation — MUST stay */
          backgroundColor: '#0a0a0a',
        }}
      >
        <AnimatePresence mode="sync">
          {!hasEnteredApp ? (
            /* ── LANDING PAGE — flies upward on exit ── */
            <motion.div
              key="landing"
              variants={landingVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: 20,
              }}
            >
              <LandingPage />
            </motion.div>
          ) : (
            /* ── CHAT APP — rises from below on enter ── */
            <motion.div
              key="app"
              variants={chatVariants}
              initial="initial"
              animate="animate"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: 10,
              }}
            >
              {/* AnimatedRoutes contains all existing routes inside Shell */}
              <AnimatedRoutes />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}
