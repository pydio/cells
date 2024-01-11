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

var _languages = require('./gen/languages');

var _languages2 = _interopRequireDefault(_languages);

var _urlParse = require('url-parse');

var _urlParse2 = _interopRequireDefault(_urlParse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var defaultLanguage = 'en-us';


var client = new _client2.default();
var api = new _InstallServiceApi2.default(client);

var supportedLanguages = [_react2.default.createElement(_materialUi.MenuItem, { key: "en-us", value: "en-us", primaryText: "English" }), _react2.default.createElement(_materialUi.MenuItem, { key: "fr", value: "fr", primaryText: "Français" }), _react2.default.createElement(_materialUi.MenuItem, { key: "de", value: "de", primaryText: "Deutsch" }), _react2.default.createElement(_materialUi.MenuItem, { key: "es-es", value: "es-es", primaryText: "Español" }), _react2.default.createElement(_materialUi.MenuItem, { key: "it", value: "it", primaryText: "Italiano" }), _react2.default.createElement(_materialUi.MenuItem, { key: "pt-br", value: "pt-br", primaryText: "Português do Brasil" })];

var noWrap = {
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
};
var hintColor = 'rgba(0,0,0, 0.33)';
var panelBG = 'rgba(225, 234, 242, 0.98)';
var v2Block = {
    backgroundColor: '#dde3ea',
    borderRadius: '3px 3px 0 0',
    height: 52,
    marginTop: 8,
    boxSizing: 'border-box'
};
var underline = {
    idle: { borderBottom: '1px solid rgb(193 199 206)' },
    focus: { borderBottom: '2px solid var(--md-sys-color-primary)' }
};

var fieldStyles = {
    textFieldV2: {
        style: _extends({}, v2Block),
        inputStyle: { position: 'absolute', height: 30, marginTop: 0, bottom: 2, paddingLeft: 8, paddingRight: 8 },
        hintStyle: _extends({ bottom: 4, paddingLeft: 7, color: hintColor }, noWrap, { width: '100%' }),
        underlineStyle: _extends({ opacity: 1, bottom: 0 }, underline.idle),
        underlineFocusStyle: _extends({ opacity: 1, borderRadius: 0, bottom: 0 }, underline.focus),
        floatingLabelFixed: true,
        floatingLabelStyle: _extends({ top: 26, left: 8, width: '127%' }, noWrap),
        floatingLabelShrinkStyle: { top: 26, left: 8 },
        errorStyle: {
            position: 'absolute', bottom: 8, right: 8,
            maxWidth: '60%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'
        }
    },
    selectFieldV2: {
        style: _extends({}, v2Block, { padding: 8, paddingRight: 0, overflow: 'hidden' }),
        menuStyle: { marginTop: -6 },
        hintStyle: _extends({ paddingLeft: 0, marginBottom: -7, paddingRight: 56, color: hintColor }, noWrap, { width: '100%' }),
        underlineStyle: _extends({ opacity: 1, bottom: 0, left: 0, right: 0 }, underline.idle),
        underlineFocusStyle: _extends({ opacity: 1, borderRadius: 0, bottom: 0 }, underline.focus),
        floatingLabelFixed: true,
        floatingLabelStyle: _extends({ top: 26, left: 8, width: '127%' }, noWrap),
        floatingLabelShrinkStyle: { top: 26, left: 8 },
        dropDownMenuProps: {
            iconStyle: { right: 0, fill: '#9e9e9e' },
            menuStyle: { background: 'white' }
        }
    },
    textareaFieldV2: {
        rows: 15,
        rowsMax: 15,
        style: { height: 388 },
        inputStyle: {
            backgroundColor: v2Block.backgroundColor,
            height: 380,
            borderRadius: v2Block.borderRadius,
            marginTop: 8,
            paddingLeft: 8
        },
        textareaStyle: { marginTop: 24, marginBottom: 0 },
        floatingLabelFixed: true,
        floatingLabelStyle: _extends({ top: 35, left: 6, width: '127%' }, noWrap),
        floatingLabelShrinkStyle: { top: 35, left: 6 },
        hintStyle: _extends({ paddingLeft: 7, color: hintColor }, noWrap, { width: '100%', top: 12, bottom: 'inherit' }),
        underlineStyle: _extends({ opacity: 1, bottom: 0 }, underline.idle),
        underlineFocusStyle: _extends({ opacity: 1, bottom: 0, borderRadius: '0px 0px 3px 3px' }, underline.focus),
        errorStyle: { position: 'absolute', bottom: 8, right: 8 }
    }

};

var renderTextField = function renderTextField(_ref) {
    var input = _ref.input,
        label = _ref.label,
        floatingLabel = _ref.floatingLabel,
        _ref$meta = _ref.meta,
        touched = _ref$meta.touched,
        error = _ref$meta.error,
        custom = _objectWithoutProperties(_ref, ['input', 'label', 'floatingLabel', 'meta']);

    if (custom && custom.multiLine) {
        return _react2.default.createElement(_materialUi.TextField, _extends({
            hintText: label,
            floatingLabelText: floatingLabel,
            floatingLabelFixed: true,
            errorText: touched && error,
            fullWidth: true
        }, fieldStyles.textareaFieldV2, input, custom));
    } else {
        return _react2.default.createElement(_materialUi.TextField, _extends({
            hintText: label,
            floatingLabelText: floatingLabel,
            floatingLabelFixed: true,
            errorText: touched && error,
            fullWidth: true
        }, fieldStyles.textFieldV2, input, custom));
    }
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
    }, fieldStyles.textFieldV2, input, custom));
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

var renderInvertCheckbox = function renderInvertCheckbox(_ref4) {
    var input = _ref4.input,
        label = _ref4.label;
    return _react2.default.createElement(_materialUi.Checkbox, {
        label: label,
        labelStyle: { lineHeight: '15px' },
        checked: input.value ? false : true,
        onCheck: function onCheck(e, v) {
            input.onChange(!v);
        }
    });
};

var renderRadioGroup = function renderRadioGroup(_ref5) {
    var input = _ref5.input,
        rest = _objectWithoutProperties(_ref5, ['input']);

    return _react2.default.createElement(_materialUi.RadioButtonGroup, _extends({}, input, rest, {
        valueSelected: input.value,
        onChange: function onChange(event, value) {
            return input.onChange(value);
        }
    }));
};

var renderSelectField = function renderSelectField(_ref6) {
    var input = _ref6.input,
        label = _ref6.label,
        floatingLabel = _ref6.floatingLabel,
        _ref6$meta = _ref6.meta,
        touched = _ref6$meta.touched,
        error = _ref6$meta.error,
        children = _ref6.children,
        custom = _objectWithoutProperties(_ref6, ['input', 'label', 'floatingLabel', 'meta', 'children']);

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
    }, fieldStyles.selectFieldV2, custom));
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
            serverRestarted: false,
            lang: defaultLanguage
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
            if (values.config && values.config.dbUseDefaults) {
                _this.setState({ dbUseDefaultsToggle: true });
            }
        });
        api.getAgreement().then(function (resp) {
            _this.setState({ agreementText: resp.Text });
        });
        return _this;
    }

    _createClass(InstallForm, [{
        key: 't',
        value: function t(s) {
            var lang = this.state.lang;

            if (_languages2.default && _languages2.default[lang] && _languages2.default[lang][s]) {
                return _languages2.default[lang][s]['other'];
            } else if (lang !== defaultLanguage && _languages2.default && _languages2.default[defaultLanguage] && _languages2.default[defaultLanguage][s]) {
                return _languages2.default[defaultLanguage][s]['other'];
            } else {
                return s;
            }
        }
    }, {
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
                _this3.setState({ performingCheck: null });
            });
        }
    }, {
        key: 'checkMongoDSN',
        value: function checkMongoDSN(callback) {
            var _this4 = this;

            var DocumentsDSN = this.props.DocumentsDSN;

            var request = new _InstallPerformCheckRequest2.default();
            request.Name = "MONGO";
            request.Config = _InstallInstallConfig2.default.constructFromObject({ DocumentsDSN: DocumentsDSN });
            this.setState({ performingCheck: 'MONGO' });
            api.performInstallCheck(request).then(function (res) {
                var checkResult = res.Result;
                callback(checkResult);
            }).catch(function (reason) {
                var checkResult = _InstallCheckResult2.default.constructFromObject({ Name: 'MONGO', Success: false, JsonResult: JSON.stringify({ error: reason.message }) });
                callback(checkResult);
            }).finally(function () {
                _this4.setState({ performingCheck: null });
            });
        }
    }, {
        key: 'checkLicenseConfig',
        value: function checkLicenseConfig(callback) {
            var _this5 = this;

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
                _this5.setState({ performingCheck: null });
            });
        }
    }, {
        key: 'checkS3Config',
        value: function checkS3Config(callback) {
            var _this6 = this;

            var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var s3Config = this.props.s3Config;

            var request = new _InstallPerformCheckRequest2.default();
            request.Name = keys ? "S3_KEYS" : "S3_BUCKETS";
            request.Config = _InstallInstallConfig2.default.constructFromObject(s3Config);
            this.setState({ performingCheck: 'S3_KEYS', s3CheckKeysSuccess: null, s3CheckKeysError: null, s3BucketsPrefix: '' });
            api.performInstallCheck(request).then(function (res) {
                var checkResult = res.Result;
                callback(checkResult);
            }).catch(function (reason) {
                var checkResult = _InstallCheckResult2.default.constructFromObject({ Name: "S3_KEYS", Success: false, JsonResult: JSON.stringify({ error: reason.message }) });
                callback(checkResult);
            }).finally(function () {
                _this6.setState({ performingCheck: null });
            });
        }
    }, {
        key: 'renderS3BucketsList',
        value: function renderS3BucketsList() {
            var s3Config = this.props.s3Config;
            var s3CheckKeysSuccess = this.state.s3CheckKeysSuccess;
            var buckets = s3CheckKeysSuccess.buckets,
                canCreate = s3CheckKeysSuccess.canCreate;

            if (!buckets) {
                buckets = [];
            }
            var keys = ['Default', 'Personal', 'Cells', 'Binaries', 'Thumbs', 'Versions'];
            var newBuckets = keys.map(function (k) {
                return s3Config['dsS3Bucket' + k];
            });
            var notExist = newBuckets.filter(function (b) {
                return buckets.indexOf(b) === -1;
            });
            var exist = newBuckets.filter(function (b) {
                return buckets.indexOf(b) > -1;
            });
            var result = {};
            if (canCreate) {
                result.Valid = true;
                result.NeedsCreates = notExist.length > 0;
                result.Component = _react2.default.createElement(
                    'span',
                    null,
                    _react2.default.createElement(_materialUi.FontIcon, { className: "mdi mdi-check", color: "#2e7d32", style: { fontSize: 'inherit' } }),
                    exist.length > 0 && _react2.default.createElement(
                        'span',
                        null,
                        this.t('form.bucketList.found'),
                        ' : ',
                        exist.join(', '),
                        '. '
                    ),
                    notExist.length > 0 && _react2.default.createElement(
                        'span',
                        null,
                        this.t('form.bucketList.toCreate'),
                        ' : ',
                        notExist.join(', '),
                        '. '
                    )
                );
            } else {
                if (notExist.length) {
                    result.Valid = false;
                    result.Component = _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(_materialUi.FontIcon, { className: "mdi mdi-alert", color: "#c62828", style: { fontSize: 'inherit' } }),
                        ' ',
                        this.t('form.bucketList.notFound'),
                        ' : ',
                        notExist.join(', '),
                        '. ',
                        _react2.default.createElement(
                            'span',
                            { style: { color: '"#c62828"' } },
                            this.t('form.bucketList.warnCreate')
                        )
                    );
                } else {
                    result.Valid = true;
                    result.Component = _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(_materialUi.FontIcon, { className: "mdi mdi-check", color: "#2e7d32", style: { fontSize: 'inherit' } }),
                        ' ',
                        this.t('form.bucketList.found'),
                        ' : ',
                        newBuckets.join(', '),
                        '.'
                    );
                }
            }
            return result;
        }
    }, {
        key: 'renderStepActions',
        value: function renderStepActions(step) {
            var _this7 = this;

            var nextDisabled = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var leftAction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            var _state = this.state,
                stepIndex = _state.stepIndex,
                tablesFoundConfirm = _state.tablesFoundConfirm,
                dbCheckSuccess = _state.dbCheckSuccess;
            var _props = this.props,
                handleSubmit = _props.handleSubmit,
                licenseRequired = _props.licenseRequired,
                invalid = _props.invalid,
                dsType = _props.dsType;

            var stepOffset = licenseRequired ? 1 : 0;

            var nextAction = void 0;
            var nextInvalid = void 0;
            switch (stepIndex) {
                case 1 + stepOffset:
                    nextAction = function nextAction() {
                        _this7.checkDbConfig(function (checkResult) {
                            if (checkResult.Success) {
                                var successData = JSON.parse(checkResult.JsonResult);
                                if (!successData || !successData.tablesFound || tablesFoundConfirm) {
                                    _this7.handleNext();
                                }
                                _this7.setState({ dbCheckError: null, dbCheckSuccess: JSON.parse(checkResult.JsonResult) });
                            } else {
                                _this7.setState({ dbCheckError: JSON.parse(checkResult.JsonResult).error, dbCheckSuccess: null });
                            }
                        });
                    };
                    if (dbCheckSuccess && dbCheckSuccess.tablesFound && !tablesFoundConfirm) {
                        nextInvalid = true;
                    }
                    break;
                case 3 + stepOffset:
                    nextAction = function nextAction() {
                        _this7.handleNext();handleSubmit();
                    };
                    if (dsType === 'S3') {
                        var _state2 = this.state,
                            s3CheckKeysSuccess = _state2.s3CheckKeysSuccess,
                            s3BucketsPrefix = _state2.s3BucketsPrefix;

                        nextInvalid = !s3CheckKeysSuccess || !s3BucketsPrefix || !this.renderS3BucketsList().Valid;
                        if (!nextInvalid && this.renderS3BucketsList().NeedsCreates) {
                            nextAction = function nextAction() {
                                // First create buckets if necessary
                                _this7.checkS3Config(function (result) {
                                    var data = JSON.parse(result.JsonResult);
                                    if (result.Success) {
                                        _this7.handleNext();
                                        handleSubmit();
                                    } else {
                                        _this7.setState({ s3CheckBucketsError: data.error });
                                    }
                                });
                            };
                        }
                    }
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
                        label: this.t('stepper.button.back'),
                        disabled: stepIndex === 0,
                        onClick: this.handlePrev,
                        style: { borderRadius: 20, marginRight: 5 },
                        buttonStyle: { borderRadius: 20 },
                        labelStyle: { textTransform: 'none', fontWeight: 400 }
                    }),
                    _react2.default.createElement(_materialUi.RaisedButton, {
                        label: stepIndex === 3 + stepOffset ? this.t('stepper.button.last') : this.t('stepper.button.next'),
                        primary: true,
                        onClick: nextAction,
                        disabled: nextDisabled || invalid || nextInvalid,
                        style: { borderRadius: 20 },
                        buttonStyle: { borderRadius: 20 },
                        overlayStyle: { borderRadius: 20 },
                        labelStyle: { textTransform: 'none', fontWeight: 400 }
                    })
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this8 = this;

            var _props2 = this.props,
                dbConnectionType = _props2.dbConnectionType,
                handleSubmit = _props2.handleSubmit,
                installPerformed = _props2.installPerformed,
                installError = _props2.installError,
                initialChecks = _props2.initialChecks,
                licenseRequired = _props2.licenseRequired,
                licenseString = _props2.licenseString,
                frontendPassword = _props2.frontendPassword,
                frontendLogin = _props2.frontendLogin,
                frontendRepeatPassword = _props2.frontendRepeatPassword,
                DocumentsDSN = _props2.DocumentsDSN,
                change = _props2.change;
            var _state3 = this.state,
                stepIndex = _state3.stepIndex,
                licenseAgreed = _state3.licenseAgreed,
                showAdvanced = _state3.showAdvanced,
                installEvents = _state3.installEvents,
                installProgress = _state3.installProgress,
                serverRestarted = _state3.serverRestarted,
                willReloadIn = _state3.willReloadIn,
                agreementText = _state3.agreementText,
                dbCheckError = _state3.dbCheckError,
                dbCheckSuccess = _state3.dbCheckSuccess,
                s3CheckKeysSuccess = _state3.s3CheckKeysSuccess,
                s3CheckKeysError = _state3.s3CheckKeysError,
                s3BucketsPrefix = _state3.s3BucketsPrefix,
                s3CheckBucketsError = _state3.s3CheckBucketsError,
                licCheckFailed = _state3.licCheckFailed,
                performingCheck = _state3.performingCheck,
                tablesFoundConfirm = _state3.tablesFoundConfirm,
                adminFoundOverride = _state3.adminFoundOverride,
                mongoDSNValid = _state3.mongoDSNValid,
                mongoDSNError = _state3.mongoDSNError,
                lang = _state3.lang;


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
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }
            };
            var leftAction = void 0,
                additionalStep = void 0;
            var stepOffset = 0;
            if (stepIndex === 0) {
                leftAction = _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(_materialUi.Checkbox, { checked: licenseAgreed, label: this.t('welcome.agreed'), style: { width: 300 }, onCheck: function onCheck() {
                            _this8.setState({ licenseAgreed: !licenseAgreed });
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
                            nextAction = _this8.handleNext.bind(_this8);
                        }
                    });
                }
                if (!nextAction) {
                    nextAction = function nextAction() {
                        _this8.checkLicenseConfig(function (result) {
                            if (result.Success) {
                                _this8.setState({ licCheckFailed: false });
                                _this8.handleNext();
                            } else {
                                _this8.setState({ licCheckFailed: true });
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
                        this.t('license.stepLabel')
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
                                this.t('license.title')
                            ),
                            licCheckPassed && _react2.default.createElement(
                                'div',
                                { style: { padding: '20px 0', color: '#388E3C', fontSize: 14 } },
                                this.t('license.success'),
                                _react2.default.createElement('br', null),
                                this.t('license.details').replace('%count', licCheckPassed.users).replace('%expiration', new Date(licCheckPassed.expireTime * 1000).toISOString())
                            ),
                            licCheckFailed && _react2.default.createElement(
                                'div',
                                { style: { color: '#E53935', paddingTop: 10, fontWeight: 500 } },
                                this.t('license.failed')
                            ),
                            !licCheckPassed && _react2.default.createElement(
                                'div',
                                null,
                                this.t('license.required'),
                                ' ',
                                _react2.default.createElement(
                                    'a',
                                    { href: "mailto:services@pydio.com" },
                                    'services@pydio.com'
                                ),
                                '.',
                                _react2.default.createElement(_reduxForm.Field, { name: 'licenseString', component: renderTextField, floatingLabel: this.t('license.fieldLabel'), label: this.t('license.fieldLegend'), multiLine: true, rowsMax: 15 })
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { style: { margin: '12px 0', display: 'flex', alignItems: 'center' } },
                            _react2.default.createElement('span', { style: { flex: 1 } }),
                            _react2.default.createElement(
                                'div',
                                null,
                                _react2.default.createElement(_materialUi.FlatButton, {
                                    label: 'Back',
                                    onClick: this.handlePrev.bind(this),
                                    style: { borderRadius: 20, marginRight: 5 },
                                    buttonStyle: { borderRadius: 20 },
                                    overlayStyle: { borderRadius: 20 },
                                    labelStyle: { textTransform: 'none', fontWeight: 400 }
                                }),
                                _react2.default.createElement(_materialUi.RaisedButton, {
                                    label: 'Next', primary: true, onClick: nextAction, disabled: !licCheckPassed && !licenseString,
                                    style: { borderRadius: 20 },
                                    buttonStyle: { borderRadius: 20 },
                                    overlayStyle: { borderRadius: 20 },
                                    labelStyle: { textTransform: 'none', fontWeight: 400 }
                                })
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
                    this.t('welcome.stepLabel')
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
                            this.t('welcome.title')
                        ),
                        _react2.default.createElement(
                            'p',
                            null,
                            this.t('welcome.legend')
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
            var _props$dbConfig = this.props.dbConfig,
                dbConfig = _props$dbConfig === undefined ? {} : _props$dbConfig;
            var dbUseDefaultsToggle = this.state.dbUseDefaultsToggle;

            var tablesFound = dbCheckSuccess && dbCheckSuccess.tablesFound;
            steps.push(_react2.default.createElement(
                _materialUi.Step,
                { key: steps.length - 1, style: stepperStyles.step },
                _react2.default.createElement(
                    _materialUi.StepLabel,
                    { style: stepIndex >= 1 + stepOffset ? stepperStyles.label : {} },
                    this.t('database.stepLabel')
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
                            this.t('database.title')
                        ),
                        dbUseDefaultsToggle && _react2.default.createElement(
                            'div',
                            null,
                            _react2.default.createElement(
                                'p',
                                null,
                                this.t('database.useDefaultsSet')
                            ),
                            _react2.default.createElement(_reduxForm.Field, { name: 'dbUseDefaults', component: renderInvertCheckbox, label: _react2.default.createElement(
                                    'span',
                                    null,
                                    this.t('database.forceConfigure'),
                                    ' ',
                                    _react2.default.createElement(
                                        'span',
                                        { style: { fontWeight: 500 } },
                                        this.t('database.legend.bold'),
                                        '.'
                                    )
                                ) })
                        ),
                        !dbUseDefaultsToggle && _react2.default.createElement(
                            'span',
                            null,
                            this.t('database.legend'),
                            ' ',
                            _react2.default.createElement(
                                'span',
                                { style: { fontWeight: 500 } },
                                this.t('database.legend.bold'),
                                '.'
                            )
                        ),
                        dbCheckError && _react2.default.createElement(
                            'div',
                            { style: { color: '#E53935', paddingTop: 10, fontWeight: 500 } },
                            dbCheckError
                        ),
                        (!dbUseDefaultsToggle || !dbConfig.dbUseDefaults) && _react2.default.createElement(
                            'div',
                            { style: flexContainer },
                            _react2.default.createElement(
                                _reduxForm.Field,
                                { name: 'dbConnectionType', component: renderSelectField, label: this.t('database.stepLabel') },
                                _react2.default.createElement(_materialUi.MenuItem, { value: 'tcp', primaryText: this.t('form.dbConnectionType.tcp') }),
                                _react2.default.createElement(_materialUi.MenuItem, { value: 'socket', primaryText: this.t('form.dbConnectionType.socket') }),
                                _react2.default.createElement(_materialUi.MenuItem, { value: 'manual', primaryText: this.t('form.dbConnectionType.manual') })
                            ),
                            dbConnectionType === "tcp" && _react2.default.createElement(
                                'div',
                                { style: flexContainer },
                                _react2.default.createElement(
                                    'div',
                                    { style: { display: 'flex' } },
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 4, marginRight: 2 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dbTCPHostname', component: renderTextField, floatingLabel: this.t('form.dbTCPHostname.label'), label: this.t('form.dbTCPHostname.legend') })
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginLeft: 2 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dbTCPPort', component: renderTextField, floatingLabel: this.t('form.dbTCPPort.label'), label: this.t('form.dbTCPPort.legend') })
                                    )
                                ),
                                _react2.default.createElement(_reduxForm.Field, { name: 'dbTCPName', component: renderTextField, floatingLabel: this.t('form.dbName.label'), label: this.t('form.dbName.legend') }),
                                _react2.default.createElement(
                                    'div',
                                    { style: { display: 'flex' } },
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginRight: 2 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dbTCPUser', component: renderTextField, floatingLabel: this.t('form.dbUser.label'), label: this.t('form.dbUser.legend') })
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginLeft: 2 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dbTCPPassword', component: renderPassField, floatingLabel: this.t('form.dbPassword.label'), label: this.t('form.dbPassword.legend') })
                                    )
                                )
                            ),
                            dbConnectionType === "socket" && _react2.default.createElement(
                                'div',
                                { style: flexContainer },
                                _react2.default.createElement(_reduxForm.Field, { name: 'dbSocketFile', component: renderTextField, floatingLabel: this.t('form.dbSocketFile.label'), label: this.t('form.dbSocketFile.legend'), defaultValue: '/tmp/mysql.sock' }),
                                _react2.default.createElement(_reduxForm.Field, { name: 'dbSocketName', component: renderTextField, floatingLabel: this.t('form.dbName.label'), label: this.t('form.dbName.legend'), defaultValue: 'pydio' }),
                                _react2.default.createElement(
                                    'div',
                                    { style: { display: 'flex' } },
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginRight: 2 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dbSocketUser', component: renderTextField, floatingLabel: this.t('form.dbUser.label'), label: this.t('form.dbUser.legend') })
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginLeft: 2 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dbSocketPassword', component: renderTextField, floatingLabel: this.t('form.dbPassword.label'), label: this.t('form.dbPassword.legend') })
                                    )
                                )
                            ),
                            dbConnectionType === "manual" && _react2.default.createElement(
                                'div',
                                { style: flexContainer },
                                _react2.default.createElement(_reduxForm.Field, { name: 'dbManualDSN', component: renderTextField, floatingLabel: this.t('form.dbManualDSN.label'), label: this.t('form.dbManualDSN.legend') })
                            )
                        ),
                        tablesFound && _react2.default.createElement(
                            'div',
                            { style: { marginTop: 40, display: 'flex' } },
                            _react2.default.createElement(
                                'div',
                                null,
                                _react2.default.createElement(_materialUi.Checkbox, { checked: tablesFoundConfirm, onCheck: function onCheck(e, v) {
                                        _this8.setState({ tablesFoundConfirm: v });
                                    } })
                            ),
                            _react2.default.createElement(
                                'div',
                                { style: { color: '#E65100', flex: 1 } },
                                this.t('database.installDetected'),
                                _react2.default.createElement(
                                    'a',
                                    { style: { fontWeight: 500, cursor: 'pointer' }, onClick: function onClick(e) {
                                            e.preventDefault();e.stopPropagation();_this8.setState({ dbCheckSuccess: null, tablesFoundConfirm: null });
                                        } },
                                    this.t('database.installDetected.retry')
                                ),
                                '.'
                            )
                        )
                    ),
                    this.renderStepActions(1 + stepOffset)
                )
            ));

            var adminFound = dbCheckSuccess && dbCheckSuccess.adminFound;
            steps.push(_react2.default.createElement(
                _materialUi.Step,
                { key: steps.length - 1, style: stepperStyles.step },
                _react2.default.createElement(
                    _materialUi.StepLabel,
                    { style: stepIndex >= 2 + stepOffset ? stepperStyles.label : {} },
                    this.t('admin.stepLabel')
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
                            this.t('admin.title')
                        ),
                        this.t('admin.legend'),
                        _react2.default.createElement(
                            'div',
                            { style: flexContainer },
                            _react2.default.createElement(_reduxForm.Field, { name: 'frontendApplicationTitle', component: renderTextField, floatingLabel: this.t('form.frontendApplicationTitle.label'), label: this.t('form.frontendApplicationTitle.legend') }),
                            _react2.default.createElement(
                                _reduxForm.Field,
                                { name: 'frontendDefaultLanguage', component: renderSelectField, label: this.t('form.frontendDefaultLanguage.label') },
                                supportedLanguages
                            ),
                            adminFound && _react2.default.createElement(
                                'div',
                                { style: { marginTop: 10 } },
                                _react2.default.createElement(_materialUi.Checkbox, { checked: adminFoundOverride, onCheck: function onCheck(e, v) {
                                        _this8.setState({ adminFoundOverride: v });
                                    }, label: this.t('admin.adminFound') })
                            ),
                            (!adminFound || adminFoundOverride) && _react2.default.createElement(
                                'div',
                                null,
                                _react2.default.createElement(_reduxForm.Field, { name: 'frontendLogin', component: renderTextField, floatingLabel: this.t('form.frontendLogin.label'), label: this.t('form.frontendLogin.legend') }),
                                _react2.default.createElement(
                                    'div',
                                    { style: { display: 'flex' } },
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginRight: 5 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'frontendPassword', component: renderPassField, floatingLabel: this.t('form.frontendPassword.label'), label: this.t('form.frontendPassword.legend') })
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginLeft: 5 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'frontendRepeatPassword', component: renderPassField, floatingLabel: this.t('form.frontendRepeatPassword.label'), label: this.t('form.frontendRepeatPassword.legend') })
                                    )
                                )
                            )
                        )
                    ),
                    this.renderStepActions(3 + stepOffset, !(adminFound || frontendLogin && frontendPassword && frontendRepeatPassword))
                )
            ));

            var DSNURL = void 0;
            if (DocumentsDSN) {
                DSNURL = new _urlParse2.default(DocumentsDSN);
            } else {
                DSNURL = new _urlParse2.default('mongodb://localhost:27017/cells?maxPoolSize=20&w=majority');
            }
            var DSNSearchParams = new URL(DSNURL.toString()).searchParams;
            var changeDSN = function changeDSN(url, key, value) {
                if (key === "authSource") {
                    var sp = new URL(url.toString()).searchParams;
                    if (value) {
                        sp.set("authSource", value);
                    } else {
                        sp.delete("authSource");
                    }
                    url.set('query', '?' + sp.toString());
                } else if (key === 'query') {
                    if (value[value.length - 1] === "&") {
                        value += 'newParam';
                    }
                    url.set('query', value);
                } else {
                    url.set(key, value);
                }
                change('DocumentsDSN', url.toString());
            };

            var _props3 = this.props,
                dsType = _props3.dsType,
                s3Config = _props3.s3Config;

            steps.push(_react2.default.createElement(
                _materialUi.Step,
                { key: steps.length - 1, style: stepperStyles.step },
                _react2.default.createElement(
                    _materialUi.StepLabel,
                    { style: stepIndex >= 3 + stepOffset ? stepperStyles.label : {} },
                    this.t('advanced.stepLabel')
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
                            this.t('advanced.title')
                        ),
                        this.t('advanced.legend'),
                        _react2.default.createElement(_materialUi.Checkbox, {
                            label: this.t('advanced.mongo.title'),
                            onCheck: function onCheck(e, v) {
                                return change('DocumentsDSN', v ? 'mongodb://localhost:27017/cells?maxPoolSize=20&w=majority' : '');
                            },
                            checked: !!DocumentsDSN,
                            labelPosition: "left",
                            style: { marginTop: 10, marginBottom: 8 },
                            labelStyle: { fontSize: 14 }
                        }),
                        !!DocumentsDSN && _react2.default.createElement(
                            'div',
                            { style: { paddingBottom: 20 } },
                            !mongoDSNError && _react2.default.createElement(
                                'div',
                                { style: { opacity: .7, width: 440 } },
                                this.t('advanced.mongo.legend')
                            ),
                            !!mongoDSNError && _react2.default.createElement(
                                'div',
                                { style: { color: '#E53935' } },
                                mongoDSNError
                            ),
                            _react2.default.createElement(
                                'div',
                                { style: { display: 'flex', alignItems: 'flex-end' } },
                                _react2.default.createElement(_materialUi.TextField, _extends({ value: DSNURL.hostname, onChange: function onChange(e, v) {
                                        return changeDSN(DSNURL, 'hostname', v);
                                    }, floatingLabelText: this.t('advanced.mongo.host'), fullWidth: true, floatingLabelFixed: true }, fieldStyles.textFieldV2)),
                                _react2.default.createElement('div', { style: { marginRight: 10 } }),
                                _react2.default.createElement(_materialUi.TextField, _extends({ value: DSNURL.port, onChange: function onChange(e, v) {
                                        return changeDSN(DSNURL, 'port', v);
                                    }, floatingLabelText: this.t('advanced.mongo.port'), fullWidth: true, floatingLabelFixed: true }, fieldStyles.textFieldV2)),
                                _react2.default.createElement('div', { style: { marginRight: 10 } }),
                                _react2.default.createElement(_materialUi.TextField, _extends({ value: DSNURL.pathname.replace('/', ''), onChange: function onChange(e, v) {
                                        return changeDSN(DSNURL, 'pathname', '/' + v);
                                    }, floatingLabelText: this.t('advanced.mongo.db'), fullWidth: true, floatingLabelFixed: true }, fieldStyles.textFieldV2)),
                                performingCheck === 'MONGO' && _react2.default.createElement(
                                    'div',
                                    { style: { minWidth: 48, height: 48, padding: 12, boxSizing: 'border-box' } },
                                    _react2.default.createElement(_materialUi.CircularProgress, { size: 20, thickness: 2.5 })
                                ),
                                _react2.default.createElement(
                                    'div',
                                    null,
                                    mongoDSNValid && _react2.default.createElement(_materialUi.FontIcon, { className: "mdi mdi-check", color: "#4caf50", style: { width: 25, height: 32, marginLeft: 10 } }),
                                    !mongoDSNValid && performingCheck !== 'MONGO' && _react2.default.createElement(_materialUi.IconButton, {
                                        disabled: !DocumentsDSN || !!performingCheck,
                                        iconClassName: "mdi mdi-login-variant",
                                        tooltip: this.t('advanced.mongo.validate'),
                                        tooltipPosition: "bottom-left",
                                        onClick: function onClick() {
                                            _this8.setState({ mongoDSNError: null });
                                            _this8.checkMongoDSN(function (result) {
                                                var data = JSON.parse(result.JsonResult);
                                                if (result.Success) {
                                                    _this8.setState({ mongoDSNValid: true });
                                                } else {
                                                    _this8.setState({ mongoDSNValid: false, mongoDSNError: data.error });
                                                }
                                            }, true);
                                        }
                                    })
                                )
                            ),
                            _react2.default.createElement(
                                'div',
                                { style: { display: 'flex', alignItems: 'flex-end' } },
                                _react2.default.createElement(_materialUi.TextField, _extends({ value: DSNURL.username, onChange: function onChange(e, v) {
                                        return changeDSN(DSNURL, 'username', v);
                                    }, floatingLabelText: this.t('advanced.mongo.username'), fullWidth: true, floatingLabelFixed: true }, fieldStyles.textFieldV2)),
                                _react2.default.createElement('div', { style: { marginRight: 10 } }),
                                _react2.default.createElement(_materialUi.TextField, _extends({ value: DSNURL.password, onChange: function onChange(e, v) {
                                        return changeDSN(DSNURL, 'password', v);
                                    }, floatingLabelText: "Password", fullWidth: true, type: this.t('advanced.mongo.password'), floatingLabelFixed: true }, fieldStyles.textFieldV2)),
                                _react2.default.createElement('div', { style: { marginRight: 10 } }),
                                _react2.default.createElement(_materialUi.TextField, _extends({ value: DSNSearchParams.get('authSource') || "",
                                    onChange: function onChange(e, v) {
                                        return changeDSN(DSNURL, 'authSource', v);
                                    },
                                    floatingLabelText: this.t('advanced.mongo.authSource'), fullWidth: true, floatingLabelFixed: true }, fieldStyles.textFieldV2)),
                                _react2.default.createElement('div', { style: { minWidth: 48 } })
                            ),
                            _react2.default.createElement(
                                'div',
                                { style: { display: 'flex' } },
                                _react2.default.createElement(_materialUi.TextField, _extends({ value: DSNURL.query, onChange: function onChange(e, v) {
                                        changeDSN(DSNURL, 'query', v);
                                    }, floatingLabelText: 'Full query string (avoid edit manually, prefer copy/pasting)', fullWidth: true, floatingLabelFixed: true }, fieldStyles.textFieldV2)),
                                _react2.default.createElement('div', { style: { minWidth: 48 } })
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { style: { display: 'flex', alignItems: 'center', height: 40, cursor: 'pointer', width: 478 }, onClick: function onClick() {
                                    _this8.setState({ showAdvanced: !showAdvanced });
                                } },
                            _react2.default.createElement(
                                'div',
                                { style: { flex: 1, fontSize: 14 } },
                                this.t('advanced.toggle')
                            ),
                            _react2.default.createElement(_materialUi.FontIcon, { className: showAdvanced ? "mdi mdi-chevron-down" : "mdi mdi-chevron-right" })
                        ),
                        showAdvanced && _react2.default.createElement(
                            'div',
                            { style: flexContainer },
                            _react2.default.createElement(
                                'div',
                                { style: { marginTop: 20 } },
                                this.t('advanced.default.datasource')
                            ),
                            _react2.default.createElement(
                                'div',
                                null,
                                _react2.default.createElement(
                                    _reduxForm.Field,
                                    { name: 'dsType', component: renderSelectField, label: this.t('form.dsType.Label') },
                                    _react2.default.createElement(_materialUi.MenuItem, { value: '', primaryText: this.t('form.dsType.FS') }),
                                    _react2.default.createElement(_materialUi.MenuItem, { value: 'S3', primaryText: this.t('form.dsType.S3') })
                                )
                            ),
                            dsType !== 'S3' && _react2.default.createElement(
                                'div',
                                null,
                                _react2.default.createElement(_reduxForm.Field, { name: 'dsFolder', component: renderTextField, floatingLabel: this.t('form.dsFolder.label'), label: this.t('form.dsFolder.legend') })
                            ),
                            dsType === 'S3' && _react2.default.createElement(
                                'div',
                                null,
                                _react2.default.createElement(
                                    'div',
                                    { style: { display: 'flex', alignItems: 'flex-end' } },
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginRight: 5 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dsS3Custom', component: renderTextField,
                                            floatingLabel: this.t('form.dsS3Custom.label'),
                                            label: this.t('form.dsS3Custom.legend')
                                        })
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginLeft: 5 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dsS3CustomRegion', component: renderTextField,
                                            floatingLabel: this.t('form.dsS3CustomRegion.label'),
                                            label: this.t('form.dsS3CustomRegion.legend') })
                                    ),
                                    _react2.default.createElement('div', { style: { width: 48 } })
                                ),
                                _react2.default.createElement(
                                    'div',
                                    { style: { display: 'flex', alignItems: 'flex-end' } },
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginRight: 5 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dsS3ApiKey', component: renderTextField,
                                            floatingLabel: this.t('form.dsS3ApiKey.label'),
                                            label: this.t('form.dsS3ApiKey.legend'),
                                            errorText: s3CheckKeysError && s3CheckKeysError.error || s3CheckBucketsError
                                        })
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { style: { flex: 1, marginLeft: 5 } },
                                        _react2.default.createElement(_reduxForm.Field, { name: 'dsS3ApiSecret', component: renderPassField,
                                            floatingLabel: this.t('form.dsS3ApiSecret.label'),
                                            label: this.t('form.dsS3ApiSecret.legend') })
                                    ),
                                    performingCheck === 'S3_KEYS' && _react2.default.createElement(
                                        'div',
                                        { style: { width: 48, height: 48, padding: 12, boxSizing: 'border-box' } },
                                        _react2.default.createElement(_materialUi.CircularProgress, { size: 20, thickness: 2.5 })
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        null,
                                        performingCheck !== 'S3_KEYS' && _react2.default.createElement(_materialUi.IconButton, {
                                            disabled: !s3Config || !s3Config.dsS3ApiKey || !s3Config.dsS3ApiSecret,
                                            iconClassName: "mdi mdi-login-variant",
                                            tooltip: this.t('form.dsS3ValidateKeys'),
                                            tooltipPosition: "bottom-left",
                                            onClick: function onClick() {
                                                _this8.checkS3Config(function (result) {
                                                    var data = JSON.parse(result.JsonResult);
                                                    if (result.Success) {
                                                        _this8.setState({ s3CheckKeysSuccess: data });
                                                    } else {
                                                        _this8.setState({ s3CheckKeysError: data });
                                                    }
                                                }, true);
                                            }
                                        })
                                    )
                                ),
                                s3CheckKeysSuccess && _react2.default.createElement(
                                    'div',
                                    null,
                                    _react2.default.createElement(_materialUi.TextField, {
                                        value: s3BucketsPrefix || '',
                                        onChange: function onChange(e, v) {
                                            _this8.setState({ s3BucketsPrefix: v });
                                            change('dsS3BucketDefault', v + 'pydiods1');
                                            change('dsS3BucketPersonal', v + 'personal');
                                            change('dsS3BucketCells', v + 'cellsdata');
                                            change('dsS3BucketBinaries', v + 'binaries');
                                            change('dsS3BucketVersions', v + 'versions');
                                            change('dsS3BucketThumbs', v + 'thumbs');
                                        },
                                        floatingLabelText: this.t('form.s3BucketsPrefix.label'),
                                        floatingLabelFixed: true,
                                        hintText: this.t('form.s3BucketsPrefix.legend'),
                                        fullWidth: true
                                    }),
                                    _react2.default.createElement(
                                        'div',
                                        null,
                                        s3BucketsPrefix && this.renderS3BucketsList().Component
                                    )
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
                    this.t('apply.stepLabel')
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
                            this.t('apply.title')
                        ),
                        _react2.default.createElement(
                            'div',
                            { style: { padding: '20px 0' } },
                            _react2.default.createElement(_materialUi.LinearProgress, { min: 0, max: 100, value: installProgress, style: { width: '100%' }, mode: "indeterminate" })
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
                            this.t('apply.success')
                        ),
                        installPerformed && serverRestarted && _react2.default.createElement(
                            'div',
                            null,
                            this.t('apply.success.restarted').replace('%1', willReloadIn)
                        ),
                        installError && _react2.default.createElement(
                            'div',
                            null,
                            this.t('apply.error'),
                            _react2.default.createElement('br', null),
                            this.t('apply.error.detail'),
                            _react2.default.createElement('br', null),
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
                                label: this.t('stepper.button.reload'),
                                secondary: true,
                                onClick: function onClick() {
                                    window.location.reload();
                                },
                                style: { borderRadius: 20 },
                                buttonStyle: { borderRadius: 20 },
                                overlayStyle: { borderRadius: 20 },
                                labelStyle: { textTransform: 'none', fontWeight: 400 }
                            })
                        )
                    )
                )
            ));

            return _react2.default.createElement(
                _materialUi.Paper,
                { zDepth: 2, style: { width: 800, minHeight: panelHeight, margin: 'auto', position: 'relative', backgroundColor: panelBG, borderRadius: 20 } },
                _react2.default.createElement(
                    'div',
                    { style: { width: 256, height: panelHeight, backgroundColor: 'rgb(94, 142, 174)', fontSize: 13, display: 'flex', flexDirection: 'column', borderRadius: '20px 0 0 20px' } },
                    _react2.default.createElement('div', { style: { backgroundImage: 'url(res/css/PydioLogo250.png)', backgroundSize: '90%',
                            backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', width: 256, height: 100 } }),
                    _react2.default.createElement(
                        'form',
                        { onSubmit: handleSubmit, autoComplete: "off", style: { flex: 1 } },
                        _react2.default.createElement(
                            _materialUi.Stepper,
                            { activeStep: stepIndex, orientation: 'vertical' },
                            steps
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { style: { height: 56, padding: '0px 16px' } },
                        _react2.default.createElement(
                            _materialUi.SelectField,
                            { value: lang, onChange: function onChange(e, i, v) {
                                    change('frontendDefaultLanguage', v), _this8.setState({ lang: v });
                                }, fullWidth: true, labelStyle: { color: 'rgba(255,255,255,.87)' }, underlineStyle: { display: 'none' } },
                            supportedLanguages
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
        if (values['frontendPassword'] && values['frontendRepeatPassword'] && values['frontendRepeatPassword'] !== values['frontendPassword']) {
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
    var dbConfig = selector(state, 'dbConnectionType', 'dbManualDSN', 'dbSocketFile', 'dbSocketName', 'dbSocketUser', 'dbTCPHostname', 'dbTCPName', 'dbTCPPort', 'dbTCPUser', 'dbTCPPassword', 'dbSocketPassword', 'dbUseDefaults');
    var initialChecks = selector(state, 'CheckResults');
    var licenseRequired = selector(state, 'licenseRequired');
    var licenseString = selector(state, 'licenseString');
    var frontendLogin = selector(state, 'frontendLogin');
    var frontendPassword = selector(state, 'frontendPassword');
    var frontendRepeatPassword = selector(state, 'frontendRepeatPassword');
    var dsType = selector(state, 'dsType');
    var s3Config = selector(state, 'dsS3Custom', 'dsS3CustomRegion', 'dsS3ApiKey', 'dsS3ApiSecret', 'dsS3BucketDefault', 'dsS3BucketPersonal', 'dsS3BucketCells', 'dsS3BucketBinaries', 'dsS3BucketThumbs', 'dsS3BucketVersions');
    var DocumentsDSN = selector(state, 'DocumentsDSN');

    // Make a request to retrieve those values
    return {
        initialValues: state.config.data,
        dbConnectionType: dbConnectionType,
        dbConfig: dbConfig,
        s3Config: s3Config,
        dsType: dsType,
        initialChecks: initialChecks,
        licenseRequired: licenseRequired,
        licenseString: licenseString,
        frontendPassword: frontendPassword,
        frontendLogin: frontendLogin,
        frontendRepeatPassword: frontendRepeatPassword,
        DocumentsDSN: DocumentsDSN
    };
}, { load: _config.load })(InstallForm);

exports.default = InstallForm;
