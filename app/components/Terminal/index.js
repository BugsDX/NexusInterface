import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Route, Redirect } from "react-router";
import styles from "./style.css";

import TerminalConsole from "./TerminalConsole";
import TerminalCore from "./TerminalCore";

import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";

import explorerImg from "images/icon-explorer.png";
import homeIcon from "images/icon-home.png";

export default class Terminal extends Component {
  componentDidMount() {
    window.addEventListener("contextmenu", this.setupcontextmenu, false);
  }

  componentWillUnmount() {
    window.removeEventListener("contextmenu", this.setupcontextmenu);
  }

  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  render() {
    // Redirect to application settings if the pathname matches the url (eg: /Terminal = /Terminal)
    if (this.props.location.pathname === this.props.match.url) {
      console.log("Redirecting to Terminal Console");

      return <Redirect to={`${this.props.match.url}/Console`} />;
    }

    return (
      <div id="terminal">
        <h2>Console</h2>

        <div className="panel">
          <ul className="tabs">
            <li>
              <NavLink to={`${this.props.match.url}/Console`}>
                <img src="images/logo.svg" alt="Console" />Console
              </NavLink>
            </li>
            <li>
              <NavLink to={`${this.props.match.url}/Core`}>
                <img src="images/core.svg" alt="Core Output" />Core Output
              </NavLink>
            </li>
          </ul>

          <div id="terminal-content">
            <Route
              exact
              path={`${this.props.match.path}/`}
              component={TerminalConsole}
            />
            <Route
              path={`${this.props.match.path}/Console`}
              component={TerminalConsole}
            />
            <Route
              path={`${this.props.match.path}/Core`}
              component={TerminalCore}
            />
          </div>
        </div>
      </div>
    );
  }
}
