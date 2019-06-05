// External
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';
import ReactToPrint from 'react-to-print';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import Panel from 'components/Panel';
import Text from 'components/Text';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import FieldSet from 'components/FieldSet';
import { updateSettings } from 'actions/settingsActionCreators';
import * as Backend from 'scripts/backend-com';
import UIController from 'components/UIController';
import PrintRecovery from './PrintRecovery';

const ShowRecModalComponent = styled(Modal)({
  padding: '1px',
  WebkitUserSelect: 'none',
  WebkitUserDrag: 'none',
});

const WordBox = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: 'auto auto auto auto',
  gridTemplateRows: 'auto',
  gridGap: '1em .5em',
});

const Word = styled.div({
  background: 'black',
});

class ShowRecoveryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      twentyWords: [],
    };
  }

  componentDidMount() {
    this.setState({
      twentyWords: [
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
        'nine',
        'ten',
        'eleven',
        'twelve',
        'thirteen',
        'forteen',
        'fifteen',
        'sixteen',
        'seventeen',
        'eighteen',
        'nineteen',
        'twnety',
      ],
    });
  }

  returnWords() {
    return this.state.twentyWords.map(e => {
      return <Word key={e}>{e}</Word>;
    });
  }

  print() {}

  render() {
    return (
      <ShowRecModalComponent
        fullScreen
        assignClose={close => {
          this.closeModal = close;
        }}
        {...this.props}
        oncopy={'return false'}
        onpaste={'return false'}
      >
        <Modal.Header>Recovery</Modal.Header>
        <Modal.Body>
          <Panel title={'Show Recovery'}>
            <div> {'asdasdsa'}</div>
            <WordBox>{this.returnWords()}</WordBox>
            <Button
              skin="primary"
              onClick={() => this.props.onCloseBack()}
              style={{ fontSize: 17, padding: '5px' }}
            >
              Cancel
            </Button>
            <ReactToPrint
              trigger={() => (
                <Button
                  skin="primary"
                  onClick={() => this.print()}
                  style={{ fontSize: 17, padding: '5px' }}
                >
                  Print
                </Button>
              )}
              content={() => this.printRef}
            />
            <div style={{ display: 'none' }}>
              <PrintRecovery
                twentyWords={this.state.twentyWords}
                ref={e => (this.printRef = e)}
                {...this.props}
              />
            </div>
          </Panel>
        </Modal.Body>
      </ShowRecModalComponent>
    );
  }
}

export default ShowRecoveryComponent;
