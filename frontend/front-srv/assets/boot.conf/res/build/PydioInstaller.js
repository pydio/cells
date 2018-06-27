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

'use strict';

(function (global) {

    var WelcomeScreen = React.createClass({
        displayName: 'WelcomeScreen',

        getDefaultProps: function getDefaultProps() {
            return { logoSrc: 'plugins/gui.ajax/PydioLogo250.png' };
        },

        switchLanguage: function switchLanguage(event, key, payload) {
            global.pydio.fire('language_changed');
            global.pydio.currentLanguage = payload;
            global.pydio.loadI18NMessages(payload, function () {
                pydio.UI.refreshTemplateParts();
            });
        },

        getDangerousHtmlLanguage: function getDangerousHtmlLanguage(id) {
            return { __html: global.pydio.MessageHash['installer.3'] };
        },

        render: function render() {

            var languages = [],
                currentLanguage = undefined;
            global.pydio.listLanguagesWithCallback(function (key, label, selected) {
                if (selected) currentLanguage = key;
                languages.push(React.createElement(MaterialUI.MenuItem, { value: key, primaryText: label }));
            });

            return React.createElement(
                'div',
                { id: 'installer_form', style: { fontSize: 13, paddingBottom: 24 } },
                React.createElement('img', { className: 'install_pydio_logo', src: this.props.logoSrc, style: { display: 'block', margin: '20px auto', maxHeight: 180 } }),
                React.createElement('div', { className: 'installerWelcome', dangerouslySetInnerHTML: this.getDangerousHtmlLanguage('installer.3') }),
                React.createElement(
                    MaterialUI.SelectField,
                    { fullWidth: true, floatingLabelText: 'Pick your language', value: currentLanguage, onChange: this.switchLanguage },
                    languages
                )
            );
        }

    });

    var Configurator = React.createClass({
        displayName: 'Configurator',

        componentDidMount: function componentDidMount() {

            PydioApi.getClient().request({
                get_action: 'load_installer_form',
                lang: this.props.pydio.currentLanguage
            }, (function (transp) {
                var formParameters = PydioForm.Manager.parseParameters(transp.responseXML, '//global_param');
                var groups = new Map();
                var values = {};
                formParameters.map(function (param) {
                    if (param['default']) {
                        values[param.name] = param['default'];
                    }
                    if (!param.group) return;
                    var g = param.group;
                    if (!groups.has(g)) {
                        groups.set(g, {
                            title: g,
                            legend: '',
                            valid: false,
                            switches: []
                        });
                    }
                    if (param.type === 'legend') {
                        groups.get(g).legend = param.description;
                    } else if (param.type.indexOf('group_switch:') === 0) {
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
            }).bind(this));
        },

        getInitialState: function getInitialState() {
            return { minorStep: 0 };
        },

        onFormChange: function onFormChange(values) {
            if (values['ADMIN_USER_LOGIN'] !== this.props.parentState.values['ADMIN_USER_LOGIN'] && this.props.parentState.values['ADMIN_USER_LOGIN'] === this.props.parentState.values['ADMIN_USER_NAME']) {
                values['ADMIN_USER_NAME'] = values['ADMIN_USER_LOGIN'];
            }
            if (this.props.onFormChange) {
                this.props.onFormChange(values);
            }
            this.props.setParentState({
                values: values,
                installationParams: this.computeInstallationParams(values)
            });
        },

        handleNext: function handleNext() {
            var _this = this;

            var minorStep = this.state.minorStep;

            this.setState({
                minorStep: minorStep + 1
            }, function () {
                _this.props.refreshModal();
            });
        },

        handlePrev: function handlePrev() {
            var _this2 = this;

            var minorStep = this.state.minorStep;

            if (minorStep > 0) {
                this.setState({
                    minorStep: minorStep - 1
                }, function () {
                    _this2.props.refreshModal();
                });
            }
        },

        isValid: function isValid() {
            if (!this.state || !this.state.groups) return false;
            var valid = true;
            this.state.groups.forEach(function (g) {
                valid = valid && g.valid;
            });
            return valid;
        },

        onValidStatusChange: function onValidStatusChange(groupKey, status, missingFields) {
            var _this3 = this;

            // IGNORE SWITCH_GROUP FIELDS UNTIL PROPERLY IMPLEMENTED IN THE FORMS
            var groupMissing = 0;
            var groups = this.state.groups;
            var groupSwitches = groups.get(groupKey).switches;
            missingFields.map(function (field) {
                if (field.group && field.group === groupKey && !field.group_switch_name) {
                    groupMissing++;
                } else if (field.group_switch_name && groupSwitches.indexOf(field.group_switch_name) > -1) {
                    //groupMissing ++;
                }
            });
            groups.get(groupKey).valid = groupMissing > 0 ? false : true;
            this.setState({ groups: groups }, function () {
                _this3.props.refreshModal();
            });
        },

        computeInstallationParams: function computeInstallationParams(values) {

            var allParams = {
                get_action: 'apply_installer_form',
                installer_lang: global.pydio.currentLanguage
            };
            for (var key in this.refs) {
                if (!this.refs.hasOwnProperty(key) || key.indexOf('form-') !== 0) {
                    continue;
                }
                var formPanel = this.refs[key];
                allParams = Object.assign(allParams, formPanel.getValuesForPOST(values, ''));
            }

            return allParams;
        },

        testEndpointDiscovery: function testEndpointDiscovery(postValues) {
            postValues['get_action'] = 'boot_test_discovery';
            PydioApi.getClient().request(postValues, (function (transp) {
                if (transp.responseText && transp.responseText.indexOf('SUCCESS:') === 0) {
                    this.setState({ discoveryTestPassed: true });
                    this.handleNext();
                } else {
                    this.setState({ discoveryTestFailed: true });
                }
            }).bind(this));
        },

        testAuthentication: function testAuthentication(postValues) {
            postValues['get_action'] = 'boot_test_authenticate';
            PydioApi.getClient().request(postValues, (function (transp) {
                if (transp.responseText && transp.responseText.indexOf('SUCCESS:') === 0) {
                    this.setState({ authenticationTestPassed: true });
                    this.handleNext();
                } else {
                    this.setState({ authenticationTestFailed: true });
                }
            }).bind(this));
        },

        renderStepActions: function renderStepActions(step, groupKey) {
            var minorStep = this.state.minorStep;

            var LAST_STEP = minorStep === this.state.groups.size - 1;
            var forwardLabel = this.props.pydio.MessageHash['installer.9'];
            var forwardPrimary = true;
            var forwardSecondary = false;
            var nextDisabled = !this.state.groups.get(groupKey).valid;
            var nextCallback = this.handleNext.bind(this);

            if (minorStep === 0) {

                if (this.state.discoveryTestFailed) {
                    forwardLabel = this.props.pydio.MessageHash['installer.12'];
                    forwardSecondary = true;
                    forwardPrimary = false;
                } else {
                    forwardLabel = this.props.pydio.MessageHash['installer.10'];
                }
                nextCallback = (function () {
                    var testValues = this.refs['form-' + groupKey].getValuesForPOST(this.props.parentState.values);
                    this.testEndpointDiscovery(testValues);
                }).bind(this);
            } else if (minorStep === 1) {

                if (this.state.authenticationTestFailed) {
                    forwardLabel = this.props.pydio.MessageHash['installer.12'];
                    forwardSecondary = true;
                    forwardPrimary = false;
                } else {
                    forwardLabel = this.props.pydio.MessageHash['installer.15'];
                }
                nextCallback = (function () {
                    var testValues = this.refs['form-' + groupKey].getValuesForPOST(this.props.parentState.values);
                    this.testAuthentication(testValues);
                }).bind(this);
            }

            if (this.props.renderStepActions) {
                var test = this.props.renderStepActions(step, groupKey, LAST_STEP, this.state, nextCallback);
                if (test) {
                    return test;
                }
            }

            // For testing purpose, disable validations
            // nextDisabled = false;
            // nextCallback = this.handleNext.bind(this);

            return React.createElement(
                'div',
                { style: { margin: '12px 0' } },
                !LAST_STEP && React.createElement(MaterialUI.RaisedButton, {
                    label: forwardLabel,
                    disableTouchRipple: true,
                    disableFocusRipple: true,
                    primary: forwardPrimary,
                    secondary: forwardSecondary,
                    onTouchTap: nextCallback,
                    style: { marginRight: 12 },
                    disabled: nextDisabled
                }),
                step > 0 && !LAST_STEP && React.createElement(MaterialUI.FlatButton, {
                    label: this.props.pydio.MessageHash['installer.11'],
                    disabled: minorStep === 0,
                    disableTouchRipple: true,
                    disableFocusRipple: true,
                    onTouchTap: this.handlePrev
                })
            );
        },

        render: function render() {

            if (!this.state.parameters) {

                return React.createElement(PydioReactUI.Loader, { style: { minHeight: 400 } });
            }

            var minorStep = this.state.minorStep;

            var forms = [],
                index = 0;
            var green = '#1B5E20';
            var italStyle = { color: 'rgba(0,0,0,0.24)', fontWeight: 500 };
            this.state.groups.forEach((function (gData, groupKey) {
                var customIcon = null;
                var stepTitle = gData.title;
                if (index === 0 && minorStep > 0) {
                    stepTitle = React.createElement(
                        'span',
                        null,
                        stepTitle,
                        ' ',
                        React.createElement(
                            'i',
                            { style: italStyle },
                            this.props.parentState.values["ENDPOINT_REST_API"]
                        )
                    );
                    customIcon = "server-network";
                } else if (index === 1 && minorStep > 1) {
                    stepTitle = React.createElement(
                        'span',
                        null,
                        stepTitle,
                        ' ',
                        React.createElement(
                            'i',
                            { style: italStyle },
                            this.props.pydio.MessageHash['installer.16'].replace('%s', this.props.parentState.values["ADMIN_USER_LOGIN"])
                        )
                    );
                    customIcon = "verified";
                }
                forms.push(React.createElement(
                    MaterialUI.Step,
                    null,
                    customIcon ? React.createElement(
                        MaterialUI.StepLabel,
                        { icon: React.createElement(MaterialUI.FontIcon, { color: green, className: "mdi mdi-" + customIcon }), style: { color: green } },
                        stepTitle
                    ) : React.createElement(
                        MaterialUI.StepLabel,
                        null,
                        stepTitle
                    ),
                    React.createElement(
                        MaterialUI.StepContent,
                        { style: { maxWidth: 420 } },
                        React.createElement(PydioForm.FormPanel, {
                            key: groupKey,
                            ref: "form-" + groupKey,
                            className: 'stepper-form-panel',
                            parameters: this.state.parameters,
                            values: this.props.parentState.values,
                            onChange: this.onFormChange,
                            disabled: false,
                            limitToGroups: [groupKey],
                            skipFieldsTypes: ['legend', 'GroupHeader'],
                            depth: -1,
                            onValidStatusChange: this.onValidStatusChange.bind(this, groupKey),
                            forceValidStatusCheck: true
                        }),
                        this.renderStepActions(index, groupKey)
                    )
                ));
                index++;
            }).bind(this));

            return React.createElement(
                'div',
                { style: { paddingBottom: 24 } },
                React.createElement(
                    MaterialUI.Stepper,
                    { activeStep: minorStep, orientation: 'vertical' },
                    forms
                )
            );
        }

    });

    var Installer = React.createClass({
        displayName: 'Installer',

        getInitialState: function getInitialState() {
            return { INSTALLED: false, clock: 4 };
        },

        componentDidMount: function componentDidMount() {
            this.installPydio();
        },

        clock: function clock() {
            var _this4 = this;

            this.setState({ clock: this.state.clock - 1 }, function () {
                if (_this4.state.clock === 0) {
                    global.document.location.reload(true);
                } else {
                    setTimeout(function () {
                        _this4.clock();
                    }, 1000);
                }
            });
        },

        installPydio: function installPydio() {

            var allParams = this.props.parentState.installationParams;
            PydioApi.getClient().request(allParams, (function (transp) {
                if (transp.responseText && transp.responseText === 'OK') {
                    this.setState({ INSTALLED: true });
                    this.clock();
                } else if (transp.responseJSON) {
                    this.setState({
                        INSTALLED: true,
                        HTACCESS_NOTIF: transp.responseJSON
                    });
                }
            }).bind(this));
        },

        render: function render() {

            if (!this.state.INSTALLED) {

                return React.createElement(PydioReactUI.Loader, { style: { minHeight: 400 } });
            } else if (this.state.HTACCESS_NOTIF) {

                return React.createElement(
                    'div',
                    { style: { margin: '24px 0', fontSize: 13 } },
                    React.createElement(
                        'div',
                        null,
                        this.props.pydio.MessageHash['installer.14'].replace('%2', this.props.parentState.values['ADMIN_USER_LOGIN']).replace('%1', this.state.HTACCESS_NOTIF.file)
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(MaterialUI.TextField, { value: this.state.HTACCESS_NOTIF.content, multiLine: true, fullWidth: true })
                    )
                );
            } else {

                return React.createElement(
                    'div',
                    { style: { margin: '24px 0', fontSize: 13 } },
                    this.props.pydio.MessageHash['installer.13'].replace('%1', this.props.parentState.values['ADMIN_USER_LOGIN']).replace('%2', this.state.clock)
                );
            }
        }
    });

    var InstallerDialog = React.createClass({
        displayName: 'InstallerDialog',

        mixins: [PydioReactUI.ActionDialogMixin],

        getDefaultProps: function getDefaultProps() {
            return {
                dialogTitle: pydio.MessageHash['installer.1'],
                dialogIsModal: true,
                dialogSize: 'md',
                dialogScrollBody: true,
                majorSteps: [{ componentClass: WelcomeScreen, button: pydio.MessageHash['installer.4'] }, { componentClass: Configurator, button: pydio.MessageHash['installer.6'] }, { componentClass: Installer }]
            };
        },

        getInitialState: function getInitialState() {
            return {
                majorStep: 0,
                values: []
            };
        },

        refreshModal: function refreshModal() {
            if (this.props.modalData && this.props.modalData.modal) {
                this.props.modalData.modal.initModalFromComponent(this);
            }
            if (this._buttonsUpdater) {
                this._buttonsUpdater(this.getButtons());
            }
        },

        updateMajorStep: function updateMajorStep() {
            var _this5 = this;

            var majorStep = this.state.majorStep;

            this.setState({ majorStep: majorStep + 1 }, function () {
                _this5.refreshModal();
            });
        },

        getButtons: function getButtons() {
            var _this6 = this;

            var buttonsUpdater = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            if (buttonsUpdater) {
                this._buttonsUpdater = buttonsUpdater;
            }
            var button = this.props.majorSteps[this.state.majorStep].button;

            if (!button) {
                return [];
            }
            var disabled = false;
            if (this.refs.currentPanel && this.refs.currentPanel.isValid) {
                disabled = !this.refs.currentPanel.isValid();
            }
            return [React.createElement(MaterialUI.FlatButton, {
                label: button,
                primary: true,
                disabled: disabled,
                onTouchTap: function () {
                    _this6.updateMajorStep();
                } })];
        },

        updateMainState: function updateMainState(partialState) {
            var _this7 = this;

            this.setState(partialState, function () {
                _this7.refreshModal;
            });
        },

        render: function render() {
            var componentClass = this.props.majorSteps[this.state.majorStep].componentClass;

            var props = Object.assign({
                ref: 'currentPanel',
                refreshModal: this.refreshModal,
                parentState: this.state,
                setParentState: this.updateMainState
            }, this.props);

            return React.createElement(componentClass, props);
        }

    });

    global.PydioInstaller = {
        Dialog: InstallerDialog,
        Configurator: Configurator,
        Installer: Installer,
        WelcomeScreen: WelcomeScreen,
        openDialog: function openDialog() {
            global.pydio.UI.openComponentInModal('PydioInstaller', 'Dialog');
        }
    };
})(window);
