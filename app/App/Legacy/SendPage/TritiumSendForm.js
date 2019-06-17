// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, FieldArray, formValueSelector } from 'redux-form';
import styled from '@emotion/styled';

// Internal Global
import * as Backend from 'scripts/backend-com';
import { defaultSettings } from 'api/settings';
import { loadMyAccounts } from 'actions/accountActionCreators';
import Text from 'components/Text';
import Icon from 'components/Icon';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Select from 'components/Select';
import FormField from 'components/FormField';
import UIController from 'components/UIController';
import Link from 'components/Link';
import Switch from 'components/Switch';
import { rpcErrorHandler } from 'utils/form';
import sendIcon from 'images/send.sprite.svg';
import TritiumAmountField from './TritiumAmountField';
import { LoadTritiumAccounts } from 'actions/financeActionCreators';
import PinLoginModal, { PinPromise } from 'components/User/PinLoginModal';

// Internal Local
import Recipients from './Recipients';
import {
  getAccountOptions,
  getAddressNameMap,
  getRegisteredFieldNames,
  getTritiumAccountOptions,
} from './selectors';

const SendFormComponent = styled.form({
  maxWidth: 800,
  margin: '0 auto',
});

const NamespaceColon = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
  padding: '.1em .6em',
  fontSize: '1.2em',
});

const SendFormButtons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '2em',
});

const NamespaceBox = styled.div({ display: 'flex', flexDirection: 'row' });
const selector = formValueSelector('tritiumSend');
const mapStateToProps = state => {
  let {
    addressBook,
    myAccounts,
    tritiumData: { tritiumAccounts },
    settings: { minConfirmations, tritium },
    common: { encrypted, loggedIn },
    form,
  } = state;
  return {
    minConfirmations,
    tritium,
    encrypted,
    loggedIn,
    tritiumAccountOptions: getTritiumAccountOptions(tritiumAccounts),
    addressNameMap: getAddressNameMap(addressBook),
    Address: selector(state, 'Address'),
    fieldNames: getRegisteredFieldNames(
      form.tritiumSend && form.tritiumSend.registeredFields
    ),
  };
};

const mapDispatchToProps = dispatch => ({
  loadMyTritiumAccounts: () => dispatch(LoadTritiumAccounts()),
});

/**
 * The Internal Send Form in the Send Page
 *
 * @class TritiumSendForm
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  mapDispatchToProps
)
@reduxForm({
  form: 'tritiumSend',
  destroyOnUnmount: false,
  initialValues: {
    sendFrom: null,
    tritiumRecipiant: { namespace: null, account: '', amount: '' },
    Address: false,
  },
  validate: ({ sendFrom, recipients, tritiumRecipiant }, props) => {
    const errors = {};
    if (!sendFrom) {
      errors.sendFrom = <Text id="sendReceive.Messages.NoAccounts" />;
    }
    if (props.tritium) {
      if (!tritiumRecipiant) {
        errors.recipients = {
          _error: <Text id="sendReceive.Messages.NoRecipient" />,
        };
      } else {
        const recipientsErrors = [];

        const tritiumRecipiantErrors = {};
        if (!tritiumRecipiant.name) {
          tritiumRecipiantErrors.name = <Text id="Alert.AddressEmpty" />;
        }
        const floatAmount = parseFloat(tritiumRecipiant.amount);
        if (!floatAmount || floatAmount < 0) {
          tritiumRecipiantErrors.amount = <Text id="Alert.InvalidAmount" />;
        }
        if (Object.keys(tritiumRecipiantErrors).length) {
          recipientsErrors[0] = tritiumRecipiantErrors;
        }

        if (recipientsErrors.length) {
          errors.tritiumRecipiant = tritiumRecipiantErrors;
        }
      }
    } else if (!recipients || !recipients.length) {
      errors.recipients = {
        _error: <Text id="sendReceive.Messages.NoRecipient" />,
      };
    } else {
      const recipientsErrors = [];

      recipients.forEach(({ address, amount }, i) => {
        const recipientErrors = {};
        if (!address) {
          recipientErrors.address = <Text id="Alert.AddressEmpty" />;
        }
        const floatAmount = parseFloat(amount);
        if (!floatAmount || floatAmount < 0) {
          recipientErrors.amount = <Text id="Alert.InvalidAmount" />;
        }
        if (Object.keys(recipientErrors).length) {
          recipientsErrors[i] = recipientErrors;
        }
      });

      if (recipientsErrors.length) {
        errors.recipients = recipientsErrors;
      }
    }

    return errors;
  },
  asyncBlurFields: ['recipients[].address'],
  asyncValidate: async (
    { recipients, tritiumRecipiant, sendFrom },
    dispatch,
    props
  ) => {
    const recipientsErrors = [];

    if (props.tritium) {
      let sendFromDetails = props.tritiumAccountOptions.filter(
        acct => acct.value === sendFrom
      )[0];

      let paramsObj = { amount: tritiumRecipiant.amount, name: sendFrom };
      if (tritiumRecipiant.name.includes(':')) {
        paramsObj.name_to = tritiumRecipiant.name;
      } else {
        paramsObj.address_to = tritiumRecipiant.name;
      }

      if (sendFromDetails.isToken) {
        let thing = await PinPromise('tokens', 'debit', 'account', paramsObj);
        console.log(thing);
        // UIController.openModal(PinLoginModal, {
        //   api: 'tokens',
        //   verb: 'debit',
        //   noun: 'account',
        //   callback: payload => console.log(payload),
        //   params: paramsObj,
        // });
      } else {
        // let awaitPinEntryAndApiCall = await new Promise((resolve, reject) => {
        //   UIController.openModal(PinLoginModal, {
        //     api: 'finance',
        //     verb: 'debit',
        //     noun: 'account',
        //     callback: payload => {
        //       if (payload.data.error) {
        //         reject(payload);
        //       } else {
        //         resolve(payload);
        //       }
        //     },
        //     params: paramsObj,
        //   });
        // });
      }
    } else {
      await Promise.all(
        recipients.map(({ address }, i) =>
          Backend.RunCommand('RPC', 'validateaddress', [address])
            .then(result => {
              if (!result.isvalid) {
                recipientsErrors[i] = {
                  address: <Text id="Alert.InvalidAddress" />,
                };
              } else if (result.ismine) {
                recipientsErrors[i] = {
                  address: <Text id="Alert.registeredToThis" />,
                };
              }
            })
            .catch(err => {
              recipientsErrors[i] = {
                address: <Text id="Alert.InvalidAddress" />,
              };
            })
        )
      );
      if (recipientsErrors.length) {
        throw { recipients: recipientsErrors };
      }
    }
    return null;
  },
  onSubmit: (
    { sendFrom, recipients, message, tritiumRecipiant },
    dispatch,
    props
  ) => {
    let minConfirmations = parseInt(props.minConfirmations);
    if (isNaN(minConfirmations)) {
      minConfirmations = defaultSettings.minConfirmations;
    }

    if (props.tritium) {
      let sendFromDetails = props.tritiumAccountOptions.filter(
        acct => acct.value === sendFrom
      )[0];

      let paramsObj = { amount: tritiumRecipiant.amount, name: sendFrom };
      if (tritiumRecipiant.name.includes(':')) {
        paramsObj.name_to = tritiumRecipiant.name;
      } else {
        paramsObj.address_to = tritiumRecipiant.name;
      }

      if (sendFromDetails.isToken) {
        let thing = PinPromise('tokens', 'debit', 'account', paramsObj);
        console.log(thing);
        // UIController.openModal(PinLoginModal, {
        //   api: 'tokens',
        //   verb: 'debit',
        //   noun: 'account',
        //   callback: payload => console.log(payload),
        //   params: paramsObj,
        // });
      } else {
        // let awaitPinEntryAndApiCall = await new Promise((resolve, reject) => {
        //   UIController.openModal(PinLoginModal, {
        //     api: 'finance',
        //     verb: 'debit',
        //     noun: 'account',
        //     callback: payload => {
        //       if (payload.data.error) {
        //         reject(payload);
        //       } else {
        //         resolve(payload);
        //       }
        //     },
        //     params: paramsObj,
        //   });
        // });
      }
    } else {
      if (recipients.length === 1) {
        const recipient = recipients[0];
        const params = [
          sendFrom,
          recipient.address,
          parseFloat(recipient.amount),
          minConfirmations,
        ];
        if (message) params.push(message);
        return Backend.RunCommand('RPC', 'sendfrom', params);
      } else {
        const queue = recipients.reduce(
          (queue, r) => ({ ...queue, [r.address]: parseFloat(r.amount) }),
          {}
        );

        return Backend.RunCommand(
          'RPC',
          'sendmany',
          [sendFrom, queue],
          minConfirmations,
          message
        );
      }
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    props.reset();
    props.loadMyTritiumAccounts();
  },
  onSubmitFail: rpcErrorHandler(
    <Text id="sendReceive.Messages.ErrorSending" />
  ),
})
class TritiumSendForm extends Component {
  componentDidMount() {
    this.props.loadMyTritiumAccounts();
  }
  /**
   * Confirm the Send
   *
   * @memberof TritiumSendForm
   */
  confirmSend = e => {
    e.preventDefault();
    const {
      handleSubmit,
      invalid,
      //   encrypted,
      //   loggedIn,
      touch,
      fieldNames,
    } = this.props;

    if (invalid) {
      // Mark the form touched so that the validation errors will be shown.
      // redux-form doesn't have the `touchAll` feature yet so we have to list all fields manually.
      // redux-form also doesn't have the API to get all the field names yet
      // so we have to connect to the store to retrieve it manually
      touch(...fieldNames);
      return;
    }

    // if (encrypted && !loggedIn) {
    //   const modalId = UIController.openErrorDialog({
    //     message: 'You are not logged in',
    //     note: (
    //       <>
    //         <p>You need to log in to your wallet before sending transactions</p>
    //         <Link
    //           to="/Settings/Security"
    //           onClick={() => {
    //             UIController.removeModal(modalId);
    //           }}
    //         >
    //           Log in now
    //         </Link>
    //       </>
    //     ),
    //   });
    //   return;
    // }

    UIController.openConfirmDialog({
      question: <Text id="sendReceive.SendTransaction" />,
      callbackYes: handleSubmit,
    });
  };

  /**
   * Add Recipient to the queue
   *
   * @memberof TritiumSendForm
   */
  addRecipient = () => {
    this.props.array.push('recipients', {
      address: null,
      amount: '',
      fiatAmount: '',
    });
  };

  /**
   * Return JSX for the Add Recipient Button
   *
   * @memberof TritiumSendForm
   */
  renderAddRecipientButton = ({ fields }) =>
    fields.length === 1 ? (
      <Button onClick={this.addRecipient}>
        <Text id="sendReceive.MultipleRecipients" />
      </Button>
    ) : (
      <div />
    );

  /**
   * React Render
   *
   * @returns
   * @memberof TritiumSendForm
   */
  render() {
    const { tritiumAccountOptions, change, Address } = this.props;
    console.log(this.props);
    return (
      <SendFormComponent onSubmit={this.confirmSend}>
        <FormField label={<Text id="sendReceive.SendFrom" />}>
          <Field
            component={Select.RF}
            name="sendFrom"
            placeholder={<Text id="sendReceive.SelectAnAccount" />}
            options={tritiumAccountOptions}
          />
        </FormField>
        <NamespaceBox>
          {Address ? (
            <FormField
              style={{ flex: 1 }}
              label={<Text id="sendReceive.TableAddress" />}
            >
              <Field
                component={TextField.RF}
                name="tritiumRecipiant.namespace"
                change={change}
                placeholder="Address"
              />
            </FormField>
          ) : (
            <>
              <FormField label={<Text id="Finance.Namespace" />}>
                <Field
                  component={TextField.RF}
                  name="tritiumRecipiant.namespace"
                  change={change}
                  placeholder="Name"
                />
              </FormField>
              <NamespaceColon>:</NamespaceColon>
              <FormField label={<Text id="AddressBook.Account" />}>
                <Field
                  component={TextField.RF}
                  name="tritiumRecipiant.name"
                  change={change}
                  placeholder="Account"
                />
              </FormField>
            </>
          )}{' '}
          <FormField
            style={{ alignSelf: 'flex-end' }}
            label={<Text id="sendReceive.TableAddress" />}
          >
            <Field component={Switch.RF} name="Address" change={change} />
          </FormField>
        </NamespaceBox>
        <TritiumAmountField change={change} />
        <SendFormButtons>
          <Button type="submit" skin="primary">
            <Icon icon={sendIcon} className="space-right" />
            <Text id="sendReceive.SendNow" />
          </Button>
        </SendFormButtons>
      </SendFormComponent>
    );
  }
}

export default TritiumSendForm;
