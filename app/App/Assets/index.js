// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.common };
};
const mapDispatchToProps = dispatch => ({});

class Assets extends Component {
  // Mandatory React method
  render() {
    return <div>{'TEST ASSETS'}</div>;
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Assets);
