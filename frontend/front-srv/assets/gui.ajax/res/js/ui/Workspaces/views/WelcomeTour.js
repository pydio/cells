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

import {Component} from 'react'
import {Divider} from 'material-ui'
import Pydio from 'pydio'
import TourGuide from './TourGuide'
import {ThemeTogglerCard} from "./WelcomeMuiTour";
const {PydioContextConsumer} = Pydio.requireLib('boot')
const DOMUtils = require('pydio/util/dom')
import {muiThemeable} from "material-ui/styles";

class Scheme extends Component {

    render(){
        let style = {
            position:'relative',
            fontSize: 24,
            width: this.props.dimension || 100,
            height: this.props.dimension || 100,
            backgroundColor: '#ECEFF1',
            color: '#607d8b',
            borderRadius: '50%',
            margin: '0 auto'
        };
        return (
            <div style={{...style, ...this.props.style}}>{this.props.children}</div>
        );
    }

}

class IconScheme extends Component {

    constructor(props){
        super(props);
        this.state = {icon: props.icon || props.icons[0], index: 0};
    }

    componentDidMount(){
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(nextProps){
        const {icon, icons} = nextProps;
        if(this._interval) clearInterval(this._interval);

        let state;
        if(icon) {
            state = {icon: icon};
        } else if(icons){
            state = {icon: icons[0], index: 0};
            this._interval = setInterval(()=>{
                this.nextIcon();
            }, 1700);
        }
        this.setState(state);
    }

    nextIcon(){
        const {icons} = this.props;
        let next = this.state.index + 1 ;
        if(next > icons.length - 1 ) next = 0;
        this.setState({index: next, icon:icons[next]});
    }

    componentWillUnmount(){
        if(this._interval) clearInterval(this._interval);
    }

    render(){
        const {icon} = this.state;
        return (
            <Scheme dimension={80}>
                <span className={"mdi mdi-" + icon} style={{position: 'absolute', top: 14, left: 14, fontSize:50}}/>
            </Scheme>
        );
    }

}

class CreateMenuCard extends Component{

    componentDidMount(){
        setTimeout(() => {
            this.props.pydio.notify('tutorial-open-create-menu');
        }, 950);
    }

    render(){
        return (
            <div>
                <p>{this.props.message('create-menu')}</p>
                <IconScheme icons={['file-plus', 'folder-plus']}/>
            </div>
        );
    }

}

class InfoPanelCard extends Component{

    componentDidMount(){
        this._int = setInterval(() => {
            this.setState({closed:!(this.state && this.state.closed)});
        }, 1500)
    }
    componentWillUnmount(){
        if(this._int) clearInterval(this._int);
    }

    render(){

        let leftStyle = {width: 28, transition:DOMUtils.getBeziersTransition()/*, transform:'scaleX(1)', transformOrigin:'right'*/, position:'relative'};
        if(this.state && this.state.closed){
            leftStyle = {...leftStyle, width: 18/*, transform:'scaleX(0)'*/};
        }
        const {message, customMessage} = this.props

        return (
            <div>
                <p>{customMessage || message('infopanel.1')}</p>
                <Scheme style={{fontSize: 10, padding: 25}} dimension={140}>
                    <div style={{boxShadow:'2px 2px 0px #CFD8DC', display:'flex'}}>
                        <div style={{backgroundColor:'white', flex:3}}>
                            <div><span className="mdi mdi-folder"/> {this.props.message('infopanel.folder')} 1 </div>
                            <div style={{backgroundColor: '#757575', color: 'white'}}><span className="mdi mdi-folder"/>  {this.props.message('infopanel.folder')} 2</div>
                            <div><span className="mdi mdi-file"/> {this.props.message('infopanel.file')} 3</div>
                            <div><span className="mdi mdi-file"/> {this.props.message('infopanel.file')} 4</div>
                        </div>
                        <div style={leftStyle}>
                            <div style={{position:'absolute', left: -2, bottom: 0, top: 0, width: 3, backgroundColor:'#03a9f4'}}></div>
                            <div style={{backgroundColor: '#edf4f7', padding: 4, height: '100%', fontSize: 17}}><span className="mdi mdi-information-variant"/></div>
                        </div>
                    </div>
                </Scheme>
                <p>{this.props.message('infopanel.2')} (<span className="mdi mdi-information" style={{fontSize: 18, color: '#5c7784'}}/>).</p>
            </div>
        );

    }

}

class LeftPanelCard extends Component{

    state = {step: 0}

    next() {
        const {step} = this.state;
        let next = step+1
        if(step+1 > 3){
            next = 0
        }
        this.setState({step: next})
    }

    componentDidMount(){
        this._int = setInterval(() => {
            this.next()
        }, 1500)
    }
    componentWillUnmount(){
        if(this._int) clearInterval(this._int);
    }

    render(){

        const {step} = this.state;

        let closeStyle = {
            display:'none',
            backgroundColor: '#03a9f4',
            fontSize: 17,
            borderRadius: '50%',
            height: 20,
            width: 20,
            color: 'white',
            margin: 2,
            textAlign: 'center'
        }
        let leftStyle = {width: 28, transition:DOMUtils.getBeziersTransition(), position:'relative', backgroundColor: '#edf4f7'};
        let moveBarActive = true
        if(step === 1){
            leftStyle = {...leftStyle, width: 18};
        } else if(step === 2){
            leftStyle = {...leftStyle, width: 28};
            closeStyle.display = 'block'
            moveBarActive = false
        } else if(step === 3){
            leftStyle = {...leftStyle, width: 0};
            moveBarActive = false
        } else if(step === 0){
            leftStyle = {...leftStyle, width: 28};
        }

        return (
            <div>
                <p>{this.props.message('left-resize.legend')}</p>
                <Scheme style={{fontSize: 10, padding: 25}} dimension={140}>
                    <div style={{boxShadow:'-2px 2px 0px #CFD8DC', display:'flex'}}>
                        <div style={leftStyle}>
                            <div style={{position:'absolute', right: 0, bottom: 0, top: 0, width: 3, backgroundColor:moveBarActive?'#03a9f4':'transparent'}}></div>
                            <div style={{...closeStyle}}><span className="mdi mdi-chevron-double-left"/></div>
                        </div>
                        <div style={{backgroundColor:'white', flex:3}}>
                            <div style={{paddingLeft: 2}}><span className="mdi mdi-folder"/> {this.props.message('infopanel.folder')} 1 </div>
                            <div style={{backgroundColor: '#757575', color: 'white', paddingLeft: 2}}><span className="mdi mdi-folder"/>  {this.props.message('infopanel.folder')} 2</div>
                            <div style={{paddingLeft: 2}}><span className="mdi mdi-file"/> {this.props.message('infopanel.file')} 3</div>
                            <div style={{paddingLeft: 2}}><span className="mdi mdi-file"/> {this.props.message('infopanel.file')} 4</div>
                        </div>
                    </div>
                </Scheme>
            </div>
        );

    }

}

class UserWidgetCard extends Component{

    render(){
        const iconStyle = {
            display: 'inline-block',
            textAlign: 'center',
            fontSize: 17,
            lineHeight: '20px',
            backgroundColor: '#ECEFF1',
            color: '#607D8B',
            borderRadius: '50%',
            padding: '5px 6px',
            width: 30,
            height: 30,
            marginRight: 5
        };
        return (
            <div>
                <p>
                    <span className="mdi mdi-book-open-variant" style={iconStyle}/> {this.props.message('uwidget.addressbook')}
                </p>
                <Divider/>
                <p>
                    <span className="mdi mdi-bell-outline" style={iconStyle}/> {this.props.message('uwidget.alerts')}
                </p>
                <Divider/>
                <p>
                    <span className="mdi mdi-dots-vertical" style={iconStyle}/> {this.props.message('uwidget.menu')}
                </p>
                <Divider/>
                <p>
                    <span className="mdi mdi-home-variant" style={iconStyle}/> {this.props.message('uwidget.home')}
                </p>
            </div>
        );
    }

}

class WelcomeTour extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {started: !(props.pydio.user && !props.pydio.user.getPreference('gui_preferences', true)['UserAccount.WelcomeModal.Shown'])};
    }

    discard(finished = false){
        const {user} = this.props.pydio;
        let guiPrefs = user.getPreference('gui_preferences', true);
        guiPrefs['UserAccount.WelcomeModal.Shown'] = true;
        if(finished) {
            guiPrefs['WelcomeComponent.Pydio8.TourGuide.FSTemplate'] = true;
            guiPrefs['WelcomeComponent.MUITour'] = true;
        }
        user.setPreference('gui_preferences', guiPrefs, true);
        user.savePreference('gui_preferences');
    }

    componentDidMount(){
        const {pydio} = this.props;
        const {started} =  this.state;
        if(!started){
            setTimeout(() => {
                pydio.UI.openComponentInModal('UserAccount', 'WelcomeModal', {
                    onRequestStart:(skip) => {
                        if(skip) {
                            this.discard(true);
                        } else {
                            this.discard();
                            this.setState({started: true, skip: skip});
                        }
                    }
                });
            }, 1000)
        }
    }

    render(){

        if(!this.state.started || this.state.skip){
            return null;
        }
        const {getMessage, pydio, muiTheme} = this.props;
        const message = (id) => getMessage('ajax_gui.tour.' + id);
        const prefs = pydio.user && pydio.user.getPreference('gui_preferences', true) || {}

        let tourguideSteps = [];
        const {Controller, user} = pydio;
        const mkdir = Controller.getActionByName("mkdir") || {};
        const upload = Controller.getActionByName("upload") || {};

        if(muiTheme.userTheme === 'mui3' && !prefs['WelcomeComponent.MUITour']) {
            tourguideSteps.push({
                title       : message('theme.title'),
                text        : <ThemeTogglerCard message={message}/>,
                selector    :'.mdi.mdi-theme-light-dark',
                position    :'right-end'
            })
        }
        if(user && user.activeRepository && (!mkdir.deny || !upload.deny)){
            tourguideSteps.push({
                title:message('create-menu.title'),
                text : <CreateMenuCard message={message} pydio={this.props.pydio}/>,
                selector:'#create-button-menu',
                position:'left',
                style:{width:220}
            });
        }

        if (document.getElementById('display-toolbar')){
            tourguideSteps.push({
                title:message('display-bar.title'),
                text : <div><p>{message('display-bar')}</p><IconScheme icons={['view-list', 'view-grid', 'view-carousel', 'sort-ascending', 'sort-descending']}/></div>,
                selector:'#display-toolbar',
                position:'left'
            });
        }
        if (document.getElementById('info_panel')){
            tourguideSteps.push(            {
                title:message('infopanel.title'),
                text : <InfoPanelCard message={message}/>,
                selector:'#info_panel',
                position:'left'
            })
        }
        tourguideSteps.push({
            title:message('uwidget.title'),
            text : <UserWidgetCard message={message}/>,
            selector:'.user-widget',
            position:'right',
            style:{width: 320}
        });
        const callback = (data) => {
            if( (data.type === 'step:after' && data.index === tourguideSteps.length - 1) || data.action === 'skip' ){
                this.discard(true);
            }
        };
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
        );


    }

}

WelcomeTour = muiThemeable()(WelcomeTour)
WelcomeTour = PydioContextConsumer(WelcomeTour)
export {WelcomeTour as default}
export {Scheme, IconScheme, InfoPanelCard, LeftPanelCard}