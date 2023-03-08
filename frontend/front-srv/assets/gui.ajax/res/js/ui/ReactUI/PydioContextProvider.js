import { Component } from 'react';

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

import React from 'react'
import PropTypes from 'prop-types'
import Pydio from 'pydio'
import { getMuiTheme } from 'material-ui/styles';
import { MuiThemeProvider } from 'material-ui';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import {saveState, loadState} from './localStorage';

const { EditorReducers } = Pydio.requireLib('hoc');

const store = createStore(
    EditorReducers,
    loadState(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

store.subscribe(() => {
    saveState({
        editor: store.getState().editor
    });
});

let MainProvider = MuiThemeProvider
let DND;
try{
    DND = require('react-dnd');
    const Backend = require('react-dnd-html5-backend');
    MainProvider = DND.DragDropContext(Backend)(MainProvider);
}catch(e){}

export default function(PydioComponent, pydio){

    class Wrapped extends Component{

        getChildContext() {
            const messages = pydio.MessageHash;
            return {
                pydio       : pydio,
                messages    : messages,
                getMessage  : function(messageId, namespace = ''){
                    if(namespace){
                        messageId = namespace + '.' + messageId ;
                    }
                    try{
                        return messages[messageId] || messageId;
                    }catch(e){
                        return messageId;
                    }
                },
                getPydio    : function(){
                    return pydio;
                }
            };

        }

        render(){

            let customPalette = {};
            if (pydio.Parameters.has('other') && pydio.Parameters.get('other')['vanity']) {
                customPalette = pydio.Parameters.get('other')['vanity']['palette'] || {};
            }
            let themeCusto = {
                palette: {
                    primary1Color       : '#134e6c',
                    primary2Color       : '#f44336',
                    accent1Color        : '#f44336',
                    accent2Color        : '#018dcc',
                    avatarsColor        : '#438db3',
                    sharingColor        : '#4aceb0',
                    ...customPalette
                }
            };

            themeCusto.toggle = {
                thumbOffColor           : themeCusto.palette.primary1Color,
                thumbOnColor            : themeCusto.palette.accent2Color
            };
            themeCusto.menuItem = {
                selectedTextColor       : themeCusto.palette.accent2Color
            };

            const theme = getMuiTheme(themeCusto);

            return (
                <MainProvider muiTheme={theme}>
                    <Provider store={store}>
                        <PydioComponent {...this.props}/>
                    </Provider>
                </MainProvider>
            );
        }

    }

    Wrapped.displayName = 'PydioContextProvider';
    Wrapped.propTypes={
        pydio       : PropTypes.instanceOf(Pydio).isRequired
    };
    Wrapped.childContextTypes={
        /* Current Instance of Pydio */
        pydio       :PropTypes.instanceOf(Pydio),
        /* Accessor for pydio */
        getPydio    :PropTypes.func,

        /* Associative array of i18n messages */
        messages    :PropTypes.object,
        /* Accessor for messages */
        getMessage  :PropTypes.func
    };

    return Wrapped;
}
