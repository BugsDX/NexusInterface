import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import styles from "./style.css";
import * as TYPE from "../../actions/actiontypes";
import packageJson from "../../../package.json";


//dontneed
import * as actionsCreators from "../../actions/marketActionCreators";
import { bindActionCreators } from "redux";

import nexusLogo from "../../images/nexus-logo.png";
import updateicon from "../../images/unlock.png";

const mapStateToProps = state => {
  return { ...state.overview };
};

const mapDispatchToProps = dispatch =>
bindActionCreators(actionsCreators, dispatch);

class About extends Component {
    
    componentDidMount() {
     
    }
    componentWillUnmount()
    {

    }

    getCurrentYear()
    {
      let temp = new Date();
      return temp.getFullYear();
    }

    getInterfaceVersionNumber()
    {
      return packageJson.version;
    }

    getDeamonVersionNumber()
    {
      return this.props.version;
    }
    
    render() {
        return (
          <div id="About">
            <h1> ABOUT NEXUS WALLET </h1>
            <row>
              <column>
                  <img src={nexusLogo}/><br/>
                  <row>
                    <column>
                      <b>Interface Version:</b> {this.getInterfaceVersionNumber()} <br/>
                      <b>Build Date: </b> July 19th 2018 <br/> 
                    </column>
                    <column>
                      <b>Deamon Version:</b> {this.getDeamonVersionNumber()} <br/>
                      <b>Build Date: </b> July 19th 2018 <br/> 
                    </column>
                  </row>
                  <img id="update-image" src={updateicon} /> 
                  <a id="update-text" >UPDATE</a> <br/>
                  <b>Copyright {this.getCurrentYear()} </b> Peercoin,Nexus,Videlicet <br/>
                  <br/>
                  <b>THIS IS EXPERIMENTAL SOFTWARE AND THE NEXUS EMBASY HOLDS NO LIABILITY FOR THE USE OF THIS SOFTWARE</b>
              </column>
              <column>
                  <h2>License Agreament</h2>
                  <blockquote>
                          Copyright {this.getCurrentYear()} Nexus 
                          <br/>
                          Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
                          <br/>    
                          The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
                          <br/>    
                          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                  </blockquote>
                  <br/>
                  
              </column>
            </row>
            <div style={{textAlign:"center"}}>
            <h2>Open Source Credits</h2>
              <dl>
                  <dt>Electron</dt>
                  <dd>MIT</dd>
                  <dt>Victory Chart</dt>
                  <dd>MIT</dd>
                  <dt>React</dt>
                  <dd>MIT</dd>
              </dl>
              </div>
          </div>
        );
    }

}

export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(About);
  