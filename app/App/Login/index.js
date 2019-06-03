// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Internal
import UIController from 'components/UIController';
import LoginComponent from './LoginComponent';
import CreateUserComponent from './CreateUserComponent';
import LogoutUserComponent from './LogoutUserComponent';
import { history } from 'store';

import { updateSettings } from 'actions/settingsActionCreators';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.common };
};
const mapDispatchToProps = dispatch => ({
  turnOffTritium: () => dispatch(updateSettings({ tritium: false })),
});

class LoginPage extends Component {
  redirectToOverview() {
    //history.push('/');
  }

  openCreateAUser() {
    UIController.openModal(CreateUserComponent, {
      fullScreen: true,
      onClose: () => this.redirectToOverview(),
      onCloseLegacy: () => this.switchTolegacy(),
    });
  }

  switchTolegacy() {
    history.push('/');
  }

  openLoginModal() {
    UIController.openModal(LoginComponent, {
      fullScreen: true,
      onClose: () => this.redirectToOverview(),
      onCloseCreate: () => this.openCreateAUser(),
      onCloseLegacy: () => this.switchTolegacy(),
    });
  }

  componentDidMount() {
    //test
    UIController.openModal(LogoutUserComponent, {
      fullScreen: true,
      onClose: () => this.switchTolegacy(),
      onCloseLogout: () => this.openLoginModal(),
      userInfo: {
        genesisID:
          'GEN ID KAJSDJAUFEJNFLKAMLSJDLKASMDLKASDKNADNLKASNKLDNASLdKSND',
        sessionID: 'SESSION ASDASKDASKLD@299284121',
      },
    });

    return null;
    this.props.turnOffTritium();
    UIController.openModal(LoginComponent, {
      fullScreen: true,
      onClose: () => this.redirectToOverview(),
      onCloseCreate: () => this.openCreateAUser(),
      onCloseLegacy: () => this.switchTolegacy(),
    });

    //if already logged in show logout modal
  }

  // Mandatory React method
  render() {
    return <div>{'TEST LOGIN'}</div>;
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage);
