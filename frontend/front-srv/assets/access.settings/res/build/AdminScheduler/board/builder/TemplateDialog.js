'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _uuid4 = require("uuid4");

var _uuid42 = _interopRequireDefault(_uuid4);

var _graphTplManager = require("../graph/TplManager");

var _graphTplManager2 = _interopRequireDefault(_graphTplManager);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;
var ModernSelectField = _Pydio$requireLib.ModernSelectField;

var TemplateDialog = (function (_React$Component) {
    _inherits(TemplateDialog, _React$Component);

    function TemplateDialog(props) {
        _classCallCheck(this, TemplateDialog);

        _get(Object.getPrototypeOf(TemplateDialog.prototype), 'constructor', this).call(this, props);
        this.state = {
            templateLabel: props.defaultLabel || '',
            templateDescription: props.defaultDescription || '',
            templateIcon: props.defaultIcon || 'mdi mdi-chip'
        };
    }

    _createClass(TemplateDialog, [{
        key: 'save',
        value: function save() {
            var _props = this.props;
            var onDismiss = _props.onDismiss;
            var type = _props.type;
            var data = _props.data;
            var _state = this.state;
            var templateLabel = _state.templateLabel;
            var templateDescription = _state.templateDescription;
            var templateIcon = _state.templateIcon;

            if (type === 'job') {

                var tpl = _pydioHttpRestApi.JobsJob.constructFromObject(JSON.parse(JSON.stringify(data)));
                tpl.ID = (0, _uuid42['default'])();
                tpl.Label = [templateLabel, templateDescription, templateIcon].join('||');
                tpl.Tasks = [];
                _graphTplManager2['default'].getInstance().saveJob(tpl).then(function () {
                    _pydio2['default'].getInstance().UI.displayMessage('SUCCESS', 'Successfully saved job as template');
                })['catch'](function (e) {
                    _pydio2['default'].getInstance().UI.displayMessage('ERROR', 'Could not save template: ' + e.message);
                });
            } else if (type === 'action') {

                var copy = _pydioHttpRestApi.JobsAction.constructFromObject(JSON.parse(JSON.stringify(data)));
                delete copy.ChainedActions;
                delete copy.FailedActions;
                copy.Label = templateLabel;
                copy.Description = templateDescription;
                _graphTplManager2['default'].getInstance().saveAction((0, _uuid42['default'])(), copy).then(function () {
                    _pydio2['default'].getInstance().UI.displayMessage('SUCCESS', 'Successfully saved as template');
                })['catch'](function (e) {
                    _pydio2['default'].getInstance().UI.displayMessage('ERROR', e.message);
                });
            } else if (type === 'selector') {
                var _props2 = this.props;
                var isFilter = _props2.isFilter;
                var selectorType = _props2.selectorType;

                _graphTplManager2['default'].getInstance().saveSelector((0, _uuid42['default'])(), isFilter, templateLabel, templateDescription, selectorType, data).then(function () {
                    _pydio2['default'].getInstance().UI.displayMessage('SUCCESS', 'Successfully saved as template');
                })['catch'](function (e) {
                    _pydio2['default'].getInstance().UI.displayMessage('ERROR', e.message);
                });
            }

            onDismiss();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props3 = this.props;
            var type = _props3.type;
            var onDismiss = _props3.onDismiss;
            var _props3$actionsDescriptions = _props3.actionsDescriptions;
            var actionsDescriptions = _props3$actionsDescriptions === undefined ? {} : _props3$actionsDescriptions;
            var _state2 = this.state;
            var templateLabel = _state2.templateLabel;
            var templateDescription = _state2.templateDescription;
            var templateIcon = _state2.templateIcon;

            var children = [];
            var title = undefined;

            children.push(_react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: "Label", value: templateLabel, onChange: function (e, v) {
                    _this.setState({ templateLabel: v });
                } }));

            if (type === 'job') {
                title = "Save job as template";
                children.push(_react2['default'].createElement(
                    ModernSelectField,
                    { fullWidth: true, hintText: "Icon", value: templateIcon, onChange: function (e, i, v) {
                            _this.setState({ templateIcon: v });
                        } },
                    _react2['default'].createElement(_materialUi.MenuItem, { value: "mdi mdi-chip", primaryText: _react2['default'].createElement(
                            'span',
                            null,
                            _react2['default'].createElement('span', { className: "mdi mdi-chip" }),
                            ' Default Icon'
                        ) }),
                    Object.keys(actionsDescriptions).filter(function (id) {
                        return !!actionsDescriptions[id].Icon;
                    }).map(function (id) {
                        var a = actionsDescriptions[id];
                        return _react2['default'].createElement(_materialUi.MenuItem, { value: "mdi mdi-" + a.Icon, primaryText: _react2['default'].createElement(
                                'span',
                                null,
                                _react2['default'].createElement('span', { className: "mdi mdi-" + a.Icon }),
                                ' ',
                                a.Icon
                            ) });
                    })
                ));
            } else if (type === 'action') {
                title = "Save action as template";
            } else if (type === 'selector') {
                title = "Save filter/selector as template";
            }

            children.push(_react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: "Additional description", multiLine: true, rowsMax: 2, value: templateDescription, onChange: function (e, v) {
                    _this.setState({ templateDescription: v });
                } }));

            children.push(_react2['default'].createElement('div', { style: { paddingTop: 20, textAlign: 'right' } }));

            return _react2['default'].createElement(
                _materialUi.Dialog,
                {
                    title: _react2['default'].createElement(
                        'h3',
                        null,
                        _react2['default'].createElement('span', { className: "mdi mdi-book-plus" }),
                        ' ',
                        title
                    ),
                    open: true,
                    onRequestClose: function () {
                        onDismiss();
                    },
                    actions: [_react2['default'].createElement(_materialUi.FlatButton, { label: "Cancel", onTouchTap: onDismiss }), _react2['default'].createElement(_materialUi.RaisedButton, { label: "Create Template", disabled: !templateLabel, primary: true, onTouchTap: function () {
                            _this.save();
                        } })]
                },
                children
            );
        }
    }]);

    return TemplateDialog;
})(_react2['default'].Component);

exports['default'] = TemplateDialog;
module.exports = exports['default'];
