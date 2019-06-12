// External
import React, { Component } from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { Route, Switch } from 'react-router';
import { Provider } from 'react-redux';
// import IntlWrapper from './IntlWrapper';
import styled from '@emotion/styled';

// Internal
import UIController from 'components/UIController';
import GlobalStyles from 'components/GlobalStyles';
import Overview from './Overview';
import Header from './Header';
import Navigation from './Navigation';
import SendPage from './Legacy/SendPage';
import Transactions from './Legacy/Transactions';
import Market from './Legacy/Market';
import AddressBook from './Legacy/AddressBook';
import Settings from './Settings';
import Terminal from './Terminal';
import StyleGuide from './Legacy/StyleGuide';
import About from './About';
import Modules from './Modules';
// import Exchange from './Exchange';
// import TrustList from './TrustList';
import AppBackground from './AppBackground';
import ThemeController from './ThemeController';

//NEW TRITIUM
import Login from './Login';
import Accounts from './Accounts';
import Assets from './Assets';
import Contacts from './Contacts';
import Finance from './Finance';
import Tokens from './Tokens';

const AppWrapper = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'grid',
  height: '100%',
  gridTemplateColumns: '1fr',
  gridTemplateRows: '74px auto 75px',
  gridTemplateAreas: '"header" "content" "navigation"',
});

const Main = styled.main({
  gridArea: 'content',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'stretch',
});

/**
 * Main App Page
 *
 * @export
 * @class App
 * @extends {Component}
 */
export default class App extends Component {
  /**
   * React Render
   *
   * @returns
   * @memberof App
   */
  render() {
    const { store, history } = this.props;
    return (
      <Provider store={store}>
        <ThemeController>
          <ConnectedRouter history={history}>
            <UIController>
              <div>
                <GlobalStyles />
                <AppBackground />
                <AppWrapper>
                  <Header />
                  <Main>
                    <Switch>
                      <Route exact path="/" component={Overview} />
                      <Route
                        exact
                        path="/Legacy/SendPage"
                        component={SendPage}
                      />
                      <Route
                        exact
                        path="/Legacy/Transactions"
                        component={Transactions}
                      />
                      <Route exact path="/Legacy/Market" component={Market} />
                      <Route
                        exact
                        path="/Legacy/AddressBook"
                        component={AddressBook}
                      />
                      <Route path="/Settings" component={Settings} />
                      <Route path="/Terminal" component={Terminal} />
                      <Route
                        exact
                        path="/Legacy/StyleGuide"
                        component={StyleGuide}
                      />

                      <Route exact path="/About" component={About} />
                      <Route path="/Modules/:name" component={Modules} />
                      {/*New Tritium Routes*/}
                      <Route exact path="/Finance" component={Finance} />
                      <Route exact path="/Tokens" component={Tokens} />
                      <Route exact path="/Login" component={Login} />
                      <Route exact path="/Assets" component={Assets} />
                      <Route exact path="/Contacts" component={Contacts} />
                      <Route exact path="/Accounts" component={Accounts} />
                    </Switch>
                  </Main>
                  <Navigation />
                </AppWrapper>
              </div>
            </UIController>
          </ConnectedRouter>
        </ThemeController>
      </Provider>
    );
  }
}
