import './App.css';
import { HashRouter, Routes, Route } from 'react-router-dom';

import Buckets from './components/Buckets';
import Root from './components/Root';
import Search from './components/Search';
import Home from './components/Home';

const App = (): JSX.Element => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Root />}>
          <Route path="apps" element={<Search />} />
          <Route path="buckets" element={<Buckets />} />
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
