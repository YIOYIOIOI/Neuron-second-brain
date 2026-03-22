/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Detail from './pages/Detail';
import Chat from './pages/Chat';
import Graph from './pages/Graph';
import Capture from './pages/Capture';
import Review from './pages/Review';
import Timeline from './pages/Timeline';
import Writing from './pages/Writing';
import Profile from './pages/Profile';
import Agent from './pages/Agent';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="note/:id" element={<Detail />} />
          <Route path="chat" element={<Chat />} />
          <Route path="graph" element={<Graph />} />
          <Route path="capture" element={<Capture />} />
          <Route path="review" element={<Review />} />
          <Route path="writing" element={<Writing />} />
          <Route path="agent" element={<Agent />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}
