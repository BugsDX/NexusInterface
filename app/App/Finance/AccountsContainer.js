// External Dependencies
import React, { Component } from 'react';
import Text from 'components/Text';
import styled from '@emotion/styled';

const Container = styled.div(({ theme }) => ({
  width: '100%',
  maxWidth: '70%',
  display: 'flex',
  flexDirection: 'column',
  marginRight: '1em',
}));

const Head = styled.div(({ theme }) => ({
  width: '100%',
  height: '3em',
  background: theme.mixer(0.25),
  color: theme.foreground,
  display: 'flex',
  justifyContent: 'left',
  alignItems: 'center',
  flexShrink: 0,
  paddingLeft: '1em',
  marginRight: '1em',
}));

const AccountName = styled.div(({ theme }) => ({
  color: theme.primary,
  fontWeight: 'bold',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexShrink: 0,
  marginRight: '1em',
}));

const Table = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto auto',
}));

const AccountsContainer = ({ accounts, error, ...Rest }) => {
  return (
    <Container>
      <Head>
        <h3>
          <Text id="Finance.Accounts" />
        </h3>
      </Head>
      {accounts && (
        <Table>
          {accounts.map((e, i) => {
            return (
              <>
                <AccountName key={e.name}>{e.name}</AccountName>
                <div key={i}>{`${e.balance} ${e.token_name}`}</div>
              </>
            );
          })}
        </Table>
      )}
    </Container>
  );
};
export default AccountsContainer;
