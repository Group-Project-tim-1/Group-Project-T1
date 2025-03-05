import { BrowserRouter, Routes, Route } from "react-router";
import PlayGround from "./views/Playground";
import HomePage from "./views/HomePage";


function App() {
  return (
    <BrowserRouter>

    <Routes>
      <Route path='/' element={<HomePage/>}/>
      <Route path="/plays" element={<PlayGround/>}/>
    </Routes>
    
    </BrowserRouter>
  )
}

export default App
