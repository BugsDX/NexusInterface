// External
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';

// Internal
import rpc from 'lib/rpc';
import Text from 'components/Text';
import Select from 'components/Select';
import Button from 'components/Button';
import Modal from 'components/Modal';
import Link from 'components/Link';
import {
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
  removeModal,
} from 'actions/overlays';
import { loadMyAccounts } from 'actions/account';
import { rpcErrorHandler } from 'utils/form';
import { getAccountOptions, getRegisteredFieldNames } from './selectors';
import AmountField from './AmountField';

const AccountSelectors = styled.div({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gridTemplateRows: 'auto auto',
  gridGap: '1em .5em',
  alignItems: 'center',
});

const Label = styled.label({
  paddingRight: '2em',
});

const Buttons = styled.div({
  marginTop: '1em',
  display: 'flex',
  justifyContent: 'flex-end',
});

const mapStateToProps = ({
  settings: { minConfirmations, fiatCurrency },
  core: {
    info: { locked },
  },
  myAccounts,
  form,
}) => ({
  minConfirmations,
  fiatCurrency,
  locked,
  accountOptions: getAccountOptions(myAccounts),
  fieldNames: getRegisteredFieldNames(
    form.moveBetweenAccounts && form.moveBetweenAccounts.registeredFields
  ),
});

const acctionCreators = {
  loadMyAccounts,
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
  removeModal,
};

/**
 * Internal JXS for the Move Between Accounts Modal
 *
 * @class MoveBetweenAccountsForm
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  acctionCreators
)
@reduxForm({
  form: 'moveBetweenAccounts',
  destroyOnUnmount: false,
  initialValues: {
    moveFrom: null,
    moveTo: null,
    amount: '',
    fiatAmount: '',
  },
  validate: ({ moveFrom, moveTo, amount }) => {
    const errors = {};
    if (!moveFrom) {
      errors.moveFrom = <Text id="sendReceive.Messages.NoAccounts" />;
    }
    if (!moveTo) {
      errors.moveTo = <Text id="sendReceive.Messages.NoAccounts" />;
    } else if (moveTo === moveFrom) {
      errors.moveTo = <Text id="sendReceive.Messages.SameAccount" />;
    }
    if (!amount || parseFloat(amount) <= 0) {
      errors.amount = <Text id="Alert.InvalidAmount" />;
    }
    return errors;
  },
  asyncBlurFields: ['sendTo'],
  asyncValidate: async ({ sendTo }) => {
    if (sendTo) {
      try {
        const result = await rpc('validateaddress', [sendTo]);
        if (!result.isvalid) {
          throw { sendTo: <Text id="Alert.InvalidAddress" /> };
        }
        if (result.ismine) {
          throw { sendTo: <Text id="Alert.registeredToThis" /> };
        }
      } catch (err) {
        throw { sendTo: <Text id="Alert.InvalidAddress" /> };
      }
    }
    return null;
  },
  onSubmit: ({ moveFrom, moveTo, amount }, dispatch, props) => {
    let minConfirmations = parseInt(props.minConfirmations);
    if (isNaN(minConfirmations)) {
      minConfirmations = defaultSettings.minConfirmations;
    }

    const params = [moveFrom, moveTo, parseFloat(amount)];
    return rpc('move', params, parseInt(props.minConfirmations));
  },
  onSubmitSuccess: (result, dispatch, props) => {
    props.closeModal();
    props.reset();
    props.loadMyAccounts();
    props.openSuccessDialog({
      message: <Text id="sendReceive.Messages.Success" />,
    });
  },
  onSubmitFail: rpcErrorHandler(<Text id="sendReceive.Messages.ErrorMoving" />),
})
class MoveBetweenAccountsForm extends Component {
  /**
   * Confirm Move
   *
   * @memberof MoveBetweenAccountsForm
   */
  confirmMove = e => {
    e.preventDefault();
    const { handleSubmit, invalid, locked, touch, fieldNames } = this.props;

    if (invalid) {
      // Mark the form touched so that the validation errors will be shown.
      // redux-form doesn't have the `touchAll` feature yet so we have to list all fields manually.
      // redux-form also doesn't have the API to get all the field names yet so we have to connect to the store to retrieve it manually
      touch(...fieldNames);
      return;
    }

    if (locked) {
      const {
        payload: { id: modalId },
      } = this.props.openErrorDialog({
        message: <Text id="sendReceive.Messages.NotLoggedIn" />,
        note: (
          <>
            <p>
              <Text id="sendReceive.Messages.NotLoggedInNote" />
            </p>
            <Link
              to="/Settings/Security"
              onClick={() => {
                this.props.removeModal(modalId);
                this.props.closeModal();
              }}
            >
              <Text id="sendReceive.Messages.LogInNow" />
            </Link>
          </>
        ),
      });
      return;
    }

    this.props.openConfirmDialog({
      question: <Text id="sendReceive.MoveNXS" />,
      callbackYes: handleSubmit,
    });
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof MoveBetweenAccountsForm
   */
  render() {
    return (
      <form onSubmit={this.confirmMove}>
        <AccountSelectors>
          <Label>
            <Text id="sendReceive.FromAccount" />
          </Label>
          <Field
            component={Select.RF}
            name="moveFrom"
            options={this.props.accountOptions}
            placeholder={<Text id="sendReceive.SelectAnAccount" />}
          />

          <Label>
            <Text id="sendReceive.ToAccount" />
          </Label>
          <Field
            component={Select.RF}
            name="moveTo"
            options={this.props.accountOptions}
            placeholder={<Text id="sendReceive.SelectAnAccount" />}
          />
        </AccountSelectors>

        <AmountField change={this.props.change} />

        <Buttons>
          <Button skin="primary" type="submit" disabled={this.props.submitting}>
            <Text id="sendReceive.MoveNXS" />
          </Button>
        </Buttons>
      </form>
    );
  }
}

/**
 * JSX for the Modal
 *
 * @memberof MoveBetweenAccountsForm
 *
 */
const MoveBetweenAccountsModal = () => (
  <Modal style={{ maxWidth: 650 }}>
    {closeModal => (
      <>
        <Modal.Header>
          <Text id="sendReceive.MoveNxsBetweenAccount" />
        </Modal.Header>

        <Modal.Body>
          <MoveBetweenAccountsForm closeModal={closeModal} />
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default MoveBetweenAccountsModal;
