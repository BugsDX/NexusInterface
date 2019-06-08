// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Panel from 'components/Panel';
import Text from 'components/Text';
import Tooltip from 'components/Tooltip';
import Button from 'components/Button';
import Icon from 'components/Icon';
import PinLoginModal from 'components/PinLoginModal';
import AccountsContainer from './AccountsContainer';
import UIController from 'components/UIController';

import { LoadTritiumAccounts } from 'actions/financeActionCreators';

import FinanceIcon from 'images/nxs-staking.sprite.svg';
import PlusIcon from 'images/plus.sprite.svg';

const LeftBox = styled.div(({ theme }) => ({
  width: '100%',
  display: 'flex',
}));

const RightBox = styled.div(({ theme }) => ({
  display: 'flex',
}));

const mapStateToProps = state => {
  return { ...state.common, ...state.finance };
};
const mapDispatchToProps = dispatch => ({
  LoadTritiumAccounts: () => dispatch(LoadTritiumAccounts()),
});

class Finance extends Component {
  constructor() {
    super();
    this.state = { Accounts: [] };
  }

  componentDidMount() {
    this.props.LoadTritiumAccounts();
  }

  render() {
    let { tritiumAccounts } = this.props;
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
              onClick={() =>
                UIController.openModal(PinLoginModal, {
                  callback: payload => console.log(payload),
                  params: { name: 'payroll' },
                  api: 'finance',
                  verb: 'create',
                  noun: 'account',
                })
              }
            >
              <Icon icon={PlusIcon} />
            </Button>
          </Tooltip.Trigger>
        }
      >
        <LeftBox>
          {/* <AccountsContainer accounts={tritiumAccounts} /> */}
        </LeftBox>
        <RightBox />
      </Panel>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Finance);
