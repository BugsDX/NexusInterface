// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';

const DateInput = styled(TextField)(
  {
    display: 'block',
  },
  ({ valid }) => {
    if (valid) {
      return {
        borderBottomWidth: 0,
      };
    } else {
      return {
        borderBottomWidth: 0,
        borderBottomStyle: 'solid',
        borderBottomColor: 'red',
      };
    }
  }
);

class DateField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      valid: true,
    };
  }

  checkValue = e => {
    console.log('Checking');
    console.log(e);
    console.log(e.target.value);
    const inValue = e.target.value;
    const parts = inValue.split('/');
    console.log(parts);
    console.log(parts[0].match('/^[1-9]$|^[1-2][0-9]$|^3[0-6]$/'));
    console.log(parts[1].match('/^[1-9]$|^[1-2][0-9]$|^3[0-6]$/'));
    console.log(parts[2].match('/^[1-9]$|^[1-2][0-9]$|^3[0-6]$/'));

    this.setState({
      valid: false,
    });
  };

  render() {
    return (
      <div>
        <DateInput
          valid={this.state.valid}
          error={!this.state.valid}
          placeholder={'DD/MM/YYYY'}
          onChange={this.checkValue}
          type={'date'}
        />
      </div>
    );
  }
}

export default DateField;
