import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login/login'; // ✅ updated path
import Home  from './pages/Home/Home';
// ✅ updated path

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
};

export default App;