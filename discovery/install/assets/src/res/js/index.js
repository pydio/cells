import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import { reducer as reduxFormReducer } from 'redux-form'
import {getMuiTheme, muiThemeable} from 'material-ui/styles'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import ReactForm from './install'
import Client from './client';
import InstallServiceApi from './gen/api/InstallServiceApi';

import config from './config';

const api = new InstallServiceApi(new Client());

const reducer = combineReducers({
  config,
  form: reduxFormReducer // mounted under "form"
});

const store = (window.devToolsExtension
  ? window.devToolsExtension()(createStore)
  : createStore)(reducer);

class PydioInstaller extends React.Component {

    state = {
        installPerformed : false,
        installError: null,
    };

    handleSubmit = (values) => {
        return api.postInstall({
            config: values
        }).then((res) => {
            this.setState({installPerformed: true});
        }).catch((reason) => {
            this.setState({installError: reason.message});
        });
    };

    render() {

        const bgBlue = 'rgb(38, 64, 95)'
        const bgRed = 'rgb(219, 25, 24)'

        const originalTheme = getMuiTheme();
        const newPalette = {...originalTheme.palette, primary1Color:bgBlue, accent1Color:bgRed};
        const muiTheme = getMuiTheme({palette:newPalette});
        console.log(originalTheme, muiTheme);

        return (
            <Provider store={store}>
                <MuiThemeProvider muiTheme={muiTheme}>
                    <ReactForm onSubmit={this.handleSubmit} {...this.state}></ReactForm>
                </MuiThemeProvider>
            </Provider>
        )
    }
}

ReactDOM.render(<PydioInstaller />, document.getElementById('install'));
