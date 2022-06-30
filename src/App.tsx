import './App.css';
import { Helmet } from 'react-helmet';
import { HashRouter, Routes, Route } from 'react-router-dom';

import Buckets from './components/Buckets';
import Home from './components/Home';
import Root from './components/Root';
import Search from './components/Search';

const App = (): JSX.Element => {
  return (
    <>
      <Helmet defaultTitle="Scoop" titleTemplate="Scoop - %s" />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Root />}>
            <Route path="apps" element={<Search />} />
            <Route path="buckets" element={<Buckets />} />
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </HashRouter>
    </>
  );
};

export default App;
