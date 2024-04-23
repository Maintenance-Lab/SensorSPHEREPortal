import React from "react";
import Home from "./Pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./Pages/NotFound/NotFound";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Home />} />
      {/* <Route path="users/:id" element={<Users />} /> */}
    </Routes>
  </BrowserRouter>
);

export default App;
