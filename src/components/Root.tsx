import { IconContext } from 'react-icons';
import { Outlet } from 'react-router-dom';

import Footer from './Footer';
import NavBar from './NavBar';

const Root = (): JSX.Element => {
  return (
    <div>
      <IconContext.Provider value={{ className: 'react-icon' }}>
        <NavBar />
        <Outlet />
        <Footer />
      </IconContext.Provider>
    </div>
  );
};

export default Root;
