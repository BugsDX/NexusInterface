// External
import React, { PureComponent } from 'react';
import { ThemeProvider } from 'emotion-theming';
import { connect } from 'react-redux';

// Internal
import { getMixer } from 'utils/color';

/**
 * Controls the theme using {Emotion}
 *
 * @class ThemeController
 * @extends {PureComponent}
 */
@connect(state => ({
  theme: state.theme,
}))
class ThemeController extends PureComponent {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof ThemeController
   */
  render() {
    const { theme } = this.props;
    const themeWithMixer = {
      ...theme,
      mixer: getMixer(theme.background, theme.foreground),
    };
    return (
      <ThemeProvider theme={themeWithMixer}>
        {this.props.children}
      </ThemeProvider>
    );
  }
}
export default ThemeController;
