import { useState } from 'react'
import '../src/css/Global.css'
import Login from "./componentes/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const App = () => {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
          </Routes>
      </Router>
  );
};

export default App;