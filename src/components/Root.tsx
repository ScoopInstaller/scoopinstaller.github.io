import { Outlet } from 'react-router-dom';

import NavBar from './NavBar';

const Root = (): JSX.Element => {
  return (
    <div>
      <NavBar />
      <Outlet />
    </div>
  );
};

export default Root;
