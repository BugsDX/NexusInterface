// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import Text from 'components/Text';
import styled from '@emotion/styled';
import googleanalytics from 'scripts/googleanalytics';

// Internal Global
import Icon from 'components/Icon';
import Button from 'components/Button';
import Panel from 'components/Panel';
import UIController from 'components/UIController';
import AddEditContactModal from 'components/AddEditContactModal';
import ContextMenuBuilder from 'contextmenu';
import * as Backend from 'scripts/backend-com';
import { listNames, listAccountsAll } from 'api/UserApi';

// Internal Local
import NamesBookList from './NamesBookList';
import NamesBookDetails from './NamesBookDetails';

// Icons
import addressBookIcon from 'images/address-book.sprite.svg';
import addContactIcon from 'images/add-contact.sprite.svg';

const AddressBookLayout = styled.div({
  display: 'grid',
  gridTemplateAreas: '"list details"',
  gridTemplateColumns: '1fr 2fr',
  columnGap: 30,
  height: '100%',
});

const mapStateToProps = state => ({
  addressBook: state.addressBook,
  connections: state.core.info.connections,
});

/**
 * The Address Book Page
 *
 * @class AddressBook
 * @extends {Component}
 */
@connect(mapStateToProps)
class NamesBook extends Component {
  state = {
    activeIndex: 0,
  };

  /**
   * componentDidMount
   *
   * @memberof AddressBook
   */
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    googleanalytics.SendScreen('AddressBook');
    this.getTest();
  }

  async getTest() {
    const sadsasad = await listNames({
      username: 'test',
    });
    console.log(sadsasad);
  }

  /**
   * componentWillUnmount
   *
   * @memberof AddressBook
   */
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  /**
   * Set up the context menu
   *
   * @param {*} e
   * @memberof SendPage
   */
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  /**
   *
   *
   * @memberof AddressBook
   */
  showAddContact = () => {
    UIController.openModal(AddEditContactModal);
  };

  /**
   * render
   *
   * @returns
   * @memberof AddressBook
   */
  render() {
    //const { addressBook, connections } = this.props;

    return (
      <Panel icon={addressBookIcon} title={'Names Book'} bodyScrollable={false}>
        <AddressBookLayout>
          <NamesBookList />
          <NamesBookDetails />
        </AddressBookLayout>
      </Panel>
    );
  }
}

export default NamesBook;
