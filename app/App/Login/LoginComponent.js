// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import Panel from 'components/Panel';
import { updateSettings } from 'actions/settingsActionCreators';
import * as Backend from 'scripts/backend-com';

const LicenseAgreementModalComponent = styled(Modal)({
  padding: '1px',
});

@connect(
  null,
  dispatch => ({
    turnOnTritium: () => dispatch(updateSettings({ tritium: true })),
  })
)
class LoginComponent extends React.Component {
  close = () => {
    Backend.RunCommand('API', { api: 'system', verb: 'get', noun: 'info' }, []);
    this.closeModal();
  };

  render() {
    return (
      <LicenseAgreementModalComponent
        fullScreen
        assignClose={close => {
          this.closeModal = close;
        }}
        {...this.props}
      >
        <Modal.Header>Tritium Login</Modal.Header>
        <Modal.Body>
          <Panel title={'Login'}>
            <Button
              skin="primary"
              wide
              onClick={this.close}
              style={{ fontSize: 17 }}
            >
              Legacy Mode
            </Button>

            <Button
              skin="primary"
              wide
              onClick={() => {
                this.props.turnOnTritium();
                this.close();
              }}
              style={{ fontSize: 17 }}
            >
              Login With Tritium
            </Button>
          </Panel>
        </Modal.Body>
      </LicenseAgreementModalComponent>
    );
  }
}

export default LoginComponent;
