import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import PlayGround from './views/Playground';
import BaseLayout from './views/BaseLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<BaseLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/playground" element={<PlayGround />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
