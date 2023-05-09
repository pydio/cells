/*
 * Copyright 2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import createReactClass from "create-react-class";
import Pydio from 'pydio'
import TourGuide from './TourGuide'
import {FlatButton, CardTitle} from 'material-ui'
import {InfoPanelCard, LeftPanelCard, IconScheme} from "./WelcomeTour";
const { PydioContextConsumer } = Pydio.requireLib('boot')
const { ActionDialogMixin, CancelButtonProviderMixin} = Pydio.requireLib('boot');

let ThemeTogglerCard = (props) => {
    return (
        <div style={{height:300}}>
            <p>{props.message('theme.legend')}</p>
            <div style={{marginTop: 15, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <img src="plug/gui.ajax/res/themes/common/images/dark-light-theme.webp"/>
            </div>
        </div>
    );
};

let DirectoryCard = (props) => {
    return (
        <div>
            <p style={{marginBottom: 10}}>{props.message('directory.legend')}</p>
            <IconScheme dimension={130} icons={['mdi mdi-account-box']}/>
        </div>
    )
}


class MUITour extends React.Component{

    constructor(props) {
        super(props);
        this.state = {start: false}
        const {pydio} = props;
        pydio.UI.openComponentInModal('PydioWorkspaces', 'WelcomeMUITour', {
            onRequestStart:(skip) => {
                if(skip) {
                    this.discard(true);
                } else {
                    const myTarget = document.getElementById('left-rail-active-column');
                    if(myTarget){
                        myTarget.dispatchEvent(new MouseEvent('mouseover', {
                            'view': window,
                            'bubbles': true,
                            'cancelable': true
                        }))
                    }
                    this.setState({start: true});
                }
            }
        });
    }

    discard(finished){
        const {user} = this.props.pydio;
        let guiPrefs = user.getPreference('gui_preferences', true);
        if(finished) {
            guiPrefs['WelcomeComponent.MUITour'] = true;
        }
        user.setPreference('gui_preferences', guiPrefs, true);
        user.savePreference('gui_preferences');
    }

    
    render() {

        if(!this.state.start){
            return null;
        }
        const {pydio} = this.props;
        const message = (id) => pydio.MessageHash['ajax_gui.tour.' + id] || id;

        const tourguideSteps = [
            {
                title       : message('theme.title'),
                text        : <ThemeTogglerCard message={message}/>,
                selector    :'.mdi.mdi-theme-light-dark',
                position    :'right-end'
            },
            {
                title       : message('left-resize.title'),
                text        : <LeftPanelCard message={message}/>,
                selector    :'#left-rail-active-column',
                position    :'right'
            },
            {
                title       : message('infopanel.title'),
                text        : <InfoPanelCard message={message} customMessage={message('right-resize.legend')}/>,
                selector    :'#info_panel',
                position    :'left'
            },
            {
                title       : message('directory.title'),
                text        : <DirectoryCard message={message}/>,
                selector    :'.mdi.mdi-account-box-outline',
                position    :'right'
            },
        ]
        const callback=(data) => {
            if((data.type === 'step:after' && data.index === tourguideSteps.length - 1) || data.action === 'skip' ){
                this.discard(true);
            }
        }
        return (
            <TourGuide
                ref="joyride"
                steps={tourguideSteps}
                run={true} // or some other boolean for when you want to start it
                autoStart={true}
                debug={false}
                callback={callback}
                type='continuous'
                showSkipButton={true}
            />
        )
    }

}

MUITour = PydioContextConsumer(MUITour)


let WelcomeMUITour = createReactClass({

    mixins:[
        ActionDialogMixin,
        CancelButtonProviderMixin
    ],

    getDefaultProps: function(){
        return {
            dialogTitle: '',
            dialogIsModal: true,
            dialogSize:'sm',
            dialogPadding: 0
        };
    },

    close: function(skip){

        if(this.props.onRequestStart){
            this.props.onRequestStart(skip);
        }
        this.props.onDismiss();
    },

    getMessage: function(id){
        return this.props.pydio.MessageHash['ajax_gui.tour.welcomemodal.' + id];
    },

    getButtons: function(){
        return [
            <FlatButton label={this.getMessage('skip')} onClick={()=> {this.close(true)}}/>,
            <FlatButton label={this.getMessage('start')} primary={true} onClick={() => this.close(false)}/>,
        ];
    },

    render() {
        return (
            <div>
                <div style={{position:'relative', width:'100%', overflow: 'hidden', paddingBottom: 16, background: 'var(--md-sys-color-surface-variant)', borderRadius: '20px 20px 0 0'}}>
                    <div style={{marginTop: 15, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <img src="plug/gui.ajax/res/themes/common/images/dark-light-theme.webp"/>
                    </div>
                </div>
                <CardTitle title={"Welcome to MUI3 Theme"} subtitle={"Discover the new features that will allow you to adapt this new layout to your work."}/>
            </div>

        );
    }
})

export {MUITour, WelcomeMUITour, ThemeTogglerCard}