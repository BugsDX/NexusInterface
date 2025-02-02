import React from 'react';
import { connect } from 'react-redux';

import rpc from 'lib/rpc';
import { showNotification } from 'actions/overlays';
import Text from 'components/Text';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import { consts } from 'styles';

/**
 *
 *
 * @class RescanButton
 * @extends {React.Component}
 */
@connect(
  null,
  { showNotification }
)
class RescanButton extends React.Component {
  state = {
    rescanning: false,
  };

  /**
   *
   *
   * @memberof RescanButton
   */
  rescan = async () => {
    try {
      this.setState({ rescanning: true });
      await rpc('rescan', []);
    } catch (err) {
      this.props.showNotification(
        <Text id="MyAddressesModal.RescanError" />,
        'error'
      );
      return;
    } finally {
      this.setState({ rescanning: false });
    }
    this.props.showNotification(
      <Text id="MyAddressesModal.RescanSuccess" />,
      'success'
    );
  };

  /**
   *
   *
   * @returns
   * @memberof RescanButton
   */
  render() {
    const { rescanning } = this.state;
    return (
      <Tooltip.Trigger
        tooltip={
          !rescanning &&
          this.props.tooltip && <Text id="MyAddressesModal.RescanTooltip" />
        }
      >
        <Button
          disabled={rescanning}
          onClick={this.rescan}
          style={{ height: consts.inputHeightEm + 'em' }}
        >
          {rescanning ? (
            <Text id="MyAddressesModal.Rescanning" />
          ) : (
            <Text id="MyAddressesModal.Rescan" />
          )}
        </Button>
      </Tooltip.Trigger>
    );
  }
}

export default RescanButton;
