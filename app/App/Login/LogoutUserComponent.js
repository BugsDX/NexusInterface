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

const LicenseAgreementModalComponent = styled(Modal)({
  padding: '1px',
});

const UserInfoBox = styled.div({
  marginLeft: '1em',
  border: 'white 1px',
});

const LoginFieldSet = styled(FieldSet)({
  margin: '0 auto',
});

@connect(
  null,
  dispatch => ({
    turnOnTritium: () => dispatch(updateSettings({ tritium: true })),
  })
)
class LogoutUserComponent extends React.Component {
  close = () => {
    this.closeModal();
  };

  legacyClose = () => {
    this.props.onCloseLegacy();
    this.closeModal();
  };

  logoutClose = () => {
    //Backend.RunCommand('api', { api: 'users', verb: 'logout', noun: 'user' }, [
    //  this.props.userInfo.sessionID,
    //]);
    this.props.onCloseLogout();
    this.closeModal();
  };

  render() {
    const { handleSubmit, userInfo } = this.props;
    const { genesisID, sessionID } = userInfo;
    console.log(this.props);
    return (
      <LicenseAgreementModalComponent
        fullScreen
        assignClose={close => {
          this.closeModal = close;
        }}
        {...this.props}
      >
        <Modal.Header>Tritium</Modal.Header>
        <Modal.Body>
          <Panel title={'Logout'}>
            <form onSubmit={handleSubmit}>
              <LoginFieldSet legend="Logout">
                {'Are you sure you want to logout of this User:'}
                <UserInfoBox>
                  {`Genesis: ${genesisID}`}
                  <br />
                  {`Session: ${sessionID}`}
                </UserInfoBox>
                <div style={{ padding: '5px', paddingTop: '10px' }}>
                  <Button
                    skin="primary"
                    type="submit"
                    onClick={this.logoutClose}
                    wide
                    style={{ fontSize: 17, marginTop: '5px' }}
                  >
                    Logout User
                  </Button>
                </div>
                <div
                  style={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    display: 'grid',
                    alignItems: 'center',
                    gridTemplateColumns: 'auto',
                    gridTemplateRows: 'auto',
                    gridGap: '1em .5em',
                  }}
                >
                  <Button
                    skin="primary"
                    onClick={this.close}
                    style={{ fontSize: 17, padding: '5px' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    skin="primary"
                    onClick={this.close}
                    style={{ fontSize: 17, padding: '5px' }}
                  >
                    Legacy Mode
                  </Button>
                </div>
              </LoginFieldSet>
            </form>
          </Panel>
        </Modal.Body>
      </LicenseAgreementModalComponent>
    );
  }
}

export default LogoutUserComponent;
