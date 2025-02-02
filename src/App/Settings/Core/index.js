// External
import React, { Component } from 'react';
import { remote } from 'electron';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import cpy from 'cpy';

// Internal
import Text from 'components/Text';
import { switchSettingsTab } from 'actions/ui';
import { stopCore, startCore, restartCore } from 'actions/core';
import WaitingMessage from 'components/WaitingMessage';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Switch from 'components/Switch';
import { showNotification, openConfirmDialog } from 'actions/overlays';
import SettingsContainer from 'components/SettingsContainer';
import { updateSettings } from 'actions/settings';
import * as form from 'utils/form';
import { rpcErrorHandler } from 'utils/form';
import ReScanButton from './RescanButton.js';
import { coreDataDir } from 'consts/paths';

const mapStateToProps = ({
  settings,
  core: {
    info: { connections, version },
  },
}) => ({
  connections,
  version,
  settings,
  initialValues: {
    manualDaemonUser: settings.manualDaemonUser,
    manualDaemonPassword: settings.manualDaemonPassword,
    manualDaemonIP: settings.manualDaemonIP,
    manualDaemonPort: settings.manualDaemonPort,
    manualDaemonDataDir: settings.manualDaemonDataDir,
  },
});
const actionCreators = {
  updateSettings,
  switchSettingsTab,
  openConfirmDialog,
  showNotification,
  stopCore,
  startCore,
  restartCore,
};

/**
 * Core Settings page that is inside Settings
 *
 * @class SettingsCore
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  actionCreators
)
@reduxForm({
  form: 'coreSettings',
  destroyOnUnmount: false,
  validate: (
    {
      manualDaemonUser,
      manualDaemonPassword,
      manualDaemonIP,
      manualDaemonPort,
      manualDaemonDataDir,
    },
    props
  ) => {
    const errors = {};
    if (props.settings.manualDaemon) {
      if (!manualDaemonUser) {
        errors.manualDaemonUser = (
          <Text id="Settings.Errors.ManualDaemonUser" />
        );
      }
      if (!manualDaemonPassword) {
        errors.manualDaemonPassword = (
          <Text id="Settings.Errors.ManualDaemonPassword" />
        );
      }
      if (!manualDaemonIP) {
        errors.manualDaemonIP = <Text id="Settings.Errors.ManualDaemonIP" />;
      }
      if (!manualDaemonPort) {
        errors.manualDaemonPort = (
          <Text id="Settings.Errors.ManualDaemonPort" />
        );
      }
      if (!manualDaemonDataDir) {
        errors.manualDaemonDataDir = (
          <Text id="Settings.Errors.ManualDaemonDataDir" />
        );
      }
    }
    return errors;
  },
  onSubmit: (
    {
      manualDaemonUser,
      manualDaemonPassword,
      manualDaemonIP,
      manualDaemonPort,
      manualDaemonDataDir,
    },
    dispatch,
    props
  ) => {
    if (props.settings.manualDaemon) {
      props.updateSettings({
        manualDaemonUser,
        manualDaemonPassword,
        manualDaemonIP,
        manualDaemonPort,
        manualDaemonDataDir,
      });
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    props.showNotification(<Text id="Alert.CoreSettingsSaved" />, 'success');
  },
  onSubmitFail: rpcErrorHandler('Error Saving Settings'),
})
class SettingsCore extends Component {
  /**
   *Creates an instance of SettingsCore.
   * @param {*} props
   * @memberof SettingsCore
   */
  constructor(props) {
    super(props);
    props.switchSettingsTab('Core');
    this.updateMining = this.updateMining.bind(this);
    this.updateStaking = this.updateStaking.bind(this);
  }

  /**
   * Confirms Switch to Manual Core
   *
   * @memberof SettingsCore
   */
  confirmSwitchManualDaemon = () => {
    const {
      settings,
      openConfirmDialog,
      stopCore,
      startCore,
      updateSettings,
    } = this.props;

    if (settings.manualDaemon) {
      openConfirmDialog({
        question: <Text id="Settings.ManualDaemonExit" />,
        note: <Text id="Settings.ManualDaemonWarning" />,
        callbackYes: async () => {
          try {
            await stopCore();
          } finally {
            updateSettings({ manualDaemon: false });
            await startCore();
          }
        },
      });
    } else {
      openConfirmDialog({
        question: <Text id="Settings.ManualDaemonEntry" />,
        note: <Text id="Settings.ManualDaemonWarning" />,
        callbackYes: async () => {
          updateSettings({ manualDaemon: true });
          await stopCore();
        },
      });
    }
  };

  /**
   * Restarts Core
   *
   * @memberof SettingsCore
   */
  restartCore = () => {
    this.props.restartCore();
    this.props.showNotification(<Text id="Alert.CoreRestarting" />);
  };

  /**
   * Opens up a dialog to move the data directory
   *
   * @memberof SettingsCore
   */
  moveDataDir = () => {
    remote.dialog.showOpenDialog(
      {
        title: 'Select New Folder',
        defaultPath: this.props.backupDir,
        properties: ['openDirectory'],
      },
      folderPaths => {
        if (folderPaths && folderPaths.length > 0) {
          this.handleFileCopy(folderPaths[0]);
        }
      }
    );
  };

  /**
   * Runs the file copy script
   *
   * @param {*} newFolderDir
   * @memberof SettingsCore
   */
  async handleFileCopy(newFolderDir) {
    await cpy(coreDataDir, newFolderDir).on('progress', progress => {
      console.log(progress);
    });
  }

  updateStaking(input) {
    let value = form.resolveValue(input);
    this.props.openConfirmDialog({
      question: <Text id="Settings.RestartDaemon" />,
      note: <Text id="Settings.ReqiresRestart" />,
      labelYes: 'Restart now',
      labelNo: "I'll restart later",
      callbackYes: async () => {
        this.props.updateSettings({
          enableStaking: form.resolveValue(value),
        });
        this.restartCore();
      },
      callbackNo: () => {
        this.props.updateSettings({
          enableStaking: form.resolveValue(value),
        });
      },
    });
  }

  updateMining(input) {
    let value = form.resolveValue(input);
    this.props.openConfirmDialog({
      question: <Text id="Settings.RestartDaemon" />,
      note: <Text id="Settings.ReqiresRestart" />,
      labelYes: 'Restart now',
      labelNo: "I'll restart later",
      callbackYes: async () => {
        this.props.updateSettings({
          enableMining: form.resolveValue(value),
        });
        this.restartCore();
      },
      callbackNo: () => {
        this.props.updateSettings({
          enableMining: form.resolveValue(value),
        });
      },
    });
  }

  /**
   * Updates the settings
   *
   * @memberof SettingsCore
   */
  updateHandlers = (() => {
    const handlers = [];
    return settingName => {
      if (!handlers[settingName]) {
        handlers[settingName] = input =>
          this.props.updateSettings({
            [settingName]: form.resolveValue(input),
          });
      }
      return handlers[settingName];
    };
  })();

  // /**
  //  * Generates the number of ip witelist feilds there are
  //  *
  //  * @memberof SettingsCore
  //  */
  // ipWhiteListFeild=()=>{
  //   <TextField
  //               value={settings.verboseLevel}
  //               onChange={this.updateHandlers('verboseLevel')}
  //             />
  // }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof SettingsCore
   */
  render() {
    const {
      connections,
      handleSubmit,
      settings,
      pristine,
      submitting,
    } = this.props;

    if (connections === undefined && !settings.manualDaemon) {
      return (
        <WaitingMessage>
          <Text id="transactions.Loading" />
          ...
        </WaitingMessage>
      );
    }

    return (
      <SettingsContainer>
        <form onSubmit={handleSubmit}>
          <SettingsField
            connectLabel
            label={<Text id="Settings.EnableMining" />}
            subLabel={<Text id="ToolTip.EnableMining" />}
          >
            <Switch
              checked={settings.enableMining}
              onChange={e => this.updateMining(e)}
            />
          </SettingsField>

          {/* <div style={{ display: settings.enableMining ? 'block' : 'none' }}>
            <SettingsFieldthis.updateHandlers('enableMining')
              indent={1}
              connectLabel
              label={<Text id="Settings.IpWhitelist" />}
              subLabel={<Text id="ToolTip.IpWhitelist" />}
            >
             { this.ipWhiteListFeild()}
            </SettingsField>this.updateHandlers('enableStaking')
          </div> */}

          <SettingsField
            connectLabel
            label={<Text id="Settings.EnableStaking" />}
            subLabel={<Text id="ToolTip.EnableStaking" />}
          >
            <Switch
              checked={settings.enableStaking}
              onChange={e => this.updateStaking(e)}
            />
          </SettingsField>

          <SettingsField
            connectLabel
            label={<Text id="MyAddressesModal.Rescan" />}
            subLabel={<Text id="MyAddressesModal.RescanTooltip" />}
          >
            <ReScanButton />
          </SettingsField>

          <SettingsField
            connectLabel
            label={<Text id="Settings.VerboseLevel" />}
            subLabel={<Text id="ToolTip.Verbose" />}
          >
            <TextField
              type="number"
              value={settings.verboseLevel}
              min={0}
              max={5}
              onChange={this.updateHandlers('verboseLevel')}
              style={{ maxWidth: 50 }}
            />
          </SettingsField>

          <SettingsField
            connectLabel
            label={<Text id="Settings.ManualDaemonMode" />}
            subLabel={<Text id="ToolTip.MDM" />}
          >
            <Switch
              checked={settings.manualDaemon}
              onChange={this.confirmSwitchManualDaemon}
            />
          </SettingsField>

          <div style={{ display: settings.manualDaemon ? 'block' : 'none' }}>
            <SettingsField
              indent={1}
              connectLabel
              label={<Text id="Settings.Username" />}
              subLabel={<Text id="ToolTip.UserName" />}
            >
              <Field
                component={TextField.RF}
                name="manualDaemonUser"
                size="12"
              />
            </SettingsField>

            <SettingsField
              indent={1}
              connectLabel
              label={<Text id="Settings.Password" />}
              subLabel={<Text id="ToolTip.Password" />}
            >
              <Field
                component={TextField.RF}
                name="manualDaemonPassword"
                size="12"
              />
            </SettingsField>

            <SettingsField
              indent={1}
              connectLabel
              label={<Text id="Settings.IpAddress" />}
              subLabel={<Text id="ToolTip.IP" />}
            >
              <Field component={TextField.RF} name="manualDaemonIP" size="12" />
            </SettingsField>

            <SettingsField
              indent={1}
              connectLabel
              label={<Text id="Settings.Port" />}
              subLabel={<Text id="ToolTip.PortConfig" />}
            >
              <Field
                component={TextField.RF}
                name="manualDaemonPort"
                size="5"
              />
            </SettingsField>

            <SettingsField
              indent={1}
              connectLabel
              label={<Text id="Settings.DDN" />}
              subLabel={<Text id="ToolTip.DataDirectory" />}
            >
              <Field
                component={TextField.RF}
                name="manualDaemonDataDir"
                size={30}
              />
            </SettingsField>
          </div>

          {/*  REMOVING THIS FOR NOW TILL I CAN CONFIRM THE SECURITY AND FUNCTION
            <SettingsField
              indent={1}
              connectLabel
              label={'Move Data Dir'}
              subLabel={'Move the daemon data directory to a different folder'}
            >
              <div>
                <a>{'Current: ' + coreDataDir}</a>
                <Button onClick={this.moveDataDir}>
                  <Text id="Settings.MoveDataDirButton" />
                </Button>
              </div>
            </SettingsField>
            */}

          <div className="flex space-between" style={{ marginTop: '2em' }}>
            <Button onClick={this.restartCore}>
              <Text id="Settings.RestartCore" />
            </Button>

            {/* <Button
              type="submit"
              skin="primary"
              disabled={pristine || submitting}
            >
              {pristine ? (
                <Text id="Settings.SettingsSaved" />
              ) : submitting ? (
                <Text id="SavingSettings" />
              ) : (
                <Text id="SaveSettings" />
              )}
            </Button> */}
          </div>
        </form>
      </SettingsContainer>
    );
  }
}
export default SettingsCore;
