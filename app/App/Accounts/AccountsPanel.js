// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';

const PanelHolder = styled.div({
  background: 'green',
  flex: '1',
  padding: '1rem',
});

class AccountsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userAccounts: [],
    };
  }

  componentDidMount() {
    this.tempMakeAccounts();
  }

  tempMakeAccounts() {
    const accountstemp = [
      {
        name: 'Default',
        address: 'asdsasdsadsdaasdasddsaas',
        token: 'NXS',
        tokenaddress: 'ppppppppppppppppppppppp',
        balance: '99999',
      },
      {
        name: 'Savings',
        address: 'fffffffffffffffffff',
        token: 'mytoken',
        tokenaddress: 'dddddddddddddddddd',
        balance: '8080',
      },
      {
        name: 'Savings',
        address: 'fffffffffffffffffff',
        token: 'mytoken',
        tokenaddress: 'dddddddddddddddddd',
        balance: '8080',
      },
      {
        name: 'Savings',
        address: 'fffffffffffffffffff',
        token: 'mytoken',
        tokenaddress: 'dddddddddddddddddd',
        balance: '8080',
      },
      {
        name: 'Savings',
        address: 'fffffffffffffffffff',
        token: 'mytoken',
        tokenaddress: 'dddddddddddddddddd',
        balance: '8080',
      },
    ];

    this.setState({
      userAccounts: accountstemp,
    });
  }

  returnBoxes() {
    return this.state.userAccounts.map(e => {
      return this.makeBox(e);
    });
  }

  makeBox(e) {
    return (
      <div style={{ background: 'black', padding: '1em' }}>
        {e.name}
        <br />
        {e.address}
        <br />
        {e.token}
        <br />
        {e.tokenaddress}
        <br />
        {e.balance}
      </div>
    );
  }

  render() {
    return (
      <PanelHolder>
        {'Accounts'}
        <div style={{ overflow: 'scroll' }}>{this.returnBoxes()}</div>
      </PanelHolder>
    );
  }
}

export default AccountsPanel;
