import { IconContext } from 'react-icons';
import { Outlet } from 'react-router-dom';

import NavBar from './NavBar';

const Root = (): JSX.Element => {
  return (
    <div>
      <NavBar />
      <IconContext.Provider value={{ className: 'react-icon' }}>
        <Outlet />
      </IconContext.Provider>
    </div>
  );
};

export default Root;
