// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import Panel from 'components/Panel';
import Button from 'components/Button';
import * as color from 'utils/color';

import UnnamedASD from './hhh';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.common };
};
const mapDispatchToProps = dispatch => ({});

const SearchName = styled.div(({ theme }) => ({
  background: color.lighten(theme.background, 0.4),
  display: 'flex',

  border: `1.5px solid ${theme.primary}`,
  borderRadius: '2px',
}));

const SearchInputLabel = styled.a(({ theme }) => ({
  color: theme.primary,
  fontWeight: 'bold',
  fontSize: '125%',
}));

const NamesContent = styled.div({
  height: '100%',
  background: 'orange',
});

const PanelContent = styled(Panel)({
  border: '1px',
});

class Names extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: '',
      executedSearch: false,
      searchType: '',
    };
  }

  searchInputHandle = e => {
    this.setState({
      searchInput: e.target.value,
    });
  };

  searchButtonExecute = e => {
    if (this.state.searchInput.includes('.')) {
      console.log('Name');
      this.setState({
        searchType: 'Name',
      });
    } else {
      console.log('NameSpace');
      this.setState({
        searchType: 'NameSpace',
      });
    }
    this.setState({
      executedSearch: true,
    });
  };

  // Mandatory React method
  render() {
    const { searchInput, executedSearch, searchType } = this.state;
    return (
      <PanelContent title={'Names'}>
        <SearchName>
          <SearchInputLabel>{'Nexus://'}</SearchInputLabel>
          <TextField
            style={{ width: '100%' }}
            value={searchInput}
            onChange={this.searchInputHandle}
          />
          <Button
            style={{ paddingBottom: '0.5em' }}
            skin="primary"
            onClick={this.searchButtonExecute}
          >
            {'Go'}
          </Button>
        </SearchName>
        {executedSearch ? (
          <NamesContent>
            {searchType}
            <UnnamedASD />
          </NamesContent>
        ) : (
          <div>{'Nothing'}</div>
        )}
      </PanelContent>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Names);
