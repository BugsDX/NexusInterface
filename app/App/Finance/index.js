// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

import Panel from 'components/Panel';
import Text from 'components/Text';
import Tooltip from 'components/Tooltip';
import Button from 'components/Button';
import Icon from 'components/Icon';
import FinanceIcon from 'images/nxs-staking.sprite.svg';

const mapStateToProps = state => {
  return { ...state.common };
};
const mapDispatchToProps = dispatch => ({});

class Finance extends Component {
  render() {
    return (
      <Panel
        bodyScrollable={false}
        icon={FinanceIcon}
        title={<Text id="Finance.Title" />}
        controls={
          <Tooltip.Trigger tooltip={<Text id="Finance.Create" />}>
            <Button
              square
              skin="primary"
              onClick={() => console.log('createAccount')}
            >
              <Icon icon={FinanceIcon} />
            </Button>
          </Tooltip.Trigger>
        }
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Finance);
