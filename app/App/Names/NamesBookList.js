// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import UIController from 'components/UIController';
import AddEditContactModal from 'components/AddEditContactModal';
import Button from 'components/Button';
import CreateName from './CreateName';

const ContactListComponent = styled.div(({ theme }) => ({
  gridArea: 'list',
  maxHeight: '100%',
  overflowY: 'auto',
  borderRight: `1px solid ${theme.mixer(0.125)}`,
  marginLeft: -30,
}));

const Separator = styled.div(({ theme }) => ({
  margin: '5px 30px',
  height: 1,
  background: theme.mixer(0.125),
}));

const testNamesList = [{ name: 'test1' }, { name: 'test2' }, { name: 'test3' }];

const mapStateToProps = ({
  addressBook,
  ui: {
    addressBook: { searchQuery },
  },
  core: {
    info: { connections },
  },
}) => ({
  addressBook,
  searchQuery,
  connections,
});

/**
 * List of contacts
 *
 * @class ContactList
 * @extends {Component}
 */
@connect(mapStateToProps)
class ContactList extends React.Component {
  createName = () => {
    console.log('click');
    UIController.openModal(CreateName);
  };

  /**
   * render
   *
   * @returns
   * @memberof ContactList
   */
  render() {
    const { addressBook, searchQuery, connections } = this.props;

    return (
      <ContactListComponent>
        {Object.values(testNamesList).map(contact =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ? (
            <div>{contact.name}</div>
          ) : null
        )}
        {connections !== undefined && (
          <>
            <Separator />
            <Button onClick={this.createName}>{'New Name'}</Button>
          </>
        )}
      </ContactListComponent>
    );
  }
}

export default ContactList;
