// External
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';
import { history } from 'store';

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

const LoginFieldSet = styled(FieldSet)({
  maxWidth: '50%',
  margin: '0 auto',
});

@connect(
  null,
  dispatch => ({
    turnOnTritium: () => dispatch(updateSettings({ tritium: true })),
    tempTurnOffLogIn: () => dispatch({ type: 'TEMP_LOG_IN', payload: true }),
  })
)
@reduxForm({
  form: 'login',
  destroyOnUnmount: false,
  initialValues: {
    username: '',
    password: '',
    pin: '',
  },
  validate: ({ username, password, pin }, props) => {
    const errors = {};
    console.log(`${username} , ${password} , ${pin}`);

    if (!username) {
      errors.username = <Text id="Settings.Errors.LoginUsername" />;
    }
    if (!password) {
      errors.password = <Text id="Settings.Errors.LoginPassword" />;
    }
    if (!pin) {
      errors.pin = <Text id="Settings.Errors.LoginPin" />;
    }
    return errors;
  },
  onSubmit: ({ username, password, pin }, props) => {
    console.log(this);
    return Backend.RunCommand(
      'API',
      { api: 'users', verb: 'login', noun: 'user' },
      [{ username: username, password: password, pin: pin }]
    );
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    UIController.showNotification(<Text id="Settings.LoggedIn" />, 'success');
    console.log('PASS');
    this.props.turnOnTritium();
    this.close();
  },
  onSubmitFail: (errors, dispatch, submitError) => {
    console.log('FAIL');
    if (!errors || !Object.keys(errors).length) {
      let note = submitError || <Text id="Common.UnknownError" />;
      if (
        submitError === 'Error: The wallet passphrase entered was incorrect.'
      ) {
        note = <Text id="Alert.IncorrectPasssword" />;
      } else if (submitError === 'value is type null, expected int') {
        note = <Text id="Alert.FutureDate" />;
      }
      UIController.openErrorDialog({
        message: <Text id="Settings.Errors.LoggingIn" />,
        note: note,
      });
    }
  },
})
class LoginComponent extends React.Component {
  close = () => {
    history.push('/');
    this.closeModal();
  };

  asddfgh = () => {
    this.props.onCloseCreate();
    this.closeModal();
  };

  legacyClose = () => {
    this.props.tempTurnOffLogIn();
    this.props.onCloseLegacy();
    this.closeModal();
  };

  render() {
    const { handleSubmit } = this.props;
    console.log(this.props);
    return (
      <LicenseAgreementModalComponent
        fullScreen
        assignClose={close => {
          this.closeModal = close;
        }}
        {...this.props}
      >
        <Modal.Header>Tritium User</Modal.Header>
        <Modal.Body>
          <Panel title={'Login'}>
            <form onSubmit={handleSubmit}>
              <LoginFieldSet legend="Login">
                <FormField connectLabel label={<Text id="Settings.Username" />}>
                  <Field
                    component={TextField.RF}
                    name="username"
                    type="text"
                    placeholder={'Username'}
                  />
                </FormField>
                <FormField connectLabel label={<Text id="Settings.Password" />}>
                  <Field
                    component={TextField.RF}
                    name="password"
                    type="text"
                    placeholder={'Password'}
                  />
                </FormField>
                <FormField connectLabel label={<Text id="Settings.Pin" />}>
                  <Field
                    component={TextField.RF}
                    name="pin"
                    type="text"
                    placeholder={'Pin'}
                  />
                </FormField>
                <div style={{ padding: '5px', paddingTop: '10px' }}>
                  <Button
                    skin="primary"
                    type="submit"
                    wide
                    style={{ fontSize: 17, padding: '5px' }}
                  >
                    Login With Tritium
                  </Button>
                </div>
              </LoginFieldSet>
            </form>
            <div
              style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'grid',
                alignItems: 'center',
                gridTemplateColumns: 'auto auto',
                gridTemplateRows: 'auto',
                gridGap: '1em .5em',
              }}
            >
              <Button
                skin="primary"
                type="submit"
                wide
                onClick={this.asddfgh}
                style={{ fontSize: 17, marginTop: '5px' }}
              >
                Create Account
              </Button>
              <Button
                skin="primary"
                onClick={this.close}
                style={{ fontSize: 17, padding: '5px' }}
              >
                Forgot Password/Pin
              </Button>
              <Button
                skin="primary"
                onClick={this.legacyClose}
                style={{ fontSize: 17, padding: '5px' }}
              >
                Legacy Mode
              </Button>
            </div>
          </Panel>
        </Modal.Body>
      </LicenseAgreementModalComponent>
    );
  }
}

export default LoginComponent;
