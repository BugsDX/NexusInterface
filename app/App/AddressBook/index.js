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
import ContextMenuBuilder from 'contextmenu';

// Internal Local
import PanelControls from './PanelControls';
import ContactList from './ContactList';
import ContactDetails from './ContactDetails';

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
  addressBook: state.addressbook.addressbook,
});

/**
 * The Address Book Page
 *
 * @class AddressBook
 * @extends {Component}
 */
@connect(mapStateToProps)
class AddressBook extends Component {
  state = {
    activeIndex: 0,
  };

  /**
   * componentDidMount
   *
   * @memberof AddressBook
   */
  componentDidMount() {
    window.addEventListener('contextmenu', this.addressbookContextMenu, false);
    googleanalytics.SendScreen('AddressBook');
  }

  /**
   * componentWillUnmount
   *
   * @memberof AddressBook
   */
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.addressbookContextMenu);
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
   * render
   *
   * @returns
   * @memberof AddressBook
   */
  render() {
    const { addressBook } = this.props;

    return (
      <Panel
        icon={addressBookIcon}
        title={<Text id="AddressBook.AddressBook" />}
        controls={<PanelControls />}
        bodyScrollable={false}
      >
        {addressBook && addressBook.length > 0 ? (
          <AddressBookLayout>
            <ContactList />
            <ContactDetails />
          </AddressBookLayout>
        ) : (
          <div style={{ marginTop: 50, textAlign: 'center' }}>
            <div className="dim">Your Address Book is empty!</div>
            <Button
              skin="blank-light"
              onClick={this.showAddContact}
              className="mt1"
            >
              <Icon icon={addContactIcon} />
              &nbsp; Add Contact
            </Button>
          </div>
        )}
      </Panel>
    );
  }
}

export default AddressBook;
