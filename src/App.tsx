/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Layout } from './components/Layout';
import LandingNew from './pages/LandingNew';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Detail from './pages/Detail';
import Notes from './pages/Notes';
import Canvas from './pages/Canvas';
import Chat from './pages/Chat';
import Graph from './pages/Graph';
import Capture from './pages/Capture';
import Review from './pages/Review';
import Timeline from './pages/Timeline';
import Profile from './pages/Profile';
import Agent from './pages/Agent';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingNew />
          </motion.div>
        } />
        <Route path="/login" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Login />
          </motion.div>
        } />
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="note" element={<Notes />} />
          <Route path="note/:id" element={<Detail />} />
          <Route path="note/canvas/:id" element={<Canvas />} />
          <Route path="chat" element={<Chat />} />
          <Route path="graph" element={<Graph />} />
          <Route path="capture" element={<Capture />} />
          <Route path="review" element={<Review />} />
          <Route path="agent" element={<Agent />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Profile />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}
