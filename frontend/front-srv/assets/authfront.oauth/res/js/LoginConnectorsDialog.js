/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

import PydioApi from 'pydio/http/api'
import {List, ListItem, MuiThemeProvider, FontIcon} from 'material-ui'
import {muiThemeable, getMuiTheme, darkBaseTheme} from 'material-ui/styles';
import qs from 'query-string';

const LanguagePicker = ({parent}) => {
    if (parent) {
        return <parent.LanguagePicker />
    }

    return <div></div>
}

export default React.createClass({

    mixins:[
        PydioReactUI.ActionDialogMixin,
    ],

    getDefaultProps(){
        return {
            dialogIsModal: true,
            dialogSize:'sm'
        };
    },

    getInitialState(){
        return {
            connectors: [{
                "Id": "pydio",
                "Name": "Pydio Aggregation Connector",
                "Type": "pydio"
              },
              {
                "Id": "okta",
                "Name": "okta",
                "Type": "oidc"
              }]
        }
        // return {
        //     connectors: [],
        // }
    },

    useBlur(){
        return true;
    },

    componentDidMount(props) {
        pydio.observeOnce('user_logged', () => this.dismiss())

        ResourcesManager.loadClass('AuthfrontCoreActions').then(authfrontCoreActions => this.setState({
            authfrontCoreActions  
        }))
    },

    handleClick(connectorID) {
        if (connectorID == "pydio") {
            pydio.getController().fireAction('loginprev', {"createAuthRequest": false});
            return
        }

        PydioApi.getRestClient().sessionLogin().then(() => {
            window.location.href = "/auth/dex/login/" + connectorID + "?challenge=" + window.sessionStorage.challenge
        })

        // PydioApi.getRestClient().jwtWithAuthInfo({type: "create_auth_request", connectorID: connectorID, ...parsed}).then(() => {
        //     api.frontAuthState().then(({RequestID}) => {
        //         window.location.href = "/auth/dex/auth/" + connectorID + "?req=" + RequestID
        //     })
        // })
    },

    render() {
        const {connectors, authfrontCoreActions} = this.state;

        if (connectors.length <= 1) {
            return null
        }

        const custom = this.props.pydio.Parameters.get('customWording');
        let logoUrl = custom.icon;
        if(custom.iconBinary){
            logoUrl = pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + custom.iconBinary;
        }

        const logoStyle = {
            backgroundSize: 'contain',
            backgroundImage: 'url('+logoUrl+')',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position:'absolute',
            top: -130,
            left: 0,
            width: 320,
            height: 120
        };

        return (
            <DarkThemeContainer style={{width:270}}>
                {logoUrl && <div style={logoStyle}></div>}
                <div className="dialogLegend" style={{fontSize: 22, paddingBottom: 12, lineHeight: '28px'}}>
                    {pydio.MessageHash["oauth.login"]}
                    <LanguagePicker parent={authfrontCoreActions} />
                </div>

                <List>
                {connectors.map((connector) => <ListItem
                    primaryText={connector.Id !== "pydio" && connector.Name || pydio.getPluginConfigs("core.pydio").get("APPLICATION_TITLE")}
                    onClick={() => this.handleClick(connector.Id)}
                    rightIcon={<FontIcon color={'white'} className={"mdi mdi-chevron-right"}/>}
                />)}
                </List>
            </DarkThemeContainer>
        );
    }
});

class DarkThemeContainer extends React.Component{

    render() {

        const {muiTheme, ...props} = this.props;
        let baseTheme = {...darkBaseTheme};
        baseTheme.palette.primary1Color = muiTheme.palette.accent1Color;
        const darkTheme = getMuiTheme(baseTheme);

        return (
            <MuiThemeProvider muiTheme={darkTheme}>
                <div {...props}/>
            </MuiThemeProvider>
        );

    }

}

DarkThemeContainer = muiThemeable()(DarkThemeContainer)