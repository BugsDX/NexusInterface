// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';

const PanelHolder = styled.div({
  background: '#ff9e2c',
  flex: '0.35',
  padding: '1rem',
});

class UserPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <PanelHolder>{'User'}</PanelHolder>;
  }
}

export default UserPanel;
