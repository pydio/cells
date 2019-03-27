'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _reactRedux = require('react-redux');

var _reduxForm = require('redux-form');

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

var _InstallInstallConfig = require('./gen/model/InstallInstallConfig');

var _InstallInstallConfig2 = _interopRequireDefault(_InstallInstallConfig);

var _InstallServiceApi = require('./gen/api/InstallServiceApi');

var _InstallServiceApi2 = _interopRequireDefault(_InstallServiceApi);

var _InstallCheckResult = require('./gen/model/InstallCheckResult');

var _InstallCheckResult2 = _interopRequireDefault(_InstallCheckResult);

var _InstallPerformCheckRequest = require('./gen/model/InstallPerformCheckRequest');

var _InstallPerformCheckRequest2 = _interopRequireDefault(_InstallPerformCheckRequest);

var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var client = new _client2.default();
var api = new _InstallServiceApi2.default(client);

var renderTextField = function renderTextField(_ref) {
    var input = _ref.input,
        label = _ref.label,
        floatingLabel = _ref.floatingLabel,
        _ref$meta = _ref.meta,
        touched = _ref$meta.touched,
        error = _ref$meta.error,
        custom = _objectWithoutProperties(_ref, ['input', 'label', 'floatingLabel', 'meta']);

    return _react2.default.createElement(_materialUi.TextField, _extends({
        hintText: label,
        floatingLabelText: floatingLabel,
        floatingLabelFixed: true,
        errorText: touched && error,
        fullWidth: true
    }, input, custom));
};

var renderPassField = function renderPassField(_ref2) {
    var input = _ref2.input,
        label = _ref2.label,
        floatingLabel = _ref2.floatingLabel,
        _ref2$meta = _ref2.meta,
        touched = _ref2$meta.touched,
        error = _ref2$meta.error,
        custom = _objectWithoutProperties(_ref2, ['input', 'label', 'floatingLabel', 'meta']);

    return _react2.default.createElement(_materialUi.TextField, _extends({
        hintText: label,
        floatingLabelText: floatingLabel,
        floatingLabelFixed: true,
        errorText: error,
        fullWidth: true,
        type: "password",
        autoComplete: "new-password"
    }, input, custom));
};

var renderCheckbox = function renderCheckbox(_ref3) {
    var input = _ref3.input,
        label = _ref3.label;
    return _react2.default.createElement(_materialUi.Checkbox, {
        label: label,

        checked: input.value ? true : false,
        onCheck: input.onChange
    });
};

var renderRadioGroup = function renderRadioGroup(_ref4) {
    var input = _ref4.input,
        rest = _objectWithoutProperties(_ref4, ['input']);

    return _react2.default.createElement(_materialUi.RadioButtonGroup, _extends({}, input, rest, {
        valueSelected: input.value,
        onChange: function onChange(event, value) {
            return input.onChange(value);
        }
    }));
};

var renderSelectField = function renderSelectField(_ref5) {
    var input = _ref5.input,
        label = _ref5.label,
        floatingLabel = _ref5.floatingLabel,
        _ref5$meta = _ref5.meta,
        touched = _ref5$meta.touched,
        error = _ref5$meta.error,
        children = _ref5.children,
        custom = _objectWithoutProperties(_ref5, ['input', 'label', 'floatingLabel', 'meta', 'children']);

    return _react2.default.createElement(_materialUi.SelectField, _extends({
        fullWidth: true,
        floatingLabelText: label,
        floatingLabelFixed: true,
        errorText: touched && error
    }, input, {
        onChange: function onChange(event, index, value) {
            return input.onChange(value);
        },
        children: children
    }, custom));
};

/**
 * Vertical steppers are designed for narrow screen sizes. They are ideal for mobile.
 *
 * To use the vertical stepper with the contained content as seen in spec examples,
 * you must use the `<StepContent>` component inside the `<Step>`.
 *
 * <small>(The vertical stepper can also be used without `<StepContent>` to display a basic stepper.)</small>
 */

var InstallForm = function (_React$Component) {
    _inherits(InstallForm, _React$Component);

    function InstallForm(props) {
        _classCallCheck(this, InstallForm);

        // Initial load
        var _this = _possibleConstructorReturn(this, (InstallForm.__proto__ || Object.getPrototypeOf(InstallForm)).call(this, props));

        _this.state = {
            finished: false,
            stepIndex: 0,
            dbConnectionType: "tcp",
            licenseAgreed: false,
            showAdvanced: false,
            installEvents: [],
            installProgress: 0,
            serverRestarted: false
        };

        _this.reset = function () {
            _this.setState({
                stepIndex: 0,
                finished: false
            });
        };

        _this.handleNext = function () {
            var stepIndex = _this.state.stepIndex;

            _this.setState({
                stepIndex: stepIndex + 1,
                finished: stepIndex >= 4
            });
        };

        _this.handlePrev = function () {
            var stepIndex = _this.state.stepIndex;

            if (stepIndex > 0) {
                _this.setState({ stepIndex: stepIndex - 1 });
            }
        };

        api.getInstall().then(function (values) {
            props.load(values.config);
        });
        api.getAgreement().then(function (resp) {
            _this.setState({ agreementText: resp.Text });
        });
        return _this;
    }

    _createClass(InstallForm, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            client.pollEvents(function (events) {
                var newEvents = [].concat(_toConsumableArray(_this2.state.installEvents), _toConsumableArray(events));
                var last = events.pop(); // update last progress
                var p = _this2.state.installProgress;
                if (last.data.Progress) {
                    p = last.data.Progress;
                }
                _this2.setState({ installEvents: newEvents, installProgress: p });
            }, function () {
                // This is call when it is finished
                var newEvents = [].concat(_toConsumableArray(_this2.state.installEvents), [{ data: { Progress: 100, Message: "Server Restarted" } }]);
                _this2.setState({
                    installEvents: newEvents,
                    serverRestarted: true,
                    willReloadIn: 5
                });
                setTimeout(function () {
                    _this2.setState({ willReloadIn: 4 });
                }, 1000);
                setTimeout(function () {
                    _this2.setState({ willReloadIn: 3 });
                }, 2000);
                setTimeout(function () {
                    _this2.setState({ willReloadIn: 2 });
                }, 3000);
                setTimeout(function () {
                    _this2.setState({ willReloadIn: 1 });
                }, 4000);
                setTimeout(function () {
                    window.location.reload();
                }, 5000);
            });
        }
    }, {
        key: 'checkDbConfig',
        value: function checkDbConfig(callback) {
            var _this3 = this;

            var dbConfig = this.props.dbConfig;

            var request = new _InstallPerformCheckRequest2.default();
            request.Name = "DB";
            request.Config = _InstallInstallConfig2.default.constructFromObject(dbConfig);
            this.setState({ performingCheck: 'DB' });
            api.performInstallCheck(request).then(function (res) {
                var checkResult = res.Result;
                callback(checkResult);
            }).catch(function (reason) {
                var checkResult = _InstallCheckResult2.default.constructFromObject({ Success: false, JsonResult: JSON.stringify({ error: reason.message }) });
                callback(checkResult);
            }).finally(function () {
                _this3.setState({ performingCheck: 'DB' });
            });
        }
    }, {
        key: 'checkLicenseConfig',
        value: function checkLicenseConfig(callback) {
            var _this4 = this;

            var request = new _InstallPerformCheckRequest2.default();
            request.Name = "LICENSE";
            request.Config = _InstallInstallConfig2.default.constructFromObject({ licenseString: this.props.licenseString });
            this.setState({ performingCheck: 'LICENSE' });
            api.performInstallCheck(request).then(function (res) {
                var checkResult = res.Result;
                callback(checkResult);
            }).catch(function (reason) {
                var checkResult = _InstallCheckResult2.default.constructFromObject({ Name: "LICENSE", Success: false, JsonResult: JSON.stringify({ error: reason.message }) });
                callback(checkResult);
            }).finally(function () {
                _this4.setState({ performingCheck: null });
            });
        }
    }, {
        key: 'renderStepActions',
        value: function renderStepActions(step) {
            var _this5 = this;

            var nextDisabled = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var leftAction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            var stepIndex = this.state.stepIndex;
            var _props = this.props,
                handleSubmit = _props.handleSubmit,
                licenseRequired = _props.licenseRequired,
                invalid = _props.invalid;

            var stepOffset = licenseRequired ? 1 : 0;

            var nextAction = void 0;
            switch (stepIndex) {
                case 1 + stepOffset:
                    nextAction = function nextAction() {
                        _this5.checkDbConfig(function (checkResult) {
                            if (checkResult.Success) {
                                _this5.handleNext();
                                _this5.setState({ dbCheckError: null });
                            } else {
                                _this5.setState({ dbCheckError: JSON.parse(checkResult.JsonResult).error });
                            }
                        });
                    };
                    break;
                case 3 + stepOffset:
                    nextAction = function nextAction() {
                        _this5.handleNext();handleSubmit();
                    };
                    break;
                default:
                    nextAction = this.handleNext;
                    break;
            }

            return _react2.default.createElement(
                'div',
                { style: { margin: '12px 0', display: 'flex', alignItems: 'center' } },
                leftAction,
                _react2.default.createElement('span', { style: { flex: 1 } }),
                _react2.default.createElement(
                    'div',
                    null,
                    step > 0 && _react2.default.createElement(_materialUi.FlatButton, {
                        label: 'Back',
                        disabled: stepIndex === 0,
                        onClick: this.handlePrev,
                        style: { marginRight: 5 }
                    }),
                    _react2.default.createElement(_materialUi.RaisedButton, {
                        label: stepIndex === 3 + stepOffset ? 'Install Now' : 'Next',
                        primary: true,
                        onClick: nextAction,
                        disabled: nextDisabled || invalid
                    })
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var _props2 = this.props,
                dbConnectionType = _props2.dbConnectionType,
                handleSubmit = _props2.handleSubmit,
                installPerformed = _props2.installPerformed,
                installError = _props2.installError,
                initialChecks = _props2.initialChecks,
                licenseRequired = _props2.licenseRequired,
                licenseString = _props2.licenseString,
                frontendPassword = _props2.frontendPassword;
            var _state = this.state,
                stepIndex = _state.stepIndex,
                licenseAgreed = _state.licenseAgreed,
                showAdvanced = _state.showAdvanced,
                installEvents = _state.installEvents,
                installProgress = _state.installProgress,
                serverRestarted = _state.serverRestarted,
                willReloadIn = _state.willReloadIn,
                agreementText = _state.agreementText,
                dbCheckError = _state.dbCheckError,
                licCheckFailed = _state.licCheckFailed;


            var flexContainer = {
                display: 'flex',
                flexDirection: 'column'
            };
            var panelHeight = 580;

            var stepperStyles = {
                step: {
                    marginBottom: -14,
                    width: 256
                },
                label: {
                    color: 'white'
                },
                content: {
                    position: 'absolute',
                    top: 14,
                    left: 256,
                    right: 0,
                    borderLeft: 0,
                    padding: 24,
                    maxHeight: panelHeight - 20,
                    marginLeft: 0,
                    lineHeight: '1.4em'
                },
                contentScroller: {
                    height: panelHeight - 88,
                    overflowY: 'auto'
                }
            };
            var leftAction = void 0,
                additionalStep = void 0;
            var stepOffset = 0;
            if (stepIndex === 0) {
                leftAction = _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(_materialUi.Checkbox, { checked: licenseAgreed, label: "I agree with these terms", style: { width: 300 }, onCheck: function onCheck() {
                            _this6.setState({ licenseAgreed: !licenseAgreed });
                        } })
                );
            }
            if (licenseRequired) {
                stepOffset = 1;
                var licCheckPassed = void 0,
                    nextAction = void 0;
                if (initialChecks && initialChecks.length) {
                    initialChecks.map(function (c) {
                        if (c.Name === "LICENSE" && c.Success) {
                            licCheckPassed = JSON.parse(c.JsonResult);
                            nextAction = _this6.handleNext.bind(_this6);
                        }
                    });
                }
                if (!nextAction) {
                    nextAction = function nextAction() {
                        _this6.checkLicenseConfig(function (result) {
                            if (result.Success) {
                                _this6.setState({ licCheckFailed: false });
                                _this6.handleNext();
                            } else {
                                _this6.setState({ licCheckFailed: true });
                            }
                        });
                    };
                }
                additionalStep = _react2.default.createElement(
                    _materialUi.Step,
                    { key: "license", style: stepperStyles.step },
                    _react2.default.createElement(
                        _materialUi.StepLabel,
                        { style: stepIndex >= 1 ? stepperStyles.label : {} },
                        'Enterprise License'
                    ),
                    _react2.default.createElement(
                        _materialUi.StepContent,
                        { style: stepperStyles.content },
                        _react2.default.createElement(
                            'div',
                            { style: stepperStyles.contentScroller },
                            _react2.default.createElement(
                                'h3',
                                null,
                                'Pydio Cells Enterprise License'
                            ),
                            licCheckPassed && _react2.default.createElement(
                                'div',
                                { style: { padding: '20px 0', color: '#388E3C', fontSize: 14 } },
                                'License file was successfully detected.',
                                _react2.default.createElement('br', null),
                                'This installation is valid for ',
                                licCheckPassed.users,
                                ' users until ',
                                new Date(licCheckPassed.expireTime * 1000).toISOString(),
                                '.'
                            ),
                            licCheckFailed && _react2.default.createElement(
                                'div',
                                { style: { color: '#E53935', paddingTop: 10, fontWeight: 500 } },
                                'Error while trying to verify this license string. Please contact the support.'
                            ),
                            !licCheckPassed && _react2.default.createElement(
                                'div',
                                null,
                                'A valid license is required to run this installation.',
                                _react2.default.createElement(_reduxForm.Field, { name: 'licenseString', component: renderTextField, floatingLabel: 'License String', label: 'Please copy/paste the license string provided to you.' })
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { style: { margin: '12px 0', display: 'flex', alignItems: 'center' } },
                            _react2.default.createElement('span', { style: { flex: 1 } }),
                            _react2.default.createElement(
                                'div',
                                null,
                                _react2.default.createElement(_materialUi.FlatButton, { label: 'Back', onClick: this.handlePrev.bind(this), style: { marginRight: 5 } }),
                                _react2.default.createElement(_materialUi.RaisedButton, { label: 'Next', primary: true, onClick: nextAction, disabled: !licCheckPassed && !licenseString })
                            )
                        )
                    )
                );
            }

            var steps = [];
            steps.push(_react2.default.createElement(
                _materialUi.Step,
                { key: steps.length - 1, style: stepperStyles.step },
                _react2.default.createElement(
                    _materialUi.StepLabel,
                    { style: stepperStyles.label },
                    'Terms of Use '
                ),
                _react2.default.createElement(
                    _materialUi.StepContent,
                    { style: stepperStyles.content },
                    _react2.default.createElement(
                        'div',
                        { style: stepperStyles.contentScroller },
                        _react2.default.createElement(
                            'h3',
                            null,
                            'Welcome to Pydio Cells Installation Wizard'
                        ),
                        _react2.default.createElement(
                            'p',
                            null,
                            'This will install all services on the current server. Please agree with the terms of the license below before starting'
                        ),
                        _react2.default.createElement(
                            'pre',
                            { style: { height: 350, border: '1px solid #CFD8DC', borderRadius: 2, backgroundColor: '#ECEFF1', padding: 10, overflowY: 'scroll', lineHeight: '1.4em' } },
                            agreementText
                        )
                    ),
                    this.renderStepActions(0, !licenseAgreed, leftAction)
                )
            ));

            if (additionalStep) {
                steps.push(additionalStep);
            }

            steps.push(_react2.default.createElement(
                _materialUi.Step,
                { key: steps.length - 1, style: stepperStyles.step },
                _react2.default.createElement(
                    _materialUi.StepLabel,
                    { style: stepIndex >= 1 + stepOffset ? stepperStyles.label : {} },
                    'Database connection'
                ),
                _react2.default.createElement(
                    _materialUi.StepContent,
                    { style: stepperStyles.content },
                    _react2.default.createElement(
                        'div',
                        { style: stepperStyles.contentScroller },
                        _react2.default.createElement(
                            'h3',
                            null,
                            'Database Configuration'
                        ),
                        'Pydio requires at least one SQL storage for configuration and data indexation. Configure here the connection to your MySQL/MariaDB server. Please make sure that your database is running ',
                        _react2.default.createElement(
                            'b',
                            null,
                            'MySQL version 5.6 or higher'
                        ),
                        '.',
                        dbCheckError && _react2.default.createElement(
                            'div',
                            { style: { color: '#E53935', paddingTop: 10, fontWeight: 500 } },
                            dbCheckError
                        ),
                        _react2.default.createElement(
                            'div',
                            { style: flexContainer },
                            _react2.default.createElement(
                                _reduxForm.Field,
                                { name: 'dbConnectionType', component: renderSelectField },
                                _react2.default.createElement(_materialUi.MenuItem, { value: 'tcp', primaryText: 'TCP' }),
                                _react2.default.createElement(_materialUi.MenuItem, { value: 'socket', primaryText: 'Socket' }),
                                _react2.default.createElement(_materialUi.MenuItem, { value: 'manual', primaryText: 'Manual' })
                            ),
                            dbConnectionType === "tcp" && _react2.default.createElement(
                                'div',
                                { style: flexContainer },
                                _react2.default.createElement(
                                    'div',
                                    { style: { display: 'flex' } },
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginRight: 2 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dbTCPHostname', component: renderTextField, floatingLabel: 'Host Name', label: 'Server where mysql is running' })
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginLeft: 2 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dbTCPPort', component: renderTextField, floatingLabel: 'Port', label: 'Port to connect to mysql' })
                                    )
                                ),
                                _react2.default.createElement(_reduxForm.Field, { name: 'dbTCPName', component: renderTextField, floatingLabel: 'Database Name', label: 'Database to use (created it if does not exist)' }),
                                _react2.default.createElement(
                                    'div',
                                    { style: { display: 'flex' } },
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginRight: 2 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dbTCPUser', component: renderTextField, floatingLabel: 'Database User', label: 'Leave blank if not required' })
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginLeft: 2 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dbTCPPassword', component: renderPassField, floatingLabel: 'Database Password', label: 'Leave blank if not required' })
                                    )
                                )
                            ),
                            dbConnectionType === "socket" && _react2.default.createElement(
                                'div',
                                { style: flexContainer },
                                _react2.default.createElement(_reduxForm.Field, { name: 'dbSocketFile', component: renderTextField, floatingLabel: 'Socket', label: 'Enter the location of the socket file to use to connect', defaultValue: '/tmp/mysql.sock' }),
                                _react2.default.createElement(_reduxForm.Field, { name: 'dbSocketName', component: renderTextField, floatingLabel: 'Database Name', label: 'Enter the name of a database to use - it will be created if it doesn\'t already exist', defaultValue: 'pydio' }),
                                _react2.default.createElement(
                                    'div',
                                    { style: { display: 'flex' } },
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginRight: 2 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dbSocketUser', component: renderTextField, floatingLabel: 'Database User', label: 'Leave blank if not required' })
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginLeft: 2 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dbSocketPassword', component: renderTextField, floatingLabel: 'Database Password', label: 'Leave blank if not required' })
                                    )
                                )
                            ),
                            dbConnectionType === "manual" && _react2.default.createElement(
                                'div',
                                { style: flexContainer },
                                _react2.default.createElement(_reduxForm.Field, { name: 'dbManualDSN', component: renderTextField, floatingLabel: 'DSN', label: 'Use golang style DSN to describe the DB connection' })
                            )
                        )
                    ),
                    this.renderStepActions(1 + stepOffset)
                )
            ));

            steps.push(_react2.default.createElement(
                _materialUi.Step,
                { key: steps.length - 1, style: stepperStyles.step },
                _react2.default.createElement(
                    _materialUi.StepLabel,
                    { style: stepIndex >= 2 + stepOffset ? stepperStyles.label : {} },
                    'Admin User'
                ),
                _react2.default.createElement(
                    _materialUi.StepContent,
                    { style: stepperStyles.content },
                    _react2.default.createElement(
                        'div',
                        { style: stepperStyles.contentScroller },
                        _react2.default.createElement(
                            'h3',
                            null,
                            'Admin user and frontend defaults'
                        ),
                        'Provide credentials for the administrative user. Leave fields empty if you are deploying on top of an existing installation.',
                        _react2.default.createElement(
                            'div',
                            { style: flexContainer },
                            _react2.default.createElement(_reduxForm.Field, { name: 'frontendApplicationTitle', component: renderTextField, floatingLabel: 'Application Title', label: 'Main title of your installation.' }),
                            _react2.default.createElement(
                                _reduxForm.Field,
                                { name: 'frontendDefaultLanguage', component: renderSelectField, label: 'Default Language (set by default for all users).' },
                                _react2.default.createElement(_materialUi.MenuItem, { value: "en", primaryText: "English" }),
                                _react2.default.createElement(_materialUi.MenuItem, { value: "fr", primaryText: "Français" }),
                                _react2.default.createElement(_materialUi.MenuItem, { value: "de", primaryText: "Deutsch" }),
                                _react2.default.createElement(_materialUi.MenuItem, { value: "es", primaryText: "Español" }),
                                _react2.default.createElement(_materialUi.MenuItem, { value: "it", primaryText: "Italiano" }),
                                _react2.default.createElement(_materialUi.MenuItem, { value: "pt", primaryText: "Português" })
                            ),
                            _react2.default.createElement(_reduxForm.Field, { name: 'frontendLogin', component: renderTextField, floatingLabel: 'Login of the admin user', label: 'Skip this if an admin is already created in the database.' }),
                            _react2.default.createElement(_reduxForm.Field, { name: 'frontendPassword', component: renderPassField, floatingLabel: 'Password of the admin user', label: 'Skip this if an admin is already created in the database.' }),
                            frontendPassword && _react2.default.createElement(_reduxForm.Field, { name: 'frontendRepeatPassword', component: renderPassField, floatingLabel: 'Please confirm password', label: 'Type again the admin password' })
                        )
                    ),
                    this.renderStepActions(3 + stepOffset)
                )
            ));

            steps.push(_react2.default.createElement(
                _materialUi.Step,
                { key: steps.length - 1, style: stepperStyles.step },
                _react2.default.createElement(
                    _materialUi.StepLabel,
                    { style: stepIndex >= 3 + stepOffset ? stepperStyles.label : {} },
                    'Advanced Settings'
                ),
                _react2.default.createElement(
                    _materialUi.StepContent,
                    { style: stepperStyles.content },
                    _react2.default.createElement(
                        'div',
                        { style: stepperStyles.contentScroller },
                        _react2.default.createElement(
                            'h3',
                            null,
                            'Advanced Settings'
                        ),
                        'Pydio Cells services will be deployed on this machine. You may review some advanced settings below for fine-tuning your configuration.',
                        _react2.default.createElement(
                            'div',
                            { style: { display: 'flex', alignItems: 'center', height: 40, cursor: 'pointer' }, onClick: function onClick() {
                                    _this6.setState({ showAdvanced: !showAdvanced });
                                } },
                            _react2.default.createElement(
                                'div',
                                { style: { flex: 1, fontSize: 14 } },
                                'Show Advanced Settings'
                            ),
                            _react2.default.createElement(_materialUi.FontIcon, { className: showAdvanced ? "mdi mdi-chevron-down" : "mdi mdi-chevron-right" })
                        ),
                        showAdvanced && _react2.default.createElement(
                            'div',
                            { style: flexContainer },
                            _react2.default.createElement(
                                'div',
                                { style: { marginTop: 10 } },
                                'A default data source to store users personal data and cells data is created at startup. You can create other datasources later on.'
                            ),
                            _react2.default.createElement(
                                'div',
                                null,
                                _react2.default.createElement(_reduxForm.Field, { name: 'dsFolder', component: renderTextField, floatingLabel: 'Path of the default datasource', label: 'Use an absolute path on the server' })
                            ),
                            _react2.default.createElement(
                                'div',
                                { style: { marginTop: 20 } },
                                'Services are authenticating using OpenIDConnect protocol. This keypair will be added to the frontend, it is not used outside of the application. You should leave the default value unless you are reinstalling on a top of a running frontend.'
                            ),
                            _react2.default.createElement(
                                'div',
                                { style: { display: 'flex' } },
                                _react2.default.createElement(
                                    'div',
                                    { style: { flex: 1, marginRight: 2 } },
                                    _react2.default.createElement(_reduxForm.Field, { name: 'externalDexID', component: renderTextField, floatingLabel: 'OIDC Client ID', label: 'Use default if not sure' })
                                ),
                                _react2.default.createElement(
                                    'div',
                                    { style: { flex: 1, marginLeft: 2 } },
                                    _react2.default.createElement(_reduxForm.Field, { name: 'externalDexSecret', component: renderTextField, floatingLabel: 'OIDC Client Secret', label: 'Leave blank if not required' })
                                )
                            )
                        )
                    ),
                    this.renderStepActions(3 + stepOffset)
                )
            ));

            var eventsLength = installEvents.length - 1;
            steps.push(_react2.default.createElement(
                _materialUi.Step,
                { key: steps.length - 1, style: stepperStyles.step },
                _react2.default.createElement(
                    _materialUi.StepLabel,
                    { style: stepIndex >= 4 + stepOffset ? stepperStyles.label : {} },
                    'Apply Installation'
                ),
                _react2.default.createElement(
                    _materialUi.StepContent,
                    { style: stepperStyles.content },
                    _react2.default.createElement(
                        'div',
                        { style: stepperStyles.contentScroller },
                        _react2.default.createElement(
                            'h3',
                            null,
                            'Please wait while installing Pydio ...'
                        ),
                        _react2.default.createElement(
                            'div',
                            { style: { padding: '20px 0' } },
                            _react2.default.createElement(_materialUi.LinearProgress, { min: 0, max: 100, value: installProgress, style: { width: '100%' }, mode: "determinate" })
                        ),
                        _react2.default.createElement(
                            'div',
                            { style: _extends({}, flexContainer, { paddingRight: 20, paddingTop: 10, fontSize: 14, paddingBottom: 20 }) },
                            installEvents.map(function (e, i) {
                                var icon = _react2.default.createElement(_materialUi.FontIcon, { className: "mdi mdi-check" });
                                if (e.data.Message.indexOf('...') > -1) {
                                    if (i < eventsLength) return null; // if it's not the last, the next message will replace it
                                    icon = _react2.default.createElement(_materialUi.CircularProgress, { size: 20, thickness: 2, color: "rgba(0, 0, 0, 0.87)" });
                                }
                                return _react2.default.createElement(
                                    'div',
                                    { key: i, style: { display: 'flex', alignItems: 'center', height: 40 } },
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1 } },
                                        e.data.Message
                                    ),
                                    icon
                                );
                            })
                        ),
                        installPerformed && !serverRestarted && _react2.default.createElement(
                            'div',
                            null,
                            'Install was succesful and services are now starting, this installer will reload the page when services are started.',
                            _react2.default.createElement('br', null),
                            _react2.default.createElement(
                                'b',
                                null,
                                'Please note'
                            ),
                            ' that if you have configured the server with a self-signed certificate, browser security will prevent automatic reloading. In that case, please wait and manually ',
                            _react2.default.createElement(
                                'a',
                                { style: { textDecoration: 'underline', cursor: 'pointer' }, onClick: function onClick() {
                                        window.location.reload();
                                    } },
                                'reload the page'
                            ),
                            '.'
                        ),
                        installPerformed && serverRestarted && _react2.default.createElement(
                            'div',
                            null,
                            'Install was succesful and services are now started, please reload the page now (it will be automatically reloaded in ',
                            willReloadIn,
                            's)'
                        ),
                        installError && _react2.default.createElement(
                            'div',
                            null,
                            'There was an error while performing installation ! Please check your configuration ',
                            _react2.default.createElement('br', null),
                            'Error was : ',
                            installError
                        )
                    ),
                    installPerformed && serverRestarted && _react2.default.createElement(
                        'div',
                        { style: { margin: '12px 0', display: 'flex', alignItems: 'center' } },
                        _react2.default.createElement('span', { style: { flex: 1 } }),
                        _react2.default.createElement(
                            'div',
                            null,
                            _react2.default.createElement(_materialUi.RaisedButton, {
                                label: 'Reload',
                                secondary: true,
                                onClick: function onClick() {
                                    window.location.reload();
                                }
                            })
                        )
                    )
                )
            ));

            return _react2.default.createElement(
                _materialUi.Paper,
                { zDepth: 2, style: { width: 800, minHeight: panelHeight, margin: 'auto', position: 'relative', backgroundColor: 'rgba(255,255,255,0.96)' } },
                _react2.default.createElement(
                    'div',
                    { style: { width: 256, height: panelHeight, backgroundColor: '#607D8B', fontSize: 13 } },
                    _react2.default.createElement('div', { style: { backgroundImage: 'url(res/css/PydioLogo250.png)', backgroundSize: '90%',
                            backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', width: 256, height: 100 } }),
                    _react2.default.createElement(
                        'form',
                        { onSubmit: handleSubmit, autoComplete: "off" },
                        _react2.default.createElement(
                            _materialUi.Stepper,
                            { activeStep: stepIndex, orientation: 'vertical' },
                            steps
                        )
                    )
                )
            );
        }
    }]);

    return InstallForm;
}(_react2.default.Component);

// The order of the decoration does not matter.

// Decorate with redux-form


InstallForm = (0, _reduxForm.reduxForm)({
    form: 'install',
    validate: function validate(values) {
        var errors = {};
        if (values['frontendLogin']) {
            var v = values['frontendLogin'];
            var re = new RegExp(/^[0-9A-Z\-_.:\+]+$/i);
            if (!(_validator2.default.isEmail(v) || re.test(v)) || !_validator2.default.isLowercase(v)) {
                errors['frontendLogin'] = 'Please use lowercase alphanumeric characters or valid emails for logins';
            }
        }
        if (values['frontendPassword'] && values['frontendRepeatPassword'] !== values['frontendPassword']) {
            errors['frontendRepeatPassword'] = 'Passwords differ!';
        }
        //console.log(errors);
        return errors;
    }
})(InstallForm);

// Decorate with connect to read form values
var selector = (0, _reduxForm.formValueSelector)('install'); // <-- same as form name
InstallForm = (0, _reactRedux.connect)(function (state) {
    var dbConnectionType = selector(state, 'dbConnectionType');
    var dbConfig = selector(state, 'dbConnectionType', 'dbManualDSN', 'dbSocketFile', 'dbSocketName', 'dbSocketUser', 'dbTCPHostname', 'dbTCPName', 'dbTCPPort', 'dbTCPUser', 'dbTCPPassword', 'dbSocketPassword');
    var initialChecks = selector(state, 'CheckResults');
    var licenseRequired = selector(state, 'licenseRequired');
    var licenseString = selector(state, 'licenseString');
    var frontendPassword = selector(state, 'frontendPassword');

    // Make a request to retrieve those values
    return {
        initialValues: state.config.data,
        dbConnectionType: dbConnectionType,
        dbConfig: dbConfig,
        initialChecks: initialChecks,
        licenseRequired: licenseRequired,
        licenseString: licenseString, frontendPassword: frontendPassword
    };
}, { load: _config.load })(InstallForm);

exports.default = InstallForm;
