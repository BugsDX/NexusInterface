// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal

import Panel from 'components/Panel';
import UserPanel from './UserPanel';
import AccountsPanel from './AccountsPanel';

const PanelHolder = styled.div({
  display: 'flex',
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.common };
};
const mapDispatchToProps = dispatch => ({});

class Accounts extends Component {
  // Mandatory React method
  render() {
    return (
      <Panel title={'Accounts'}>
        {'TEST ACCOUNTS'}
        <PanelHolder>
          <UserPanel />
          <AccountsPanel />
        </PanelHolder>
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Accounts);
