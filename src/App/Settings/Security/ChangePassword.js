// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import rpc from 'lib/rpc';
import { getInfo } from 'actions/core';
import Text from 'components/Text';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import {
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
} from 'actions/overlays';
import { rpcErrorHandler } from 'utils/form';
import passwordInvalidChars from './passwordInvalidChars';

const ChangePasswordComponent = styled.form({
  flex: 2,
  marginRight: '1em',
});

/**
 * Change Password Form
 *
 * @class ChangePassword
 * @extends {Component}
 */
@connect(
  null,
  {
    getInfo,
    openConfirmDialog,
    openErrorDialog,
    openSuccessDialog,
  }
)
@reduxForm({
  form: 'changePassword',
  destroyOnUnmount: false,
  initialValues: {
    password: '',
    newPassword: '',
    newPasswordRepeat: '',
  },
  validate: ({ password, newPassword, newPasswordRepeat }) => {
    const errors = {};
    if (!password) {
      errors.password = <Text id="Settings.Errors.PasswordRequired" />;
    }
    if (passwordInvalidChars.test(newPassword)) {
      errors.newPassword = <Text id="Settings.Errors.PasswordInvalidChars" />;
    } else if (!newPassword || newPassword.length < 8) {
      errors.newPassword = <Text id="Settings.Errors.PasswordMinLength" />;
    } else if (newPassword !== newPassword.trim()) {
      errors.newPassword = <Text id="Settings.Errors.PasswordSpaces" />;
    }
    if (newPasswordRepeat !== newPassword) {
      errors.newPasswordRepeat = <Text id="Settings.Errors.PasswordsNoMatch" />;
    }
    return errors;
  },
  onSubmit: ({ password, newPassword }) =>
    rpc('walletpassphrasechange', [password, newPassword]),
  onSubmitSuccess: (result, dispatch, props) => {
    props.reset();
    props.openSuccessDialog({
      message: <Text id="Alert.PasswordHasBeenChanged" />,
    });
  },
  onSubmitFail: rpcErrorHandler(<Text id="Settings.Errors.ChangingPassword" />),
})
class ChangePassword extends Component {
  /**
   * Confirm Logout
   *
   * @memberof ChangePassword
   */
  confirmLogout = () => {
    this.props.openConfirmDialog({
      question: <Text id="Settings.ConfirmLogOut" />,
      callbackYes: async () => {
        try {
          await rpc('walletlock', []);
          this.props.getInfo();
        } catch (err) {
          const note = (err & err.error && err.error.message) || err;
          this.props.openErrorDialog({
            message: <Text id="Settings.Errors.LoggingOut" />,
            note,
          });
        }
      },
    });
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof ChangePassword
   */
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <ChangePasswordComponent onSubmit={handleSubmit}>
        <FieldSet legend={<Text id="Settings.ChangePassword" />}>
          <Text id="Settings.Password">
            {p => (
              <FormField
                connectLabel
                label={<Text id="Settings.PreviousPassword" />}
              >
                <Field
                  component={TextField.RF}
                  name="password"
                  type="password"
                  placeholder={p}
                />
              </FormField>
            )}
          </Text>
          <Text id="Settings.NewPassword">
            {np => (
              <FormField
                connectLabel
                label={<Text id="Settings.NewPassword" />}
              >
                <Field
                  component={TextField.RF}
                  name="newPassword"
                  type="password"
                  placeholder={np}
                />
              </FormField>
            )}
          </Text>
          <Text id="Settings.ConfirmPassword">
            {placeholder => (
              <FormField
                connectLabel
                label={<Text id="Settings.ReEnterPassword" />}
              >
                <Field
                  component={TextField.RF}
                  name="newPasswordRepeat"
                  type="password"
                  placeholder={placeholder}
                />
              </FormField>
            )}
          </Text>

          <Button
            type="submit"
            skin="primary"
            wide
            disabled={submitting}
            style={{ marginTop: '2em' }}
          >
            <Text id="Settings.ChangePassword" />
          </Button>
        </FieldSet>

        <Button wide onClick={this.confirmLogout}>
          <Text id="Settings.LogOut" />
        </Button>
      </ChangePasswordComponent>
    );
  }
}
export default ChangePassword;
