// External Dependencies
import React, { Component } from 'react';
import { remote } from 'electron';
import { Route, Redirect, Switch } from 'react-router';
import styled from '@emotion/styled';
import { connect } from 'react-redux';

// Internal Global Dependencies
import ContextMenuBuilder from 'contextmenu';
import Panel from 'components/Panel';
import Tab from 'components/Tab';

// Internal Local Dependencies
import Transfer from './transfer';
import History from './history';
import Information from './Information';

const PageComponent = styled.div({
  height: '100%',
  padding: '1em',
  margin: '1em',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

const TabBar = styled(Tab.Bar)({
  flexShrink: 0,
});

/**
 * Terminal Page
 *
 * @class Terminal
 * @extends {Component}
 */
class UnnamedASD extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
  }
  // React Method (Life cycle hook)
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  // Class Methods
  /**
   * Set up context menu
   *
   * @param {*} e
   * @memberof Terminal
   */
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  // Mandatory React method
  /**
   * React Render
   *
   * @returns
   * @memberof Terminal
   */
  render() {
    const { match } = this.props;
    return (
      <Panel
        title={'sasaddsa'}
        bodyScrollable={false}
        style={{ padding: '1em' }}
      >
        <PageComponent>
          <TabBar>
            <Tab link={`/Names/hhh/transfer`} text={'Transfer'} />
            <Tab link={`/Names/hhh/history`} text={'History'} />

            <Tab link={`/Names/hhh/Information`} text={'Information'} />
          </TabBar>

          <Switch>
            <Route path={`/Names/hhh/transfer`} component={Transfer} />
            <Route path={`/Names/hhh/history`} component={History} />
            <Route path={`/Names/hhh/Information`} component={Information} />
          </Switch>
        </PageComponent>
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default UnnamedASD;
