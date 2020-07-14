import React, { PureComponent } from 'react';
import './App.css';
import Search from './components/Search';
import Buckets from './components/Buckets';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import NavBar from './components/NavBar';

class App extends PureComponent {
  render() {
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
