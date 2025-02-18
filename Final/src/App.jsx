import { useState } from 'react'
import '../src/css/Global.css'
import Login from "./componentes/Login";
import Home from "./componentes/Home";
import Sucursales from "./componentes/Sucursales";


import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const App = () => {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/sucursales" element={<Sucursales />} />


          </Routes>
      </Router>
  );
};

export default App;