// External Dependencies
import React, { Component } from 'react';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import TextField from 'components/TextField';
import Button from 'components/Button';
import Text from 'components/Text';
import * as Backend from 'scripts/backend-com';
import UIController from 'components/UIController';

const Container = styled.div(({ theme }) => ({
  margin: '1em',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

export default class PinLogin extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Modal assignClose={closeModal => (this.closeModal = closeModal)}>
        <div />
      </Modal>
    );
  }
}
