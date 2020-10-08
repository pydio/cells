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

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('react');

var Component = _require.Component;

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

exports['default'] = function (PydioComponent) {
    var FieldWithChoices = (function (_Component) {
        _inherits(FieldWithChoices, _Component);

        FieldWithChoices.prototype.loadExternalValues = function loadExternalValues(choices) {
            var _this = this;

            var pydio = this.props.pydio;

            var parsed = true;

            var list_action = undefined;
            if (choices instanceof Map) {
                if (this.onChoicesLoaded) this.onChoicesLoaded(choices);
                return { choices: choices, parsed: parsed };
            }

            var output = new Map();
            if (choices.indexOf('json_file:') === 0) {
                parsed = false;
                list_action = choices.replace('json_file:', '');
                output.set('0', pydio.MessageHash['ajxp_admin.home.6']);
                PydioApi.getClient().loadFile(list_action, function (transport) {
                    var newOutput = new Map();
                    if (transport.responseJSON) {
                        transport.responseJSON.forEach(function (entry) {
                            newOutput.set(entry.key, entry.label);
                        });
                    } else if (transport.responseText) {
                        try {
                            JSON.parse(transport.responseText).forEach(function (entry) {
                                newOutput.set(entry.key, entry.label);
                            });
                        } catch (e) {
                            console.log('Error while parsing list ' + choices, e);
                        }
                    }
                    _this.setState({ choices: newOutput }, function () {
                        if (_this.onChoicesLoaded) {
                            _this.onChoicesLoaded(newOutput);
                        }
                    });
                });
            } else if (choices === "PYDIO_AVAILABLE_LANGUAGES") {
                pydio.listLanguagesWithCallback(function (key, label) {
                    output.set(key, label);
                });
                if (this.onChoicesLoaded) this.onChoicesLoaded(output);
            } else if (choices === "PYDIO_AVAILABLE_REPOSITORIES") {
                if (pydio.user) {
                    (function () {
                        var sorter = [];
                        var pages = [];
                        pydio.user.repositories.forEach(function (repository) {
                            if (repository.getId() === 'settings' || repository.getId() === 'homepage') {
                                pages.push({ id: repository.getId(), label: '[' + pydio.MessageHash['331'] + '] ' + repository.getLabel() });
                            } else if (repository.getRepositoryType() !== "cell") {
                                sorter.push({ id: repository.getId(), label: repository.getLabel() });
                            }
                        });
                        sorter.sort(function (a, b) {
                            return a.label.localeCompare(b.label, undefined, { numeric: true });
                        });
                        sorter.push.apply(sorter, pages);
                        sorter.forEach(function (d) {
                            return output.set(d.id, d.label);
                        });
                    })();
                }
                if (this.onChoicesLoaded) {
                    this.onChoicesLoaded(output);
                }
            } else {
                // Parse string and return map
                choices.split(",").map(function (choice) {
                    var label = undefined,
                        value = undefined;
                    var l = choice.split('|');
                    if (l.length > 1) {
                        value = l[0];
                        label = l[1];
                    } else {
                        value = label = choice;
                    }
                    if (global.pydio.MessageHash[label]) label = global.pydio.MessageHash[label];
                    output.set(value, label);
                });
            }
            return { choices: output, parsed: parsed };
        };

        function FieldWithChoices(props, context) {
            _classCallCheck(this, FieldWithChoices);

            _Component.call(this, props, context);
            var choices = new Map();
            choices.set('0', this.props.pydio ? this.props.pydio.MessageHash['ajxp_admin.home.6'] : ' ... ');
            this.state = { choices: choices, choicesParsed: false };
        }

        FieldWithChoices.prototype.componentDidMount = function componentDidMount() {
            if (this.props.attributes['choices']) {
                var _loadExternalValues = this.loadExternalValues(this.props.attributes['choices']);

                var choices = _loadExternalValues.choices;
                var parsed = _loadExternalValues.parsed;

                this.setState({ choices: choices, choicesParsed: parsed });
            }
        };

        FieldWithChoices.prototype.componentWillReceiveProps = function componentWillReceiveProps(newProps) {
            if (newProps.attributes['choices'] && newProps.attributes['choices'] !== this.props.attributes['choices']) {
                var _loadExternalValues2 = this.loadExternalValues(newProps.attributes['choices']);

                var choices = _loadExternalValues2.choices;
                var parsed = _loadExternalValues2.parsed;

                this.setState({
                    choices: choices,
                    choicesParsed: parsed
                });
            }
        };

        FieldWithChoices.prototype.render = function render() {
            return React.createElement(PydioComponent, _extends({}, this.props, this.state));
        };

        return FieldWithChoices;
    })(Component);

    FieldWithChoices = PydioContextConsumer(FieldWithChoices);

    return FieldWithChoices;
};

module.exports = exports['default'];
