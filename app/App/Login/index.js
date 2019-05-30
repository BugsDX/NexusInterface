// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Internal
import UIController from 'components/UIController';
import LoginComponent from './LoginComponent';
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
    history.push('/');
  }

  componentDidMount() {
    this.props.turnOffTritium();
    UIController.openModal(LoginComponent, {
      fullScreen: true,
      onClose: () => this.redirectToOverview(),
    });
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
