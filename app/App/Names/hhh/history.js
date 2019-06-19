// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.common };
};
const mapDispatchToProps = dispatch => ({});

class History extends Component {
  // Mandatory React method
  render() {
    return <div>{'TEST history'}</div>;
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(History);
