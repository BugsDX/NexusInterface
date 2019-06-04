// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

import Panel from 'components/Panel';
import Text from 'components/Text';
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
      >
        hjg
      </Panel>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Finance);
