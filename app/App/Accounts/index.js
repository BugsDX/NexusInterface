// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.common };
};
const mapDispatchToProps = dispatch => ({});

class Accounts extends Component {
  // Mandatory React method
  render() {
    return <div>{'TEST ACCOUNTS'}</div>;
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Accounts);
