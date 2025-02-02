// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { remote } from 'electron';
import fs from 'fs';
import {
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryAxis,
  VictoryTooltip,
  createContainer,
} from 'victory';
import rp from 'request-promise';
import googleanalytics from 'scripts/googleanalytics';
import styled from '@emotion/styled';

// Internal
import Icon from 'components/Icon';
import Panel from 'components/Panel';
import WaitingMessage from 'components/WaitingMessage';
import Select from 'components/Select';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import Text, { translate } from 'components/Text';
import Table from 'scripts/utilities-react';
import { loadMyAccounts } from 'actions/account';
import rpc from 'lib/rpc';
import * as TYPE from 'consts/actionTypes';
import ContextMenuBuilder from 'contextmenu';
import { walletDataDir } from 'consts/paths';
import { openModal } from 'actions/overlays';
import TransactionDetailsModal from './TransactionDetailsModal';
import styles from './style.css';
import CSVDownloadModal from './TransactionCSVDownloadModal';

// Images
import transactionIcon from 'images/transaction.sprite.svg';
import downloadIcon from 'images/download.sprite.svg';
import searchIcon from 'images/search.sprite.svg';

import copy from 'copy-to-clipboard';
import Arrow from '../../shared/components/Arrow';
import { UpdateSettings } from 'lib/settings';

// Global variables
let tempaddpress = new Map();

const categories = [
  {
    value: 'all',
    display: <Text id="transactions.All" />,
  },
  {
    value: 'receive', // Should be made credit with tritium.
    display: <Text id="transactions.Receive" />,
  },
  {
    value: 'debit',
    display: <Text id="transactions.Sent" />,
  },
  {
    value: 'stake',
    display: <Text id="transactions.Stake" />,
  },
  {
    value: 'generate',
    display: <Text id="transactions.Generate" />,
  },
  {
    value: 'immature',
    display: <Text id="transactions.Immature" />,
  },
  {
    value: 'orphan',
    display: <Text id="transactions.Orphan" />,
  },
  {
    value: 'genesis',
    display: <Text id="transactions.Genesis" />,
  },
  {
    value: 'trust',
    display: <Text id="transactions.Trust" />,
  },
];

const timeFrames = [
  {
    value: 'All',
    display: <Text id="transactions.All" />,
  },
  {
    value: 'Year',
    display: <Text id="transactions.PastYear" />,
  },
  {
    value: 'Month',
    display: <Text id="transactions.PastMonth" />,
  },
  {
    value: 'Week',
    display: <Text id="transactions.PastWeek" />,
  },
];

const Filters = styled.div({
  display: 'grid',
  gridTemplateAreas: '"search type minAmount timeFrame download"',
  gridTemplateColumns: '1fr 110px 100px 140px auto',
  columnGap: '.75em',
  alignItems: 'end',
  fontSize: 15,
  marginBottom: '1em',
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.transactions,
    ...state.common,
    ...state.core.info,
    myAccounts: state.myAccounts,
    addressBook: state.addressBook,
    settings: state.settings,
    theme: state.theme,
  };
};
const mapDispatchToProps = dispatch => ({
  loadMyAccounts: () => dispatch(loadMyAccounts()),
  SetWalletTransactionArray: returnData => {
    dispatch({ type: TYPE.SET_WALL_TRANS, payload: returnData });
    dispatch({ type: TYPE.SET_TRANSACTION_MAP, payload: null });
  },
  SetSendAgainData: returnData => {
    dispatch({ type: TYPE.SET_TRANSACTION_SENDAGAIN, payload: returnData });
  },
  SetExploreInfo: returnData => {
    dispatch({ type: TYPE.SET_TRANSACTION_EXPLOREINFO, payload: returnData });
  },
  SetSelectedMyAccount: returnData => {
    dispatch({ type: TYPE.SET_SELECTED_MYACCOUNT, payload: returnData });
  },
  UpdateConfirmationsOnTransactions: returnData => {
    dispatch({ type: TYPE.UPDATE_CONFIRMATIONS, payload: returnData });
  },
  UpdateCoinValueOnTransaction: returnData => {
    dispatch({ type: TYPE.UPDATE_COINVALUE, payload: returnData });
  },
  UpdateFeeOnTransaction: returnData => {
    dispatch({ type: TYPE.UPDATE_FEEVALUE, payload: returnData });
  },
  UpdateFilteredTransaction: returnData => {
    dispatch({ type: TYPE.UPDATE_FILTERED_TRANSACTIONS, payload: returnData });
  },
  ToggleTransactionChart: inUpdate => {
    dispatch({ type: TYPE.UPDATE_SETTINGS, payload: inUpdate });
  },
  openModal: (...args) => dispatch(openModal(...args)),
});

/**
 * Transactions Page
 *
 * @class Transactions
 * @extends {Component}
 */
class Transactions extends Component {
  /**
   *Creates an instance of Transactions.
   * @param {*} props
   * @memberof Transactions
   */
  constructor(props) {
    super(props);
    this.copyRef = element => {
      this.textCopyArea = element;
    };
    this.hoveringID = 999999999999;
    this.isHoveringOverTable = false;
    this.state = {
      tableColumns: [],
      displayTimeFrame: 'All',
      changeTimeFrame: false,
      amountFilter: 0,
      categoryFilter: 'all',
      showTransactionChart: true,
      addressFilter: '',
      zoomDomain: {
        x: [
          new Date(
            new Date().getFullYear() - 1,
            new Date().getMonth(),
            new Date().getDate(),
            1,
            1,
            1,
            1
          ),
          new Date(),
        ],
        y: [0, 1],
      },
      isHoveringOverTable: false,
      hoveringID: 999999999999,
      open: false,
      historyData: new Map(),
      transactionsToCheck: [],
      mainChartWidth: 0,
      mainChartHeight: 0,
      addressLabels: new Map(),
      refreshInterval: undefined,
      highlightedBlockNum: 'Loading',
      highlightedBlockHash: 'Loading',
      needsHistorySave: false,
      copyBuffer: '',
      CSVProgress: 0,
    };
  }

  /**
   * Component Mount Callback
   *
   * @memberof Transactions
   */
  componentDidMount() {
    // console.log('mount tx');
    const { locale } = this.props.settings;
    this._isMounted = true; // This is used so that if you nav away for this screen the background tasks will stop.
    this.updateChartAndTableDimensions();
    googleanalytics.SendScreen('Transactions');
    this.updateChartAndTableDimensions = this.updateChartAndTableDimensions.bind(
      this
    );
    window.addEventListener(
      'resize',
      this.updateChartAndTableDimensions,
      false
    );

    this.transactioncontextfunction = this.transactioncontextfunction.bind(
      this
    );
    window.addEventListener(
      'contextmenu',
      this.transactioncontextfunction,
      false
    );
    this.gethistorydatajson();
    let myaddresbook = this.props.addressBook;
    if (myaddresbook != undefined) {
      for (let key in myaddresbook) {
        const eachAddress = myaddresbook[key];
        const primaryadd = eachAddress.addresses['Primary'];
        if (primaryadd != undefined) {
          tempaddpress.set(primaryadd, key);
        }
        for (let addr of eachAddress.addresses) {
          if (!addr.isMine) {
            tempaddpress.set(
              addr.address,
              eachAddress.name + (addr.label ? ` (${addr.label})` : '')
            );
          }
        }
      }
    }

    this.props.loadMyAccounts();

    for (let key in this.props.myAccounts) {
      for (let eachaddress in this.props.myAccounts[key].addresses) {
        tempaddpress.set(
          this.props.myAccounts[key].addresses[eachaddress],
          this.props.myAccounts[key].account
        );
      }
    }
    this.getTransactionData(this.setOnmountTransactionsCallback.bind(this));

    let interval = setInterval(() => {
      this.getTransactionData(this.setConfirmationsCallback.bind(this));
    }, 60000);
    this.setState({
      refreshInterval: interval,
      addressLabels: tempaddpress,
    });

    this._Onprogress = () => {}; // Might not need to define this here

    setTimeout(() => {
      this.setState({
        showTransactionChart: this.props.showTransactionChart,
      });
    }, 50);
  }

  /**
   * Component Updated Props Callback
   *
   * @param {*} previousprops
   * @returns
   * @memberof Transactions
   */
  componentDidUpdate(previousprops) {
    if (this.props.txtotal != previousprops.txtotal) {
      this.getTransactionData(this.setOnmountTransactionsCallback.bind(this));
      return;
    }
    if (this.props.selectedAccount != previousprops.selectedAccount) {
      this.getTransactionData(this.setOnmountTransactionsCallback.bind(this));
      return;
    }
  }

  /**
   * Component Unmount Callback
   *
   * @memberof Transactions
   */
  componentWillUnmount() {
    this._isMounted = false;
    this.SaveHistoryDataToJson();
    clearInterval(this.state.refreshInterval);
    this.setState({
      refreshInterval: null,
    });
    window.removeEventListener('resize', this.updateChartAndTableDimensions);
    window.removeEventListener('contextmenu', this.transactioncontextfunction);
  }

  /**
   * The callback for when we want to update just the confirmations
   *
   * @param {*} incomingData The data provided by the daemon to be used to update the confirmations
   * @memberof Transactions
   */
  setConfirmationsCallback(incomingData) {
    this.props.UpdateConfirmationsOnTransactions(incomingData);
  }

  //
  /**
   * The callback for the on Mount State
   *
   * @param {*} incomingData the data provided by the daemon to be used to update the chart
   * @memberof Transactions
   */
  async setOnmountTransactionsCallback(incomingData) {
    this.updateChartAndTableDimensions(null);
    let objectheaders = Object.keys({
      transactionnumber: 0,
      confirmations: 0,
      time: new Date(),
      category: '',
      amount: 0,
      txid: 0,
      account: '',
      address: '',
      value: {
        USD: 0,
        BTC: 0,
      },
      coin: 'Nexus',
      fee: 0,
    });
    let tabelheaders = [];
    objectheaders.forEach(element => {
      tabelheaders.push({
        Header: element,
        accessor: element,
      });
    });

    this.props.SetWalletTransactionArray(incomingData);
    let tempZoomDomain = {
      x: [new Date(), new Date(new Date().getFullYear() + 1, 1, 1, 1, 1, 1, 1)],
      y: [0, 1],
    };
    if (incomingData != undefined && incomingData.length > 0) {
      //console.log(incomingData[0]);
      tempZoomDomain = {
        x: [
          new Date(incomingData[0].time.getTime() - 43200000),
          new Date(
            incomingData[incomingData.length - 1].time.getTime() + 43200000
          ),
        ],
        y: [-1, 1],
      };
    }
    this.setState(
      {
        tableColumns: tabelheaders,
        zoomDomain: tempZoomDomain,
      },
      () => this.handleZoom(this.state.zoomDomain)
    );

    let temp = this.state.transactionsToCheck;
    incomingData.forEach(element => {
      let temphistoryData = this.findclosestdatapoint(
        element.time.getTime().toString()
      );
      if (temphistoryData == undefined) {
        temp.push(element.time);
      }
    });
    this.setState({
      transactionsToCheck: temp,
    });
    this.gothroughdatathatneedsit();
    // console.log(temp);
  }

  //
  /**
   * Updates the height and width of the chart and table when you resize the window
   *
   * @param {*} event The event hook for changing the window dimentions
   * @returns can return null if chart is udefined
   * @memberof Transactions
   */
  updateChartAndTableDimensions(event) {
    let chart = document.getElementById('transactions-chart');
    if (chart === undefined || chart === null) {
      return;
    }
    let parent = chart.parentNode;
    let mainHeight = 150; // fixed height, should match CSS
    this.setState({
      mainChartWidth: parent.clientWidth,
      mainChartHeight: mainHeight,
    });
  }

  /**
   * Open Tx Detail modal
   *
   * @memberof Transactions
   */
  openTxDetailsModal = () => {
    this.props.openModal(TransactionDetailsModal, {
      hoveringID: this.hoveringID,
      walletItemsMap: this.props.walletitemsMap,
      settings: this.props.settings,
    });
  };

  /**
   * This is the method that is called when the user pressed the right click
   *
   * @memberof Transactions
   * @param {*} e event hook for html for right click
   */
  transactioncontextfunction = e => {
    const { locale } = this.props.settings;
    // Prevent default action of right click
    e.preventDefault();

    const defaultcontextData = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(defaultcontextData);
    //create new custom
    let transactiontablecontextmenu = new remote.Menu();

    // Build out the context menu

    transactiontablecontextmenu.append(
      new remote.MenuItem({
        label: translate('transactions.MoreDetails', locale),
        click: this.openTxDetailsModal,
      })
    );

    let tablecopyaddresscallback = function() {
      if (this.hoveringID != 999999999999) {
        this.copysomethingtotheclipboard(
          this.props.walletitemsMap.get(this.hoveringID).address
        );
      }
    };
    tablecopyaddresscallback = tablecopyaddresscallback.bind(this);

    let tablecopyamountcallback = function() {
      if (this.hoveringID != 999999999999) {
        this.copysomethingtotheclipboard(
          this.props.walletitemsMap.get(this.hoveringID).amount
        );
      }
    };
    tablecopyamountcallback = tablecopyamountcallback.bind(this);

    let tablecopyaccountcallback = function() {
      if (this.hoveringID != 999999999999) {
        this.copysomethingtotheclipboard(
          this.props.walletitemsMap.get(this.hoveringID).account
        );
      }
    };
    tablecopyaccountcallback = tablecopyaccountcallback.bind(this);

    transactiontablecontextmenu.append(
      new remote.MenuItem({
        label: translate('Settings.Copy', locale),
        submenu: [
          {
            label: translate('AddressBook.Address', locale),
            click() {
              tablecopyaddresscallback();
            },
          },
          {
            label: translate('AddressBook.Account', locale),

            click() {
              tablecopyaccountcallback();
            },
          },
          {
            label: translate('sendReceive.TableAmount', locale),
            click() {
              tablecopyamountcallback();
            },
          },
        ],
      })
    );

    // Additional Functions for the context menu
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Following functions were put on hold as the sendpage was redone and the blockexploerer was removed, we should have some of this one day
    // when these pages are better suited

    let sendtoSendcallback = function() {
      this.props.SetSendAgainData({
        address: this.props.walletitems[this.hoveringID].address,
        account: this.props.walletitems[this.hoveringID].account,
        amount: this.props.walletitems[this.hoveringID].amount,
      });
      this.props.history.push('/Send');
    };
    //sendtoSendcallback = sendtoSendcallback.bind(this);

    let sendtoBlockExplorercallback = function() {
      this.props.SetExploreInfo({
        transactionId: this.props.walletitems[this.hoveringID].txid,
      });
      this.props.history.push('/BlockExplorer');
    };

    //sendtoBlockExplorercallback = sendtoBlockExplorercallback.bind(this);

    /* //Putting this on hold
    //Add Resending the transaction option
    transactiontablecontextmenu.append(
      new remote.MenuItem({
        label: "Send Again",
        click() {

          sendtoSendcallback();
 
        }
      })
    ); */
    /*  Currently Block Explorer is turned off. 
    //Add Open Explorer Option
    transactiontablecontextmenu.append(
      new remote.MenuItem({
        label: "Open Explorer",
        click() {
          sendtoBlockExplorercallback();
        }
      })
    );
    */

    if (this.isHoveringOverTable) {
      transactiontablecontextmenu.popup(remote.getCurrentWindow());
    } else {
      defaultcontextmenu.popup(remote.getCurrentWindow());
    }
  };

  /**
   * Copy to Clipboard
   *
   * @param {*} instringtocopy The string to copy to the clipboard
   * @memberof Transactions
   */
  copysomethingtotheclipboard(instringtocopy) {
    copy(instringtocopy);
  }

  /**
   * Gets all the data from each account held by the wallet
   *
   * @param {*} finishingCallback The Method to use after all the data is processed from the daemon
   * @returns {null} Cen return null if no data is retreived, exit for this method is finishingCallback
   * @memberof Transactions
   */
  async getTransactionData(finishingCallback) {
    let incomingMyAccounts;
    let listedaccounts = [];
    const numberOfTransactionsPerCall = 100;
    const numberOfCallsToMake = Math.ceil(
      this.props.txtotal / numberOfTransactionsPerCall
    );
    let promisList = [];
    if (
      this.props.selectedAccount == 0 ||
      this.props.selectedAccount === undefined
    ) {
      incomingMyAccounts = this.props.myAccounts;
      for (
        let txPageCounter = 0;
        txPageCounter < numberOfCallsToMake;
        txPageCounter++
      ) {
        promisList.push(
          rpc('listtransactions', [
            '*',
            numberOfTransactionsPerCall,
            numberOfTransactionsPerCall * txPageCounter,
          ])
        );
      }
    } else {
      incomingMyAccounts = this.props.myAccounts[
        this.props.selectedAccount - 1
      ];
      listedaccounts.push(incomingMyAccounts.account);
      for (
        let txPageCounter = 0;
        txPageCounter < numberOfCallsToMake;
        txPageCounter++
      ) {
        promisList.push(
          rpc('listtransactions', [
            incomingMyAccounts.account,
            numberOfTransactionsPerCall,
            numberOfTransactionsPerCall * txPageCounter,
          ])
        );
      }
    }
    let tempWalletTransactions = [];

    // If in Dev Mode add some random transactions
    if (
      this.props.settings.devMode == true &&
      this.props.settings.fakeTransactions
    ) {
      console.log('Making Fakes');
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
    }
    if (
      (promisList == null ||
        promisList == undefined ||
        promisList.length == 0) &&
      tempWalletTransactions.length == 0
    ) {
      return;
    }
    const processedAddresses = await Promise.all(promisList);
    processedAddresses.forEach(eachAddress => {
      for (let index = 0; index < eachAddress.length; index++) {
        const elementTransaction = eachAddress[index];
        // if a move happend don't place it in the chart or table.
        // we no longer use move however for legacy we should still have this.
        if (elementTransaction.category === 'move') {
          return;
        }
        const getLable = this.state.addressLabels.get(
          elementTransaction.address
        );

        let tempTrans = {
          transactionnumber: index,
          confirmations: elementTransaction.confirmations,
          time: new Date(elementTransaction.time * 1000),
          category: elementTransaction.category,
          amount: elementTransaction.amount,
          txid: elementTransaction.txid,
          account: getLable,
          address: elementTransaction.address,
          value: {
            USD: 0,
            BTC: 0,
          },
          coin: 'Nexus',
          fee: 0,
        };
        let closestData = this.findclosestdatapoint(
          tempTrans.time.getTime().toString()
        );
        if (closestData != undefined) {
          tempTrans.value[this.props.settings.fiatCurrency] =
            closestData[this.props.settings.fiatCurrency];
          tempTrans.value.BTC = closestData.BTC;
        }
        tempWalletTransactions.push(tempTrans);
      }
    });

    tempWalletTransactions.sort((a, b) => {
      return a.time > b.time ? 1 : b.time > a.time ? -1 : 0;
    });

    if (finishingCallback != undefined) {
      finishingCallback(tempWalletTransactions);
    } else {
      this.props.SetWalletTransactionArray(tempWalletTransactions);
    }
  }

  //
  /**
   * Set the display property in state from the dropdown element
   *
   * @param {*} value The Value of the selected item in the dropdown menu
   * @memberof Transactions
   */
  transactionTimeframeChange(value) {
    this.setState({
      displayTimeFrame: value,
      changeTimeFrame: true,
    });
  }

  /**
   * Download CSV
   *
   * @memberof Transactions
   */
  DownloadCSV() {
    if (this.state.CSVProgress > 0) {
      // If your already running then don't try and run again
      return;
    }

    this.props.openModal(CSVDownloadModal, {
      parent: this.setCSVEvents.bind(this),
      progress: this.state.CSVProgress,
    });
    this.gatherAllFeeData();
  }

  /**
   * Gather All fee data for every debit/send transaction
   *
   * @memberof Transactions
   */
  async gatherAllFeeData() {
    let feePromises = [];
    let numberOfSends = 0;
    let feeData = new Map();

    this.props.walletitems.forEach(element => {
      if (element.category == 'debit' || element.category == 'send') {
        feePromises.push(
          rpc('gettransaction', [element.txid]).then(payload => {
            feeData.set(payload.time, payload.fee);
            numberOfSends++;
            this.setState(
              {
                CSVProgress: numberOfSends / feePromises.length,
              },
              () => {
                this.updateProgress();
              }
            );
          })
        );
      }
    });
    await Promise.all(feePromises);
    this.setFeeValuesOnTransaction(feeData);
    this.finishCSVProcessing();
  }

  /**
   * Set events for the CSV Listener
   *
   * @param {*} events
   * @memberof Transactions
   */
  setCSVEvents(events) {
    this._Onprogress = events.progress;
    this._OnCSVFinished = events.finished;
  }

  /**
   * Each time a transaction is done processing, run this.
   *
   * @memberof Transactions
   */
  updateProgress() {
    this._Onprogress(this.state.CSVProgress * 100);
  }

  /**
   * When proccessing is finished, open up the save dialog
   *
   * @memberof Transactions
   */
  finishCSVProcessing() {
    googleanalytics.SendEvent('Transaction', 'Data', 'Download CSV', 1);
    this.saveCSV(this.returnAllFilters([...this.props.walletitems]));
    this._OnCSVFinished();
    this.setState({
      CSVProgress: 0,
    });
  }

  /**
   * creates a CSV file then prompts the user to save that file
   *
   * @param {[*]} DataToSave Transactions to save
   * @memberof Transactions
   */
  saveCSV(DataToSave) {
    const rows = []; //Set up a blank array for each row

    let currencyValueLable = this.props.settings.fiatCurrency + ' Value';

    //This is so we can have named columns in the export, this will be row 1
    let NameEntry = [
      'Number',
      'Account',
      'Address',
      'Amount',
      currencyValueLable,
      'BTC Value',
      'Type',
      'Time',
      'Transaction ID',
      'Confirmations',
      'Fee',
    ];
    rows.push(NameEntry);

    //Below: add a new data entry as a new row
    for (let i = 0; i < DataToSave.length; i++) {
      //Add each column here,
      let tempentry = [
        i + 1,
        DataToSave[i].account,
        DataToSave[i].address,
        DataToSave[i].amount,
        (
          DataToSave[i].amount *
          DataToSave[i].value[this.props.settings.fiatCurrency]
        ).toFixed(2),
        (DataToSave[i].amount * DataToSave[i].value.BTC).toFixed(8),
        DataToSave[i].category,
        DataToSave[i].time,
        DataToSave[i].txid,
        DataToSave[i].confirmations,
        DataToSave[i].fee,
      ];
      rows.push(tempentry);
    }
    let csvContent = 'data:text/csv;charset=utf-8,'; //Set formating
    rows.forEach(function(rowArray) {
      let row = rowArray.join(',');
      csvContent += row + '\r\n';
    }); //format each row

    let encodedUri = encodeURI(csvContent); //Set up a uri, in Javascript we are basically making a Link to this file
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'nexus-transactions.csv'); //give link an action and a default name for the file. MUST BE .csv

    document.body.appendChild(link); // Required for FF

    link.click(); //Finish by "Clicking" this link that will execute the download action we listed above
    document.body.removeChild(link);
  }

  //
  /**
   * Callback for when you change the category filter
   *
   * @memberof Transactions
   */
  transactiontypefiltercallback = categoryFilter => {
    this.setState({
      categoryFilter,
    });
  };

  //
  /**
   * Callback for when you change the amount filter
   *
   * @memberof Transactions
   */
  transactionamountfiltercallback = e => {
    const amountFilterValue = e.target.value;
    this.setState({
      amountFilter: amountFilterValue,
    });
  };

  //
  /**
   * Callback for when you change the address filter
   *
   * @memberof Transactions
   */
  transactionaddressfiltercallback = e => {
    const addressfiltervalue = e.target.value;
    this.setState({
      addressFilter: addressfiltervalue,
    });
  };

  //
  /**
   * Filter the transactions based on the CategoryFilter
   *
   * @param {[*]} inTransactions Current list of transactions to filter
   * @returns {[*]} List of transactions after the filtering
   * @memberof Transactions
   */
  filterByCategory(inTransactions) {
    let tempTrans = [];
    const categoryFilterValue = this.state.categoryFilter;

    for (let index = 0; index < inTransactions.length; index++) {
      const element = inTransactions[index];
      if (categoryFilterValue == 'all') {
        tempTrans.push(element);
      } else {
        if (categoryFilterValue == element.category) {
          tempTrans.push(element);
        }
      }
    }
    return tempTrans;
  }

  //
  /**
   * Filter the transactions based on the AmountFilter
   *
   * @param {[*]} inTransactions Current list of transactions to filter
   * @returns {[*]} List of transactions after the filtering
   * @memberof Transactions
   */
  filterbyAmount(inTransactions) {
    let tempTrans = [];
    const amountFilterValue = this.state.amountFilter;

    for (let index = 0; index < inTransactions.length; index++) {
      const element = inTransactions[index];

      if (Math.abs(element.amount) >= amountFilterValue) {
        tempTrans.push(element);
      }
    }
    return tempTrans;
  }

  //
  /**
   * Filter the transactions based on the AddressFilter
   *
   * @param {[*]} inTransactions Current list of transactions to filter
   * @returns {[*]} List of transactions after the filtering
   * @memberof Transactions
   */
  filterByAddress(inTransactions) {
    const addressFilter = this.state.addressFilter.toLowerCase();
    return inTransactions.filter(
      tx =>
        tx &&
        ((tx.address == undefined &&
          (tx.category == 'generate' || tx.category == 'immature')) ||
          (tx.address && tx.address.toLowerCase().includes(addressFilter)))
    );
  }

  //
  /**
   * Filter the transactions based on the DisplayTimeFrame
   *
   * @param {[*]} inTransactions Current list of transactions to filter
   * @returns {[*]} List of transactions after the filtering
   * @memberof Transactions
   */
  filterByTime(inTransactions) {
    let tempTrans = [];
    const timeFilterValue = this.state.displayTimeFrame;
    let todaydate = new Date();
    let pastdate = null;

    if (timeFilterValue == 'Week') {
      pastdate = new Date(
        todaydate.getFullYear(),
        todaydate.getMonth(),
        todaydate.getDate() - 7
      );
    } else if (timeFilterValue == 'Month') {
      pastdate = new Date(
        todaydate.getFullYear(),
        todaydate.getMonth() - 1,
        todaydate.getDate()
      );
    } else if (timeFilterValue == 'Year') {
      pastdate = new Date(
        todaydate.getFullYear() - 1,
        todaydate.getMonth(),
        todaydate.getDate()
      );
    } else {
      if (this.state.changeTimeFrame) {
        this.handleZoom({
          x: [
            inTransactions[0].time,
            inTransactions[inTransactions.length - 1].time,
          ],
          y: [0, 1],
        });
        this.setState({
          changeTimeFrame: false,
        });
      }
      return inTransactions;
    }
    todaydate = Math.round(todaydate.getTime());
    pastdate = Math.round(pastdate.getTime());

    todaydate = todaydate + 1000;

    for (let index = 0; index < inTransactions.length; index++) {
      //just holding this to keep it clean
      const element = inTransactions[index];

      //Am I in the time frame provided
      if (element.time >= pastdate && element.time <= todaydate) {
        tempTrans.push(element);
      }
    }

    if (this.state.changeTimeFrame) {
      this.handleZoom({
        x: [pastdate, new Date()],
        y: [0, 1],
      });
      this.setState({
        changeTimeFrame: false,
      });
    }

    return tempTrans;
  }

  /**
   * Returns all the transaction that have been filtered by the filter
   *
   * @param {[*]} inTransactions Current list of transactions to filter
   * @returns {[*]} List of transactions after all the filtering is complete
   * @memberof Transactions
   */
  returnAllFilters(inTransactions) {
    if (!inTransactions || !inTransactions.length) {
      return inTransactions;
    }
    let tempTrans = inTransactions;
    tempTrans = this.filterByTime(tempTrans);
    tempTrans = this.filterByCategory(tempTrans);
    tempTrans = this.filterByAddress(tempTrans);
    tempTrans = this.filterbyAmount(tempTrans);
    return tempTrans;
  }

  //
  /**
   * DEV MODE: Create a fake transaction for testing.
   *
   * @returns a fake transaction
   * @memberof Transactions
   */
  TEMPaddfaketransaction() {
    let faketrans = {
      transactionnumber:
        this.props.walletitems != undefined ? this.props.walletitems.length : 0,
      confirmations: 1000,
      time: new Date(),
      category: '',
      amount: Math.random() * 100,
      txid: '00000000000000000000000000000000000000000',
      account: 'Random',
      address: '1111111111111111111111111111111',
      value: {
        USD: 1.9,
        BTC: 0.0003222,
      },
      coin: 'Nexus',
      fee: 0,
    };
    let tempTransactionRandomCategory = function() {
      let temp = Math.ceil(Math.random() * 4);
      if (temp == 4) {
        return 'debit';
      } else if (temp == 1) {
        return 'receive';
      } else if (temp == 2) {
        return 'stake';
      } else {
        return 'genesis';
      }
    };

    let tempTransactionRandomTime = function() {
      let start = new Date(new Date().getFullYear() - 1, 1, 1);
      let end = new Date();
      let randomtime = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
      return randomtime;
    };

    faketrans.category = tempTransactionRandomCategory();
    faketrans.time = tempTransactionRandomTime();
    //faketrans.time = Math.round(faketrans.time);

    if (faketrans.category == 'debit') {
      faketrans.amount = faketrans.amount * -1;
    }

    return faketrans;
  }

  //
  /**
   * What happens when you select something in the table
   *
   * @param {*} e HTML event
   * @param {*} indata The datapoint that the cursor has clicked
   * @memberof Transactions
   */
  tableSelectCallback(e, indata) {
    this.hoveringID =
      indata.original.time.toString() +
      indata.original.account +
      indata.original.amount.toString();
  }

  //
  /**
   * Return the data to be placed into the Table
   *
   * @returns The transaction datas as filtered and formated to be placed in the table
   * @memberof Transactions
   */
  returnFormatedTableData() {
    if (this.props.walletitems == undefined) {
      return [];
    }
    const formatedData = this.returnAllFilters([...this.props.walletitems]);
    let txCounter = 0; // This is just to list out the transactions in order this is not apart of a transaction.

    return formatedData.map(ele => {
      txCounter++;
      let isPending = '';
      let tempCategory = ele.category;
      if (ele.confirmations <= this.props.settings.minConfirmations) {
        isPending = '(Pending)';
      }

      return {
        transactionnumber: txCounter,
        time: ele.time,
        category: ele.category + isPending,
        amount: ele.amount,
        account: ele.account,
        address: ele.address,
      };
    });
  }

  /**
   * Returns the columns and their rules/formats for the Table
   *
   * @returns {[*]} The columns for the table
   * @memberof Transactions
   */
  returnTableColumns() {
    var options = {
      month: 'short',
      year: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    };
    let tempColumns = [];

    tempColumns.push({
      Header: <Text id="transactions.TX" />,
      accessor: 'transactionnumber',
      maxWidth: 100,
    });

    tempColumns.push({
      Header: <Text id="transactions.Time" />,
      id: 'time',
      Cell: d => (
        <div>
          {' '}
          {d.value.toLocaleString(this.props.settings.locale, options)}{' '}
        </div>
      ), // We want to display the time in  a readable format
      accessor: 'time',
      maxWidth: 220,
    });

    tempColumns.push({
      id: 'category',
      Cell: q => {
        if (q.value === 'debit' || q.value === 'send') {
          return <Text id="transactions.Sent" />;
        } else if (q.value === 'credit' || q.value === 'receive') {
          return <Text id="transactions.Receive" />;
        } else if (q.value === 'genesis') {
          return <Text id="transactions.Genesis" />;
        } else if (q.value === 'trust') {
          return <Text id="transactions.Trust" />;
        } else if (q.value.endsWith('(Pending)')) {
          return <Text id="transactions.Pending" />;
        } else if (q.value === 'generate') {
          return <Text id="transactions.Generate" />;
        } else if (q.value === 'immature') {
          return <Text id="transactions.Immature" />;
        } else if (q.value === 'stake') {
          return <Text id="transactions.Stake" />;
        } else if ((q.value = 'orphan')) {
          return <Text id="transactions.Orphan" />;
        } else {
          return <Text id="transactions.UnknownCategory" />;
        }
      },
      Header: <Text id="transactions.Category" />,
      accessor: 'category',

      maxWidth: 85,
    });

    tempColumns.push({
      Header: <Text id="transactions.Amount" />,
      accessor: 'amount',
      maxWidth: 100,
    });

    tempColumns.push({
      Header: <Text id="transactions.Account" />,
      accessor: 'account',
      maxWidth: 150,
    });

    tempColumns.push({
      Header: <Text id="transactions.Address" />,
      accessor: 'address',
    });
    return tempColumns;
  }

  /**
   * Returns formated data for the Victory Chart
   *
   * @returns {[*]} The transaction data as filtered and formated to be placed in the Victory Chart
   * @memberof Transactions
   */
  returnChartData() {
    if (this.props.walletitems == undefined) {
      return [];
    }
    const difference = this.state.zoomDomain.x[1] - this.state.zoomDomain.x[0];

    //console.log(this.state.zoomDomain.x[1] - this.state.zoomDomain.x[0]);
    let filteredData = this.returnAllFilters([...this.props.walletitems]);
    //console.log(filteredData.length);
    /*
    if (filteredData.length > 100) {
      let arraylength = filteredData.length;
      for (let index = 1; index < arraylength; index++) {
        const element = filteredData[index];
        if (element.category === filteredData[index - 1].category) {
          const timeDif = element.time - filteredData[index - 1].time;
          if (timeDif <= 86400000) {
            console.log('COMBINED ITEMS: ');

            filteredData[index].amount =
              element.amount + filteredData[index - 1].amount;
            const removed = filteredData.splice(index - 1, 1);
            console.log(removed);
            arraylength = filteredData.length;
          }
        }
      }
    }
    */
    //console.log(filteredData);
    return filteredData
      .map(ele => {
        return {
          a: ele.time,
          b: ele.amount,
          fill: 'white',
          category: ele.category,
        };
      })
      .filter(
        e =>
          e.a > this.state.zoomDomain.x[0] && e.a < this.state.zoomDomain.x[1]
      );
  }

  //
  /**
   * returns the correct fill color based on the category
   *
   * @param {*} inData A Given Transaction
   * @returns A Color in string HEX format
   * @memberof Transactions
   */
  returnCorrectFillColor(inData) {
    if (inData.category == 'credit') {
      return '#0ca4fb';
    } else if (inData.category == 'debit') {
      return '#035';
    } else {
      return '#fff';
    }
  }

  //
  /**
   * Returns the Correct color based on the category
   *
   * @param {*} inData A given transaction
   * @returns A color in string HEX format
   * @memberof Transactions
   */
  returnCorrectStokeColor(inData) {
    if (inData.category == 'credit') {
      return '#0ca4fb';
    } else if (inData.category == 'debit') {
      return '#035';
    } else {
      return '#fff';
    }
  }

  //
  /**
   * Returns the tooltip lable for the chart
   *
   * @memberof Transactions
   */
  returnToolTipLable = inData => {
    const { locale } = this.props.settings;
    var options = {
      month: 'short',
      weekday: 'short',
      year: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    };

    if (inData.category == 'credit' || inData.category === 'receive') {
      inData.category = translate('transactions.Receive', locale);
    } else if (inData.category == 'debit' || inData.category === 'send') {
      inData.category = translate('transactions.Sent', locale);
    } else if (inData.category == 'genesis') {
      inData.category = translate('transactions.Genesis', locale);
    } else if (inData.category == 'trust') {
      inData.category = translate('transactions.Trust', locale);
    } else if (inData.category == 'generate') {
      inData.category = translate('transactions.Generate', locale);
    } else if (inData.category == 'immature') {
      inData.category = translate('transactions.Immature', locale);
    } else if (inData.category == 'stake') {
      inData.category = translate('transactions.Stake', locale);
    } else if (inData.category == 'orphan') {
      inData.category = translate('transactions.Orphan', locale);
    } else {
      inData.category = translate('transactions.UnknownCategory', locale);
    }
    return (
      inData.category +
      `\n ${translate('transactions.AMOUNT', locale)}` +
      inData.b +
      `\n ${translate('transactions.TIME', locale)}` +
      inData.a
    );
  };

  //
  /**
   * The event listener for when you zoom in and out
   *
   * @param {*} domain A object that contains 2 arrys, x and y, x/y are arrays that are [minx,maxy] format
   * @memberof Transactions
   */
  handleZoom(domain) {
    domain.x[0] = new Date(domain.x[0]);
    domain.x[1] = new Date(domain.x[1]);

    let high = 0;
    let low = 0;
    for (let index = 0; index < this.props.walletitems.length; index++) {
      const element = this.props.walletitems[index];
      if (element.time >= domain.x[0] && element.time <= domain.x[1]) {
        if (element.amount > high) {
          high = element.amount + element.amount * 0.3;
        }

        if (element.amount < low) {
          low = element.amount - 1;
        }
      }
    }

    high = high == 0 ? 1 : high;
    domain.y[0] = -high;
    domain.y[1] = high;
    this.setState({ zoomDomain: domain });
  }

  //
  /**
   * the callback for when you mouse over a transaction on the table.
   *
   * @param {*} e HTML event
   * @param {*} inData The data that the mouse is over
   * @memberof Transactions
   */
  mouseOverCallback(e, inData) {
    this.isHoveringOverTable = true;
  }

  //
  /**
   * The call back for when the mouse moves out of the table div.
   *
   * @param {*} e HTML Event
   * @memberof Transactions
   */
  mouseOutCallback(e) {
    this.isHoveringOverTable = false;
  }

  //
  /**
   * Either load in the file from local or start downloading more data and make a new one.
   *
   * @memberof Transactions
   */
  gethistorydatajson() {
    try {
      const appdataloc = walletDataDir + '/historydata.json';
      let incominghistoryfile = JSON.parse(fs.readFileSync(appdataloc, 'utf8'));
      let keys = Object.keys(incominghistoryfile);
      let newTempMap = new Map();
      keys.forEach(element => {
        newTempMap.set(Number(element), incominghistoryfile[element]);
      });
      this.setState({
        historyData: newTempMap,
      });
    } catch (err) {}
  }

  /**
   * Helper method to create URL's quickly
   *
   * @param {*} coinsym The symbol for the coin/fiat we are looking for MUST BE IN CAPS
   * @param {*} timestamptolook timestamp string ( in seconds) that will be the to var in looking up data
   * @returns
   * @memberof Transactions
   */
  createcryptocompareurl(coinsym, timestamptolook) {
    let tempurl =
      'https://min-api.cryptocompare.com/data/pricehistorical?fsym=NXS&tsyms=' +
      coinsym +
      '&ts=' +
      timestamptolook;
    return tempurl;
  }

  /**
   * Build a object from incoming data then dispatch that to redux to populate that transaction
   *
   * @param {*} timeID Timestamp
   * @param {*} USDvalue the value in FIAT
   * @param {*} BTCValue the value in BTC
   * @memberof Transactions
   */
  setHistoryValuesOnTransaction(timeID, USDvalue, BTCValue) {
    let dataToChange = {
      time: timeID,
      value: {
        [this.props.settings.fiatCurrency]: USDvalue,
        BTC: BTCValue,
      },
    };
    this.props.UpdateCoinValueOnTransaction(dataToChange);
  }

  /**
   * Build a object from incoming data then dispatch that to redux to populate that transaction
   *
   * @param {*} incomingChangeData Data that needs to be changed.
   * @memberof Transactions
   */
  setFeeValuesOnTransaction(incomingChangeData) {
    this.props.UpdateFeeOnTransaction(incomingChangeData);
  }

  /**
   * Download both USD and BTC history on the incoming transaction
   *
   * @param {*} inEle the timestamp of the transaction
   * @returns
   * @memberof Transactions
   */
  downloadHistoryOnTransaction(inEle) {
    if (this._isMounted == false) {
      return;
    }
    let USDurl = this.createcryptocompareurl(
      [this.props.settings.fiatCurrency],
      inEle
    );
    let BTCurl = this.createcryptocompareurl('BTC', inEle);
    rp(USDurl).then(payload => {
      let incomingUSD = JSON.parse(payload);
      setTimeout(() => {
        if (this._isMounted == false) {
          return;
        }
        rp(BTCurl).then(payload2 => {
          if (this._isMounted == false) {
            return;
          }
          let incomingBTC = JSON.parse(payload2);
          this.setHistoryValuesOnTransaction(
            inEle,
            incomingUSD['NXS'][[this.props.settings.fiatCurrency]],
            incomingBTC['NXS']['BTC']
          );
          let tempHistory = this.state.historyData;
          if (this.state.historyData.has(inEle)) {
            tempHistory.set(inEle, {
              ...this.state.historyData.get(inEle),
              [this.props.settings.fiatCurrency]:
                incomingUSD['NXS'][[this.props.settings.fiatCurrency]],
              BTC: incomingBTC['NXS']['BTC'],
            });
          } else {
            tempHistory.set(inEle, {
              [this.props.settings.fiatCurrency]:
                incomingUSD['NXS'][[this.props.settings.fiatCurrency]],
              BTC: incomingBTC['NXS']['BTC'],
            });
          }
          this.setState({
            historyData: tempHistory,
            needsHistorySave: true,
          });
        });
      }, 100); // This may change, but right now crypto compare LIMITS how many calls we can make per seconds from one IP, space out these calls so they are not done all at the same time and have a small buffer between them.
    });
  }

  //
  /**
   * Go through all the data points that need to download new data a execute that promise
   *
   * @memberof Transactions
   */
  async gothroughdatathatneedsit() {
    for (
      let index = 0;
      index < this.state.transactionsToCheck.length;
      index++
    ) {
      let daylayaction = new Promise((resolve, reject) => {
        if (this._isMounted == false) {
          reject();
        }
        setTimeout(resolve, 100 * index); // This may change, but right now crypto compare LIMITS how many calls we can make per seconds from one IP, space out these calls so they are not done all at the same time and have a small buffer between them.
      });
      await daylayaction;
      const element = this.state.transactionsToCheck[index];
      await this.downloadHistoryOnTransaction(element.getTime());
    }

    if (this.state.transactionsToCheck.length != 0) {
      //Don't execute save if there are no additions
      this.SaveHistoryDataToJson();
    }
  }

  //
  /**
   * Save the history data to a json file
   *
   * @returns
   * @memberof Transactions
   */
  SaveHistoryDataToJson() {
    if (
      this.state.historyData.size == 0 ||
      this.state.needsHistorySave == false
    ) {
      return;
    }
    this.setState({
      needsHistorySave: false,
    });

    const appdataloc = walletDataDir + '/historydata.json';
    fs.writeFile(
      appdataloc,
      JSON.stringify(this.mapToObject(this.state.historyData)),
      err => {
        if (err != null) {
          console.log(err);
        }
      }
    );
  }

  /**
   * Used to transform a Map to a Object so that we can save it to a json file
   * http://embed.plnkr.co/oNlQQBDyJUiIQlgWUPVP/
   * Based on code from http://2ality.com/2015/08/es6-map-json.html
   *
   * @param {*} aMap A map of the data
   * @returns A object that replaces the map but contains the same data.
   * @memberof Transactions
   */
  mapToObject(aMap) {
    let obj = Object.create(null);

    for (let [k, v] of aMap) {
      // We don’t escape the key '__proto__' which can cause problems on older engines
      if (v instanceof Map) {
        obj[k.toString()] = this.mapToObject(v); // handle Maps that have Maps as values
      } else {
        obj[k.toString()] = v; // calling toString handles case where map key is not a string JSON requires key to be a string
      }
    }
    return obj;
  }

  /**
   * If you give this a timestamp it will find the closes timestamp to the nearest hour. And returns the object containing priceUSD and priceBTC
   *
   * @param {*} intimestamp Timestamp to look up
   * @returns A object that contains priceUSD and priceBTC
   * @memberof Transactions
   */
  findclosestdatapoint(intimestamp) {
    let datatograb = this.state.historyData.get(Number(intimestamp));
    if (datatograb == undefined) {
      return undefined;
    } else {
      if (datatograb[[this.props.settings.fiatCurrency]] == undefined) {
        return undefined;
      } else {
        return datatograb;
      }
    }
  }

  /**
   * Compares a Date to a from Date and a To Date and returns a Bool
   *
   * @param {*} indate Date to check
   * @param {*} starttime Date from
   * @param {*} endtime Date to
   * @returns {bool} Is this true or not
   * @memberof Transactions
   */
  comparedate(indate, starttime, endtime) {
    if (starttime <= indate && indate <= endtime) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Return Default Page Size
   *
   * @returns {number}
   * @memberof Transactions
   */
  returnDefaultPageSize() {
    let defPagesize = 10;
    if (this.props.walletitems != undefined) {
      defPagesize = this.props.walletitems.length < 10 ? 0 : 10;
    } else {
      defPagesize = 10;
    }
    return defPagesize;
  }

  /**
   * Change Account
   *
   * @memberof Transactions
   */
  accountChanger = () => {
    const { locale } = this.props.settings;
    if (this.props.myAccounts) {
      const accounts = this.props.myAccounts.map((e, i) => ({
        value: i + 1,
        display: e.account,
      }));
      return [
        { value: 0, display: translate('transactions.AllAccounts', locale) },
        ...accounts,
      ];
    }
    return [];
  };

  /**
   * Select Account
   *
   * @param {*} inAccount
   * @memberof Transactions
   */
  selectAccount(inAccount) {
    this.props.SetSelectedMyAccount(inAccount);
  }

  toggleVictoryChart() {
    const value = !this.props.settings.showTransactionChart;
    this.props.ToggleTransactionChart({ showTransactionChart: value });
    //console.log(this.props.settings.showTransactionChart);
    //console.log(this.props.settings);
    UpdateSettings({
      showTransactionChart: value,
    });
    this.setState({
      showTransactionChart: value,
    });
  }

  /**
   * Return Victory Chart
   *
   * @returns Victory Chart JSX
   * @memberof Transactions
   */
  returnVictoryChart() {
    const chartData = this.returnChartData();
    const VictoryZoomVoronoiContainer = createContainer('voronoi', 'zoom');
    const leftPadding =
      parseInt(this.state.zoomDomain.y[0]).toString().length * 10;
    return (
      <VictoryChart
        width={this.state.mainChartWidth}
        height={this.state.mainChartHeight}
        scale={{ x: 'time' }}
        style={{
          overflow: 'visible',
          border: '1px solid ' + this.props.theme.primary,
        }}
        domainPadding={{ x: 90, y: 30 }}
        padding={{
          top: 6,
          bottom: 6,
          left: leftPadding < 30 ? 30 : leftPadding,
          right: 0,
        }}
        domain={this.state.zoomDomain}
        containerComponent={
          <VictoryZoomVoronoiContainer
            voronoiPadding={10}
            zoomDimension="x"
            zoomDomain={this.state.zoomDomain}
            onZoomDomainChange={this.handleZoom.bind(this)}
          />
        }
      >
        <VictoryBar
          style={{
            data: {
              fill: d => this.returnCorrectFillColor(d),
              stroke: d => this.returnCorrectStokeColor(d),
              fillOpacity: 0.85,
              strokeWidth: 1,
              fontSize: 3000,
            },
          }}
          labelComponent={
            <VictoryTooltip
              orientation={incomingProp => {
                let internalDifference =
                  this.state.zoomDomain.x[1].getTime() -
                  this.state.zoomDomain.x[0].getTime();
                internalDifference = internalDifference / 2;
                internalDifference =
                  this.state.zoomDomain.x[0].getTime() + internalDifference;
                if (incomingProp.a.getTime() <= internalDifference) {
                  return 'right';
                } else {
                  return 'left';
                }
              }}
            />
          }
          labels={d => this.returnToolTipLable(d)}
          data={this.state.showTransactionChart ? chartData : []}
          x="a"
          y="b"
        />

        <VictoryAxis
          // label="Time"
          independentAxis
          style={{
            axis: { stroke: this.props.theme.primary, strokeOpacity: 1 },
            axisLabel: { fontSize: 16 },
            grid: {
              stroke: this.props.theme.primary,
              strokeOpacity: 0.25,
            },
            ticks: {
              stroke: this.props.theme.primary,
              strokeOpacity: 0.75,
              size: 10,
            },
            tickLabels: { fontSize: 11, padding: 5, fill: '#bbb' },
          }}
        />

        <VictoryAxis
          // label="Amount"
          dependentAxis
          style={{
            axis: { stroke: this.props.theme.primary, strokeOpacity: 1 },
            axisLabel: { fontSize: 16 },
            grid: {
              stroke: this.props.theme.primary,
              strokeOpacity: 0.25,
            },
            ticks: {
              stroke: this.props.theme.primary,
              strokeOpacity: 0.75,
              size: 10,
            },
            tickLabels: { fontSize: 11, padding: 5, fill: '#bbb' },
          }}
        />
      </VictoryChart>
    );
  }

  // Mandatory React method
  /**
   * React Render
   *
   * @returns JSX for Element
   * @memberof Transactions
   */
  render() {
    const data = this.returnFormatedTableData();
    const columns = this.returnTableColumns();
    const open = this.state.open;
    const pageSize = this.returnDefaultPageSize();
    const renderTransactionChart = this.state.showTransactionChart;
    return (
      <Panel
        icon={transactionIcon}
        title={<Text id="transactions.Details" />}
        controls={
          <Select
            value={this.props.selectedAccount}
            onChange={value => this.selectAccount(value)}
            options={this.accountChanger()}
            style={{ minWidth: 200, fontSize: 15 }}
          />
        }
      >
        {this.props.connections === undefined ? (
          <WaitingMessage>
            <Text id="transactions.Loading" />
            ...
          </WaitingMessage>
        ) : (
          <div>
            <Button
              style={{
                width: '16px',
                height: '12px',
                display: 'inline',
                border: '2px solid ' + this.props.theme.background,
                position: 'absolute',
                left: '8px',
                paddingLeft: '2px',
                paddingRight: '15px',
              }}
              onClick={() => this.toggleVictoryChart()}
            >
              <Arrow
                direction={renderTransactionChart ? 'up' : 'down'}
                width={12}
                height={8}
              />
            </Button>
            {renderTransactionChart ? (
              <div
                id="transactions-chart"
                style={{
                  display: data.length === 0 ? 'none' : 'block',
                  border: '2px solid ' + this.props.theme.background,
                  transition: 'all 1s ease',
                }}
              >
                {data.length === 0 || renderTransactionChart == false
                  ? null
                  : this.returnVictoryChart()}
              </div>
            ) : (
              <div style={{ fontSize: '75%' }}>Show Transaction Chart</div>
            )}
            <Filters>
              <FormField
                connectLabel
                label={<Text id="transactions.SearchAddress" />}
              >
                <TextField
                  inputProps={{
                    type: 'search',
                    name: 'addressfilter',
                    placeholder: 'Search for Address',
                    onChange: this.transactionaddressfiltercallback.bind(this),
                  }}
                  left={<Icon icon={searchIcon} className="space-right" />}
                />
              </FormField>

              <FormField label={<Text id="transactions.Type" />}>
                <Select
                  value={this.state.categoryFilter}
                  onChange={this.transactiontypefiltercallback.bind(this)}
                  options={categories}
                />
              </FormField>

              <FormField
                connectLabel
                label={<Text id="transactions.MinimumAmount" />}
              >
                <TextField
                  type="number"
                  min="0"
                  placeholder="0.00"
                  onChange={this.transactionamountfiltercallback.bind(this)}
                />
              </FormField>

              <FormField label={<Text id="transactions.Time" />}>
                <Select
                  value={this.state.displayTimeFrame}
                  onChange={this.transactionTimeframeChange.bind(this)}
                  options={timeFrames}
                />
              </FormField>

              <Tooltip.Trigger tooltip={<Text id="transactions.Download" />}>
                <Button
                  square
                  className="relative"
                  onClick={() => this.DownloadCSV()}
                >
                  <Icon icon={downloadIcon} />
                </Button>
              </Tooltip.Trigger>
            </Filters>
            <div id="transactions-details">
              <Table
                style={this.props.theme}
                key="table-top"
                data={data}
                columns={columns}
                minRows={pageSize}
                selectCallback={this.tableSelectCallback.bind(this)}
                defaultsortingid={1}
                onMouseOverCallback={this.mouseOverCallback.bind(this)}
                onMouseOutCallback={this.mouseOutCallback.bind(this)}
              />
            </div>
          </div>
        )}
      </Panel>
    );
  }
}

//not being used save for later
class CustomTooltip extends React.Component {
  // Mandatory React method
  render() {
    return (
      <g>
        <VictoryLabel {...this.props} />
        <VictoryTooltip {...this.props} orientation="right" />
      </g>
    );
  }
}

// Mandatory React-Redux method
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Transactions)
);
