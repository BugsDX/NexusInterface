// External
import React from 'react';

import styled from '@emotion/styled';

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

class PrintRecovery extends React.Component {
  returnWords() {
    return this.props.twentyWords.map(e => {
      return <Word key={e}>{e}</Word>;
    });
  }

  render() {
    return (
      <div>
        <WordBox>{this.returnWords()}</WordBox>
      </div>
    );
  }
}

export default PrintRecovery;
