import './App.css';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import Buckets from './components/Buckets';
import Root from './components/Root';
import Search from './components/Search';

const App = (): JSX.Element => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Root />}>
          <Route path="apps" element={<Search />} />
          <Route path="buckets" element={<Buckets />} />
          <Route index element={<Navigate to="apps" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
