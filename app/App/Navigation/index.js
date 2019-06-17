// External Dependencies
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal Global Depnedencies
import Text from 'components/Text';
import HorizontalLine from 'components/HorizontalLine';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import ModuleIcon from 'components/ModuleIcon';
import { getActiveModules } from 'api/modules';
import { consts, timing } from 'styles';

// Internal Local Dependencies
import NavLinkItem from './NavLinkItem';

// Images
import logoIcon from 'images/logo.sprite.svg';
import sendIcon from 'images/send.sprite.svg';
import chartIcon from 'images/chart.sprite.svg';
import transactionsIcon from 'images/transaction.sprite.svg';
import addressBookIcon from 'images/address-book.sprite.svg';
import settingsIcon from 'images/settings.sprite.svg';
import consoleIcon from 'images/console.sprite.svg';
import userIcon from 'images/user.sprite.svg';
import tokensIcon from 'images/nxs-staking.sprite.svg';
// import shapeshiftIcon from 'images/shapeshift.sprite.svg';
// import trustListIcon from 'images/trust-list.sprite.svg';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(70%) }
    to { opacity: 1; transform: translateY(0) }
`;

const Nav = styled.nav({
  gridArea: 'navigation',
  position: 'relative',
  background: 'linear-gradient(to top, rgba(0,0,0,.6), transparent)',
});

const NavBar = styled.div({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  paddingBottom: 10,
  animation: `${slideUp} ${timing.slow} ${consts.enhancedEaseOut}`,
});

const AboveNav = styled.div({
  position: 'absolute',
  bottom: '100%',
  left: 0,
  right: 0,
});

const NavItem = ({ icon, children, ...rest }) => (
  <Tooltip.Trigger tooltip={children} position="top">
    <NavLinkItem {...rest}>
      <Icon icon={icon} />
    </NavLinkItem>
  </Tooltip.Trigger>
);

const ModuleNavItem = ({ module }) => (
  <Tooltip.Trigger tooltip={module.displayName} position="top">
    <NavLinkItem to={`/Modules/${module.name}`}>
      <ModuleIcon module={module} />
    </NavLinkItem>
  </Tooltip.Trigger>
);

const ModuleNavItems = connect(
  state => ({
    modules: getActiveModules(state.modules, state.settings.disabledModules),
  }),
  null,
  null,
  { pure: false }
)(({ modules }) =>
  modules
    .filter(module => module.type === 'app')
    .map(module => <ModuleNavItem key={module.name} module={module} />)
);

const TritiumNavItems = connect(
  state => {
    return {
      settings: state.settings,
    };
  },
  null,
  null,
  { pure: true }
)(({ settings }) => {
  console.log(settings);
  if (settings.tritium) {
    const tritiumPages = ['Login', 'Accounts', 'Assets', 'Contacts'];
    return tritiumPages.map(e => {
      return (
        <NavItem key={e} icon={logoIcon} to={'/' + e}>
          <Text id={'Footer.' + e} />
        </NavItem>
      );
    });
  } else return null;
});

const Navigation = connect(
  state => {
    return {
      settings: state.settings,
    };
  },
  null,
  null,
  { pure: true }
)(({ settings }) => (
  <Nav>
    <AboveNav>
      <HorizontalLine />
    </AboveNav>

    <NavBar>
      <NavItem icon={logoIcon} exact to="/">
        <Text id="Footer.Overview" />
      </NavItem>

      <NavItem icon={sendIcon} to="/Legacy/SendPage">
        <Text id="Footer.SendNXS" />
      </NavItem>

      <NavItem icon={transactionsIcon} to="/Legacy/Transactions">
        <Text id="Footer.Transactions" />
      </NavItem>

      <NavItem icon={chartIcon} to="/Legacy/Market">
        <Text id="Footer.MarketData" />
      </NavItem>

      <NavItem icon={addressBookIcon} to="/Legacy/AddressBook">
        <Text id="Footer.AddressBook" />
      </NavItem>

      <NavItem icon={settingsIcon} to="/Settings">
        <Text id="Footer.Settings" />
      </NavItem>

      <NavItem icon={consoleIcon} to="/Terminal">
        <Text id="Footer.Console" />
      </NavItem>

      {settings.tritium && (
        <>
          <NavItem icon={logoIcon} to="/Login">
            <Text id="Footer.Login" />
          </NavItem>
          <NavItem icon={userIcon} to="/Accounts">
            <Text id="Footer.Accounts" />
          </NavItem>
          <NavItem icon={logoIcon} to="/Assets">
            <Text id="Footer.Assets" />
          </NavItem>
          <NavItem icon={logoIcon} to="/Contacts">
            <Text id="Footer.Contacts" />
          </NavItem>
          <NavItem icon={tokensIcon} to="/Tokens">
            <Text id="Footer.Tokens" />
          </NavItem>
          <NavItem icon={logoIcon} to="/Names">
            <Text id="Footer.Names" />
          </NavItem>
        </>
      )}

      <ModuleNavItems />
    </NavBar>
  </Nav>
));

export default Navigation;
