import { IconContext } from 'react-icons';
import { Outlet } from 'react-router-dom';

import ColorSchemeProvider from '../colorscheme/ColorSchemeProvider';
import Footer from './Footer';
import NavBar from './NavBar';

const Root = (): JSX.Element => {
  return (
    <div>
      <IconContext.Provider value={{ className: 'react-icon' }}>
        <ColorSchemeProvider>
          <NavBar />
          <Outlet />
          <Footer />
        </ColorSchemeProvider>
      </IconContext.Provider>
    </div>
  );
};

export default Root;
