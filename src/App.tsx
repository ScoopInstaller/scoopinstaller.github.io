import { PureComponent } from 'react';

import './App.css';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import Buckets from './components/Buckets';
import NavBar from './components/NavBar';
import Search from './components/Search';

class App extends PureComponent {
  render(): JSX.Element {
    return (
      <Router>
        <NavBar />

        <Switch>
          <Route path="/apps/:page?" component={Search} />
          <Route path="/buckets" component={Buckets} />
          <Route path="/">
            <Redirect to="/apps" />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
