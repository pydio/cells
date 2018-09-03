import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import { reducer as reduxFormReducer } from 'redux-form'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
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
        return (
            <Provider store={store}>
                <MuiThemeProvider muiTheme={getMuiTheme()}>
                    <ReactForm onSubmit={this.handleSubmit} {...this.state}></ReactForm>
                </MuiThemeProvider>
            </Provider>
        )
    }
}

ReactDOM.render(<PydioInstaller />, document.getElementById('install'));
