// External
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import Panel from 'components/Panel';
import Text from 'components/Text';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import FieldSet from 'components/FieldSet';
import { updateSettings } from 'actions/settingsActionCreators';
import * as Backend from 'scripts/backend-com';
import UIController from 'components/UIController';

const AttemptRecModalComponent = styled(Modal)({
  padding: '1px',
});

class AttemptRecoveryComponent extends React.Component {
  render() {
    return (
      <AttemptRecModalComponent
        fullScreen
        assignClose={close => {
          this.closeModal = close;
        }}
        {...this.props}
      >
        <Modal.Header>Recovery</Modal.Header>
        <Modal.Body>
          <Panel title={'Recovery'}>
            <div> {'asdasdsa'}</div>
            <Button
              skin="primary"
              onClick={() => this.props.onCloseBack()}
              style={{ fontSize: 17, padding: '5px' }}
            >
              Cancel
            </Button>
          </Panel>
        </Modal.Body>
      </AttemptRecModalComponent>
    );
  }
}

export default AttemptRecoveryComponent;
