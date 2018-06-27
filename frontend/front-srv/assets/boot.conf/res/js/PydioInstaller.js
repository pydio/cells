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

(function(global){

    const WelcomeScreen = React.createClass({

        getDefaultProps: function(){
            return {logoSrc: 'plugins/gui.ajax/PydioLogo250.png'};
        },

        switchLanguage: function(event, key, payload){
            global.pydio.fire('language_changed');
            global.pydio.currentLanguage = payload;
            global.pydio.loadI18NMessages(payload, () => {pydio.UI.refreshTemplateParts()});
        },

        getDangerousHtmlLanguage: function(id){
            return {__html: global.pydio.MessageHash['installer.3']};
        },

        render: function(){

            let languages = [], currentLanguage;
            global.pydio.listLanguagesWithCallback(function(key, label, selected){
                if(selected) currentLanguage = key;
                languages.push(<MaterialUI.MenuItem value={key} primaryText={label}/>);
            });

            return (
                <div id="installer_form" style={{fontSize:13, paddingBottom:24}}>
                    <img className="install_pydio_logo" src={this.props.logoSrc} style={{display:'block', margin:'20px auto', maxHeight:180}}/>
                    <div className="installerWelcome" dangerouslySetInnerHTML={this.getDangerousHtmlLanguage('installer.3')}/>
                    <MaterialUI.SelectField fullWidth={true} floatingLabelText="Pick your language" value={currentLanguage} onChange={this.switchLanguage}>
                        {languages}
                    </MaterialUI.SelectField>
                </div>
            );

        }

    });

    const Configurator = React.createClass({

        componentDidMount: function() {

            PydioApi.getClient().request({
                get_action:'load_installer_form',
                lang:this.props.pydio.currentLanguage
            }, function(transp){
                let formParameters= PydioForm.Manager.parseParameters(transp.responseXML, '//global_param');
                let groups = new Map();
                let values = {};
                formParameters.map(function(param){
                    if(param.default){
                        values[param.name] = param.default;
                    }
                    if(!param.group) return;
                    let g = param.group;
                    if(!groups.has(g)) {
                        groups.set(g, {
                            title:g,
                            legend:'',
                            valid:false,
                            switches:[]
                        });
                    }
                    if(param.type === 'legend'){
                        groups.get(g).legend = param.description;
                    }else if(param.type.indexOf('group_switch:') === 0){
                        groups.get(g).switches.push(param.type.replace('group_switch:', ''));
                    }

                });

                this.setState({
                    parameters: formParameters,
                    groups: groups
                });
                this.props.setParentState({
                    values: values,
                    installationParams: this.computeInstallationParams(values)
                });

            }.bind(this));
        },


        getInitialState: function(){
            return {minorStep: 0};
        },

        onFormChange: function(values){
            if(values['ADMIN_USER_LOGIN'] !== this.props.parentState.values['ADMIN_USER_LOGIN']
                && this.props.parentState.values['ADMIN_USER_LOGIN'] === this.props.parentState.values['ADMIN_USER_NAME']){
                values['ADMIN_USER_NAME'] = values['ADMIN_USER_LOGIN'];
            }
            if(this.props.onFormChange){
                this.props.onFormChange(values);
            }
            this.props.setParentState({
                values: values,
                installationParams: this.computeInstallationParams(values)
            });
        },

        handleNext : function(){
            const {minorStep} = this.state;
            this.setState({
                minorStep: minorStep + 1
            }, () => {this.props.refreshModal()});
        },

        handlePrev: function(){
            const {minorStep} = this.state;
            if (minorStep > 0) {
                this.setState({
                    minorStep: minorStep - 1
                }, () => {this.props.refreshModal()});
            }
        },

        isValid: function(){
            if(!this.state || !this.state.groups) return false;
            let valid = true;
            this.state.groups.forEach(function(g){
                valid = valid && g.valid;
            });
            return valid;
        },

        onValidStatusChange: function(groupKey, status, missingFields){
            // IGNORE SWITCH_GROUP FIELDS UNTIL PROPERLY IMPLEMENTED IN THE FORMS
            let groupMissing = 0;
            let groups = this.state.groups;
            let groupSwitches = groups.get(groupKey).switches;
            missingFields.map(function(field){
                if(field.group && field.group === groupKey && !field.group_switch_name){
                    groupMissing ++;
                }else if(field.group_switch_name && groupSwitches.indexOf(field.group_switch_name) > -1){
                    //groupMissing ++;
                }
            });
            groups.get(groupKey).valid = groupMissing > 0 ? false: true;
            this.setState({groups: groups}, () => {this.props.refreshModal();});
        },

        computeInstallationParams(values){

            let allParams = {
                get_action:'apply_installer_form',
                installer_lang:global.pydio.currentLanguage
            };
            for(let key in this.refs){
                if (!this.refs.hasOwnProperty(key) || key.indexOf('form-') !== 0) {
                    continue;
                }
                let formPanel = this.refs[key];
                allParams = Object.assign(allParams, formPanel.getValuesForPOST(values, ''));
            }

            return allParams;
        },

        testEndpointDiscovery: function(postValues){
            postValues['get_action'] =  'boot_test_discovery';
            PydioApi.getClient().request(postValues, function(transp){
                if(transp.responseText && transp.responseText.indexOf('SUCCESS:') === 0){
                    this.setState({discoveryTestPassed:true});
                    this.handleNext();
                }else{
                    this.setState({discoveryTestFailed:true});
                }
            }.bind(this));
        },

        testAuthentication: function(postValues){
            postValues['get_action'] =  'boot_test_authenticate';
            PydioApi.getClient().request(postValues, function(transp){
                if(transp.responseText && transp.responseText.indexOf('SUCCESS:') === 0){
                    this.setState({authenticationTestPassed:true});
                    this.handleNext();
                }else{
                    this.setState({authenticationTestFailed:true});
                }
            }.bind(this));
        },

        renderStepActions(step, groupKey) {

            const {minorStep} = this.state;
            let LAST_STEP = (minorStep === this.state.groups.size - 1);
            let forwardLabel = this.props.pydio.MessageHash['installer.9'];
            let forwardPrimary = true;
            let forwardSecondary = false;
            let nextDisabled = !this.state.groups.get(groupKey).valid;
            let nextCallback = this.handleNext.bind(this);

            if(minorStep === 0){

                if(this.state.discoveryTestFailed){
                    forwardLabel = this.props.pydio.MessageHash['installer.12'];
                    forwardSecondary = true;
                    forwardPrimary = false;
                }else{
                    forwardLabel = this.props.pydio.MessageHash['installer.10'];
                }
                nextCallback = function(){
                    let testValues = this.refs['form-' + groupKey].getValuesForPOST(this.props.parentState.values);
                    this.testEndpointDiscovery(testValues);
                }.bind(this);

            } else if (minorStep === 1) {

                if(this.state.authenticationTestFailed){
                    forwardLabel = this.props.pydio.MessageHash['installer.12'];
                    forwardSecondary = true;
                    forwardPrimary = false;
                }else{
                    forwardLabel = this.props.pydio.MessageHash['installer.15'];
                }
                nextCallback = function(){
                    let testValues = this.refs['form-' + groupKey].getValuesForPOST(this.props.parentState.values);
                    this.testAuthentication(testValues);
                }.bind(this);

            }


            if(this.props.renderStepActions){
                let test = this.props.renderStepActions(step, groupKey, LAST_STEP, this.state, nextCallback);
                if(test){
                    return test;
                }
            }

            // For testing purpose, disable validations
            // nextDisabled = false;
            // nextCallback = this.handleNext.bind(this);

            return (
                <div style={{margin: '12px 0'}}>
                    {!LAST_STEP &&
                        <MaterialUI.RaisedButton
                            label={forwardLabel}
                            disableTouchRipple={true}
                            disableFocusRipple={true}
                            primary={forwardPrimary}
                            secondary={forwardSecondary}
                            onTouchTap={nextCallback}
                            style={{marginRight: 12}}
                            disabled={nextDisabled}
                        />
                    }
                    {step > 0 && !LAST_STEP && (
                        <MaterialUI.FlatButton
                            label={this.props.pydio.MessageHash['installer.11']}
                            disabled={minorStep === 0}
                            disableTouchRipple={true}
                            disableFocusRipple={true}
                            onTouchTap={this.handlePrev}
                        />
                    )}
                </div>
            );
        },

        render: function(){

            if(!this.state.parameters){

                return <PydioReactUI.Loader style={{minHeight: 400}}/>;

            }

            const {minorStep} = this.state;

            let forms = [], index = 0;
            const green = '#1B5E20';
            const italStyle = {color: 'rgba(0,0,0,0.24)', fontWeight: 500};
            this.state.groups.forEach(function(gData, groupKey){
                let customIcon = null;
                let stepTitle = gData.title;
                if (index === 0 && minorStep > 0) {
                    stepTitle = <span>{stepTitle} <i style={italStyle}>{this.props.parentState.values["ENDPOINT_REST_API"]}</i></span>;
                    customIcon = "server-network";
                } else if(index === 1 && minorStep > 1) {
                    stepTitle = <span>{stepTitle} <i style={italStyle}>{this.props.pydio.MessageHash['installer.16'].replace('%s', this.props.parentState.values["ADMIN_USER_LOGIN"])}</i></span>;
                    customIcon = "verified";
                }
                forms.push(
                    <MaterialUI.Step>
                        {customIcon ?
                            <MaterialUI.StepLabel icon={<MaterialUI.FontIcon color={green} className={"mdi mdi-" + customIcon}/>} style={{color:green}}>{stepTitle}</MaterialUI.StepLabel> :
                            <MaterialUI.StepLabel>{stepTitle}</MaterialUI.StepLabel>
                        }
                        <MaterialUI.StepContent style={{maxWidth:420}}>
                            <PydioForm.FormPanel
                                key={groupKey}
                                ref={"form-" + groupKey}
                                className="stepper-form-panel"
                                parameters={this.state.parameters}
                                values={this.props.parentState.values}
                                onChange={this.onFormChange}
                                disabled={false}
                                limitToGroups={[groupKey]}
                                skipFieldsTypes={['legend', 'GroupHeader']}
                                depth={-1}
                                onValidStatusChange={this.onValidStatusChange.bind(this, groupKey)}
                                forceValidStatusCheck={true}
                            />
                            {this.renderStepActions(index, groupKey)}
                        </MaterialUI.StepContent>
                    </MaterialUI.Step>
                );
                index ++;
            }.bind(this));

            return (
                <div style={{paddingBottom: 24}}>
                    <MaterialUI.Stepper activeStep={minorStep} orientation="vertical">
                        {forms}
                    </MaterialUI.Stepper>
                </div>
            );
        }

    });

    const Installer = React.createClass({

        getInitialState: function(){
            return {INSTALLED: false, clock: 4};
        },

        componentDidMount: function(){
            this.installPydio();
        },

        clock: function(){
            this.setState({clock: this.state.clock - 1}, () => {
                if(this.state.clock === 0){
                    global.document.location.reload(true);
                }else{
                    setTimeout(() => {this.clock()}, 1000);
                }
            });
        },

        installPydio: function(){

            const allParams = this.props.parentState.installationParams;
            PydioApi.getClient().request(allParams, function(transp){
                if(transp.responseText && transp.responseText === 'OK'){
                    this.setState({INSTALLED: true});
                    this.clock();
                }else if(transp.responseJSON){
                    this.setState({
                        INSTALLED: true,
                        HTACCESS_NOTIF: transp.responseJSON
                    });
                }
            }.bind(this));

        },


        render: function(){

            if(!this.state.INSTALLED){

                return <PydioReactUI.Loader style={{minHeight: 400}}/>;

            }else  if(this.state.HTACCESS_NOTIF){

                return (
                    <div style={{margin:'24px 0', fontSize:13}}>
                        <div>{this.props.pydio.MessageHash['installer.14'].replace('%2', this.props.parentState.values['ADMIN_USER_LOGIN']).replace('%1', this.state.HTACCESS_NOTIF.file)}</div>
                        <div><MaterialUI.TextField value={this.state.HTACCESS_NOTIF.content} multiLine={true} fullWidth={true}/></div>
                    </div>
                );

            }else{

                return (
                    <div style={{margin:'24px 0', fontSize:13}}>
                        {this.props.pydio.MessageHash['installer.13'].replace('%1', this.props.parentState.values['ADMIN_USER_LOGIN']).replace('%2', this.state.clock)}
                    </div>
                );

            }

        }
    });

    const InstallerDialog = React.createClass({

        mixins:[
            PydioReactUI.ActionDialogMixin
        ],

        getDefaultProps: function(){
            return {
                dialogTitle: pydio.MessageHash['installer.1'],
                dialogIsModal: true,
                dialogSize:'md',
                dialogScrollBody:true,
                majorSteps: [
                    {componentClass: WelcomeScreen, button: pydio.MessageHash['installer.4']},
                    {componentClass: Configurator, button: pydio.MessageHash['installer.6']},
                    {componentClass: Installer}
                ]
            };
        },

        getInitialState: function(){
            return {
                majorStep: 0,
                values: []
            }
        },

        refreshModal: function(){
            if(this.props.modalData && this.props.modalData.modal){
                this.props.modalData.modal.initModalFromComponent(this);
            }
            if(this._buttonsUpdater){
                this._buttonsUpdater(this.getButtons());
            }
        },

        updateMajorStep: function(){
            const {majorStep} = this.state;
            this.setState({majorStep: majorStep + 1}, () => {this.refreshModal()});
        },

        getButtons: function(buttonsUpdater = null){

            if(buttonsUpdater){
                this._buttonsUpdater = buttonsUpdater;
            }
            const {button} = this.props.majorSteps[this.state.majorStep];
            if(!button){
                return [];
            }
            let disabled = false;
            if(this.refs.currentPanel && this.refs.currentPanel.isValid){
                disabled = !this.refs.currentPanel.isValid();
            }
            return ([<MaterialUI.FlatButton
                    label={button}
                    primary={true}
                    disabled={disabled}
                    onTouchTap={()=>{this.updateMajorStep();}}/>
            ]);

        },

        updateMainState: function(partialState){
            this.setState(partialState, () => {this.refreshModal});
        },


        render: function(){

            const {componentClass} = this.props.majorSteps[this.state.majorStep];

            const props = Object.assign({
                ref               :'currentPanel',
                refreshModal      : this.refreshModal,
                parentState       : this.state,
                setParentState    : this.updateMainState
            }, this.props);

            return React.createElement(componentClass, props);

        }

    });



    global.PydioInstaller = {
        Dialog: InstallerDialog,
        Configurator: Configurator,
        Installer: Installer,
        WelcomeScreen: WelcomeScreen,
        openDialog: function(){
            global.pydio.UI.openComponentInModal('PydioInstaller', 'Dialog');
        }
    };


})(window);