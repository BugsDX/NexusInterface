// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Text from 'components/Text';
import * as FlagFile from 'images/LanguageFlags';
import { updateSettings } from 'actions/settings';
import SettingsField from 'components/SettingsField';
import Select from 'components/Select';

const Flag = styled.img({
  marginRight: '.5em',
  verticalAlign: 'middle',
});

const languages = [
  {
    value: 'en',
    display: (
      <span>
        <Flag src={FlagFile.USAUK} />
        <span className="v-align">English</span>
      </span>
    ),
  },
  {
    value: 'de',
    display: (
      <span>
        <Flag src={FlagFile.Germany} />
        <span className="v-align">Deutsch</span>
      </span>
    ),
  },
  {
    value: 'es',
    display: (
      <span>
        <Flag src={FlagFile.Spain} />
        <span className="v-align">Español</span>
      </span>
    ),
  },
  {
    value: 'fr',
    display: (
      <span>
        <Flag src={FlagFile.France} />
        <span className="v-align">Français</span>
      </span>
    ),
  },
  {
    value: 'ko',
    display: (
      <span>
        <Flag src={FlagFile.Korea} />
        <span className="v-align">한국어</span>
      </span>
    ),
  },
  {
    value: 'ja',
    display: (
      <span>
        <Flag src={FlagFile.Japan} />
        <span className="v-align">日本語</span>
      </span>
    ),
  },
  {
    value: 'nl',
    display: (
      <span>
        <Flag src={FlagFile.Netherlands} />
        <span className="v-align">Nederlands</span>
      </span>
    ),
  },
  {
    value: 'pl',
    display: (
      <span>
        <Flag src={FlagFile.Polish} />
        <span className="v-align">Polski</span>
      </span>
    ),
  },
  {
    value: 'pt',
    display: (
      <span>
        <Flag src={FlagFile.Portuguese} />
        <span className="v-align">Portuguese</span>
      </span>
    ),
  },
  {
    value: 'ru',
    display: (
      <span>
        <Flag src={FlagFile.Russia} />
        <span className="v-align">Pусский</span>
      </span>
    ),
  },
];

const mapStateToProps = state => ({
  locale: state.settings.locale,
});

const mapDispatchToProps = dispatch => ({
  updateSettings: updates => dispatch(updateSettings(updates)),
});

/**
 * Internal JSX for Language Settings
 *
 * @class LanguageSetting
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  mapDispatchToProps
)
class LanguageSetting extends Component {
  /**
   * Handle Change
   *
   * @memberof LanguageSetting
   */
  handleChange = locale => this.props.updateSettings({ locale });

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof LanguageSetting
   */
  render() {
    return (
      <SettingsField label={<Text id="Settings.Language" />}>
        <Select
          options={languages}
          value={this.props.locale}
          onChange={this.handleChange}
        />
      </SettingsField>
    );
  }
}
export default LanguageSetting;
