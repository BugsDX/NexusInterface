// External
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, InfoForm } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import Text from 'components/Text';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import FieldSet from 'components/FieldSet';
import { updateSettings } from 'actions/settingsActionCreators';
import * as Backend from 'scripts/backend-com';
import UIController from 'components/UIController';
import * as TYPE from 'actions/actiontypes';

const CreateNameModalComponent = styled(Modal)({
  padding: '1px',
});

const CreateNameFieldSet = styled(FieldSet)({
  maxWidth: '100%',
  margin: '0 auto',
});

@connect(
  null,
  dispatch => ({
    setUserName: returnData => {
      dispatch({ type: TYPE.TRITIUM_SET_USER_NAME, payload: returnData });
    },
  })
)
class CreateName extends React.Component {
  close = () => {
    this.closeModal();
  };

  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <CreateNameModalComponent
        assignClose={close => {
          this.closeModal = close;
        }}
        {...this.props}
      >
        <Modal.Header>Create New Name</Modal.Header>
        <Modal.Body>
          <CreateNameForm closeModal={this.close} {...this.props} />
        </Modal.Body>
      </CreateNameModalComponent>
    );
  }
}

export default CreateName;

@reduxForm({
  form: 'createNewName',
  destroyOnUnmount: true,
  initialValues: {
    name: '',
    registerAddress: '',
  },
  validate: ({ name, registerAddress }, props) => {
    const errors = {};
    console.log(`${name} , ${registerAddress}`);

    if (!name) {
      errors.username = <Text id="Settings.Errors.LoginUsername" />;
    }
    if (!registerAddress) {
      errors.password = <Text id="Settings.Errors.LoginPassword" />;
    }
    return errors;
  },
  onSubmit: async ({ name, registerAddress }, dispatch, props) => {
    console.log('ONSUBMIT');
    console.log(props);
    const asdgh = await Backend.RunCommand(
      'API',
      { api: 'names', verb: 'create', noun: 'name' },
      [{ name: name, register_address: registerAddress, pin: pin }]
    );
    console.log(asdgh);
    return asdgh;
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    console.log('SUCESSS');
    UIController.showNotification(<Text id="Settings.LoggedIn" />, 'success');
    props.closeModal();
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
class CreateNameForm extends React.Component {
  render() {
    const { handleSubmit, submitting } = this.props;
    console.log(this.props);
    return (
      <form onSubmit={handleSubmit}>
        <CreateNameFieldSet legend="Create Name">
          <FormField connectLabel label={<Text id="Names.Name" />}>
            <Field
              component={TextField.RF}
              name="name"
              type="text"
              placeholder={'Name'}
            />
          </FormField>
          <FormField connectLabel label={<Text id="Names.RegisterAddress" />}>
            <Field
              component={TextField.RF}
              name="registerAddress"
              type="text"
              placeholder={'Register Address'}
            />
          </FormField>
          <div style={{ padding: '5px', paddingTop: '10px' }}>
            <Button
              skin="primary"
              onClick={handleSubmit}
              wide
              disabled={submitting}
              style={{ fontSize: 17, margin: '5px' }}
            >
              Create New Name
            </Button>
            <Button
              skin="primary"
              onClick={this.props.closeModal}
              wide
              style={{ fontSize: 17, margin: '5px' }}
            >
              Cancel
            </Button>
          </div>
        </CreateNameFieldSet>
      </form>
    );
  }
}
