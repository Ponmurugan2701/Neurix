import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './home'; // Import your Home component
import CSVReader from './csvreader';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Routes>
        <Route path="/csv" element={<CSVReader />} />
      </Routes>
    </Router>
  );
}

export default App;
