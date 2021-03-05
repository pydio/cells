(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioSoundManager = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _soundmanager2 = require('soundmanager2');

var _sm360PlayerScript360player = require('../../../sm/360-player/script/360player');

_soundmanager2.soundManager.setup({
    // path to directory containing SM2 SWF
    url: 'plugins/editor.soundmanager/sm/swf/',
    debugMode: true
});

var Player = (function (_React$Component) {
    _inherits(Player, _React$Component);

    function Player(props) {
        _classCallCheck(this, Player);

        _get(Object.getPrototypeOf(Player.prototype), 'constructor', this).call(this, props);

        _sm360PlayerScript360player.threeSixtyPlayer.config.autoPlay = props.autoPlay;

        _sm360PlayerScript360player.threeSixtyPlayer.config.scaleFont = navigator.userAgent.match(/msie/i) ? false : true;
        _sm360PlayerScript360player.threeSixtyPlayer.config.showHMSTime = true;

        // enable some spectrum stuffs
        _sm360PlayerScript360player.threeSixtyPlayer.config.useWaveformData = true;
        _sm360PlayerScript360player.threeSixtyPlayer.config.useEQData = true;
        var onFinish = props.onFinish;

        if (onFinish) {
            _sm360PlayerScript360player.threeSixtyPlayer.config.onfinish = onFinish;
        }

        // enable this in SM2 as well, as needed
        if (_sm360PlayerScript360player.threeSixtyPlayer.config.useWaveformData) {
            _soundmanager2.soundManager.flash9Options.useWaveformData = true;
        }
        if (_sm360PlayerScript360player.threeSixtyPlayer.config.useEQData) {
            _soundmanager2.soundManager.flash9Options.useEQData = true;
        }
        if (_sm360PlayerScript360player.threeSixtyPlayer.config.usePeakData) {
            _soundmanager2.soundManager.flash9Options.usePeakData = true;
        }

        if (_sm360PlayerScript360player.threeSixtyPlayer.config.useWaveformData || _sm360PlayerScript360player.threeSixtyPlayer.flash9Options.useEQData || _sm360PlayerScript360player.threeSixtyPlayer.flash9Options.usePeakData) {
            // even if HTML5 supports MP3, prefer flash so the visualization features can be used.
            _soundmanager2.soundManager.preferFlash = true;
        }

        // favicon is expensive CPU-wise, but can be used.
        if (window.location.href.match(/hifi/i)) {
            _sm360PlayerScript360player.threeSixtyPlayer.config.useFavIcon = true;
        }

        if (window.location.href.match(/html5/i)) {
            // for testing IE 9, etc.
            _soundmanager2.soundManager.useHTML5Audio = true;
        }
    }

    _createClass(Player, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            _soundmanager2.soundManager.onready(_sm360PlayerScript360player.threeSixtyPlayer.init);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.props.onFinish) {
                _sm360PlayerScript360player.threeSixtyPlayer.config.onfinish = null;
            }
            _soundmanager2.soundManager.stopAll();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (this.props.onFinish) {
                _sm360PlayerScript360player.threeSixtyPlayer.config.onfinish = this.props.onFinish;
            }
            _soundmanager2.soundManager.onready(_sm360PlayerScript360player.threeSixtyPlayer.init);
        }
    }, {
        key: 'render',
        value: function render() {
            var className = "ui360";
            if (this.props.rich) {
                className += " ui360-vis";
            }

            return _react2['default'].createElement(
                'div',
                { className: className, style: this.props.style },
                this.props.children
            );
        }
    }]);

    return Player;
})(_react2['default'].Component);

Player.propTypes = {
    threeSixtyPlayer: _propTypes2['default'].object,
    autoPlay: _propTypes2['default'].bool,
    rich: _propTypes2['default'].bool.isRequired,
    onReady: _propTypes2['default'].func
};

Player.defaultProps = {
    autoPlay: false,
    rich: true
};

exports['default'] = Player;
module.exports = exports['default'];

},{"../../../sm/360-player/script/360player":6,"prop-types":"prop-types","react":"react","soundmanager2":7}],2:[function(require,module,exports){
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

var _Player = require('./Player');

var _Player2 = _interopRequireDefault(_Player);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

// The threeSixytPlayer is the same for all badges
var threeSixtyPlayer = new ThreeSixtyPlayer();

var Badge = (function (_Component) {
    _inherits(Badge, _Component);

    function Badge() {
        _classCallCheck(this, Badge);

        _get(Object.getPrototypeOf(Badge.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Badge, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadNode(this.props);

            threeSixtyPlayer.init();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.node !== this.props.node) {
                this.loadNode(nextProps);
            }
        }
    }, {
        key: 'loadNode',
        value: function loadNode(props) {
            var _this = this;

            var node = props.node;

            _pydioHttpApi2['default'].getClient().buildPresignedGetUrl(node, function (url) {
                _this.setState({
                    url: url,
                    mimeType: "audio/" + node.getAjxpMime()
                });
            }, "audio/" + node.getAjxpMime());
        }
    }, {
        key: 'render',
        value: function render() {
            var _ref = this.state || {};

            var mimeType = _ref.mimeType;
            var url = _ref.url;

            if (!url) return null;

            return _react2['default'].createElement(
                _Player2['default'],
                { rich: false, style: { width: 40, height: 40, margin: "auto" }, onReady: function () {} },
                _react2['default'].createElement('a', { type: mimeType, href: url })
            );
        }
    }]);

    return Badge;
})(_react.Component);

exports['default'] = Badge;

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
module.exports = exports['default'];

},{"./Player":1,"pydio/http/api":"pydio/http/api","react":"react"}],3:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _materialUi = require('material-ui');

var _Player = require('./Player');

var _Player2 = _interopRequireDefault(_Player);

var PydioApi = require('pydio/http/api');

var _Pydio$requireLib = _pydio2['default'].requireLib("hoc");

var withSelection = _Pydio$requireLib.withSelection;
var EditorActions = _Pydio$requireLib.EditorActions;
var withMenu = _Pydio$requireLib.withMenu;
var withLoader = _Pydio$requireLib.withLoader;
var withErrors = _Pydio$requireLib.withErrors;
var withControls = _Pydio$requireLib.withControls;

var editors = _pydio2['default'].getInstance().Registry.getActiveExtensionByType("editor");
var conf = editors.filter(function (_ref) {
    var id = _ref.id;
    return id === 'editor.soundmanager';
})[0];

var getSelectionFilter = function getSelectionFilter(node) {
    return conf.mimes.indexOf(node.getAjxpMime()) > -1;
};

var getSelection = function getSelection(node) {
    return new Promise(function (resolve, reject) {
        var selection = [];

        node.getParent().getChildren().forEach(function (child) {
            return selection.push(child);
        });
        selection = selection.filter(getSelectionFilter).sort(function (a, b) {
            return a.getLabel().localeCompare(b.getLabel(), undefined, { numeric: true });
        });

        resolve({
            selection: selection,
            currentIndex: selection.reduce(function (currentIndex, current, index) {
                return current === node && index || currentIndex;
            }, 0)
        });
    });
};

var styles = {
    container: {
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1
    },
    player: {
        margin: "auto"
    },
    table: {
        width: 320
    }
};

var Editor = (function (_Component) {
    _inherits(Editor, _Component);

    function Editor() {
        _classCallCheck(this, _Editor);

        _get(Object.getPrototypeOf(_Editor.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Editor, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadNode(this.props);
            var editorModify = this.props.editorModify;

            if (this.props.isActive) {
                editorModify({ fixedToolbar: false });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this = this;

            var editorModify = this.props.editorModify;

            if (nextProps.isActive) {
                editorModify({ fixedToolbar: false });
            }
            if (nextProps.node !== this.props.node) {
                this.setState({ url: '' }, function () {
                    _this.loadNode(nextProps);
                });
            }
        }
    }, {
        key: 'loadNode',
        value: function loadNode(props) {
            var _this2 = this;

            var node = props.node;

            PydioApi.getClient().buildPresignedGetUrl(node, function (url) {
                _this2.setState({
                    node: node,
                    url: url,
                    mimeType: "audio/" + node.getAjxpMime()
                });
            }, "audio/" + node.getAjxpMime());
        }
    }, {
        key: 'playNext',
        value: function playNext() {
            var selection = this.props.selection;
            var node = this.state.node;

            var index = selection.selection.indexOf(node);
            if (index < selection.selection.length - 1) {
                this.onRowSelection([index + 1]);
            }
        }
    }, {
        key: 'onRowSelection',
        value: function onRowSelection(data) {
            var _this3 = this;

            if (!data.length) return;
            var selection = this.props.selection;

            if (!selection) return;
            this.setState({ url: null }, function () {
                _this3.loadNode({ node: selection.selection[data[0]] });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _ref2 = this.state || {};

            var mimeType = _ref2.mimeType;
            var url = _ref2.url;
            var node = _ref2.node;

            return _react2['default'].createElement(
                'div',
                { style: styles.container },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 3, style: styles.player },
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '0 60px' } },
                        url && _react2['default'].createElement(
                            _Player2['default'],
                            { autoPlay: true, rich: !this.props.icon && this.props.rich, onReady: this.props.onLoad, onFinish: function () {
                                    _this4.playNext();
                                } },
                            _react2['default'].createElement('a', { type: mimeType, href: url })
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { clear: 'both' } },
                        _react2['default'].createElement(
                            _materialUi.Table,
                            {
                                style: styles.table,
                                selectable: true,
                                multiSelectable: false,
                                height: 250,
                                onRowSelection: function (data) {
                                    _this4.onRowSelection(data);
                                }
                            },
                            _react2['default'].createElement(
                                _materialUi.TableBody,
                                {
                                    displayRowCheckbox: false,
                                    stripedRows: false,
                                    deselectOnClickaway: false
                                },
                                this.props.selection && this.props.selection.selection.map(function (n, index) {
                                    return _react2['default'].createElement(
                                        _materialUi.TableRow,
                                        { key: index },
                                        _react2['default'].createElement(
                                            _materialUi.TableRowColumn,
                                            { style: { width: 16, backgroundColor: 'white' } },
                                            node && n.getPath() === node.getPath() ? _react2['default'].createElement('span', { className: "mdi mdi-play" }) : index
                                        ),
                                        _react2['default'].createElement(
                                            _materialUi.TableRowColumn,
                                            { style: { backgroundColor: 'white' } },
                                            n.getLabel()
                                        )
                                    );
                                })
                            )
                        )
                    )
                )
            );
        }
    }]);

    var _Editor = Editor;
    Editor = (0, _reactRedux.connect)(null, EditorActions)(Editor) || Editor;
    Editor = withSelection(getSelection)(Editor) || Editor;
    return Editor;
})(_react.Component);

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

exports['default'] = Editor;
module.exports = exports['default'];

},{"./Player":1,"material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","react":"react","react-redux":"react-redux","redux":"redux"}],4:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _badge = require('./badge');

exports.Badge = _interopRequire(_badge);

var _preview = require('./preview');

exports.Panel = _interopRequire(_preview);

var _editor = require('./editor');

exports.Editor = _interopRequire(_editor);

},{"./badge":2,"./editor":3,"./preview":5}],5:[function(require,module,exports){
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

var _Player = require('./Player');

var _Player2 = _interopRequireDefault(_Player);

var PydioApi = require('pydio/http/api');

// The threeSixytPlayer is the same for all badges
var threeSixtyPlayer = new ThreeSixtyPlayer();

var Preview = (function (_Component) {
    _inherits(Preview, _Component);

    function Preview() {
        _classCallCheck(this, Preview);

        _get(Object.getPrototypeOf(Preview.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Preview, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadNode(this.props);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.node !== this.props.node) {
                this.loadNode(nextProps);
            }
        }
    }, {
        key: 'loadNode',
        value: function loadNode(props) {
            var _this = this;

            var node = props.node;

            var mime = "audio/" + node.getAjxpMime();

            PydioApi.getClient().buildPresignedGetUrl(node, function (url) {
                _this.setState({
                    url: url,
                    mimeType: mime
                });
            }, mime);

            this.setState({
                url: node.getPath(),
                mimeType: "audio/" + node.getAjxpMime()
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _ref = this.state || {};

            var mimeType = _ref.mimeType;
            var url = _ref.url;

            if (!url) return null;

            return _react2['default'].createElement(
                _Player2['default'],
                { rich: true, style: { margin: "auto" }, onReady: function () {} },
                _react2['default'].createElement('a', { type: mimeType, href: url })
            );
        }
    }]);

    return Preview;
})(_react.Component);

exports['default'] = Preview;

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
module.exports = exports['default'];

},{"./Player":1,"pydio/http/api":"pydio/http/api","react":"react"}],6:[function(require,module,exports){
/**
 *
 * SoundManager 2 Demo: 360-degree / "donut player"
 * ------------------------------------------------
 * http://schillmania.com/projects/soundmanager2/
 *
 * An inline player with a circular UI.
 * Based on the original SM2 inline player.
 * Inspired by Apple's preview feature in the
 * iTunes music store (iPhone), among others.
 *
 * Requires SoundManager 2 Javascript API.
 * Also uses Bernie's Better Animation Class (BSD):
 * http://www.berniecode.com/writing/animator.html
 *
*/

/*jslint white: false, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: false, bitwise: true, regexp: false, newcap: true, immed: true */
/*global document, window, soundManager, navigator */

var threeSixtyPlayer, // instance
    ThreeSixtyPlayer; // constructor

(function(window, _undefined) {

function ThreeSixtyPlayer() {

  var self = this,
      pl = this,
      sm = soundManager, // soundManager instance
      uA = navigator.userAgent,
      isIE = (uA.match(/msie/i)),
      isOpera = (uA.match(/opera/i)),
      isSafari = (uA.match(/safari/i)),
      isChrome = (uA.match(/chrome/i)),
      isFirefox = (uA.match(/firefox/i)),
      isTouchDevice = (uA.match(/ipad|iphone/i)),
      hasRealCanvas = (typeof window.G_vmlCanvasManager === 'undefined' && typeof document.createElement('canvas').getContext('2d') !== 'undefined'),
      // I dunno what Opera doesn't like about this. I'm probably doing it wrong.
      fullCircle = (isOpera||isChrome?359.9:360);

  // CSS class for ignoring MP3 links
  this.excludeClass = 'threesixty-exclude';
  this.links = [];
  this.sounds = [];
  this.soundsByURL = {};
  this.indexByURL = {};
  this.lastSound = null;
  this.lastTouchedSound = null;
  this.soundCount = 0;
  this.oUITemplate = null;
  this.oUIImageMap = null;
  this.vuMeter = null;
  this.callbackCount = 0;
  this.peakDataHistory = [];

  // 360player configuration options
  this.config = {

    playNext: false,   // stop after one sound, or play through list until end
    autoPlay: false,   // start playing the first sound right away
    allowMultiple: false,  // let many sounds play at once (false = only one sound playing at a time)
    loadRingColor: '#ccc', // how much has loaded
    playRingColor: '#000', // how much has played
    backgroundRingColor: '#eee', // color shown underneath load + play ("not yet loaded" color)

    // optional segment/annotation (metadata) stuff..
    segmentRingColor: 'rgba(255,255,255,0.33)', // metadata/annotation (segment) colors
    segmentRingColorAlt: 'rgba(0,0,0,0.1)',
    loadRingColorMetadata: '#ddd', // "annotations" load color
    playRingColorMetadata: 'rgba(128,192,256,0.9)', // how much has played when metadata is present

    circleDiameter: null, // set dynamically according to values from CSS
    circleRadius: null,
    animDuration: 500,
    animTransition: window.Animator.tx.bouncy, // http://www.berniecode.com/writing/animator.html
    showHMSTime: false, // hours:minutes:seconds vs. seconds-only
    scaleFont: true,  // also set the font size (if possible) while animating the circle

    // optional: spectrum or EQ graph in canvas (not supported in IE <9, too slow via ExCanvas)
    useWaveformData: false,
    waveformDataColor: '#0099ff',
    waveformDataDownsample: 3, // use only one in X (of a set of 256 values) - 1 means all 256
    waveformDataOutside: false,
    waveformDataConstrain: false, // if true, +ve values only - keep within inside circle
    waveformDataLineRatio: 0.64,

    // "spectrum frequency" option
    useEQData: false,
    eqDataColor: '#339933',
    eqDataDownsample: 4, // use only one in X (of 256 values)
    eqDataOutside: true,
    eqDataLineRatio: 0.54,

    // enable "amplifier" (canvas pulses like a speaker) effect
    usePeakData: true,
    peakDataColor: '#ff33ff',
    peakDataOutside: true,
    peakDataLineRatio: 0.5,

    useAmplifier: true, // "pulse" like a speaker

    fontSizeMax: null, // set according to CSS

    useFavIcon: false // Experimental (also requires usePeakData: true).. Try to draw a "VU Meter" in the favicon area, if browser supports it (Firefox + Opera as of 2009)

  };

  this.css = {

    // CSS class names appended to link during various states
    sDefault: 'sm2_link', // default state
    sBuffering: 'sm2_buffering',
    sPlaying: 'sm2_playing',
    sPaused: 'sm2_paused'

  };

  this.addEventHandler = (typeof window.addEventListener !== 'undefined' ? function(o, evtName, evtHandler) {
    return o.addEventListener(evtName,evtHandler,false);
  } : function(o, evtName, evtHandler) {
    o.attachEvent('on'+evtName,evtHandler);
  });

  this.removeEventHandler = (typeof window.removeEventListener !== 'undefined' ? function(o, evtName, evtHandler) {
    return o.removeEventListener(evtName,evtHandler,false);
  } : function(o, evtName, evtHandler) {
    return o.detachEvent('on'+evtName,evtHandler);
  });

  this.hasClass = function(o,cStr) {
    return typeof(o.className)!=='undefined'?o.className.match(new RegExp('(\\s|^)'+cStr+'(\\s|$)')):false;
  };

  this.addClass = function(o,cStr) {

    if (!o || !cStr || self.hasClass(o,cStr)) {
      return false;
    }
    o.className = (o.className?o.className+' ':'')+cStr;

  };

  this.removeClass = function(o,cStr) {

    if (!o || !cStr || !self.hasClass(o,cStr)) {
      return false;
    }
    o.className = o.className.replace(new RegExp('( '+cStr+')|('+cStr+')','g'),'');

  };

  this.getElementsByClassName = function(className,tagNames,oParent) {

    var doc = (oParent||document),
        matches = [], i,j, nodes = [];
    if (typeof tagNames !== 'undefined' && typeof tagNames !== 'string') {
      for (i=tagNames.length; i--;) {
        if (!nodes || !nodes[tagNames[i]]) {
          nodes[tagNames[i]] = doc.getElementsByTagName(tagNames[i]);
        }
      }
    } else if (tagNames) {
      nodes = doc.getElementsByTagName(tagNames);
    } else {
      nodes = doc.all||doc.getElementsByTagName('*');
    }
    if (typeof(tagNames)!=='string') {
      for (i=tagNames.length; i--;) {
        for (j=nodes[tagNames[i]].length; j--;) {
          if (self.hasClass(nodes[tagNames[i]][j],className)) {
            matches.push(nodes[tagNames[i]][j]);
          }
        }
      }
    } else {
      for (i=0; i<nodes.length; i++) {
        if (self.hasClass(nodes[i],className)) {
          matches.push(nodes[i]);
        }
      }
    }
    return matches;

  };

  this.getParentByNodeName = function(oChild,sParentNodeName) {

    if (!oChild || !sParentNodeName) {
      return false;
    }
    sParentNodeName = sParentNodeName.toLowerCase();
    while (oChild.parentNode && sParentNodeName !== oChild.parentNode.nodeName.toLowerCase()) {
      oChild = oChild.parentNode;
    }
    return (oChild.parentNode && sParentNodeName === oChild.parentNode.nodeName.toLowerCase()?oChild.parentNode:null);

  };

  this.getParentByClassName = function(oChild,sParentClassName) {

    if (!oChild || !sParentClassName) {
      return false;
    }
    while (oChild.parentNode && !self.hasClass(oChild.parentNode,sParentClassName)) {
      oChild = oChild.parentNode;
    }
    return (oChild.parentNode && self.hasClass(oChild.parentNode,sParentClassName)?oChild.parentNode:null);

  };

  this.getSoundByURL = function(sURL) {
    return (typeof self.soundsByURL[sURL] !== 'undefined'?self.soundsByURL[sURL]:null);
  };

  this.isChildOfNode = function(o,sNodeName) {

    if (!o || !o.parentNode) {
      return false;
    }
    sNodeName = sNodeName.toLowerCase();
    do {
      o = o.parentNode;
    } while (o && o.parentNode && o.nodeName.toLowerCase() !== sNodeName);
    return (o && o.nodeName.toLowerCase() === sNodeName?o:null);

  };

  this.isChildOfClass = function(oChild,oClass) {

    if (!oChild || !oClass) {
      return false;
    }
    while (oChild.parentNode && !self.hasClass(oChild,oClass)) {
      oChild = self.findParent(oChild);
    }
    return (self.hasClass(oChild,oClass));

  };

  this.findParent = function(o) {

    if (!o || !o.parentNode) {
      return false;
    }
    o = o.parentNode;
    if (o.nodeType === 2) {
      while (o && o.parentNode && o.parentNode.nodeType === 2) {
        o = o.parentNode;
      }
    }
    return o;

  };

  this.getStyle = function(o,sProp) {

    // http://www.quirksmode.org/dom/getstyles.html
    try {
      if (o.currentStyle) {
        return o.currentStyle[sProp];
      } else if (window.getComputedStyle) {
        return document.defaultView.getComputedStyle(o,null).getPropertyValue(sProp);
      }
    } catch(e) {
      // oh well
    }
    return null;

  };

  this.findXY = function(obj) {

    var curleft = 0, curtop = 0;
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (!!(obj = obj.offsetParent));
    return [curleft,curtop];

  };

  this.getMouseXY = function(e) {

    // http://www.quirksmode.org/js/events_properties.html
    e = e?e:window.event;
    if (isTouchDevice && e.touches) {
      e = e.touches[0];
    }
    if (e.pageX || e.pageY) {
      return [e.pageX,e.pageY];
    } else if (e.clientX || e.clientY) {
      return [e.clientX+self.getScrollLeft(),e.clientY+self.getScrollTop()];
    }

  };

  this.getScrollLeft = function() {
    return (document.body.scrollLeft+document.documentElement.scrollLeft);
  };

  this.getScrollTop = function() {
    return (document.body.scrollTop+document.documentElement.scrollTop);
  };

  this.events = {

    // handlers for sound events as they're started/stopped/played

    play: function() {
        if(pl.config.onplay){
            pl.config.onplay(this);
        }
      pl.removeClass(this._360data.oUIBox,this._360data.className);
      this._360data.className = pl.css.sPlaying;
      pl.addClass(this._360data.oUIBox,this._360data.className);
      self.fanOut(this);
    },

    stop: function() {
        if(pl.config.onstop){
            pl.config.onstop(this);
        }
      pl.removeClass(this._360data.oUIBox,this._360data.className);
      this._360data.className = '';
      self.fanIn(this);
    },

    pause: function() {
        if(pl.config.onpause){
            pl.config.onpause(this);
        }
      pl.removeClass(this._360data.oUIBox,this._360data.className);
      this._360data.className = pl.css.sPaused;
      pl.addClass(this._360data.oUIBox,this._360data.className);
    },

    resume: function() {
        if(pl.config.onresume){
            pl.config.onresume(this);
        }
      pl.removeClass(this._360data.oUIBox,this._360data.className);
      this._360data.className = pl.css.sPlaying;
      pl.addClass(this._360data.oUIBox,this._360data.className);
    },

    finish: function() {
      var nextLink;
        if(pl.config.onfinish){
            pl.config.onfinish(this);
        }
      pl.removeClass(this._360data.oUIBox,this._360data.className);
      this._360data.className = '';
      // self.clearCanvas(this._360data.oCanvas);
      this._360data.didFinish = true; // so fan draws full circle
      self.fanIn(this);
      if (pl.config.playNext) {
        nextLink = (pl.indexByURL[this._360data.oLink.href]+1);
        if (nextLink<pl.links.length) {
          pl.handleClick({'target':pl.links[nextLink]});
        }
      }
    },

    whileloading: function() {
      if (this.paused) {
        self.updatePlaying.apply(this);
      }
    },

    whileplaying: function() {
      self.updatePlaying.apply(this);
      this._360data.fps++;
    },

    bufferchange: function() {
      if (this.isBuffering) {
        pl.addClass(this._360data.oUIBox,pl.css.sBuffering);
      } else {
        pl.removeClass(this._360data.oUIBox,pl.css.sBuffering);
      }
    }

  };

  this.stopEvent = function(e) {

   if (typeof e !== 'undefined' && typeof e.preventDefault !== 'undefined') {
      e.preventDefault();
    } else if (typeof window.event !== 'undefined' && typeof window.event.returnValue !== 'undefined') {
      window.event.returnValue = false;
    }
    return false;

  };

  this.getTheDamnLink = (isIE)?function(e) {
    // I really didn't want to have to do this.
    return (e && e.target?e.target:window.event.srcElement);
  }:function(e) {
    return e.target;
  };

  this.handleClick = function(e) {

    // a sound link was clicked
    if (e.button > 1) {
      // only catch left-clicks
      return true;
    }

    var o = self.getTheDamnLink(e),
        sURL, soundURL, thisSound, oContainer, has_vis, diameter;

    if (o.nodeName.toLowerCase() !== 'a') {
      o = self.isChildOfNode(o,'a');
      if (!o) {
        return true;
      }
    }

    if (!self.isChildOfClass(o,'ui360')) {
      // not a link we're interested in
      return true;
    }

    sURL = o.getAttribute('href');

    if (!o.href || !sm.canPlayLink(o) || self.hasClass(o,self.excludeClass)) {
      return true; // pass-thru for non-MP3/non-links
    }

    sm._writeDebug('handleClick()');
    soundURL = (o.href);
    thisSound = self.getSoundByURL(soundURL);

    if (thisSound) {

      // already exists
      if (thisSound === self.lastSound) {
        // and was playing (or paused)
        thisSound.togglePause();
      } else {
        // different sound
        thisSound.togglePause(); // start playing current
        sm._writeDebug('sound different than last sound: '+self.lastSound.sID);
        if (!self.config.allowMultiple && self.lastSound) {
          self.stopSound(self.lastSound);
        }
      }

    } else {

      // append some dom shiz, make noise

      oContainer = o.parentNode;
      has_vis = (self.getElementsByClassName('ui360-vis','div',oContainer.parentNode).length);

      // create sound
      thisSound = sm.createSound({
       id:'ui360Sound_'+parseInt(Math.random()*10000000),
       url:soundURL,
       onplay:self.events.play,
       onstop:self.events.stop,
       onpause:self.events.pause,
       onresume:self.events.resume,
       onfinish:self.events.finish,
       onbufferchange:self.events.bufferchange,
       whileloading:self.events.whileloading,
       whileplaying:self.events.whileplaying,
       useWaveformData:(has_vis && self.config.useWaveformData),
       useEQData:(has_vis && self.config.useEQData),
       usePeakData:(has_vis && self.config.usePeakData)
      });

      // tack on some custom data

      diameter = parseInt(self.getElementsByClassName('sm2-360ui','div',oContainer)[0].offsetWidth, 10);

      thisSound._360data = {
        oUI360: self.getParentByClassName(o,'ui360'), // the (whole) entire container
        oLink: o, // DOM node for reference within SM2 object event handlers
        className: self.css.sPlaying,
        oUIBox: self.getElementsByClassName('sm2-360ui','div',oContainer)[0],
        oCanvas: self.getElementsByClassName('sm2-canvas','canvas',oContainer)[0],
        oButton: self.getElementsByClassName('sm2-360btn','span',oContainer)[0],
        oTiming: self.getElementsByClassName('sm2-timing','div',oContainer)[0],
        oCover: self.getElementsByClassName('sm2-cover','div',oContainer)[0],
        circleDiameter: diameter,
        circleRadius: diameter/2,
        lastTime: null,
        didFinish: null,
        pauseCount:0,
        radius:0,
        fontSize: 1,
        fontSizeMax: self.config.fontSizeMax,
        scaleFont: (has_vis && self.config.scaleFont),
        showHMSTime: has_vis,
        amplifier: (has_vis && self.config.usePeakData?0.9:1), // TODO: x1 if not being used, else use dynamic "how much to amplify by" value
        radiusMax: diameter*0.175, // circle radius
        width:0,
        widthMax: diameter*0.4, // width of the outer ring
        lastValues: {
          bytesLoaded: 0,
          bytesTotal: 0,
          position: 0,
          durationEstimate: 0
        }, // used to track "last good known" values before sound finish/reset for anim
        animating: false,
        oAnim: new window.Animator({
          duration: self.config.animDuration,
          transition:self.config.animTransition,
          onComplete: function() {
            // var thisSound = this;
            // thisSound._360data.didFinish = false; // reset full circle
          }
        }),
        oAnimProgress: function(nProgress) {
          var thisSound = this;
          thisSound._360data.radius = parseInt(thisSound._360data.radiusMax*thisSound._360data.amplifier*nProgress, 10);
          thisSound._360data.width = parseInt(thisSound._360data.widthMax*thisSound._360data.amplifier*nProgress, 10);
          if (thisSound._360data.scaleFont && thisSound._360data.fontSizeMax !== null) {
            thisSound._360data.oTiming.style.fontSize = parseInt(Math.max(1,thisSound._360data.fontSizeMax*nProgress), 10)+'px';
            thisSound._360data.oTiming.style.opacity = nProgress;
          }
          if (thisSound.paused || thisSound.playState === 0 || thisSound._360data.lastValues.bytesLoaded === 0 || thisSound._360data.lastValues.position === 0) {
            self.updatePlaying.apply(thisSound);
          }
        },
        fps: 0
      };

      // "Metadata" (annotations)
      if (typeof self.Metadata !== 'undefined' && self.getElementsByClassName('metadata','div',thisSound._360data.oUI360).length) {
        thisSound._360data.metadata = new self.Metadata(thisSound,self);
      }

      // minimize ze font
      if (thisSound._360data.scaleFont && thisSound._360data.fontSizeMax !== null) {
        thisSound._360data.oTiming.style.fontSize = '1px';
      }

      // set up ze animation
      thisSound._360data.oAnim.addSubject(thisSound._360data.oAnimProgress,thisSound);

      // animate the radius out nice
      self.refreshCoords(thisSound);

      self.updatePlaying.apply(thisSound);

      self.soundsByURL[soundURL] = thisSound;
      self.sounds.push(thisSound);
      if (!self.config.allowMultiple && self.lastSound) {
        self.stopSound(self.lastSound);
      }
      thisSound.play();

    }

    self.lastSound = thisSound; // reference for next call

    if (typeof e !== 'undefined' && typeof e.preventDefault !== 'undefined') {
      e.preventDefault();
    } else if (typeof window.event !== 'undefined') {
      window.event.returnValue = false;
    }
    return false;

  };

  this.fanOut = function(oSound) {

     var thisSound = oSound;
     if (thisSound._360data.animating === 1) {
       return false;
     }
     thisSound._360data.animating = 0;
     soundManager._writeDebug('fanOut: '+thisSound.sID+': '+thisSound._360data.oLink.href);
     thisSound._360data.oAnim.seekTo(1); // play to end
     window.setTimeout(function() {
       // oncomplete hack
       thisSound._360data.animating = 0;
     },self.config.animDuration+20);

  };

  this.fanIn = function(oSound) {

     var thisSound = oSound;
     if (thisSound._360data.animating === -1) {
       return false;
     }
     thisSound._360data.animating = -1;
     soundManager._writeDebug('fanIn: '+thisSound.sID+': '+thisSound._360data.oLink.href);
     // massive hack
     thisSound._360data.oAnim.seekTo(0); // play to end
     window.setTimeout(function() {
       // reset full 360 fill after animation has completed (oncomplete hack)
       thisSound._360data.didFinish = false;
       thisSound._360data.animating = 0;
       self.resetLastValues(thisSound);
     }, self.config.animDuration+20);

  };

  this.resetLastValues = function(oSound) {
    oSound._360data.lastValues.position = 0;
  };

  this.refreshCoords = function(thisSound) {

    thisSound._360data.canvasXY = self.findXY(thisSound._360data.oCanvas);
    thisSound._360data.canvasMid = [thisSound._360data.circleRadius,thisSound._360data.circleRadius];
    thisSound._360data.canvasMidXY = [thisSound._360data.canvasXY[0]+thisSound._360data.canvasMid[0], thisSound._360data.canvasXY[1]+thisSound._360data.canvasMid[1]];

  };

  this.stopSound = function(oSound) {

    soundManager._writeDebug('stopSound: '+oSound.sID);
    soundManager.stop(oSound.sID);
    if (!isTouchDevice) { // iOS 4.2+ security blocks onfinish() -> playNext() if we set a .src in-between(?)
      soundManager.unload(oSound.sID);
    }

  };

  this.buttonClick = function(e) {

    var o = e?(e.target?e.target:e.srcElement):window.event.srcElement;
    self.handleClick({target:self.getParentByClassName(o,'sm2-360ui').nextSibling}); // link next to the nodes we inserted
    return false;

  };

  this.buttonMouseDown = function(e) {

    // user might decide to drag from here
    // watch for mouse move
    if (!isTouchDevice) {
      document.onmousemove = function(e) {
        // should be boundary-checked, really (eg. move 3px first?)
        self.mouseDown(e);
      };
    } else {
      self.addEventHandler(document,'touchmove',self.mouseDown);
    }
    self.stopEvent(e);
    return false;

  };

  this.mouseDown = function(e) {

    if (!isTouchDevice && e.button > 1) {
      return true; // ignore non-left-click
    }

    if (!self.lastSound) {
      self.stopEvent(e);
      return false;
    }

    var evt = e?e:window.event,
        target, thisSound, oData;

    if (isTouchDevice && evt.touches) {
      evt = evt.touches[0];
    }
    target = (evt.target||evt.srcElement);

    thisSound = self.getSoundByURL(self.getElementsByClassName('sm2_link','a',self.getParentByClassName(target,'ui360'))[0].href); // self.lastSound; // TODO: In multiple sound case, figure out which sound is involved etc.
    // just in case, update coordinates (maybe the element moved since last time.)
    self.lastTouchedSound = thisSound;
    self.refreshCoords(thisSound);
    oData = thisSound._360data;
    self.addClass(oData.oUIBox,'sm2_dragging');
    oData.pauseCount = (self.lastTouchedSound.paused?1:0);
    // self.lastSound.pause();
    self.mmh(e?e:window.event);

    if (isTouchDevice) {
      self.removeEventHandler(document,'touchmove',self.mouseDown);
      self.addEventHandler(document,'touchmove',self.mmh);
      self.addEventHandler(document,'touchend',self.mouseUp);
    } else {
      // incredibly old-skool. TODO: Modernize.
      document.onmousemove = self.mmh;
      document.onmouseup = self.mouseUp;
    }

    self.stopEvent(e);
    return false;

  };

  this.mouseUp = function(e) {

    var oData = self.lastTouchedSound._360data;
    self.removeClass(oData.oUIBox,'sm2_dragging');
    if (oData.pauseCount === 0) {
      self.lastTouchedSound.resume();
    }
    if (!isTouchDevice) {
      document.onmousemove = null;
      document.onmouseup = null;
    } else {
      self.removeEventHandler(document,'touchmove',self.mmh);
      self.removeEventHandler(document,'touchend',self.mouseUP);
    }

  };

  this.mmh = function(e) {

    if (typeof e === 'undefined') {
      e = window.event;
    }
    var oSound = self.lastTouchedSound,
        coords = self.getMouseXY(e),
        x = coords[0],
        y = coords[1],
        deltaX = x-oSound._360data.canvasMidXY[0],
        deltaY = y-oSound._360data.canvasMidXY[1],
        angle = Math.floor(fullCircle-(self.rad2deg(Math.atan2(deltaX,deltaY))+180));

    oSound.setPosition(oSound.durationEstimate*(angle/fullCircle));
    self.stopEvent(e);
    return false;

  };

  // assignMouseDown();

  this.drawSolidArc = function(oCanvas, color, radius, width, radians, startAngle, noClear) {

    // thank you, http://www.snipersystems.co.nz/community/polarclock/tutorial.html

    var x = radius,
        y = radius,
        canvas = oCanvas,
        ctx, innerRadius, doesntLikeZero, endPoint;

    if (canvas.getContext){
      // use getContext to use the canvas for drawing
      ctx = canvas.getContext('2d');
    }

    // re-assign canvas as the actual context
    oCanvas = ctx;

    if (!noClear) {
      self.clearCanvas(canvas);
    }
    // ctx.restore();

    if (color) {
      ctx.fillStyle = color;
    }

    oCanvas.beginPath();

    if (isNaN(radians)) {
      radians = 0;
    }

    innerRadius = radius-width;
    doesntLikeZero = (isOpera || isSafari); // safari 4 doesn't actually seem to mind.

    if (!doesntLikeZero || (doesntLikeZero && radius > 0)) {
      oCanvas.arc(0, 0, radius, startAngle, radians, false);
      endPoint = self.getArcEndpointCoords(innerRadius, radians);
      oCanvas.lineTo(endPoint.x, endPoint.y);
      oCanvas.arc(0, 0, innerRadius, radians, startAngle, true);
      oCanvas.closePath();
      oCanvas.fill();
    }

  };

  this.getArcEndpointCoords = function(radius, radians) {

    return {
      x: radius * Math.cos(radians),
      y: radius * Math.sin(radians)
    };

  };

  this.deg2rad = function(nDeg) {
    return (nDeg * Math.PI/180);
  };

  this.rad2deg = function(nRad) {
    return (nRad * 180/Math.PI);
  };

  this.getTime = function(nMSec,bAsString) {

    // convert milliseconds to mm:ss, return as object literal or string
    var nSec = Math.floor(nMSec/1000),
        min = Math.floor(nSec/60),
        sec = nSec-(min*60);
    // if (min === 0 && sec === 0) return null; // return 0:00 as null
    return (bAsString?(min+':'+(sec<10?'0'+sec:sec)):{'min':min,'sec':sec});

  };

  this.clearCanvas = function(oCanvas) {

    var canvas = oCanvas,
        ctx = null,
        width, height;
    if (canvas.getContext){
      // use getContext to use the canvas for drawing
      ctx = canvas.getContext('2d');
    }
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    ctx.clearRect(-(width/2), -(height/2), width, height);

  };

  this.updatePlaying = function() {

    var timeNow = (this._360data.showHMSTime?self.getTime(this.position,true):parseInt(this.position/1000, 10));

    if (this.bytesLoaded) {
      this._360data.lastValues.bytesLoaded = this.bytesLoaded;
      this._360data.lastValues.bytesTotal = this.bytesTotal;
    }

    if (this.position) {
      this._360data.lastValues.position = this.position;
    }

    if (this.durationEstimate) {
      this._360data.lastValues.durationEstimate = this.durationEstimate;
    }

    self.drawSolidArc(this._360data.oCanvas,self.config.backgroundRingColor,this._360data.width,this._360data.radius,self.deg2rad(fullCircle),false);

    self.drawSolidArc(this._360data.oCanvas,(this._360data.metadata?self.config.loadRingColorMetadata:self.config.loadRingColor),this._360data.width,this._360data.radius,self.deg2rad(fullCircle*(this._360data.lastValues.bytesLoaded/this._360data.lastValues.bytesTotal)),0,true);

    // don't draw if 0 (full black circle in Opera)
    if (this._360data.lastValues.position !== 0) {
      self.drawSolidArc(this._360data.oCanvas,(this._360data.metadata?self.config.playRingColorMetadata:self.config.playRingColor),this._360data.width,this._360data.radius,self.deg2rad((this._360data.didFinish===1?fullCircle:fullCircle*(this._360data.lastValues.position/this._360data.lastValues.durationEstimate))),0,true);
    }

    // metadata goes here
    if (this._360data.metadata) {
      this._360data.metadata.events.whileplaying();
    }

    if (timeNow !== this._360data.lastTime) {
      this._360data.lastTime = timeNow;
      this._360data.oTiming.innerHTML = timeNow;
    }

    // draw spectrum, if applicable
    if ((this.instanceOptions.useWaveformData || this.instanceOptions.useEQData) && hasRealCanvas) { // IE <9 can render maybe 3 or 4 FPS when including the wave/EQ, so don't bother.
      self.updateWaveform(this);
    }

    if (self.config.useFavIcon && self.vuMeter) {
      self.vuMeter.updateVU(this);
    }

  };

  this.updateWaveform = function(oSound) {

    if ((!self.config.useWaveformData && !self.config.useEQData) || (!sm.features.waveformData && !sm.features.eqData)) {
      // feature not enabled..
      return false;
    }

    if (!oSound.waveformData.left.length && !oSound.eqData.length && !oSound.peakData.left) {
      // no data (or errored out/paused/unavailable?)
      return false;
    }

    /* use for testing the data */
    /*
     for (i=0; i<256; i++) {
       oSound.eqData[i] = 1-(i/256);
     }
    */

    var oCanvas = oSound._360data.oCanvas.getContext('2d'),
        offX = 0,
        offY = parseInt(oSound._360data.circleDiameter/2, 10),
        scale = offY/2, // Y axis (+/- this distance from 0)
        // lineWidth = Math.floor(oSound._360data.circleDiameter-(oSound._360data.circleDiameter*0.175)/(oSound._360data.circleDiameter/255)); // width for each line
        lineWidth = 1,
        lineHeight = 1,
        thisY = 0,
        offset = offY,
        i, j, direction, downSample, dataLength, sampleCount, startAngle, endAngle, waveData, innerRadius, perItemAngle, yDiff, eqSamples, playedAngle, iAvg, nPeak;

    if (self.config.useWaveformData) {
      // raw waveform
      downSample = self.config.waveformDataDownsample; // only sample X in 256 (greater number = less sample points)
      downSample = Math.max(1,downSample); // make sure it's at least 1
      dataLength = 256;
      sampleCount = (dataLength/downSample);
      startAngle = 0;
      endAngle = 0;
      waveData = null;
      innerRadius = (self.config.waveformDataOutside?1:(self.config.waveformDataConstrain?0.5:0.565));
      scale = (self.config.waveformDataOutside?0.7:0.75);
      perItemAngle = self.deg2rad((360/sampleCount)*self.config.waveformDataLineRatio); // 0.85 = clean pixel lines at 150? // self.deg2rad(360*(Math.max(1,downSample-1))/sampleCount);
      for (i=0; i<dataLength; i+=downSample) {
        startAngle = self.deg2rad(360*(i/(sampleCount)*1/downSample)); // +0.67 - counter for spacing
        endAngle = startAngle+perItemAngle;
        waveData = oSound.waveformData.left[i];
        if (waveData<0 && self.config.waveformDataConstrain) {
          waveData = Math.abs(waveData);
        }
        self.drawSolidArc(oSound._360data.oCanvas,self.config.waveformDataColor,oSound._360data.width*innerRadius,oSound._360data.radius*scale*1.25*waveData,endAngle,startAngle,true);
      }
    }

    if (self.config.useEQData) {
      // EQ spectrum
      downSample = self.config.eqDataDownsample; // only sample N in 256
      yDiff = 0;
      downSample = Math.max(1,downSample); // make sure it's at least 1
      eqSamples = 192; // drop the last 25% of the spectrum (>16500 Hz), most stuff won't actually use it.
      sampleCount = (eqSamples/downSample);
      innerRadius = (self.config.eqDataOutside?1:0.565);
      direction = (self.config.eqDataOutside?-1:1);
      scale = (self.config.eqDataOutside?0.5:0.75);
      startAngle = 0;
      endAngle = 0;
      perItemAngle = self.deg2rad((360/sampleCount)*self.config.eqDataLineRatio); // self.deg2rad(360/(sampleCount+1));
      playedAngle = self.deg2rad((oSound._360data.didFinish===1?360:360*(oSound._360data.lastValues.position/oSound._360data.lastValues.durationEstimate)));
      j=0;
      iAvg = 0;
      for (i=0; i<eqSamples; i+=downSample) {
        startAngle = self.deg2rad(360*(i/eqSamples));
        endAngle = startAngle+perItemAngle;
        self.drawSolidArc(oSound._360data.oCanvas,(endAngle>playedAngle?self.config.eqDataColor:self.config.playRingColor),oSound._360data.width*innerRadius,oSound._360data.radius*scale*(oSound.eqData.left[i]*direction),endAngle,startAngle,true);
      }
    }

    if (self.config.usePeakData) {
      if (!oSound._360data.animating) {
        nPeak = (oSound.peakData.left||oSound.peakData.right);
        // GIANT HACK: use EQ spectrum data for bass frequencies
        eqSamples = 3;
        for (i=0; i<eqSamples; i++) {
          nPeak = (nPeak||oSound.eqData[i]);
        }
        oSound._360data.amplifier = (self.config.useAmplifier?(0.9+(nPeak*0.1)):1);
        oSound._360data.radiusMax = oSound._360data.circleDiameter*0.175*oSound._360data.amplifier;
        oSound._360data.widthMax = oSound._360data.circleDiameter*0.4*oSound._360data.amplifier;
        oSound._360data.radius = parseInt(oSound._360data.radiusMax*oSound._360data.amplifier, 10);
        oSound._360data.width = parseInt(oSound._360data.widthMax*oSound._360data.amplifier, 10);
      }
    }

  };

  this.getUIHTML = function(diameter) {

    return [
     '<canvas class="sm2-canvas" width="'+diameter+'" height="'+diameter+'"></canvas>',
     ' <span class="sm2-360btn sm2-360btn-default"></span>', // note use of imageMap, edit or remove if you use a different-size image.
     ' <div class="sm2-timing'+(navigator.userAgent.match(/safari/i)?' alignTweak':'')+'"></div>', // + Ever-so-slight Safari horizontal alignment tweak
     ' <div class="sm2-cover"></div>'
    ];

  };

  this.uiTest = function(sClass) {

    // fake a 360 UI so we can get some numbers from CSS, etc.

    var oTemplate = document.createElement('div'),
        oFakeUI, oFakeUIBox, oTemp, fakeDiameter, uiHTML, circleDiameter, circleRadius, fontSizeMax, oTiming;

    oTemplate.className = 'sm2-360ui';

    oFakeUI = document.createElement('div');
    oFakeUI.className = 'ui360'+(sClass?' '+sClass:''); // ui360 ui360-vis

    oFakeUIBox = oFakeUI.appendChild(oTemplate.cloneNode(true));

    oFakeUI.style.position = 'absolute';
    oFakeUI.style.left = '-9999px';

    oTemp = document.body.appendChild(oFakeUI);

    fakeDiameter = oFakeUIBox.offsetWidth;

    uiHTML = self.getUIHTML(fakeDiameter);

    oFakeUIBox.innerHTML = uiHTML[1]+uiHTML[2]+uiHTML[3];

    circleDiameter = parseInt(oFakeUIBox.offsetWidth, 10);
    circleRadius = parseInt(circleDiameter/2, 10);

    oTiming = self.getElementsByClassName('sm2-timing','div',oTemp)[0];
    fontSizeMax = parseInt(self.getStyle(oTiming,'font-size'), 10);
    if (isNaN(fontSizeMax)) {
      // getStyle() etc. didn't work.
      fontSizeMax = null;
    }

    // soundManager._writeDebug('diameter, font size: '+circleDiameter+','+fontSizeMax);

    oFakeUI.parentNode.removeChild(oFakeUI);

    uiHTML = oFakeUI = oFakeUIBox = oTemp = null;

    return {
      circleDiameter: circleDiameter,
      circleRadius: circleRadius,
      fontSizeMax: fontSizeMax
    };

  };

  this.init = function() {

    sm._writeDebug('threeSixtyPlayer.init()');

      if(self.config.items){
          var oItems = self.config.items;
      }else{
          var oItems = self.getElementsByClassName('ui360','div');
      }
    var i, j, oLinks = [], is_vis = false, foundItems = 0, oCanvas, oCanvasCTX, oCover, diameter, radius, uiData, uiDataVis, oUI, oBtn, o, o2, oID;

    for (i=0,j=oItems.length; i<j; i++) {
      oLinks.push(oItems[i].getElementsByTagName('a')[0]);
      // remove "fake" play button (unsupported case)
      oItems[i].style.backgroundImage = 'none';
    }
    // grab all links, look for .mp3

    self.oUITemplate = document.createElement('div');
    self.oUITemplate.className = 'sm2-360ui';

    self.oUITemplateVis = document.createElement('div');
    self.oUITemplateVis.className = 'sm2-360ui';

    uiData = self.uiTest();

    self.config.circleDiameter = uiData.circleDiameter;
    self.config.circleRadius = uiData.circleRadius;
    // self.config.fontSizeMax = uiData.fontSizeMax;

    uiDataVis = self.uiTest('ui360-vis');

    self.config.fontSizeMax = uiDataVis.fontSizeMax;

    // canvas needs inline width and height, doesn't quite work otherwise
    self.oUITemplate.innerHTML = self.getUIHTML(self.config.circleDiameter).join('');

    self.oUITemplateVis.innerHTML = self.getUIHTML(uiDataVis.circleDiameter).join('');

    for (i=0,j=oLinks.length; i<j; i++) {
      if (sm.canPlayLink(oLinks[i]) && !self.hasClass(oLinks[i],self.excludeClass) && !self.hasClass(oLinks[i],self.css.sDefault)) {
        self.addClass(oLinks[i],self.css.sDefault); // add default CSS decoration
        self.links[foundItems] = (oLinks[i]);
        self.indexByURL[oLinks[i].href] = foundItems; // hack for indexing
        foundItems++;

        is_vis = self.hasClass(oLinks[i].parentNode, 'ui360-vis');

        diameter = (is_vis ? uiDataVis : uiData).circleDiameter;
        radius = (is_vis ? uiDataVis : uiData).circleRadius;

        // add canvas shiz
        oUI = oLinks[i].parentNode.insertBefore((is_vis?self.oUITemplateVis:self.oUITemplate).cloneNode(true),oLinks[i]);

        if (isIE && typeof window.G_vmlCanvasManager !== 'undefined') { // IE only
          o = oLinks[i].parentNode;
          o2 = document.createElement('canvas');
          o2.className = 'sm2-canvas';
          oID = 'sm2_canvas_'+parseInt(Math.random()*1048576, 10);
          o2.id = oID;
          o2.width = diameter;
          o2.height = diameter;
          oUI.appendChild(o2);
          window.G_vmlCanvasManager.initElement(o2); // Apply ExCanvas compatibility magic
          oCanvas = document.getElementById(oID);
        } else {
          // add a handler for the button
          oCanvas = oLinks[i].parentNode.getElementsByTagName('canvas')[0];
        }
        oCover = self.getElementsByClassName('sm2-cover','div',oLinks[i].parentNode)[0];
        oBtn = oLinks[i].parentNode.getElementsByTagName('span')[0];
        self.addEventHandler(oBtn,'click',self.buttonClick);
        if (!isTouchDevice) {
          self.addEventHandler(oCover,'mousedown',self.mouseDown);
        } else {
          self.addEventHandler(oCover,'touchstart',self.mouseDown);
        }
        oCanvasCTX = oCanvas.getContext('2d');
        oCanvasCTX.translate(radius, radius);
        oCanvasCTX.rotate(self.deg2rad(-90)); // compensate for arc starting at EAST // http://stackoverflow.com/questions/319267/tutorial-for-html-canvass-arc-function
      }
    }
    if (foundItems>0) {
      self.addEventHandler(document,'click',self.handleClick);
      if (self.config.autoPlay) {
        self.handleClick({target:self.links[0],preventDefault:function(){}});
      }
    }
    sm._writeDebug('threeSixtyPlayer.init(): Found '+foundItems+' relevant items.');

    if (self.config.useFavIcon && typeof this.VUMeter !== 'undefined') {
      this.vuMeter = new this.VUMeter(this);
    }

  };

}

// Optional: VU Meter component

ThreeSixtyPlayer.prototype.VUMeter = function(oParent) {

  var self = oParent,
      me = this,
      _head = document.getElementsByTagName('head')[0],
      isOpera = (navigator.userAgent.match(/opera/i)),
      isFirefox = (navigator.userAgent.match(/firefox/i));

  this.vuMeterData = [];
  this.vuDataCanvas = null;

  this.setPageIcon = function(sDataURL) {

    if (!self.config.useFavIcon || !self.config.usePeakData || !sDataURL) {
      return false;
    }

    var link = document.getElementById('sm2-favicon');
    if (link) {
      _head.removeChild(link);
      link = null;
    }
    if (!link) {
      link = document.createElement('link');
      link.id = 'sm2-favicon';
      link.rel = 'shortcut icon';
      link.type = 'image/png';
      link.href = sDataURL;
      document.getElementsByTagName('head')[0].appendChild(link);
    }

  };

  this.resetPageIcon = function() {

    if (!self.config.useFavIcon) {
      return false;
    }
    var link = document.getElementById('favicon');
    if (link) {
      link.href = '/favicon.ico';
    }

  };

  this.updateVU = function(oSound) {

    if (soundManager.flashVersion >= 9 && self.config.useFavIcon && self.config.usePeakData) {
      me.setPageIcon(me.vuMeterData[parseInt(16*oSound.peakData.left, 10)][parseInt(16*oSound.peakData.right, 10)]);
    }

  };

  this.createVUData = function() {

    var i=0, j=0,
        canvas = me.vuDataCanvas.getContext('2d'),
        vuGrad = canvas.createLinearGradient(0, 16, 0, 0),
        bgGrad = canvas.createLinearGradient(0, 16, 0, 0),
        outline = 'rgba(0,0,0,0.2)';

    vuGrad.addColorStop(0,'rgb(0,192,0)');
    vuGrad.addColorStop(0.30,'rgb(0,255,0)');
    vuGrad.addColorStop(0.625,'rgb(255,255,0)');
    vuGrad.addColorStop(0.85,'rgb(255,0,0)');
    bgGrad.addColorStop(0,outline);
    bgGrad.addColorStop(1,'rgba(0,0,0,0.5)');
    for (i=0; i<16; i++) {
      me.vuMeterData[i] = [];
    }
    for (i=0; i<16; i++) {
      for (j=0; j<16; j++) {
        // reset/erase canvas
        me.vuDataCanvas.setAttribute('width',16);
        me.vuDataCanvas.setAttribute('height',16);
        // draw new stuffs
        canvas.fillStyle = bgGrad;
        canvas.fillRect(0,0,7,15);
        canvas.fillRect(8,0,7,15);
        /*
        // shadow
        canvas.fillStyle = 'rgba(0,0,0,0.1)';
        canvas.fillRect(1,15-i,7,17-(17-i));
        canvas.fillRect(9,15-j,7,17-(17-j));
        */
        canvas.fillStyle = vuGrad;
        canvas.fillRect(0,15-i,7,16-(16-i));
        canvas.fillRect(8,15-j,7,16-(16-j));
        // and now, clear out some bits.
        canvas.clearRect(0,3,16,1);
        canvas.clearRect(0,7,16,1);
        canvas.clearRect(0,11,16,1);
        me.vuMeterData[i][j] = me.vuDataCanvas.toDataURL('image/png');
        // for debugging VU images
        /*
        var o = document.createElement('img');
        o.style.marginRight = '5px';
        o.src = vuMeterData[i][j];
        document.documentElement.appendChild(o);
        */
      }
    }

  };

  this.testCanvas = function() {

    // canvas + toDataURL();
    var c = document.createElement('canvas'),
        ctx = null, ok;
    if (!c || typeof c.getContext === 'undefined') {
      return null;
    }
    ctx = c.getContext('2d');
    if (!ctx || typeof c.toDataURL !== 'function') {
      return null;
    }
    // just in case..
    try {
      ok = c.toDataURL('image/png');
    } catch(e) {
      // no canvas or no toDataURL()
      return null;
    }
    // assume we're all good.
    return c;

  };

  this.init = function() {

    if (self.config.useFavIcon) {
      me.vuDataCanvas = me.testCanvas();
      if (me.vuDataCanvas && (isFirefox || isOpera)) {
        // these browsers support dynamically-updating the favicon
        me.createVUData();
      } else {
        // browser doesn't support doing this
        self.config.useFavIcon = false;
      }
    }

  };

  this.init();

};

// completely optional: Metadata/annotations/segments code

ThreeSixtyPlayer.prototype.Metadata = function(oSound, oParent) {

  soundManager._wD('Metadata()');

  var me = this,
      oBox = oSound._360data.oUI360,
      o = oBox.getElementsByTagName('ul')[0],
      oItems = o.getElementsByTagName('li'),
      isFirefox = (navigator.userAgent.match(/firefox/i)),
      isAlt = false, i, oDuration;

  this.lastWPExec = 0;
  this.refreshInterval = 250;
  this.totalTime = 0;

  this.events = {

    whileplaying: function() {

      var width = oSound._360data.width,
          radius = oSound._360data.radius,
          fullDuration = (oSound.durationEstimate||(me.totalTime*1000)),
          isAlt = null, i, j, d;

      for (i=0,j=me.data.length; i<j; i++) {
        isAlt = (i%2===0);
        oParent.drawSolidArc(oSound._360data.oCanvas,(isAlt?oParent.config.segmentRingColorAlt:oParent.config.segmentRingColor),isAlt?width:width, isAlt?radius/2:radius/2, oParent.deg2rad(360*(me.data[i].endTimeMS/fullDuration)), oParent.deg2rad(360*((me.data[i].startTimeMS||1)/fullDuration)), true);
      }
      d = new Date();
      if (d-me.lastWPExec>me.refreshInterval) {
        me.refresh();
        me.lastWPExec = d;
      }

    }

  };

  this.refresh = function() {

    // Display info as appropriate
    var i, j, index = null,
        now = oSound.position,
        metadata = oSound._360data.metadata.data;

    for (i=0, j=metadata.length; i<j; i++) {
      if (now >= metadata[i].startTimeMS && now <= metadata[i].endTimeMS) {
        index = i;
        break;
      }
    }
    if (index !== metadata.currentItem && index < metadata.length) {
      // update
      oSound._360data.oLink.innerHTML = metadata.mainTitle+' <span class="metadata"><span class="sm2_divider"> | </span><span class="sm2_metadata">'+metadata[index].title+'</span></span>';
      // self.setPageTitle(metadata[index].title+' | '+metadata.mainTitle);
      metadata.currentItem = index;
    }

  };

  this.strToTime = function(sTime) {
    var segments = sTime.split(':'),
        seconds = 0, i;
    for (i=segments.length; i--;) {
      seconds += parseInt(segments[i], 10)*Math.pow(60,segments.length-1-i); // hours, minutes
    }
    return seconds;
  };

  this.data = [];
  this.data.givenDuration = null;
  this.data.currentItem = null;
  this.data.mainTitle = oSound._360data.oLink.innerHTML;

  for (i=0; i<oItems.length; i++) {
    this.data[i] = {
      o: null,
      title: oItems[i].getElementsByTagName('p')[0].innerHTML,
      startTime: oItems[i].getElementsByTagName('span')[0].innerHTML,
      startSeconds: me.strToTime(oItems[i].getElementsByTagName('span')[0].innerHTML.replace(/[()]/g,'')),
      duration: 0,
      durationMS: null,
      startTimeMS: null,
      endTimeMS: null,
      oNote: null
    };
  }
  oDuration = oParent.getElementsByClassName('duration','div',oBox);
  this.data.givenDuration = (oDuration.length?me.strToTime(oDuration[0].innerHTML)*1000:0);
  for (i=0; i<this.data.length; i++) {
    this.data[i].duration = parseInt(this.data[i+1]?this.data[i+1].startSeconds:(me.data.givenDuration?me.data.givenDuration:oSound.durationEstimate)/1000, 10)-this.data[i].startSeconds;
    this.data[i].startTimeMS = this.data[i].startSeconds*1000;
    this.data[i].durationMS = this.data[i].duration*1000;
    this.data[i].endTimeMS = this.data[i].startTimeMS+this.data[i].durationMS;
    this.totalTime += this.data[i].duration;
  }

};

if (navigator.userAgent.match(/webkit/i) && navigator.userAgent.match(/mobile/i)) {
  // iPad, iPhone etc.
  soundManager.useHTML5Audio = true;
}

soundManager.debugMode = false;// (window.location.href.match(/debug=1/i)); // disable or enable debug output
soundManager.consoleOnly = true;
soundManager.flashVersion = 9;
soundManager.useHighPerformance = true;
soundManager.useFlashBlock = true;
soundManager.flashLoadTimeout = 0;

// soundManager.useFastPolling = true; // for more aggressive, faster UI updates (higher CPU use)

// FPS data, testing/debug only
if (soundManager.debugMode) {
  window.setInterval(function() {
    var p = window.threeSixtyPlayer;
    if (p && p.lastSound && p.lastSound._360data.fps && typeof window.isHome === 'undefined') {
      soundManager._writeDebug('fps: ~'+p.lastSound._360data.fps);
      p.lastSound._360data.fps = 0;
    }
  },1000);
}

// SM2_DEFER details: http://www.schillmania.com/projects/soundmanager2/doc/getstarted/#lazy-loading

if (window.SM2_DEFER === _undefined || !SM2_DEFER) {
  threeSixtyPlayer = new ThreeSixtyPlayer();
}

/**
 * SoundManager public interfaces
 * ------------------------------
 */

if (typeof module === 'object' && module && typeof module.exports === 'object') {

  /**
   * commonJS module
   */

  module.exports.ThreeSixtyPlayer = ThreeSixtyPlayer;
  module.exports.threeSixtyPlayer = threeSixtyPlayer;

} else if (typeof define === 'function' && define.amd) {

  define(function() {
    /**
     * Retrieve the global instance of SoundManager.
     * If a global instance does not exist it can be created using a callback.
     *
     * @param {Function} smBuilder Optional: Callback used to create a new SoundManager instance
     * @return {SoundManager} The global SoundManager instance
     */
    function getInstance(smBuilder) {
      if (!window.threeSixtyPlayer && smBuilder instanceof Function) {
        var instance = smBuilder(ThreeSixtyPlayer);
        if (instance instanceof ThreeSixtyPlayer) {
          window.threeSixtyPlayer = instance;
        }
      }
      return window.threeSixtyPlayer;
    }
    return {
      constructor: ThreeSixtyPlayer,
      getInstance: getInstance
    }
  });

}

// standard browser case

// constructor
window.ThreeSixtyPlayer = ThreeSixtyPlayer;

/**
 * note: SM2 requires a window global due to Flash, which makes calls to window.soundManager.
 * Flash may not always be needed, but this is not known until async init and SM2 may even "reboot" into Flash mode.
 */

// public API, flash callbacks etc.
window.threeSixtyPlayer = threeSixtyPlayer;

}(window));

},{}],7:[function(require,module,exports){
/** @license
 *
 * SoundManager 2: JavaScript Sound for the Web
 * ----------------------------------------------
 * http://schillmania.com/projects/soundmanager2/
 *
 * Copyright (c) 2007, Scott Schiller. All rights reserved.
 * Code provided under the BSD License:
 * http://schillmania.com/projects/soundmanager2/license.txt
 *
 * V2.97a.20150601
 */

/*global window, SM2_DEFER, sm2Debugger, console, document, navigator, setTimeout, setInterval, clearInterval, Audio, opera, module, define */
/*jslint regexp: true, sloppy: true, white: true, nomen: true, plusplus: true, todo: true */

/**
 * About this file
 * -------------------------------------------------------------------------------------
 * This is the fully-commented source version of the SoundManager 2 API,
 * recommended for use during development and testing.
 *
 * See soundmanager2-nodebug-jsmin.js for an optimized build (~11KB with gzip.)
 * http://schillmania.com/projects/soundmanager2/doc/getstarted/#basic-inclusion
 * Alternately, serve this file with gzip for 75% compression savings (~30KB over HTTP.)
 *
 * You may notice <d> and </d> comments in this source; these are delimiters for
 * debug blocks which are removed in the -nodebug builds, further optimizing code size.
 *
 * Also, as you may note: Whoa, reliable cross-platform/device audio support is hard! ;)
 */

(function(window, _undefined) {

"use strict";

if (!window || !window.document) {

  // Don't cross the [environment] streams. SM2 expects to be running in a browser, not under node.js etc.
  // Additionally, if a browser somehow manages to fail this test, as Egon said: "It would be bad."

  throw new Error('SoundManager requires a browser with window and document objects.');

}

var soundManager = null;

/**
 * The SoundManager constructor.
 *
 * @constructor
 * @param {string} smURL Optional: Path to SWF files
 * @param {string} smID Optional: The ID to use for the SWF container element
 * @this {SoundManager}
 * @return {SoundManager} The new SoundManager instance
 */

function SoundManager(smURL, smID) {

  /**
   * soundManager configuration options list
   * defines top-level configuration properties to be applied to the soundManager instance (eg. soundManager.flashVersion)
   * to set these properties, use the setup() method - eg., soundManager.setup({url: '/swf/', flashVersion: 9})
   */

  this.setupOptions = {

    'url': (smURL || null),             // path (directory) where SoundManager 2 SWFs exist, eg., /path/to/swfs/
    'flashVersion': 8,                  // flash build to use (8 or 9.) Some API features require 9.
    'debugMode': true,                  // enable debugging output (console.log() with HTML fallback)
    'debugFlash': false,                // enable debugging output inside SWF, troubleshoot Flash/browser issues
    'useConsole': true,                 // use console.log() if available (otherwise, writes to #soundmanager-debug element)
    'consoleOnly': true,                // if console is being used, do not create/write to #soundmanager-debug
    'waitForWindowLoad': false,         // force SM2 to wait for window.onload() before trying to call soundManager.onload()
    'bgColor': '#ffffff',               // SWF background color. N/A when wmode = 'transparent'
    'useHighPerformance': false,        // position:fixed flash movie can help increase js/flash speed, minimize lag
    'flashPollingInterval': null,       // msec affecting whileplaying/loading callback frequency. If null, default of 50 msec is used.
    'html5PollingInterval': null,       // msec affecting whileplaying() for HTML5 audio, excluding mobile devices. If null, native HTML5 update events are used.
    'flashLoadTimeout': 1000,           // msec to wait for flash movie to load before failing (0 = infinity)
    'wmode': null,                      // flash rendering mode - null, 'transparent', or 'opaque' (last two allow z-index to work)
    'allowScriptAccess': 'always',      // for scripting the SWF (object/embed property), 'always' or 'sameDomain'
    'useFlashBlock': false,             // *requires flashblock.css, see demos* - allow recovery from flash blockers. Wait indefinitely and apply timeout CSS to SWF, if applicable.
    'useHTML5Audio': true,              // use HTML5 Audio() where API is supported (most Safari, Chrome versions), Firefox (MP3/MP4 support varies.) Ideally, transparent vs. Flash API where possible.
    'forceUseGlobalHTML5Audio': false,  // if true, a single Audio() object is used for all sounds - and only one can play at a time.
    'ignoreMobileRestrictions': false,  // if true, SM2 will not apply global HTML5 audio rules to mobile UAs. iOS > 7 and WebViews may allow multiple Audio() instances.
    'html5Test': /^(probably|maybe)$/i, // HTML5 Audio() format support test. Use /^probably$/i; if you want to be more conservative.
    'preferFlash': false,               // overrides useHTML5audio, will use Flash for MP3/MP4/AAC if present. Potential option if HTML5 playback with these formats is quirky.
    'noSWFCache': false,                // if true, appends ?ts={date} to break aggressive SWF caching.
    'idPrefix': 'sound'                 // if an id is not provided to createSound(), this prefix is used for generated IDs - 'sound0', 'sound1' etc.

  };

  this.defaultOptions = {

    /**
     * the default configuration for sound objects made with createSound() and related methods
     * eg., volume, auto-load behaviour and so forth
     */

    'autoLoad': false,        // enable automatic loading (otherwise .load() will be called on demand with .play(), the latter being nicer on bandwidth - if you want to .load yourself, you also can)
    'autoPlay': false,        // enable playing of file as soon as possible (much faster if "stream" is true)
    'from': null,             // position to start playback within a sound (msec), default = beginning
    'loops': 1,               // how many times to repeat the sound (position will wrap around to 0, setPosition() will break out of loop when >0)
    'onid3': null,            // callback function for "ID3 data is added/available"
    'onload': null,           // callback function for "load finished"
    'whileloading': null,     // callback function for "download progress update" (X of Y bytes received)
    'onplay': null,           // callback for "play" start
    'onpause': null,          // callback for "pause"
    'onresume': null,         // callback for "resume" (pause toggle)
    'whileplaying': null,     // callback during play (position update)
    'onposition': null,       // object containing times and function callbacks for positions of interest
    'onstop': null,           // callback for "user stop"
    'onfailure': null,        // callback function for when playing fails
    'onfinish': null,         // callback function for "sound finished playing"
    'multiShot': true,        // let sounds "restart" or layer on top of each other when played multiple times, rather than one-shot/one at a time
    'multiShotEvents': false, // fire multiple sound events (currently onfinish() only) when multiShot is enabled
    'position': null,         // offset (milliseconds) to seek to within loaded sound data.
    'pan': 0,                 // "pan" settings, left-to-right, -100 to 100
    'stream': true,           // allows playing before entire file has loaded (recommended)
    'to': null,               // position to end playback within a sound (msec), default = end
    'type': null,             // MIME-like hint for file pattern / canPlay() tests, eg. audio/mp3
    'usePolicyFile': false,   // enable crossdomain.xml request for audio on remote domains (for ID3/waveform access)
    'volume': 100             // self-explanatory. 0-100, the latter being the max.

  };

  this.flash9Options = {

    /**
     * flash 9-only options,
     * merged into defaultOptions if flash 9 is being used
     */

    'isMovieStar': null,      // "MovieStar" MPEG4 audio mode. Null (default) = auto detect MP4, AAC etc. based on URL. true = force on, ignore URL
    'usePeakData': false,     // enable left/right channel peak (level) data
    'useWaveformData': false, // enable sound spectrum (raw waveform data) - NOTE: May increase CPU load.
    'useEQData': false,       // enable sound EQ (frequency spectrum data) - NOTE: May increase CPU load.
    'onbufferchange': null,   // callback for "isBuffering" property change
    'ondataerror': null       // callback for waveform/eq data access error (flash playing audio in other tabs/domains)

  };

  this.movieStarOptions = {

    /**
     * flash 9.0r115+ MPEG4 audio options,
     * merged into defaultOptions if flash 9+movieStar mode is enabled
     */

    'bufferTime': 3,          // seconds of data to buffer before playback begins (null = flash default of 0.1 seconds - if AAC playback is gappy, try increasing.)
    'serverURL': null,        // rtmp: FMS or FMIS server to connect to, required when requesting media via RTMP or one of its variants
    'onconnect': null,        // rtmp: callback for connection to flash media server
    'duration': null          // rtmp: song duration (msec)

  };

  this.audioFormats = {

    /**
     * determines HTML5 support + flash requirements.
     * if no support (via flash and/or HTML5) for a "required" format, SM2 will fail to start.
     * flash fallback is used for MP3 or MP4 if HTML5 can't play it (or if preferFlash = true)
     */

    'mp3': {
      'type': ['audio/mpeg; codecs="mp3"', 'audio/mpeg', 'audio/mp3', 'audio/MPA', 'audio/mpa-robust'],
      'required': true
    },

    'mp4': {
      'related': ['aac','m4a','m4b'], // additional formats under the MP4 container
      'type': ['audio/mp4; codecs="mp4a.40.2"', 'audio/aac', 'audio/x-m4a', 'audio/MP4A-LATM', 'audio/mpeg4-generic'],
      'required': false
    },

    'ogg': {
      'type': ['audio/ogg; codecs=vorbis'],
      'required': false
    },

    'opus': {
      'type': ['audio/ogg; codecs=opus', 'audio/opus'],
      'required': false
    },

    'wav': {
      'type': ['audio/wav; codecs="1"', 'audio/wav', 'audio/wave', 'audio/x-wav'],
      'required': false
    }

  };

  // HTML attributes (id + class names) for the SWF container

  this.movieID = 'sm2-container';
  this.id = (smID || 'sm2movie');

  this.debugID = 'soundmanager-debug';
  this.debugURLParam = /([#?&])debug=1/i;

  // dynamic attributes

  this.versionNumber = 'V2.97a.20150601';
  this.version = null;
  this.movieURL = null;
  this.altURL = null;
  this.swfLoaded = false;
  this.enabled = false;
  this.oMC = null;
  this.sounds = {};
  this.soundIDs = [];
  this.muted = false;
  this.didFlashBlock = false;
  this.filePattern = null;

  this.filePatterns = {
    'flash8': /\.mp3(\?.*)?$/i,
    'flash9': /\.mp3(\?.*)?$/i
  };

  // support indicators, set at init

  this.features = {
    'buffering': false,
    'peakData': false,
    'waveformData': false,
    'eqData': false,
    'movieStar': false
  };

  // flash sandbox info, used primarily in troubleshooting

  this.sandbox = {
    // <d>
    'type': null,
    'types': {
      'remote': 'remote (domain-based) rules',
      'localWithFile': 'local with file access (no internet access)',
      'localWithNetwork': 'local with network (internet access only, no local access)',
      'localTrusted': 'local, trusted (local+internet access)'
    },
    'description': null,
    'noRemote': null,
    'noLocal': null
    // </d>
  };

  /**
   * format support (html5/flash)
   * stores canPlayType() results based on audioFormats.
   * eg. { mp3: boolean, mp4: boolean }
   * treat as read-only.
   */

  this.html5 = {
    'usingFlash': null // set if/when flash fallback is needed
  };

  // file type support hash
  this.flash = {};

  // determined at init time
  this.html5Only = false;

  // used for special cases (eg. iPad/iPhone/palm OS?)
  this.ignoreFlash = false;

  /**
   * a few private internals (OK, a lot. :D)
   */

  var SMSound,
  sm2 = this, globalHTML5Audio = null, flash = null, sm = 'soundManager', smc = sm + ': ', h5 = 'HTML5::', id, ua = navigator.userAgent, wl = window.location.href.toString(), doc = document, doNothing, setProperties, init, fV, on_queue = [], debugOpen = true, debugTS, didAppend = false, appendSuccess = false, didInit = false, disabled = false, windowLoaded = false, _wDS, wdCount = 0, initComplete, mixin, assign, extraOptions, addOnEvent, processOnEvents, initUserOnload, delayWaitForEI, waitForEI, rebootIntoHTML5, setVersionInfo, handleFocus, strings, initMovie, domContentLoaded, winOnLoad, didDCLoaded, getDocument, createMovie, catchError, setPolling, initDebug, debugLevels = ['log', 'info', 'warn', 'error'], defaultFlashVersion = 8, disableObject, failSafely, normalizeMovieURL, oRemoved = null, oRemovedHTML = null, str, flashBlockHandler, getSWFCSS, swfCSS, toggleDebug, loopFix, policyFix, complain, idCheck, waitingForEI = false, initPending = false, startTimer, stopTimer, timerExecute, h5TimerCount = 0, h5IntervalTimer = null, parseURL, messages = [],
  canIgnoreFlash, needsFlash = null, featureCheck, html5OK, html5CanPlay, html5Ext, html5Unload, domContentLoadedIE, testHTML5, event, slice = Array.prototype.slice, useGlobalHTML5Audio = false, lastGlobalHTML5URL, hasFlash, detectFlash, badSafariFix, html5_events, showSupport, flushMessages, wrapCallback, idCounter = 0, didSetup, msecScale = 1000,
  is_iDevice = ua.match(/(ipad|iphone|ipod)/i), isAndroid = ua.match(/android/i), isIE = ua.match(/msie/i),
  isWebkit = ua.match(/webkit/i),
  isSafari = (ua.match(/safari/i) && !ua.match(/chrome/i)),
  isOpera = (ua.match(/opera/i)),
  mobileHTML5 = (ua.match(/(mobile|pre\/|xoom)/i) || is_iDevice || isAndroid),
  isBadSafari = (!wl.match(/usehtml5audio/i) && !wl.match(/sm2\-ignorebadua/i) && isSafari && !ua.match(/silk/i) && ua.match(/OS X 10_6_([3-7])/i)), // Safari 4 and 5 (excluding Kindle Fire, "Silk") occasionally fail to load/play HTML5 audio on Snow Leopard 10.6.3 through 10.6.7 due to bug(s) in QuickTime X and/or other underlying frameworks. :/ Confirmed bug. https://bugs.webkit.org/show_bug.cgi?id=32159
  hasConsole = (window.console !== _undefined && console.log !== _undefined),
  isFocused = (doc.hasFocus !== _undefined ? doc.hasFocus() : null),
  tryInitOnFocus = (isSafari && (doc.hasFocus === _undefined || !doc.hasFocus())),
  okToDisable = !tryInitOnFocus,
  flashMIME = /(mp3|mp4|mpa|m4a|m4b)/i,
  emptyURL = 'about:blank', // safe URL to unload, or load nothing from (flash 8 + most HTML5 UAs)
  emptyWAV = 'data:audio/wave;base64,/UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAD//w==', // tiny WAV for HTML5 unloading
  overHTTP = (doc.location ? doc.location.protocol.match(/http/i) : null),
  http = (!overHTTP ? 'http:/'+'/' : ''),
  // mp3, mp4, aac etc.
  netStreamMimeTypes = /^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|m4b|mp4v|3gp|3g2)\s*(?:$|;)/i,
  // Flash v9.0r115+ "moviestar" formats
  netStreamTypes = ['mpeg4', 'aac', 'flv', 'mov', 'mp4', 'm4v', 'f4v', 'm4a', 'm4b', 'mp4v', '3gp', '3g2'],
  netStreamPattern = new RegExp('\\.(' + netStreamTypes.join('|') + ')(\\?.*)?$', 'i');

  this.mimePattern = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i; // default mp3 set

  // use altURL if not "online"
  this.useAltURL = !overHTTP;

  swfCSS = {
    'swfBox': 'sm2-object-box',
    'swfDefault': 'movieContainer',
    'swfError': 'swf_error', // SWF loaded, but SM2 couldn't start (other error)
    'swfTimedout': 'swf_timedout',
    'swfLoaded': 'swf_loaded',
    'swfUnblocked': 'swf_unblocked', // or loaded OK
    'sm2Debug': 'sm2_debug',
    'highPerf': 'high_performance',
    'flashDebug': 'flash_debug'
  };

  /**
   * basic HTML5 Audio() support test
   * try...catch because of IE 9 "not implemented" nonsense
   * https://github.com/Modernizr/Modernizr/issues/224
   */

  this.hasHTML5 = (function() {
    try {
      // new Audio(null) for stupid Opera 9.64 case, which throws not_enough_arguments exception otherwise.
      return (Audio !== _undefined && (isOpera && opera !== _undefined && opera.version() < 10 ? new Audio(null) : new Audio()).canPlayType !== _undefined);
    } catch(e) {
      return false;
    }
  }());

  /**
   * Public SoundManager API
   * -----------------------
   */

  /**
   * Configures top-level soundManager properties.
   *
   * @param {object} options Option parameters, eg. { flashVersion: 9, url: '/path/to/swfs/' }
   * onready and ontimeout are also accepted parameters. call soundManager.setup() to see the full list.
   */

  this.setup = function(options) {

    var noURL = (!sm2.url);

    // warn if flash options have already been applied

    if (options !== _undefined && didInit && needsFlash && sm2.ok() && (options.flashVersion !== _undefined || options.url !== _undefined || options.html5Test !== _undefined)) {
      complain(str('setupLate'));
    }

    // TODO: defer: true?

    assign(options);

    if (!useGlobalHTML5Audio) {

      if (mobileHTML5) {

        // force the singleton HTML5 pattern on mobile, by default.
        if (!sm2.setupOptions.ignoreMobileRestrictions || sm2.setupOptions.forceUseGlobalHTML5Audio) {
          messages.push(strings.globalHTML5);
          useGlobalHTML5Audio = true;
        }

      } else {

        // only apply singleton HTML5 on desktop if forced.
        if (sm2.setupOptions.forceUseGlobalHTML5Audio) {
          messages.push(strings.globalHTML5);
          useGlobalHTML5Audio = true;
        }

      }

    }

    if (!didSetup && mobileHTML5) {

      if (sm2.setupOptions.ignoreMobileRestrictions) {
        
        messages.push(strings.ignoreMobile);
      
      } else {

        // prefer HTML5 for mobile + tablet-like devices, probably more reliable vs. flash at this point.

        // <d>
        if (!sm2.setupOptions.useHTML5Audio || sm2.setupOptions.preferFlash) {
          // notify that defaults are being changed.
          sm2._wD(strings.mobileUA);
        }
        // </d>

        sm2.setupOptions.useHTML5Audio = true;
        sm2.setupOptions.preferFlash = false;

        if (is_iDevice) {

          // no flash here.
          sm2.ignoreFlash = true;

        } else if ((isAndroid && !ua.match(/android\s2\.3/i)) || !isAndroid) {
        
          /**
           * Android devices tend to work better with a single audio instance, specifically for chained playback of sounds in sequence.
           * Common use case: exiting sound onfinish() -> createSound() -> play()
           * Presuming similar restrictions for other mobile, non-Android, non-iOS devices.
           */

          // <d>
          sm2._wD(strings.globalHTML5);
          // </d>

          useGlobalHTML5Audio = true;

        }

      }

    }

    // special case 1: "Late setup". SM2 loaded normally, but user didn't assign flash URL eg., setup({url:...}) before SM2 init. Treat as delayed init.

    if (options) {

      if (noURL && didDCLoaded && options.url !== _undefined) {
        sm2.beginDelayedInit();
      }

      // special case 2: If lazy-loading SM2 (DOMContentLoaded has already happened) and user calls setup() with url: parameter, try to init ASAP.

      if (!didDCLoaded && options.url !== _undefined && doc.readyState === 'complete') {
        setTimeout(domContentLoaded, 1);
      }

    }

    didSetup = true;

    return sm2;

  };

  this.ok = function() {

    return (needsFlash ? (didInit && !disabled) : (sm2.useHTML5Audio && sm2.hasHTML5));

  };

  this.supported = this.ok; // legacy

  this.getMovie = function(smID) {

    // safety net: some old browsers differ on SWF references, possibly related to ExternalInterface / flash version
    return id(smID) || doc[smID] || window[smID];

  };

  /**
   * Creates a SMSound sound object instance. Can also be overloaded, e.g., createSound('mySound', '/some.mp3');
   *
   * @param {object} oOptions Sound options (at minimum, url parameter is required.)
   * @return {object} SMSound The new SMSound object.
   */

  this.createSound = function(oOptions, _url) {

    var cs, cs_string, options, oSound = null;

    // <d>
    cs = sm + '.createSound(): ';
    cs_string = cs + str(!didInit ? 'notReady' : 'notOK');
    // </d>

    if (!didInit || !sm2.ok()) {
      complain(cs_string);
      return false;
    }

    if (_url !== _undefined) {
      // function overloading in JS! :) ... assume simple createSound(id, url) use case.
      oOptions = {
        'id': oOptions,
        'url': _url
      };
    }

    // inherit from defaultOptions
    options = mixin(oOptions);

    options.url = parseURL(options.url);

    // generate an id, if needed.
    if (options.id === _undefined) {
      options.id = sm2.setupOptions.idPrefix + (idCounter++);
    }

    // <d>
    if (options.id.toString().charAt(0).match(/^[0-9]$/)) {
      sm2._wD(cs + str('badID', options.id), 2);
    }

    sm2._wD(cs + options.id + (options.url ? ' (' + options.url + ')' : ''), 1);
    // </d>

    if (idCheck(options.id, true)) {
      sm2._wD(cs + options.id + ' exists', 1);
      return sm2.sounds[options.id];
    }

    function make() {

      options = loopFix(options);
      sm2.sounds[options.id] = new SMSound(options);
      sm2.soundIDs.push(options.id);
      return sm2.sounds[options.id];

    }

    if (html5OK(options)) {

      oSound = make();
      // <d>
      if (!sm2.html5Only) {
        sm2._wD(options.id + ': Using HTML5');
      }
      // </d>
      oSound._setup_html5(options);

    } else {

      if (sm2.html5Only) {
        sm2._wD(options.id + ': No HTML5 support for this sound, and no Flash. Exiting.');
        return make();
      }

      // TODO: Move HTML5/flash checks into generic URL parsing/handling function.

      if (sm2.html5.usingFlash && options.url && options.url.match(/data\:/i)) {
        // data: URIs not supported by Flash, either.
        sm2._wD(options.id + ': data: URIs not supported via Flash. Exiting.');
        return make();
      }

      if (fV > 8) {
        if (options.isMovieStar === null) {
          // attempt to detect MPEG-4 formats
          options.isMovieStar = !!(options.serverURL || (options.type ? options.type.match(netStreamMimeTypes) : false) || (options.url && options.url.match(netStreamPattern)));
        }
        // <d>
        if (options.isMovieStar) {
          sm2._wD(cs + 'using MovieStar handling');
          if (options.loops > 1) {
            _wDS('noNSLoop');
          }
        }
        // </d>
      }

      options = policyFix(options, cs);
      oSound = make();

      if (fV === 8) {
        flash._createSound(options.id, options.loops || 1, options.usePolicyFile);
      } else {
        flash._createSound(options.id, options.url, options.usePeakData, options.useWaveformData, options.useEQData, options.isMovieStar, (options.isMovieStar ? options.bufferTime : false), options.loops || 1, options.serverURL, options.duration || null, options.autoPlay, true, options.autoLoad, options.usePolicyFile);
        if (!options.serverURL) {
          // We are connected immediately
          oSound.connected = true;
          if (options.onconnect) {
            options.onconnect.apply(oSound);
          }
        }
      }

      if (!options.serverURL && (options.autoLoad || options.autoPlay)) {
        // call load for non-rtmp streams
        oSound.load(options);
      }

    }

    // rtmp will play in onconnect
    if (!options.serverURL && options.autoPlay) {
      oSound.play();
    }

    return oSound;

  };

  /**
   * Destroys a SMSound sound object instance.
   *
   * @param {string} sID The ID of the sound to destroy
   */

  this.destroySound = function(sID, _bFromSound) {

    // explicitly destroy a sound before normal page unload, etc.

    if (!idCheck(sID)) {
      return false;
    }

    var oS = sm2.sounds[sID], i;

    oS.stop();
    
    // Disable all callbacks after stop(), when the sound is being destroyed
    oS._iO = {};
    
    oS.unload();

    for (i = 0; i < sm2.soundIDs.length; i++) {
      if (sm2.soundIDs[i] === sID) {
        sm2.soundIDs.splice(i, 1);
        break;
      }
    }

    if (!_bFromSound) {
      // ignore if being called from SMSound instance
      oS.destruct(true);
    }

    oS = null;
    delete sm2.sounds[sID];

    return true;

  };

  /**
   * Calls the load() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {object} oOptions Optional: Sound options
   */

  this.load = function(sID, oOptions) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].load(oOptions);

  };

  /**
   * Calls the unload() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   */

  this.unload = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].unload();

  };

  /**
   * Calls the onPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPosition The position to watch for
   * @param {function} oMethod The relevant callback to fire
   * @param {object} oScope Optional: The scope to apply the callback to
   * @return {SMSound} The SMSound object
   */

  this.onPosition = function(sID, nPosition, oMethod, oScope) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].onposition(nPosition, oMethod, oScope);

  };

  // legacy/backwards-compability: lower-case method name
  this.onposition = this.onPosition;

  /**
   * Calls the clearOnPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPosition The position to watch for
   * @param {function} oMethod Optional: The relevant callback to fire
   * @return {SMSound} The SMSound object
   */

  this.clearOnPosition = function(sID, nPosition, oMethod) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].clearOnPosition(nPosition, oMethod);

  };

  /**
   * Calls the play() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {object} oOptions Optional: Sound options
   * @return {SMSound} The SMSound object
   */

  this.play = function(sID, oOptions) {

    var result = null,
        // legacy function-overloading use case: play('mySound', '/path/to/some.mp3');
        overloaded = (oOptions && !(oOptions instanceof Object));

    if (!didInit || !sm2.ok()) {
      complain(sm + '.play(): ' + str(!didInit?'notReady':'notOK'));
      return false;
    }

    if (!idCheck(sID, overloaded)) {

      if (!overloaded) {
        // no sound found for the given ID. Bail.
        return false;
      }

      if (overloaded) {
        oOptions = {
          url: oOptions
        };
      }

      if (oOptions && oOptions.url) {
        // overloading use case, create+play: .play('someID', {url:'/path/to.mp3'});
        sm2._wD(sm + '.play(): Attempting to create "' + sID + '"', 1);
        oOptions.id = sID;
        result = sm2.createSound(oOptions).play();
      }

    } else if (overloaded) {

      // existing sound object case
      oOptions = {
        url: oOptions
      };

    }

    if (result === null) {
      // default case
      result = sm2.sounds[sID].play(oOptions);
    }

    return result;

  };

  // just for convenience
  this.start = this.play;

  /**
   * Calls the setPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nMsecOffset Position (milliseconds)
   * @return {SMSound} The SMSound object
   */

  this.setPosition = function(sID, nMsecOffset) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].setPosition(nMsecOffset);

  };

  /**
   * Calls the stop() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.stop = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }

    sm2._wD(sm + '.stop(' + sID + ')', 1);
    return sm2.sounds[sID].stop();

  };

  /**
   * Stops all currently-playing sounds.
   */

  this.stopAll = function() {

    var oSound;
    sm2._wD(sm + '.stopAll()', 1);

    for (oSound in sm2.sounds) {
      if (sm2.sounds.hasOwnProperty(oSound)) {
        // apply only to sound objects
        sm2.sounds[oSound].stop();
      }
    }

  };

  /**
   * Calls the pause() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.pause = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].pause();

  };

  /**
   * Pauses all currently-playing sounds.
   */

  this.pauseAll = function() {

    var i;
    for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].pause();
    }

  };

  /**
   * Calls the resume() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.resume = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].resume();

  };

  /**
   * Resumes all currently-paused sounds.
   */

  this.resumeAll = function() {

    var i;
    for (i = sm2.soundIDs.length- 1 ; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].resume();
    }

  };

  /**
   * Calls the togglePause() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.togglePause = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].togglePause();

  };

  /**
   * Calls the setPan() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPan The pan value (-100 to 100)
   * @return {SMSound} The SMSound object
   */

  this.setPan = function(sID, nPan) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].setPan(nPan);

  };

  /**
   * Calls the setVolume() method of a SMSound object by ID
   * Overloaded case: pass only volume argument eg., setVolume(50) to apply to all sounds.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nVol The volume value (0 to 100)
   * @return {SMSound} The SMSound object
   */

  this.setVolume = function(sID, nVol) {

    // setVolume(50) function overloading case - apply to all sounds

    var i, j;

    if (sID !== _undefined && !isNaN(sID) && nVol === _undefined) {
      for (i = 0, j = sm2.soundIDs.length; i < j; i++) {
        sm2.sounds[sm2.soundIDs[i]].setVolume(sID);
      }
      return;
    }

    // setVolume('mySound', 50) case

    if (!idCheck(sID)) {
      return false;
    }

    return sm2.sounds[sID].setVolume(nVol);

  };

  /**
   * Calls the mute() method of either a single SMSound object by ID, or all sound objects.
   *
   * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
   */

  this.mute = function(sID) {

    var i = 0;

    if (sID instanceof String) {
      sID = null;
    }

    if (!sID) {

      sm2._wD(sm + '.mute(): Muting all sounds');
      for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
        sm2.sounds[sm2.soundIDs[i]].mute();
      }
      sm2.muted = true;

    } else {

      if (!idCheck(sID)) {
        return false;
      }
      sm2._wD(sm + '.mute(): Muting "' + sID + '"');
      return sm2.sounds[sID].mute();

    }

    return true;

  };

  /**
   * Mutes all sounds.
   */

  this.muteAll = function() {

    sm2.mute();

  };

  /**
   * Calls the unmute() method of either a single SMSound object by ID, or all sound objects.
   *
   * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
   */

  this.unmute = function(sID) {

    var i;

    if (sID instanceof String) {
      sID = null;
    }

    if (!sID) {

      sm2._wD(sm + '.unmute(): Unmuting all sounds');
      for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
        sm2.sounds[sm2.soundIDs[i]].unmute();
      }
      sm2.muted = false;

    } else {

      if (!idCheck(sID)) {
        return false;
      }
      sm2._wD(sm + '.unmute(): Unmuting "' + sID + '"');
      return sm2.sounds[sID].unmute();

    }

    return true;

  };

  /**
   * Unmutes all sounds.
   */

  this.unmuteAll = function() {

    sm2.unmute();

  };

  /**
   * Calls the toggleMute() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.toggleMute = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].toggleMute();

  };

  /**
   * Retrieves the memory used by the flash plugin.
   *
   * @return {number} The amount of memory in use
   */

  this.getMemoryUse = function() {

    // flash-only
    var ram = 0;

    if (flash && fV !== 8) {
      ram = parseInt(flash._getMemoryUse(), 10);
    }

    return ram;

  };

  /**
   * Undocumented: NOPs soundManager and all SMSound objects.
   */

  this.disable = function(bNoDisable) {

    // destroy all functions
    var i;

    if (bNoDisable === _undefined) {
      bNoDisable = false;
    }

    if (disabled) {
      return false;
    }

    disabled = true;
    _wDS('shutdown', 1);

    for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
      disableObject(sm2.sounds[sm2.soundIDs[i]]);
    }

    // fire "complete", despite fail
    initComplete(bNoDisable);
    event.remove(window, 'load', initUserOnload);

    return true;

  };

  /**
   * Determines playability of a MIME type, eg. 'audio/mp3'.
   */

  this.canPlayMIME = function(sMIME) {

    var result;

    if (sm2.hasHTML5) {
      result = html5CanPlay({
        type: sMIME
      });
    }

    if (!result && needsFlash) {
      // if flash 9, test netStream (movieStar) types as well.
      result = (sMIME && sm2.ok() ? !!((fV > 8 ? sMIME.match(netStreamMimeTypes) : null) || sMIME.match(sm2.mimePattern)) : null); // TODO: make less "weird" (per JSLint)
    }

    return result;

  };

  /**
   * Determines playability of a URL based on audio support.
   *
   * @param {string} sURL The URL to test
   * @return {boolean} URL playability
   */

  this.canPlayURL = function(sURL) {

    var result;

    if (sm2.hasHTML5) {
      result = html5CanPlay({
        url: sURL
      });
    }

    if (!result && needsFlash) {
      result = (sURL && sm2.ok() ? !!(sURL.match(sm2.filePattern)) : null);
    }

    return result;

  };

  /**
   * Determines playability of an HTML DOM &lt;a&gt; object (or similar object literal) based on audio support.
   *
   * @param {object} oLink an HTML DOM &lt;a&gt; object or object literal including href and/or type attributes
   * @return {boolean} URL playability
   */

  this.canPlayLink = function(oLink) {

    if (oLink.type !== _undefined && oLink.type) {
      if (sm2.canPlayMIME(oLink.type)) {
        return true;
      }
    }

    return sm2.canPlayURL(oLink.href);

  };

  /**
   * Retrieves a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.getSoundById = function(sID, _suppressDebug) {

    if (!sID) {
      return null;
    }

    var result = sm2.sounds[sID];

    // <d>
    if (!result && !_suppressDebug) {
      sm2._wD(sm + '.getSoundById(): Sound "' + sID + '" not found.', 2);
    }
    // </d>

    return result;

  };

  /**
   * Queues a callback for execution when SoundManager has successfully initialized.
   *
   * @param {function} oMethod The callback method to fire
   * @param {object} oScope Optional: The scope to apply to the callback
   */

  this.onready = function(oMethod, oScope) {

    var sType = 'onready',
        result = false;

    if (typeof oMethod === 'function') {

      // <d>
      if (didInit) {
        sm2._wD(str('queue', sType));
      }
      // </d>

      if (!oScope) {
        oScope = window;
      }

      addOnEvent(sType, oMethod, oScope);
      processOnEvents();

      result = true;

    } else {

      throw str('needFunction', sType);

    }

    return result;

  };

  /**
   * Queues a callback for execution when SoundManager has failed to initialize.
   *
   * @param {function} oMethod The callback method to fire
   * @param {object} oScope Optional: The scope to apply to the callback
   */

  this.ontimeout = function(oMethod, oScope) {

    var sType = 'ontimeout',
        result = false;

    if (typeof oMethod === 'function') {

      // <d>
      if (didInit) {
        sm2._wD(str('queue', sType));
      }
      // </d>

      if (!oScope) {
        oScope = window;
      }

      addOnEvent(sType, oMethod, oScope);
      processOnEvents({type:sType});

      result = true;

    } else {

      throw str('needFunction', sType);

    }

    return result;

  };

  /**
   * Writes console.log()-style debug output to a console or in-browser element.
   * Applies when debugMode = true
   *
   * @param {string} sText The console message
   * @param {object} nType Optional log level (number), or object. Number case: Log type/style where 0 = 'info', 1 = 'warn', 2 = 'error'. Object case: Object to be dumped.
   */

  this._writeDebug = function(sText, sTypeOrObject) {

    // pseudo-private console.log()-style output
    // <d>

    var sDID = 'soundmanager-debug', o, oItem;

    if (!sm2.setupOptions.debugMode) {
      return false;
    }

    if (hasConsole && sm2.useConsole) {
      if (sTypeOrObject && typeof sTypeOrObject === 'object') {
        // object passed; dump to console.
        console.log(sText, sTypeOrObject);
      } else if (debugLevels[sTypeOrObject] !== _undefined) {
        console[debugLevels[sTypeOrObject]](sText);
      } else {
        console.log(sText);
      }
      if (sm2.consoleOnly) {
        return true;
      }
    }

    o = id(sDID);

    if (!o) {
      return false;
    }

    oItem = doc.createElement('div');

    if (++wdCount % 2 === 0) {
      oItem.className = 'sm2-alt';
    }

    if (sTypeOrObject === _undefined) {
      sTypeOrObject = 0;
    } else {
      sTypeOrObject = parseInt(sTypeOrObject, 10);
    }

    oItem.appendChild(doc.createTextNode(sText));

    if (sTypeOrObject) {
      if (sTypeOrObject >= 2) {
        oItem.style.fontWeight = 'bold';
      }
      if (sTypeOrObject === 3) {
        oItem.style.color = '#ff3333';
      }
    }

    // top-to-bottom
    // o.appendChild(oItem);

    // bottom-to-top
    o.insertBefore(oItem, o.firstChild);

    o = null;
    // </d>

    return true;

  };

  // <d>
  // last-resort debugging option
  if (wl.indexOf('sm2-debug=alert') !== -1) {
    this._writeDebug = function(sText) {
      window.alert(sText);
    };
  }
  // </d>

  // alias
  this._wD = this._writeDebug;

  /**
   * Provides debug / state information on all SMSound objects.
   */

  this._debug = function() {

    // <d>
    var i, j;
    _wDS('currentObj', 1);

    for (i = 0, j = sm2.soundIDs.length; i < j; i++) {
      sm2.sounds[sm2.soundIDs[i]]._debug();
    }
    // </d>

  };

  /**
   * Restarts and re-initializes the SoundManager instance.
   *
   * @param {boolean} resetEvents Optional: When true, removes all registered onready and ontimeout event callbacks.
   * @param {boolean} excludeInit Options: When true, does not call beginDelayedInit() (which would restart SM2).
   * @return {object} soundManager The soundManager instance.
   */

  this.reboot = function(resetEvents, excludeInit) {

    // reset some (or all) state, and re-init unless otherwise specified.

    // <d>
    if (sm2.soundIDs.length) {
      sm2._wD('Destroying ' + sm2.soundIDs.length + ' SMSound object' + (sm2.soundIDs.length !== 1 ? 's' : '') + '...');
    }
    // </d>

    var i, j, k;

    for (i = sm2.soundIDs.length- 1 ; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].destruct();
    }

    // trash ze flash (remove from the DOM)

    if (flash) {

      try {

        if (isIE) {
          oRemovedHTML = flash.innerHTML;
        }

        oRemoved = flash.parentNode.removeChild(flash);

      } catch(e) {

        // Remove failed? May be due to flash blockers silently removing the SWF object/embed node from the DOM. Warn and continue.

        _wDS('badRemove', 2);

      }

    }

    // actually, force recreate of movie.

    oRemovedHTML = oRemoved = needsFlash = flash = null;

    sm2.enabled = didDCLoaded = didInit = waitingForEI = initPending = didAppend = appendSuccess = disabled = useGlobalHTML5Audio = sm2.swfLoaded = false;

    sm2.soundIDs = [];
    sm2.sounds = {};

    idCounter = 0;
    didSetup = false;

    if (!resetEvents) {
      // reset callbacks for onready, ontimeout etc. so that they will fire again on re-init
      for (i in on_queue) {
        if (on_queue.hasOwnProperty(i)) {
          for (j = 0, k = on_queue[i].length; j < k; j++) {
            on_queue[i][j].fired = false;
          }
        }
      }
    } else {
      // remove all callbacks entirely
      on_queue = [];
    }

    // <d>
    if (!excludeInit) {
      sm2._wD(sm + ': Rebooting...');
    }
    // </d>

    // reset HTML5 and flash canPlay test results

    sm2.html5 = {
      'usingFlash': null
    };

    sm2.flash = {};

    // reset device-specific HTML/flash mode switches

    sm2.html5Only = false;
    sm2.ignoreFlash = false;

    window.setTimeout(function() {

      // by default, re-init

      if (!excludeInit) {
        sm2.beginDelayedInit();
      }

    }, 20);

    return sm2;

  };

  this.reset = function() {

    /**
     * Shuts down and restores the SoundManager instance to its original loaded state, without an explicit reboot. All onready/ontimeout handlers are removed.
     * After this call, SM2 may be re-initialized via soundManager.beginDelayedInit().
     * @return {object} soundManager The soundManager instance.
     */

    _wDS('reset');
    return sm2.reboot(true, true);

  };

  /**
   * Undocumented: Determines the SM2 flash movie's load progress.
   *
   * @return {number or null} Percent loaded, or if invalid/unsupported, null.
   */

  this.getMoviePercent = function() {

    /**
     * Interesting syntax notes...
     * Flash/ExternalInterface (ActiveX/NPAPI) bridge methods are not typeof "function" nor instanceof Function, but are still valid.
     * Additionally, JSLint dislikes ('PercentLoaded' in flash)-style syntax and recommends hasOwnProperty(), which does not work in this case.
     * Furthermore, using (flash && flash.PercentLoaded) causes IE to throw "object doesn't support this property or method".
     * Thus, 'in' syntax must be used.
     */

    return (flash && 'PercentLoaded' in flash ? flash.PercentLoaded() : null); // Yes, JSLint. See nearby comment in source for explanation.

  };

  /**
   * Additional helper for manually invoking SM2's init process after DOM Ready / window.onload().
   */

  this.beginDelayedInit = function() {

    windowLoaded = true;
    domContentLoaded();

    setTimeout(function() {

      if (initPending) {
        return false;
      }

      createMovie();
      initMovie();
      initPending = true;

      return true;

    }, 20);

    delayWaitForEI();

  };

  /**
   * Destroys the SoundManager instance and all SMSound instances.
   */

  this.destruct = function() {

    sm2._wD(sm + '.destruct()');
    sm2.disable(true);

  };

  /**
   * SMSound() (sound object) constructor
   * ------------------------------------
   *
   * @param {object} oOptions Sound options (id and url are required attributes)
   * @return {SMSound} The new SMSound object
   */

  SMSound = function(oOptions) {

    var s = this, resetProperties, add_html5_events, remove_html5_events, stop_html5_timer, start_html5_timer, attachOnPosition, onplay_called = false, onPositionItems = [], onPositionFired = 0, detachOnPosition, applyFromTo, lastURL = null, lastHTML5State, urlOmitted;

    lastHTML5State = {
      // tracks duration + position (time)
      duration: null,
      time: null
    };

    this.id = oOptions.id;

    // legacy
    this.sID = this.id;

    this.url = oOptions.url;
    this.options = mixin(oOptions);

    // per-play-instance-specific options
    this.instanceOptions = this.options;

    // short alias
    this._iO = this.instanceOptions;

    // assign property defaults
    this.pan = this.options.pan;
    this.volume = this.options.volume;

    // whether or not this object is using HTML5
    this.isHTML5 = false;

    // internal HTML5 Audio() object reference
    this._a = null;

    // for flash 8 special-case createSound() without url, followed by load/play with url case
    urlOmitted = (this.url ? false : true);

    /**
     * SMSound() public methods
     * ------------------------
     */

    this.id3 = {};

    /**
     * Writes SMSound object parameters to debug console
     */

    this._debug = function() {

      // <d>
      sm2._wD(s.id + ': Merged options:', s.options);
      // </d>

    };

    /**
     * Begins loading a sound per its *url*.
     *
     * @param {object} oOptions Optional: Sound options
     * @return {SMSound} The SMSound object
     */

    this.load = function(oOptions) {

      var oSound = null, instanceOptions;

      if (oOptions !== _undefined) {
        s._iO = mixin(oOptions, s.options);
      } else {
        oOptions = s.options;
        s._iO = oOptions;
        if (lastURL && lastURL !== s.url) {
          _wDS('manURL');
          s._iO.url = s.url;
          s.url = null;
        }
      }

      if (!s._iO.url) {
        s._iO.url = s.url;
      }

      s._iO.url = parseURL(s._iO.url);

      // ensure we're in sync
      s.instanceOptions = s._iO;

      // local shortcut
      instanceOptions = s._iO;

      sm2._wD(s.id + ': load (' + instanceOptions.url + ')');

      if (!instanceOptions.url && !s.url) {
        sm2._wD(s.id + ': load(): url is unassigned. Exiting.', 2);
        return s;
      }

      // <d>
      if (!s.isHTML5 && fV === 8 && !s.url && !instanceOptions.autoPlay) {
        // flash 8 load() -> play() won't work before onload has fired.
        sm2._wD(s.id + ': Flash 8 load() limitation: Wait for onload() before calling play().', 1);
      }
      // </d>

      if (instanceOptions.url === s.url && s.readyState !== 0 && s.readyState !== 2) {
        _wDS('onURL', 1);
        // if loaded and an onload() exists, fire immediately.
        if (s.readyState === 3 && instanceOptions.onload) {
          // assume success based on truthy duration.
          wrapCallback(s, function() {
            instanceOptions.onload.apply(s, [(!!s.duration)]);
          });
        }
        return s;
      }

      // reset a few state properties

      s.loaded = false;
      s.readyState = 1;
      s.playState = 0;
      s.id3 = {};

      // TODO: If switching from HTML5 -> flash (or vice versa), stop currently-playing audio.

      if (html5OK(instanceOptions)) {

        oSound = s._setup_html5(instanceOptions);

        if (!oSound._called_load) {

          s._html5_canplay = false;

          // TODO: review called_load / html5_canplay logic

          // if url provided directly to load(), assign it here.

          if (s.url !== instanceOptions.url) {

            sm2._wD(_wDS('manURL') + ': ' + instanceOptions.url);

            s._a.src = instanceOptions.url;

            // TODO: review / re-apply all relevant options (volume, loop, onposition etc.)

            // reset position for new URL
            s.setPosition(0);

          }

          // given explicit load call, try to preload.

          // early HTML5 implementation (non-standard)
          s._a.autobuffer = 'auto';

          // standard property, values: none / metadata / auto
          // reference: http://msdn.microsoft.com/en-us/library/ie/ff974759%28v=vs.85%29.aspx
          s._a.preload = 'auto';

          s._a._called_load = true;

        } else {

          sm2._wD(s.id + ': Ignoring request to load again');

        }

      } else {

        if (sm2.html5Only) {
          sm2._wD(s.id + ': No flash support. Exiting.');
          return s;
        }

        if (s._iO.url && s._iO.url.match(/data\:/i)) {
          // data: URIs not supported by Flash, either.
          sm2._wD(s.id + ': data: URIs not supported via Flash. Exiting.');
          return s;
        }

        try {
          s.isHTML5 = false;
          s._iO = policyFix(loopFix(instanceOptions));
          // if we have "position", disable auto-play as we'll be seeking to that position at onload().
          if (s._iO.autoPlay && (s._iO.position || s._iO.from)) {
            sm2._wD(s.id + ': Disabling autoPlay because of non-zero offset case');
            s._iO.autoPlay = false;
          }
          // re-assign local shortcut
          instanceOptions = s._iO;
          if (fV === 8) {
            flash._load(s.id, instanceOptions.url, instanceOptions.stream, instanceOptions.autoPlay, instanceOptions.usePolicyFile);
          } else {
            flash._load(s.id, instanceOptions.url, !!(instanceOptions.stream), !!(instanceOptions.autoPlay), instanceOptions.loops || 1, !!(instanceOptions.autoLoad), instanceOptions.usePolicyFile);
          }
        } catch(e) {
          _wDS('smError', 2);
          debugTS('onload', false);
          catchError({
            type: 'SMSOUND_LOAD_JS_EXCEPTION',
            fatal: true
          });
        }

      }

      // after all of this, ensure sound url is up to date.
      s.url = instanceOptions.url;

      return s;

    };

    /**
     * Unloads a sound, canceling any open HTTP requests.
     *
     * @return {SMSound} The SMSound object
     */

    this.unload = function() {

      // Flash 8/AS2 can't "close" a stream - fake it by loading an empty URL
      // Flash 9/AS3: Close stream, preventing further load
      // HTML5: Most UAs will use empty URL

      if (s.readyState !== 0) {

        sm2._wD(s.id + ': unload()');

        if (!s.isHTML5) {

          if (fV === 8) {
            flash._unload(s.id, emptyURL);
          } else {
            flash._unload(s.id);
          }

        } else {

          stop_html5_timer();

          if (s._a) {

            s._a.pause();

            // update empty URL, too
            lastURL = html5Unload(s._a);

          }

        }

        // reset load/status flags
        resetProperties();

      }

      return s;

    };

    /**
     * Unloads and destroys a sound.
     */

    this.destruct = function(_bFromSM) {

      sm2._wD(s.id + ': Destruct');

      if (!s.isHTML5) {

        // kill sound within Flash
        // Disable the onfailure handler
        s._iO.onfailure = null;
        flash._destroySound(s.id);

      } else {

        stop_html5_timer();

        if (s._a) {
          s._a.pause();
          html5Unload(s._a);
          if (!useGlobalHTML5Audio) {
            remove_html5_events();
          }
          // break obvious circular reference
          s._a._s = null;
          s._a = null;
        }

      }

      if (!_bFromSM) {
        // ensure deletion from controller
        sm2.destroySound(s.id, true);
      }

    };

    /**
     * Begins playing a sound.
     *
     * @param {object} oOptions Optional: Sound options
     * @return {SMSound} The SMSound object
     */

    this.play = function(oOptions, _updatePlayState) {

      var fN, allowMulti, a, onready,
          audioClone, onended, oncanplay,
          startOK = true,
          exit = null;

      // <d>
      fN = s.id + ': play(): ';
      // </d>

      // default to true
      _updatePlayState = (_updatePlayState === _undefined ? true : _updatePlayState);

      if (!oOptions) {
        oOptions = {};
      }

      // first, use local URL (if specified)
      if (s.url) {
        s._iO.url = s.url;
      }

      // mix in any options defined at createSound()
      s._iO = mixin(s._iO, s.options);

      // mix in any options specific to this method
      s._iO = mixin(oOptions, s._iO);

      s._iO.url = parseURL(s._iO.url);

      s.instanceOptions = s._iO;

      // RTMP-only
      if (!s.isHTML5 && s._iO.serverURL && !s.connected) {
        if (!s.getAutoPlay()) {
          sm2._wD(fN +' Netstream not connected yet - setting autoPlay');
          s.setAutoPlay(true);
        }
        // play will be called in onconnect()
        return s;
      }

      if (html5OK(s._iO)) {
        s._setup_html5(s._iO);
        start_html5_timer();
      }

      if (s.playState === 1 && !s.paused) {

        allowMulti = s._iO.multiShot;

        if (!allowMulti) {

          sm2._wD(fN + 'Already playing (one-shot)', 1);

          if (s.isHTML5) {
            // go back to original position.
            s.setPosition(s._iO.position);
          }

          exit = s;

        } else {
          sm2._wD(fN + 'Already playing (multi-shot)', 1);
        }

      }

      if (exit !== null) {
        return exit;
      }

      // edge case: play() with explicit URL parameter
      if (oOptions.url && oOptions.url !== s.url) {

        // special case for createSound() followed by load() / play() with url; avoid double-load case.
        if (!s.readyState && !s.isHTML5 && fV === 8 && urlOmitted) {

          urlOmitted = false;

        } else {

          // load using merged options
          s.load(s._iO);

        }

      }

      if (!s.loaded) {

        if (s.readyState === 0) {

          sm2._wD(fN + 'Attempting to load');

          // try to get this sound playing ASAP
          if (!s.isHTML5 && !sm2.html5Only) {

            // flash: assign directly because setAutoPlay() increments the instanceCount
            s._iO.autoPlay = true;
            s.load(s._iO);

          } else if (s.isHTML5) {

            // iOS needs this when recycling sounds, loading a new URL on an existing object.
            s.load(s._iO);

          } else {

            sm2._wD(fN + 'Unsupported type. Exiting.');
            exit = s;

          }

          // HTML5 hack - re-set instanceOptions?
          s.instanceOptions = s._iO;

        } else if (s.readyState === 2) {

          sm2._wD(fN + 'Could not load - exiting', 2);
          exit = s;

        } else {

          sm2._wD(fN + 'Loading - attempting to play...');

        }

      } else {

        // "play()"
        sm2._wD(fN.substr(0, fN.lastIndexOf(':')));

      }

      if (exit !== null) {
        return exit;
      }

      if (!s.isHTML5 && fV === 9 && s.position > 0 && s.position === s.duration) {
        // flash 9 needs a position reset if play() is called while at the end of a sound.
        sm2._wD(fN + 'Sound at end, resetting to position: 0');
        oOptions.position = 0;
      }

      /**
       * Streams will pause when their buffer is full if they are being loaded.
       * In this case paused is true, but the song hasn't started playing yet.
       * If we just call resume() the onplay() callback will never be called.
       * So only call resume() if the position is > 0.
       * Another reason is because options like volume won't have been applied yet.
       * For normal sounds, just resume.
       */

      if (s.paused && s.position >= 0 && (!s._iO.serverURL || s.position > 0)) {

        // https://gist.github.com/37b17df75cc4d7a90bf6
        sm2._wD(fN + 'Resuming from paused state', 1);
        s.resume();

      } else {

        s._iO = mixin(oOptions, s._iO);

        /**
         * Preload in the event of play() with position under Flash,
         * or from/to parameters and non-RTMP case
         */
        if (((!s.isHTML5 && s._iO.position !== null && s._iO.position > 0) || (s._iO.from !== null && s._iO.from > 0) || s._iO.to !== null) && s.instanceCount === 0 && s.playState === 0 && !s._iO.serverURL) {

          onready = function() {
            // sound "canplay" or onload()
            // re-apply position/from/to to instance options, and start playback
            s._iO = mixin(oOptions, s._iO);
            s.play(s._iO);
          };

          // HTML5 needs to at least have "canplay" fired before seeking.
          if (s.isHTML5 && !s._html5_canplay) {

            // this hasn't been loaded yet. load it first, and then do this again.
            sm2._wD(fN + 'Beginning load for non-zero offset case');

            s.load({
              // note: custom HTML5-only event added for from/to implementation.
              _oncanplay: onready
            });

            exit = false;

          } else if (!s.isHTML5 && !s.loaded && (!s.readyState || s.readyState !== 2)) {

            // to be safe, preload the whole thing in Flash.

            sm2._wD(fN + 'Preloading for non-zero offset case');

            s.load({
              onload: onready
            });

            exit = false;

          }

          if (exit !== null) {
            return exit;
          }

          // otherwise, we're ready to go. re-apply local options, and continue

          s._iO = applyFromTo();

        }

        // sm2._wD(fN + 'Starting to play');

        // increment instance counter, where enabled + supported
        if (!s.instanceCount || s._iO.multiShotEvents || (s.isHTML5 && s._iO.multiShot && !useGlobalHTML5Audio) || (!s.isHTML5 && fV > 8 && !s.getAutoPlay())) {
          s.instanceCount++;
        }

        // if first play and onposition parameters exist, apply them now
        if (s._iO.onposition && s.playState === 0) {
          attachOnPosition(s);
        }

        s.playState = 1;
        s.paused = false;

        s.position = (s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position : 0);

        if (!s.isHTML5) {
          s._iO = policyFix(loopFix(s._iO));
        }

        if (s._iO.onplay && _updatePlayState) {
          s._iO.onplay.apply(s);
          onplay_called = true;
        }

        s.setVolume(s._iO.volume, true);
        s.setPan(s._iO.pan, true);

        if (!s.isHTML5) {

          startOK = flash._start(s.id, s._iO.loops || 1, (fV === 9 ? s.position : s.position / msecScale), s._iO.multiShot || false);

          if (fV === 9 && !startOK) {
            // edge case: no sound hardware, or 32-channel flash ceiling hit.
            // applies only to Flash 9, non-NetStream/MovieStar sounds.
            // http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/media/Sound.html#play%28%29
            sm2._wD(fN + 'No sound hardware, or 32-sound ceiling hit', 2);
            if (s._iO.onplayerror) {
              s._iO.onplayerror.apply(s);
            }

          }

        } else {

          if (s.instanceCount < 2) {

            // HTML5 single-instance case

            start_html5_timer();

            a = s._setup_html5();

            s.setPosition(s._iO.position);

            a.play();

          } else {

            // HTML5 multi-shot case

            sm2._wD(s.id + ': Cloning Audio() for instance #' + s.instanceCount + '...');

            audioClone = new Audio(s._iO.url);

            onended = function() {
              event.remove(audioClone, 'ended', onended);
              s._onfinish(s);
              // cleanup
              html5Unload(audioClone);
              audioClone = null;
            };

            oncanplay = function() {
              event.remove(audioClone, 'canplay', oncanplay);
              try {
                audioClone.currentTime = s._iO.position/msecScale;
              } catch(err) {
                complain(s.id + ': multiShot play() failed to apply position of ' + (s._iO.position/msecScale));
              }
              audioClone.play();
            };

            event.add(audioClone, 'ended', onended);

            // apply volume to clones, too
            if (s._iO.volume !== _undefined) {
              audioClone.volume = Math.max(0, Math.min(1, s._iO.volume/100));
            }

            // playing multiple muted sounds? if you do this, you're weird ;) - but let's cover it.
            if (s.muted) {
              audioClone.muted = true;
            }

            if (s._iO.position) {
              // HTML5 audio can't seek before onplay() event has fired.
              // wait for canplay, then seek to position and start playback.
              event.add(audioClone, 'canplay', oncanplay);
            } else {
              // begin playback at currentTime: 0
              audioClone.play();
            }

          }

        }

      }

      return s;

    };

    // just for convenience
    this.start = this.play;

    /**
     * Stops playing a sound (and optionally, all sounds)
     *
     * @param {boolean} bAll Optional: Whether to stop all sounds
     * @return {SMSound} The SMSound object
     */

    this.stop = function(bAll) {

      var instanceOptions = s._iO,
          originalPosition;

      if (s.playState === 1) {

        sm2._wD(s.id + ': stop()');

        s._onbufferchange(0);
        s._resetOnPosition(0);
        s.paused = false;

        if (!s.isHTML5) {
          s.playState = 0;
        }

        // remove onPosition listeners, if any
        detachOnPosition();

        // and "to" position, if set
        if (instanceOptions.to) {
          s.clearOnPosition(instanceOptions.to);
        }

        if (!s.isHTML5) {

          flash._stop(s.id, bAll);

          // hack for netStream: just unload
          if (instanceOptions.serverURL) {
            s.unload();
          }

        } else {

          if (s._a) {

            originalPosition = s.position;

            // act like Flash, though
            s.setPosition(0);

            // hack: reflect old position for onstop() (also like Flash)
            s.position = originalPosition;

            // html5 has no stop()
            // NOTE: pausing means iOS requires interaction to resume.
            s._a.pause();

            s.playState = 0;

            // and update UI
            s._onTimer();

            stop_html5_timer();

          }

        }

        s.instanceCount = 0;
        s._iO = {};

        if (instanceOptions.onstop) {
          instanceOptions.onstop.apply(s);
        }

      }

      return s;

    };

    /**
     * Undocumented/internal: Sets autoPlay for RTMP.
     *
     * @param {boolean} autoPlay state
     */

    this.setAutoPlay = function(autoPlay) {

      sm2._wD(s.id + ': Autoplay turned ' + (autoPlay ? 'on' : 'off'));
      s._iO.autoPlay = autoPlay;

      if (!s.isHTML5) {
        flash._setAutoPlay(s.id, autoPlay);
        if (autoPlay) {
          // only increment the instanceCount if the sound isn't loaded (TODO: verify RTMP)
          if (!s.instanceCount && s.readyState === 1) {
            s.instanceCount++;
            sm2._wD(s.id + ': Incremented instance count to '+s.instanceCount);
          }
        }
      }

    };

    /**
     * Undocumented/internal: Returns the autoPlay boolean.
     *
     * @return {boolean} The current autoPlay value
     */

    this.getAutoPlay = function() {

      return s._iO.autoPlay;

    };

    /**
     * Sets the position of a sound.
     *
     * @param {number} nMsecOffset Position (milliseconds)
     * @return {SMSound} The SMSound object
     */

    this.setPosition = function(nMsecOffset) {

      if (nMsecOffset === _undefined) {
        nMsecOffset = 0;
      }

      var position, position1K,
          // Use the duration from the instance options, if we don't have a track duration yet.
          // position >= 0 and <= current available (loaded) duration
          offset = (s.isHTML5 ? Math.max(nMsecOffset, 0) : Math.min(s.duration || s._iO.duration, Math.max(nMsecOffset, 0)));

      s.position = offset;
      position1K = s.position/msecScale;
      s._resetOnPosition(s.position);
      s._iO.position = offset;

      if (!s.isHTML5) {

        position = (fV === 9 ? s.position : position1K);

        if (s.readyState && s.readyState !== 2) {
          // if paused or not playing, will not resume (by playing)
          flash._setPosition(s.id, position, (s.paused || !s.playState), s._iO.multiShot);
        }

      } else if (s._a) {

        // Set the position in the canplay handler if the sound is not ready yet
        if (s._html5_canplay) {

          if (s._a.currentTime !== position1K) {

            /**
             * DOM/JS errors/exceptions to watch out for:
             * if seek is beyond (loaded?) position, "DOM exception 11"
             * "INDEX_SIZE_ERR": DOM exception 1
             */
            sm2._wD(s.id + ': setPosition(' + position1K + ')');

            try {
              s._a.currentTime = position1K;
              if (s.playState === 0 || s.paused) {
                // allow seek without auto-play/resume
                s._a.pause();
              }
            } catch(e) {
              sm2._wD(s.id + ': setPosition(' + position1K + ') failed: ' + e.message, 2);
            }

          }

        } else if (position1K) {

          // warn on non-zero seek attempts
          sm2._wD(s.id + ': setPosition(' + position1K + '): Cannot seek yet, sound not ready', 2);
          return s;

        }

        if (s.paused) {

          // if paused, refresh UI right away by forcing update
          s._onTimer(true);

        }

      }

      return s;

    };

    /**
     * Pauses sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    this.pause = function(_bCallFlash) {

      if (s.paused || (s.playState === 0 && s.readyState !== 1)) {
        return s;
      }

      sm2._wD(s.id + ': pause()');
      s.paused = true;

      if (!s.isHTML5) {
        if (_bCallFlash || _bCallFlash === _undefined) {
          flash._pause(s.id, s._iO.multiShot);
        }
      } else {
        s._setup_html5().pause();
        stop_html5_timer();
      }

      if (s._iO.onpause) {
        s._iO.onpause.apply(s);
      }

      return s;

    };

    /**
     * Resumes sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    /**
     * When auto-loaded streams pause on buffer full they have a playState of 0.
     * We need to make sure that the playState is set to 1 when these streams "resume".
     * When a paused stream is resumed, we need to trigger the onplay() callback if it
     * hasn't been called already. In this case since the sound is being played for the
     * first time, I think it's more appropriate to call onplay() rather than onresume().
     */

    this.resume = function() {

      var instanceOptions = s._iO;

      if (!s.paused) {
        return s;
      }

      sm2._wD(s.id + ': resume()');
      s.paused = false;
      s.playState = 1;

      if (!s.isHTML5) {

        if (instanceOptions.isMovieStar && !instanceOptions.serverURL) {
          // Bizarre Webkit bug (Chrome reported via 8tracks.com dudes): AAC content paused for 30+ seconds(?) will not resume without a reposition.
          s.setPosition(s.position);
        }

        // flash method is toggle-based (pause/resume)
        flash._pause(s.id, instanceOptions.multiShot);

      } else {

        s._setup_html5().play();
        start_html5_timer();

      }

      if (!onplay_called && instanceOptions.onplay) {

        instanceOptions.onplay.apply(s);
        onplay_called = true;

      } else if (instanceOptions.onresume) {

        instanceOptions.onresume.apply(s);

      }

      return s;

    };

    /**
     * Toggles sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    this.togglePause = function() {

      sm2._wD(s.id + ': togglePause()');

      if (s.playState === 0) {
        s.play({
          position: (fV === 9 && !s.isHTML5 ? s.position : s.position / msecScale)
        });
        return s;
      }

      if (s.paused) {
        s.resume();
      } else {
        s.pause();
      }

      return s;

    };

    /**
     * Sets the panning (L-R) effect.
     *
     * @param {number} nPan The pan value (-100 to 100)
     * @return {SMSound} The SMSound object
     */

    this.setPan = function(nPan, bInstanceOnly) {

      if (nPan === _undefined) {
        nPan = 0;
      }

      if (bInstanceOnly === _undefined) {
        bInstanceOnly = false;
      }

      if (!s.isHTML5) {
        flash._setPan(s.id, nPan);
      } // else { no HTML5 pan? }

      s._iO.pan = nPan;

      if (!bInstanceOnly) {
        s.pan = nPan;
        s.options.pan = nPan;
      }

      return s;

    };

    /**
     * Sets the volume.
     *
     * @param {number} nVol The volume value (0 to 100)
     * @return {SMSound} The SMSound object
     */

    this.setVolume = function(nVol, _bInstanceOnly) {

      /**
       * Note: Setting volume has no effect on iOS "special snowflake" devices.
       * Hardware volume control overrides software, and volume
       * will always return 1 per Apple docs. (iOS 4 + 5.)
       * http://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/HTML-canvas-guide/AddingSoundtoCanvasAnimations/AddingSoundtoCanvasAnimations.html
       */

      if (nVol === _undefined) {
        nVol = 100;
      }

      if (_bInstanceOnly === _undefined) {
        _bInstanceOnly = false;
      }

      if (!s.isHTML5) {

        flash._setVolume(s.id, (sm2.muted && !s.muted) || s.muted ? 0 : nVol);

      } else if (s._a) {

        if (sm2.muted && !s.muted) {
          s.muted = true;
          s._a.muted = true;
        }

        // valid range for native HTML5 Audio(): 0-1
        s._a.volume = Math.max(0, Math.min(1, nVol/100));

      }

      s._iO.volume = nVol;

      if (!_bInstanceOnly) {
        s.volume = nVol;
        s.options.volume = nVol;
      }

      return s;

    };

    /**
     * Mutes the sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.mute = function() {

      s.muted = true;

      if (!s.isHTML5) {
        flash._setVolume(s.id, 0);
      } else if (s._a) {
        s._a.muted = true;
      }

      return s;

    };

    /**
     * Unmutes the sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.unmute = function() {

      s.muted = false;
      var hasIO = (s._iO.volume !== _undefined);

      if (!s.isHTML5) {
        flash._setVolume(s.id, hasIO ? s._iO.volume : s.options.volume);
      } else if (s._a) {
        s._a.muted = false;
      }

      return s;

    };

    /**
     * Toggles the muted state of a sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.toggleMute = function() {

      return (s.muted ? s.unmute() : s.mute());

    };

    /**
     * Registers a callback to be fired when a sound reaches a given position during playback.
     *
     * @param {number} nPosition The position to watch for
     * @param {function} oMethod The relevant callback to fire
     * @param {object} oScope Optional: The scope to apply the callback to
     * @return {SMSound} The SMSound object
     */

    this.onPosition = function(nPosition, oMethod, oScope) {

      // TODO: basic dupe checking?

      onPositionItems.push({
        position: parseInt(nPosition, 10),
        method: oMethod,
        scope: (oScope !== _undefined ? oScope : s),
        fired: false
      });

      return s;

    };

    // legacy/backwards-compability: lower-case method name
    this.onposition = this.onPosition;

    /**
     * Removes registered callback(s) from a sound, by position and/or callback.
     *
     * @param {number} nPosition The position to clear callback(s) for
     * @param {function} oMethod Optional: Identify one callback to be removed when multiple listeners exist for one position
     * @return {SMSound} The SMSound object
     */

    this.clearOnPosition = function(nPosition, oMethod) {

      var i;

      nPosition = parseInt(nPosition, 10);

      if (isNaN(nPosition)) {
        // safety check
        return false;
      }

      for (i=0; i < onPositionItems.length; i++) {

        if (nPosition === onPositionItems[i].position) {
          // remove this item if no method was specified, or, if the method matches
          
          if (!oMethod || (oMethod === onPositionItems[i].method)) {
            
            if (onPositionItems[i].fired) {
              // decrement "fired" counter, too
              onPositionFired--;
            }
            
            onPositionItems.splice(i, 1);
          
          }
        
        }

      }

    };

    this._processOnPosition = function() {

      var i, item, j = onPositionItems.length;

      if (!j || !s.playState || onPositionFired >= j) {
        return false;
      }

      for (i = j - 1; i >= 0; i--) {
        
        item = onPositionItems[i];
        
        if (!item.fired && s.position >= item.position) {
        
          item.fired = true;
          onPositionFired++;
          item.method.apply(item.scope, [item.position]);
        
          //  reset j -- onPositionItems.length can be changed in the item callback above... occasionally breaking the loop.
		      j = onPositionItems.length;
        
        }
      
      }

      return true;

    };

    this._resetOnPosition = function(nPosition) {

      // reset "fired" for items interested in this position
      var i, item, j = onPositionItems.length;

      if (!j) {
        return false;
      }

      for (i = j - 1; i >= 0; i--) {
        
        item = onPositionItems[i];
        
        if (item.fired && nPosition <= item.position) {
          item.fired = false;
          onPositionFired--;
        }
      
      }

      return true;

    };

    /**
     * SMSound() private internals
     * --------------------------------
     */

    applyFromTo = function() {

      var instanceOptions = s._iO,
          f = instanceOptions.from,
          t = instanceOptions.to,
          start, end;

      end = function() {

        // end has been reached.
        sm2._wD(s.id + ': "To" time of ' + t + ' reached.');

        // detach listener
        s.clearOnPosition(t, end);

        // stop should clear this, too
        s.stop();

      };

      start = function() {

        sm2._wD(s.id + ': Playing "from" ' + f);

        // add listener for end
        if (t !== null && !isNaN(t)) {
          s.onPosition(t, end);
        }

      };

      if (f !== null && !isNaN(f)) {

        // apply to instance options, guaranteeing correct start position.
        instanceOptions.position = f;

        // multiShot timing can't be tracked, so prevent that.
        instanceOptions.multiShot = false;

        start();

      }

      // return updated instanceOptions including starting position
      return instanceOptions;

    };

    attachOnPosition = function() {

      var item,
          op = s._iO.onposition;

      // attach onposition things, if any, now.

      if (op) {

        for (item in op) {
          if (op.hasOwnProperty(item)) {
            s.onPosition(parseInt(item, 10), op[item]);
          }
        }

      }

    };

    detachOnPosition = function() {

      var item,
          op = s._iO.onposition;

      // detach any onposition()-style listeners.

      if (op) {

        for (item in op) {
          if (op.hasOwnProperty(item)) {
            s.clearOnPosition(parseInt(item, 10));
          }
        }

      }

    };

    start_html5_timer = function() {

      if (s.isHTML5) {
        startTimer(s);
      }

    };

    stop_html5_timer = function() {

      if (s.isHTML5) {
        stopTimer(s);
      }

    };

    resetProperties = function(retainPosition) {

      if (!retainPosition) {
        onPositionItems = [];
        onPositionFired = 0;
      }

      onplay_called = false;

      s._hasTimer = null;
      s._a = null;
      s._html5_canplay = false;
      s.bytesLoaded = null;
      s.bytesTotal = null;
      s.duration = (s._iO && s._iO.duration ? s._iO.duration : null);
      s.durationEstimate = null;
      s.buffered = [];

      // legacy: 1D array
      s.eqData = [];

      s.eqData.left = [];
      s.eqData.right = [];

      s.failures = 0;
      s.isBuffering = false;
      s.instanceOptions = {};
      s.instanceCount = 0;
      s.loaded = false;
      s.metadata = {};

      // 0 = uninitialised, 1 = loading, 2 = failed/error, 3 = loaded/success
      s.readyState = 0;

      s.muted = false;
      s.paused = false;

      s.peakData = {
        left: 0,
        right: 0
      };

      s.waveformData = {
        left: [],
        right: []
      };

      s.playState = 0;
      s.position = null;

      s.id3 = {};

    };

    resetProperties();

    /**
     * Pseudo-private SMSound internals
     * --------------------------------
     */

    this._onTimer = function(bForce) {

      /**
       * HTML5-only _whileplaying() etc.
       * called from both HTML5 native events, and polling/interval-based timers
       * mimics flash and fires only when time/duration change, so as to be polling-friendly
       */

      var duration, isNew = false, time, x = {};

      if (s._hasTimer || bForce) {

        // TODO: May not need to track readyState (1 = loading)

        if (s._a && (bForce || ((s.playState > 0 || s.readyState === 1) && !s.paused))) {

          duration = s._get_html5_duration();

          if (duration !== lastHTML5State.duration) {

            lastHTML5State.duration = duration;
            s.duration = duration;
            isNew = true;

          }

          // TODO: investigate why this goes wack if not set/re-set each time.
          s.durationEstimate = s.duration;

          time = (s._a.currentTime * msecScale || 0);

          if (time !== lastHTML5State.time) {

            lastHTML5State.time = time;
            isNew = true;

          }

          if (isNew || bForce) {

            s._whileplaying(time, x, x, x, x);

          }

        }/* else {

          // sm2._wD('_onTimer: Warn for "'+s.id+'": '+(!s._a?'Could not find element. ':'')+(s.playState === 0?'playState bad, 0?':'playState = '+s.playState+', OK'));

          return false;

        }*/

        return isNew;

      }

    };

    this._get_html5_duration = function() {

      var instanceOptions = s._iO,
          // if audio object exists, use its duration - else, instance option duration (if provided - it's a hack, really, and should be retired) OR null
          d = (s._a && s._a.duration ? s._a.duration * msecScale : (instanceOptions && instanceOptions.duration ? instanceOptions.duration : null)),
          result = (d && !isNaN(d) && d !== Infinity ? d : null);

      return result;

    };

    this._apply_loop = function(a, nLoops) {

      /**
       * boolean instead of "loop", for webkit? - spec says string. http://www.w3.org/TR/html-markup/audio.html#audio.attrs.loop
       * note that loop is either off or infinite under HTML5, unlike Flash which allows arbitrary loop counts to be specified.
       */

      // <d>
      if (!a.loop && nLoops > 1) {
        sm2._wD('Note: Native HTML5 looping is infinite.', 1);
      }
      // </d>

      a.loop = (nLoops > 1 ? 'loop' : '');

    };

    this._setup_html5 = function(oOptions) {

      var instanceOptions = mixin(s._iO, oOptions),
          a = useGlobalHTML5Audio ? globalHTML5Audio : s._a,
          dURL = decodeURI(instanceOptions.url),
          sameURL;

      /**
       * "First things first, I, Poppa..." (reset the previous state of the old sound, if playing)
       * Fixes case with devices that can only play one sound at a time
       * Otherwise, other sounds in mid-play will be terminated without warning and in a stuck state
       */

      if (useGlobalHTML5Audio) {

        if (dURL === decodeURI(lastGlobalHTML5URL)) {
          // global HTML5 audio: re-use of URL
          sameURL = true;
        }

      } else if (dURL === decodeURI(lastURL)) {

        // options URL is the same as the "last" URL, and we used (loaded) it
        sameURL = true;

      }

      if (a) {

        if (a._s) {

          if (useGlobalHTML5Audio) {

            if (a._s && a._s.playState && !sameURL) {

              // global HTML5 audio case, and loading a new URL. stop the currently-playing one.
              a._s.stop();

            }

          } else if (!useGlobalHTML5Audio && dURL === decodeURI(lastURL)) {

            // non-global HTML5 reuse case: same url, ignore request
            s._apply_loop(a, instanceOptions.loops);

            return a;

          }

        }

        if (!sameURL) {

          // don't retain onPosition() stuff with new URLs.

          if (lastURL) {
            resetProperties(false);
          }

          // assign new HTML5 URL

          a.src = instanceOptions.url;

          s.url = instanceOptions.url;

          lastURL = instanceOptions.url;

          lastGlobalHTML5URL = instanceOptions.url;

          a._called_load = false;

        }

      } else {

        if (instanceOptions.autoLoad || instanceOptions.autoPlay) {

          s._a = new Audio(instanceOptions.url);
          s._a.load();

        } else {

          // null for stupid Opera 9.64 case
          s._a = (isOpera && opera.version() < 10 ? new Audio(null) : new Audio());

        }

        // assign local reference
        a = s._a;

        a._called_load = false;

        if (useGlobalHTML5Audio) {

          globalHTML5Audio = a;

        }

      }

      s.isHTML5 = true;

      // store a ref on the track
      s._a = a;

      // store a ref on the audio
      a._s = s;

      add_html5_events();

      s._apply_loop(a, instanceOptions.loops);

      if (instanceOptions.autoLoad || instanceOptions.autoPlay) {

        s.load();

      } else {

        // early HTML5 implementation (non-standard)
        a.autobuffer = false;

        // standard ('none' is also an option.)
        a.preload = 'auto';

      }

      return a;

    };

    add_html5_events = function() {

      if (s._a._added_events) {
        return false;
      }

      var f;

      function add(oEvt, oFn, bCapture) {
        return s._a ? s._a.addEventListener(oEvt, oFn, bCapture || false) : null;
      }

      s._a._added_events = true;

      for (f in html5_events) {
        if (html5_events.hasOwnProperty(f)) {
          add(f, html5_events[f]);
        }
      }

      return true;

    };

    remove_html5_events = function() {

      // Remove event listeners

      var f;

      function remove(oEvt, oFn, bCapture) {
        return (s._a ? s._a.removeEventListener(oEvt, oFn, bCapture || false) : null);
      }

      sm2._wD(s.id + ': Removing event listeners');
      s._a._added_events = false;

      for (f in html5_events) {
        if (html5_events.hasOwnProperty(f)) {
          remove(f, html5_events[f]);
        }
      }

    };

    /**
     * Pseudo-private event internals
     * ------------------------------
     */

    this._onload = function(nSuccess) {

      var fN,
          // check for duration to prevent false positives from flash 8 when loading from cache.
          loadOK = !!nSuccess || (!s.isHTML5 && fV === 8 && s.duration);

      // <d>
      fN = s.id + ': ';
      sm2._wD(fN + (loadOK ? 'onload()' : 'Failed to load / invalid sound?' + (!s.duration ? ' Zero-length duration reported.' : ' -') + ' (' + s.url + ')'), (loadOK ? 1 : 2));

      if (!loadOK && !s.isHTML5) {
        if (sm2.sandbox.noRemote === true) {
          sm2._wD(fN + str('noNet'), 1);
        }
        if (sm2.sandbox.noLocal === true) {
          sm2._wD(fN + str('noLocal'), 1);
        }
      }
      // </d>

      s.loaded = loadOK;
      s.readyState = (loadOK ? 3 : 2);
      s._onbufferchange(0);

      if (s._iO.onload) {
        wrapCallback(s, function() {
          s._iO.onload.apply(s, [loadOK]);
        });
      }

      return true;

    };

    this._onbufferchange = function(nIsBuffering) {

      if (s.playState === 0) {
        // ignore if not playing
        return false;
      }

      if ((nIsBuffering && s.isBuffering) || (!nIsBuffering && !s.isBuffering)) {
        return false;
      }

      s.isBuffering = (nIsBuffering === 1);
      
      if (s._iO.onbufferchange) {
        sm2._wD(s.id + ': Buffer state change: ' + nIsBuffering);
        s._iO.onbufferchange.apply(s, [nIsBuffering]);
      }

      return true;

    };

    /**
     * Playback may have stopped due to buffering, or related reason.
     * This state can be encountered on iOS < 6 when auto-play is blocked.
     */

    this._onsuspend = function() {

      if (s._iO.onsuspend) {
        sm2._wD(s.id + ': Playback suspended');
        s._iO.onsuspend.apply(s);
      }

      return true;

    };

    /**
     * flash 9/movieStar + RTMP-only method, should fire only once at most
     * at this point we just recreate failed sounds rather than trying to reconnect
     */

    this._onfailure = function(msg, level, code) {

      s.failures++;
      sm2._wD(s.id + ': Failure (' + s.failures + '): ' + msg);

      if (s._iO.onfailure && s.failures === 1) {
        s._iO.onfailure(msg, level, code);
      } else {
        sm2._wD(s.id + ': Ignoring failure');
      }

    };

    /**
     * flash 9/movieStar + RTMP-only method for unhandled warnings/exceptions from Flash
     * e.g., RTMP "method missing" warning (non-fatal) for getStreamLength on server
     */

    this._onwarning = function(msg, level, code) {

      if (s._iO.onwarning) {
        s._iO.onwarning(msg, level, code);
      }

    };

    this._onfinish = function() {

      // store local copy before it gets trashed...
      var io_onfinish = s._iO.onfinish;

      s._onbufferchange(0);
      s._resetOnPosition(0);

      // reset some state items
      if (s.instanceCount) {

        s.instanceCount--;

        if (!s.instanceCount) {

          // remove onPosition listeners, if any
          detachOnPosition();

          // reset instance options
          s.playState = 0;
          s.paused = false;
          s.instanceCount = 0;
          s.instanceOptions = {};
          s._iO = {};
          stop_html5_timer();

          // reset position, too
          if (s.isHTML5) {
            s.position = 0;
          }

        }

        if (!s.instanceCount || s._iO.multiShotEvents) {
          // fire onfinish for last, or every instance
          if (io_onfinish) {
            sm2._wD(s.id + ': onfinish()');
            wrapCallback(s, function() {
              io_onfinish.apply(s);
            });
          }
        }

      }

    };

    this._whileloading = function(nBytesLoaded, nBytesTotal, nDuration, nBufferLength) {

      var instanceOptions = s._iO;

      s.bytesLoaded = nBytesLoaded;
      s.bytesTotal = nBytesTotal;
      s.duration = Math.floor(nDuration);
      s.bufferLength = nBufferLength;

      if (!s.isHTML5 && !instanceOptions.isMovieStar) {

        if (instanceOptions.duration) {
          // use duration from options, if specified and larger. nobody should be specifying duration in options, actually, and it should be retired.
          s.durationEstimate = (s.duration > instanceOptions.duration) ? s.duration : instanceOptions.duration;
        } else {
          s.durationEstimate = parseInt((s.bytesTotal / s.bytesLoaded) * s.duration, 10);
        }

      } else {

        s.durationEstimate = s.duration;

      }

      // for flash, reflect sequential-load-style buffering
      if (!s.isHTML5) {
        s.buffered = [{
          'start': 0,
          'end': s.duration
        }];
      }

      // allow whileloading to fire even if "load" fired under HTML5, due to HTTP range/partials
      if ((s.readyState !== 3 || s.isHTML5) && instanceOptions.whileloading) {
        instanceOptions.whileloading.apply(s);
      }

    };

    this._whileplaying = function(nPosition, oPeakData, oWaveformDataLeft, oWaveformDataRight, oEQData) {

      var instanceOptions = s._iO,
          eqLeft;

      if (isNaN(nPosition) || nPosition === null) {
        // flash safety net
        return false;
      }

      // Safari HTML5 play() may return small -ve values when starting from position: 0, eg. -50.120396875. Unexpected/invalid per W3, I think. Normalize to 0.
      s.position = Math.max(0, nPosition);

      s._processOnPosition();

      if (!s.isHTML5 && fV > 8) {

        if (instanceOptions.usePeakData && oPeakData !== _undefined && oPeakData) {
          s.peakData = {
            left: oPeakData.leftPeak,
            right: oPeakData.rightPeak
          };
        }

        if (instanceOptions.useWaveformData && oWaveformDataLeft !== _undefined && oWaveformDataLeft) {
          s.waveformData = {
            left: oWaveformDataLeft.split(','),
            right: oWaveformDataRight.split(',')
          };
        }

        if (instanceOptions.useEQData) {
          if (oEQData !== _undefined && oEQData && oEQData.leftEQ) {
            eqLeft = oEQData.leftEQ.split(',');
            s.eqData = eqLeft;
            s.eqData.left = eqLeft;
            if (oEQData.rightEQ !== _undefined && oEQData.rightEQ) {
              s.eqData.right = oEQData.rightEQ.split(',');
            }
          }
        }

      }

      if (s.playState === 1) {

        // special case/hack: ensure buffering is false if loading from cache (and not yet started)
        if (!s.isHTML5 && fV === 8 && !s.position && s.isBuffering) {
          s._onbufferchange(0);
        }

        if (instanceOptions.whileplaying) {
          // flash may call after actual finish
          instanceOptions.whileplaying.apply(s);
        }

      }

      return true;

    };

    this._oncaptiondata = function(oData) {

      /**
       * internal: flash 9 + NetStream (MovieStar/RTMP-only) feature
       *
       * @param {object} oData
       */

      sm2._wD(s.id + ': Caption data received.');

      s.captiondata = oData;

      if (s._iO.oncaptiondata) {
        s._iO.oncaptiondata.apply(s, [oData]);
      }

    };

    this._onmetadata = function(oMDProps, oMDData) {

      /**
       * internal: flash 9 + NetStream (MovieStar/RTMP-only) feature
       * RTMP may include song title, MovieStar content may include encoding info
       *
       * @param {array} oMDProps (names)
       * @param {array} oMDData (values)
       */

      sm2._wD(s.id + ': Metadata received.');

      var oData = {}, i, j;

      for (i = 0, j = oMDProps.length; i < j; i++) {
        oData[oMDProps[i]] = oMDData[i];
      }

      s.metadata = oData;

      if (s._iO.onmetadata) {
        s._iO.onmetadata.call(s, s.metadata);
      }

    };

    this._onid3 = function(oID3Props, oID3Data) {

      /**
       * internal: flash 8 + flash 9 ID3 feature
       * may include artist, song title etc.
       *
       * @param {array} oID3Props (names)
       * @param {array} oID3Data (values)
       */

      sm2._wD(s.id + ': ID3 data received.');

      var oData = [], i, j;

      for (i = 0, j = oID3Props.length; i < j; i++) {
        oData[oID3Props[i]] = oID3Data[i];
      }

      s.id3 = mixin(s.id3, oData);

      if (s._iO.onid3) {
        s._iO.onid3.apply(s);
      }

    };

    // flash/RTMP-only

    this._onconnect = function(bSuccess) {

      bSuccess = (bSuccess === 1);
      sm2._wD(s.id + ': ' + (bSuccess ? 'Connected.' : 'Failed to connect? - ' + s.url), (bSuccess ? 1 : 2));
      s.connected = bSuccess;

      if (bSuccess) {

        s.failures = 0;

        if (idCheck(s.id)) {
          if (s.getAutoPlay()) {
            // only update the play state if auto playing
            s.play(_undefined, s.getAutoPlay());
          } else if (s._iO.autoLoad) {
            s.load();
          }
        }

        if (s._iO.onconnect) {
          s._iO.onconnect.apply(s, [bSuccess]);
        }

      }

    };

    this._ondataerror = function(sError) {

      // flash 9 wave/eq data handler
      // hack: called at start, and end from flash at/after onfinish()
      if (s.playState > 0) {
        sm2._wD(s.id + ': Data error: ' + sError);
        if (s._iO.ondataerror) {
          s._iO.ondataerror.apply(s);
        }
      }

    };

    // <d>
    this._debug();
    // </d>

  }; // SMSound()

  /**
   * Private SoundManager internals
   * ------------------------------
   */

  getDocument = function() {

    return (doc.body || doc.getElementsByTagName('div')[0]);

  };

  id = function(sID) {

    return doc.getElementById(sID);

  };

  mixin = function(oMain, oAdd) {

    // non-destructive merge
    var o1 = (oMain || {}), o2, o;

    // if unspecified, o2 is the default options object
    o2 = (oAdd === _undefined ? sm2.defaultOptions : oAdd);

    for (o in o2) {

      if (o2.hasOwnProperty(o) && o1[o] === _undefined) {

        if (typeof o2[o] !== 'object' || o2[o] === null) {

          // assign directly
          o1[o] = o2[o];

        } else {

          // recurse through o2
          o1[o] = mixin(o1[o], o2[o]);

        }

      }

    }

    return o1;

  };

  wrapCallback = function(oSound, callback) {

    /**
     * 03/03/2013: Fix for Flash Player 11.6.602.171 + Flash 8 (flashVersion = 8) SWF issue
     * setTimeout() fix for certain SMSound callbacks like onload() and onfinish(), where subsequent calls like play() and load() fail when Flash Player 11.6.602.171 is installed, and using soundManager with flashVersion = 8 (which is the default).
     * Not sure of exact cause. Suspect race condition and/or invalid (NaN-style) position argument trickling down to the next JS -> Flash _start() call, in the play() case.
     * Fix: setTimeout() to yield, plus safer null / NaN checking on position argument provided to Flash.
     * https://getsatisfaction.com/schillmania/topics/recent_chrome_update_seems_to_have_broken_my_sm2_audio_player
     */
    if (!oSound.isHTML5 && fV === 8) {
      window.setTimeout(callback, 0);
    } else {
      callback();
    }

  };

  // additional soundManager properties that soundManager.setup() will accept

  extraOptions = {
    'onready': 1,
    'ontimeout': 1,
    'defaultOptions': 1,
    'flash9Options': 1,
    'movieStarOptions': 1
  };

  assign = function(o, oParent) {

    /**
     * recursive assignment of properties, soundManager.setup() helper
     * allows property assignment based on whitelist
     */

    var i,
        result = true,
        hasParent = (oParent !== _undefined),
        setupOptions = sm2.setupOptions,
        bonusOptions = extraOptions;

    // <d>

    // if soundManager.setup() called, show accepted parameters.

    if (o === _undefined) {

      result = [];

      for (i in setupOptions) {

        if (setupOptions.hasOwnProperty(i)) {
          result.push(i);
        }

      }

      for (i in bonusOptions) {

        if (bonusOptions.hasOwnProperty(i)) {

          if (typeof sm2[i] === 'object') {
            result.push(i + ': {...}');
          } else if (sm2[i] instanceof Function) {
            result.push(i + ': function() {...}');
          } else {
            result.push(i);
          }

        }

      }

      sm2._wD(str('setup', result.join(', ')));

      return false;

    }

    // </d>

    for (i in o) {

      if (o.hasOwnProperty(i)) {

        // if not an {object} we want to recurse through...

        if (typeof o[i] !== 'object' || o[i] === null || o[i] instanceof Array || o[i] instanceof RegExp) {

          // check "allowed" options

          if (hasParent && bonusOptions[oParent] !== _undefined) {

            // valid recursive / nested object option, eg., { defaultOptions: { volume: 50 } }
            sm2[oParent][i] = o[i];

          } else if (setupOptions[i] !== _undefined) {

            // special case: assign to setupOptions object, which soundManager property references
            sm2.setupOptions[i] = o[i];

            // assign directly to soundManager, too
            sm2[i] = o[i];

          } else if (bonusOptions[i] === _undefined) {

            // invalid or disallowed parameter. complain.
            complain(str((sm2[i] === _undefined ? 'setupUndef' : 'setupError'), i), 2);

            result = false;

          } else {

            /**
             * valid extraOptions (bonusOptions) parameter.
             * is it a method, like onready/ontimeout? call it.
             * multiple parameters should be in an array, eg. soundManager.setup({onready: [myHandler, myScope]});
             */

            if (sm2[i] instanceof Function) {

              sm2[i].apply(sm2, (o[i] instanceof Array ? o[i] : [o[i]]));

            } else {

              // good old-fashioned direct assignment
              sm2[i] = o[i];

            }

          }

        } else {

          // recursion case, eg., { defaultOptions: { ... } }

          if (bonusOptions[i] === _undefined) {

            // invalid or disallowed parameter. complain.
            complain(str((sm2[i] === _undefined ? 'setupUndef' : 'setupError'), i), 2);

            result = false;

          } else {

            // recurse through object
            return assign(o[i], i);

          }

        }

      }

    }

    return result;

  };

  function preferFlashCheck(kind) {

    // whether flash should play a given type
    return (sm2.preferFlash && hasFlash && !sm2.ignoreFlash && (sm2.flash[kind] !== _undefined && sm2.flash[kind]));

  }

  /**
   * Internal DOM2-level event helpers
   * ---------------------------------
   */

  event = (function() {

    // normalize event methods
    var old = (window.attachEvent),
    evt = {
      add: (old ? 'attachEvent' : 'addEventListener'),
      remove: (old ? 'detachEvent' : 'removeEventListener')
    };

    // normalize "on" event prefix, optional capture argument
    function getArgs(oArgs) {

      var args = slice.call(oArgs),
          len = args.length;

      if (old) {
        // prefix
        args[1] = 'on' + args[1];
        if (len > 3) {
          // no capture
          args.pop();
        }
      } else if (len === 3) {
        args.push(false);
      }

      return args;

    }

    function apply(args, sType) {

      // normalize and call the event method, with the proper arguments
      var element = args.shift(),
          method = [evt[sType]];

      if (old) {
        // old IE can't do apply().
        element[method](args[0], args[1]);
      } else {
        element[method].apply(element, args);
      }

    }

    function add() {
      apply(getArgs(arguments), 'add');
    }

    function remove() {
      apply(getArgs(arguments), 'remove');
    }

    return {
      'add': add,
      'remove': remove
    };

  }());

  /**
   * Internal HTML5 event handling
   * -----------------------------
   */

  function html5_event(oFn) {

    // wrap html5 event handlers so we don't call them on destroyed and/or unloaded sounds

    return function(e) {

      var s = this._s,
          result;

      if (!s || !s._a) {
        // <d>
        if (s && s.id) {
          sm2._wD(s.id + ': Ignoring ' + e.type);
        } else {
          sm2._wD(h5 + 'Ignoring ' + e.type);
        }
        // </d>
        result = null;
      } else {
        result = oFn.call(this, e);
      }

      return result;

    };

  }

  html5_events = {

    // HTML5 event-name-to-handler map

    abort: html5_event(function() {

      sm2._wD(this._s.id + ': abort');

    }),

    // enough has loaded to play

    canplay: html5_event(function() {

      var s = this._s,
          position1K;

      if (s._html5_canplay) {
        // this event has already fired. ignore.
        return true;
      }

      s._html5_canplay = true;
      sm2._wD(s.id + ': canplay');
      s._onbufferchange(0);

      // position according to instance options
      position1K = (s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position/msecScale : null);

      // set the position if position was provided before the sound loaded
      if (this.currentTime !== position1K) {
        sm2._wD(s.id + ': canplay: Setting position to ' + position1K);
        try {
          this.currentTime = position1K;
        } catch(ee) {
          sm2._wD(s.id + ': canplay: Setting position of ' + position1K + ' failed: ' + ee.message, 2);
        }
      }

      // hack for HTML5 from/to case
      if (s._iO._oncanplay) {
        s._iO._oncanplay();
      }

    }),

    canplaythrough: html5_event(function() {

      var s = this._s;

      if (!s.loaded) {
        s._onbufferchange(0);
        s._whileloading(s.bytesLoaded, s.bytesTotal, s._get_html5_duration());
        s._onload(true);
      }

    }),

    durationchange: html5_event(function() {

      // durationchange may fire at various times, probably the safest way to capture accurate/final duration.

      var s = this._s,
          duration;

      duration = s._get_html5_duration();

      if (!isNaN(duration) && duration !== s.duration) {

        sm2._wD(this._s.id + ': durationchange (' + duration + ')' + (s.duration ? ', previously ' + s.duration : ''));

        s.durationEstimate = s.duration = duration;

      }

    }),

    // TODO: Reserved for potential use
    /*
    emptied: html5_event(function() {

      sm2._wD(this._s.id + ': emptied');

    }),
    */

    ended: html5_event(function() {

      var s = this._s;

      sm2._wD(s.id + ': ended');

      s._onfinish();

    }),

    error: html5_event(function() {

      sm2._wD(this._s.id + ': HTML5 error, code ' + this.error.code);
      /**
       * HTML5 error codes, per W3C
       * Error 1: Client aborted download at user's request.
       * Error 2: Network error after load started.
       * Error 3: Decoding issue.
       * Error 4: Media (audio file) not supported.
       * Reference: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#error-codes
       */
      // call load with error state?
      this._s._onload(false);

    }),

    loadeddata: html5_event(function() {

      var s = this._s;

      sm2._wD(s.id + ': loadeddata');

      // safari seems to nicely report progress events, eventually totalling 100%
      if (!s._loaded && !isSafari) {
        s.duration = s._get_html5_duration();
      }

    }),

    loadedmetadata: html5_event(function() {

      sm2._wD(this._s.id + ': loadedmetadata');

    }),

    loadstart: html5_event(function() {

      sm2._wD(this._s.id + ': loadstart');
      // assume buffering at first
      this._s._onbufferchange(1);

    }),

    play: html5_event(function() {

      // sm2._wD(this._s.id + ': play()');
      // once play starts, no buffering
      this._s._onbufferchange(0);

    }),

    playing: html5_event(function() {

      sm2._wD(this._s.id + ': playing ' + String.fromCharCode(9835));
      // once play starts, no buffering
      this._s._onbufferchange(0);

    }),

    progress: html5_event(function(e) {

      // note: can fire repeatedly after "loaded" event, due to use of HTTP range/partials

      var s = this._s,
          i, j, progStr, buffered = 0,
          isProgress = (e.type === 'progress'),
          ranges = e.target.buffered,
          // firefox 3.6 implements e.loaded/total (bytes)
          loaded = (e.loaded || 0),
          total = (e.total || 1);

      // reset the "buffered" (loaded byte ranges) array
      s.buffered = [];

      if (ranges && ranges.length) {

        // if loaded is 0, try TimeRanges implementation as % of load
        // https://developer.mozilla.org/en/DOM/TimeRanges

        // re-build "buffered" array
        // HTML5 returns seconds. SM2 API uses msec for setPosition() etc., whether Flash or HTML5.
        for (i = 0, j = ranges.length; i < j; i++) {
          s.buffered.push({
            'start': ranges.start(i) * msecScale,
            'end': ranges.end(i) * msecScale
          });
        }

        // use the last value locally
        buffered = (ranges.end(0) - ranges.start(0)) * msecScale;

        // linear case, buffer sum; does not account for seeking and HTTP partials / byte ranges
        loaded = Math.min(1, buffered / (e.target.duration * msecScale));

        // <d>
        if (isProgress && ranges.length > 1) {
          progStr = [];
          j = ranges.length;
          for (i = 0; i < j; i++) {
            progStr.push((e.target.buffered.start(i) * msecScale) + '-' + (e.target.buffered.end(i) * msecScale));
          }
          sm2._wD(this._s.id + ': progress, timeRanges: ' + progStr.join(', '));
        }

        if (isProgress && !isNaN(loaded)) {
          sm2._wD(this._s.id + ': progress, ' + Math.floor(loaded * 100) + '% loaded');
        }
        // </d>

      }

      if (!isNaN(loaded)) {

        // TODO: prevent calls with duplicate values.
        s._whileloading(loaded, total, s._get_html5_duration());
        if (loaded && total && loaded === total) {
          // in case "onload" doesn't fire (eg. gecko 1.9.2)
          html5_events.canplaythrough.call(this, e);
        }

      }

    }),

    ratechange: html5_event(function() {

      sm2._wD(this._s.id + ': ratechange');

    }),

    suspend: html5_event(function(e) {

      // download paused/stopped, may have finished (eg. onload)
      var s = this._s;

      sm2._wD(this._s.id + ': suspend');
      html5_events.progress.call(this, e);
      s._onsuspend();

    }),

    stalled: html5_event(function() {

      sm2._wD(this._s.id + ': stalled');

    }),

    timeupdate: html5_event(function() {

      this._s._onTimer();

    }),

    waiting: html5_event(function() {

      var s = this._s;

      // see also: seeking
      sm2._wD(this._s.id + ': waiting');

      // playback faster than download rate, etc.
      s._onbufferchange(1);

    })

  };

  html5OK = function(iO) {

    // playability test based on URL or MIME type

    var result;

    if (!iO || (!iO.type && !iO.url && !iO.serverURL)) {

      // nothing to check
      result = false;

    } else if (iO.serverURL || (iO.type && preferFlashCheck(iO.type))) {

      // RTMP, or preferring flash
      result = false;

    } else {

      // Use type, if specified. Pass data: URIs to HTML5. If HTML5-only mode, no other options, so just give 'er
      result = ((iO.type ? html5CanPlay({type:iO.type}) : html5CanPlay({url:iO.url}) || sm2.html5Only || iO.url.match(/data\:/i)));

    }

    return result;

  };

  html5Unload = function(oAudio) {

    /**
     * Internal method: Unload media, and cancel any current/pending network requests.
     * Firefox can load an empty URL, which allegedly destroys the decoder and stops the download.
     * https://developer.mozilla.org/En/Using_audio_and_video_in_Firefox#Stopping_the_download_of_media
     * However, Firefox has been seen loading a relative URL from '' and thus requesting the hosting page on unload.
     * Other UA behaviour is unclear, so everyone else gets an about:blank-style URL.
     */

    var url;

    if (oAudio) {

      // Firefox and Chrome accept short WAVe data: URIs. Chome dislikes audio/wav, but accepts audio/wav for data: MIME.
      // Desktop Safari complains / fails on data: URI, so it gets about:blank.
      url = (isSafari ? emptyURL : (sm2.html5.canPlayType('audio/wav') ? emptyWAV : emptyURL));

      oAudio.src = url;

      // reset some state, too
      if (oAudio._called_unload !== _undefined) {
        oAudio._called_load = false;
      }

    }

    if (useGlobalHTML5Audio) {

      // ensure URL state is trashed, also
      lastGlobalHTML5URL = null;

    }

    return url;

  };

  html5CanPlay = function(o) {

    /**
     * Try to find MIME, test and return truthiness
     * o = {
     *  url: '/path/to/an.mp3',
     *  type: 'audio/mp3'
     * }
     */

    if (!sm2.useHTML5Audio || !sm2.hasHTML5) {
      return false;
    }

    var url = (o.url || null),
        mime = (o.type || null),
        aF = sm2.audioFormats,
        result,
        offset,
        fileExt,
        item;

    // account for known cases like audio/mp3

    if (mime && sm2.html5[mime] !== _undefined) {
      return (sm2.html5[mime] && !preferFlashCheck(mime));
    }

    if (!html5Ext) {
      
      html5Ext = [];
      
      for (item in aF) {
      
        if (aF.hasOwnProperty(item)) {
      
          html5Ext.push(item);
      
          if (aF[item].related) {
            html5Ext = html5Ext.concat(aF[item].related);
          }
      
        }
      
      }
      
      html5Ext = new RegExp('\\.('+html5Ext.join('|')+')(\\?.*)?$','i');
    
    }

    // TODO: Strip URL queries, etc.
    fileExt = (url ? url.toLowerCase().match(html5Ext) : null);

    if (!fileExt || !fileExt.length) {
      
      if (!mime) {
      
        result = false;
      
      } else {
      
        // audio/mp3 -> mp3, result should be known
        offset = mime.indexOf(';');
      
        // strip "audio/X; codecs..."
        fileExt = (offset !== -1 ? mime.substr(0,offset) : mime).substr(6);
      
      }
    
    } else {
    
      // match the raw extension name - "mp3", for example
      fileExt = fileExt[1];
    
    }

    if (fileExt && sm2.html5[fileExt] !== _undefined) {
    
      // result known
      result = (sm2.html5[fileExt] && !preferFlashCheck(fileExt));
    
    } else {
    
      mime = 'audio/' + fileExt;
      result = sm2.html5.canPlayType({type:mime});
    
      sm2.html5[fileExt] = result;
    
      // sm2._wD('canPlayType, found result: ' + result);
      result = (result && sm2.html5[mime] && !preferFlashCheck(mime));
    }

    return result;

  };

  testHTML5 = function() {

    /**
     * Internal: Iterates over audioFormats, determining support eg. audio/mp3, audio/mpeg and so on
     * assigns results to html5[] and flash[].
     */

    if (!sm2.useHTML5Audio || !sm2.hasHTML5) {
    
      // without HTML5, we need Flash.
      sm2.html5.usingFlash = true;
      needsFlash = true;
    
      return false;
    
    }

    // double-whammy: Opera 9.64 throws WRONG_ARGUMENTS_ERR if no parameter passed to Audio(), and Webkit + iOS happily tries to load "null" as a URL. :/
    var a = (Audio !== _undefined ? (isOpera && opera.version() < 10 ? new Audio(null) : new Audio()) : null),
        item, lookup, support = {}, aF, i;

    function cp(m) {

      var canPlay, j,
          result = false,
          isOK = false;

      if (!a || typeof a.canPlayType !== 'function') {
        return result;
      }

      if (m instanceof Array) {
    
        // iterate through all mime types, return any successes
    
        for (i = 0, j = m.length; i < j; i++) {
    
          if (sm2.html5[m[i]] || a.canPlayType(m[i]).match(sm2.html5Test)) {
    
            isOK = true;
            sm2.html5[m[i]] = true;
    
            // note flash support, too
            sm2.flash[m[i]] = !!(m[i].match(flashMIME));
    
          }
    
        }
    
        result = isOK;
    
      } else {
    
        canPlay = (a && typeof a.canPlayType === 'function' ? a.canPlayType(m) : false);
        result = !!(canPlay && (canPlay.match(sm2.html5Test)));
    
      }

      return result;

    }

    // test all registered formats + codecs

    aF = sm2.audioFormats;

    for (item in aF) {

      if (aF.hasOwnProperty(item)) {

        lookup = 'audio/' + item;

        support[item] = cp(aF[item].type);

        // write back generic type too, eg. audio/mp3
        support[lookup] = support[item];

        // assign flash
        if (item.match(flashMIME)) {

          sm2.flash[item] = true;
          sm2.flash[lookup] = true;

        } else {

          sm2.flash[item] = false;
          sm2.flash[lookup] = false;

        }

        // assign result to related formats, too

        if (aF[item] && aF[item].related) {

          for (i = aF[item].related.length - 1; i >= 0; i--) {

            // eg. audio/m4a
            support['audio/' + aF[item].related[i]] = support[item];
            sm2.html5[aF[item].related[i]] = support[item];
            sm2.flash[aF[item].related[i]] = support[item];

          }

        }

      }

    }

    support.canPlayType = (a ? cp : null);
    sm2.html5 = mixin(sm2.html5, support);

    sm2.html5.usingFlash = featureCheck();
    needsFlash = sm2.html5.usingFlash;

    return true;

  };

  strings = {

    // <d>
    notReady: 'Unavailable - wait until onready() has fired.',
    notOK: 'Audio support is not available.',
    domError: sm + 'exception caught while appending SWF to DOM.',
    spcWmode: 'Removing wmode, preventing known SWF loading issue(s)',
    swf404: smc + 'Verify that %s is a valid path.',
    tryDebug: 'Try ' + sm + '.debugFlash = true for more security details (output goes to SWF.)',
    checkSWF: 'See SWF output for more debug info.',
    localFail: smc + 'Non-HTTP page (' + doc.location.protocol + ' URL?) Review Flash player security settings for this special case:\nhttp://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html\nMay need to add/allow path, eg. c:/sm2/ or /users/me/sm2/',
    waitFocus: smc + 'Special case: Waiting for SWF to load with window focus...',
    waitForever: smc + 'Waiting indefinitely for Flash (will recover if unblocked)...',
    waitSWF: smc + 'Waiting for 100% SWF load...',
    needFunction: smc + 'Function object expected for %s',
    badID: 'Sound ID "%s" should be a string, starting with a non-numeric character',
    currentObj: smc + '_debug(): Current sound objects',
    waitOnload: smc + 'Waiting for window.onload()',
    docLoaded: smc + 'Document already loaded',
    onload: smc + 'initComplete(): calling soundManager.onload()',
    onloadOK: sm + '.onload() complete',
    didInit: smc + 'init(): Already called?',
    secNote: 'Flash security note: Network/internet URLs will not load due to security restrictions. Access can be configured via Flash Player Global Security Settings Page: http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html',
    badRemove: smc + 'Failed to remove Flash node.',
    shutdown: sm + '.disable(): Shutting down',
    queue: smc + 'Queueing %s handler',
    smError: 'SMSound.load(): Exception: JS-Flash communication failed, or JS error.',
    fbTimeout: 'No flash response, applying .' + swfCSS.swfTimedout + ' CSS...',
    fbLoaded: 'Flash loaded',
    fbHandler: smc + 'flashBlockHandler()',
    manURL: 'SMSound.load(): Using manually-assigned URL',
    onURL: sm + '.load(): current URL already assigned.',
    badFV: sm + '.flashVersion must be 8 or 9. "%s" is invalid. Reverting to %s.',
    as2loop: 'Note: Setting stream:false so looping can work (flash 8 limitation)',
    noNSLoop: 'Note: Looping not implemented for MovieStar formats',
    needfl9: 'Note: Switching to flash 9, required for MP4 formats.',
    mfTimeout: 'Setting flashLoadTimeout = 0 (infinite) for off-screen, mobile flash case',
    needFlash: smc + 'Fatal error: Flash is needed to play some required formats, but is not available.',
    gotFocus: smc + 'Got window focus.',
    policy: 'Enabling usePolicyFile for data access',
    setup: sm + '.setup(): allowed parameters: %s',
    setupError: sm + '.setup(): "%s" cannot be assigned with this method.',
    setupUndef: sm + '.setup(): Could not find option "%s"',
    setupLate: sm + '.setup(): url, flashVersion and html5Test property changes will not take effect until reboot().',
    noURL: smc + 'Flash URL required. Call soundManager.setup({url:...}) to get started.',
    sm2Loaded: 'SoundManager 2: Ready. ' + String.fromCharCode(10003),
    reset: sm + '.reset(): Removing event callbacks',
    mobileUA: 'Mobile UA detected, preferring HTML5 by default.',
    globalHTML5: 'Using singleton HTML5 Audio() pattern for this device.',
    ignoreMobile: 'Ignoring mobile restrictions for this device.'
    // </d>

  };

  str = function() {

    // internal string replace helper.
    // arguments: o [,items to replace]
    // <d>

    var args,
        i, j, o,
        sstr;

    // real array, please
    args = slice.call(arguments);

    // first argument
    o = args.shift();

    sstr = (strings && strings[o] ? strings[o] : '');

    if (sstr && args && args.length) {
      for (i = 0, j = args.length; i < j; i++) {
        sstr = sstr.replace('%s', args[i]);
      }
    }

    return sstr;
    // </d>

  };

  loopFix = function(sOpt) {

    // flash 8 requires stream = false for looping to work
    if (fV === 8 && sOpt.loops > 1 && sOpt.stream) {
      _wDS('as2loop');
      sOpt.stream = false;
    }

    return sOpt;

  };

  policyFix = function(sOpt, sPre) {

    if (sOpt && !sOpt.usePolicyFile && (sOpt.onid3 || sOpt.usePeakData || sOpt.useWaveformData || sOpt.useEQData)) {
      sm2._wD((sPre || '') + str('policy'));
      sOpt.usePolicyFile = true;
    }

    return sOpt;

  };

  complain = function(sMsg) {

    // <d>
    if (hasConsole && console.warn !== _undefined) {
      console.warn(sMsg);
    } else {
      sm2._wD(sMsg);
    }
    // </d>

  };

  doNothing = function() {

    return false;

  };

  disableObject = function(o) {

    var oProp;

    for (oProp in o) {
      if (o.hasOwnProperty(oProp) && typeof o[oProp] === 'function') {
        o[oProp] = doNothing;
      }
    }

    oProp = null;

  };

  failSafely = function(bNoDisable) {

    // general failure exception handler

    if (bNoDisable === _undefined) {
      bNoDisable = false;
    }

    if (disabled || bNoDisable) {
      sm2.disable(bNoDisable);
    }

  };

  normalizeMovieURL = function(smURL) {

    var urlParams = null, url;

    if (smURL) {
      
      if (smURL.match(/\.swf(\?.*)?$/i)) {
      
        urlParams = smURL.substr(smURL.toLowerCase().lastIndexOf('.swf?') + 4);
      
        if (urlParams) {
          // assume user knows what they're doing
          return smURL;
        }
      
      } else if (smURL.lastIndexOf('/') !== smURL.length - 1) {
      
        // append trailing slash, if needed
        smURL += '/';
      
      }
    
    }

    url = (smURL && smURL.lastIndexOf('/') !== - 1 ? smURL.substr(0, smURL.lastIndexOf('/') + 1) : './') + sm2.movieURL;

    if (sm2.noSWFCache) {
      url += ('?ts=' + new Date().getTime());
    }

    return url;

  };

  setVersionInfo = function() {

    // short-hand for internal use

    fV = parseInt(sm2.flashVersion, 10);

    if (fV !== 8 && fV !== 9) {
      sm2._wD(str('badFV', fV, defaultFlashVersion));
      sm2.flashVersion = fV = defaultFlashVersion;
    }

    // debug flash movie, if applicable

    var isDebug = (sm2.debugMode || sm2.debugFlash ? '_debug.swf' : '.swf');

    if (sm2.useHTML5Audio && !sm2.html5Only && sm2.audioFormats.mp4.required && fV < 9) {
      sm2._wD(str('needfl9'));
      sm2.flashVersion = fV = 9;
    }

    sm2.version = sm2.versionNumber + (sm2.html5Only ? ' (HTML5-only mode)' : (fV === 9 ? ' (AS3/Flash 9)' : ' (AS2/Flash 8)'));

    // set up default options
    if (fV > 8) {
    
      // +flash 9 base options
      sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.flash9Options);
      sm2.features.buffering = true;
    
      // +moviestar support
      sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.movieStarOptions);
      sm2.filePatterns.flash9 = new RegExp('\\.(mp3|' + netStreamTypes.join('|') + ')(\\?.*)?$', 'i');
      sm2.features.movieStar = true;
    
    } else {
    
      sm2.features.movieStar = false;
    
    }

    // regExp for flash canPlay(), etc.
    sm2.filePattern = sm2.filePatterns[(fV !== 8 ? 'flash9' : 'flash8')];

    // if applicable, use _debug versions of SWFs
    sm2.movieURL = (fV === 8 ? 'soundmanager2.swf' : 'soundmanager2_flash9.swf').replace('.swf', isDebug);

    sm2.features.peakData = sm2.features.waveformData = sm2.features.eqData = (fV > 8);

  };

  setPolling = function(bPolling, bHighPerformance) {

    if (!flash) {
      return false;
    }

    flash._setPolling(bPolling, bHighPerformance);

  };

  initDebug = function() {

    // starts debug mode, creating output <div> for UAs without console object

    // allow force of debug mode via URL
    // <d>
    if (sm2.debugURLParam.test(wl)) {
      sm2.setupOptions.debugMode = sm2.debugMode = true;
    }

    if (id(sm2.debugID)) {
      return false;
    }

    var oD, oDebug, oTarget, oToggle, tmp;

    if (sm2.debugMode && !id(sm2.debugID) && (!hasConsole || !sm2.useConsole || !sm2.consoleOnly)) {

      oD = doc.createElement('div');
      oD.id = sm2.debugID + '-toggle';

      oToggle = {
        'position': 'fixed',
        'bottom': '0px',
        'right': '0px',
        'width': '1.2em',
        'height': '1.2em',
        'lineHeight': '1.2em',
        'margin': '2px',
        'textAlign': 'center',
        'border': '1px solid #999',
        'cursor': 'pointer',
        'background': '#fff',
        'color': '#333',
        'zIndex': 10001
      };

      oD.appendChild(doc.createTextNode('-'));
      oD.onclick = toggleDebug;
      oD.title = 'Toggle SM2 debug console';

      if (ua.match(/msie 6/i)) {
        oD.style.position = 'absolute';
        oD.style.cursor = 'hand';
      }

      for (tmp in oToggle) {
        if (oToggle.hasOwnProperty(tmp)) {
          oD.style[tmp] = oToggle[tmp];
        }
      }

      oDebug = doc.createElement('div');
      oDebug.id = sm2.debugID;
      oDebug.style.display = (sm2.debugMode ? 'block' : 'none');

      if (sm2.debugMode && !id(oD.id)) {
        try {
          oTarget = getDocument();
          oTarget.appendChild(oD);
        } catch(e2) {
          throw new Error(str('domError') + ' \n' + e2.toString());
        }
        oTarget.appendChild(oDebug);
      }

    }

    oTarget = null;
    // </d>

  };

  idCheck = this.getSoundById;

  // <d>
  _wDS = function(o, errorLevel) {

    return (!o ? '' : sm2._wD(str(o), errorLevel));

  };

  toggleDebug = function() {

    var o = id(sm2.debugID),
    oT = id(sm2.debugID + '-toggle');

    if (!o) {
      return false;
    }

    if (debugOpen) {
      // minimize
      oT.innerHTML = '+';
      o.style.display = 'none';
    } else {
      oT.innerHTML = '-';
      o.style.display = 'block';
    }

    debugOpen = !debugOpen;

  };

  debugTS = function(sEventType, bSuccess, sMessage) {

    // troubleshooter debug hooks

    if (window.sm2Debugger !== _undefined) {
      try {
        sm2Debugger.handleEvent(sEventType, bSuccess, sMessage);
      } catch(e) {
        // oh well
        return false;
      }
    }

    return true;

  };
  // </d>

  getSWFCSS = function() {

    var css = [];

    if (sm2.debugMode) {
      css.push(swfCSS.sm2Debug);
    }

    if (sm2.debugFlash) {
      css.push(swfCSS.flashDebug);
    }

    if (sm2.useHighPerformance) {
      css.push(swfCSS.highPerf);
    }

    return css.join(' ');

  };

  flashBlockHandler = function() {

    // *possible* flash block situation.

    var name = str('fbHandler'),
        p = sm2.getMoviePercent(),
        css = swfCSS,
        error = {
          type:'FLASHBLOCK'
        };

    if (sm2.html5Only) {
      // no flash, or unused
      return false;
    }

    if (!sm2.ok()) {

      if (needsFlash) {
        // make the movie more visible, so user can fix
        sm2.oMC.className = getSWFCSS() + ' ' + css.swfDefault + ' ' + (p === null ? css.swfTimedout : css.swfError);
        sm2._wD(name + ': ' + str('fbTimeout') + (p ? ' (' + str('fbLoaded') + ')' : ''));
      }

      sm2.didFlashBlock = true;

      // fire onready(), complain lightly
      processOnEvents({
        type: 'ontimeout',
        ignoreInit: true,
        error: error
      });

      catchError(error);

    } else {

      // SM2 loaded OK (or recovered)

      // <d>
      if (sm2.didFlashBlock) {
        sm2._wD(name + ': Unblocked');
      }
      // </d>

      if (sm2.oMC) {
        sm2.oMC.className = [getSWFCSS(), css.swfDefault, css.swfLoaded + (sm2.didFlashBlock ? ' ' + css.swfUnblocked : '')].join(' ');
      }

    }

  };

  addOnEvent = function(sType, oMethod, oScope) {

    if (on_queue[sType] === _undefined) {
      on_queue[sType] = [];
    }

    on_queue[sType].push({
      'method': oMethod,
      'scope': (oScope || null),
      'fired': false
    });

  };

  processOnEvents = function(oOptions) {

    // if unspecified, assume OK/error

    if (!oOptions) {
      oOptions = {
        type: (sm2.ok() ? 'onready' : 'ontimeout')
      };
    }

    if (!didInit && oOptions && !oOptions.ignoreInit) {
      // not ready yet.
      return false;
    }

    if (oOptions.type === 'ontimeout' && (sm2.ok() || (disabled && !oOptions.ignoreInit))) {
      // invalid case
      return false;
    }

    var status = {
          success: (oOptions && oOptions.ignoreInit ? sm2.ok() : !disabled)
        },

        // queue specified by type, or none
        srcQueue = (oOptions && oOptions.type ? on_queue[oOptions.type] || [] : []),

        queue = [], i, j,
        args = [status],
        canRetry = (needsFlash && !sm2.ok());

    if (oOptions.error) {
      args[0].error = oOptions.error;
    }

    for (i = 0, j = srcQueue.length; i < j; i++) {
      if (srcQueue[i].fired !== true) {
        queue.push(srcQueue[i]);
      }
    }

    if (queue.length) {
    
      // sm2._wD(sm + ': Firing ' + queue.length + ' ' + oOptions.type + '() item' + (queue.length === 1 ? '' : 's')); 
      for (i = 0, j = queue.length; i < j; i++) {
      
        if (queue[i].scope) {
          queue[i].method.apply(queue[i].scope, args);
        } else {
          queue[i].method.apply(this, args);
        }
      
        if (!canRetry) {
          // useFlashBlock and SWF timeout case doesn't count here.
          queue[i].fired = true;
      
        }
      
      }
    
    }

    return true;

  };

  initUserOnload = function() {

    window.setTimeout(function() {

      if (sm2.useFlashBlock) {
        flashBlockHandler();
      }

      processOnEvents();

      // call user-defined "onload", scoped to window

      if (typeof sm2.onload === 'function') {
        _wDS('onload', 1);
        sm2.onload.apply(window);
        _wDS('onloadOK', 1);
      }

      if (sm2.waitForWindowLoad) {
        event.add(window, 'load', initUserOnload);
      }

    }, 1);

  };

  detectFlash = function() {

    /**
     * Hat tip: Flash Detect library (BSD, (C) 2007) by Carl "DocYes" S. Yestrau
     * http://featureblend.com/javascript-flash-detection-library.html / http://featureblend.com/license.txt
     */

    if (hasFlash !== _undefined) {
      // this work has already been done.
      return hasFlash;
    }

    var hasPlugin = false, n = navigator, nP = n.plugins, obj, type, types, AX = window.ActiveXObject;

    if (nP && nP.length) {
      
      type = 'application/x-shockwave-flash';
      types = n.mimeTypes;
      
      if (types && types[type] && types[type].enabledPlugin && types[type].enabledPlugin.description) {
        hasPlugin = true;
      }
    
    } else if (AX !== _undefined && !ua.match(/MSAppHost/i)) {
    
      // Windows 8 Store Apps (MSAppHost) are weird (compatibility?) and won't complain here, but will barf if Flash/ActiveX object is appended to the DOM.
      try {
        obj = new AX('ShockwaveFlash.ShockwaveFlash');
      } catch(e) {
        // oh well
        obj = null;
      }
      
      hasPlugin = (!!obj);
      
      // cleanup, because it is ActiveX after all
      obj = null;
    
    }

    hasFlash = hasPlugin;

    return hasPlugin;

  };

featureCheck = function() {

    var flashNeeded,
        item,
        formats = sm2.audioFormats,
        // iPhone <= 3.1 has broken HTML5 audio(), but firmware 3.2 (original iPad) + iOS4 works.
        isSpecial = (is_iDevice && !!(ua.match(/os (1|2|3_0|3_1)\s/i)));

    if (isSpecial) {

      // has Audio(), but is broken; let it load links directly.
      sm2.hasHTML5 = false;

      // ignore flash case, however
      sm2.html5Only = true;

      // hide the SWF, if present
      if (sm2.oMC) {
        sm2.oMC.style.display = 'none';
      }

    } else {

      if (sm2.useHTML5Audio) {

        if (!sm2.html5 || !sm2.html5.canPlayType) {
          sm2._wD('SoundManager: No HTML5 Audio() support detected.');
          sm2.hasHTML5 = false;
        }

        // <d>
        if (isBadSafari) {
          sm2._wD(smc + 'Note: Buggy HTML5 Audio in Safari on this OS X release, see https://bugs.webkit.org/show_bug.cgi?id=32159 - ' + (!hasFlash ? ' would use flash fallback for MP3/MP4, but none detected.' : 'will use flash fallback for MP3/MP4, if available'), 1);
        }
        // </d>

      }

    }

    if (sm2.useHTML5Audio && sm2.hasHTML5) {

      // sort out whether flash is optional, required or can be ignored.

      // innocent until proven guilty.
      canIgnoreFlash = true;

      for (item in formats) {
        
        if (formats.hasOwnProperty(item)) {
        
          if (formats[item].required) {
        
            if (!sm2.html5.canPlayType(formats[item].type)) {
        
              // 100% HTML5 mode is not possible.
              canIgnoreFlash = false;
              flashNeeded = true;
        
            } else if (sm2.preferFlash && (sm2.flash[item] || sm2.flash[formats[item].type])) {
        
              // flash may be required, or preferred for this format.
              flashNeeded = true;
        
            }
        
          }

        }

      }

    }

    // sanity check...
    if (sm2.ignoreFlash) {
      flashNeeded = false;
      canIgnoreFlash = true;
    }

    sm2.html5Only = (sm2.hasHTML5 && sm2.useHTML5Audio && !flashNeeded);

    return (!sm2.html5Only);

  };

  parseURL = function(url) {

    /**
     * Internal: Finds and returns the first playable URL (or failing that, the first URL.)
     * @param {string or array} url A single URL string, OR, an array of URL strings or {url:'/path/to/resource', type:'audio/mp3'} objects.
     */

    var i, j, urlResult = 0, result;

    if (url instanceof Array) {

      // find the first good one
      for (i = 0, j = url.length; i < j; i++) {

        if (url[i] instanceof Object) {

          // MIME check
          if (sm2.canPlayMIME(url[i].type)) {
            urlResult = i;
            break;
          }

        } else if (sm2.canPlayURL(url[i])) {

          // URL string check
          urlResult = i;
          break;

        }

      }

      // normalize to string
      if (url[urlResult].url) {
        url[urlResult] = url[urlResult].url;
      }

      result = url[urlResult];

    } else {

      // single URL case
      result = url;

    }

    return result;

  };


  startTimer = function(oSound) {

    /**
     * attach a timer to this sound, and start an interval if needed
     */

    if (!oSound._hasTimer) {

      oSound._hasTimer = true;

      if (!mobileHTML5 && sm2.html5PollingInterval) {

        if (h5IntervalTimer === null && h5TimerCount === 0) {

          h5IntervalTimer = setInterval(timerExecute, sm2.html5PollingInterval);

        }

        h5TimerCount++;

      }

    }

  };

  stopTimer = function(oSound) {

    /**
     * detach a timer
     */

    if (oSound._hasTimer) {

      oSound._hasTimer = false;

      if (!mobileHTML5 && sm2.html5PollingInterval) {

        // interval will stop itself at next execution.

        h5TimerCount--;

      }

    }

  };

  timerExecute = function() {

    /**
     * manual polling for HTML5 progress events, ie., whileplaying()
     * (can achieve greater precision than conservative default HTML5 interval)
     */

    var i;

    if (h5IntervalTimer !== null && !h5TimerCount) {

      // no active timers, stop polling interval.

      clearInterval(h5IntervalTimer);

      h5IntervalTimer = null;

      return false;

    }

    // check all HTML5 sounds with timers

    for (i = sm2.soundIDs.length - 1; i >= 0; i--) {

      if (sm2.sounds[sm2.soundIDs[i]].isHTML5 && sm2.sounds[sm2.soundIDs[i]]._hasTimer) {
        sm2.sounds[sm2.soundIDs[i]]._onTimer();
      }

    }

  };

  catchError = function(options) {

    options = (options !== _undefined ? options : {});

    if (typeof sm2.onerror === 'function') {
      sm2.onerror.apply(window, [{
        type: (options.type !== _undefined ? options.type : null)
      }]);
    }

    if (options.fatal !== _undefined && options.fatal) {
      sm2.disable();
    }

  };

  badSafariFix = function() {

    // special case: "bad" Safari (OS X 10.3 - 10.7) must fall back to flash for MP3/MP4
    if (!isBadSafari || !detectFlash()) {
      // doesn't apply
      return false;
    }

    var aF = sm2.audioFormats, i, item;

    for (item in aF) {

      if (aF.hasOwnProperty(item)) {

        if (item === 'mp3' || item === 'mp4') {

          sm2._wD(sm + ': Using flash fallback for ' + item + ' format');
          sm2.html5[item] = false;

          // assign result to related formats, too
          if (aF[item] && aF[item].related) {
            for (i = aF[item].related.length - 1; i >= 0; i--) {
              sm2.html5[aF[item].related[i]] = false;
            }
          }

        }

      }

    }

  };

  /**
   * Pseudo-private flash/ExternalInterface methods
   * ----------------------------------------------
   */

  this._setSandboxType = function(sandboxType) {

    // <d>
    // Security sandbox according to Flash plugin
    var sb = sm2.sandbox;

    sb.type = sandboxType;
    sb.description = sb.types[(sb.types[sandboxType] !== _undefined?sandboxType : 'unknown')];

    if (sb.type === 'localWithFile') {

      sb.noRemote = true;
      sb.noLocal = false;
      _wDS('secNote', 2);

    } else if (sb.type === 'localWithNetwork') {

      sb.noRemote = false;
      sb.noLocal = true;

    } else if (sb.type === 'localTrusted') {

      sb.noRemote = false;
      sb.noLocal = false;

    }
    // </d>

  };

  this._externalInterfaceOK = function(swfVersion) {

    // flash callback confirming flash loaded, EI working etc.
    // swfVersion: SWF build string

    if (sm2.swfLoaded) {
      return false;
    }

    var e;

    debugTS('swf', true);
    debugTS('flashtojs', true);
    sm2.swfLoaded = true;
    tryInitOnFocus = false;

    if (isBadSafari) {
      badSafariFix();
    }

    // complain if JS + SWF build/version strings don't match, excluding +DEV builds
    // <d>
    if (!swfVersion || swfVersion.replace(/\+dev/i,'') !== sm2.versionNumber.replace(/\+dev/i, '')) {

      e = sm + ': Fatal: JavaScript file build "' + sm2.versionNumber + '" does not match Flash SWF build "' + swfVersion + '" at ' + sm2.url + '. Ensure both are up-to-date.';

      // escape flash -> JS stack so this error fires in window.
      setTimeout(function versionMismatch() {
        throw new Error(e);
      }, 0);

      // exit, init will fail with timeout
      return false;

    }
    // </d>

    // IE needs a larger timeout
    setTimeout(init, isIE ? 100 : 1);

  };

  /**
   * Private initialization helpers
   * ------------------------------
   */

  createMovie = function(smID, smURL) {

    if (didAppend && appendSuccess) {
      // ignore if already succeeded
      return false;
    }

    function initMsg() {

      // <d>

      var options = [],
          title,
          msg = [],
          delimiter = ' + ';

      title = 'SoundManager ' + sm2.version + (!sm2.html5Only && sm2.useHTML5Audio ? (sm2.hasHTML5 ? ' + HTML5 audio' : ', no HTML5 audio support') : '');

      if (!sm2.html5Only) {

        if (sm2.preferFlash) {
          options.push('preferFlash');
        }

        if (sm2.useHighPerformance) {
          options.push('useHighPerformance');
        }

        if (sm2.flashPollingInterval) {
          options.push('flashPollingInterval (' + sm2.flashPollingInterval + 'ms)');
        }

        if (sm2.html5PollingInterval) {
          options.push('html5PollingInterval (' + sm2.html5PollingInterval + 'ms)');
        }

        if (sm2.wmode) {
          options.push('wmode (' + sm2.wmode + ')');
        }

        if (sm2.debugFlash) {
          options.push('debugFlash');
        }

        if (sm2.useFlashBlock) {
          options.push('flashBlock');
        }

      } else {

        if (sm2.html5PollingInterval) {
          options.push('html5PollingInterval (' + sm2.html5PollingInterval + 'ms)');
        }

      }

      if (options.length) {
        msg = msg.concat([options.join(delimiter)]);
      }

      sm2._wD(title + (msg.length ? delimiter + msg.join(', ') : ''), 1);

      showSupport();

      // </d>

    }

    if (sm2.html5Only) {

      // 100% HTML5 mode
      setVersionInfo();

      initMsg();
      sm2.oMC = id(sm2.movieID);
      init();

      // prevent multiple init attempts
      didAppend = true;

      appendSuccess = true;

      return false;

    }

    // flash path
    var remoteURL = (smURL || sm2.url),
    localURL = (sm2.altURL || remoteURL),
    swfTitle = 'JS/Flash audio component (SoundManager 2)',
    oTarget = getDocument(),
    extraClass = getSWFCSS(),
    isRTL = null,
    html = doc.getElementsByTagName('html')[0],
    oEmbed, oMovie, tmp, movieHTML, oEl, s, x, sClass;

    isRTL = (html && html.dir && html.dir.match(/rtl/i));
    smID = (smID === _undefined ? sm2.id : smID);

    function param(name, value) {
      return '<param name="' + name + '" value="' + value + '" />';
    }

    // safety check for legacy (change to Flash 9 URL)
    setVersionInfo();
    sm2.url = normalizeMovieURL(overHTTP ? remoteURL : localURL);
    smURL = sm2.url;

    sm2.wmode = (!sm2.wmode && sm2.useHighPerformance ? 'transparent' : sm2.wmode);

    if (sm2.wmode !== null && (ua.match(/msie 8/i) || (!isIE && !sm2.useHighPerformance)) && navigator.platform.match(/win32|win64/i)) {
      /**
       * extra-special case: movie doesn't load until scrolled into view when using wmode = anything but 'window' here
       * does not apply when using high performance (position:fixed means on-screen), OR infinite flash load timeout
       * wmode breaks IE 8 on Vista + Win7 too in some cases, as of January 2011 (?)
       */
      messages.push(strings.spcWmode);
      sm2.wmode = null;
    }

    oEmbed = {
      'name': smID,
      'id': smID,
      'src': smURL,
      'quality': 'high',
      'allowScriptAccess': sm2.allowScriptAccess,
      'bgcolor': sm2.bgColor,
      'pluginspage': http + 'www.macromedia.com/go/getflashplayer',
      'title': swfTitle,
      'type': 'application/x-shockwave-flash',
      'wmode': sm2.wmode,
      // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
      'hasPriority': 'true'
    };

    if (sm2.debugFlash) {
      oEmbed.FlashVars = 'debug=1';
    }

    if (!sm2.wmode) {
      // don't write empty attribute
      delete oEmbed.wmode;
    }

    if (isIE) {

      // IE is "special".
      oMovie = doc.createElement('div');
      movieHTML = [
        '<object id="' + smID + '" data="' + smURL + '" type="' + oEmbed.type + '" title="' + oEmbed.title +'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">',
        param('movie', smURL),
        param('AllowScriptAccess', sm2.allowScriptAccess),
        param('quality', oEmbed.quality),
        (sm2.wmode? param('wmode', sm2.wmode): ''),
        param('bgcolor', sm2.bgColor),
        param('hasPriority', 'true'),
        (sm2.debugFlash ? param('FlashVars', oEmbed.FlashVars) : ''),
        '</object>'
      ].join('');

    } else {

      oMovie = doc.createElement('embed');
      for (tmp in oEmbed) {
        if (oEmbed.hasOwnProperty(tmp)) {
          oMovie.setAttribute(tmp, oEmbed[tmp]);
        }
      }

    }

    initDebug();
    extraClass = getSWFCSS();
    oTarget = getDocument();

    if (oTarget) {

      sm2.oMC = (id(sm2.movieID) || doc.createElement('div'));

      if (!sm2.oMC.id) {

        sm2.oMC.id = sm2.movieID;
        sm2.oMC.className = swfCSS.swfDefault + ' ' + extraClass;
        s = null;
        oEl = null;

        if (!sm2.useFlashBlock) {
          if (sm2.useHighPerformance) {
            // on-screen at all times
            s = {
              'position': 'fixed',
              'width': '8px',
              'height': '8px',
              // >= 6px for flash to run fast, >= 8px to start up under Firefox/win32 in some cases. odd? yes.
              'bottom': '0px',
              'left': '0px',
              'overflow': 'hidden'
            };
          } else {
            // hide off-screen, lower priority
            s = {
              'position': 'absolute',
              'width': '6px',
              'height': '6px',
              'top': '-9999px',
              'left': '-9999px'
            };
            if (isRTL) {
              s.left = Math.abs(parseInt(s.left, 10)) + 'px';
            }
          }
        }

        if (isWebkit) {
          // soundcloud-reported render/crash fix, safari 5
          sm2.oMC.style.zIndex = 10000;
        }

        if (!sm2.debugFlash) {
          for (x in s) {
            if (s.hasOwnProperty(x)) {
              sm2.oMC.style[x] = s[x];
            }
          }
        }

        try {

          if (!isIE) {
            sm2.oMC.appendChild(oMovie);
          }

          oTarget.appendChild(sm2.oMC);

          if (isIE) {
            oEl = sm2.oMC.appendChild(doc.createElement('div'));
            oEl.className = swfCSS.swfBox;
            oEl.innerHTML = movieHTML;
          }

          appendSuccess = true;

        } catch(e) {

          throw new Error(str('domError') + ' \n' + e.toString());

        }

      } else {

        // SM2 container is already in the document (eg. flashblock use case)
        sClass = sm2.oMC.className;
        sm2.oMC.className = (sClass ? sClass + ' ' : swfCSS.swfDefault) + (extraClass ? ' ' + extraClass : '');
        sm2.oMC.appendChild(oMovie);

        if (isIE) {
          oEl = sm2.oMC.appendChild(doc.createElement('div'));
          oEl.className = swfCSS.swfBox;
          oEl.innerHTML = movieHTML;
        }

        appendSuccess = true;

      }

    }

    didAppend = true;

    initMsg();

    // sm2._wD(sm + ': Trying to load ' + smURL + (!overHTTP && sm2.altURL ? ' (alternate URL)' : ''), 1);

    return true;

  };

  initMovie = function() {

    if (sm2.html5Only) {
      createMovie();
      return false;
    }

    // attempt to get, or create, movie (may already exist)
    if (flash) {
      return false;
    }

    if (!sm2.url) {

      /**
       * Something isn't right - we've reached init, but the soundManager url property has not been set.
       * User has not called setup({url: ...}), or has not set soundManager.url (legacy use case) directly before init time.
       * Notify and exit. If user calls setup() with a url: property, init will be restarted as in the deferred loading case.
       */

       _wDS('noURL');
       return false;

    }

    // inline markup case
    flash = sm2.getMovie(sm2.id);

    if (!flash) {

      if (!oRemoved) {

        // try to create
        createMovie(sm2.id, sm2.url);

      } else {

        // try to re-append removed movie after reboot()
        if (!isIE) {
          sm2.oMC.appendChild(oRemoved);
        } else {
          sm2.oMC.innerHTML = oRemovedHTML;
        }

        oRemoved = null;
        didAppend = true;

      }

      flash = sm2.getMovie(sm2.id);

    }

    if (typeof sm2.oninitmovie === 'function') {
      setTimeout(sm2.oninitmovie, 1);
    }

    // <d>
    flushMessages();
    // </d>

    return true;

  };

  delayWaitForEI = function() {

    setTimeout(waitForEI, 1000);

  };

  rebootIntoHTML5 = function() {

    // special case: try for a reboot with preferFlash: false, if 100% HTML5 mode is possible and useFlashBlock is not enabled.

    window.setTimeout(function() {

      complain(smc + 'useFlashBlock is false, 100% HTML5 mode is possible. Rebooting with preferFlash: false...');

      sm2.setup({
        preferFlash: false
      }).reboot();

      // if for some reason you want to detect this case, use an ontimeout() callback and look for html5Only and didFlashBlock == true.
      sm2.didFlashBlock = true;

      sm2.beginDelayedInit();

    }, 1);

  };

  waitForEI = function() {

    var p,
        loadIncomplete = false;

    if (!sm2.url) {
      // No SWF url to load (noURL case) - exit for now. Will be retried when url is set.
      return false;
    }

    if (waitingForEI) {
      return false;
    }

    waitingForEI = true;
    event.remove(window, 'load', delayWaitForEI);

    if (hasFlash && tryInitOnFocus && !isFocused) {
      // Safari won't load flash in background tabs, only when focused.
      _wDS('waitFocus');
      return false;
    }

    if (!didInit) {
      p = sm2.getMoviePercent();
      if (p > 0 && p < 100) {
        loadIncomplete = true;
      }
    }

    setTimeout(function() {

      p = sm2.getMoviePercent();

      if (loadIncomplete) {
        // special case: if movie *partially* loaded, retry until it's 100% before assuming failure.
        waitingForEI = false;
        sm2._wD(str('waitSWF'));
        window.setTimeout(delayWaitForEI, 1);
        return false;
      }

      // <d>
      if (!didInit) {

        sm2._wD(sm + ': No Flash response within expected time. Likely causes: ' + (p === 0 ? 'SWF load failed, ' : '') + 'Flash blocked or JS-Flash security error.' + (sm2.debugFlash ? ' ' + str('checkSWF') : ''), 2);

        if (!overHTTP && p) {

          _wDS('localFail', 2);

          if (!sm2.debugFlash) {
            _wDS('tryDebug', 2);
          }

        }

        if (p === 0) {

          // if 0 (not null), probably a 404.
          sm2._wD(str('swf404', sm2.url), 1);

        }

        debugTS('flashtojs', false, ': Timed out' + (overHTTP ? ' (Check flash security or flash blockers)':' (No plugin/missing SWF?)'));

      }
      // </d>

      // give up / time-out, depending

      if (!didInit && okToDisable) {

        if (p === null) {

          // SWF failed to report load progress. Possibly blocked.

          if (sm2.useFlashBlock || sm2.flashLoadTimeout === 0) {

            if (sm2.useFlashBlock) {

              flashBlockHandler();

            }

            _wDS('waitForever');

          } else {

            // no custom flash block handling, but SWF has timed out. Will recover if user unblocks / allows SWF load.

            if (!sm2.useFlashBlock && canIgnoreFlash) {

              rebootIntoHTML5();

            } else {

              _wDS('waitForever');

              // fire any regular registered ontimeout() listeners.
              processOnEvents({
                type: 'ontimeout',
                ignoreInit: true,
                error: {
                  type: 'INIT_FLASHBLOCK'
                }
              });

            }

          }

        } else {

          // SWF loaded? Shouldn't be a blocking issue, then.

          if (sm2.flashLoadTimeout === 0) {

            _wDS('waitForever');

          } else {

            if (!sm2.useFlashBlock && canIgnoreFlash) {

              rebootIntoHTML5();

            } else {

              failSafely(true);

            }

          }

        }

      }

    }, sm2.flashLoadTimeout);

  };

  handleFocus = function() {

    function cleanup() {
      event.remove(window, 'focus', handleFocus);
    }

    if (isFocused || !tryInitOnFocus) {
      // already focused, or not special Safari background tab case
      cleanup();
      return true;
    }

    okToDisable = true;
    isFocused = true;
    _wDS('gotFocus');

    // allow init to restart
    waitingForEI = false;

    // kick off ExternalInterface timeout, now that the SWF has started
    delayWaitForEI();

    cleanup();
    return true;

  };

  flushMessages = function() {

    // <d>

    // SM2 pre-init debug messages
    if (messages.length) {
      sm2._wD('SoundManager 2: ' + messages.join(' '), 1);
      messages = [];
    }

    // </d>

  };

  showSupport = function() {

    // <d>

    flushMessages();

    var item, tests = [];

    if (sm2.useHTML5Audio && sm2.hasHTML5) {
      for (item in sm2.audioFormats) {
        if (sm2.audioFormats.hasOwnProperty(item)) {
          tests.push(item + ' = ' + sm2.html5[item] + (!sm2.html5[item] && needsFlash && sm2.flash[item] ? ' (using flash)' : (sm2.preferFlash && sm2.flash[item] && needsFlash ? ' (preferring flash)' : (!sm2.html5[item] ? ' (' + (sm2.audioFormats[item].required ? 'required, ' : '') + 'and no flash support)' : ''))));
        }
      }
      sm2._wD('SoundManager 2 HTML5 support: ' + tests.join(', '), 1);
    }

    // </d>

  };

  initComplete = function(bNoDisable) {

    if (didInit) {
      return false;
    }

    if (sm2.html5Only) {
      // all good.
      _wDS('sm2Loaded', 1);
      didInit = true;
      initUserOnload();
      debugTS('onload', true);
      return true;
    }

    var wasTimeout = (sm2.useFlashBlock && sm2.flashLoadTimeout && !sm2.getMoviePercent()),
        result = true,
        error;

    if (!wasTimeout) {
      didInit = true;
    }

    error = {
      type: (!hasFlash && needsFlash ? 'NO_FLASH' : 'INIT_TIMEOUT')
    };

    sm2._wD('SoundManager 2 ' + (disabled ? 'failed to load' : 'loaded') + ' (' + (disabled ? 'Flash security/load error' : 'OK') + ') ' + String.fromCharCode(disabled ? 10006 : 10003), disabled ? 2: 1);

    if (disabled || bNoDisable) {

      if (sm2.useFlashBlock && sm2.oMC) {
        sm2.oMC.className = getSWFCSS() + ' ' + (sm2.getMoviePercent() === null ? swfCSS.swfTimedout : swfCSS.swfError);
      }

      processOnEvents({
        type: 'ontimeout',
        error: error,
        ignoreInit: true
      });

      debugTS('onload', false);
      catchError(error);

      result = false;

    } else {

      debugTS('onload', true);

    }

    if (!disabled) {

      if (sm2.waitForWindowLoad && !windowLoaded) {

        _wDS('waitOnload');
        event.add(window, 'load', initUserOnload);

      } else {

        // <d>
        if (sm2.waitForWindowLoad && windowLoaded) {
          _wDS('docLoaded');
        }
        // </d>

        initUserOnload();

      }

    }

    return result;

  };

  /**
   * apply top-level setupOptions object as local properties, eg., this.setupOptions.flashVersion -> this.flashVersion (soundManager.flashVersion)
   * this maintains backward compatibility, and allows properties to be defined separately for use by soundManager.setup().
   */

  setProperties = function() {

    var i,
        o = sm2.setupOptions;

    for (i in o) {

      if (o.hasOwnProperty(i)) {

        // assign local property if not already defined

        if (sm2[i] === _undefined) {

          sm2[i] = o[i];

        } else if (sm2[i] !== o[i]) {

          // legacy support: write manually-assigned property (eg., soundManager.url) back to setupOptions to keep things in sync
          sm2.setupOptions[i] = sm2[i];

        }

      }

    }

  };


  init = function() {

    // called after onload()

    if (didInit) {
      _wDS('didInit');
      return false;
    }

    function cleanup() {
      event.remove(window, 'load', sm2.beginDelayedInit);
    }

    if (sm2.html5Only) {

      if (!didInit) {
        // we don't need no steenking flash!
        cleanup();
        sm2.enabled = true;
        initComplete();
      }

      return true;

    }

    // flash path
    initMovie();

    try {

      // attempt to talk to Flash
      flash._externalInterfaceTest(false);

      /**
       * Apply user-specified polling interval, OR, if "high performance" set, faster vs. default polling
       * (determines frequency of whileloading/whileplaying callbacks, effectively driving UI framerates)
       */
      setPolling(true, (sm2.flashPollingInterval || (sm2.useHighPerformance ? 10 : 50)));

      if (!sm2.debugMode) {
        // stop the SWF from making debug output calls to JS
        flash._disableDebug();
      }

      sm2.enabled = true;
      debugTS('jstoflash', true);

      if (!sm2.html5Only) {
        // prevent browser from showing cached page state (or rather, restoring "suspended" page state) via back button, because flash may be dead
        // http://www.webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
        event.add(window, 'unload', doNothing);
      }

    } catch(e) {

      sm2._wD('js/flash exception: ' + e.toString());

      debugTS('jstoflash', false);

      catchError({
        type: 'JS_TO_FLASH_EXCEPTION',
        fatal: true
      });

      // don't disable, for reboot()
      failSafely(true);

      initComplete();

      return false;

    }

    initComplete();

    // disconnect events
    cleanup();

    return true;

  };

  domContentLoaded = function() {

    if (didDCLoaded) {
      return false;
    }

    didDCLoaded = true;

    // assign top-level soundManager properties eg. soundManager.url
    setProperties();

    initDebug();

    if (!hasFlash && sm2.hasHTML5) {

      sm2._wD('SoundManager 2: No Flash detected' + (!sm2.useHTML5Audio ? ', enabling HTML5.' : '. Trying HTML5-only mode.'), 1);

      sm2.setup({
        'useHTML5Audio': true,
        // make sure we aren't preferring flash, either
        // TODO: preferFlash should not matter if flash is not installed. Currently, stuff breaks without the below tweak.
        'preferFlash': false
      });

    }

    testHTML5();

    if (!hasFlash && needsFlash) {

      messages.push(strings.needFlash);

      // TODO: Fatal here vs. timeout approach, etc.
      // hack: fail sooner.
      sm2.setup({
        'flashLoadTimeout': 1
      });

    }

    if (doc.removeEventListener) {
      doc.removeEventListener('DOMContentLoaded', domContentLoaded, false);
    }

    initMovie();

    return true;

  };

  domContentLoadedIE = function() {

    if (doc.readyState === 'complete') {
      domContentLoaded();
      doc.detachEvent('onreadystatechange', domContentLoadedIE);
    }

    return true;

  };

  winOnLoad = function() {

    // catch edge case of initComplete() firing after window.load()
    windowLoaded = true;

    // catch case where DOMContentLoaded has been sent, but we're still in doc.readyState = 'interactive'
    domContentLoaded();

    event.remove(window, 'load', winOnLoad);

  };

  // sniff up-front
  detectFlash();

  // focus and window load, init (primarily flash-driven)
  event.add(window, 'focus', handleFocus);
  event.add(window, 'load', delayWaitForEI);
  event.add(window, 'load', winOnLoad);

  if (doc.addEventListener) {

    doc.addEventListener('DOMContentLoaded', domContentLoaded, false);

  } else if (doc.attachEvent) {

    doc.attachEvent('onreadystatechange', domContentLoadedIE);

  } else {

    // no add/attachevent support - safe to assume no JS -> Flash either
    debugTS('onload', false);
    catchError({
      type: 'NO_DOM2_EVENTS',
      fatal: true
    });

  }

} // SoundManager()

// SM2_DEFER details: http://www.schillmania.com/projects/soundmanager2/doc/getstarted/#lazy-loading

if (window.SM2_DEFER === _undefined || !SM2_DEFER) {
  soundManager = new SoundManager();
}

/**
 * SoundManager public interfaces
 * ------------------------------
 */

if (typeof module === 'object' && module && typeof module.exports === 'object') {

  /**
   * commonJS module
   */

  module.exports.SoundManager = SoundManager;
  module.exports.soundManager = soundManager;

} else if (typeof define === 'function' && define.amd) {

  /**
   * AMD - requireJS
   * basic usage:
   * require(["/path/to/soundmanager2.js"], function(SoundManager) {
   *   SoundManager.getInstance().setup({
   *     url: '/swf/',
   *     onready: function() { ... }
   *   })
   * });
   *
   * SM2_DEFER usage:
   * window.SM2_DEFER = true;
   * require(["/path/to/soundmanager2.js"], function(SoundManager) {
   *   SoundManager.getInstance(function() {
   *     var soundManager = new SoundManager.constructor();
   *     soundManager.setup({
   *       url: '/swf/',
   *       ...
   *     });
   *     ...
   *     soundManager.beginDelayedInit();
   *     return soundManager;
   *   })
   * }); 
   */

  define(function() {
    /**
     * Retrieve the global instance of SoundManager.
     * If a global instance does not exist it can be created using a callback.
     *
     * @param {Function} smBuilder Optional: Callback used to create a new SoundManager instance
     * @return {SoundManager} The global SoundManager instance
     */
    function getInstance(smBuilder) {
      if (!window.soundManager && smBuilder instanceof Function) {
        var instance = smBuilder(SoundManager);
        if (instance instanceof SoundManager) {
          window.soundManager = instance;
        }
      }
      return window.soundManager;
    }
    return {
      constructor: SoundManager,
      getInstance: getInstance
    }
  });

}

// standard browser case

// constructor
window.SoundManager = SoundManager;

/**
 * note: SM2 requires a window global due to Flash, which makes calls to window.soundManager.
 * Flash may not always be needed, but this is not known until async init and SM2 may even "reboot" into Flash mode.
 */

// public API, flash callbacks etc.
window.soundManager = soundManager;

}(window));

},{}]},{},[4])(4)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy8ucG5wbS9icm93c2VyLXBhY2tANS4wLjEvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInJlcy9idWlsZC9QeWRpb1NvdW5kTWFuYWdlci9QbGF5ZXIuanMiLCJyZXMvYnVpbGQvUHlkaW9Tb3VuZE1hbmFnZXIvYmFkZ2UuanMiLCJyZXMvYnVpbGQvUHlkaW9Tb3VuZE1hbmFnZXIvZWRpdG9yLmpzIiwicmVzL2J1aWxkL1B5ZGlvU291bmRNYW5hZ2VyL2luZGV4LmpzIiwicmVzL2J1aWxkL1B5ZGlvU291bmRNYW5hZ2VyL3ByZXZpZXcuanMiLCJzbS8zNjAtcGxheWVyL3NjcmlwdC8zNjBwbGF5ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvLnBucG0vc291bmRtYW5hZ2VyMkAyLjk3LjIwMTUwNjAxLWEvbm9kZV9tb2R1bGVzL3NvdW5kbWFuYWdlcjIvc2NyaXB0L3NvdW5kbWFuYWdlcjIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ243Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG52YXIgX3Byb3BUeXBlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9wVHlwZXMpO1xuXG52YXIgX3NvdW5kbWFuYWdlcjIgPSByZXF1aXJlKCdzb3VuZG1hbmFnZXIyJyk7XG5cbnZhciBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIgPSByZXF1aXJlKCcuLi8uLi8uLi9zbS8zNjAtcGxheWVyL3NjcmlwdC8zNjBwbGF5ZXInKTtcblxuX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLnNldHVwKHtcbiAgICAvLyBwYXRoIHRvIGRpcmVjdG9yeSBjb250YWluaW5nIFNNMiBTV0ZcbiAgICB1cmw6ICdwbHVnaW5zL2VkaXRvci5zb3VuZG1hbmFnZXIvc20vc3dmLycsXG4gICAgZGVidWdNb2RlOiB0cnVlXG59KTtcblxudmFyIFBsYXllciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhQbGF5ZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gUGxheWVyKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQbGF5ZXIpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFBsYXllci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcblxuICAgICAgICBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5jb25maWcuYXV0b1BsYXkgPSBwcm9wcy5hdXRvUGxheTtcblxuICAgICAgICBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5jb25maWcuc2NhbGVGb250ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvbXNpZS9pKSA/IGZhbHNlIDogdHJ1ZTtcbiAgICAgICAgX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnNob3dITVNUaW1lID0gdHJ1ZTtcblxuICAgICAgICAvLyBlbmFibGUgc29tZSBzcGVjdHJ1bSBzdHVmZnNcbiAgICAgICAgX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZVdhdmVmb3JtRGF0YSA9IHRydWU7XG4gICAgICAgIF9zbTM2MFBsYXllclNjcmlwdDM2MHBsYXllci50aHJlZVNpeHR5UGxheWVyLmNvbmZpZy51c2VFUURhdGEgPSB0cnVlO1xuICAgICAgICB2YXIgb25GaW5pc2ggPSBwcm9wcy5vbkZpbmlzaDtcblxuICAgICAgICBpZiAob25GaW5pc2gpIHtcbiAgICAgICAgICAgIF9zbTM2MFBsYXllclNjcmlwdDM2MHBsYXllci50aHJlZVNpeHR5UGxheWVyLmNvbmZpZy5vbmZpbmlzaCA9IG9uRmluaXNoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZW5hYmxlIHRoaXMgaW4gU00yIGFzIHdlbGwsIGFzIG5lZWRlZFxuICAgICAgICBpZiAoX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZVdhdmVmb3JtRGF0YSkge1xuICAgICAgICAgICAgX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLmZsYXNoOU9wdGlvbnMudXNlV2F2ZWZvcm1EYXRhID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZUVRRGF0YSkge1xuICAgICAgICAgICAgX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLmZsYXNoOU9wdGlvbnMudXNlRVFEYXRhID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZVBlYWtEYXRhKSB7XG4gICAgICAgICAgICBfc291bmRtYW5hZ2VyMi5zb3VuZE1hbmFnZXIuZmxhc2g5T3B0aW9ucy51c2VQZWFrRGF0YSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZVdhdmVmb3JtRGF0YSB8fCBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5mbGFzaDlPcHRpb25zLnVzZUVRRGF0YSB8fCBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5mbGFzaDlPcHRpb25zLnVzZVBlYWtEYXRhKSB7XG4gICAgICAgICAgICAvLyBldmVuIGlmIEhUTUw1IHN1cHBvcnRzIE1QMywgcHJlZmVyIGZsYXNoIHNvIHRoZSB2aXN1YWxpemF0aW9uIGZlYXR1cmVzIGNhbiBiZSB1c2VkLlxuICAgICAgICAgICAgX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLnByZWZlckZsYXNoID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZhdmljb24gaXMgZXhwZW5zaXZlIENQVS13aXNlLCBidXQgY2FuIGJlIHVzZWQuXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvaGlmaS9pKSkge1xuICAgICAgICAgICAgX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZUZhdkljb24gPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9odG1sNS9pKSkge1xuICAgICAgICAgICAgLy8gZm9yIHRlc3RpbmcgSUUgOSwgZXRjLlxuICAgICAgICAgICAgX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLnVzZUhUTUw1QXVkaW8gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFBsYXllciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICBfc291bmRtYW5hZ2VyMi5zb3VuZE1hbmFnZXIub25yZWFkeShfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5pbml0KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkZpbmlzaCkge1xuICAgICAgICAgICAgICAgIF9zbTM2MFBsYXllclNjcmlwdDM2MHBsYXllci50aHJlZVNpeHR5UGxheWVyLmNvbmZpZy5vbmZpbmlzaCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfc291bmRtYW5hZ2VyMi5zb3VuZE1hbmFnZXIuc3RvcEFsbCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkZpbmlzaCkge1xuICAgICAgICAgICAgICAgIF9zbTM2MFBsYXllclNjcmlwdDM2MHBsYXllci50aHJlZVNpeHR5UGxheWVyLmNvbmZpZy5vbmZpbmlzaCA9IHRoaXMucHJvcHMub25GaW5pc2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfc291bmRtYW5hZ2VyMi5zb3VuZE1hbmFnZXIub25yZWFkeShfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5pbml0KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBcInVpMzYwXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5yaWNoKSB7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9IFwiIHVpMzYwLXZpc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IGNsYXNzTmFtZSwgc3R5bGU6IHRoaXMucHJvcHMuc3R5bGUgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFBsYXllcjtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5QbGF5ZXIucHJvcFR5cGVzID0ge1xuICAgIHRocmVlU2l4dHlQbGF5ZXI6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10ub2JqZWN0LFxuICAgIGF1dG9QbGF5OiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmJvb2wsXG4gICAgcmljaDogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5ib29sLmlzUmVxdWlyZWQsXG4gICAgb25SZWFkeTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jXG59O1xuXG5QbGF5ZXIuZGVmYXVsdFByb3BzID0ge1xuICAgIGF1dG9QbGF5OiBmYWxzZSxcbiAgICByaWNoOiB0cnVlXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBQbGF5ZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9QbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xuXG52YXIgX1BsYXllcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9QbGF5ZXIpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbi8vIFRoZSB0aHJlZVNpeHl0UGxheWVyIGlzIHRoZSBzYW1lIGZvciBhbGwgYmFkZ2VzXG52YXIgdGhyZWVTaXh0eVBsYXllciA9IG5ldyBUaHJlZVNpeHR5UGxheWVyKCk7XG5cbnZhciBCYWRnZSA9IChmdW5jdGlvbiAoX0NvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhCYWRnZSwgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBCYWRnZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEJhZGdlKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihCYWRnZS5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhCYWRnZSwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWROb2RlKHRoaXMucHJvcHMpO1xuXG4gICAgICAgICAgICB0aHJlZVNpeHR5UGxheWVyLmluaXQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAgICAgaWYgKG5leHRQcm9wcy5ub2RlICE9PSB0aGlzLnByb3BzLm5vZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWROb2RlKG5leHRQcm9wcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xvYWROb2RlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWROb2RlKHByb3BzKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgbm9kZSA9IHByb3BzLm5vZGU7XG5cbiAgICAgICAgICAgIF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0Q2xpZW50KCkuYnVpbGRQcmVzaWduZWRHZXRVcmwobm9kZSwgZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgICAgICAgIG1pbWVUeXBlOiBcImF1ZGlvL1wiICsgbm9kZS5nZXRBanhwTWltZSgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCBcImF1ZGlvL1wiICsgbm9kZS5nZXRBanhwTWltZSgpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcmVmID0gdGhpcy5zdGF0ZSB8fCB7fTtcblxuICAgICAgICAgICAgdmFyIG1pbWVUeXBlID0gX3JlZi5taW1lVHlwZTtcbiAgICAgICAgICAgIHZhciB1cmwgPSBfcmVmLnVybDtcblxuICAgICAgICAgICAgaWYgKCF1cmwpIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX1BsYXllcjJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgICAgICB7IHJpY2g6IGZhbHNlLCBzdHlsZTogeyB3aWR0aDogNDAsIGhlaWdodDogNDAsIG1hcmdpbjogXCJhdXRvXCIgfSwgb25SZWFkeTogZnVuY3Rpb24gKCkge30gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnYScsIHsgdHlwZTogbWltZVR5cGUsIGhyZWY6IHVybCB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBCYWRnZTtcbn0pKF9yZWFjdC5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBCYWRnZTtcblxuZnVuY3Rpb24gZ3VpZCgpIHtcbiAgICByZXR1cm4gczQoKSArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgczQoKSArIHM0KCk7XG59XG5cbmZ1bmN0aW9uIHM0KCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcmVhY3RSZWR1eCA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbnZhciBfcmVkdXggPSByZXF1aXJlKCdyZWR1eCcpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX1BsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XG5cbnZhciBfUGxheWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1BsYXllcik7XG5cbnZhciBQeWRpb0FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKFwiaG9jXCIpO1xuXG52YXIgd2l0aFNlbGVjdGlvbiA9IF9QeWRpbyRyZXF1aXJlTGliLndpdGhTZWxlY3Rpb247XG52YXIgRWRpdG9yQWN0aW9ucyA9IF9QeWRpbyRyZXF1aXJlTGliLkVkaXRvckFjdGlvbnM7XG52YXIgd2l0aE1lbnUgPSBfUHlkaW8kcmVxdWlyZUxpYi53aXRoTWVudTtcbnZhciB3aXRoTG9hZGVyID0gX1B5ZGlvJHJlcXVpcmVMaWIud2l0aExvYWRlcjtcbnZhciB3aXRoRXJyb3JzID0gX1B5ZGlvJHJlcXVpcmVMaWIud2l0aEVycm9ycztcbnZhciB3aXRoQ29udHJvbHMgPSBfUHlkaW8kcmVxdWlyZUxpYi53aXRoQ29udHJvbHM7XG5cbnZhciBlZGl0b3JzID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCkuUmVnaXN0cnkuZ2V0QWN0aXZlRXh0ZW5zaW9uQnlUeXBlKFwiZWRpdG9yXCIpO1xudmFyIGNvbmYgPSBlZGl0b3JzLmZpbHRlcihmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciBpZCA9IF9yZWYuaWQ7XG4gICAgcmV0dXJuIGlkID09PSAnZWRpdG9yLnNvdW5kbWFuYWdlcic7XG59KVswXTtcblxudmFyIGdldFNlbGVjdGlvbkZpbHRlciA9IGZ1bmN0aW9uIGdldFNlbGVjdGlvbkZpbHRlcihub2RlKSB7XG4gICAgcmV0dXJuIGNvbmYubWltZXMuaW5kZXhPZihub2RlLmdldEFqeHBNaW1lKCkpID4gLTE7XG59O1xuXG52YXIgZ2V0U2VsZWN0aW9uID0gZnVuY3Rpb24gZ2V0U2VsZWN0aW9uKG5vZGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB2YXIgc2VsZWN0aW9uID0gW107XG5cbiAgICAgICAgbm9kZS5nZXRQYXJlbnQoKS5nZXRDaGlsZHJlbigpLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uLnB1c2goY2hpbGQpO1xuICAgICAgICB9KTtcbiAgICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLmZpbHRlcihnZXRTZWxlY3Rpb25GaWx0ZXIpLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLmdldExhYmVsKCkubG9jYWxlQ29tcGFyZShiLmdldExhYmVsKCksIHVuZGVmaW5lZCwgeyBudW1lcmljOiB0cnVlIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgIHNlbGVjdGlvbjogc2VsZWN0aW9uLFxuICAgICAgICAgICAgY3VycmVudEluZGV4OiBzZWxlY3Rpb24ucmVkdWNlKGZ1bmN0aW9uIChjdXJyZW50SW5kZXgsIGN1cnJlbnQsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQgPT09IG5vZGUgJiYgaW5kZXggfHwgY3VycmVudEluZGV4O1xuICAgICAgICAgICAgfSwgMClcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG52YXIgc3R5bGVzID0ge1xuICAgIGNvbnRhaW5lcjoge1xuICAgICAgICBtYXJnaW46IFwiYXV0b1wiLFxuICAgICAgICBkaXNwbGF5OiBcImZsZXhcIixcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2UtYmV0d2VlblwiLFxuICAgICAgICBmbGV4OiAxXG4gICAgfSxcbiAgICBwbGF5ZXI6IHtcbiAgICAgICAgbWFyZ2luOiBcImF1dG9cIlxuICAgIH0sXG4gICAgdGFibGU6IHtcbiAgICAgICAgd2lkdGg6IDMyMFxuICAgIH1cbn07XG5cbnZhciBFZGl0b3IgPSAoZnVuY3Rpb24gKF9Db21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRWRpdG9yLCBfQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEVkaXRvcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIF9FZGl0b3IpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKF9FZGl0b3IucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRWRpdG9yLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZE5vZGUodGhpcy5wcm9wcyk7XG4gICAgICAgICAgICB2YXIgZWRpdG9yTW9kaWZ5ID0gdGhpcy5wcm9wcy5lZGl0b3JNb2RpZnk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgZWRpdG9yTW9kaWZ5KHsgZml4ZWRUb29sYmFyOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGVkaXRvck1vZGlmeSA9IHRoaXMucHJvcHMuZWRpdG9yTW9kaWZ5O1xuXG4gICAgICAgICAgICBpZiAobmV4dFByb3BzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgZWRpdG9yTW9kaWZ5KHsgZml4ZWRUb29sYmFyOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuZXh0UHJvcHMubm9kZSAhPT0gdGhpcy5wcm9wcy5ub2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVybDogJycgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5sb2FkTm9kZShuZXh0UHJvcHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2FkTm9kZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkTm9kZShwcm9wcykge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBub2RlID0gcHJvcHMubm9kZTtcblxuICAgICAgICAgICAgUHlkaW9BcGkuZ2V0Q2xpZW50KCkuYnVpbGRQcmVzaWduZWRHZXRVcmwobm9kZSwgZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICAgICAgICBtaW1lVHlwZTogXCJhdWRpby9cIiArIG5vZGUuZ2V0QWp4cE1pbWUoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgXCJhdWRpby9cIiArIG5vZGUuZ2V0QWp4cE1pbWUoKSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3BsYXlOZXh0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBsYXlOZXh0KCkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHRoaXMucHJvcHMuc2VsZWN0aW9uO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnN0YXRlLm5vZGU7XG5cbiAgICAgICAgICAgIHZhciBpbmRleCA9IHNlbGVjdGlvbi5zZWxlY3Rpb24uaW5kZXhPZihub2RlKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IHNlbGVjdGlvbi5zZWxlY3Rpb24ubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Sb3dTZWxlY3Rpb24oW2luZGV4ICsgMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvblJvd1NlbGVjdGlvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvblJvd1NlbGVjdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKCFkYXRhLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHRoaXMucHJvcHMuc2VsZWN0aW9uO1xuXG4gICAgICAgICAgICBpZiAoIXNlbGVjdGlvbikgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVybDogbnVsbCB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMzLmxvYWROb2RlKHsgbm9kZTogc2VsZWN0aW9uLnNlbGVjdGlvbltkYXRhWzBdXSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcmVmMiA9IHRoaXMuc3RhdGUgfHwge307XG5cbiAgICAgICAgICAgIHZhciBtaW1lVHlwZSA9IF9yZWYyLm1pbWVUeXBlO1xuICAgICAgICAgICAgdmFyIHVybCA9IF9yZWYyLnVybDtcbiAgICAgICAgICAgIHZhciBub2RlID0gX3JlZjIubm9kZTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5jb250YWluZXIgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIHsgekRlcHRoOiAzLCBzdHlsZTogc3R5bGVzLnBsYXllciB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMCA2MHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX1BsYXllcjJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGF1dG9QbGF5OiB0cnVlLCByaWNoOiAhdGhpcy5wcm9wcy5pY29uICYmIHRoaXMucHJvcHMucmljaCwgb25SZWFkeTogdGhpcy5wcm9wcy5vbkxvYWQsIG9uRmluaXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczQucGxheU5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdhJywgeyB0eXBlOiBtaW1lVHlwZSwgaHJlZjogdXJsIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGNsZWFyOiAnYm90aCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogc3R5bGVzLnRhYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdWx0aVNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDI1MCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Sb3dTZWxlY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczQub25Sb3dTZWxlY3Rpb24oZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5UYWJsZUJvZHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlSb3dDaGVja2JveDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpcGVkUm93czogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNlbGVjdE9uQ2xpY2thd2F5OiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNlbGVjdGlvbiAmJiB0aGlzLnByb3BzLnNlbGVjdGlvbi5zZWxlY3Rpb24ubWFwKGZ1bmN0aW9uIChuLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlRhYmxlUm93LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsga2V5OiBpbmRleCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5UYWJsZVJvd0NvbHVtbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogMTYsIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgJiYgbi5nZXRQYXRoKCkgPT09IG5vZGUuZ2V0UGF0aCgpID8gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLXBsYXlcIiB9KSA6IGluZGV4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVGFibGVSb3dDb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbi5nZXRMYWJlbCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgdmFyIF9FZGl0b3IgPSBFZGl0b3I7XG4gICAgRWRpdG9yID0gKDAsIF9yZWFjdFJlZHV4LmNvbm5lY3QpKG51bGwsIEVkaXRvckFjdGlvbnMpKEVkaXRvcikgfHwgRWRpdG9yO1xuICAgIEVkaXRvciA9IHdpdGhTZWxlY3Rpb24oZ2V0U2VsZWN0aW9uKShFZGl0b3IpIHx8IEVkaXRvcjtcbiAgICByZXR1cm4gRWRpdG9yO1xufSkoX3JlYWN0LkNvbXBvbmVudCk7XG5cbmZ1bmN0aW9uIGd1aWQoKSB7XG4gICAgcmV0dXJuIHM0KCkgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArIHM0KCkgKyBzNCgpO1xufVxuXG5mdW5jdGlvbiBzNCgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcbn1cblxuZXhwb3J0c1snZGVmYXVsdCddID0gRWRpdG9yO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZShvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9ialsnZGVmYXVsdCddIDogb2JqOyB9XG5cbnZhciBfYmFkZ2UgPSByZXF1aXJlKCcuL2JhZGdlJyk7XG5cbmV4cG9ydHMuQmFkZ2UgPSBfaW50ZXJvcFJlcXVpcmUoX2JhZGdlKTtcblxudmFyIF9wcmV2aWV3ID0gcmVxdWlyZSgnLi9wcmV2aWV3Jyk7XG5cbmV4cG9ydHMuUGFuZWwgPSBfaW50ZXJvcFJlcXVpcmUoX3ByZXZpZXcpO1xuXG52YXIgX2VkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yJyk7XG5cbmV4cG9ydHMuRWRpdG9yID0gX2ludGVyb3BSZXF1aXJlKF9lZGl0b3IpO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX1BsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XG5cbnZhciBfUGxheWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1BsYXllcik7XG5cbnZhciBQeWRpb0FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbi8vIFRoZSB0aHJlZVNpeHl0UGxheWVyIGlzIHRoZSBzYW1lIGZvciBhbGwgYmFkZ2VzXG52YXIgdGhyZWVTaXh0eVBsYXllciA9IG5ldyBUaHJlZVNpeHR5UGxheWVyKCk7XG5cbnZhciBQcmV2aWV3ID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFByZXZpZXcsIF9Db21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gUHJldmlldygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFByZXZpZXcpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFByZXZpZXcucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUHJldmlldywgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWROb2RlKHRoaXMucHJvcHMpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICBpZiAobmV4dFByb3BzLm5vZGUgIT09IHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZE5vZGUobmV4dFByb3BzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9hZE5vZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZE5vZGUocHJvcHMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBub2RlID0gcHJvcHMubm9kZTtcblxuICAgICAgICAgICAgdmFyIG1pbWUgPSBcImF1ZGlvL1wiICsgbm9kZS5nZXRBanhwTWltZSgpO1xuXG4gICAgICAgICAgICBQeWRpb0FwaS5nZXRDbGllbnQoKS5idWlsZFByZXNpZ25lZEdldFVybChub2RlLCBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICAgICAgbWltZVR5cGU6IG1pbWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIG1pbWUpO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB1cmw6IG5vZGUuZ2V0UGF0aCgpLFxuICAgICAgICAgICAgICAgIG1pbWVUeXBlOiBcImF1ZGlvL1wiICsgbm9kZS5nZXRBanhwTWltZSgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcmVmID0gdGhpcy5zdGF0ZSB8fCB7fTtcblxuICAgICAgICAgICAgdmFyIG1pbWVUeXBlID0gX3JlZi5taW1lVHlwZTtcbiAgICAgICAgICAgIHZhciB1cmwgPSBfcmVmLnVybDtcblxuICAgICAgICAgICAgaWYgKCF1cmwpIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX1BsYXllcjJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgICAgICB7IHJpY2g6IHRydWUsIHN0eWxlOiB7IG1hcmdpbjogXCJhdXRvXCIgfSwgb25SZWFkeTogZnVuY3Rpb24gKCkge30gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnYScsIHsgdHlwZTogbWltZVR5cGUsIGhyZWY6IHVybCB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQcmV2aWV3O1xufSkoX3JlYWN0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFByZXZpZXc7XG5cbmZ1bmN0aW9uIGd1aWQoKSB7XG4gICAgcmV0dXJuIHM0KCkgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArIHM0KCkgKyBzNCgpO1xufVxuXG5mdW5jdGlvbiBzNCgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLyoqXG4gKlxuICogU291bmRNYW5hZ2VyIDIgRGVtbzogMzYwLWRlZ3JlZSAvIFwiZG9udXQgcGxheWVyXCJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogaHR0cDovL3NjaGlsbG1hbmlhLmNvbS9wcm9qZWN0cy9zb3VuZG1hbmFnZXIyL1xuICpcbiAqIEFuIGlubGluZSBwbGF5ZXIgd2l0aCBhIGNpcmN1bGFyIFVJLlxuICogQmFzZWQgb24gdGhlIG9yaWdpbmFsIFNNMiBpbmxpbmUgcGxheWVyLlxuICogSW5zcGlyZWQgYnkgQXBwbGUncyBwcmV2aWV3IGZlYXR1cmUgaW4gdGhlXG4gKiBpVHVuZXMgbXVzaWMgc3RvcmUgKGlQaG9uZSksIGFtb25nIG90aGVycy5cbiAqXG4gKiBSZXF1aXJlcyBTb3VuZE1hbmFnZXIgMiBKYXZhc2NyaXB0IEFQSS5cbiAqIEFsc28gdXNlcyBCZXJuaWUncyBCZXR0ZXIgQW5pbWF0aW9uIENsYXNzIChCU0QpOlxuICogaHR0cDovL3d3dy5iZXJuaWVjb2RlLmNvbS93cml0aW5nL2FuaW1hdG9yLmh0bWxcbiAqXG4qL1xuXG4vKmpzbGludCB3aGl0ZTogZmFsc2UsIG9uZXZhcjogdHJ1ZSwgdW5kZWY6IHRydWUsIG5vbWVuOiBmYWxzZSwgZXFlcWVxOiB0cnVlLCBwbHVzcGx1czogZmFsc2UsIGJpdHdpc2U6IHRydWUsIHJlZ2V4cDogZmFsc2UsIG5ld2NhcDogdHJ1ZSwgaW1tZWQ6IHRydWUgKi9cbi8qZ2xvYmFsIGRvY3VtZW50LCB3aW5kb3csIHNvdW5kTWFuYWdlciwgbmF2aWdhdG9yICovXG5cbnZhciB0aHJlZVNpeHR5UGxheWVyLCAvLyBpbnN0YW5jZVxuICAgIFRocmVlU2l4dHlQbGF5ZXI7IC8vIGNvbnN0cnVjdG9yXG5cbihmdW5jdGlvbih3aW5kb3csIF91bmRlZmluZWQpIHtcblxuZnVuY3Rpb24gVGhyZWVTaXh0eVBsYXllcigpIHtcblxuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBwbCA9IHRoaXMsXG4gICAgICBzbSA9IHNvdW5kTWFuYWdlciwgLy8gc291bmRNYW5hZ2VyIGluc3RhbmNlXG4gICAgICB1QSA9IG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICBpc0lFID0gKHVBLm1hdGNoKC9tc2llL2kpKSxcbiAgICAgIGlzT3BlcmEgPSAodUEubWF0Y2goL29wZXJhL2kpKSxcbiAgICAgIGlzU2FmYXJpID0gKHVBLm1hdGNoKC9zYWZhcmkvaSkpLFxuICAgICAgaXNDaHJvbWUgPSAodUEubWF0Y2goL2Nocm9tZS9pKSksXG4gICAgICBpc0ZpcmVmb3ggPSAodUEubWF0Y2goL2ZpcmVmb3gvaSkpLFxuICAgICAgaXNUb3VjaERldmljZSA9ICh1QS5tYXRjaCgvaXBhZHxpcGhvbmUvaSkpLFxuICAgICAgaGFzUmVhbENhbnZhcyA9ICh0eXBlb2Ygd2luZG93Lkdfdm1sQ2FudmFzTWFuYWdlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJykgIT09ICd1bmRlZmluZWQnKSxcbiAgICAgIC8vIEkgZHVubm8gd2hhdCBPcGVyYSBkb2Vzbid0IGxpa2UgYWJvdXQgdGhpcy4gSSdtIHByb2JhYmx5IGRvaW5nIGl0IHdyb25nLlxuICAgICAgZnVsbENpcmNsZSA9IChpc09wZXJhfHxpc0Nocm9tZT8zNTkuOTozNjApO1xuXG4gIC8vIENTUyBjbGFzcyBmb3IgaWdub3JpbmcgTVAzIGxpbmtzXG4gIHRoaXMuZXhjbHVkZUNsYXNzID0gJ3RocmVlc2l4dHktZXhjbHVkZSc7XG4gIHRoaXMubGlua3MgPSBbXTtcbiAgdGhpcy5zb3VuZHMgPSBbXTtcbiAgdGhpcy5zb3VuZHNCeVVSTCA9IHt9O1xuICB0aGlzLmluZGV4QnlVUkwgPSB7fTtcbiAgdGhpcy5sYXN0U291bmQgPSBudWxsO1xuICB0aGlzLmxhc3RUb3VjaGVkU291bmQgPSBudWxsO1xuICB0aGlzLnNvdW5kQ291bnQgPSAwO1xuICB0aGlzLm9VSVRlbXBsYXRlID0gbnVsbDtcbiAgdGhpcy5vVUlJbWFnZU1hcCA9IG51bGw7XG4gIHRoaXMudnVNZXRlciA9IG51bGw7XG4gIHRoaXMuY2FsbGJhY2tDb3VudCA9IDA7XG4gIHRoaXMucGVha0RhdGFIaXN0b3J5ID0gW107XG5cbiAgLy8gMzYwcGxheWVyIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICB0aGlzLmNvbmZpZyA9IHtcblxuICAgIHBsYXlOZXh0OiBmYWxzZSwgICAvLyBzdG9wIGFmdGVyIG9uZSBzb3VuZCwgb3IgcGxheSB0aHJvdWdoIGxpc3QgdW50aWwgZW5kXG4gICAgYXV0b1BsYXk6IGZhbHNlLCAgIC8vIHN0YXJ0IHBsYXlpbmcgdGhlIGZpcnN0IHNvdW5kIHJpZ2h0IGF3YXlcbiAgICBhbGxvd011bHRpcGxlOiBmYWxzZSwgIC8vIGxldCBtYW55IHNvdW5kcyBwbGF5IGF0IG9uY2UgKGZhbHNlID0gb25seSBvbmUgc291bmQgcGxheWluZyBhdCBhIHRpbWUpXG4gICAgbG9hZFJpbmdDb2xvcjogJyNjY2MnLCAvLyBob3cgbXVjaCBoYXMgbG9hZGVkXG4gICAgcGxheVJpbmdDb2xvcjogJyMwMDAnLCAvLyBob3cgbXVjaCBoYXMgcGxheWVkXG4gICAgYmFja2dyb3VuZFJpbmdDb2xvcjogJyNlZWUnLCAvLyBjb2xvciBzaG93biB1bmRlcm5lYXRoIGxvYWQgKyBwbGF5IChcIm5vdCB5ZXQgbG9hZGVkXCIgY29sb3IpXG5cbiAgICAvLyBvcHRpb25hbCBzZWdtZW50L2Fubm90YXRpb24gKG1ldGFkYXRhKSBzdHVmZi4uXG4gICAgc2VnbWVudFJpbmdDb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMC4zMyknLCAvLyBtZXRhZGF0YS9hbm5vdGF0aW9uIChzZWdtZW50KSBjb2xvcnNcbiAgICBzZWdtZW50UmluZ0NvbG9yQWx0OiAncmdiYSgwLDAsMCwwLjEpJyxcbiAgICBsb2FkUmluZ0NvbG9yTWV0YWRhdGE6ICcjZGRkJywgLy8gXCJhbm5vdGF0aW9uc1wiIGxvYWQgY29sb3JcbiAgICBwbGF5UmluZ0NvbG9yTWV0YWRhdGE6ICdyZ2JhKDEyOCwxOTIsMjU2LDAuOSknLCAvLyBob3cgbXVjaCBoYXMgcGxheWVkIHdoZW4gbWV0YWRhdGEgaXMgcHJlc2VudFxuXG4gICAgY2lyY2xlRGlhbWV0ZXI6IG51bGwsIC8vIHNldCBkeW5hbWljYWxseSBhY2NvcmRpbmcgdG8gdmFsdWVzIGZyb20gQ1NTXG4gICAgY2lyY2xlUmFkaXVzOiBudWxsLFxuICAgIGFuaW1EdXJhdGlvbjogNTAwLFxuICAgIGFuaW1UcmFuc2l0aW9uOiB3aW5kb3cuQW5pbWF0b3IudHguYm91bmN5LCAvLyBodHRwOi8vd3d3LmJlcm5pZWNvZGUuY29tL3dyaXRpbmcvYW5pbWF0b3IuaHRtbFxuICAgIHNob3dITVNUaW1lOiBmYWxzZSwgLy8gaG91cnM6bWludXRlczpzZWNvbmRzIHZzLiBzZWNvbmRzLW9ubHlcbiAgICBzY2FsZUZvbnQ6IHRydWUsICAvLyBhbHNvIHNldCB0aGUgZm9udCBzaXplIChpZiBwb3NzaWJsZSkgd2hpbGUgYW5pbWF0aW5nIHRoZSBjaXJjbGVcblxuICAgIC8vIG9wdGlvbmFsOiBzcGVjdHJ1bSBvciBFUSBncmFwaCBpbiBjYW52YXMgKG5vdCBzdXBwb3J0ZWQgaW4gSUUgPDksIHRvbyBzbG93IHZpYSBFeENhbnZhcylcbiAgICB1c2VXYXZlZm9ybURhdGE6IGZhbHNlLFxuICAgIHdhdmVmb3JtRGF0YUNvbG9yOiAnIzAwOTlmZicsXG4gICAgd2F2ZWZvcm1EYXRhRG93bnNhbXBsZTogMywgLy8gdXNlIG9ubHkgb25lIGluIFggKG9mIGEgc2V0IG9mIDI1NiB2YWx1ZXMpIC0gMSBtZWFucyBhbGwgMjU2XG4gICAgd2F2ZWZvcm1EYXRhT3V0c2lkZTogZmFsc2UsXG4gICAgd2F2ZWZvcm1EYXRhQ29uc3RyYWluOiBmYWxzZSwgLy8gaWYgdHJ1ZSwgK3ZlIHZhbHVlcyBvbmx5IC0ga2VlcCB3aXRoaW4gaW5zaWRlIGNpcmNsZVxuICAgIHdhdmVmb3JtRGF0YUxpbmVSYXRpbzogMC42NCxcblxuICAgIC8vIFwic3BlY3RydW0gZnJlcXVlbmN5XCIgb3B0aW9uXG4gICAgdXNlRVFEYXRhOiBmYWxzZSxcbiAgICBlcURhdGFDb2xvcjogJyMzMzk5MzMnLFxuICAgIGVxRGF0YURvd25zYW1wbGU6IDQsIC8vIHVzZSBvbmx5IG9uZSBpbiBYIChvZiAyNTYgdmFsdWVzKVxuICAgIGVxRGF0YU91dHNpZGU6IHRydWUsXG4gICAgZXFEYXRhTGluZVJhdGlvOiAwLjU0LFxuXG4gICAgLy8gZW5hYmxlIFwiYW1wbGlmaWVyXCIgKGNhbnZhcyBwdWxzZXMgbGlrZSBhIHNwZWFrZXIpIGVmZmVjdFxuICAgIHVzZVBlYWtEYXRhOiB0cnVlLFxuICAgIHBlYWtEYXRhQ29sb3I6ICcjZmYzM2ZmJyxcbiAgICBwZWFrRGF0YU91dHNpZGU6IHRydWUsXG4gICAgcGVha0RhdGFMaW5lUmF0aW86IDAuNSxcblxuICAgIHVzZUFtcGxpZmllcjogdHJ1ZSwgLy8gXCJwdWxzZVwiIGxpa2UgYSBzcGVha2VyXG5cbiAgICBmb250U2l6ZU1heDogbnVsbCwgLy8gc2V0IGFjY29yZGluZyB0byBDU1NcblxuICAgIHVzZUZhdkljb246IGZhbHNlIC8vIEV4cGVyaW1lbnRhbCAoYWxzbyByZXF1aXJlcyB1c2VQZWFrRGF0YTogdHJ1ZSkuLiBUcnkgdG8gZHJhdyBhIFwiVlUgTWV0ZXJcIiBpbiB0aGUgZmF2aWNvbiBhcmVhLCBpZiBicm93c2VyIHN1cHBvcnRzIGl0IChGaXJlZm94ICsgT3BlcmEgYXMgb2YgMjAwOSlcblxuICB9O1xuXG4gIHRoaXMuY3NzID0ge1xuXG4gICAgLy8gQ1NTIGNsYXNzIG5hbWVzIGFwcGVuZGVkIHRvIGxpbmsgZHVyaW5nIHZhcmlvdXMgc3RhdGVzXG4gICAgc0RlZmF1bHQ6ICdzbTJfbGluaycsIC8vIGRlZmF1bHQgc3RhdGVcbiAgICBzQnVmZmVyaW5nOiAnc20yX2J1ZmZlcmluZycsXG4gICAgc1BsYXlpbmc6ICdzbTJfcGxheWluZycsXG4gICAgc1BhdXNlZDogJ3NtMl9wYXVzZWQnXG5cbiAgfTtcblxuICB0aGlzLmFkZEV2ZW50SGFuZGxlciA9ICh0eXBlb2Ygd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgIT09ICd1bmRlZmluZWQnID8gZnVuY3Rpb24obywgZXZ0TmFtZSwgZXZ0SGFuZGxlcikge1xuICAgIHJldHVybiBvLmFkZEV2ZW50TGlzdGVuZXIoZXZ0TmFtZSxldnRIYW5kbGVyLGZhbHNlKTtcbiAgfSA6IGZ1bmN0aW9uKG8sIGV2dE5hbWUsIGV2dEhhbmRsZXIpIHtcbiAgICBvLmF0dGFjaEV2ZW50KCdvbicrZXZ0TmFtZSxldnRIYW5kbGVyKTtcbiAgfSk7XG5cbiAgdGhpcy5yZW1vdmVFdmVudEhhbmRsZXIgPSAodHlwZW9mIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICE9PSAndW5kZWZpbmVkJyA/IGZ1bmN0aW9uKG8sIGV2dE5hbWUsIGV2dEhhbmRsZXIpIHtcbiAgICByZXR1cm4gby5yZW1vdmVFdmVudExpc3RlbmVyKGV2dE5hbWUsZXZ0SGFuZGxlcixmYWxzZSk7XG4gIH0gOiBmdW5jdGlvbihvLCBldnROYW1lLCBldnRIYW5kbGVyKSB7XG4gICAgcmV0dXJuIG8uZGV0YWNoRXZlbnQoJ29uJytldnROYW1lLGV2dEhhbmRsZXIpO1xuICB9KTtcblxuICB0aGlzLmhhc0NsYXNzID0gZnVuY3Rpb24obyxjU3RyKSB7XG4gICAgcmV0dXJuIHR5cGVvZihvLmNsYXNzTmFtZSkhPT0ndW5kZWZpbmVkJz9vLmNsYXNzTmFtZS5tYXRjaChuZXcgUmVnRXhwKCcoXFxcXHN8XiknK2NTdHIrJyhcXFxcc3wkKScpKTpmYWxzZTtcbiAgfTtcblxuICB0aGlzLmFkZENsYXNzID0gZnVuY3Rpb24obyxjU3RyKSB7XG5cbiAgICBpZiAoIW8gfHwgIWNTdHIgfHwgc2VsZi5oYXNDbGFzcyhvLGNTdHIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIG8uY2xhc3NOYW1lID0gKG8uY2xhc3NOYW1lP28uY2xhc3NOYW1lKycgJzonJykrY1N0cjtcblxuICB9O1xuXG4gIHRoaXMucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihvLGNTdHIpIHtcblxuICAgIGlmICghbyB8fCAhY1N0ciB8fCAhc2VsZi5oYXNDbGFzcyhvLGNTdHIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIG8uY2xhc3NOYW1lID0gby5jbGFzc05hbWUucmVwbGFjZShuZXcgUmVnRXhwKCcoICcrY1N0cisnKXwoJytjU3RyKycpJywnZycpLCcnKTtcblxuICB9O1xuXG4gIHRoaXMuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSA9IGZ1bmN0aW9uKGNsYXNzTmFtZSx0YWdOYW1lcyxvUGFyZW50KSB7XG5cbiAgICB2YXIgZG9jID0gKG9QYXJlbnR8fGRvY3VtZW50KSxcbiAgICAgICAgbWF0Y2hlcyA9IFtdLCBpLGosIG5vZGVzID0gW107XG4gICAgaWYgKHR5cGVvZiB0YWdOYW1lcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHRhZ05hbWVzICE9PSAnc3RyaW5nJykge1xuICAgICAgZm9yIChpPXRhZ05hbWVzLmxlbmd0aDsgaS0tOykge1xuICAgICAgICBpZiAoIW5vZGVzIHx8ICFub2Rlc1t0YWdOYW1lc1tpXV0pIHtcbiAgICAgICAgICBub2Rlc1t0YWdOYW1lc1tpXV0gPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZXNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0YWdOYW1lcykge1xuICAgICAgbm9kZXMgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlcyA9IGRvYy5hbGx8fGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mKHRhZ05hbWVzKSE9PSdzdHJpbmcnKSB7XG4gICAgICBmb3IgKGk9dGFnTmFtZXMubGVuZ3RoOyBpLS07KSB7XG4gICAgICAgIGZvciAoaj1ub2Rlc1t0YWdOYW1lc1tpXV0ubGVuZ3RoOyBqLS07KSB7XG4gICAgICAgICAgaWYgKHNlbGYuaGFzQ2xhc3Mobm9kZXNbdGFnTmFtZXNbaV1dW2pdLGNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgIG1hdGNoZXMucHVzaChub2Rlc1t0YWdOYW1lc1tpXV1bal0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGk9MDsgaTxub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5oYXNDbGFzcyhub2Rlc1tpXSxjbGFzc05hbWUpKSB7XG4gICAgICAgICAgbWF0Y2hlcy5wdXNoKG5vZGVzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hlcztcblxuICB9O1xuXG4gIHRoaXMuZ2V0UGFyZW50QnlOb2RlTmFtZSA9IGZ1bmN0aW9uKG9DaGlsZCxzUGFyZW50Tm9kZU5hbWUpIHtcblxuICAgIGlmICghb0NoaWxkIHx8ICFzUGFyZW50Tm9kZU5hbWUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc1BhcmVudE5vZGVOYW1lID0gc1BhcmVudE5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgd2hpbGUgKG9DaGlsZC5wYXJlbnROb2RlICYmIHNQYXJlbnROb2RlTmFtZSAhPT0gb0NoaWxkLnBhcmVudE5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgb0NoaWxkID0gb0NoaWxkLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIHJldHVybiAob0NoaWxkLnBhcmVudE5vZGUgJiYgc1BhcmVudE5vZGVOYW1lID09PSBvQ2hpbGQucGFyZW50Tm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpP29DaGlsZC5wYXJlbnROb2RlOm51bGwpO1xuXG4gIH07XG5cbiAgdGhpcy5nZXRQYXJlbnRCeUNsYXNzTmFtZSA9IGZ1bmN0aW9uKG9DaGlsZCxzUGFyZW50Q2xhc3NOYW1lKSB7XG5cbiAgICBpZiAoIW9DaGlsZCB8fCAhc1BhcmVudENsYXNzTmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB3aGlsZSAob0NoaWxkLnBhcmVudE5vZGUgJiYgIXNlbGYuaGFzQ2xhc3Mob0NoaWxkLnBhcmVudE5vZGUsc1BhcmVudENsYXNzTmFtZSkpIHtcbiAgICAgIG9DaGlsZCA9IG9DaGlsZC5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gKG9DaGlsZC5wYXJlbnROb2RlICYmIHNlbGYuaGFzQ2xhc3Mob0NoaWxkLnBhcmVudE5vZGUsc1BhcmVudENsYXNzTmFtZSk/b0NoaWxkLnBhcmVudE5vZGU6bnVsbCk7XG5cbiAgfTtcblxuICB0aGlzLmdldFNvdW5kQnlVUkwgPSBmdW5jdGlvbihzVVJMKSB7XG4gICAgcmV0dXJuICh0eXBlb2Ygc2VsZi5zb3VuZHNCeVVSTFtzVVJMXSAhPT0gJ3VuZGVmaW5lZCc/c2VsZi5zb3VuZHNCeVVSTFtzVVJMXTpudWxsKTtcbiAgfTtcblxuICB0aGlzLmlzQ2hpbGRPZk5vZGUgPSBmdW5jdGlvbihvLHNOb2RlTmFtZSkge1xuXG4gICAgaWYgKCFvIHx8ICFvLnBhcmVudE5vZGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc05vZGVOYW1lID0gc05vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgZG8ge1xuICAgICAgbyA9IG8ucGFyZW50Tm9kZTtcbiAgICB9IHdoaWxlIChvICYmIG8ucGFyZW50Tm9kZSAmJiBvLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgIT09IHNOb2RlTmFtZSk7XG4gICAgcmV0dXJuIChvICYmIG8ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gc05vZGVOYW1lP286bnVsbCk7XG5cbiAgfTtcblxuICB0aGlzLmlzQ2hpbGRPZkNsYXNzID0gZnVuY3Rpb24ob0NoaWxkLG9DbGFzcykge1xuXG4gICAgaWYgKCFvQ2hpbGQgfHwgIW9DbGFzcykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB3aGlsZSAob0NoaWxkLnBhcmVudE5vZGUgJiYgIXNlbGYuaGFzQ2xhc3Mob0NoaWxkLG9DbGFzcykpIHtcbiAgICAgIG9DaGlsZCA9IHNlbGYuZmluZFBhcmVudChvQ2hpbGQpO1xuICAgIH1cbiAgICByZXR1cm4gKHNlbGYuaGFzQ2xhc3Mob0NoaWxkLG9DbGFzcykpO1xuXG4gIH07XG5cbiAgdGhpcy5maW5kUGFyZW50ID0gZnVuY3Rpb24obykge1xuXG4gICAgaWYgKCFvIHx8ICFvLnBhcmVudE5vZGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbyA9IG8ucGFyZW50Tm9kZTtcbiAgICBpZiAoby5ub2RlVHlwZSA9PT0gMikge1xuICAgICAgd2hpbGUgKG8gJiYgby5wYXJlbnROb2RlICYmIG8ucGFyZW50Tm9kZS5ub2RlVHlwZSA9PT0gMikge1xuICAgICAgICBvID0gby5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbztcblxuICB9O1xuXG4gIHRoaXMuZ2V0U3R5bGUgPSBmdW5jdGlvbihvLHNQcm9wKSB7XG5cbiAgICAvLyBodHRwOi8vd3d3LnF1aXJrc21vZGUub3JnL2RvbS9nZXRzdHlsZXMuaHRtbFxuICAgIHRyeSB7XG4gICAgICBpZiAoby5jdXJyZW50U3R5bGUpIHtcbiAgICAgICAgcmV0dXJuIG8uY3VycmVudFN0eWxlW3NQcm9wXTtcbiAgICAgIH0gZWxzZSBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUobyxudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKHNQcm9wKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIC8vIG9oIHdlbGxcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG5cbiAgfTtcblxuICB0aGlzLmZpbmRYWSA9IGZ1bmN0aW9uKG9iaikge1xuXG4gICAgdmFyIGN1cmxlZnQgPSAwLCBjdXJ0b3AgPSAwO1xuICAgIGRvIHtcbiAgICAgIGN1cmxlZnQgKz0gb2JqLm9mZnNldExlZnQ7XG4gICAgICBjdXJ0b3AgKz0gb2JqLm9mZnNldFRvcDtcbiAgICB9IHdoaWxlICghIShvYmogPSBvYmoub2Zmc2V0UGFyZW50KSk7XG4gICAgcmV0dXJuIFtjdXJsZWZ0LGN1cnRvcF07XG5cbiAgfTtcblxuICB0aGlzLmdldE1vdXNlWFkgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAvLyBodHRwOi8vd3d3LnF1aXJrc21vZGUub3JnL2pzL2V2ZW50c19wcm9wZXJ0aWVzLmh0bWxcbiAgICBlID0gZT9lOndpbmRvdy5ldmVudDtcbiAgICBpZiAoaXNUb3VjaERldmljZSAmJiBlLnRvdWNoZXMpIHtcbiAgICAgIGUgPSBlLnRvdWNoZXNbMF07XG4gICAgfVxuICAgIGlmIChlLnBhZ2VYIHx8IGUucGFnZVkpIHtcbiAgICAgIHJldHVybiBbZS5wYWdlWCxlLnBhZ2VZXTtcbiAgICB9IGVsc2UgaWYgKGUuY2xpZW50WCB8fCBlLmNsaWVudFkpIHtcbiAgICAgIHJldHVybiBbZS5jbGllbnRYK3NlbGYuZ2V0U2Nyb2xsTGVmdCgpLGUuY2xpZW50WStzZWxmLmdldFNjcm9sbFRvcCgpXTtcbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLmdldFNjcm9sbExlZnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCk7XG4gIH07XG5cbiAgdGhpcy5nZXRTY3JvbGxUb3AgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wK2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApO1xuICB9O1xuXG4gIHRoaXMuZXZlbnRzID0ge1xuXG4gICAgLy8gaGFuZGxlcnMgZm9yIHNvdW5kIGV2ZW50cyBhcyB0aGV5J3JlIHN0YXJ0ZWQvc3RvcHBlZC9wbGF5ZWRcblxuICAgIHBsYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihwbC5jb25maWcub25wbGF5KXtcbiAgICAgICAgICAgIHBsLmNvbmZpZy5vbnBsYXkodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIHBsLnJlbW92ZUNsYXNzKHRoaXMuXzM2MGRhdGEub1VJQm94LHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lKTtcbiAgICAgIHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lID0gcGwuY3NzLnNQbGF5aW5nO1xuICAgICAgcGwuYWRkQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gsdGhpcy5fMzYwZGF0YS5jbGFzc05hbWUpO1xuICAgICAgc2VsZi5mYW5PdXQodGhpcyk7XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihwbC5jb25maWcub25zdG9wKXtcbiAgICAgICAgICAgIHBsLmNvbmZpZy5vbnN0b3AodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIHBsLnJlbW92ZUNsYXNzKHRoaXMuXzM2MGRhdGEub1VJQm94LHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lKTtcbiAgICAgIHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lID0gJyc7XG4gICAgICBzZWxmLmZhbkluKHRoaXMpO1xuICAgIH0sXG5cbiAgICBwYXVzZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKHBsLmNvbmZpZy5vbnBhdXNlKXtcbiAgICAgICAgICAgIHBsLmNvbmZpZy5vbnBhdXNlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICBwbC5yZW1vdmVDbGFzcyh0aGlzLl8zNjBkYXRhLm9VSUJveCx0aGlzLl8zNjBkYXRhLmNsYXNzTmFtZSk7XG4gICAgICB0aGlzLl8zNjBkYXRhLmNsYXNzTmFtZSA9IHBsLmNzcy5zUGF1c2VkO1xuICAgICAgcGwuYWRkQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gsdGhpcy5fMzYwZGF0YS5jbGFzc05hbWUpO1xuICAgIH0sXG5cbiAgICByZXN1bWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihwbC5jb25maWcub25yZXN1bWUpe1xuICAgICAgICAgICAgcGwuY29uZmlnLm9ucmVzdW1lKHRoaXMpO1xuICAgICAgICB9XG4gICAgICBwbC5yZW1vdmVDbGFzcyh0aGlzLl8zNjBkYXRhLm9VSUJveCx0aGlzLl8zNjBkYXRhLmNsYXNzTmFtZSk7XG4gICAgICB0aGlzLl8zNjBkYXRhLmNsYXNzTmFtZSA9IHBsLmNzcy5zUGxheWluZztcbiAgICAgIHBsLmFkZENsYXNzKHRoaXMuXzM2MGRhdGEub1VJQm94LHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lKTtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuZXh0TGluaztcbiAgICAgICAgaWYocGwuY29uZmlnLm9uZmluaXNoKXtcbiAgICAgICAgICAgIHBsLmNvbmZpZy5vbmZpbmlzaCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgcGwucmVtb3ZlQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gsdGhpcy5fMzYwZGF0YS5jbGFzc05hbWUpO1xuICAgICAgdGhpcy5fMzYwZGF0YS5jbGFzc05hbWUgPSAnJztcbiAgICAgIC8vIHNlbGYuY2xlYXJDYW52YXModGhpcy5fMzYwZGF0YS5vQ2FudmFzKTtcbiAgICAgIHRoaXMuXzM2MGRhdGEuZGlkRmluaXNoID0gdHJ1ZTsgLy8gc28gZmFuIGRyYXdzIGZ1bGwgY2lyY2xlXG4gICAgICBzZWxmLmZhbkluKHRoaXMpO1xuICAgICAgaWYgKHBsLmNvbmZpZy5wbGF5TmV4dCkge1xuICAgICAgICBuZXh0TGluayA9IChwbC5pbmRleEJ5VVJMW3RoaXMuXzM2MGRhdGEub0xpbmsuaHJlZl0rMSk7XG4gICAgICAgIGlmIChuZXh0TGluazxwbC5saW5rcy5sZW5ndGgpIHtcbiAgICAgICAgICBwbC5oYW5kbGVDbGljayh7J3RhcmdldCc6cGwubGlua3NbbmV4dExpbmtdfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgd2hpbGVsb2FkaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnBhdXNlZCkge1xuICAgICAgICBzZWxmLnVwZGF0ZVBsYXlpbmcuYXBwbHkodGhpcyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHdoaWxlcGxheWluZzogZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLnVwZGF0ZVBsYXlpbmcuYXBwbHkodGhpcyk7XG4gICAgICB0aGlzLl8zNjBkYXRhLmZwcysrO1xuICAgIH0sXG5cbiAgICBidWZmZXJjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuaXNCdWZmZXJpbmcpIHtcbiAgICAgICAgcGwuYWRkQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gscGwuY3NzLnNCdWZmZXJpbmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGwucmVtb3ZlQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gscGwuY3NzLnNCdWZmZXJpbmcpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIHRoaXMuc3RvcEV2ZW50ID0gZnVuY3Rpb24oZSkge1xuXG4gICBpZiAodHlwZW9mIGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBlLnByZXZlbnREZWZhdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdy5ldmVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5ldmVudC5yZXR1cm5WYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvdy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgfTtcblxuICB0aGlzLmdldFRoZURhbW5MaW5rID0gKGlzSUUpP2Z1bmN0aW9uKGUpIHtcbiAgICAvLyBJIHJlYWxseSBkaWRuJ3Qgd2FudCB0byBoYXZlIHRvIGRvIHRoaXMuXG4gICAgcmV0dXJuIChlICYmIGUudGFyZ2V0P2UudGFyZ2V0OndpbmRvdy5ldmVudC5zcmNFbGVtZW50KTtcbiAgfTpmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIGUudGFyZ2V0O1xuICB9O1xuXG4gIHRoaXMuaGFuZGxlQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAvLyBhIHNvdW5kIGxpbmsgd2FzIGNsaWNrZWRcbiAgICBpZiAoZS5idXR0b24gPiAxKSB7XG4gICAgICAvLyBvbmx5IGNhdGNoIGxlZnQtY2xpY2tzXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgbyA9IHNlbGYuZ2V0VGhlRGFtbkxpbmsoZSksXG4gICAgICAgIHNVUkwsIHNvdW5kVVJMLCB0aGlzU291bmQsIG9Db250YWluZXIsIGhhc192aXMsIGRpYW1ldGVyO1xuXG4gICAgaWYgKG8ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ2EnKSB7XG4gICAgICBvID0gc2VsZi5pc0NoaWxkT2ZOb2RlKG8sJ2EnKTtcbiAgICAgIGlmICghbykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXNlbGYuaXNDaGlsZE9mQ2xhc3MobywndWkzNjAnKSkge1xuICAgICAgLy8gbm90IGEgbGluayB3ZSdyZSBpbnRlcmVzdGVkIGluXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBzVVJMID0gby5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblxuICAgIGlmICghby5ocmVmIHx8ICFzbS5jYW5QbGF5TGluayhvKSB8fCBzZWxmLmhhc0NsYXNzKG8sc2VsZi5leGNsdWRlQ2xhc3MpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTsgLy8gcGFzcy10aHJ1IGZvciBub24tTVAzL25vbi1saW5rc1xuICAgIH1cblxuICAgIHNtLl93cml0ZURlYnVnKCdoYW5kbGVDbGljaygpJyk7XG4gICAgc291bmRVUkwgPSAoby5ocmVmKTtcbiAgICB0aGlzU291bmQgPSBzZWxmLmdldFNvdW5kQnlVUkwoc291bmRVUkwpO1xuXG4gICAgaWYgKHRoaXNTb3VuZCkge1xuXG4gICAgICAvLyBhbHJlYWR5IGV4aXN0c1xuICAgICAgaWYgKHRoaXNTb3VuZCA9PT0gc2VsZi5sYXN0U291bmQpIHtcbiAgICAgICAgLy8gYW5kIHdhcyBwbGF5aW5nIChvciBwYXVzZWQpXG4gICAgICAgIHRoaXNTb3VuZC50b2dnbGVQYXVzZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZGlmZmVyZW50IHNvdW5kXG4gICAgICAgIHRoaXNTb3VuZC50b2dnbGVQYXVzZSgpOyAvLyBzdGFydCBwbGF5aW5nIGN1cnJlbnRcbiAgICAgICAgc20uX3dyaXRlRGVidWcoJ3NvdW5kIGRpZmZlcmVudCB0aGFuIGxhc3Qgc291bmQ6ICcrc2VsZi5sYXN0U291bmQuc0lEKTtcbiAgICAgICAgaWYgKCFzZWxmLmNvbmZpZy5hbGxvd011bHRpcGxlICYmIHNlbGYubGFzdFNvdW5kKSB7XG4gICAgICAgICAgc2VsZi5zdG9wU291bmQoc2VsZi5sYXN0U291bmQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAvLyBhcHBlbmQgc29tZSBkb20gc2hpeiwgbWFrZSBub2lzZVxuXG4gICAgICBvQ29udGFpbmVyID0gby5wYXJlbnROb2RlO1xuICAgICAgaGFzX3ZpcyA9IChzZWxmLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3VpMzYwLXZpcycsJ2Rpdicsb0NvbnRhaW5lci5wYXJlbnROb2RlKS5sZW5ndGgpO1xuXG4gICAgICAvLyBjcmVhdGUgc291bmRcbiAgICAgIHRoaXNTb3VuZCA9IHNtLmNyZWF0ZVNvdW5kKHtcbiAgICAgICBpZDondWkzNjBTb3VuZF8nK3BhcnNlSW50KE1hdGgucmFuZG9tKCkqMTAwMDAwMDApLFxuICAgICAgIHVybDpzb3VuZFVSTCxcbiAgICAgICBvbnBsYXk6c2VsZi5ldmVudHMucGxheSxcbiAgICAgICBvbnN0b3A6c2VsZi5ldmVudHMuc3RvcCxcbiAgICAgICBvbnBhdXNlOnNlbGYuZXZlbnRzLnBhdXNlLFxuICAgICAgIG9ucmVzdW1lOnNlbGYuZXZlbnRzLnJlc3VtZSxcbiAgICAgICBvbmZpbmlzaDpzZWxmLmV2ZW50cy5maW5pc2gsXG4gICAgICAgb25idWZmZXJjaGFuZ2U6c2VsZi5ldmVudHMuYnVmZmVyY2hhbmdlLFxuICAgICAgIHdoaWxlbG9hZGluZzpzZWxmLmV2ZW50cy53aGlsZWxvYWRpbmcsXG4gICAgICAgd2hpbGVwbGF5aW5nOnNlbGYuZXZlbnRzLndoaWxlcGxheWluZyxcbiAgICAgICB1c2VXYXZlZm9ybURhdGE6KGhhc192aXMgJiYgc2VsZi5jb25maWcudXNlV2F2ZWZvcm1EYXRhKSxcbiAgICAgICB1c2VFUURhdGE6KGhhc192aXMgJiYgc2VsZi5jb25maWcudXNlRVFEYXRhKSxcbiAgICAgICB1c2VQZWFrRGF0YTooaGFzX3ZpcyAmJiBzZWxmLmNvbmZpZy51c2VQZWFrRGF0YSlcbiAgICAgIH0pO1xuXG4gICAgICAvLyB0YWNrIG9uIHNvbWUgY3VzdG9tIGRhdGFcblxuICAgICAgZGlhbWV0ZXIgPSBwYXJzZUludChzZWxmLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NtMi0zNjB1aScsJ2Rpdicsb0NvbnRhaW5lcilbMF0ub2Zmc2V0V2lkdGgsIDEwKTtcblxuICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhID0ge1xuICAgICAgICBvVUkzNjA6IHNlbGYuZ2V0UGFyZW50QnlDbGFzc05hbWUobywndWkzNjAnKSwgLy8gdGhlICh3aG9sZSkgZW50aXJlIGNvbnRhaW5lclxuICAgICAgICBvTGluazogbywgLy8gRE9NIG5vZGUgZm9yIHJlZmVyZW5jZSB3aXRoaW4gU00yIG9iamVjdCBldmVudCBoYW5kbGVyc1xuICAgICAgICBjbGFzc05hbWU6IHNlbGYuY3NzLnNQbGF5aW5nLFxuICAgICAgICBvVUlCb3g6IHNlbGYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc20yLTM2MHVpJywnZGl2JyxvQ29udGFpbmVyKVswXSxcbiAgICAgICAgb0NhbnZhczogc2VsZi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzbTItY2FudmFzJywnY2FudmFzJyxvQ29udGFpbmVyKVswXSxcbiAgICAgICAgb0J1dHRvbjogc2VsZi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzbTItMzYwYnRuJywnc3Bhbicsb0NvbnRhaW5lcilbMF0sXG4gICAgICAgIG9UaW1pbmc6IHNlbGYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc20yLXRpbWluZycsJ2Rpdicsb0NvbnRhaW5lcilbMF0sXG4gICAgICAgIG9Db3Zlcjogc2VsZi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzbTItY292ZXInLCdkaXYnLG9Db250YWluZXIpWzBdLFxuICAgICAgICBjaXJjbGVEaWFtZXRlcjogZGlhbWV0ZXIsXG4gICAgICAgIGNpcmNsZVJhZGl1czogZGlhbWV0ZXIvMixcbiAgICAgICAgbGFzdFRpbWU6IG51bGwsXG4gICAgICAgIGRpZEZpbmlzaDogbnVsbCxcbiAgICAgICAgcGF1c2VDb3VudDowLFxuICAgICAgICByYWRpdXM6MCxcbiAgICAgICAgZm9udFNpemU6IDEsXG4gICAgICAgIGZvbnRTaXplTWF4OiBzZWxmLmNvbmZpZy5mb250U2l6ZU1heCxcbiAgICAgICAgc2NhbGVGb250OiAoaGFzX3ZpcyAmJiBzZWxmLmNvbmZpZy5zY2FsZUZvbnQpLFxuICAgICAgICBzaG93SE1TVGltZTogaGFzX3ZpcyxcbiAgICAgICAgYW1wbGlmaWVyOiAoaGFzX3ZpcyAmJiBzZWxmLmNvbmZpZy51c2VQZWFrRGF0YT8wLjk6MSksIC8vIFRPRE86IHgxIGlmIG5vdCBiZWluZyB1c2VkLCBlbHNlIHVzZSBkeW5hbWljIFwiaG93IG11Y2ggdG8gYW1wbGlmeSBieVwiIHZhbHVlXG4gICAgICAgIHJhZGl1c01heDogZGlhbWV0ZXIqMC4xNzUsIC8vIGNpcmNsZSByYWRpdXNcbiAgICAgICAgd2lkdGg6MCxcbiAgICAgICAgd2lkdGhNYXg6IGRpYW1ldGVyKjAuNCwgLy8gd2lkdGggb2YgdGhlIG91dGVyIHJpbmdcbiAgICAgICAgbGFzdFZhbHVlczoge1xuICAgICAgICAgIGJ5dGVzTG9hZGVkOiAwLFxuICAgICAgICAgIGJ5dGVzVG90YWw6IDAsXG4gICAgICAgICAgcG9zaXRpb246IDAsXG4gICAgICAgICAgZHVyYXRpb25Fc3RpbWF0ZTogMFxuICAgICAgICB9LCAvLyB1c2VkIHRvIHRyYWNrIFwibGFzdCBnb29kIGtub3duXCIgdmFsdWVzIGJlZm9yZSBzb3VuZCBmaW5pc2gvcmVzZXQgZm9yIGFuaW1cbiAgICAgICAgYW5pbWF0aW5nOiBmYWxzZSxcbiAgICAgICAgb0FuaW06IG5ldyB3aW5kb3cuQW5pbWF0b3Ioe1xuICAgICAgICAgIGR1cmF0aW9uOiBzZWxmLmNvbmZpZy5hbmltRHVyYXRpb24sXG4gICAgICAgICAgdHJhbnNpdGlvbjpzZWxmLmNvbmZpZy5hbmltVHJhbnNpdGlvbixcbiAgICAgICAgICBvbkNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIHZhciB0aGlzU291bmQgPSB0aGlzO1xuICAgICAgICAgICAgLy8gdGhpc1NvdW5kLl8zNjBkYXRhLmRpZEZpbmlzaCA9IGZhbHNlOyAvLyByZXNldCBmdWxsIGNpcmNsZVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICAgIG9BbmltUHJvZ3Jlc3M6IGZ1bmN0aW9uKG5Qcm9ncmVzcykge1xuICAgICAgICAgIHZhciB0aGlzU291bmQgPSB0aGlzO1xuICAgICAgICAgIHRoaXNTb3VuZC5fMzYwZGF0YS5yYWRpdXMgPSBwYXJzZUludCh0aGlzU291bmQuXzM2MGRhdGEucmFkaXVzTWF4KnRoaXNTb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXIqblByb2dyZXNzLCAxMCk7XG4gICAgICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLndpZHRoID0gcGFyc2VJbnQodGhpc1NvdW5kLl8zNjBkYXRhLndpZHRoTWF4KnRoaXNTb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXIqblByb2dyZXNzLCAxMCk7XG4gICAgICAgICAgaWYgKHRoaXNTb3VuZC5fMzYwZGF0YS5zY2FsZUZvbnQgJiYgdGhpc1NvdW5kLl8zNjBkYXRhLmZvbnRTaXplTWF4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzU291bmQuXzM2MGRhdGEub1RpbWluZy5zdHlsZS5mb250U2l6ZSA9IHBhcnNlSW50KE1hdGgubWF4KDEsdGhpc1NvdW5kLl8zNjBkYXRhLmZvbnRTaXplTWF4Km5Qcm9ncmVzcyksIDEwKSsncHgnO1xuICAgICAgICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLm9UaW1pbmcuc3R5bGUub3BhY2l0eSA9IG5Qcm9ncmVzcztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXNTb3VuZC5wYXVzZWQgfHwgdGhpc1NvdW5kLnBsYXlTdGF0ZSA9PT0gMCB8fCB0aGlzU291bmQuXzM2MGRhdGEubGFzdFZhbHVlcy5ieXRlc0xvYWRlZCA9PT0gMCB8fCB0aGlzU291bmQuXzM2MGRhdGEubGFzdFZhbHVlcy5wb3NpdGlvbiA9PT0gMCkge1xuICAgICAgICAgICAgc2VsZi51cGRhdGVQbGF5aW5nLmFwcGx5KHRoaXNTb3VuZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmcHM6IDBcbiAgICAgIH07XG5cbiAgICAgIC8vIFwiTWV0YWRhdGFcIiAoYW5ub3RhdGlvbnMpXG4gICAgICBpZiAodHlwZW9mIHNlbGYuTWV0YWRhdGEgIT09ICd1bmRlZmluZWQnICYmIHNlbGYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbWV0YWRhdGEnLCdkaXYnLHRoaXNTb3VuZC5fMzYwZGF0YS5vVUkzNjApLmxlbmd0aCkge1xuICAgICAgICB0aGlzU291bmQuXzM2MGRhdGEubWV0YWRhdGEgPSBuZXcgc2VsZi5NZXRhZGF0YSh0aGlzU291bmQsc2VsZik7XG4gICAgICB9XG5cbiAgICAgIC8vIG1pbmltaXplIHplIGZvbnRcbiAgICAgIGlmICh0aGlzU291bmQuXzM2MGRhdGEuc2NhbGVGb250ICYmIHRoaXNTb3VuZC5fMzYwZGF0YS5mb250U2l6ZU1heCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzU291bmQuXzM2MGRhdGEub1RpbWluZy5zdHlsZS5mb250U2l6ZSA9ICcxcHgnO1xuICAgICAgfVxuXG4gICAgICAvLyBzZXQgdXAgemUgYW5pbWF0aW9uXG4gICAgICB0aGlzU291bmQuXzM2MGRhdGEub0FuaW0uYWRkU3ViamVjdCh0aGlzU291bmQuXzM2MGRhdGEub0FuaW1Qcm9ncmVzcyx0aGlzU291bmQpO1xuXG4gICAgICAvLyBhbmltYXRlIHRoZSByYWRpdXMgb3V0IG5pY2VcbiAgICAgIHNlbGYucmVmcmVzaENvb3Jkcyh0aGlzU291bmQpO1xuXG4gICAgICBzZWxmLnVwZGF0ZVBsYXlpbmcuYXBwbHkodGhpc1NvdW5kKTtcblxuICAgICAgc2VsZi5zb3VuZHNCeVVSTFtzb3VuZFVSTF0gPSB0aGlzU291bmQ7XG4gICAgICBzZWxmLnNvdW5kcy5wdXNoKHRoaXNTb3VuZCk7XG4gICAgICBpZiAoIXNlbGYuY29uZmlnLmFsbG93TXVsdGlwbGUgJiYgc2VsZi5sYXN0U291bmQpIHtcbiAgICAgICAgc2VsZi5zdG9wU291bmQoc2VsZi5sYXN0U291bmQpO1xuICAgICAgfVxuICAgICAgdGhpc1NvdW5kLnBsYXkoKTtcblxuICAgIH1cblxuICAgIHNlbGYubGFzdFNvdW5kID0gdGhpc1NvdW5kOyAvLyByZWZlcmVuY2UgZm9yIG5leHQgY2FsbFxuXG4gICAgaWYgKHR5cGVvZiBlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZS5wcmV2ZW50RGVmYXVsdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cuZXZlbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB3aW5kb3cuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIH07XG5cbiAgdGhpcy5mYW5PdXQgPSBmdW5jdGlvbihvU291bmQpIHtcblxuICAgICB2YXIgdGhpc1NvdW5kID0gb1NvdW5kO1xuICAgICBpZiAodGhpc1NvdW5kLl8zNjBkYXRhLmFuaW1hdGluZyA9PT0gMSkge1xuICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgfVxuICAgICB0aGlzU291bmQuXzM2MGRhdGEuYW5pbWF0aW5nID0gMDtcbiAgICAgc291bmRNYW5hZ2VyLl93cml0ZURlYnVnKCdmYW5PdXQ6ICcrdGhpc1NvdW5kLnNJRCsnOiAnK3RoaXNTb3VuZC5fMzYwZGF0YS5vTGluay5ocmVmKTtcbiAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLm9BbmltLnNlZWtUbygxKTsgLy8gcGxheSB0byBlbmRcbiAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgLy8gb25jb21wbGV0ZSBoYWNrXG4gICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLmFuaW1hdGluZyA9IDA7XG4gICAgIH0sc2VsZi5jb25maWcuYW5pbUR1cmF0aW9uKzIwKTtcblxuICB9O1xuXG4gIHRoaXMuZmFuSW4gPSBmdW5jdGlvbihvU291bmQpIHtcblxuICAgICB2YXIgdGhpc1NvdW5kID0gb1NvdW5kO1xuICAgICBpZiAodGhpc1NvdW5kLl8zNjBkYXRhLmFuaW1hdGluZyA9PT0gLTEpIHtcbiAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgIH1cbiAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLmFuaW1hdGluZyA9IC0xO1xuICAgICBzb3VuZE1hbmFnZXIuX3dyaXRlRGVidWcoJ2ZhbkluOiAnK3RoaXNTb3VuZC5zSUQrJzogJyt0aGlzU291bmQuXzM2MGRhdGEub0xpbmsuaHJlZik7XG4gICAgIC8vIG1hc3NpdmUgaGFja1xuICAgICB0aGlzU291bmQuXzM2MGRhdGEub0FuaW0uc2Vla1RvKDApOyAvLyBwbGF5IHRvIGVuZFxuICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAvLyByZXNldCBmdWxsIDM2MCBmaWxsIGFmdGVyIGFuaW1hdGlvbiBoYXMgY29tcGxldGVkIChvbmNvbXBsZXRlIGhhY2spXG4gICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLmRpZEZpbmlzaCA9IGZhbHNlO1xuICAgICAgIHRoaXNTb3VuZC5fMzYwZGF0YS5hbmltYXRpbmcgPSAwO1xuICAgICAgIHNlbGYucmVzZXRMYXN0VmFsdWVzKHRoaXNTb3VuZCk7XG4gICAgIH0sIHNlbGYuY29uZmlnLmFuaW1EdXJhdGlvbisyMCk7XG5cbiAgfTtcblxuICB0aGlzLnJlc2V0TGFzdFZhbHVlcyA9IGZ1bmN0aW9uKG9Tb3VuZCkge1xuICAgIG9Tb3VuZC5fMzYwZGF0YS5sYXN0VmFsdWVzLnBvc2l0aW9uID0gMDtcbiAgfTtcblxuICB0aGlzLnJlZnJlc2hDb29yZHMgPSBmdW5jdGlvbih0aGlzU291bmQpIHtcblxuICAgIHRoaXNTb3VuZC5fMzYwZGF0YS5jYW52YXNYWSA9IHNlbGYuZmluZFhZKHRoaXNTb3VuZC5fMzYwZGF0YS5vQ2FudmFzKTtcbiAgICB0aGlzU291bmQuXzM2MGRhdGEuY2FudmFzTWlkID0gW3RoaXNTb3VuZC5fMzYwZGF0YS5jaXJjbGVSYWRpdXMsdGhpc1NvdW5kLl8zNjBkYXRhLmNpcmNsZVJhZGl1c107XG4gICAgdGhpc1NvdW5kLl8zNjBkYXRhLmNhbnZhc01pZFhZID0gW3RoaXNTb3VuZC5fMzYwZGF0YS5jYW52YXNYWVswXSt0aGlzU291bmQuXzM2MGRhdGEuY2FudmFzTWlkWzBdLCB0aGlzU291bmQuXzM2MGRhdGEuY2FudmFzWFlbMV0rdGhpc1NvdW5kLl8zNjBkYXRhLmNhbnZhc01pZFsxXV07XG5cbiAgfTtcblxuICB0aGlzLnN0b3BTb3VuZCA9IGZ1bmN0aW9uKG9Tb3VuZCkge1xuXG4gICAgc291bmRNYW5hZ2VyLl93cml0ZURlYnVnKCdzdG9wU291bmQ6ICcrb1NvdW5kLnNJRCk7XG4gICAgc291bmRNYW5hZ2VyLnN0b3Aob1NvdW5kLnNJRCk7XG4gICAgaWYgKCFpc1RvdWNoRGV2aWNlKSB7IC8vIGlPUyA0LjIrIHNlY3VyaXR5IGJsb2NrcyBvbmZpbmlzaCgpIC0+IHBsYXlOZXh0KCkgaWYgd2Ugc2V0IGEgLnNyYyBpbi1iZXR3ZWVuKD8pXG4gICAgICBzb3VuZE1hbmFnZXIudW5sb2FkKG9Tb3VuZC5zSUQpO1xuICAgIH1cblxuICB9O1xuXG4gIHRoaXMuYnV0dG9uQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG5cbiAgICB2YXIgbyA9IGU/KGUudGFyZ2V0P2UudGFyZ2V0OmUuc3JjRWxlbWVudCk6d2luZG93LmV2ZW50LnNyY0VsZW1lbnQ7XG4gICAgc2VsZi5oYW5kbGVDbGljayh7dGFyZ2V0OnNlbGYuZ2V0UGFyZW50QnlDbGFzc05hbWUobywnc20yLTM2MHVpJykubmV4dFNpYmxpbmd9KTsgLy8gbGluayBuZXh0IHRvIHRoZSBub2RlcyB3ZSBpbnNlcnRlZFxuICAgIHJldHVybiBmYWxzZTtcblxuICB9O1xuXG4gIHRoaXMuYnV0dG9uTW91c2VEb3duID0gZnVuY3Rpb24oZSkge1xuXG4gICAgLy8gdXNlciBtaWdodCBkZWNpZGUgdG8gZHJhZyBmcm9tIGhlcmVcbiAgICAvLyB3YXRjaCBmb3IgbW91c2UgbW92ZVxuICAgIGlmICghaXNUb3VjaERldmljZSkge1xuICAgICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIC8vIHNob3VsZCBiZSBib3VuZGFyeS1jaGVja2VkLCByZWFsbHkgKGVnLiBtb3ZlIDNweCBmaXJzdD8pXG4gICAgICAgIHNlbGYubW91c2VEb3duKGUpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5hZGRFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNobW92ZScsc2VsZi5tb3VzZURvd24pO1xuICAgIH1cbiAgICBzZWxmLnN0b3BFdmVudChlKTtcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgfTtcblxuICB0aGlzLm1vdXNlRG93biA9IGZ1bmN0aW9uKGUpIHtcblxuICAgIGlmICghaXNUb3VjaERldmljZSAmJiBlLmJ1dHRvbiA+IDEpIHtcbiAgICAgIHJldHVybiB0cnVlOyAvLyBpZ25vcmUgbm9uLWxlZnQtY2xpY2tcbiAgICB9XG5cbiAgICBpZiAoIXNlbGYubGFzdFNvdW5kKSB7XG4gICAgICBzZWxmLnN0b3BFdmVudChlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgZXZ0ID0gZT9lOndpbmRvdy5ldmVudCxcbiAgICAgICAgdGFyZ2V0LCB0aGlzU291bmQsIG9EYXRhO1xuXG4gICAgaWYgKGlzVG91Y2hEZXZpY2UgJiYgZXZ0LnRvdWNoZXMpIHtcbiAgICAgIGV2dCA9IGV2dC50b3VjaGVzWzBdO1xuICAgIH1cbiAgICB0YXJnZXQgPSAoZXZ0LnRhcmdldHx8ZXZ0LnNyY0VsZW1lbnQpO1xuXG4gICAgdGhpc1NvdW5kID0gc2VsZi5nZXRTb3VuZEJ5VVJMKHNlbGYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc20yX2xpbmsnLCdhJyxzZWxmLmdldFBhcmVudEJ5Q2xhc3NOYW1lKHRhcmdldCwndWkzNjAnKSlbMF0uaHJlZik7IC8vIHNlbGYubGFzdFNvdW5kOyAvLyBUT0RPOiBJbiBtdWx0aXBsZSBzb3VuZCBjYXNlLCBmaWd1cmUgb3V0IHdoaWNoIHNvdW5kIGlzIGludm9sdmVkIGV0Yy5cbiAgICAvLyBqdXN0IGluIGNhc2UsIHVwZGF0ZSBjb29yZGluYXRlcyAobWF5YmUgdGhlIGVsZW1lbnQgbW92ZWQgc2luY2UgbGFzdCB0aW1lLilcbiAgICBzZWxmLmxhc3RUb3VjaGVkU291bmQgPSB0aGlzU291bmQ7XG4gICAgc2VsZi5yZWZyZXNoQ29vcmRzKHRoaXNTb3VuZCk7XG4gICAgb0RhdGEgPSB0aGlzU291bmQuXzM2MGRhdGE7XG4gICAgc2VsZi5hZGRDbGFzcyhvRGF0YS5vVUlCb3gsJ3NtMl9kcmFnZ2luZycpO1xuICAgIG9EYXRhLnBhdXNlQ291bnQgPSAoc2VsZi5sYXN0VG91Y2hlZFNvdW5kLnBhdXNlZD8xOjApO1xuICAgIC8vIHNlbGYubGFzdFNvdW5kLnBhdXNlKCk7XG4gICAgc2VsZi5tbWgoZT9lOndpbmRvdy5ldmVudCk7XG5cbiAgICBpZiAoaXNUb3VjaERldmljZSkge1xuICAgICAgc2VsZi5yZW1vdmVFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNobW92ZScsc2VsZi5tb3VzZURvd24pO1xuICAgICAgc2VsZi5hZGRFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNobW92ZScsc2VsZi5tbWgpO1xuICAgICAgc2VsZi5hZGRFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNoZW5kJyxzZWxmLm1vdXNlVXApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpbmNyZWRpYmx5IG9sZC1za29vbC4gVE9ETzogTW9kZXJuaXplLlxuICAgICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBzZWxmLm1taDtcbiAgICAgIGRvY3VtZW50Lm9ubW91c2V1cCA9IHNlbGYubW91c2VVcDtcbiAgICB9XG5cbiAgICBzZWxmLnN0b3BFdmVudChlKTtcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgfTtcblxuICB0aGlzLm1vdXNlVXAgPSBmdW5jdGlvbihlKSB7XG5cbiAgICB2YXIgb0RhdGEgPSBzZWxmLmxhc3RUb3VjaGVkU291bmQuXzM2MGRhdGE7XG4gICAgc2VsZi5yZW1vdmVDbGFzcyhvRGF0YS5vVUlCb3gsJ3NtMl9kcmFnZ2luZycpO1xuICAgIGlmIChvRGF0YS5wYXVzZUNvdW50ID09PSAwKSB7XG4gICAgICBzZWxmLmxhc3RUb3VjaGVkU291bmQucmVzdW1lKCk7XG4gICAgfVxuICAgIGlmICghaXNUb3VjaERldmljZSkge1xuICAgICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBudWxsO1xuICAgICAgZG9jdW1lbnQub25tb3VzZXVwID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5yZW1vdmVFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNobW92ZScsc2VsZi5tbWgpO1xuICAgICAgc2VsZi5yZW1vdmVFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNoZW5kJyxzZWxmLm1vdXNlVVApO1xuICAgIH1cblxuICB9O1xuXG4gIHRoaXMubW1oID0gZnVuY3Rpb24oZSkge1xuXG4gICAgaWYgKHR5cGVvZiBlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgZSA9IHdpbmRvdy5ldmVudDtcbiAgICB9XG4gICAgdmFyIG9Tb3VuZCA9IHNlbGYubGFzdFRvdWNoZWRTb3VuZCxcbiAgICAgICAgY29vcmRzID0gc2VsZi5nZXRNb3VzZVhZKGUpLFxuICAgICAgICB4ID0gY29vcmRzWzBdLFxuICAgICAgICB5ID0gY29vcmRzWzFdLFxuICAgICAgICBkZWx0YVggPSB4LW9Tb3VuZC5fMzYwZGF0YS5jYW52YXNNaWRYWVswXSxcbiAgICAgICAgZGVsdGFZID0geS1vU291bmQuXzM2MGRhdGEuY2FudmFzTWlkWFlbMV0sXG4gICAgICAgIGFuZ2xlID0gTWF0aC5mbG9vcihmdWxsQ2lyY2xlLShzZWxmLnJhZDJkZWcoTWF0aC5hdGFuMihkZWx0YVgsZGVsdGFZKSkrMTgwKSk7XG5cbiAgICBvU291bmQuc2V0UG9zaXRpb24ob1NvdW5kLmR1cmF0aW9uRXN0aW1hdGUqKGFuZ2xlL2Z1bGxDaXJjbGUpKTtcbiAgICBzZWxmLnN0b3BFdmVudChlKTtcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgfTtcblxuICAvLyBhc3NpZ25Nb3VzZURvd24oKTtcblxuICB0aGlzLmRyYXdTb2xpZEFyYyA9IGZ1bmN0aW9uKG9DYW52YXMsIGNvbG9yLCByYWRpdXMsIHdpZHRoLCByYWRpYW5zLCBzdGFydEFuZ2xlLCBub0NsZWFyKSB7XG5cbiAgICAvLyB0aGFuayB5b3UsIGh0dHA6Ly93d3cuc25pcGVyc3lzdGVtcy5jby5uei9jb21tdW5pdHkvcG9sYXJjbG9jay90dXRvcmlhbC5odG1sXG5cbiAgICB2YXIgeCA9IHJhZGl1cyxcbiAgICAgICAgeSA9IHJhZGl1cyxcbiAgICAgICAgY2FudmFzID0gb0NhbnZhcyxcbiAgICAgICAgY3R4LCBpbm5lclJhZGl1cywgZG9lc250TGlrZVplcm8sIGVuZFBvaW50O1xuXG4gICAgaWYgKGNhbnZhcy5nZXRDb250ZXh0KXtcbiAgICAgIC8vIHVzZSBnZXRDb250ZXh0IHRvIHVzZSB0aGUgY2FudmFzIGZvciBkcmF3aW5nXG4gICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB9XG5cbiAgICAvLyByZS1hc3NpZ24gY2FudmFzIGFzIHRoZSBhY3R1YWwgY29udGV4dFxuICAgIG9DYW52YXMgPSBjdHg7XG5cbiAgICBpZiAoIW5vQ2xlYXIpIHtcbiAgICAgIHNlbGYuY2xlYXJDYW52YXMoY2FudmFzKTtcbiAgICB9XG4gICAgLy8gY3R4LnJlc3RvcmUoKTtcblxuICAgIGlmIChjb2xvcikge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIH1cblxuICAgIG9DYW52YXMuYmVnaW5QYXRoKCk7XG5cbiAgICBpZiAoaXNOYU4ocmFkaWFucykpIHtcbiAgICAgIHJhZGlhbnMgPSAwO1xuICAgIH1cblxuICAgIGlubmVyUmFkaXVzID0gcmFkaXVzLXdpZHRoO1xuICAgIGRvZXNudExpa2VaZXJvID0gKGlzT3BlcmEgfHwgaXNTYWZhcmkpOyAvLyBzYWZhcmkgNCBkb2Vzbid0IGFjdHVhbGx5IHNlZW0gdG8gbWluZC5cblxuICAgIGlmICghZG9lc250TGlrZVplcm8gfHwgKGRvZXNudExpa2VaZXJvICYmIHJhZGl1cyA+IDApKSB7XG4gICAgICBvQ2FudmFzLmFyYygwLCAwLCByYWRpdXMsIHN0YXJ0QW5nbGUsIHJhZGlhbnMsIGZhbHNlKTtcbiAgICAgIGVuZFBvaW50ID0gc2VsZi5nZXRBcmNFbmRwb2ludENvb3Jkcyhpbm5lclJhZGl1cywgcmFkaWFucyk7XG4gICAgICBvQ2FudmFzLmxpbmVUbyhlbmRQb2ludC54LCBlbmRQb2ludC55KTtcbiAgICAgIG9DYW52YXMuYXJjKDAsIDAsIGlubmVyUmFkaXVzLCByYWRpYW5zLCBzdGFydEFuZ2xlLCB0cnVlKTtcbiAgICAgIG9DYW52YXMuY2xvc2VQYXRoKCk7XG4gICAgICBvQ2FudmFzLmZpbGwoKTtcbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLmdldEFyY0VuZHBvaW50Q29vcmRzID0gZnVuY3Rpb24ocmFkaXVzLCByYWRpYW5zKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgeDogcmFkaXVzICogTWF0aC5jb3MocmFkaWFucyksXG4gICAgICB5OiByYWRpdXMgKiBNYXRoLnNpbihyYWRpYW5zKVxuICAgIH07XG5cbiAgfTtcblxuICB0aGlzLmRlZzJyYWQgPSBmdW5jdGlvbihuRGVnKSB7XG4gICAgcmV0dXJuIChuRGVnICogTWF0aC5QSS8xODApO1xuICB9O1xuXG4gIHRoaXMucmFkMmRlZyA9IGZ1bmN0aW9uKG5SYWQpIHtcbiAgICByZXR1cm4gKG5SYWQgKiAxODAvTWF0aC5QSSk7XG4gIH07XG5cbiAgdGhpcy5nZXRUaW1lID0gZnVuY3Rpb24obk1TZWMsYkFzU3RyaW5nKSB7XG5cbiAgICAvLyBjb252ZXJ0IG1pbGxpc2Vjb25kcyB0byBtbTpzcywgcmV0dXJuIGFzIG9iamVjdCBsaXRlcmFsIG9yIHN0cmluZ1xuICAgIHZhciBuU2VjID0gTWF0aC5mbG9vcihuTVNlYy8xMDAwKSxcbiAgICAgICAgbWluID0gTWF0aC5mbG9vcihuU2VjLzYwKSxcbiAgICAgICAgc2VjID0gblNlYy0obWluKjYwKTtcbiAgICAvLyBpZiAobWluID09PSAwICYmIHNlYyA9PT0gMCkgcmV0dXJuIG51bGw7IC8vIHJldHVybiAwOjAwIGFzIG51bGxcbiAgICByZXR1cm4gKGJBc1N0cmluZz8obWluKyc6Jysoc2VjPDEwPycwJytzZWM6c2VjKSk6eydtaW4nOm1pbiwnc2VjJzpzZWN9KTtcblxuICB9O1xuXG4gIHRoaXMuY2xlYXJDYW52YXMgPSBmdW5jdGlvbihvQ2FudmFzKSB7XG5cbiAgICB2YXIgY2FudmFzID0gb0NhbnZhcyxcbiAgICAgICAgY3R4ID0gbnVsbCxcbiAgICAgICAgd2lkdGgsIGhlaWdodDtcbiAgICBpZiAoY2FudmFzLmdldENvbnRleHQpe1xuICAgICAgLy8gdXNlIGdldENvbnRleHQgdG8gdXNlIHRoZSBjYW52YXMgZm9yIGRyYXdpbmdcbiAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIH1cbiAgICB3aWR0aCA9IGNhbnZhcy5vZmZzZXRXaWR0aDtcbiAgICBoZWlnaHQgPSBjYW52YXMub2Zmc2V0SGVpZ2h0O1xuICAgIGN0eC5jbGVhclJlY3QoLSh3aWR0aC8yKSwgLShoZWlnaHQvMiksIHdpZHRoLCBoZWlnaHQpO1xuXG4gIH07XG5cbiAgdGhpcy51cGRhdGVQbGF5aW5nID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgdGltZU5vdyA9ICh0aGlzLl8zNjBkYXRhLnNob3dITVNUaW1lP3NlbGYuZ2V0VGltZSh0aGlzLnBvc2l0aW9uLHRydWUpOnBhcnNlSW50KHRoaXMucG9zaXRpb24vMTAwMCwgMTApKTtcblxuICAgIGlmICh0aGlzLmJ5dGVzTG9hZGVkKSB7XG4gICAgICB0aGlzLl8zNjBkYXRhLmxhc3RWYWx1ZXMuYnl0ZXNMb2FkZWQgPSB0aGlzLmJ5dGVzTG9hZGVkO1xuICAgICAgdGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLmJ5dGVzVG90YWwgPSB0aGlzLmJ5dGVzVG90YWw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucG9zaXRpb24pIHtcbiAgICAgIHRoaXMuXzM2MGRhdGEubGFzdFZhbHVlcy5wb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZHVyYXRpb25Fc3RpbWF0ZSkge1xuICAgICAgdGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLmR1cmF0aW9uRXN0aW1hdGUgPSB0aGlzLmR1cmF0aW9uRXN0aW1hdGU7XG4gICAgfVxuXG4gICAgc2VsZi5kcmF3U29saWRBcmModGhpcy5fMzYwZGF0YS5vQ2FudmFzLHNlbGYuY29uZmlnLmJhY2tncm91bmRSaW5nQ29sb3IsdGhpcy5fMzYwZGF0YS53aWR0aCx0aGlzLl8zNjBkYXRhLnJhZGl1cyxzZWxmLmRlZzJyYWQoZnVsbENpcmNsZSksZmFsc2UpO1xuXG4gICAgc2VsZi5kcmF3U29saWRBcmModGhpcy5fMzYwZGF0YS5vQ2FudmFzLCh0aGlzLl8zNjBkYXRhLm1ldGFkYXRhP3NlbGYuY29uZmlnLmxvYWRSaW5nQ29sb3JNZXRhZGF0YTpzZWxmLmNvbmZpZy5sb2FkUmluZ0NvbG9yKSx0aGlzLl8zNjBkYXRhLndpZHRoLHRoaXMuXzM2MGRhdGEucmFkaXVzLHNlbGYuZGVnMnJhZChmdWxsQ2lyY2xlKih0aGlzLl8zNjBkYXRhLmxhc3RWYWx1ZXMuYnl0ZXNMb2FkZWQvdGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLmJ5dGVzVG90YWwpKSwwLHRydWUpO1xuXG4gICAgLy8gZG9uJ3QgZHJhdyBpZiAwIChmdWxsIGJsYWNrIGNpcmNsZSBpbiBPcGVyYSlcbiAgICBpZiAodGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLnBvc2l0aW9uICE9PSAwKSB7XG4gICAgICBzZWxmLmRyYXdTb2xpZEFyYyh0aGlzLl8zNjBkYXRhLm9DYW52YXMsKHRoaXMuXzM2MGRhdGEubWV0YWRhdGE/c2VsZi5jb25maWcucGxheVJpbmdDb2xvck1ldGFkYXRhOnNlbGYuY29uZmlnLnBsYXlSaW5nQ29sb3IpLHRoaXMuXzM2MGRhdGEud2lkdGgsdGhpcy5fMzYwZGF0YS5yYWRpdXMsc2VsZi5kZWcycmFkKCh0aGlzLl8zNjBkYXRhLmRpZEZpbmlzaD09PTE/ZnVsbENpcmNsZTpmdWxsQ2lyY2xlKih0aGlzLl8zNjBkYXRhLmxhc3RWYWx1ZXMucG9zaXRpb24vdGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLmR1cmF0aW9uRXN0aW1hdGUpKSksMCx0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBtZXRhZGF0YSBnb2VzIGhlcmVcbiAgICBpZiAodGhpcy5fMzYwZGF0YS5tZXRhZGF0YSkge1xuICAgICAgdGhpcy5fMzYwZGF0YS5tZXRhZGF0YS5ldmVudHMud2hpbGVwbGF5aW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKHRpbWVOb3cgIT09IHRoaXMuXzM2MGRhdGEubGFzdFRpbWUpIHtcbiAgICAgIHRoaXMuXzM2MGRhdGEubGFzdFRpbWUgPSB0aW1lTm93O1xuICAgICAgdGhpcy5fMzYwZGF0YS5vVGltaW5nLmlubmVySFRNTCA9IHRpbWVOb3c7XG4gICAgfVxuXG4gICAgLy8gZHJhdyBzcGVjdHJ1bSwgaWYgYXBwbGljYWJsZVxuICAgIGlmICgodGhpcy5pbnN0YW5jZU9wdGlvbnMudXNlV2F2ZWZvcm1EYXRhIHx8IHRoaXMuaW5zdGFuY2VPcHRpb25zLnVzZUVRRGF0YSkgJiYgaGFzUmVhbENhbnZhcykgeyAvLyBJRSA8OSBjYW4gcmVuZGVyIG1heWJlIDMgb3IgNCBGUFMgd2hlbiBpbmNsdWRpbmcgdGhlIHdhdmUvRVEsIHNvIGRvbid0IGJvdGhlci5cbiAgICAgIHNlbGYudXBkYXRlV2F2ZWZvcm0odGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKHNlbGYuY29uZmlnLnVzZUZhdkljb24gJiYgc2VsZi52dU1ldGVyKSB7XG4gICAgICBzZWxmLnZ1TWV0ZXIudXBkYXRlVlUodGhpcyk7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy51cGRhdGVXYXZlZm9ybSA9IGZ1bmN0aW9uKG9Tb3VuZCkge1xuXG4gICAgaWYgKCghc2VsZi5jb25maWcudXNlV2F2ZWZvcm1EYXRhICYmICFzZWxmLmNvbmZpZy51c2VFUURhdGEpIHx8ICghc20uZmVhdHVyZXMud2F2ZWZvcm1EYXRhICYmICFzbS5mZWF0dXJlcy5lcURhdGEpKSB7XG4gICAgICAvLyBmZWF0dXJlIG5vdCBlbmFibGVkLi5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW9Tb3VuZC53YXZlZm9ybURhdGEubGVmdC5sZW5ndGggJiYgIW9Tb3VuZC5lcURhdGEubGVuZ3RoICYmICFvU291bmQucGVha0RhdGEubGVmdCkge1xuICAgICAgLy8gbm8gZGF0YSAob3IgZXJyb3JlZCBvdXQvcGF1c2VkL3VuYXZhaWxhYmxlPylcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiB1c2UgZm9yIHRlc3RpbmcgdGhlIGRhdGEgKi9cbiAgICAvKlxuICAgICBmb3IgKGk9MDsgaTwyNTY7IGkrKykge1xuICAgICAgIG9Tb3VuZC5lcURhdGFbaV0gPSAxLShpLzI1Nik7XG4gICAgIH1cbiAgICAqL1xuXG4gICAgdmFyIG9DYW52YXMgPSBvU291bmQuXzM2MGRhdGEub0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpLFxuICAgICAgICBvZmZYID0gMCxcbiAgICAgICAgb2ZmWSA9IHBhcnNlSW50KG9Tb3VuZC5fMzYwZGF0YS5jaXJjbGVEaWFtZXRlci8yLCAxMCksXG4gICAgICAgIHNjYWxlID0gb2ZmWS8yLCAvLyBZIGF4aXMgKCsvLSB0aGlzIGRpc3RhbmNlIGZyb20gMClcbiAgICAgICAgLy8gbGluZVdpZHRoID0gTWF0aC5mbG9vcihvU291bmQuXzM2MGRhdGEuY2lyY2xlRGlhbWV0ZXItKG9Tb3VuZC5fMzYwZGF0YS5jaXJjbGVEaWFtZXRlciowLjE3NSkvKG9Tb3VuZC5fMzYwZGF0YS5jaXJjbGVEaWFtZXRlci8yNTUpKTsgLy8gd2lkdGggZm9yIGVhY2ggbGluZVxuICAgICAgICBsaW5lV2lkdGggPSAxLFxuICAgICAgICBsaW5lSGVpZ2h0ID0gMSxcbiAgICAgICAgdGhpc1kgPSAwLFxuICAgICAgICBvZmZzZXQgPSBvZmZZLFxuICAgICAgICBpLCBqLCBkaXJlY3Rpb24sIGRvd25TYW1wbGUsIGRhdGFMZW5ndGgsIHNhbXBsZUNvdW50LCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgd2F2ZURhdGEsIGlubmVyUmFkaXVzLCBwZXJJdGVtQW5nbGUsIHlEaWZmLCBlcVNhbXBsZXMsIHBsYXllZEFuZ2xlLCBpQXZnLCBuUGVhaztcblxuICAgIGlmIChzZWxmLmNvbmZpZy51c2VXYXZlZm9ybURhdGEpIHtcbiAgICAgIC8vIHJhdyB3YXZlZm9ybVxuICAgICAgZG93blNhbXBsZSA9IHNlbGYuY29uZmlnLndhdmVmb3JtRGF0YURvd25zYW1wbGU7IC8vIG9ubHkgc2FtcGxlIFggaW4gMjU2IChncmVhdGVyIG51bWJlciA9IGxlc3Mgc2FtcGxlIHBvaW50cylcbiAgICAgIGRvd25TYW1wbGUgPSBNYXRoLm1heCgxLGRvd25TYW1wbGUpOyAvLyBtYWtlIHN1cmUgaXQncyBhdCBsZWFzdCAxXG4gICAgICBkYXRhTGVuZ3RoID0gMjU2O1xuICAgICAgc2FtcGxlQ291bnQgPSAoZGF0YUxlbmd0aC9kb3duU2FtcGxlKTtcbiAgICAgIHN0YXJ0QW5nbGUgPSAwO1xuICAgICAgZW5kQW5nbGUgPSAwO1xuICAgICAgd2F2ZURhdGEgPSBudWxsO1xuICAgICAgaW5uZXJSYWRpdXMgPSAoc2VsZi5jb25maWcud2F2ZWZvcm1EYXRhT3V0c2lkZT8xOihzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFDb25zdHJhaW4/MC41OjAuNTY1KSk7XG4gICAgICBzY2FsZSA9IChzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFPdXRzaWRlPzAuNzowLjc1KTtcbiAgICAgIHBlckl0ZW1BbmdsZSA9IHNlbGYuZGVnMnJhZCgoMzYwL3NhbXBsZUNvdW50KSpzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFMaW5lUmF0aW8pOyAvLyAwLjg1ID0gY2xlYW4gcGl4ZWwgbGluZXMgYXQgMTUwPyAvLyBzZWxmLmRlZzJyYWQoMzYwKihNYXRoLm1heCgxLGRvd25TYW1wbGUtMSkpL3NhbXBsZUNvdW50KTtcbiAgICAgIGZvciAoaT0wOyBpPGRhdGFMZW5ndGg7IGkrPWRvd25TYW1wbGUpIHtcbiAgICAgICAgc3RhcnRBbmdsZSA9IHNlbGYuZGVnMnJhZCgzNjAqKGkvKHNhbXBsZUNvdW50KSoxL2Rvd25TYW1wbGUpKTsgLy8gKzAuNjcgLSBjb3VudGVyIGZvciBzcGFjaW5nXG4gICAgICAgIGVuZEFuZ2xlID0gc3RhcnRBbmdsZStwZXJJdGVtQW5nbGU7XG4gICAgICAgIHdhdmVEYXRhID0gb1NvdW5kLndhdmVmb3JtRGF0YS5sZWZ0W2ldO1xuICAgICAgICBpZiAod2F2ZURhdGE8MCAmJiBzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFDb25zdHJhaW4pIHtcbiAgICAgICAgICB3YXZlRGF0YSA9IE1hdGguYWJzKHdhdmVEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmRyYXdTb2xpZEFyYyhvU291bmQuXzM2MGRhdGEub0NhbnZhcyxzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFDb2xvcixvU291bmQuXzM2MGRhdGEud2lkdGgqaW5uZXJSYWRpdXMsb1NvdW5kLl8zNjBkYXRhLnJhZGl1cypzY2FsZSoxLjI1KndhdmVEYXRhLGVuZEFuZ2xlLHN0YXJ0QW5nbGUsdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNlbGYuY29uZmlnLnVzZUVRRGF0YSkge1xuICAgICAgLy8gRVEgc3BlY3RydW1cbiAgICAgIGRvd25TYW1wbGUgPSBzZWxmLmNvbmZpZy5lcURhdGFEb3duc2FtcGxlOyAvLyBvbmx5IHNhbXBsZSBOIGluIDI1NlxuICAgICAgeURpZmYgPSAwO1xuICAgICAgZG93blNhbXBsZSA9IE1hdGgubWF4KDEsZG93blNhbXBsZSk7IC8vIG1ha2Ugc3VyZSBpdCdzIGF0IGxlYXN0IDFcbiAgICAgIGVxU2FtcGxlcyA9IDE5MjsgLy8gZHJvcCB0aGUgbGFzdCAyNSUgb2YgdGhlIHNwZWN0cnVtICg+MTY1MDAgSHopLCBtb3N0IHN0dWZmIHdvbid0IGFjdHVhbGx5IHVzZSBpdC5cbiAgICAgIHNhbXBsZUNvdW50ID0gKGVxU2FtcGxlcy9kb3duU2FtcGxlKTtcbiAgICAgIGlubmVyUmFkaXVzID0gKHNlbGYuY29uZmlnLmVxRGF0YU91dHNpZGU/MTowLjU2NSk7XG4gICAgICBkaXJlY3Rpb24gPSAoc2VsZi5jb25maWcuZXFEYXRhT3V0c2lkZT8tMToxKTtcbiAgICAgIHNjYWxlID0gKHNlbGYuY29uZmlnLmVxRGF0YU91dHNpZGU/MC41OjAuNzUpO1xuICAgICAgc3RhcnRBbmdsZSA9IDA7XG4gICAgICBlbmRBbmdsZSA9IDA7XG4gICAgICBwZXJJdGVtQW5nbGUgPSBzZWxmLmRlZzJyYWQoKDM2MC9zYW1wbGVDb3VudCkqc2VsZi5jb25maWcuZXFEYXRhTGluZVJhdGlvKTsgLy8gc2VsZi5kZWcycmFkKDM2MC8oc2FtcGxlQ291bnQrMSkpO1xuICAgICAgcGxheWVkQW5nbGUgPSBzZWxmLmRlZzJyYWQoKG9Tb3VuZC5fMzYwZGF0YS5kaWRGaW5pc2g9PT0xPzM2MDozNjAqKG9Tb3VuZC5fMzYwZGF0YS5sYXN0VmFsdWVzLnBvc2l0aW9uL29Tb3VuZC5fMzYwZGF0YS5sYXN0VmFsdWVzLmR1cmF0aW9uRXN0aW1hdGUpKSk7XG4gICAgICBqPTA7XG4gICAgICBpQXZnID0gMDtcbiAgICAgIGZvciAoaT0wOyBpPGVxU2FtcGxlczsgaSs9ZG93blNhbXBsZSkge1xuICAgICAgICBzdGFydEFuZ2xlID0gc2VsZi5kZWcycmFkKDM2MCooaS9lcVNhbXBsZXMpKTtcbiAgICAgICAgZW5kQW5nbGUgPSBzdGFydEFuZ2xlK3Blckl0ZW1BbmdsZTtcbiAgICAgICAgc2VsZi5kcmF3U29saWRBcmMob1NvdW5kLl8zNjBkYXRhLm9DYW52YXMsKGVuZEFuZ2xlPnBsYXllZEFuZ2xlP3NlbGYuY29uZmlnLmVxRGF0YUNvbG9yOnNlbGYuY29uZmlnLnBsYXlSaW5nQ29sb3IpLG9Tb3VuZC5fMzYwZGF0YS53aWR0aCppbm5lclJhZGl1cyxvU291bmQuXzM2MGRhdGEucmFkaXVzKnNjYWxlKihvU291bmQuZXFEYXRhLmxlZnRbaV0qZGlyZWN0aW9uKSxlbmRBbmdsZSxzdGFydEFuZ2xlLHRydWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZWxmLmNvbmZpZy51c2VQZWFrRGF0YSkge1xuICAgICAgaWYgKCFvU291bmQuXzM2MGRhdGEuYW5pbWF0aW5nKSB7XG4gICAgICAgIG5QZWFrID0gKG9Tb3VuZC5wZWFrRGF0YS5sZWZ0fHxvU291bmQucGVha0RhdGEucmlnaHQpO1xuICAgICAgICAvLyBHSUFOVCBIQUNLOiB1c2UgRVEgc3BlY3RydW0gZGF0YSBmb3IgYmFzcyBmcmVxdWVuY2llc1xuICAgICAgICBlcVNhbXBsZXMgPSAzO1xuICAgICAgICBmb3IgKGk9MDsgaTxlcVNhbXBsZXM7IGkrKykge1xuICAgICAgICAgIG5QZWFrID0gKG5QZWFrfHxvU291bmQuZXFEYXRhW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBvU291bmQuXzM2MGRhdGEuYW1wbGlmaWVyID0gKHNlbGYuY29uZmlnLnVzZUFtcGxpZmllcj8oMC45KyhuUGVhayowLjEpKToxKTtcbiAgICAgICAgb1NvdW5kLl8zNjBkYXRhLnJhZGl1c01heCA9IG9Tb3VuZC5fMzYwZGF0YS5jaXJjbGVEaWFtZXRlciowLjE3NSpvU291bmQuXzM2MGRhdGEuYW1wbGlmaWVyO1xuICAgICAgICBvU291bmQuXzM2MGRhdGEud2lkdGhNYXggPSBvU291bmQuXzM2MGRhdGEuY2lyY2xlRGlhbWV0ZXIqMC40Km9Tb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXI7XG4gICAgICAgIG9Tb3VuZC5fMzYwZGF0YS5yYWRpdXMgPSBwYXJzZUludChvU291bmQuXzM2MGRhdGEucmFkaXVzTWF4Km9Tb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXIsIDEwKTtcbiAgICAgICAgb1NvdW5kLl8zNjBkYXRhLndpZHRoID0gcGFyc2VJbnQob1NvdW5kLl8zNjBkYXRhLndpZHRoTWF4Km9Tb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXIsIDEwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLmdldFVJSFRNTCA9IGZ1bmN0aW9uKGRpYW1ldGVyKSB7XG5cbiAgICByZXR1cm4gW1xuICAgICAnPGNhbnZhcyBjbGFzcz1cInNtMi1jYW52YXNcIiB3aWR0aD1cIicrZGlhbWV0ZXIrJ1wiIGhlaWdodD1cIicrZGlhbWV0ZXIrJ1wiPjwvY2FudmFzPicsXG4gICAgICcgPHNwYW4gY2xhc3M9XCJzbTItMzYwYnRuIHNtMi0zNjBidG4tZGVmYXVsdFwiPjwvc3Bhbj4nLCAvLyBub3RlIHVzZSBvZiBpbWFnZU1hcCwgZWRpdCBvciByZW1vdmUgaWYgeW91IHVzZSBhIGRpZmZlcmVudC1zaXplIGltYWdlLlxuICAgICAnIDxkaXYgY2xhc3M9XCJzbTItdGltaW5nJysobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvc2FmYXJpL2kpPycgYWxpZ25Ud2Vhayc6JycpKydcIj48L2Rpdj4nLCAvLyArIEV2ZXItc28tc2xpZ2h0IFNhZmFyaSBob3Jpem9udGFsIGFsaWdubWVudCB0d2Vha1xuICAgICAnIDxkaXYgY2xhc3M9XCJzbTItY292ZXJcIj48L2Rpdj4nXG4gICAgXTtcblxuICB9O1xuXG4gIHRoaXMudWlUZXN0ID0gZnVuY3Rpb24oc0NsYXNzKSB7XG5cbiAgICAvLyBmYWtlIGEgMzYwIFVJIHNvIHdlIGNhbiBnZXQgc29tZSBudW1iZXJzIGZyb20gQ1NTLCBldGMuXG5cbiAgICB2YXIgb1RlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgIG9GYWtlVUksIG9GYWtlVUlCb3gsIG9UZW1wLCBmYWtlRGlhbWV0ZXIsIHVpSFRNTCwgY2lyY2xlRGlhbWV0ZXIsIGNpcmNsZVJhZGl1cywgZm9udFNpemVNYXgsIG9UaW1pbmc7XG5cbiAgICBvVGVtcGxhdGUuY2xhc3NOYW1lID0gJ3NtMi0zNjB1aSc7XG5cbiAgICBvRmFrZVVJID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb0Zha2VVSS5jbGFzc05hbWUgPSAndWkzNjAnKyhzQ2xhc3M/JyAnK3NDbGFzczonJyk7IC8vIHVpMzYwIHVpMzYwLXZpc1xuXG4gICAgb0Zha2VVSUJveCA9IG9GYWtlVUkuYXBwZW5kQ2hpbGQob1RlbXBsYXRlLmNsb25lTm9kZSh0cnVlKSk7XG5cbiAgICBvRmFrZVVJLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBvRmFrZVVJLnN0eWxlLmxlZnQgPSAnLTk5OTlweCc7XG5cbiAgICBvVGVtcCA9IGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob0Zha2VVSSk7XG5cbiAgICBmYWtlRGlhbWV0ZXIgPSBvRmFrZVVJQm94Lm9mZnNldFdpZHRoO1xuXG4gICAgdWlIVE1MID0gc2VsZi5nZXRVSUhUTUwoZmFrZURpYW1ldGVyKTtcblxuICAgIG9GYWtlVUlCb3guaW5uZXJIVE1MID0gdWlIVE1MWzFdK3VpSFRNTFsyXSt1aUhUTUxbM107XG5cbiAgICBjaXJjbGVEaWFtZXRlciA9IHBhcnNlSW50KG9GYWtlVUlCb3gub2Zmc2V0V2lkdGgsIDEwKTtcbiAgICBjaXJjbGVSYWRpdXMgPSBwYXJzZUludChjaXJjbGVEaWFtZXRlci8yLCAxMCk7XG5cbiAgICBvVGltaW5nID0gc2VsZi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzbTItdGltaW5nJywnZGl2JyxvVGVtcClbMF07XG4gICAgZm9udFNpemVNYXggPSBwYXJzZUludChzZWxmLmdldFN0eWxlKG9UaW1pbmcsJ2ZvbnQtc2l6ZScpLCAxMCk7XG4gICAgaWYgKGlzTmFOKGZvbnRTaXplTWF4KSkge1xuICAgICAgLy8gZ2V0U3R5bGUoKSBldGMuIGRpZG4ndCB3b3JrLlxuICAgICAgZm9udFNpemVNYXggPSBudWxsO1xuICAgIH1cblxuICAgIC8vIHNvdW5kTWFuYWdlci5fd3JpdGVEZWJ1ZygnZGlhbWV0ZXIsIGZvbnQgc2l6ZTogJytjaXJjbGVEaWFtZXRlcisnLCcrZm9udFNpemVNYXgpO1xuXG4gICAgb0Zha2VVSS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG9GYWtlVUkpO1xuXG4gICAgdWlIVE1MID0gb0Zha2VVSSA9IG9GYWtlVUlCb3ggPSBvVGVtcCA9IG51bGw7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY2lyY2xlRGlhbWV0ZXI6IGNpcmNsZURpYW1ldGVyLFxuICAgICAgY2lyY2xlUmFkaXVzOiBjaXJjbGVSYWRpdXMsXG4gICAgICBmb250U2l6ZU1heDogZm9udFNpemVNYXhcbiAgICB9O1xuXG4gIH07XG5cbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICBzbS5fd3JpdGVEZWJ1ZygndGhyZWVTaXh0eVBsYXllci5pbml0KCknKTtcblxuICAgICAgaWYoc2VsZi5jb25maWcuaXRlbXMpe1xuICAgICAgICAgIHZhciBvSXRlbXMgPSBzZWxmLmNvbmZpZy5pdGVtcztcbiAgICAgIH1lbHNle1xuICAgICAgICAgIHZhciBvSXRlbXMgPSBzZWxmLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3VpMzYwJywnZGl2Jyk7XG4gICAgICB9XG4gICAgdmFyIGksIGosIG9MaW5rcyA9IFtdLCBpc192aXMgPSBmYWxzZSwgZm91bmRJdGVtcyA9IDAsIG9DYW52YXMsIG9DYW52YXNDVFgsIG9Db3ZlciwgZGlhbWV0ZXIsIHJhZGl1cywgdWlEYXRhLCB1aURhdGFWaXMsIG9VSSwgb0J0biwgbywgbzIsIG9JRDtcblxuICAgIGZvciAoaT0wLGo9b0l0ZW1zLmxlbmd0aDsgaTxqOyBpKyspIHtcbiAgICAgIG9MaW5rcy5wdXNoKG9JdGVtc1tpXS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpWzBdKTtcbiAgICAgIC8vIHJlbW92ZSBcImZha2VcIiBwbGF5IGJ1dHRvbiAodW5zdXBwb3J0ZWQgY2FzZSlcbiAgICAgIG9JdGVtc1tpXS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAnbm9uZSc7XG4gICAgfVxuICAgIC8vIGdyYWIgYWxsIGxpbmtzLCBsb29rIGZvciAubXAzXG5cbiAgICBzZWxmLm9VSVRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgc2VsZi5vVUlUZW1wbGF0ZS5jbGFzc05hbWUgPSAnc20yLTM2MHVpJztcblxuICAgIHNlbGYub1VJVGVtcGxhdGVWaXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzZWxmLm9VSVRlbXBsYXRlVmlzLmNsYXNzTmFtZSA9ICdzbTItMzYwdWknO1xuXG4gICAgdWlEYXRhID0gc2VsZi51aVRlc3QoKTtcblxuICAgIHNlbGYuY29uZmlnLmNpcmNsZURpYW1ldGVyID0gdWlEYXRhLmNpcmNsZURpYW1ldGVyO1xuICAgIHNlbGYuY29uZmlnLmNpcmNsZVJhZGl1cyA9IHVpRGF0YS5jaXJjbGVSYWRpdXM7XG4gICAgLy8gc2VsZi5jb25maWcuZm9udFNpemVNYXggPSB1aURhdGEuZm9udFNpemVNYXg7XG5cbiAgICB1aURhdGFWaXMgPSBzZWxmLnVpVGVzdCgndWkzNjAtdmlzJyk7XG5cbiAgICBzZWxmLmNvbmZpZy5mb250U2l6ZU1heCA9IHVpRGF0YVZpcy5mb250U2l6ZU1heDtcblxuICAgIC8vIGNhbnZhcyBuZWVkcyBpbmxpbmUgd2lkdGggYW5kIGhlaWdodCwgZG9lc24ndCBxdWl0ZSB3b3JrIG90aGVyd2lzZVxuICAgIHNlbGYub1VJVGVtcGxhdGUuaW5uZXJIVE1MID0gc2VsZi5nZXRVSUhUTUwoc2VsZi5jb25maWcuY2lyY2xlRGlhbWV0ZXIpLmpvaW4oJycpO1xuXG4gICAgc2VsZi5vVUlUZW1wbGF0ZVZpcy5pbm5lckhUTUwgPSBzZWxmLmdldFVJSFRNTCh1aURhdGFWaXMuY2lyY2xlRGlhbWV0ZXIpLmpvaW4oJycpO1xuXG4gICAgZm9yIChpPTAsaj1vTGlua3MubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgaWYgKHNtLmNhblBsYXlMaW5rKG9MaW5rc1tpXSkgJiYgIXNlbGYuaGFzQ2xhc3Mob0xpbmtzW2ldLHNlbGYuZXhjbHVkZUNsYXNzKSAmJiAhc2VsZi5oYXNDbGFzcyhvTGlua3NbaV0sc2VsZi5jc3Muc0RlZmF1bHQpKSB7XG4gICAgICAgIHNlbGYuYWRkQ2xhc3Mob0xpbmtzW2ldLHNlbGYuY3NzLnNEZWZhdWx0KTsgLy8gYWRkIGRlZmF1bHQgQ1NTIGRlY29yYXRpb25cbiAgICAgICAgc2VsZi5saW5rc1tmb3VuZEl0ZW1zXSA9IChvTGlua3NbaV0pO1xuICAgICAgICBzZWxmLmluZGV4QnlVUkxbb0xpbmtzW2ldLmhyZWZdID0gZm91bmRJdGVtczsgLy8gaGFjayBmb3IgaW5kZXhpbmdcbiAgICAgICAgZm91bmRJdGVtcysrO1xuXG4gICAgICAgIGlzX3ZpcyA9IHNlbGYuaGFzQ2xhc3Mob0xpbmtzW2ldLnBhcmVudE5vZGUsICd1aTM2MC12aXMnKTtcblxuICAgICAgICBkaWFtZXRlciA9IChpc192aXMgPyB1aURhdGFWaXMgOiB1aURhdGEpLmNpcmNsZURpYW1ldGVyO1xuICAgICAgICByYWRpdXMgPSAoaXNfdmlzID8gdWlEYXRhVmlzIDogdWlEYXRhKS5jaXJjbGVSYWRpdXM7XG5cbiAgICAgICAgLy8gYWRkIGNhbnZhcyBzaGl6XG4gICAgICAgIG9VSSA9IG9MaW5rc1tpXS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSgoaXNfdmlzP3NlbGYub1VJVGVtcGxhdGVWaXM6c2VsZi5vVUlUZW1wbGF0ZSkuY2xvbmVOb2RlKHRydWUpLG9MaW5rc1tpXSk7XG5cbiAgICAgICAgaWYgKGlzSUUgJiYgdHlwZW9mIHdpbmRvdy5HX3ZtbENhbnZhc01hbmFnZXIgIT09ICd1bmRlZmluZWQnKSB7IC8vIElFIG9ubHlcbiAgICAgICAgICBvID0gb0xpbmtzW2ldLnBhcmVudE5vZGU7XG4gICAgICAgICAgbzIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICBvMi5jbGFzc05hbWUgPSAnc20yLWNhbnZhcyc7XG4gICAgICAgICAgb0lEID0gJ3NtMl9jYW52YXNfJytwYXJzZUludChNYXRoLnJhbmRvbSgpKjEwNDg1NzYsIDEwKTtcbiAgICAgICAgICBvMi5pZCA9IG9JRDtcbiAgICAgICAgICBvMi53aWR0aCA9IGRpYW1ldGVyO1xuICAgICAgICAgIG8yLmhlaWdodCA9IGRpYW1ldGVyO1xuICAgICAgICAgIG9VSS5hcHBlbmRDaGlsZChvMik7XG4gICAgICAgICAgd2luZG93Lkdfdm1sQ2FudmFzTWFuYWdlci5pbml0RWxlbWVudChvMik7IC8vIEFwcGx5IEV4Q2FudmFzIGNvbXBhdGliaWxpdHkgbWFnaWNcbiAgICAgICAgICBvQ2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQob0lEKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBhZGQgYSBoYW5kbGVyIGZvciB0aGUgYnV0dG9uXG4gICAgICAgICAgb0NhbnZhcyA9IG9MaW5rc1tpXS5wYXJlbnROb2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjYW52YXMnKVswXTtcbiAgICAgICAgfVxuICAgICAgICBvQ292ZXIgPSBzZWxmLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NtMi1jb3ZlcicsJ2Rpdicsb0xpbmtzW2ldLnBhcmVudE5vZGUpWzBdO1xuICAgICAgICBvQnRuID0gb0xpbmtzW2ldLnBhcmVudE5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVswXTtcbiAgICAgICAgc2VsZi5hZGRFdmVudEhhbmRsZXIob0J0biwnY2xpY2snLHNlbGYuYnV0dG9uQ2xpY2spO1xuICAgICAgICBpZiAoIWlzVG91Y2hEZXZpY2UpIHtcbiAgICAgICAgICBzZWxmLmFkZEV2ZW50SGFuZGxlcihvQ292ZXIsJ21vdXNlZG93bicsc2VsZi5tb3VzZURvd24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuYWRkRXZlbnRIYW5kbGVyKG9Db3ZlciwndG91Y2hzdGFydCcsc2VsZi5tb3VzZURvd24pO1xuICAgICAgICB9XG4gICAgICAgIG9DYW52YXNDVFggPSBvQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIG9DYW52YXNDVFgudHJhbnNsYXRlKHJhZGl1cywgcmFkaXVzKTtcbiAgICAgICAgb0NhbnZhc0NUWC5yb3RhdGUoc2VsZi5kZWcycmFkKC05MCkpOyAvLyBjb21wZW5zYXRlIGZvciBhcmMgc3RhcnRpbmcgYXQgRUFTVCAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMxOTI2Ny90dXRvcmlhbC1mb3ItaHRtbC1jYW52YXNzLWFyYy1mdW5jdGlvblxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZm91bmRJdGVtcz4wKSB7XG4gICAgICBzZWxmLmFkZEV2ZW50SGFuZGxlcihkb2N1bWVudCwnY2xpY2snLHNlbGYuaGFuZGxlQ2xpY2spO1xuICAgICAgaWYgKHNlbGYuY29uZmlnLmF1dG9QbGF5KSB7XG4gICAgICAgIHNlbGYuaGFuZGxlQ2xpY2soe3RhcmdldDpzZWxmLmxpbmtzWzBdLHByZXZlbnREZWZhdWx0OmZ1bmN0aW9uKCl7fX0pO1xuICAgICAgfVxuICAgIH1cbiAgICBzbS5fd3JpdGVEZWJ1ZygndGhyZWVTaXh0eVBsYXllci5pbml0KCk6IEZvdW5kICcrZm91bmRJdGVtcysnIHJlbGV2YW50IGl0ZW1zLicpO1xuXG4gICAgaWYgKHNlbGYuY29uZmlnLnVzZUZhdkljb24gJiYgdHlwZW9mIHRoaXMuVlVNZXRlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMudnVNZXRlciA9IG5ldyB0aGlzLlZVTWV0ZXIodGhpcyk7XG4gICAgfVxuXG4gIH07XG5cbn1cblxuLy8gT3B0aW9uYWw6IFZVIE1ldGVyIGNvbXBvbmVudFxuXG5UaHJlZVNpeHR5UGxheWVyLnByb3RvdHlwZS5WVU1ldGVyID0gZnVuY3Rpb24ob1BhcmVudCkge1xuXG4gIHZhciBzZWxmID0gb1BhcmVudCxcbiAgICAgIG1lID0gdGhpcyxcbiAgICAgIF9oZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgIGlzT3BlcmEgPSAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvb3BlcmEvaSkpLFxuICAgICAgaXNGaXJlZm94ID0gKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2ZpcmVmb3gvaSkpO1xuXG4gIHRoaXMudnVNZXRlckRhdGEgPSBbXTtcbiAgdGhpcy52dURhdGFDYW52YXMgPSBudWxsO1xuXG4gIHRoaXMuc2V0UGFnZUljb24gPSBmdW5jdGlvbihzRGF0YVVSTCkge1xuXG4gICAgaWYgKCFzZWxmLmNvbmZpZy51c2VGYXZJY29uIHx8ICFzZWxmLmNvbmZpZy51c2VQZWFrRGF0YSB8fCAhc0RhdGFVUkwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbTItZmF2aWNvbicpO1xuICAgIGlmIChsaW5rKSB7XG4gICAgICBfaGVhZC5yZW1vdmVDaGlsZChsaW5rKTtcbiAgICAgIGxpbmsgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoIWxpbmspIHtcbiAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICBsaW5rLmlkID0gJ3NtMi1mYXZpY29uJztcbiAgICAgIGxpbmsucmVsID0gJ3Nob3J0Y3V0IGljb24nO1xuICAgICAgbGluay50eXBlID0gJ2ltYWdlL3BuZyc7XG4gICAgICBsaW5rLmhyZWYgPSBzRGF0YVVSTDtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQobGluayk7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5yZXNldFBhZ2VJY29uID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoIXNlbGYuY29uZmlnLnVzZUZhdkljb24pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGxpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmF2aWNvbicpO1xuICAgIGlmIChsaW5rKSB7XG4gICAgICBsaW5rLmhyZWYgPSAnL2Zhdmljb24uaWNvJztcbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLnVwZGF0ZVZVID0gZnVuY3Rpb24ob1NvdW5kKSB7XG5cbiAgICBpZiAoc291bmRNYW5hZ2VyLmZsYXNoVmVyc2lvbiA+PSA5ICYmIHNlbGYuY29uZmlnLnVzZUZhdkljb24gJiYgc2VsZi5jb25maWcudXNlUGVha0RhdGEpIHtcbiAgICAgIG1lLnNldFBhZ2VJY29uKG1lLnZ1TWV0ZXJEYXRhW3BhcnNlSW50KDE2Km9Tb3VuZC5wZWFrRGF0YS5sZWZ0LCAxMCldW3BhcnNlSW50KDE2Km9Tb3VuZC5wZWFrRGF0YS5yaWdodCwgMTApXSk7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5jcmVhdGVWVURhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBpPTAsIGo9MCxcbiAgICAgICAgY2FudmFzID0gbWUudnVEYXRhQ2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICAgIHZ1R3JhZCA9IGNhbnZhcy5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAxNiwgMCwgMCksXG4gICAgICAgIGJnR3JhZCA9IGNhbnZhcy5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAxNiwgMCwgMCksXG4gICAgICAgIG91dGxpbmUgPSAncmdiYSgwLDAsMCwwLjIpJztcblxuICAgIHZ1R3JhZC5hZGRDb2xvclN0b3AoMCwncmdiKDAsMTkyLDApJyk7XG4gICAgdnVHcmFkLmFkZENvbG9yU3RvcCgwLjMwLCdyZ2IoMCwyNTUsMCknKTtcbiAgICB2dUdyYWQuYWRkQ29sb3JTdG9wKDAuNjI1LCdyZ2IoMjU1LDI1NSwwKScpO1xuICAgIHZ1R3JhZC5hZGRDb2xvclN0b3AoMC44NSwncmdiKDI1NSwwLDApJyk7XG4gICAgYmdHcmFkLmFkZENvbG9yU3RvcCgwLG91dGxpbmUpO1xuICAgIGJnR3JhZC5hZGRDb2xvclN0b3AoMSwncmdiYSgwLDAsMCwwLjUpJyk7XG4gICAgZm9yIChpPTA7IGk8MTY7IGkrKykge1xuICAgICAgbWUudnVNZXRlckRhdGFbaV0gPSBbXTtcbiAgICB9XG4gICAgZm9yIChpPTA7IGk8MTY7IGkrKykge1xuICAgICAgZm9yIChqPTA7IGo8MTY7IGorKykge1xuICAgICAgICAvLyByZXNldC9lcmFzZSBjYW52YXNcbiAgICAgICAgbWUudnVEYXRhQ2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLDE2KTtcbiAgICAgICAgbWUudnVEYXRhQ2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywxNik7XG4gICAgICAgIC8vIGRyYXcgbmV3IHN0dWZmc1xuICAgICAgICBjYW52YXMuZmlsbFN0eWxlID0gYmdHcmFkO1xuICAgICAgICBjYW52YXMuZmlsbFJlY3QoMCwwLDcsMTUpO1xuICAgICAgICBjYW52YXMuZmlsbFJlY3QoOCwwLDcsMTUpO1xuICAgICAgICAvKlxuICAgICAgICAvLyBzaGFkb3dcbiAgICAgICAgY2FudmFzLmZpbGxTdHlsZSA9ICdyZ2JhKDAsMCwwLDAuMSknO1xuICAgICAgICBjYW52YXMuZmlsbFJlY3QoMSwxNS1pLDcsMTctKDE3LWkpKTtcbiAgICAgICAgY2FudmFzLmZpbGxSZWN0KDksMTUtaiw3LDE3LSgxNy1qKSk7XG4gICAgICAgICovXG4gICAgICAgIGNhbnZhcy5maWxsU3R5bGUgPSB2dUdyYWQ7XG4gICAgICAgIGNhbnZhcy5maWxsUmVjdCgwLDE1LWksNywxNi0oMTYtaSkpO1xuICAgICAgICBjYW52YXMuZmlsbFJlY3QoOCwxNS1qLDcsMTYtKDE2LWopKTtcbiAgICAgICAgLy8gYW5kIG5vdywgY2xlYXIgb3V0IHNvbWUgYml0cy5cbiAgICAgICAgY2FudmFzLmNsZWFyUmVjdCgwLDMsMTYsMSk7XG4gICAgICAgIGNhbnZhcy5jbGVhclJlY3QoMCw3LDE2LDEpO1xuICAgICAgICBjYW52YXMuY2xlYXJSZWN0KDAsMTEsMTYsMSk7XG4gICAgICAgIG1lLnZ1TWV0ZXJEYXRhW2ldW2pdID0gbWUudnVEYXRhQ2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XG4gICAgICAgIC8vIGZvciBkZWJ1Z2dpbmcgVlUgaW1hZ2VzXG4gICAgICAgIC8qXG4gICAgICAgIHZhciBvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICAgIG8uc3R5bGUubWFyZ2luUmlnaHQgPSAnNXB4JztcbiAgICAgICAgby5zcmMgPSB2dU1ldGVyRGF0YVtpXVtqXTtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKG8pO1xuICAgICAgICAqL1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIHRoaXMudGVzdENhbnZhcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gY2FudmFzICsgdG9EYXRhVVJMKCk7XG4gICAgdmFyIGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICAgICAgY3R4ID0gbnVsbCwgb2s7XG4gICAgaWYgKCFjIHx8IHR5cGVvZiBjLmdldENvbnRleHQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY3R4ID0gYy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGlmICghY3R4IHx8IHR5cGVvZiBjLnRvRGF0YVVSTCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIGp1c3QgaW4gY2FzZS4uXG4gICAgdHJ5IHtcbiAgICAgIG9rID0gYy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgLy8gbm8gY2FudmFzIG9yIG5vIHRvRGF0YVVSTCgpXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gYXNzdW1lIHdlJ3JlIGFsbCBnb29kLlxuICAgIHJldHVybiBjO1xuXG4gIH07XG5cbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoc2VsZi5jb25maWcudXNlRmF2SWNvbikge1xuICAgICAgbWUudnVEYXRhQ2FudmFzID0gbWUudGVzdENhbnZhcygpO1xuICAgICAgaWYgKG1lLnZ1RGF0YUNhbnZhcyAmJiAoaXNGaXJlZm94IHx8IGlzT3BlcmEpKSB7XG4gICAgICAgIC8vIHRoZXNlIGJyb3dzZXJzIHN1cHBvcnQgZHluYW1pY2FsbHktdXBkYXRpbmcgdGhlIGZhdmljb25cbiAgICAgICAgbWUuY3JlYXRlVlVEYXRhKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBkb2luZyB0aGlzXG4gICAgICAgIHNlbGYuY29uZmlnLnVzZUZhdkljb24gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLmluaXQoKTtcblxufTtcblxuLy8gY29tcGxldGVseSBvcHRpb25hbDogTWV0YWRhdGEvYW5ub3RhdGlvbnMvc2VnbWVudHMgY29kZVxuXG5UaHJlZVNpeHR5UGxheWVyLnByb3RvdHlwZS5NZXRhZGF0YSA9IGZ1bmN0aW9uKG9Tb3VuZCwgb1BhcmVudCkge1xuXG4gIHNvdW5kTWFuYWdlci5fd0QoJ01ldGFkYXRhKCknKTtcblxuICB2YXIgbWUgPSB0aGlzLFxuICAgICAgb0JveCA9IG9Tb3VuZC5fMzYwZGF0YS5vVUkzNjAsXG4gICAgICBvID0gb0JveC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndWwnKVswXSxcbiAgICAgIG9JdGVtcyA9IG8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJyksXG4gICAgICBpc0ZpcmVmb3ggPSAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvZmlyZWZveC9pKSksXG4gICAgICBpc0FsdCA9IGZhbHNlLCBpLCBvRHVyYXRpb247XG5cbiAgdGhpcy5sYXN0V1BFeGVjID0gMDtcbiAgdGhpcy5yZWZyZXNoSW50ZXJ2YWwgPSAyNTA7XG4gIHRoaXMudG90YWxUaW1lID0gMDtcblxuICB0aGlzLmV2ZW50cyA9IHtcblxuICAgIHdoaWxlcGxheWluZzogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciB3aWR0aCA9IG9Tb3VuZC5fMzYwZGF0YS53aWR0aCxcbiAgICAgICAgICByYWRpdXMgPSBvU291bmQuXzM2MGRhdGEucmFkaXVzLFxuICAgICAgICAgIGZ1bGxEdXJhdGlvbiA9IChvU291bmQuZHVyYXRpb25Fc3RpbWF0ZXx8KG1lLnRvdGFsVGltZSoxMDAwKSksXG4gICAgICAgICAgaXNBbHQgPSBudWxsLCBpLCBqLCBkO1xuXG4gICAgICBmb3IgKGk9MCxqPW1lLmRhdGEubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgICBpc0FsdCA9IChpJTI9PT0wKTtcbiAgICAgICAgb1BhcmVudC5kcmF3U29saWRBcmMob1NvdW5kLl8zNjBkYXRhLm9DYW52YXMsKGlzQWx0P29QYXJlbnQuY29uZmlnLnNlZ21lbnRSaW5nQ29sb3JBbHQ6b1BhcmVudC5jb25maWcuc2VnbWVudFJpbmdDb2xvciksaXNBbHQ/d2lkdGg6d2lkdGgsIGlzQWx0P3JhZGl1cy8yOnJhZGl1cy8yLCBvUGFyZW50LmRlZzJyYWQoMzYwKihtZS5kYXRhW2ldLmVuZFRpbWVNUy9mdWxsRHVyYXRpb24pKSwgb1BhcmVudC5kZWcycmFkKDM2MCooKG1lLmRhdGFbaV0uc3RhcnRUaW1lTVN8fDEpL2Z1bGxEdXJhdGlvbikpLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGQgPSBuZXcgRGF0ZSgpO1xuICAgICAgaWYgKGQtbWUubGFzdFdQRXhlYz5tZS5yZWZyZXNoSW50ZXJ2YWwpIHtcbiAgICAgICAgbWUucmVmcmVzaCgpO1xuICAgICAgICBtZS5sYXN0V1BFeGVjID0gZDtcbiAgICAgIH1cblxuICAgIH1cblxuICB9O1xuXG4gIHRoaXMucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gRGlzcGxheSBpbmZvIGFzIGFwcHJvcHJpYXRlXG4gICAgdmFyIGksIGosIGluZGV4ID0gbnVsbCxcbiAgICAgICAgbm93ID0gb1NvdW5kLnBvc2l0aW9uLFxuICAgICAgICBtZXRhZGF0YSA9IG9Tb3VuZC5fMzYwZGF0YS5tZXRhZGF0YS5kYXRhO1xuXG4gICAgZm9yIChpPTAsIGo9bWV0YWRhdGEubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgaWYgKG5vdyA+PSBtZXRhZGF0YVtpXS5zdGFydFRpbWVNUyAmJiBub3cgPD0gbWV0YWRhdGFbaV0uZW5kVGltZU1TKSB7XG4gICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpbmRleCAhPT0gbWV0YWRhdGEuY3VycmVudEl0ZW0gJiYgaW5kZXggPCBtZXRhZGF0YS5sZW5ndGgpIHtcbiAgICAgIC8vIHVwZGF0ZVxuICAgICAgb1NvdW5kLl8zNjBkYXRhLm9MaW5rLmlubmVySFRNTCA9IG1ldGFkYXRhLm1haW5UaXRsZSsnIDxzcGFuIGNsYXNzPVwibWV0YWRhdGFcIj48c3BhbiBjbGFzcz1cInNtMl9kaXZpZGVyXCI+IHwgPC9zcGFuPjxzcGFuIGNsYXNzPVwic20yX21ldGFkYXRhXCI+JyttZXRhZGF0YVtpbmRleF0udGl0bGUrJzwvc3Bhbj48L3NwYW4+JztcbiAgICAgIC8vIHNlbGYuc2V0UGFnZVRpdGxlKG1ldGFkYXRhW2luZGV4XS50aXRsZSsnIHwgJyttZXRhZGF0YS5tYWluVGl0bGUpO1xuICAgICAgbWV0YWRhdGEuY3VycmVudEl0ZW0gPSBpbmRleDtcbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLnN0clRvVGltZSA9IGZ1bmN0aW9uKHNUaW1lKSB7XG4gICAgdmFyIHNlZ21lbnRzID0gc1RpbWUuc3BsaXQoJzonKSxcbiAgICAgICAgc2Vjb25kcyA9IDAsIGk7XG4gICAgZm9yIChpPXNlZ21lbnRzLmxlbmd0aDsgaS0tOykge1xuICAgICAgc2Vjb25kcyArPSBwYXJzZUludChzZWdtZW50c1tpXSwgMTApKk1hdGgucG93KDYwLHNlZ21lbnRzLmxlbmd0aC0xLWkpOyAvLyBob3VycywgbWludXRlc1xuICAgIH1cbiAgICByZXR1cm4gc2Vjb25kcztcbiAgfTtcblxuICB0aGlzLmRhdGEgPSBbXTtcbiAgdGhpcy5kYXRhLmdpdmVuRHVyYXRpb24gPSBudWxsO1xuICB0aGlzLmRhdGEuY3VycmVudEl0ZW0gPSBudWxsO1xuICB0aGlzLmRhdGEubWFpblRpdGxlID0gb1NvdW5kLl8zNjBkYXRhLm9MaW5rLmlubmVySFRNTDtcblxuICBmb3IgKGk9MDsgaTxvSXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLmRhdGFbaV0gPSB7XG4gICAgICBvOiBudWxsLFxuICAgICAgdGl0bGU6IG9JdGVtc1tpXS5nZXRFbGVtZW50c0J5VGFnTmFtZSgncCcpWzBdLmlubmVySFRNTCxcbiAgICAgIHN0YXJ0VGltZTogb0l0ZW1zW2ldLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzcGFuJylbMF0uaW5uZXJIVE1MLFxuICAgICAgc3RhcnRTZWNvbmRzOiBtZS5zdHJUb1RpbWUob0l0ZW1zW2ldLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzcGFuJylbMF0uaW5uZXJIVE1MLnJlcGxhY2UoL1soKV0vZywnJykpLFxuICAgICAgZHVyYXRpb246IDAsXG4gICAgICBkdXJhdGlvbk1TOiBudWxsLFxuICAgICAgc3RhcnRUaW1lTVM6IG51bGwsXG4gICAgICBlbmRUaW1lTVM6IG51bGwsXG4gICAgICBvTm90ZTogbnVsbFxuICAgIH07XG4gIH1cbiAgb0R1cmF0aW9uID0gb1BhcmVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdkdXJhdGlvbicsJ2Rpdicsb0JveCk7XG4gIHRoaXMuZGF0YS5naXZlbkR1cmF0aW9uID0gKG9EdXJhdGlvbi5sZW5ndGg/bWUuc3RyVG9UaW1lKG9EdXJhdGlvblswXS5pbm5lckhUTUwpKjEwMDA6MCk7XG4gIGZvciAoaT0wOyBpPHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMuZGF0YVtpXS5kdXJhdGlvbiA9IHBhcnNlSW50KHRoaXMuZGF0YVtpKzFdP3RoaXMuZGF0YVtpKzFdLnN0YXJ0U2Vjb25kczoobWUuZGF0YS5naXZlbkR1cmF0aW9uP21lLmRhdGEuZ2l2ZW5EdXJhdGlvbjpvU291bmQuZHVyYXRpb25Fc3RpbWF0ZSkvMTAwMCwgMTApLXRoaXMuZGF0YVtpXS5zdGFydFNlY29uZHM7XG4gICAgdGhpcy5kYXRhW2ldLnN0YXJ0VGltZU1TID0gdGhpcy5kYXRhW2ldLnN0YXJ0U2Vjb25kcyoxMDAwO1xuICAgIHRoaXMuZGF0YVtpXS5kdXJhdGlvbk1TID0gdGhpcy5kYXRhW2ldLmR1cmF0aW9uKjEwMDA7XG4gICAgdGhpcy5kYXRhW2ldLmVuZFRpbWVNUyA9IHRoaXMuZGF0YVtpXS5zdGFydFRpbWVNUyt0aGlzLmRhdGFbaV0uZHVyYXRpb25NUztcbiAgICB0aGlzLnRvdGFsVGltZSArPSB0aGlzLmRhdGFbaV0uZHVyYXRpb247XG4gIH1cblxufTtcblxuaWYgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL3dlYmtpdC9pKSAmJiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9tb2JpbGUvaSkpIHtcbiAgLy8gaVBhZCwgaVBob25lIGV0Yy5cbiAgc291bmRNYW5hZ2VyLnVzZUhUTUw1QXVkaW8gPSB0cnVlO1xufVxuXG5zb3VuZE1hbmFnZXIuZGVidWdNb2RlID0gZmFsc2U7Ly8gKHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9kZWJ1Zz0xL2kpKTsgLy8gZGlzYWJsZSBvciBlbmFibGUgZGVidWcgb3V0cHV0XG5zb3VuZE1hbmFnZXIuY29uc29sZU9ubHkgPSB0cnVlO1xuc291bmRNYW5hZ2VyLmZsYXNoVmVyc2lvbiA9IDk7XG5zb3VuZE1hbmFnZXIudXNlSGlnaFBlcmZvcm1hbmNlID0gdHJ1ZTtcbnNvdW5kTWFuYWdlci51c2VGbGFzaEJsb2NrID0gdHJ1ZTtcbnNvdW5kTWFuYWdlci5mbGFzaExvYWRUaW1lb3V0ID0gMDtcblxuLy8gc291bmRNYW5hZ2VyLnVzZUZhc3RQb2xsaW5nID0gdHJ1ZTsgLy8gZm9yIG1vcmUgYWdncmVzc2l2ZSwgZmFzdGVyIFVJIHVwZGF0ZXMgKGhpZ2hlciBDUFUgdXNlKVxuXG4vLyBGUFMgZGF0YSwgdGVzdGluZy9kZWJ1ZyBvbmx5XG5pZiAoc291bmRNYW5hZ2VyLmRlYnVnTW9kZSkge1xuICB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHAgPSB3aW5kb3cudGhyZWVTaXh0eVBsYXllcjtcbiAgICBpZiAocCAmJiBwLmxhc3RTb3VuZCAmJiBwLmxhc3RTb3VuZC5fMzYwZGF0YS5mcHMgJiYgdHlwZW9mIHdpbmRvdy5pc0hvbWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBzb3VuZE1hbmFnZXIuX3dyaXRlRGVidWcoJ2ZwczogficrcC5sYXN0U291bmQuXzM2MGRhdGEuZnBzKTtcbiAgICAgIHAubGFzdFNvdW5kLl8zNjBkYXRhLmZwcyA9IDA7XG4gICAgfVxuICB9LDEwMDApO1xufVxuXG4vLyBTTTJfREVGRVIgZGV0YWlsczogaHR0cDovL3d3dy5zY2hpbGxtYW5pYS5jb20vcHJvamVjdHMvc291bmRtYW5hZ2VyMi9kb2MvZ2V0c3RhcnRlZC8jbGF6eS1sb2FkaW5nXG5cbmlmICh3aW5kb3cuU00yX0RFRkVSID09PSBfdW5kZWZpbmVkIHx8ICFTTTJfREVGRVIpIHtcbiAgdGhyZWVTaXh0eVBsYXllciA9IG5ldyBUaHJlZVNpeHR5UGxheWVyKCk7XG59XG5cbi8qKlxuICogU291bmRNYW5hZ2VyIHB1YmxpYyBpbnRlcmZhY2VzXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblxuICAvKipcbiAgICogY29tbW9uSlMgbW9kdWxlXG4gICAqL1xuXG4gIG1vZHVsZS5leHBvcnRzLlRocmVlU2l4dHlQbGF5ZXIgPSBUaHJlZVNpeHR5UGxheWVyO1xuICBtb2R1bGUuZXhwb3J0cy50aHJlZVNpeHR5UGxheWVyID0gdGhyZWVTaXh0eVBsYXllcjtcblxufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblxuICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgdGhlIGdsb2JhbCBpbnN0YW5jZSBvZiBTb3VuZE1hbmFnZXIuXG4gICAgICogSWYgYSBnbG9iYWwgaW5zdGFuY2UgZG9lcyBub3QgZXhpc3QgaXQgY2FuIGJlIGNyZWF0ZWQgdXNpbmcgYSBjYWxsYmFjay5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHNtQnVpbGRlciBPcHRpb25hbDogQ2FsbGJhY2sgdXNlZCB0byBjcmVhdGUgYSBuZXcgU291bmRNYW5hZ2VyIGluc3RhbmNlXG4gICAgICogQHJldHVybiB7U291bmRNYW5hZ2VyfSBUaGUgZ2xvYmFsIFNvdW5kTWFuYWdlciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldEluc3RhbmNlKHNtQnVpbGRlcikge1xuICAgICAgaWYgKCF3aW5kb3cudGhyZWVTaXh0eVBsYXllciAmJiBzbUJ1aWxkZXIgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBzbUJ1aWxkZXIoVGhyZWVTaXh0eVBsYXllcik7XG4gICAgICAgIGlmIChpbnN0YW5jZSBpbnN0YW5jZW9mIFRocmVlU2l4dHlQbGF5ZXIpIHtcbiAgICAgICAgICB3aW5kb3cudGhyZWVTaXh0eVBsYXllciA9IGluc3RhbmNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gd2luZG93LnRocmVlU2l4dHlQbGF5ZXI7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBjb25zdHJ1Y3RvcjogVGhyZWVTaXh0eVBsYXllcixcbiAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxuICAgIH1cbiAgfSk7XG5cbn1cblxuLy8gc3RhbmRhcmQgYnJvd3NlciBjYXNlXG5cbi8vIGNvbnN0cnVjdG9yXG53aW5kb3cuVGhyZWVTaXh0eVBsYXllciA9IFRocmVlU2l4dHlQbGF5ZXI7XG5cbi8qKlxuICogbm90ZTogU00yIHJlcXVpcmVzIGEgd2luZG93IGdsb2JhbCBkdWUgdG8gRmxhc2gsIHdoaWNoIG1ha2VzIGNhbGxzIHRvIHdpbmRvdy5zb3VuZE1hbmFnZXIuXG4gKiBGbGFzaCBtYXkgbm90IGFsd2F5cyBiZSBuZWVkZWQsIGJ1dCB0aGlzIGlzIG5vdCBrbm93biB1bnRpbCBhc3luYyBpbml0IGFuZCBTTTIgbWF5IGV2ZW4gXCJyZWJvb3RcIiBpbnRvIEZsYXNoIG1vZGUuXG4gKi9cblxuLy8gcHVibGljIEFQSSwgZmxhc2ggY2FsbGJhY2tzIGV0Yy5cbndpbmRvdy50aHJlZVNpeHR5UGxheWVyID0gdGhyZWVTaXh0eVBsYXllcjtcblxufSh3aW5kb3cpKTtcbiIsIi8qKiBAbGljZW5zZVxyXG4gKlxyXG4gKiBTb3VuZE1hbmFnZXIgMjogSmF2YVNjcmlwdCBTb3VuZCBmb3IgdGhlIFdlYlxyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqIGh0dHA6Ly9zY2hpbGxtYW5pYS5jb20vcHJvamVjdHMvc291bmRtYW5hZ2VyMi9cclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDA3LCBTY290dCBTY2hpbGxlci4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICogQ29kZSBwcm92aWRlZCB1bmRlciB0aGUgQlNEIExpY2Vuc2U6XHJcbiAqIGh0dHA6Ly9zY2hpbGxtYW5pYS5jb20vcHJvamVjdHMvc291bmRtYW5hZ2VyMi9saWNlbnNlLnR4dFxyXG4gKlxyXG4gKiBWMi45N2EuMjAxNTA2MDFcclxuICovXHJcblxyXG4vKmdsb2JhbCB3aW5kb3csIFNNMl9ERUZFUiwgc20yRGVidWdnZXIsIGNvbnNvbGUsIGRvY3VtZW50LCBuYXZpZ2F0b3IsIHNldFRpbWVvdXQsIHNldEludGVydmFsLCBjbGVhckludGVydmFsLCBBdWRpbywgb3BlcmEsIG1vZHVsZSwgZGVmaW5lICovXHJcbi8qanNsaW50IHJlZ2V4cDogdHJ1ZSwgc2xvcHB5OiB0cnVlLCB3aGl0ZTogdHJ1ZSwgbm9tZW46IHRydWUsIHBsdXNwbHVzOiB0cnVlLCB0b2RvOiB0cnVlICovXHJcblxyXG4vKipcclxuICogQWJvdXQgdGhpcyBmaWxlXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogVGhpcyBpcyB0aGUgZnVsbHktY29tbWVudGVkIHNvdXJjZSB2ZXJzaW9uIG9mIHRoZSBTb3VuZE1hbmFnZXIgMiBBUEksXHJcbiAqIHJlY29tbWVuZGVkIGZvciB1c2UgZHVyaW5nIGRldmVsb3BtZW50IGFuZCB0ZXN0aW5nLlxyXG4gKlxyXG4gKiBTZWUgc291bmRtYW5hZ2VyMi1ub2RlYnVnLWpzbWluLmpzIGZvciBhbiBvcHRpbWl6ZWQgYnVpbGQgKH4xMUtCIHdpdGggZ3ppcC4pXHJcbiAqIGh0dHA6Ly9zY2hpbGxtYW5pYS5jb20vcHJvamVjdHMvc291bmRtYW5hZ2VyMi9kb2MvZ2V0c3RhcnRlZC8jYmFzaWMtaW5jbHVzaW9uXHJcbiAqIEFsdGVybmF0ZWx5LCBzZXJ2ZSB0aGlzIGZpbGUgd2l0aCBnemlwIGZvciA3NSUgY29tcHJlc3Npb24gc2F2aW5ncyAofjMwS0Igb3ZlciBIVFRQLilcclxuICpcclxuICogWW91IG1heSBub3RpY2UgPGQ+IGFuZCA8L2Q+IGNvbW1lbnRzIGluIHRoaXMgc291cmNlOyB0aGVzZSBhcmUgZGVsaW1pdGVycyBmb3JcclxuICogZGVidWcgYmxvY2tzIHdoaWNoIGFyZSByZW1vdmVkIGluIHRoZSAtbm9kZWJ1ZyBidWlsZHMsIGZ1cnRoZXIgb3B0aW1pemluZyBjb2RlIHNpemUuXHJcbiAqXHJcbiAqIEFsc28sIGFzIHlvdSBtYXkgbm90ZTogV2hvYSwgcmVsaWFibGUgY3Jvc3MtcGxhdGZvcm0vZGV2aWNlIGF1ZGlvIHN1cHBvcnQgaXMgaGFyZCEgOylcclxuICovXHJcblxyXG4oZnVuY3Rpb24od2luZG93LCBfdW5kZWZpbmVkKSB7XHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmlmICghd2luZG93IHx8ICF3aW5kb3cuZG9jdW1lbnQpIHtcclxuXHJcbiAgLy8gRG9uJ3QgY3Jvc3MgdGhlIFtlbnZpcm9ubWVudF0gc3RyZWFtcy4gU00yIGV4cGVjdHMgdG8gYmUgcnVubmluZyBpbiBhIGJyb3dzZXIsIG5vdCB1bmRlciBub2RlLmpzIGV0Yy5cclxuICAvLyBBZGRpdGlvbmFsbHksIGlmIGEgYnJvd3NlciBzb21laG93IG1hbmFnZXMgdG8gZmFpbCB0aGlzIHRlc3QsIGFzIEVnb24gc2FpZDogXCJJdCB3b3VsZCBiZSBiYWQuXCJcclxuXHJcbiAgdGhyb3cgbmV3IEVycm9yKCdTb3VuZE1hbmFnZXIgcmVxdWlyZXMgYSBicm93c2VyIHdpdGggd2luZG93IGFuZCBkb2N1bWVudCBvYmplY3RzLicpO1xyXG5cclxufVxyXG5cclxudmFyIHNvdW5kTWFuYWdlciA9IG51bGw7XHJcblxyXG4vKipcclxuICogVGhlIFNvdW5kTWFuYWdlciBjb25zdHJ1Y3Rvci5cclxuICpcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzbVVSTCBPcHRpb25hbDogUGF0aCB0byBTV0YgZmlsZXNcclxuICogQHBhcmFtIHtzdHJpbmd9IHNtSUQgT3B0aW9uYWw6IFRoZSBJRCB0byB1c2UgZm9yIHRoZSBTV0YgY29udGFpbmVyIGVsZW1lbnRcclxuICogQHRoaXMge1NvdW5kTWFuYWdlcn1cclxuICogQHJldHVybiB7U291bmRNYW5hZ2VyfSBUaGUgbmV3IFNvdW5kTWFuYWdlciBpbnN0YW5jZVxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIFNvdW5kTWFuYWdlcihzbVVSTCwgc21JRCkge1xyXG5cclxuICAvKipcclxuICAgKiBzb3VuZE1hbmFnZXIgY29uZmlndXJhdGlvbiBvcHRpb25zIGxpc3RcclxuICAgKiBkZWZpbmVzIHRvcC1sZXZlbCBjb25maWd1cmF0aW9uIHByb3BlcnRpZXMgdG8gYmUgYXBwbGllZCB0byB0aGUgc291bmRNYW5hZ2VyIGluc3RhbmNlIChlZy4gc291bmRNYW5hZ2VyLmZsYXNoVmVyc2lvbilcclxuICAgKiB0byBzZXQgdGhlc2UgcHJvcGVydGllcywgdXNlIHRoZSBzZXR1cCgpIG1ldGhvZCAtIGVnLiwgc291bmRNYW5hZ2VyLnNldHVwKHt1cmw6ICcvc3dmLycsIGZsYXNoVmVyc2lvbjogOX0pXHJcbiAgICovXHJcblxyXG4gIHRoaXMuc2V0dXBPcHRpb25zID0ge1xyXG5cclxuICAgICd1cmwnOiAoc21VUkwgfHwgbnVsbCksICAgICAgICAgICAgIC8vIHBhdGggKGRpcmVjdG9yeSkgd2hlcmUgU291bmRNYW5hZ2VyIDIgU1dGcyBleGlzdCwgZWcuLCAvcGF0aC90by9zd2ZzL1xyXG4gICAgJ2ZsYXNoVmVyc2lvbic6IDgsICAgICAgICAgICAgICAgICAgLy8gZmxhc2ggYnVpbGQgdG8gdXNlICg4IG9yIDkuKSBTb21lIEFQSSBmZWF0dXJlcyByZXF1aXJlIDkuXHJcbiAgICAnZGVidWdNb2RlJzogdHJ1ZSwgICAgICAgICAgICAgICAgICAvLyBlbmFibGUgZGVidWdnaW5nIG91dHB1dCAoY29uc29sZS5sb2coKSB3aXRoIEhUTUwgZmFsbGJhY2spXHJcbiAgICAnZGVidWdGbGFzaCc6IGZhbHNlLCAgICAgICAgICAgICAgICAvLyBlbmFibGUgZGVidWdnaW5nIG91dHB1dCBpbnNpZGUgU1dGLCB0cm91Ymxlc2hvb3QgRmxhc2gvYnJvd3NlciBpc3N1ZXNcclxuICAgICd1c2VDb25zb2xlJzogdHJ1ZSwgICAgICAgICAgICAgICAgIC8vIHVzZSBjb25zb2xlLmxvZygpIGlmIGF2YWlsYWJsZSAob3RoZXJ3aXNlLCB3cml0ZXMgdG8gI3NvdW5kbWFuYWdlci1kZWJ1ZyBlbGVtZW50KVxyXG4gICAgJ2NvbnNvbGVPbmx5JzogdHJ1ZSwgICAgICAgICAgICAgICAgLy8gaWYgY29uc29sZSBpcyBiZWluZyB1c2VkLCBkbyBub3QgY3JlYXRlL3dyaXRlIHRvICNzb3VuZG1hbmFnZXItZGVidWdcclxuICAgICd3YWl0Rm9yV2luZG93TG9hZCc6IGZhbHNlLCAgICAgICAgIC8vIGZvcmNlIFNNMiB0byB3YWl0IGZvciB3aW5kb3cub25sb2FkKCkgYmVmb3JlIHRyeWluZyB0byBjYWxsIHNvdW5kTWFuYWdlci5vbmxvYWQoKVxyXG4gICAgJ2JnQ29sb3InOiAnI2ZmZmZmZicsICAgICAgICAgICAgICAgLy8gU1dGIGJhY2tncm91bmQgY29sb3IuIE4vQSB3aGVuIHdtb2RlID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgJ3VzZUhpZ2hQZXJmb3JtYW5jZSc6IGZhbHNlLCAgICAgICAgLy8gcG9zaXRpb246Zml4ZWQgZmxhc2ggbW92aWUgY2FuIGhlbHAgaW5jcmVhc2UganMvZmxhc2ggc3BlZWQsIG1pbmltaXplIGxhZ1xyXG4gICAgJ2ZsYXNoUG9sbGluZ0ludGVydmFsJzogbnVsbCwgICAgICAgLy8gbXNlYyBhZmZlY3Rpbmcgd2hpbGVwbGF5aW5nL2xvYWRpbmcgY2FsbGJhY2sgZnJlcXVlbmN5LiBJZiBudWxsLCBkZWZhdWx0IG9mIDUwIG1zZWMgaXMgdXNlZC5cclxuICAgICdodG1sNVBvbGxpbmdJbnRlcnZhbCc6IG51bGwsICAgICAgIC8vIG1zZWMgYWZmZWN0aW5nIHdoaWxlcGxheWluZygpIGZvciBIVE1MNSBhdWRpbywgZXhjbHVkaW5nIG1vYmlsZSBkZXZpY2VzLiBJZiBudWxsLCBuYXRpdmUgSFRNTDUgdXBkYXRlIGV2ZW50cyBhcmUgdXNlZC5cclxuICAgICdmbGFzaExvYWRUaW1lb3V0JzogMTAwMCwgICAgICAgICAgIC8vIG1zZWMgdG8gd2FpdCBmb3IgZmxhc2ggbW92aWUgdG8gbG9hZCBiZWZvcmUgZmFpbGluZyAoMCA9IGluZmluaXR5KVxyXG4gICAgJ3dtb2RlJzogbnVsbCwgICAgICAgICAgICAgICAgICAgICAgLy8gZmxhc2ggcmVuZGVyaW5nIG1vZGUgLSBudWxsLCAndHJhbnNwYXJlbnQnLCBvciAnb3BhcXVlJyAobGFzdCB0d28gYWxsb3cgei1pbmRleCB0byB3b3JrKVxyXG4gICAgJ2FsbG93U2NyaXB0QWNjZXNzJzogJ2Fsd2F5cycsICAgICAgLy8gZm9yIHNjcmlwdGluZyB0aGUgU1dGIChvYmplY3QvZW1iZWQgcHJvcGVydHkpLCAnYWx3YXlzJyBvciAnc2FtZURvbWFpbidcclxuICAgICd1c2VGbGFzaEJsb2NrJzogZmFsc2UsICAgICAgICAgICAgIC8vICpyZXF1aXJlcyBmbGFzaGJsb2NrLmNzcywgc2VlIGRlbW9zKiAtIGFsbG93IHJlY292ZXJ5IGZyb20gZmxhc2ggYmxvY2tlcnMuIFdhaXQgaW5kZWZpbml0ZWx5IGFuZCBhcHBseSB0aW1lb3V0IENTUyB0byBTV0YsIGlmIGFwcGxpY2FibGUuXHJcbiAgICAndXNlSFRNTDVBdWRpbyc6IHRydWUsICAgICAgICAgICAgICAvLyB1c2UgSFRNTDUgQXVkaW8oKSB3aGVyZSBBUEkgaXMgc3VwcG9ydGVkIChtb3N0IFNhZmFyaSwgQ2hyb21lIHZlcnNpb25zKSwgRmlyZWZveCAoTVAzL01QNCBzdXBwb3J0IHZhcmllcy4pIElkZWFsbHksIHRyYW5zcGFyZW50IHZzLiBGbGFzaCBBUEkgd2hlcmUgcG9zc2libGUuXHJcbiAgICAnZm9yY2VVc2VHbG9iYWxIVE1MNUF1ZGlvJzogZmFsc2UsICAvLyBpZiB0cnVlLCBhIHNpbmdsZSBBdWRpbygpIG9iamVjdCBpcyB1c2VkIGZvciBhbGwgc291bmRzIC0gYW5kIG9ubHkgb25lIGNhbiBwbGF5IGF0IGEgdGltZS5cclxuICAgICdpZ25vcmVNb2JpbGVSZXN0cmljdGlvbnMnOiBmYWxzZSwgIC8vIGlmIHRydWUsIFNNMiB3aWxsIG5vdCBhcHBseSBnbG9iYWwgSFRNTDUgYXVkaW8gcnVsZXMgdG8gbW9iaWxlIFVBcy4gaU9TID4gNyBhbmQgV2ViVmlld3MgbWF5IGFsbG93IG11bHRpcGxlIEF1ZGlvKCkgaW5zdGFuY2VzLlxyXG4gICAgJ2h0bWw1VGVzdCc6IC9eKHByb2JhYmx5fG1heWJlKSQvaSwgLy8gSFRNTDUgQXVkaW8oKSBmb3JtYXQgc3VwcG9ydCB0ZXN0LiBVc2UgL15wcm9iYWJseSQvaTsgaWYgeW91IHdhbnQgdG8gYmUgbW9yZSBjb25zZXJ2YXRpdmUuXHJcbiAgICAncHJlZmVyRmxhc2gnOiBmYWxzZSwgICAgICAgICAgICAgICAvLyBvdmVycmlkZXMgdXNlSFRNTDVhdWRpbywgd2lsbCB1c2UgRmxhc2ggZm9yIE1QMy9NUDQvQUFDIGlmIHByZXNlbnQuIFBvdGVudGlhbCBvcHRpb24gaWYgSFRNTDUgcGxheWJhY2sgd2l0aCB0aGVzZSBmb3JtYXRzIGlzIHF1aXJreS5cclxuICAgICdub1NXRkNhY2hlJzogZmFsc2UsICAgICAgICAgICAgICAgIC8vIGlmIHRydWUsIGFwcGVuZHMgP3RzPXtkYXRlfSB0byBicmVhayBhZ2dyZXNzaXZlIFNXRiBjYWNoaW5nLlxyXG4gICAgJ2lkUHJlZml4JzogJ3NvdW5kJyAgICAgICAgICAgICAgICAgLy8gaWYgYW4gaWQgaXMgbm90IHByb3ZpZGVkIHRvIGNyZWF0ZVNvdW5kKCksIHRoaXMgcHJlZml4IGlzIHVzZWQgZm9yIGdlbmVyYXRlZCBJRHMgLSAnc291bmQwJywgJ3NvdW5kMScgZXRjLlxyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLmRlZmF1bHRPcHRpb25zID0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiBmb3Igc291bmQgb2JqZWN0cyBtYWRlIHdpdGggY3JlYXRlU291bmQoKSBhbmQgcmVsYXRlZCBtZXRob2RzXHJcbiAgICAgKiBlZy4sIHZvbHVtZSwgYXV0by1sb2FkIGJlaGF2aW91ciBhbmQgc28gZm9ydGhcclxuICAgICAqL1xyXG5cclxuICAgICdhdXRvTG9hZCc6IGZhbHNlLCAgICAgICAgLy8gZW5hYmxlIGF1dG9tYXRpYyBsb2FkaW5nIChvdGhlcndpc2UgLmxvYWQoKSB3aWxsIGJlIGNhbGxlZCBvbiBkZW1hbmQgd2l0aCAucGxheSgpLCB0aGUgbGF0dGVyIGJlaW5nIG5pY2VyIG9uIGJhbmR3aWR0aCAtIGlmIHlvdSB3YW50IHRvIC5sb2FkIHlvdXJzZWxmLCB5b3UgYWxzbyBjYW4pXHJcbiAgICAnYXV0b1BsYXknOiBmYWxzZSwgICAgICAgIC8vIGVuYWJsZSBwbGF5aW5nIG9mIGZpbGUgYXMgc29vbiBhcyBwb3NzaWJsZSAobXVjaCBmYXN0ZXIgaWYgXCJzdHJlYW1cIiBpcyB0cnVlKVxyXG4gICAgJ2Zyb20nOiBudWxsLCAgICAgICAgICAgICAvLyBwb3NpdGlvbiB0byBzdGFydCBwbGF5YmFjayB3aXRoaW4gYSBzb3VuZCAobXNlYyksIGRlZmF1bHQgPSBiZWdpbm5pbmdcclxuICAgICdsb29wcyc6IDEsICAgICAgICAgICAgICAgLy8gaG93IG1hbnkgdGltZXMgdG8gcmVwZWF0IHRoZSBzb3VuZCAocG9zaXRpb24gd2lsbCB3cmFwIGFyb3VuZCB0byAwLCBzZXRQb3NpdGlvbigpIHdpbGwgYnJlYWsgb3V0IG9mIGxvb3Agd2hlbiA+MClcclxuICAgICdvbmlkMyc6IG51bGwsICAgICAgICAgICAgLy8gY2FsbGJhY2sgZnVuY3Rpb24gZm9yIFwiSUQzIGRhdGEgaXMgYWRkZWQvYXZhaWxhYmxlXCJcclxuICAgICdvbmxvYWQnOiBudWxsLCAgICAgICAgICAgLy8gY2FsbGJhY2sgZnVuY3Rpb24gZm9yIFwibG9hZCBmaW5pc2hlZFwiXHJcbiAgICAnd2hpbGVsb2FkaW5nJzogbnVsbCwgICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBcImRvd25sb2FkIHByb2dyZXNzIHVwZGF0ZVwiIChYIG9mIFkgYnl0ZXMgcmVjZWl2ZWQpXHJcbiAgICAnb25wbGF5JzogbnVsbCwgICAgICAgICAgIC8vIGNhbGxiYWNrIGZvciBcInBsYXlcIiBzdGFydFxyXG4gICAgJ29ucGF1c2UnOiBudWxsLCAgICAgICAgICAvLyBjYWxsYmFjayBmb3IgXCJwYXVzZVwiXHJcbiAgICAnb25yZXN1bWUnOiBudWxsLCAgICAgICAgIC8vIGNhbGxiYWNrIGZvciBcInJlc3VtZVwiIChwYXVzZSB0b2dnbGUpXHJcbiAgICAnd2hpbGVwbGF5aW5nJzogbnVsbCwgICAgIC8vIGNhbGxiYWNrIGR1cmluZyBwbGF5IChwb3NpdGlvbiB1cGRhdGUpXHJcbiAgICAnb25wb3NpdGlvbic6IG51bGwsICAgICAgIC8vIG9iamVjdCBjb250YWluaW5nIHRpbWVzIGFuZCBmdW5jdGlvbiBjYWxsYmFja3MgZm9yIHBvc2l0aW9ucyBvZiBpbnRlcmVzdFxyXG4gICAgJ29uc3RvcCc6IG51bGwsICAgICAgICAgICAvLyBjYWxsYmFjayBmb3IgXCJ1c2VyIHN0b3BcIlxyXG4gICAgJ29uZmFpbHVyZSc6IG51bGwsICAgICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbiBmb3Igd2hlbiBwbGF5aW5nIGZhaWxzXHJcbiAgICAnb25maW5pc2gnOiBudWxsLCAgICAgICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBcInNvdW5kIGZpbmlzaGVkIHBsYXlpbmdcIlxyXG4gICAgJ211bHRpU2hvdCc6IHRydWUsICAgICAgICAvLyBsZXQgc291bmRzIFwicmVzdGFydFwiIG9yIGxheWVyIG9uIHRvcCBvZiBlYWNoIG90aGVyIHdoZW4gcGxheWVkIG11bHRpcGxlIHRpbWVzLCByYXRoZXIgdGhhbiBvbmUtc2hvdC9vbmUgYXQgYSB0aW1lXHJcbiAgICAnbXVsdGlTaG90RXZlbnRzJzogZmFsc2UsIC8vIGZpcmUgbXVsdGlwbGUgc291bmQgZXZlbnRzIChjdXJyZW50bHkgb25maW5pc2goKSBvbmx5KSB3aGVuIG11bHRpU2hvdCBpcyBlbmFibGVkXHJcbiAgICAncG9zaXRpb24nOiBudWxsLCAgICAgICAgIC8vIG9mZnNldCAobWlsbGlzZWNvbmRzKSB0byBzZWVrIHRvIHdpdGhpbiBsb2FkZWQgc291bmQgZGF0YS5cclxuICAgICdwYW4nOiAwLCAgICAgICAgICAgICAgICAgLy8gXCJwYW5cIiBzZXR0aW5ncywgbGVmdC10by1yaWdodCwgLTEwMCB0byAxMDBcclxuICAgICdzdHJlYW0nOiB0cnVlLCAgICAgICAgICAgLy8gYWxsb3dzIHBsYXlpbmcgYmVmb3JlIGVudGlyZSBmaWxlIGhhcyBsb2FkZWQgKHJlY29tbWVuZGVkKVxyXG4gICAgJ3RvJzogbnVsbCwgICAgICAgICAgICAgICAvLyBwb3NpdGlvbiB0byBlbmQgcGxheWJhY2sgd2l0aGluIGEgc291bmQgKG1zZWMpLCBkZWZhdWx0ID0gZW5kXHJcbiAgICAndHlwZSc6IG51bGwsICAgICAgICAgICAgIC8vIE1JTUUtbGlrZSBoaW50IGZvciBmaWxlIHBhdHRlcm4gLyBjYW5QbGF5KCkgdGVzdHMsIGVnLiBhdWRpby9tcDNcclxuICAgICd1c2VQb2xpY3lGaWxlJzogZmFsc2UsICAgLy8gZW5hYmxlIGNyb3NzZG9tYWluLnhtbCByZXF1ZXN0IGZvciBhdWRpbyBvbiByZW1vdGUgZG9tYWlucyAoZm9yIElEMy93YXZlZm9ybSBhY2Nlc3MpXHJcbiAgICAndm9sdW1lJzogMTAwICAgICAgICAgICAgIC8vIHNlbGYtZXhwbGFuYXRvcnkuIDAtMTAwLCB0aGUgbGF0dGVyIGJlaW5nIHRoZSBtYXguXHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMuZmxhc2g5T3B0aW9ucyA9IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGZsYXNoIDktb25seSBvcHRpb25zLFxyXG4gICAgICogbWVyZ2VkIGludG8gZGVmYXVsdE9wdGlvbnMgaWYgZmxhc2ggOSBpcyBiZWluZyB1c2VkXHJcbiAgICAgKi9cclxuXHJcbiAgICAnaXNNb3ZpZVN0YXInOiBudWxsLCAgICAgIC8vIFwiTW92aWVTdGFyXCIgTVBFRzQgYXVkaW8gbW9kZS4gTnVsbCAoZGVmYXVsdCkgPSBhdXRvIGRldGVjdCBNUDQsIEFBQyBldGMuIGJhc2VkIG9uIFVSTC4gdHJ1ZSA9IGZvcmNlIG9uLCBpZ25vcmUgVVJMXHJcbiAgICAndXNlUGVha0RhdGEnOiBmYWxzZSwgICAgIC8vIGVuYWJsZSBsZWZ0L3JpZ2h0IGNoYW5uZWwgcGVhayAobGV2ZWwpIGRhdGFcclxuICAgICd1c2VXYXZlZm9ybURhdGEnOiBmYWxzZSwgLy8gZW5hYmxlIHNvdW5kIHNwZWN0cnVtIChyYXcgd2F2ZWZvcm0gZGF0YSkgLSBOT1RFOiBNYXkgaW5jcmVhc2UgQ1BVIGxvYWQuXHJcbiAgICAndXNlRVFEYXRhJzogZmFsc2UsICAgICAgIC8vIGVuYWJsZSBzb3VuZCBFUSAoZnJlcXVlbmN5IHNwZWN0cnVtIGRhdGEpIC0gTk9URTogTWF5IGluY3JlYXNlIENQVSBsb2FkLlxyXG4gICAgJ29uYnVmZmVyY2hhbmdlJzogbnVsbCwgICAvLyBjYWxsYmFjayBmb3IgXCJpc0J1ZmZlcmluZ1wiIHByb3BlcnR5IGNoYW5nZVxyXG4gICAgJ29uZGF0YWVycm9yJzogbnVsbCAgICAgICAvLyBjYWxsYmFjayBmb3Igd2F2ZWZvcm0vZXEgZGF0YSBhY2Nlc3MgZXJyb3IgKGZsYXNoIHBsYXlpbmcgYXVkaW8gaW4gb3RoZXIgdGFicy9kb21haW5zKVxyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLm1vdmllU3Rhck9wdGlvbnMgPSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmbGFzaCA5LjByMTE1KyBNUEVHNCBhdWRpbyBvcHRpb25zLFxyXG4gICAgICogbWVyZ2VkIGludG8gZGVmYXVsdE9wdGlvbnMgaWYgZmxhc2ggOSttb3ZpZVN0YXIgbW9kZSBpcyBlbmFibGVkXHJcbiAgICAgKi9cclxuXHJcbiAgICAnYnVmZmVyVGltZSc6IDMsICAgICAgICAgIC8vIHNlY29uZHMgb2YgZGF0YSB0byBidWZmZXIgYmVmb3JlIHBsYXliYWNrIGJlZ2lucyAobnVsbCA9IGZsYXNoIGRlZmF1bHQgb2YgMC4xIHNlY29uZHMgLSBpZiBBQUMgcGxheWJhY2sgaXMgZ2FwcHksIHRyeSBpbmNyZWFzaW5nLilcclxuICAgICdzZXJ2ZXJVUkwnOiBudWxsLCAgICAgICAgLy8gcnRtcDogRk1TIG9yIEZNSVMgc2VydmVyIHRvIGNvbm5lY3QgdG8sIHJlcXVpcmVkIHdoZW4gcmVxdWVzdGluZyBtZWRpYSB2aWEgUlRNUCBvciBvbmUgb2YgaXRzIHZhcmlhbnRzXHJcbiAgICAnb25jb25uZWN0JzogbnVsbCwgICAgICAgIC8vIHJ0bXA6IGNhbGxiYWNrIGZvciBjb25uZWN0aW9uIHRvIGZsYXNoIG1lZGlhIHNlcnZlclxyXG4gICAgJ2R1cmF0aW9uJzogbnVsbCAgICAgICAgICAvLyBydG1wOiBzb25nIGR1cmF0aW9uIChtc2VjKVxyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLmF1ZGlvRm9ybWF0cyA9IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGRldGVybWluZXMgSFRNTDUgc3VwcG9ydCArIGZsYXNoIHJlcXVpcmVtZW50cy5cclxuICAgICAqIGlmIG5vIHN1cHBvcnQgKHZpYSBmbGFzaCBhbmQvb3IgSFRNTDUpIGZvciBhIFwicmVxdWlyZWRcIiBmb3JtYXQsIFNNMiB3aWxsIGZhaWwgdG8gc3RhcnQuXHJcbiAgICAgKiBmbGFzaCBmYWxsYmFjayBpcyB1c2VkIGZvciBNUDMgb3IgTVA0IGlmIEhUTUw1IGNhbid0IHBsYXkgaXQgKG9yIGlmIHByZWZlckZsYXNoID0gdHJ1ZSlcclxuICAgICAqL1xyXG5cclxuICAgICdtcDMnOiB7XHJcbiAgICAgICd0eXBlJzogWydhdWRpby9tcGVnOyBjb2RlY3M9XCJtcDNcIicsICdhdWRpby9tcGVnJywgJ2F1ZGlvL21wMycsICdhdWRpby9NUEEnLCAnYXVkaW8vbXBhLXJvYnVzdCddLFxyXG4gICAgICAncmVxdWlyZWQnOiB0cnVlXHJcbiAgICB9LFxyXG5cclxuICAgICdtcDQnOiB7XHJcbiAgICAgICdyZWxhdGVkJzogWydhYWMnLCdtNGEnLCdtNGInXSwgLy8gYWRkaXRpb25hbCBmb3JtYXRzIHVuZGVyIHRoZSBNUDQgY29udGFpbmVyXHJcbiAgICAgICd0eXBlJzogWydhdWRpby9tcDQ7IGNvZGVjcz1cIm1wNGEuNDAuMlwiJywgJ2F1ZGlvL2FhYycsICdhdWRpby94LW00YScsICdhdWRpby9NUDRBLUxBVE0nLCAnYXVkaW8vbXBlZzQtZ2VuZXJpYyddLFxyXG4gICAgICAncmVxdWlyZWQnOiBmYWxzZVxyXG4gICAgfSxcclxuXHJcbiAgICAnb2dnJzoge1xyXG4gICAgICAndHlwZSc6IFsnYXVkaW8vb2dnOyBjb2RlY3M9dm9yYmlzJ10sXHJcbiAgICAgICdyZXF1aXJlZCc6IGZhbHNlXHJcbiAgICB9LFxyXG5cclxuICAgICdvcHVzJzoge1xyXG4gICAgICAndHlwZSc6IFsnYXVkaW8vb2dnOyBjb2RlY3M9b3B1cycsICdhdWRpby9vcHVzJ10sXHJcbiAgICAgICdyZXF1aXJlZCc6IGZhbHNlXHJcbiAgICB9LFxyXG5cclxuICAgICd3YXYnOiB7XHJcbiAgICAgICd0eXBlJzogWydhdWRpby93YXY7IGNvZGVjcz1cIjFcIicsICdhdWRpby93YXYnLCAnYXVkaW8vd2F2ZScsICdhdWRpby94LXdhdiddLFxyXG4gICAgICAncmVxdWlyZWQnOiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICAvLyBIVE1MIGF0dHJpYnV0ZXMgKGlkICsgY2xhc3MgbmFtZXMpIGZvciB0aGUgU1dGIGNvbnRhaW5lclxyXG5cclxuICB0aGlzLm1vdmllSUQgPSAnc20yLWNvbnRhaW5lcic7XHJcbiAgdGhpcy5pZCA9IChzbUlEIHx8ICdzbTJtb3ZpZScpO1xyXG5cclxuICB0aGlzLmRlYnVnSUQgPSAnc291bmRtYW5hZ2VyLWRlYnVnJztcclxuICB0aGlzLmRlYnVnVVJMUGFyYW0gPSAvKFsjPyZdKWRlYnVnPTEvaTtcclxuXHJcbiAgLy8gZHluYW1pYyBhdHRyaWJ1dGVzXHJcblxyXG4gIHRoaXMudmVyc2lvbk51bWJlciA9ICdWMi45N2EuMjAxNTA2MDEnO1xyXG4gIHRoaXMudmVyc2lvbiA9IG51bGw7XHJcbiAgdGhpcy5tb3ZpZVVSTCA9IG51bGw7XHJcbiAgdGhpcy5hbHRVUkwgPSBudWxsO1xyXG4gIHRoaXMuc3dmTG9hZGVkID0gZmFsc2U7XHJcbiAgdGhpcy5lbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5vTUMgPSBudWxsO1xyXG4gIHRoaXMuc291bmRzID0ge307XHJcbiAgdGhpcy5zb3VuZElEcyA9IFtdO1xyXG4gIHRoaXMubXV0ZWQgPSBmYWxzZTtcclxuICB0aGlzLmRpZEZsYXNoQmxvY2sgPSBmYWxzZTtcclxuICB0aGlzLmZpbGVQYXR0ZXJuID0gbnVsbDtcclxuXHJcbiAgdGhpcy5maWxlUGF0dGVybnMgPSB7XHJcbiAgICAnZmxhc2g4JzogL1xcLm1wMyhcXD8uKik/JC9pLFxyXG4gICAgJ2ZsYXNoOSc6IC9cXC5tcDMoXFw/LiopPyQvaVxyXG4gIH07XHJcblxyXG4gIC8vIHN1cHBvcnQgaW5kaWNhdG9ycywgc2V0IGF0IGluaXRcclxuXHJcbiAgdGhpcy5mZWF0dXJlcyA9IHtcclxuICAgICdidWZmZXJpbmcnOiBmYWxzZSxcclxuICAgICdwZWFrRGF0YSc6IGZhbHNlLFxyXG4gICAgJ3dhdmVmb3JtRGF0YSc6IGZhbHNlLFxyXG4gICAgJ2VxRGF0YSc6IGZhbHNlLFxyXG4gICAgJ21vdmllU3Rhcic6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgLy8gZmxhc2ggc2FuZGJveCBpbmZvLCB1c2VkIHByaW1hcmlseSBpbiB0cm91Ymxlc2hvb3RpbmdcclxuXHJcbiAgdGhpcy5zYW5kYm94ID0ge1xyXG4gICAgLy8gPGQ+XHJcbiAgICAndHlwZSc6IG51bGwsXHJcbiAgICAndHlwZXMnOiB7XHJcbiAgICAgICdyZW1vdGUnOiAncmVtb3RlIChkb21haW4tYmFzZWQpIHJ1bGVzJyxcclxuICAgICAgJ2xvY2FsV2l0aEZpbGUnOiAnbG9jYWwgd2l0aCBmaWxlIGFjY2VzcyAobm8gaW50ZXJuZXQgYWNjZXNzKScsXHJcbiAgICAgICdsb2NhbFdpdGhOZXR3b3JrJzogJ2xvY2FsIHdpdGggbmV0d29yayAoaW50ZXJuZXQgYWNjZXNzIG9ubHksIG5vIGxvY2FsIGFjY2VzcyknLFxyXG4gICAgICAnbG9jYWxUcnVzdGVkJzogJ2xvY2FsLCB0cnVzdGVkIChsb2NhbCtpbnRlcm5ldCBhY2Nlc3MpJ1xyXG4gICAgfSxcclxuICAgICdkZXNjcmlwdGlvbic6IG51bGwsXHJcbiAgICAnbm9SZW1vdGUnOiBudWxsLFxyXG4gICAgJ25vTG9jYWwnOiBudWxsXHJcbiAgICAvLyA8L2Q+XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogZm9ybWF0IHN1cHBvcnQgKGh0bWw1L2ZsYXNoKVxyXG4gICAqIHN0b3JlcyBjYW5QbGF5VHlwZSgpIHJlc3VsdHMgYmFzZWQgb24gYXVkaW9Gb3JtYXRzLlxyXG4gICAqIGVnLiB7IG1wMzogYm9vbGVhbiwgbXA0OiBib29sZWFuIH1cclxuICAgKiB0cmVhdCBhcyByZWFkLW9ubHkuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuaHRtbDUgPSB7XHJcbiAgICAndXNpbmdGbGFzaCc6IG51bGwgLy8gc2V0IGlmL3doZW4gZmxhc2ggZmFsbGJhY2sgaXMgbmVlZGVkXHJcbiAgfTtcclxuXHJcbiAgLy8gZmlsZSB0eXBlIHN1cHBvcnQgaGFzaFxyXG4gIHRoaXMuZmxhc2ggPSB7fTtcclxuXHJcbiAgLy8gZGV0ZXJtaW5lZCBhdCBpbml0IHRpbWVcclxuICB0aGlzLmh0bWw1T25seSA9IGZhbHNlO1xyXG5cclxuICAvLyB1c2VkIGZvciBzcGVjaWFsIGNhc2VzIChlZy4gaVBhZC9pUGhvbmUvcGFsbSBPUz8pXHJcbiAgdGhpcy5pZ25vcmVGbGFzaCA9IGZhbHNlO1xyXG5cclxuICAvKipcclxuICAgKiBhIGZldyBwcml2YXRlIGludGVybmFscyAoT0ssIGEgbG90LiA6RClcclxuICAgKi9cclxuXHJcbiAgdmFyIFNNU291bmQsXHJcbiAgc20yID0gdGhpcywgZ2xvYmFsSFRNTDVBdWRpbyA9IG51bGwsIGZsYXNoID0gbnVsbCwgc20gPSAnc291bmRNYW5hZ2VyJywgc21jID0gc20gKyAnOiAnLCBoNSA9ICdIVE1MNTo6JywgaWQsIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudCwgd2wgPSB3aW5kb3cubG9jYXRpb24uaHJlZi50b1N0cmluZygpLCBkb2MgPSBkb2N1bWVudCwgZG9Ob3RoaW5nLCBzZXRQcm9wZXJ0aWVzLCBpbml0LCBmViwgb25fcXVldWUgPSBbXSwgZGVidWdPcGVuID0gdHJ1ZSwgZGVidWdUUywgZGlkQXBwZW5kID0gZmFsc2UsIGFwcGVuZFN1Y2Nlc3MgPSBmYWxzZSwgZGlkSW5pdCA9IGZhbHNlLCBkaXNhYmxlZCA9IGZhbHNlLCB3aW5kb3dMb2FkZWQgPSBmYWxzZSwgX3dEUywgd2RDb3VudCA9IDAsIGluaXRDb21wbGV0ZSwgbWl4aW4sIGFzc2lnbiwgZXh0cmFPcHRpb25zLCBhZGRPbkV2ZW50LCBwcm9jZXNzT25FdmVudHMsIGluaXRVc2VyT25sb2FkLCBkZWxheVdhaXRGb3JFSSwgd2FpdEZvckVJLCByZWJvb3RJbnRvSFRNTDUsIHNldFZlcnNpb25JbmZvLCBoYW5kbGVGb2N1cywgc3RyaW5ncywgaW5pdE1vdmllLCBkb21Db250ZW50TG9hZGVkLCB3aW5PbkxvYWQsIGRpZERDTG9hZGVkLCBnZXREb2N1bWVudCwgY3JlYXRlTW92aWUsIGNhdGNoRXJyb3IsIHNldFBvbGxpbmcsIGluaXREZWJ1ZywgZGVidWdMZXZlbHMgPSBbJ2xvZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXSwgZGVmYXVsdEZsYXNoVmVyc2lvbiA9IDgsIGRpc2FibGVPYmplY3QsIGZhaWxTYWZlbHksIG5vcm1hbGl6ZU1vdmllVVJMLCBvUmVtb3ZlZCA9IG51bGwsIG9SZW1vdmVkSFRNTCA9IG51bGwsIHN0ciwgZmxhc2hCbG9ja0hhbmRsZXIsIGdldFNXRkNTUywgc3dmQ1NTLCB0b2dnbGVEZWJ1ZywgbG9vcEZpeCwgcG9saWN5Rml4LCBjb21wbGFpbiwgaWRDaGVjaywgd2FpdGluZ0ZvckVJID0gZmFsc2UsIGluaXRQZW5kaW5nID0gZmFsc2UsIHN0YXJ0VGltZXIsIHN0b3BUaW1lciwgdGltZXJFeGVjdXRlLCBoNVRpbWVyQ291bnQgPSAwLCBoNUludGVydmFsVGltZXIgPSBudWxsLCBwYXJzZVVSTCwgbWVzc2FnZXMgPSBbXSxcclxuICBjYW5JZ25vcmVGbGFzaCwgbmVlZHNGbGFzaCA9IG51bGwsIGZlYXR1cmVDaGVjaywgaHRtbDVPSywgaHRtbDVDYW5QbGF5LCBodG1sNUV4dCwgaHRtbDVVbmxvYWQsIGRvbUNvbnRlbnRMb2FkZWRJRSwgdGVzdEhUTUw1LCBldmVudCwgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UsIHVzZUdsb2JhbEhUTUw1QXVkaW8gPSBmYWxzZSwgbGFzdEdsb2JhbEhUTUw1VVJMLCBoYXNGbGFzaCwgZGV0ZWN0Rmxhc2gsIGJhZFNhZmFyaUZpeCwgaHRtbDVfZXZlbnRzLCBzaG93U3VwcG9ydCwgZmx1c2hNZXNzYWdlcywgd3JhcENhbGxiYWNrLCBpZENvdW50ZXIgPSAwLCBkaWRTZXR1cCwgbXNlY1NjYWxlID0gMTAwMCxcclxuICBpc19pRGV2aWNlID0gdWEubWF0Y2goLyhpcGFkfGlwaG9uZXxpcG9kKS9pKSwgaXNBbmRyb2lkID0gdWEubWF0Y2goL2FuZHJvaWQvaSksIGlzSUUgPSB1YS5tYXRjaCgvbXNpZS9pKSxcclxuICBpc1dlYmtpdCA9IHVhLm1hdGNoKC93ZWJraXQvaSksXHJcbiAgaXNTYWZhcmkgPSAodWEubWF0Y2goL3NhZmFyaS9pKSAmJiAhdWEubWF0Y2goL2Nocm9tZS9pKSksXHJcbiAgaXNPcGVyYSA9ICh1YS5tYXRjaCgvb3BlcmEvaSkpLFxyXG4gIG1vYmlsZUhUTUw1ID0gKHVhLm1hdGNoKC8obW9iaWxlfHByZVxcL3x4b29tKS9pKSB8fCBpc19pRGV2aWNlIHx8IGlzQW5kcm9pZCksXHJcbiAgaXNCYWRTYWZhcmkgPSAoIXdsLm1hdGNoKC91c2VodG1sNWF1ZGlvL2kpICYmICF3bC5tYXRjaCgvc20yXFwtaWdub3JlYmFkdWEvaSkgJiYgaXNTYWZhcmkgJiYgIXVhLm1hdGNoKC9zaWxrL2kpICYmIHVhLm1hdGNoKC9PUyBYIDEwXzZfKFszLTddKS9pKSksIC8vIFNhZmFyaSA0IGFuZCA1IChleGNsdWRpbmcgS2luZGxlIEZpcmUsIFwiU2lsa1wiKSBvY2Nhc2lvbmFsbHkgZmFpbCB0byBsb2FkL3BsYXkgSFRNTDUgYXVkaW8gb24gU25vdyBMZW9wYXJkIDEwLjYuMyB0aHJvdWdoIDEwLjYuNyBkdWUgdG8gYnVnKHMpIGluIFF1aWNrVGltZSBYIGFuZC9vciBvdGhlciB1bmRlcmx5aW5nIGZyYW1ld29ya3MuIDovIENvbmZpcm1lZCBidWcuIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0zMjE1OVxyXG4gIGhhc0NvbnNvbGUgPSAod2luZG93LmNvbnNvbGUgIT09IF91bmRlZmluZWQgJiYgY29uc29sZS5sb2cgIT09IF91bmRlZmluZWQpLFxyXG4gIGlzRm9jdXNlZCA9IChkb2MuaGFzRm9jdXMgIT09IF91bmRlZmluZWQgPyBkb2MuaGFzRm9jdXMoKSA6IG51bGwpLFxyXG4gIHRyeUluaXRPbkZvY3VzID0gKGlzU2FmYXJpICYmIChkb2MuaGFzRm9jdXMgPT09IF91bmRlZmluZWQgfHwgIWRvYy5oYXNGb2N1cygpKSksXHJcbiAgb2tUb0Rpc2FibGUgPSAhdHJ5SW5pdE9uRm9jdXMsXHJcbiAgZmxhc2hNSU1FID0gLyhtcDN8bXA0fG1wYXxtNGF8bTRiKS9pLFxyXG4gIGVtcHR5VVJMID0gJ2Fib3V0OmJsYW5rJywgLy8gc2FmZSBVUkwgdG8gdW5sb2FkLCBvciBsb2FkIG5vdGhpbmcgZnJvbSAoZmxhc2ggOCArIG1vc3QgSFRNTDUgVUFzKVxyXG4gIGVtcHR5V0FWID0gJ2RhdGE6YXVkaW8vd2F2ZTtiYXNlNjQsL1VrbEdSaVlBQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZUUlBQUFELy93PT0nLCAvLyB0aW55IFdBViBmb3IgSFRNTDUgdW5sb2FkaW5nXHJcbiAgb3ZlckhUVFAgPSAoZG9jLmxvY2F0aW9uID8gZG9jLmxvY2F0aW9uLnByb3RvY29sLm1hdGNoKC9odHRwL2kpIDogbnVsbCksXHJcbiAgaHR0cCA9ICghb3ZlckhUVFAgPyAnaHR0cDovJysnLycgOiAnJyksXHJcbiAgLy8gbXAzLCBtcDQsIGFhYyBldGMuXHJcbiAgbmV0U3RyZWFtTWltZVR5cGVzID0gL15cXHMqYXVkaW9cXC8oPzp4LSk/KD86bXBlZzR8YWFjfGZsdnxtb3Z8bXA0fHxtNHZ8bTRhfG00YnxtcDR2fDNncHwzZzIpXFxzKig/OiR8OykvaSxcclxuICAvLyBGbGFzaCB2OS4wcjExNSsgXCJtb3ZpZXN0YXJcIiBmb3JtYXRzXHJcbiAgbmV0U3RyZWFtVHlwZXMgPSBbJ21wZWc0JywgJ2FhYycsICdmbHYnLCAnbW92JywgJ21wNCcsICdtNHYnLCAnZjR2JywgJ200YScsICdtNGInLCAnbXA0dicsICczZ3AnLCAnM2cyJ10sXHJcbiAgbmV0U3RyZWFtUGF0dGVybiA9IG5ldyBSZWdFeHAoJ1xcXFwuKCcgKyBuZXRTdHJlYW1UeXBlcy5qb2luKCd8JykgKyAnKShcXFxcPy4qKT8kJywgJ2knKTtcclxuXHJcbiAgdGhpcy5taW1lUGF0dGVybiA9IC9eXFxzKmF1ZGlvXFwvKD86eC0pPyg/Om1wKD86ZWd8MykpXFxzKig/OiR8OykvaTsgLy8gZGVmYXVsdCBtcDMgc2V0XHJcblxyXG4gIC8vIHVzZSBhbHRVUkwgaWYgbm90IFwib25saW5lXCJcclxuICB0aGlzLnVzZUFsdFVSTCA9ICFvdmVySFRUUDtcclxuXHJcbiAgc3dmQ1NTID0ge1xyXG4gICAgJ3N3ZkJveCc6ICdzbTItb2JqZWN0LWJveCcsXHJcbiAgICAnc3dmRGVmYXVsdCc6ICdtb3ZpZUNvbnRhaW5lcicsXHJcbiAgICAnc3dmRXJyb3InOiAnc3dmX2Vycm9yJywgLy8gU1dGIGxvYWRlZCwgYnV0IFNNMiBjb3VsZG4ndCBzdGFydCAob3RoZXIgZXJyb3IpXHJcbiAgICAnc3dmVGltZWRvdXQnOiAnc3dmX3RpbWVkb3V0JyxcclxuICAgICdzd2ZMb2FkZWQnOiAnc3dmX2xvYWRlZCcsXHJcbiAgICAnc3dmVW5ibG9ja2VkJzogJ3N3Zl91bmJsb2NrZWQnLCAvLyBvciBsb2FkZWQgT0tcclxuICAgICdzbTJEZWJ1Zyc6ICdzbTJfZGVidWcnLFxyXG4gICAgJ2hpZ2hQZXJmJzogJ2hpZ2hfcGVyZm9ybWFuY2UnLFxyXG4gICAgJ2ZsYXNoRGVidWcnOiAnZmxhc2hfZGVidWcnXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogYmFzaWMgSFRNTDUgQXVkaW8oKSBzdXBwb3J0IHRlc3RcclxuICAgKiB0cnkuLi5jYXRjaCBiZWNhdXNlIG9mIElFIDkgXCJub3QgaW1wbGVtZW50ZWRcIiBub25zZW5zZVxyXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Nb2Rlcm5penIvTW9kZXJuaXpyL2lzc3Vlcy8yMjRcclxuICAgKi9cclxuXHJcbiAgdGhpcy5oYXNIVE1MNSA9IChmdW5jdGlvbigpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIG5ldyBBdWRpbyhudWxsKSBmb3Igc3R1cGlkIE9wZXJhIDkuNjQgY2FzZSwgd2hpY2ggdGhyb3dzIG5vdF9lbm91Z2hfYXJndW1lbnRzIGV4Y2VwdGlvbiBvdGhlcndpc2UuXHJcbiAgICAgIHJldHVybiAoQXVkaW8gIT09IF91bmRlZmluZWQgJiYgKGlzT3BlcmEgJiYgb3BlcmEgIT09IF91bmRlZmluZWQgJiYgb3BlcmEudmVyc2lvbigpIDwgMTAgPyBuZXcgQXVkaW8obnVsbCkgOiBuZXcgQXVkaW8oKSkuY2FuUGxheVR5cGUgIT09IF91bmRlZmluZWQpO1xyXG4gICAgfSBjYXRjaChlKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9KCkpO1xyXG5cclxuICAvKipcclxuICAgKiBQdWJsaWMgU291bmRNYW5hZ2VyIEFQSVxyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICovXHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZXMgdG9wLWxldmVsIHNvdW5kTWFuYWdlciBwcm9wZXJ0aWVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgT3B0aW9uIHBhcmFtZXRlcnMsIGVnLiB7IGZsYXNoVmVyc2lvbjogOSwgdXJsOiAnL3BhdGgvdG8vc3dmcy8nIH1cclxuICAgKiBvbnJlYWR5IGFuZCBvbnRpbWVvdXQgYXJlIGFsc28gYWNjZXB0ZWQgcGFyYW1ldGVycy4gY2FsbCBzb3VuZE1hbmFnZXIuc2V0dXAoKSB0byBzZWUgdGhlIGZ1bGwgbGlzdC5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5zZXR1cCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHJcbiAgICB2YXIgbm9VUkwgPSAoIXNtMi51cmwpO1xyXG5cclxuICAgIC8vIHdhcm4gaWYgZmxhc2ggb3B0aW9ucyBoYXZlIGFscmVhZHkgYmVlbiBhcHBsaWVkXHJcblxyXG4gICAgaWYgKG9wdGlvbnMgIT09IF91bmRlZmluZWQgJiYgZGlkSW5pdCAmJiBuZWVkc0ZsYXNoICYmIHNtMi5vaygpICYmIChvcHRpb25zLmZsYXNoVmVyc2lvbiAhPT0gX3VuZGVmaW5lZCB8fCBvcHRpb25zLnVybCAhPT0gX3VuZGVmaW5lZCB8fCBvcHRpb25zLmh0bWw1VGVzdCAhPT0gX3VuZGVmaW5lZCkpIHtcclxuICAgICAgY29tcGxhaW4oc3RyKCdzZXR1cExhdGUnKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogZGVmZXI6IHRydWU/XHJcblxyXG4gICAgYXNzaWduKG9wdGlvbnMpO1xyXG5cclxuICAgIGlmICghdXNlR2xvYmFsSFRNTDVBdWRpbykge1xyXG5cclxuICAgICAgaWYgKG1vYmlsZUhUTUw1KSB7XHJcblxyXG4gICAgICAgIC8vIGZvcmNlIHRoZSBzaW5nbGV0b24gSFRNTDUgcGF0dGVybiBvbiBtb2JpbGUsIGJ5IGRlZmF1bHQuXHJcbiAgICAgICAgaWYgKCFzbTIuc2V0dXBPcHRpb25zLmlnbm9yZU1vYmlsZVJlc3RyaWN0aW9ucyB8fCBzbTIuc2V0dXBPcHRpb25zLmZvcmNlVXNlR2xvYmFsSFRNTDVBdWRpbykge1xyXG4gICAgICAgICAgbWVzc2FnZXMucHVzaChzdHJpbmdzLmdsb2JhbEhUTUw1KTtcclxuICAgICAgICAgIHVzZUdsb2JhbEhUTUw1QXVkaW8gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIG9ubHkgYXBwbHkgc2luZ2xldG9uIEhUTUw1IG9uIGRlc2t0b3AgaWYgZm9yY2VkLlxyXG4gICAgICAgIGlmIChzbTIuc2V0dXBPcHRpb25zLmZvcmNlVXNlR2xvYmFsSFRNTDVBdWRpbykge1xyXG4gICAgICAgICAgbWVzc2FnZXMucHVzaChzdHJpbmdzLmdsb2JhbEhUTUw1KTtcclxuICAgICAgICAgIHVzZUdsb2JhbEhUTUw1QXVkaW8gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFkaWRTZXR1cCAmJiBtb2JpbGVIVE1MNSkge1xyXG5cclxuICAgICAgaWYgKHNtMi5zZXR1cE9wdGlvbnMuaWdub3JlTW9iaWxlUmVzdHJpY3Rpb25zKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbWVzc2FnZXMucHVzaChzdHJpbmdzLmlnbm9yZU1vYmlsZSk7XHJcbiAgICAgIFxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBwcmVmZXIgSFRNTDUgZm9yIG1vYmlsZSArIHRhYmxldC1saWtlIGRldmljZXMsIHByb2JhYmx5IG1vcmUgcmVsaWFibGUgdnMuIGZsYXNoIGF0IHRoaXMgcG9pbnQuXHJcblxyXG4gICAgICAgIC8vIDxkPlxyXG4gICAgICAgIGlmICghc20yLnNldHVwT3B0aW9ucy51c2VIVE1MNUF1ZGlvIHx8IHNtMi5zZXR1cE9wdGlvbnMucHJlZmVyRmxhc2gpIHtcclxuICAgICAgICAgIC8vIG5vdGlmeSB0aGF0IGRlZmF1bHRzIGFyZSBiZWluZyBjaGFuZ2VkLlxyXG4gICAgICAgICAgc20yLl93RChzdHJpbmdzLm1vYmlsZVVBKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgICBzbTIuc2V0dXBPcHRpb25zLnVzZUhUTUw1QXVkaW8gPSB0cnVlO1xyXG4gICAgICAgIHNtMi5zZXR1cE9wdGlvbnMucHJlZmVyRmxhc2ggPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKGlzX2lEZXZpY2UpIHtcclxuXHJcbiAgICAgICAgICAvLyBubyBmbGFzaCBoZXJlLlxyXG4gICAgICAgICAgc20yLmlnbm9yZUZsYXNoID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICgoaXNBbmRyb2lkICYmICF1YS5tYXRjaCgvYW5kcm9pZFxcczJcXC4zL2kpKSB8fCAhaXNBbmRyb2lkKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAvKipcclxuICAgICAgICAgICAqIEFuZHJvaWQgZGV2aWNlcyB0ZW5kIHRvIHdvcmsgYmV0dGVyIHdpdGggYSBzaW5nbGUgYXVkaW8gaW5zdGFuY2UsIHNwZWNpZmljYWxseSBmb3IgY2hhaW5lZCBwbGF5YmFjayBvZiBzb3VuZHMgaW4gc2VxdWVuY2UuXHJcbiAgICAgICAgICAgKiBDb21tb24gdXNlIGNhc2U6IGV4aXRpbmcgc291bmQgb25maW5pc2goKSAtPiBjcmVhdGVTb3VuZCgpIC0+IHBsYXkoKVxyXG4gICAgICAgICAgICogUHJlc3VtaW5nIHNpbWlsYXIgcmVzdHJpY3Rpb25zIGZvciBvdGhlciBtb2JpbGUsIG5vbi1BbmRyb2lkLCBub24taU9TIGRldmljZXMuXHJcbiAgICAgICAgICAgKi9cclxuXHJcbiAgICAgICAgICAvLyA8ZD5cclxuICAgICAgICAgIHNtMi5fd0Qoc3RyaW5ncy5nbG9iYWxIVE1MNSk7XHJcbiAgICAgICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICAgICAgdXNlR2xvYmFsSFRNTDVBdWRpbyA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlIDE6IFwiTGF0ZSBzZXR1cFwiLiBTTTIgbG9hZGVkIG5vcm1hbGx5LCBidXQgdXNlciBkaWRuJ3QgYXNzaWduIGZsYXNoIFVSTCBlZy4sIHNldHVwKHt1cmw6Li4ufSkgYmVmb3JlIFNNMiBpbml0LiBUcmVhdCBhcyBkZWxheWVkIGluaXQuXHJcblxyXG4gICAgaWYgKG9wdGlvbnMpIHtcclxuXHJcbiAgICAgIGlmIChub1VSTCAmJiBkaWREQ0xvYWRlZCAmJiBvcHRpb25zLnVybCAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIHNtMi5iZWdpbkRlbGF5ZWRJbml0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHNwZWNpYWwgY2FzZSAyOiBJZiBsYXp5LWxvYWRpbmcgU00yIChET01Db250ZW50TG9hZGVkIGhhcyBhbHJlYWR5IGhhcHBlbmVkKSBhbmQgdXNlciBjYWxscyBzZXR1cCgpIHdpdGggdXJsOiBwYXJhbWV0ZXIsIHRyeSB0byBpbml0IEFTQVAuXHJcblxyXG4gICAgICBpZiAoIWRpZERDTG9hZGVkICYmIG9wdGlvbnMudXJsICE9PSBfdW5kZWZpbmVkICYmIGRvYy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChkb21Db250ZW50TG9hZGVkLCAxKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBkaWRTZXR1cCA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIHNtMjtcclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5vayA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHJldHVybiAobmVlZHNGbGFzaCA/IChkaWRJbml0ICYmICFkaXNhYmxlZCkgOiAoc20yLnVzZUhUTUw1QXVkaW8gJiYgc20yLmhhc0hUTUw1KSk7XHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMuc3VwcG9ydGVkID0gdGhpcy5vazsgLy8gbGVnYWN5XHJcblxyXG4gIHRoaXMuZ2V0TW92aWUgPSBmdW5jdGlvbihzbUlEKSB7XHJcblxyXG4gICAgLy8gc2FmZXR5IG5ldDogc29tZSBvbGQgYnJvd3NlcnMgZGlmZmVyIG9uIFNXRiByZWZlcmVuY2VzLCBwb3NzaWJseSByZWxhdGVkIHRvIEV4dGVybmFsSW50ZXJmYWNlIC8gZmxhc2ggdmVyc2lvblxyXG4gICAgcmV0dXJuIGlkKHNtSUQpIHx8IGRvY1tzbUlEXSB8fCB3aW5kb3dbc21JRF07XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBTTVNvdW5kIHNvdW5kIG9iamVjdCBpbnN0YW5jZS4gQ2FuIGFsc28gYmUgb3ZlcmxvYWRlZCwgZS5nLiwgY3JlYXRlU291bmQoJ215U291bmQnLCAnL3NvbWUubXAzJyk7XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb09wdGlvbnMgU291bmQgb3B0aW9ucyAoYXQgbWluaW11bSwgdXJsIHBhcmFtZXRlciBpcyByZXF1aXJlZC4pXHJcbiAgICogQHJldHVybiB7b2JqZWN0fSBTTVNvdW5kIFRoZSBuZXcgU01Tb3VuZCBvYmplY3QuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuY3JlYXRlU291bmQgPSBmdW5jdGlvbihvT3B0aW9ucywgX3VybCkge1xyXG5cclxuICAgIHZhciBjcywgY3Nfc3RyaW5nLCBvcHRpb25zLCBvU291bmQgPSBudWxsO1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgY3MgPSBzbSArICcuY3JlYXRlU291bmQoKTogJztcclxuICAgIGNzX3N0cmluZyA9IGNzICsgc3RyKCFkaWRJbml0ID8gJ25vdFJlYWR5JyA6ICdub3RPSycpO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIGlmICghZGlkSW5pdCB8fCAhc20yLm9rKCkpIHtcclxuICAgICAgY29tcGxhaW4oY3Nfc3RyaW5nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChfdXJsICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIC8vIGZ1bmN0aW9uIG92ZXJsb2FkaW5nIGluIEpTISA6KSAuLi4gYXNzdW1lIHNpbXBsZSBjcmVhdGVTb3VuZChpZCwgdXJsKSB1c2UgY2FzZS5cclxuICAgICAgb09wdGlvbnMgPSB7XHJcbiAgICAgICAgJ2lkJzogb09wdGlvbnMsXHJcbiAgICAgICAgJ3VybCc6IF91cmxcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpbmhlcml0IGZyb20gZGVmYXVsdE9wdGlvbnNcclxuICAgIG9wdGlvbnMgPSBtaXhpbihvT3B0aW9ucyk7XHJcblxyXG4gICAgb3B0aW9ucy51cmwgPSBwYXJzZVVSTChvcHRpb25zLnVybCk7XHJcblxyXG4gICAgLy8gZ2VuZXJhdGUgYW4gaWQsIGlmIG5lZWRlZC5cclxuICAgIGlmIChvcHRpb25zLmlkID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIG9wdGlvbnMuaWQgPSBzbTIuc2V0dXBPcHRpb25zLmlkUHJlZml4ICsgKGlkQ291bnRlcisrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmIChvcHRpb25zLmlkLnRvU3RyaW5nKCkuY2hhckF0KDApLm1hdGNoKC9eWzAtOV0kLykpIHtcclxuICAgICAgc20yLl93RChjcyArIHN0cignYmFkSUQnLCBvcHRpb25zLmlkKSwgMik7XHJcbiAgICB9XHJcblxyXG4gICAgc20yLl93RChjcyArIG9wdGlvbnMuaWQgKyAob3B0aW9ucy51cmwgPyAnICgnICsgb3B0aW9ucy51cmwgKyAnKScgOiAnJyksIDEpO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIGlmIChpZENoZWNrKG9wdGlvbnMuaWQsIHRydWUpKSB7XHJcbiAgICAgIHNtMi5fd0QoY3MgKyBvcHRpb25zLmlkICsgJyBleGlzdHMnLCAxKTtcclxuICAgICAgcmV0dXJuIHNtMi5zb3VuZHNbb3B0aW9ucy5pZF07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbWFrZSgpIHtcclxuXHJcbiAgICAgIG9wdGlvbnMgPSBsb29wRml4KG9wdGlvbnMpO1xyXG4gICAgICBzbTIuc291bmRzW29wdGlvbnMuaWRdID0gbmV3IFNNU291bmQob3B0aW9ucyk7XHJcbiAgICAgIHNtMi5zb3VuZElEcy5wdXNoKG9wdGlvbnMuaWQpO1xyXG4gICAgICByZXR1cm4gc20yLnNvdW5kc1tvcHRpb25zLmlkXTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGh0bWw1T0sob3B0aW9ucykpIHtcclxuXHJcbiAgICAgIG9Tb3VuZCA9IG1ha2UoKTtcclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmICghc20yLmh0bWw1T25seSkge1xyXG4gICAgICAgIHNtMi5fd0Qob3B0aW9ucy5pZCArICc6IFVzaW5nIEhUTUw1Jyk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG4gICAgICBvU291bmQuX3NldHVwX2h0bWw1KG9wdGlvbnMpO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG4gICAgICAgIHNtMi5fd0Qob3B0aW9ucy5pZCArICc6IE5vIEhUTUw1IHN1cHBvcnQgZm9yIHRoaXMgc291bmQsIGFuZCBubyBGbGFzaC4gRXhpdGluZy4nKTtcclxuICAgICAgICByZXR1cm4gbWFrZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUT0RPOiBNb3ZlIEhUTUw1L2ZsYXNoIGNoZWNrcyBpbnRvIGdlbmVyaWMgVVJMIHBhcnNpbmcvaGFuZGxpbmcgZnVuY3Rpb24uXHJcblxyXG4gICAgICBpZiAoc20yLmh0bWw1LnVzaW5nRmxhc2ggJiYgb3B0aW9ucy51cmwgJiYgb3B0aW9ucy51cmwubWF0Y2goL2RhdGFcXDovaSkpIHtcclxuICAgICAgICAvLyBkYXRhOiBVUklzIG5vdCBzdXBwb3J0ZWQgYnkgRmxhc2gsIGVpdGhlci5cclxuICAgICAgICBzbTIuX3dEKG9wdGlvbnMuaWQgKyAnOiBkYXRhOiBVUklzIG5vdCBzdXBwb3J0ZWQgdmlhIEZsYXNoLiBFeGl0aW5nLicpO1xyXG4gICAgICAgIHJldHVybiBtYWtlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChmViA+IDgpIHtcclxuICAgICAgICBpZiAob3B0aW9ucy5pc01vdmllU3RhciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgLy8gYXR0ZW1wdCB0byBkZXRlY3QgTVBFRy00IGZvcm1hdHNcclxuICAgICAgICAgIG9wdGlvbnMuaXNNb3ZpZVN0YXIgPSAhIShvcHRpb25zLnNlcnZlclVSTCB8fCAob3B0aW9ucy50eXBlID8gb3B0aW9ucy50eXBlLm1hdGNoKG5ldFN0cmVhbU1pbWVUeXBlcykgOiBmYWxzZSkgfHwgKG9wdGlvbnMudXJsICYmIG9wdGlvbnMudXJsLm1hdGNoKG5ldFN0cmVhbVBhdHRlcm4pKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDxkPlxyXG4gICAgICAgIGlmIChvcHRpb25zLmlzTW92aWVTdGFyKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKGNzICsgJ3VzaW5nIE1vdmllU3RhciBoYW5kbGluZycpO1xyXG4gICAgICAgICAgaWYgKG9wdGlvbnMubG9vcHMgPiAxKSB7XHJcbiAgICAgICAgICAgIF93RFMoJ25vTlNMb29wJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDwvZD5cclxuICAgICAgfVxyXG5cclxuICAgICAgb3B0aW9ucyA9IHBvbGljeUZpeChvcHRpb25zLCBjcyk7XHJcbiAgICAgIG9Tb3VuZCA9IG1ha2UoKTtcclxuXHJcbiAgICAgIGlmIChmViA9PT0gOCkge1xyXG4gICAgICAgIGZsYXNoLl9jcmVhdGVTb3VuZChvcHRpb25zLmlkLCBvcHRpb25zLmxvb3BzIHx8IDEsIG9wdGlvbnMudXNlUG9saWN5RmlsZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZmxhc2guX2NyZWF0ZVNvdW5kKG9wdGlvbnMuaWQsIG9wdGlvbnMudXJsLCBvcHRpb25zLnVzZVBlYWtEYXRhLCBvcHRpb25zLnVzZVdhdmVmb3JtRGF0YSwgb3B0aW9ucy51c2VFUURhdGEsIG9wdGlvbnMuaXNNb3ZpZVN0YXIsIChvcHRpb25zLmlzTW92aWVTdGFyID8gb3B0aW9ucy5idWZmZXJUaW1lIDogZmFsc2UpLCBvcHRpb25zLmxvb3BzIHx8IDEsIG9wdGlvbnMuc2VydmVyVVJMLCBvcHRpb25zLmR1cmF0aW9uIHx8IG51bGwsIG9wdGlvbnMuYXV0b1BsYXksIHRydWUsIG9wdGlvbnMuYXV0b0xvYWQsIG9wdGlvbnMudXNlUG9saWN5RmlsZSk7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLnNlcnZlclVSTCkge1xyXG4gICAgICAgICAgLy8gV2UgYXJlIGNvbm5lY3RlZCBpbW1lZGlhdGVseVxyXG4gICAgICAgICAgb1NvdW5kLmNvbm5lY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICBpZiAob3B0aW9ucy5vbmNvbm5lY3QpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5vbmNvbm5lY3QuYXBwbHkob1NvdW5kKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghb3B0aW9ucy5zZXJ2ZXJVUkwgJiYgKG9wdGlvbnMuYXV0b0xvYWQgfHwgb3B0aW9ucy5hdXRvUGxheSkpIHtcclxuICAgICAgICAvLyBjYWxsIGxvYWQgZm9yIG5vbi1ydG1wIHN0cmVhbXNcclxuICAgICAgICBvU291bmQubG9hZChvcHRpb25zKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBydG1wIHdpbGwgcGxheSBpbiBvbmNvbm5lY3RcclxuICAgIGlmICghb3B0aW9ucy5zZXJ2ZXJVUkwgJiYgb3B0aW9ucy5hdXRvUGxheSkge1xyXG4gICAgICBvU291bmQucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvU291bmQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIERlc3Ryb3lzIGEgU01Tb3VuZCBzb3VuZCBvYmplY3QgaW5zdGFuY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmQgdG8gZGVzdHJveVxyXG4gICAqL1xyXG5cclxuICB0aGlzLmRlc3Ryb3lTb3VuZCA9IGZ1bmN0aW9uKHNJRCwgX2JGcm9tU291bmQpIHtcclxuXHJcbiAgICAvLyBleHBsaWNpdGx5IGRlc3Ryb3kgYSBzb3VuZCBiZWZvcmUgbm9ybWFsIHBhZ2UgdW5sb2FkLCBldGMuXHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBvUyA9IHNtMi5zb3VuZHNbc0lEXSwgaTtcclxuXHJcbiAgICBvUy5zdG9wKCk7XHJcbiAgICBcclxuICAgIC8vIERpc2FibGUgYWxsIGNhbGxiYWNrcyBhZnRlciBzdG9wKCksIHdoZW4gdGhlIHNvdW5kIGlzIGJlaW5nIGRlc3Ryb3llZFxyXG4gICAgb1MuX2lPID0ge307XHJcbiAgICBcclxuICAgIG9TLnVubG9hZCgpO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCBzbTIuc291bmRJRHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHNtMi5zb3VuZElEc1tpXSA9PT0gc0lEKSB7XHJcbiAgICAgICAgc20yLnNvdW5kSURzLnNwbGljZShpLCAxKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghX2JGcm9tU291bmQpIHtcclxuICAgICAgLy8gaWdub3JlIGlmIGJlaW5nIGNhbGxlZCBmcm9tIFNNU291bmQgaW5zdGFuY2VcclxuICAgICAgb1MuZGVzdHJ1Y3QodHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgb1MgPSBudWxsO1xyXG4gICAgZGVsZXRlIHNtMi5zb3VuZHNbc0lEXTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIGxvYWQoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvT3B0aW9ucyBPcHRpb25hbDogU291bmQgb3B0aW9uc1xyXG4gICAqL1xyXG5cclxuICB0aGlzLmxvYWQgPSBmdW5jdGlvbihzSUQsIG9PcHRpb25zKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5sb2FkKG9PcHRpb25zKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHVubG9hZCgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICovXHJcblxyXG4gIHRoaXMudW5sb2FkID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS51bmxvYWQoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIG9uUG9zaXRpb24oKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuUG9zaXRpb24gVGhlIHBvc2l0aW9uIHRvIHdhdGNoIGZvclxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9NZXRob2QgVGhlIHJlbGV2YW50IGNhbGxiYWNrIHRvIGZpcmVcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb1Njb3BlIE9wdGlvbmFsOiBUaGUgc2NvcGUgdG8gYXBwbHkgdGhlIGNhbGxiYWNrIHRvXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMub25Qb3NpdGlvbiA9IGZ1bmN0aW9uKHNJRCwgblBvc2l0aW9uLCBvTWV0aG9kLCBvU2NvcGUpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLm9ucG9zaXRpb24oblBvc2l0aW9uLCBvTWV0aG9kLCBvU2NvcGUpO1xyXG5cclxuICB9O1xyXG5cclxuICAvLyBsZWdhY3kvYmFja3dhcmRzLWNvbXBhYmlsaXR5OiBsb3dlci1jYXNlIG1ldGhvZCBuYW1lXHJcbiAgdGhpcy5vbnBvc2l0aW9uID0gdGhpcy5vblBvc2l0aW9uO1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgY2xlYXJPblBvc2l0aW9uKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gblBvc2l0aW9uIFRoZSBwb3NpdGlvbiB0byB3YXRjaCBmb3JcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvTWV0aG9kIE9wdGlvbmFsOiBUaGUgcmVsZXZhbnQgY2FsbGJhY2sgdG8gZmlyZVxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLmNsZWFyT25Qb3NpdGlvbiA9IGZ1bmN0aW9uKHNJRCwgblBvc2l0aW9uLCBvTWV0aG9kKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5jbGVhck9uUG9zaXRpb24oblBvc2l0aW9uLCBvTWV0aG9kKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHBsYXkoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvT3B0aW9ucyBPcHRpb25hbDogU291bmQgb3B0aW9uc1xyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnBsYXkgPSBmdW5jdGlvbihzSUQsIG9PcHRpb25zKSB7XHJcblxyXG4gICAgdmFyIHJlc3VsdCA9IG51bGwsXHJcbiAgICAgICAgLy8gbGVnYWN5IGZ1bmN0aW9uLW92ZXJsb2FkaW5nIHVzZSBjYXNlOiBwbGF5KCdteVNvdW5kJywgJy9wYXRoL3RvL3NvbWUubXAzJyk7XHJcbiAgICAgICAgb3ZlcmxvYWRlZCA9IChvT3B0aW9ucyAmJiAhKG9PcHRpb25zIGluc3RhbmNlb2YgT2JqZWN0KSk7XHJcblxyXG4gICAgaWYgKCFkaWRJbml0IHx8ICFzbTIub2soKSkge1xyXG4gICAgICBjb21wbGFpbihzbSArICcucGxheSgpOiAnICsgc3RyKCFkaWRJbml0Pydub3RSZWFkeSc6J25vdE9LJykpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCwgb3ZlcmxvYWRlZCkpIHtcclxuXHJcbiAgICAgIGlmICghb3ZlcmxvYWRlZCkge1xyXG4gICAgICAgIC8vIG5vIHNvdW5kIGZvdW5kIGZvciB0aGUgZ2l2ZW4gSUQuIEJhaWwuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAob3ZlcmxvYWRlZCkge1xyXG4gICAgICAgIG9PcHRpb25zID0ge1xyXG4gICAgICAgICAgdXJsOiBvT3B0aW9uc1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChvT3B0aW9ucyAmJiBvT3B0aW9ucy51cmwpIHtcclxuICAgICAgICAvLyBvdmVybG9hZGluZyB1c2UgY2FzZSwgY3JlYXRlK3BsYXk6IC5wbGF5KCdzb21lSUQnLCB7dXJsOicvcGF0aC90by5tcDMnfSk7XHJcbiAgICAgICAgc20yLl93RChzbSArICcucGxheSgpOiBBdHRlbXB0aW5nIHRvIGNyZWF0ZSBcIicgKyBzSUQgKyAnXCInLCAxKTtcclxuICAgICAgICBvT3B0aW9ucy5pZCA9IHNJRDtcclxuICAgICAgICByZXN1bHQgPSBzbTIuY3JlYXRlU291bmQob09wdGlvbnMpLnBsYXkoKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSBpZiAob3ZlcmxvYWRlZCkge1xyXG5cclxuICAgICAgLy8gZXhpc3Rpbmcgc291bmQgb2JqZWN0IGNhc2VcclxuICAgICAgb09wdGlvbnMgPSB7XHJcbiAgICAgICAgdXJsOiBvT3B0aW9uc1xyXG4gICAgICB9O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVzdWx0ID09PSBudWxsKSB7XHJcbiAgICAgIC8vIGRlZmF1bHQgY2FzZVxyXG4gICAgICByZXN1bHQgPSBzbTIuc291bmRzW3NJRF0ucGxheShvT3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLy8ganVzdCBmb3IgY29udmVuaWVuY2VcclxuICB0aGlzLnN0YXJ0ID0gdGhpcy5wbGF5O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgc2V0UG9zaXRpb24oKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuTXNlY09mZnNldCBQb3NpdGlvbiAobWlsbGlzZWNvbmRzKVxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oc0lELCBuTXNlY09mZnNldCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0uc2V0UG9zaXRpb24obk1zZWNPZmZzZXQpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgc3RvcCgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuc3RvcCA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzbTIuX3dEKHNtICsgJy5zdG9wKCcgKyBzSUQgKyAnKScsIDEpO1xyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5zdG9wKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0b3BzIGFsbCBjdXJyZW50bHktcGxheWluZyBzb3VuZHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuc3RvcEFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBvU291bmQ7XHJcbiAgICBzbTIuX3dEKHNtICsgJy5zdG9wQWxsKCknLCAxKTtcclxuXHJcbiAgICBmb3IgKG9Tb3VuZCBpbiBzbTIuc291bmRzKSB7XHJcbiAgICAgIGlmIChzbTIuc291bmRzLmhhc093blByb3BlcnR5KG9Tb3VuZCkpIHtcclxuICAgICAgICAvLyBhcHBseSBvbmx5IHRvIHNvdW5kIG9iamVjdHNcclxuICAgICAgICBzbTIuc291bmRzW29Tb3VuZF0uc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBwYXVzZSgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMucGF1c2UgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnBhdXNlKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFBhdXNlcyBhbGwgY3VycmVudGx5LXBsYXlpbmcgc291bmRzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLnBhdXNlQWxsID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGk7XHJcbiAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLnBhdXNlKCk7XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSByZXN1bWUoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnJlc3VtZSA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0ucmVzdW1lKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3VtZXMgYWxsIGN1cnJlbnRseS1wYXVzZWQgc291bmRzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLnJlc3VtZUFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBpO1xyXG4gICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aC0gMSA7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5yZXN1bWUoKTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHRvZ2dsZVBhdXNlKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy50b2dnbGVQYXVzZSA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0udG9nZ2xlUGF1c2UoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHNldFBhbigpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5QYW4gVGhlIHBhbiB2YWx1ZSAoLTEwMCB0byAxMDApXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuc2V0UGFuID0gZnVuY3Rpb24oc0lELCBuUGFuKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5zZXRQYW4oblBhbik7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBzZXRWb2x1bWUoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRFxyXG4gICAqIE92ZXJsb2FkZWQgY2FzZTogcGFzcyBvbmx5IHZvbHVtZSBhcmd1bWVudCBlZy4sIHNldFZvbHVtZSg1MCkgdG8gYXBwbHkgdG8gYWxsIHNvdW5kcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuVm9sIFRoZSB2b2x1bWUgdmFsdWUgKDAgdG8gMTAwKVxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnNldFZvbHVtZSA9IGZ1bmN0aW9uKHNJRCwgblZvbCkge1xyXG5cclxuICAgIC8vIHNldFZvbHVtZSg1MCkgZnVuY3Rpb24gb3ZlcmxvYWRpbmcgY2FzZSAtIGFwcGx5IHRvIGFsbCBzb3VuZHNcclxuXHJcbiAgICB2YXIgaSwgajtcclxuXHJcbiAgICBpZiAoc0lEICE9PSBfdW5kZWZpbmVkICYmICFpc05hTihzSUQpICYmIG5Wb2wgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgZm9yIChpID0gMCwgaiA9IHNtMi5zb3VuZElEcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0uc2V0Vm9sdW1lKHNJRCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNldFZvbHVtZSgnbXlTb3VuZCcsIDUwKSBjYXNlXHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0uc2V0Vm9sdW1lKG5Wb2wpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgbXV0ZSgpIG1ldGhvZCBvZiBlaXRoZXIgYSBzaW5nbGUgU01Tb3VuZCBvYmplY3QgYnkgSUQsIG9yIGFsbCBzb3VuZCBvYmplY3RzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBPcHRpb25hbDogVGhlIElEIG9mIHRoZSBzb3VuZCAoaWYgb21pdHRlZCwgYWxsIHNvdW5kcyB3aWxsIGJlIHVzZWQuKVxyXG4gICAqL1xyXG5cclxuICB0aGlzLm11dGUgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICB2YXIgaSA9IDA7XHJcblxyXG4gICAgaWYgKHNJRCBpbnN0YW5jZW9mIFN0cmluZykge1xyXG4gICAgICBzSUQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghc0lEKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHNtICsgJy5tdXRlKCk6IE11dGluZyBhbGwgc291bmRzJyk7XHJcbiAgICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5tdXRlKCk7XHJcbiAgICAgIH1cclxuICAgICAgc20yLm11dGVkID0gdHJ1ZTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgc20yLl93RChzbSArICcubXV0ZSgpOiBNdXRpbmcgXCInICsgc0lEICsgJ1wiJyk7XHJcbiAgICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0ubXV0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogTXV0ZXMgYWxsIHNvdW5kcy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5tdXRlQWxsID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgc20yLm11dGUoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHVubXV0ZSgpIG1ldGhvZCBvZiBlaXRoZXIgYSBzaW5nbGUgU01Tb3VuZCBvYmplY3QgYnkgSUQsIG9yIGFsbCBzb3VuZCBvYmplY3RzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBPcHRpb25hbDogVGhlIElEIG9mIHRoZSBzb3VuZCAoaWYgb21pdHRlZCwgYWxsIHNvdW5kcyB3aWxsIGJlIHVzZWQuKVxyXG4gICAqL1xyXG5cclxuICB0aGlzLnVubXV0ZSA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIHZhciBpO1xyXG5cclxuICAgIGlmIChzSUQgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgc0lEID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXNJRCkge1xyXG5cclxuICAgICAgc20yLl93RChzbSArICcudW5tdXRlKCk6IFVubXV0aW5nIGFsbCBzb3VuZHMnKTtcclxuICAgICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLnVubXV0ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIHNtMi5tdXRlZCA9IGZhbHNlO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBzbTIuX3dEKHNtICsgJy51bm11dGUoKTogVW5tdXRpbmcgXCInICsgc0lEICsgJ1wiJyk7XHJcbiAgICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0udW5tdXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBVbm11dGVzIGFsbCBzb3VuZHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMudW5tdXRlQWxsID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgc20yLnVubXV0ZSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgdG9nZ2xlTXV0ZSgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMudG9nZ2xlTXV0ZSA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0udG9nZ2xlTXV0ZSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBSZXRyaWV2ZXMgdGhlIG1lbW9yeSB1c2VkIGJ5IHRoZSBmbGFzaCBwbHVnaW4uXHJcbiAgICpcclxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBhbW91bnQgb2YgbWVtb3J5IGluIHVzZVxyXG4gICAqL1xyXG5cclxuICB0aGlzLmdldE1lbW9yeVVzZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIGZsYXNoLW9ubHlcclxuICAgIHZhciByYW0gPSAwO1xyXG5cclxuICAgIGlmIChmbGFzaCAmJiBmViAhPT0gOCkge1xyXG4gICAgICByYW0gPSBwYXJzZUludChmbGFzaC5fZ2V0TWVtb3J5VXNlKCksIDEwKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmFtO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBVbmRvY3VtZW50ZWQ6IE5PUHMgc291bmRNYW5hZ2VyIGFuZCBhbGwgU01Tb3VuZCBvYmplY3RzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmRpc2FibGUgPSBmdW5jdGlvbihiTm9EaXNhYmxlKSB7XHJcblxyXG4gICAgLy8gZGVzdHJveSBhbGwgZnVuY3Rpb25zXHJcbiAgICB2YXIgaTtcclxuXHJcbiAgICBpZiAoYk5vRGlzYWJsZSA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICBiTm9EaXNhYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRpc2FibGVkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkaXNhYmxlZCA9IHRydWU7XHJcbiAgICBfd0RTKCdzaHV0ZG93bicsIDEpO1xyXG5cclxuICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICBkaXNhYmxlT2JqZWN0KHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmlyZSBcImNvbXBsZXRlXCIsIGRlc3BpdGUgZmFpbFxyXG4gICAgaW5pdENvbXBsZXRlKGJOb0Rpc2FibGUpO1xyXG4gICAgZXZlbnQucmVtb3ZlKHdpbmRvdywgJ2xvYWQnLCBpbml0VXNlck9ubG9hZCk7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgcGxheWFiaWxpdHkgb2YgYSBNSU1FIHR5cGUsIGVnLiAnYXVkaW8vbXAzJy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5jYW5QbGF5TUlNRSA9IGZ1bmN0aW9uKHNNSU1FKSB7XHJcblxyXG4gICAgdmFyIHJlc3VsdDtcclxuXHJcbiAgICBpZiAoc20yLmhhc0hUTUw1KSB7XHJcbiAgICAgIHJlc3VsdCA9IGh0bWw1Q2FuUGxheSh7XHJcbiAgICAgICAgdHlwZTogc01JTUVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyZXN1bHQgJiYgbmVlZHNGbGFzaCkge1xyXG4gICAgICAvLyBpZiBmbGFzaCA5LCB0ZXN0IG5ldFN0cmVhbSAobW92aWVTdGFyKSB0eXBlcyBhcyB3ZWxsLlxyXG4gICAgICByZXN1bHQgPSAoc01JTUUgJiYgc20yLm9rKCkgPyAhISgoZlYgPiA4ID8gc01JTUUubWF0Y2gobmV0U3RyZWFtTWltZVR5cGVzKSA6IG51bGwpIHx8IHNNSU1FLm1hdGNoKHNtMi5taW1lUGF0dGVybikpIDogbnVsbCk7IC8vIFRPRE86IG1ha2UgbGVzcyBcIndlaXJkXCIgKHBlciBKU0xpbnQpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBwbGF5YWJpbGl0eSBvZiBhIFVSTCBiYXNlZCBvbiBhdWRpbyBzdXBwb3J0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNVUkwgVGhlIFVSTCB0byB0ZXN0XHJcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVVJMIHBsYXlhYmlsaXR5XHJcbiAgICovXHJcblxyXG4gIHRoaXMuY2FuUGxheVVSTCA9IGZ1bmN0aW9uKHNVUkwpIHtcclxuXHJcbiAgICB2YXIgcmVzdWx0O1xyXG5cclxuICAgIGlmIChzbTIuaGFzSFRNTDUpIHtcclxuICAgICAgcmVzdWx0ID0gaHRtbDVDYW5QbGF5KHtcclxuICAgICAgICB1cmw6IHNVUkxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyZXN1bHQgJiYgbmVlZHNGbGFzaCkge1xyXG4gICAgICByZXN1bHQgPSAoc1VSTCAmJiBzbTIub2soKSA/ICEhKHNVUkwubWF0Y2goc20yLmZpbGVQYXR0ZXJuKSkgOiBudWxsKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHBsYXlhYmlsaXR5IG9mIGFuIEhUTUwgRE9NICZsdDthJmd0OyBvYmplY3QgKG9yIHNpbWlsYXIgb2JqZWN0IGxpdGVyYWwpIGJhc2VkIG9uIGF1ZGlvIHN1cHBvcnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb0xpbmsgYW4gSFRNTCBET00gJmx0O2EmZ3Q7IG9iamVjdCBvciBvYmplY3QgbGl0ZXJhbCBpbmNsdWRpbmcgaHJlZiBhbmQvb3IgdHlwZSBhdHRyaWJ1dGVzXHJcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVVJMIHBsYXlhYmlsaXR5XHJcbiAgICovXHJcblxyXG4gIHRoaXMuY2FuUGxheUxpbmsgPSBmdW5jdGlvbihvTGluaykge1xyXG5cclxuICAgIGlmIChvTGluay50eXBlICE9PSBfdW5kZWZpbmVkICYmIG9MaW5rLnR5cGUpIHtcclxuICAgICAgaWYgKHNtMi5jYW5QbGF5TUlNRShvTGluay50eXBlKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNtMi5jYW5QbGF5VVJMKG9MaW5rLmhyZWYpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBSZXRyaWV2ZXMgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLmdldFNvdW5kQnlJZCA9IGZ1bmN0aW9uKHNJRCwgX3N1cHByZXNzRGVidWcpIHtcclxuXHJcbiAgICBpZiAoIXNJRCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcmVzdWx0ID0gc20yLnNvdW5kc1tzSURdO1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKCFyZXN1bHQgJiYgIV9zdXBwcmVzc0RlYnVnKSB7XHJcbiAgICAgIHNtMi5fd0Qoc20gKyAnLmdldFNvdW5kQnlJZCgpOiBTb3VuZCBcIicgKyBzSUQgKyAnXCIgbm90IGZvdW5kLicsIDIpO1xyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFF1ZXVlcyBhIGNhbGxiYWNrIGZvciBleGVjdXRpb24gd2hlbiBTb3VuZE1hbmFnZXIgaGFzIHN1Y2Nlc3NmdWxseSBpbml0aWFsaXplZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9NZXRob2QgVGhlIGNhbGxiYWNrIG1ldGhvZCB0byBmaXJlXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9TY29wZSBPcHRpb25hbDogVGhlIHNjb3BlIHRvIGFwcGx5IHRvIHRoZSBjYWxsYmFja1xyXG4gICAqL1xyXG5cclxuICB0aGlzLm9ucmVhZHkgPSBmdW5jdGlvbihvTWV0aG9kLCBvU2NvcGUpIHtcclxuXHJcbiAgICB2YXIgc1R5cGUgPSAnb25yZWFkeScsXHJcbiAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBvTWV0aG9kID09PSAnZnVuY3Rpb24nKSB7XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKGRpZEluaXQpIHtcclxuICAgICAgICBzbTIuX3dEKHN0cigncXVldWUnLCBzVHlwZSkpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIGlmICghb1Njb3BlKSB7XHJcbiAgICAgICAgb1Njb3BlID0gd2luZG93O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhZGRPbkV2ZW50KHNUeXBlLCBvTWV0aG9kLCBvU2NvcGUpO1xyXG4gICAgICBwcm9jZXNzT25FdmVudHMoKTtcclxuXHJcbiAgICAgIHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIHRocm93IHN0cignbmVlZEZ1bmN0aW9uJywgc1R5cGUpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBRdWV1ZXMgYSBjYWxsYmFjayBmb3IgZXhlY3V0aW9uIHdoZW4gU291bmRNYW5hZ2VyIGhhcyBmYWlsZWQgdG8gaW5pdGlhbGl6ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9NZXRob2QgVGhlIGNhbGxiYWNrIG1ldGhvZCB0byBmaXJlXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9TY29wZSBPcHRpb25hbDogVGhlIHNjb3BlIHRvIGFwcGx5IHRvIHRoZSBjYWxsYmFja1xyXG4gICAqL1xyXG5cclxuICB0aGlzLm9udGltZW91dCA9IGZ1bmN0aW9uKG9NZXRob2QsIG9TY29wZSkge1xyXG5cclxuICAgIHZhciBzVHlwZSA9ICdvbnRpbWVvdXQnLFxyXG4gICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICh0eXBlb2Ygb01ldGhvZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmIChkaWRJbml0KSB7XHJcbiAgICAgICAgc20yLl93RChzdHIoJ3F1ZXVlJywgc1R5cGUpKTtcclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICBpZiAoIW9TY29wZSkge1xyXG4gICAgICAgIG9TY29wZSA9IHdpbmRvdztcclxuICAgICAgfVxyXG5cclxuICAgICAgYWRkT25FdmVudChzVHlwZSwgb01ldGhvZCwgb1Njb3BlKTtcclxuICAgICAgcHJvY2Vzc09uRXZlbnRzKHt0eXBlOnNUeXBlfSk7XHJcblxyXG4gICAgICByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICB0aHJvdyBzdHIoJ25lZWRGdW5jdGlvbicsIHNUeXBlKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogV3JpdGVzIGNvbnNvbGUubG9nKCktc3R5bGUgZGVidWcgb3V0cHV0IHRvIGEgY29uc29sZSBvciBpbi1icm93c2VyIGVsZW1lbnQuXHJcbiAgICogQXBwbGllcyB3aGVuIGRlYnVnTW9kZSA9IHRydWVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzVGV4dCBUaGUgY29uc29sZSBtZXNzYWdlXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG5UeXBlIE9wdGlvbmFsIGxvZyBsZXZlbCAobnVtYmVyKSwgb3Igb2JqZWN0LiBOdW1iZXIgY2FzZTogTG9nIHR5cGUvc3R5bGUgd2hlcmUgMCA9ICdpbmZvJywgMSA9ICd3YXJuJywgMiA9ICdlcnJvcicuIE9iamVjdCBjYXNlOiBPYmplY3QgdG8gYmUgZHVtcGVkLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLl93cml0ZURlYnVnID0gZnVuY3Rpb24oc1RleHQsIHNUeXBlT3JPYmplY3QpIHtcclxuXHJcbiAgICAvLyBwc2V1ZG8tcHJpdmF0ZSBjb25zb2xlLmxvZygpLXN0eWxlIG91dHB1dFxyXG4gICAgLy8gPGQ+XHJcblxyXG4gICAgdmFyIHNESUQgPSAnc291bmRtYW5hZ2VyLWRlYnVnJywgbywgb0l0ZW07XHJcblxyXG4gICAgaWYgKCFzbTIuc2V0dXBPcHRpb25zLmRlYnVnTW9kZSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGhhc0NvbnNvbGUgJiYgc20yLnVzZUNvbnNvbGUpIHtcclxuICAgICAgaWYgKHNUeXBlT3JPYmplY3QgJiYgdHlwZW9mIHNUeXBlT3JPYmplY3QgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgLy8gb2JqZWN0IHBhc3NlZDsgZHVtcCB0byBjb25zb2xlLlxyXG4gICAgICAgIGNvbnNvbGUubG9nKHNUZXh0LCBzVHlwZU9yT2JqZWN0KTtcclxuICAgICAgfSBlbHNlIGlmIChkZWJ1Z0xldmVsc1tzVHlwZU9yT2JqZWN0XSAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIGNvbnNvbGVbZGVidWdMZXZlbHNbc1R5cGVPck9iamVjdF1dKHNUZXh0KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhzVGV4dCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNtMi5jb25zb2xlT25seSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbyA9IGlkKHNESUQpO1xyXG5cclxuICAgIGlmICghbykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgb0l0ZW0gPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG4gICAgaWYgKCsrd2RDb3VudCAlIDIgPT09IDApIHtcclxuICAgICAgb0l0ZW0uY2xhc3NOYW1lID0gJ3NtMi1hbHQnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzVHlwZU9yT2JqZWN0ID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIHNUeXBlT3JPYmplY3QgPSAwO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc1R5cGVPck9iamVjdCA9IHBhcnNlSW50KHNUeXBlT3JPYmplY3QsIDEwKTtcclxuICAgIH1cclxuXHJcbiAgICBvSXRlbS5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoc1RleHQpKTtcclxuXHJcbiAgICBpZiAoc1R5cGVPck9iamVjdCkge1xyXG4gICAgICBpZiAoc1R5cGVPck9iamVjdCA+PSAyKSB7XHJcbiAgICAgICAgb0l0ZW0uc3R5bGUuZm9udFdlaWdodCA9ICdib2xkJztcclxuICAgICAgfVxyXG4gICAgICBpZiAoc1R5cGVPck9iamVjdCA9PT0gMykge1xyXG4gICAgICAgIG9JdGVtLnN0eWxlLmNvbG9yID0gJyNmZjMzMzMnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdG9wLXRvLWJvdHRvbVxyXG4gICAgLy8gby5hcHBlbmRDaGlsZChvSXRlbSk7XHJcblxyXG4gICAgLy8gYm90dG9tLXRvLXRvcFxyXG4gICAgby5pbnNlcnRCZWZvcmUob0l0ZW0sIG8uZmlyc3RDaGlsZCk7XHJcblxyXG4gICAgbyA9IG51bGw7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIC8vIDxkPlxyXG4gIC8vIGxhc3QtcmVzb3J0IGRlYnVnZ2luZyBvcHRpb25cclxuICBpZiAod2wuaW5kZXhPZignc20yLWRlYnVnPWFsZXJ0JykgIT09IC0xKSB7XHJcbiAgICB0aGlzLl93cml0ZURlYnVnID0gZnVuY3Rpb24oc1RleHQpIHtcclxuICAgICAgd2luZG93LmFsZXJ0KHNUZXh0KTtcclxuICAgIH07XHJcbiAgfVxyXG4gIC8vIDwvZD5cclxuXHJcbiAgLy8gYWxpYXNcclxuICB0aGlzLl93RCA9IHRoaXMuX3dyaXRlRGVidWc7XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb3ZpZGVzIGRlYnVnIC8gc3RhdGUgaW5mb3JtYXRpb24gb24gYWxsIFNNU291bmQgb2JqZWN0cy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5fZGVidWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIHZhciBpLCBqO1xyXG4gICAgX3dEUygnY3VycmVudE9iaicsIDEpO1xyXG5cclxuICAgIGZvciAoaSA9IDAsIGogPSBzbTIuc291bmRJRHMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5fZGVidWcoKTtcclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdGFydHMgYW5kIHJlLWluaXRpYWxpemVzIHRoZSBTb3VuZE1hbmFnZXIgaW5zdGFuY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHJlc2V0RXZlbnRzIE9wdGlvbmFsOiBXaGVuIHRydWUsIHJlbW92ZXMgYWxsIHJlZ2lzdGVyZWQgb25yZWFkeSBhbmQgb250aW1lb3V0IGV2ZW50IGNhbGxiYWNrcy5cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGV4Y2x1ZGVJbml0IE9wdGlvbnM6IFdoZW4gdHJ1ZSwgZG9lcyBub3QgY2FsbCBiZWdpbkRlbGF5ZWRJbml0KCkgKHdoaWNoIHdvdWxkIHJlc3RhcnQgU00yKS5cclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHNvdW5kTWFuYWdlciBUaGUgc291bmRNYW5hZ2VyIGluc3RhbmNlLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLnJlYm9vdCA9IGZ1bmN0aW9uKHJlc2V0RXZlbnRzLCBleGNsdWRlSW5pdCkge1xyXG5cclxuICAgIC8vIHJlc2V0IHNvbWUgKG9yIGFsbCkgc3RhdGUsIGFuZCByZS1pbml0IHVubGVzcyBvdGhlcndpc2Ugc3BlY2lmaWVkLlxyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKHNtMi5zb3VuZElEcy5sZW5ndGgpIHtcclxuICAgICAgc20yLl93RCgnRGVzdHJveWluZyAnICsgc20yLnNvdW5kSURzLmxlbmd0aCArICcgU01Tb3VuZCBvYmplY3QnICsgKHNtMi5zb3VuZElEcy5sZW5ndGggIT09IDEgPyAncycgOiAnJykgKyAnLi4uJyk7XHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgdmFyIGksIGosIGs7XHJcblxyXG4gICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aC0gMSA7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5kZXN0cnVjdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRyYXNoIHplIGZsYXNoIChyZW1vdmUgZnJvbSB0aGUgRE9NKVxyXG5cclxuICAgIGlmIChmbGFzaCkge1xyXG5cclxuICAgICAgdHJ5IHtcclxuXHJcbiAgICAgICAgaWYgKGlzSUUpIHtcclxuICAgICAgICAgIG9SZW1vdmVkSFRNTCA9IGZsYXNoLmlubmVySFRNTDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG9SZW1vdmVkID0gZmxhc2gucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChmbGFzaCk7XHJcblxyXG4gICAgICB9IGNhdGNoKGUpIHtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGZhaWxlZD8gTWF5IGJlIGR1ZSB0byBmbGFzaCBibG9ja2VycyBzaWxlbnRseSByZW1vdmluZyB0aGUgU1dGIG9iamVjdC9lbWJlZCBub2RlIGZyb20gdGhlIERPTS4gV2FybiBhbmQgY29udGludWUuXHJcblxyXG4gICAgICAgIF93RFMoJ2JhZFJlbW92ZScsIDIpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBhY3R1YWxseSwgZm9yY2UgcmVjcmVhdGUgb2YgbW92aWUuXHJcblxyXG4gICAgb1JlbW92ZWRIVE1MID0gb1JlbW92ZWQgPSBuZWVkc0ZsYXNoID0gZmxhc2ggPSBudWxsO1xyXG5cclxuICAgIHNtMi5lbmFibGVkID0gZGlkRENMb2FkZWQgPSBkaWRJbml0ID0gd2FpdGluZ0ZvckVJID0gaW5pdFBlbmRpbmcgPSBkaWRBcHBlbmQgPSBhcHBlbmRTdWNjZXNzID0gZGlzYWJsZWQgPSB1c2VHbG9iYWxIVE1MNUF1ZGlvID0gc20yLnN3ZkxvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgIHNtMi5zb3VuZElEcyA9IFtdO1xyXG4gICAgc20yLnNvdW5kcyA9IHt9O1xyXG5cclxuICAgIGlkQ291bnRlciA9IDA7XHJcbiAgICBkaWRTZXR1cCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICghcmVzZXRFdmVudHMpIHtcclxuICAgICAgLy8gcmVzZXQgY2FsbGJhY2tzIGZvciBvbnJlYWR5LCBvbnRpbWVvdXQgZXRjLiBzbyB0aGF0IHRoZXkgd2lsbCBmaXJlIGFnYWluIG9uIHJlLWluaXRcclxuICAgICAgZm9yIChpIGluIG9uX3F1ZXVlKSB7XHJcbiAgICAgICAgaWYgKG9uX3F1ZXVlLmhhc093blByb3BlcnR5KGkpKSB7XHJcbiAgICAgICAgICBmb3IgKGogPSAwLCBrID0gb25fcXVldWVbaV0ubGVuZ3RoOyBqIDwgazsgaisrKSB7XHJcbiAgICAgICAgICAgIG9uX3F1ZXVlW2ldW2pdLmZpcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyByZW1vdmUgYWxsIGNhbGxiYWNrcyBlbnRpcmVseVxyXG4gICAgICBvbl9xdWV1ZSA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKCFleGNsdWRlSW5pdCkge1xyXG4gICAgICBzbTIuX3dEKHNtICsgJzogUmVib290aW5nLi4uJyk7XHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgLy8gcmVzZXQgSFRNTDUgYW5kIGZsYXNoIGNhblBsYXkgdGVzdCByZXN1bHRzXHJcblxyXG4gICAgc20yLmh0bWw1ID0ge1xyXG4gICAgICAndXNpbmdGbGFzaCc6IG51bGxcclxuICAgIH07XHJcblxyXG4gICAgc20yLmZsYXNoID0ge307XHJcblxyXG4gICAgLy8gcmVzZXQgZGV2aWNlLXNwZWNpZmljIEhUTUwvZmxhc2ggbW9kZSBzd2l0Y2hlc1xyXG5cclxuICAgIHNtMi5odG1sNU9ubHkgPSBmYWxzZTtcclxuICAgIHNtMi5pZ25vcmVGbGFzaCA9IGZhbHNlO1xyXG5cclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgLy8gYnkgZGVmYXVsdCwgcmUtaW5pdFxyXG5cclxuICAgICAgaWYgKCFleGNsdWRlSW5pdCkge1xyXG4gICAgICAgIHNtMi5iZWdpbkRlbGF5ZWRJbml0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LCAyMCk7XHJcblxyXG4gICAgcmV0dXJuIHNtMjtcclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5yZXNldCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2h1dHMgZG93biBhbmQgcmVzdG9yZXMgdGhlIFNvdW5kTWFuYWdlciBpbnN0YW5jZSB0byBpdHMgb3JpZ2luYWwgbG9hZGVkIHN0YXRlLCB3aXRob3V0IGFuIGV4cGxpY2l0IHJlYm9vdC4gQWxsIG9ucmVhZHkvb250aW1lb3V0IGhhbmRsZXJzIGFyZSByZW1vdmVkLlxyXG4gICAgICogQWZ0ZXIgdGhpcyBjYWxsLCBTTTIgbWF5IGJlIHJlLWluaXRpYWxpemVkIHZpYSBzb3VuZE1hbmFnZXIuYmVnaW5EZWxheWVkSW5pdCgpLlxyXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBzb3VuZE1hbmFnZXIgVGhlIHNvdW5kTWFuYWdlciBpbnN0YW5jZS5cclxuICAgICAqL1xyXG5cclxuICAgIF93RFMoJ3Jlc2V0Jyk7XHJcbiAgICByZXR1cm4gc20yLnJlYm9vdCh0cnVlLCB0cnVlKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogVW5kb2N1bWVudGVkOiBEZXRlcm1pbmVzIHRoZSBTTTIgZmxhc2ggbW92aWUncyBsb2FkIHByb2dyZXNzLlxyXG4gICAqXHJcbiAgICogQHJldHVybiB7bnVtYmVyIG9yIG51bGx9IFBlcmNlbnQgbG9hZGVkLCBvciBpZiBpbnZhbGlkL3Vuc3VwcG9ydGVkLCBudWxsLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmdldE1vdmllUGVyY2VudCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJlc3Rpbmcgc3ludGF4IG5vdGVzLi4uXHJcbiAgICAgKiBGbGFzaC9FeHRlcm5hbEludGVyZmFjZSAoQWN0aXZlWC9OUEFQSSkgYnJpZGdlIG1ldGhvZHMgYXJlIG5vdCB0eXBlb2YgXCJmdW5jdGlvblwiIG5vciBpbnN0YW5jZW9mIEZ1bmN0aW9uLCBidXQgYXJlIHN0aWxsIHZhbGlkLlxyXG4gICAgICogQWRkaXRpb25hbGx5LCBKU0xpbnQgZGlzbGlrZXMgKCdQZXJjZW50TG9hZGVkJyBpbiBmbGFzaCktc3R5bGUgc3ludGF4IGFuZCByZWNvbW1lbmRzIGhhc093blByb3BlcnR5KCksIHdoaWNoIGRvZXMgbm90IHdvcmsgaW4gdGhpcyBjYXNlLlxyXG4gICAgICogRnVydGhlcm1vcmUsIHVzaW5nIChmbGFzaCAmJiBmbGFzaC5QZXJjZW50TG9hZGVkKSBjYXVzZXMgSUUgdG8gdGhyb3cgXCJvYmplY3QgZG9lc24ndCBzdXBwb3J0IHRoaXMgcHJvcGVydHkgb3IgbWV0aG9kXCIuXHJcbiAgICAgKiBUaHVzLCAnaW4nIHN5bnRheCBtdXN0IGJlIHVzZWQuXHJcbiAgICAgKi9cclxuXHJcbiAgICByZXR1cm4gKGZsYXNoICYmICdQZXJjZW50TG9hZGVkJyBpbiBmbGFzaCA/IGZsYXNoLlBlcmNlbnRMb2FkZWQoKSA6IG51bGwpOyAvLyBZZXMsIEpTTGludC4gU2VlIG5lYXJieSBjb21tZW50IGluIHNvdXJjZSBmb3IgZXhwbGFuYXRpb24uXHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZGl0aW9uYWwgaGVscGVyIGZvciBtYW51YWxseSBpbnZva2luZyBTTTIncyBpbml0IHByb2Nlc3MgYWZ0ZXIgRE9NIFJlYWR5IC8gd2luZG93Lm9ubG9hZCgpLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmJlZ2luRGVsYXllZEluaXQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB3aW5kb3dMb2FkZWQgPSB0cnVlO1xyXG4gICAgZG9tQ29udGVudExvYWRlZCgpO1xyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBpZiAoaW5pdFBlbmRpbmcpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNyZWF0ZU1vdmllKCk7XHJcbiAgICAgIGluaXRNb3ZpZSgpO1xyXG4gICAgICBpbml0UGVuZGluZyA9IHRydWU7XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9LCAyMCk7XHJcblxyXG4gICAgZGVsYXlXYWl0Rm9yRUkoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGVzdHJveXMgdGhlIFNvdW5kTWFuYWdlciBpbnN0YW5jZSBhbmQgYWxsIFNNU291bmQgaW5zdGFuY2VzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmRlc3RydWN0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgc20yLl93RChzbSArICcuZGVzdHJ1Y3QoKScpO1xyXG4gICAgc20yLmRpc2FibGUodHJ1ZSk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFNNU291bmQoKSAoc291bmQgb2JqZWN0KSBjb25zdHJ1Y3RvclxyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9PcHRpb25zIFNvdW5kIG9wdGlvbnMgKGlkIGFuZCB1cmwgYXJlIHJlcXVpcmVkIGF0dHJpYnV0ZXMpXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIG5ldyBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICBTTVNvdW5kID0gZnVuY3Rpb24ob09wdGlvbnMpIHtcclxuXHJcbiAgICB2YXIgcyA9IHRoaXMsIHJlc2V0UHJvcGVydGllcywgYWRkX2h0bWw1X2V2ZW50cywgcmVtb3ZlX2h0bWw1X2V2ZW50cywgc3RvcF9odG1sNV90aW1lciwgc3RhcnRfaHRtbDVfdGltZXIsIGF0dGFjaE9uUG9zaXRpb24sIG9ucGxheV9jYWxsZWQgPSBmYWxzZSwgb25Qb3NpdGlvbkl0ZW1zID0gW10sIG9uUG9zaXRpb25GaXJlZCA9IDAsIGRldGFjaE9uUG9zaXRpb24sIGFwcGx5RnJvbVRvLCBsYXN0VVJMID0gbnVsbCwgbGFzdEhUTUw1U3RhdGUsIHVybE9taXR0ZWQ7XHJcblxyXG4gICAgbGFzdEhUTUw1U3RhdGUgPSB7XHJcbiAgICAgIC8vIHRyYWNrcyBkdXJhdGlvbiArIHBvc2l0aW9uICh0aW1lKVxyXG4gICAgICBkdXJhdGlvbjogbnVsbCxcclxuICAgICAgdGltZTogbnVsbFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmlkID0gb09wdGlvbnMuaWQ7XHJcblxyXG4gICAgLy8gbGVnYWN5XHJcbiAgICB0aGlzLnNJRCA9IHRoaXMuaWQ7XHJcblxyXG4gICAgdGhpcy51cmwgPSBvT3B0aW9ucy51cmw7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSBtaXhpbihvT3B0aW9ucyk7XHJcblxyXG4gICAgLy8gcGVyLXBsYXktaW5zdGFuY2Utc3BlY2lmaWMgb3B0aW9uc1xyXG4gICAgdGhpcy5pbnN0YW5jZU9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG4gICAgLy8gc2hvcnQgYWxpYXNcclxuICAgIHRoaXMuX2lPID0gdGhpcy5pbnN0YW5jZU9wdGlvbnM7XHJcblxyXG4gICAgLy8gYXNzaWduIHByb3BlcnR5IGRlZmF1bHRzXHJcbiAgICB0aGlzLnBhbiA9IHRoaXMub3B0aW9ucy5wYW47XHJcbiAgICB0aGlzLnZvbHVtZSA9IHRoaXMub3B0aW9ucy52b2x1bWU7XHJcblxyXG4gICAgLy8gd2hldGhlciBvciBub3QgdGhpcyBvYmplY3QgaXMgdXNpbmcgSFRNTDVcclxuICAgIHRoaXMuaXNIVE1MNSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIGludGVybmFsIEhUTUw1IEF1ZGlvKCkgb2JqZWN0IHJlZmVyZW5jZVxyXG4gICAgdGhpcy5fYSA9IG51bGw7XHJcblxyXG4gICAgLy8gZm9yIGZsYXNoIDggc3BlY2lhbC1jYXNlIGNyZWF0ZVNvdW5kKCkgd2l0aG91dCB1cmwsIGZvbGxvd2VkIGJ5IGxvYWQvcGxheSB3aXRoIHVybCBjYXNlXHJcbiAgICB1cmxPbWl0dGVkID0gKHRoaXMudXJsID8gZmFsc2UgOiB0cnVlKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNNU291bmQoKSBwdWJsaWMgbWV0aG9kc1xyXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLmlkMyA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV3JpdGVzIFNNU291bmQgb2JqZWN0IHBhcmFtZXRlcnMgdG8gZGVidWcgY29uc29sZVxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5fZGVidWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBNZXJnZWQgb3B0aW9uczonLCBzLm9wdGlvbnMpO1xyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJlZ2lucyBsb2FkaW5nIGEgc291bmQgcGVyIGl0cyAqdXJsKi5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb09wdGlvbnMgT3B0aW9uYWw6IFNvdW5kIG9wdGlvbnNcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5sb2FkID0gZnVuY3Rpb24ob09wdGlvbnMpIHtcclxuXHJcbiAgICAgIHZhciBvU291bmQgPSBudWxsLCBpbnN0YW5jZU9wdGlvbnM7XHJcblxyXG4gICAgICBpZiAob09wdGlvbnMgIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBzLl9pTyA9IG1peGluKG9PcHRpb25zLCBzLm9wdGlvbnMpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9PcHRpb25zID0gcy5vcHRpb25zO1xyXG4gICAgICAgIHMuX2lPID0gb09wdGlvbnM7XHJcbiAgICAgICAgaWYgKGxhc3RVUkwgJiYgbGFzdFVSTCAhPT0gcy51cmwpIHtcclxuICAgICAgICAgIF93RFMoJ21hblVSTCcpO1xyXG4gICAgICAgICAgcy5faU8udXJsID0gcy51cmw7XHJcbiAgICAgICAgICBzLnVybCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXMuX2lPLnVybCkge1xyXG4gICAgICAgIHMuX2lPLnVybCA9IHMudXJsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzLl9pTy51cmwgPSBwYXJzZVVSTChzLl9pTy51cmwpO1xyXG5cclxuICAgICAgLy8gZW5zdXJlIHdlJ3JlIGluIHN5bmNcclxuICAgICAgcy5pbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuXHJcbiAgICAgIC8vIGxvY2FsIHNob3J0Y3V0XHJcbiAgICAgIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogbG9hZCAoJyArIGluc3RhbmNlT3B0aW9ucy51cmwgKyAnKScpO1xyXG5cclxuICAgICAgaWYgKCFpbnN0YW5jZU9wdGlvbnMudXJsICYmICFzLnVybCkge1xyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IGxvYWQoKTogdXJsIGlzIHVuYXNzaWduZWQuIEV4aXRpbmcuJywgMik7XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSAmJiBmViA9PT0gOCAmJiAhcy51cmwgJiYgIWluc3RhbmNlT3B0aW9ucy5hdXRvUGxheSkge1xyXG4gICAgICAgIC8vIGZsYXNoIDggbG9hZCgpIC0+IHBsYXkoKSB3b24ndCB3b3JrIGJlZm9yZSBvbmxvYWQgaGFzIGZpcmVkLlxyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IEZsYXNoIDggbG9hZCgpIGxpbWl0YXRpb246IFdhaXQgZm9yIG9ubG9hZCgpIGJlZm9yZSBjYWxsaW5nIHBsYXkoKS4nLCAxKTtcclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLnVybCA9PT0gcy51cmwgJiYgcy5yZWFkeVN0YXRlICE9PSAwICYmIHMucmVhZHlTdGF0ZSAhPT0gMikge1xyXG4gICAgICAgIF93RFMoJ29uVVJMJywgMSk7XHJcbiAgICAgICAgLy8gaWYgbG9hZGVkIGFuZCBhbiBvbmxvYWQoKSBleGlzdHMsIGZpcmUgaW1tZWRpYXRlbHkuXHJcbiAgICAgICAgaWYgKHMucmVhZHlTdGF0ZSA9PT0gMyAmJiBpbnN0YW5jZU9wdGlvbnMub25sb2FkKSB7XHJcbiAgICAgICAgICAvLyBhc3N1bWUgc3VjY2VzcyBiYXNlZCBvbiB0cnV0aHkgZHVyYXRpb24uXHJcbiAgICAgICAgICB3cmFwQ2FsbGJhY2socywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlT3B0aW9ucy5vbmxvYWQuYXBwbHkocywgWyghIXMuZHVyYXRpb24pXSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJlc2V0IGEgZmV3IHN0YXRlIHByb3BlcnRpZXNcclxuXHJcbiAgICAgIHMubG9hZGVkID0gZmFsc2U7XHJcbiAgICAgIHMucmVhZHlTdGF0ZSA9IDE7XHJcbiAgICAgIHMucGxheVN0YXRlID0gMDtcclxuICAgICAgcy5pZDMgPSB7fTtcclxuXHJcbiAgICAgIC8vIFRPRE86IElmIHN3aXRjaGluZyBmcm9tIEhUTUw1IC0+IGZsYXNoIChvciB2aWNlIHZlcnNhKSwgc3RvcCBjdXJyZW50bHktcGxheWluZyBhdWRpby5cclxuXHJcbiAgICAgIGlmIChodG1sNU9LKGluc3RhbmNlT3B0aW9ucykpIHtcclxuXHJcbiAgICAgICAgb1NvdW5kID0gcy5fc2V0dXBfaHRtbDUoaW5zdGFuY2VPcHRpb25zKTtcclxuXHJcbiAgICAgICAgaWYgKCFvU291bmQuX2NhbGxlZF9sb2FkKSB7XHJcblxyXG4gICAgICAgICAgcy5faHRtbDVfY2FucGxheSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIC8vIFRPRE86IHJldmlldyBjYWxsZWRfbG9hZCAvIGh0bWw1X2NhbnBsYXkgbG9naWNcclxuXHJcbiAgICAgICAgICAvLyBpZiB1cmwgcHJvdmlkZWQgZGlyZWN0bHkgdG8gbG9hZCgpLCBhc3NpZ24gaXQgaGVyZS5cclxuXHJcbiAgICAgICAgICBpZiAocy51cmwgIT09IGluc3RhbmNlT3B0aW9ucy51cmwpIHtcclxuXHJcbiAgICAgICAgICAgIHNtMi5fd0QoX3dEUygnbWFuVVJMJykgKyAnOiAnICsgaW5zdGFuY2VPcHRpb25zLnVybCk7XHJcblxyXG4gICAgICAgICAgICBzLl9hLnNyYyA9IGluc3RhbmNlT3B0aW9ucy51cmw7XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPOiByZXZpZXcgLyByZS1hcHBseSBhbGwgcmVsZXZhbnQgb3B0aW9ucyAodm9sdW1lLCBsb29wLCBvbnBvc2l0aW9uIGV0Yy4pXHJcblxyXG4gICAgICAgICAgICAvLyByZXNldCBwb3NpdGlvbiBmb3IgbmV3IFVSTFxyXG4gICAgICAgICAgICBzLnNldFBvc2l0aW9uKDApO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBnaXZlbiBleHBsaWNpdCBsb2FkIGNhbGwsIHRyeSB0byBwcmVsb2FkLlxyXG5cclxuICAgICAgICAgIC8vIGVhcmx5IEhUTUw1IGltcGxlbWVudGF0aW9uIChub24tc3RhbmRhcmQpXHJcbiAgICAgICAgICBzLl9hLmF1dG9idWZmZXIgPSAnYXV0byc7XHJcblxyXG4gICAgICAgICAgLy8gc3RhbmRhcmQgcHJvcGVydHksIHZhbHVlczogbm9uZSAvIG1ldGFkYXRhIC8gYXV0b1xyXG4gICAgICAgICAgLy8gcmVmZXJlbmNlOiBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZmY5NzQ3NTklMjh2PXZzLjg1JTI5LmFzcHhcclxuICAgICAgICAgIHMuX2EucHJlbG9hZCA9ICdhdXRvJztcclxuXHJcbiAgICAgICAgICBzLl9hLl9jYWxsZWRfbG9hZCA9IHRydWU7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgc20yLl93RChzLmlkICsgJzogSWdub3JpbmcgcmVxdWVzdCB0byBsb2FkIGFnYWluJyk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBObyBmbGFzaCBzdXBwb3J0LiBFeGl0aW5nLicpO1xyXG4gICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocy5faU8udXJsICYmIHMuX2lPLnVybC5tYXRjaCgvZGF0YVxcOi9pKSkge1xyXG4gICAgICAgICAgLy8gZGF0YTogVVJJcyBub3Qgc3VwcG9ydGVkIGJ5IEZsYXNoLCBlaXRoZXIuXHJcbiAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBkYXRhOiBVUklzIG5vdCBzdXBwb3J0ZWQgdmlhIEZsYXNoLiBFeGl0aW5nLicpO1xyXG4gICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgcy5pc0hUTUw1ID0gZmFsc2U7XHJcbiAgICAgICAgICBzLl9pTyA9IHBvbGljeUZpeChsb29wRml4KGluc3RhbmNlT3B0aW9ucykpO1xyXG4gICAgICAgICAgLy8gaWYgd2UgaGF2ZSBcInBvc2l0aW9uXCIsIGRpc2FibGUgYXV0by1wbGF5IGFzIHdlJ2xsIGJlIHNlZWtpbmcgdG8gdGhhdCBwb3NpdGlvbiBhdCBvbmxvYWQoKS5cclxuICAgICAgICAgIGlmIChzLl9pTy5hdXRvUGxheSAmJiAocy5faU8ucG9zaXRpb24gfHwgcy5faU8uZnJvbSkpIHtcclxuICAgICAgICAgICAgc20yLl93RChzLmlkICsgJzogRGlzYWJsaW5nIGF1dG9QbGF5IGJlY2F1c2Ugb2Ygbm9uLXplcm8gb2Zmc2V0IGNhc2UnKTtcclxuICAgICAgICAgICAgcy5faU8uYXV0b1BsYXkgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIHJlLWFzc2lnbiBsb2NhbCBzaG9ydGN1dFxyXG4gICAgICAgICAgaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcbiAgICAgICAgICBpZiAoZlYgPT09IDgpIHtcclxuICAgICAgICAgICAgZmxhc2guX2xvYWQocy5pZCwgaW5zdGFuY2VPcHRpb25zLnVybCwgaW5zdGFuY2VPcHRpb25zLnN0cmVhbSwgaW5zdGFuY2VPcHRpb25zLmF1dG9QbGF5LCBpbnN0YW5jZU9wdGlvbnMudXNlUG9saWN5RmlsZSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmbGFzaC5fbG9hZChzLmlkLCBpbnN0YW5jZU9wdGlvbnMudXJsLCAhIShpbnN0YW5jZU9wdGlvbnMuc3RyZWFtKSwgISEoaW5zdGFuY2VPcHRpb25zLmF1dG9QbGF5KSwgaW5zdGFuY2VPcHRpb25zLmxvb3BzIHx8IDEsICEhKGluc3RhbmNlT3B0aW9ucy5hdXRvTG9hZCksIGluc3RhbmNlT3B0aW9ucy51c2VQb2xpY3lGaWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAgIF93RFMoJ3NtRXJyb3InLCAyKTtcclxuICAgICAgICAgIGRlYnVnVFMoJ29ubG9hZCcsIGZhbHNlKTtcclxuICAgICAgICAgIGNhdGNoRXJyb3Ioe1xyXG4gICAgICAgICAgICB0eXBlOiAnU01TT1VORF9MT0FEX0pTX0VYQ0VQVElPTicsXHJcbiAgICAgICAgICAgIGZhdGFsOiB0cnVlXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBhZnRlciBhbGwgb2YgdGhpcywgZW5zdXJlIHNvdW5kIHVybCBpcyB1cCB0byBkYXRlLlxyXG4gICAgICBzLnVybCA9IGluc3RhbmNlT3B0aW9ucy51cmw7XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5sb2FkcyBhIHNvdW5kLCBjYW5jZWxpbmcgYW55IG9wZW4gSFRUUCByZXF1ZXN0cy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMudW5sb2FkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAvLyBGbGFzaCA4L0FTMiBjYW4ndCBcImNsb3NlXCIgYSBzdHJlYW0gLSBmYWtlIGl0IGJ5IGxvYWRpbmcgYW4gZW1wdHkgVVJMXHJcbiAgICAgIC8vIEZsYXNoIDkvQVMzOiBDbG9zZSBzdHJlYW0sIHByZXZlbnRpbmcgZnVydGhlciBsb2FkXHJcbiAgICAgIC8vIEhUTUw1OiBNb3N0IFVBcyB3aWxsIHVzZSBlbXB0eSBVUkxcclxuXHJcbiAgICAgIGlmIChzLnJlYWR5U3RhdGUgIT09IDApIHtcclxuXHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogdW5sb2FkKCknKTtcclxuXHJcbiAgICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgICBpZiAoZlYgPT09IDgpIHtcclxuICAgICAgICAgICAgZmxhc2guX3VubG9hZChzLmlkLCBlbXB0eVVSTCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmbGFzaC5fdW5sb2FkKHMuaWQpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIHN0b3BfaHRtbDVfdGltZXIoKTtcclxuXHJcbiAgICAgICAgICBpZiAocy5fYSkge1xyXG5cclxuICAgICAgICAgICAgcy5fYS5wYXVzZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gdXBkYXRlIGVtcHR5IFVSTCwgdG9vXHJcbiAgICAgICAgICAgIGxhc3RVUkwgPSBodG1sNVVubG9hZChzLl9hKTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcmVzZXQgbG9hZC9zdGF0dXMgZmxhZ3NcclxuICAgICAgICByZXNldFByb3BlcnRpZXMoKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbmxvYWRzIGFuZCBkZXN0cm95cyBhIHNvdW5kLlxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5kZXN0cnVjdCA9IGZ1bmN0aW9uKF9iRnJvbVNNKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBEZXN0cnVjdCcpO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgLy8ga2lsbCBzb3VuZCB3aXRoaW4gRmxhc2hcclxuICAgICAgICAvLyBEaXNhYmxlIHRoZSBvbmZhaWx1cmUgaGFuZGxlclxyXG4gICAgICAgIHMuX2lPLm9uZmFpbHVyZSA9IG51bGw7XHJcbiAgICAgICAgZmxhc2guX2Rlc3Ryb3lTb3VuZChzLmlkKTtcclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIHN0b3BfaHRtbDVfdGltZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKHMuX2EpIHtcclxuICAgICAgICAgIHMuX2EucGF1c2UoKTtcclxuICAgICAgICAgIGh0bWw1VW5sb2FkKHMuX2EpO1xyXG4gICAgICAgICAgaWYgKCF1c2VHbG9iYWxIVE1MNUF1ZGlvKSB7XHJcbiAgICAgICAgICAgIHJlbW92ZV9odG1sNV9ldmVudHMoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIGJyZWFrIG9idmlvdXMgY2lyY3VsYXIgcmVmZXJlbmNlXHJcbiAgICAgICAgICBzLl9hLl9zID0gbnVsbDtcclxuICAgICAgICAgIHMuX2EgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghX2JGcm9tU00pIHtcclxuICAgICAgICAvLyBlbnN1cmUgZGVsZXRpb24gZnJvbSBjb250cm9sbGVyXHJcbiAgICAgICAgc20yLmRlc3Ryb3lTb3VuZChzLmlkLCB0cnVlKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCZWdpbnMgcGxheWluZyBhIHNvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvT3B0aW9ucyBPcHRpb25hbDogU291bmQgb3B0aW9uc1xyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnBsYXkgPSBmdW5jdGlvbihvT3B0aW9ucywgX3VwZGF0ZVBsYXlTdGF0ZSkge1xyXG5cclxuICAgICAgdmFyIGZOLCBhbGxvd011bHRpLCBhLCBvbnJlYWR5LFxyXG4gICAgICAgICAgYXVkaW9DbG9uZSwgb25lbmRlZCwgb25jYW5wbGF5LFxyXG4gICAgICAgICAgc3RhcnRPSyA9IHRydWUsXHJcbiAgICAgICAgICBleGl0ID0gbnVsbDtcclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBmTiA9IHMuaWQgKyAnOiBwbGF5KCk6ICc7XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIC8vIGRlZmF1bHQgdG8gdHJ1ZVxyXG4gICAgICBfdXBkYXRlUGxheVN0YXRlID0gKF91cGRhdGVQbGF5U3RhdGUgPT09IF91bmRlZmluZWQgPyB0cnVlIDogX3VwZGF0ZVBsYXlTdGF0ZSk7XHJcblxyXG4gICAgICBpZiAoIW9PcHRpb25zKSB7XHJcbiAgICAgICAgb09wdGlvbnMgPSB7fTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZmlyc3QsIHVzZSBsb2NhbCBVUkwgKGlmIHNwZWNpZmllZClcclxuICAgICAgaWYgKHMudXJsKSB7XHJcbiAgICAgICAgcy5faU8udXJsID0gcy51cmw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG1peCBpbiBhbnkgb3B0aW9ucyBkZWZpbmVkIGF0IGNyZWF0ZVNvdW5kKClcclxuICAgICAgcy5faU8gPSBtaXhpbihzLl9pTywgcy5vcHRpb25zKTtcclxuXHJcbiAgICAgIC8vIG1peCBpbiBhbnkgb3B0aW9ucyBzcGVjaWZpYyB0byB0aGlzIG1ldGhvZFxyXG4gICAgICBzLl9pTyA9IG1peGluKG9PcHRpb25zLCBzLl9pTyk7XHJcblxyXG4gICAgICBzLl9pTy51cmwgPSBwYXJzZVVSTChzLl9pTy51cmwpO1xyXG5cclxuICAgICAgcy5pbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuXHJcbiAgICAgIC8vIFJUTVAtb25seVxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSAmJiBzLl9pTy5zZXJ2ZXJVUkwgJiYgIXMuY29ubmVjdGVkKSB7XHJcbiAgICAgICAgaWYgKCFzLmdldEF1dG9QbGF5KCkpIHtcclxuICAgICAgICAgIHNtMi5fd0QoZk4gKycgTmV0c3RyZWFtIG5vdCBjb25uZWN0ZWQgeWV0IC0gc2V0dGluZyBhdXRvUGxheScpO1xyXG4gICAgICAgICAgcy5zZXRBdXRvUGxheSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcGxheSB3aWxsIGJlIGNhbGxlZCBpbiBvbmNvbm5lY3QoKVxyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaHRtbDVPSyhzLl9pTykpIHtcclxuICAgICAgICBzLl9zZXR1cF9odG1sNShzLl9pTyk7XHJcbiAgICAgICAgc3RhcnRfaHRtbDVfdGltZXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHMucGxheVN0YXRlID09PSAxICYmICFzLnBhdXNlZCkge1xyXG5cclxuICAgICAgICBhbGxvd011bHRpID0gcy5faU8ubXVsdGlTaG90O1xyXG5cclxuICAgICAgICBpZiAoIWFsbG93TXVsdGkpIHtcclxuXHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgJ0FscmVhZHkgcGxheWluZyAob25lLXNob3QpJywgMSk7XHJcblxyXG4gICAgICAgICAgaWYgKHMuaXNIVE1MNSkge1xyXG4gICAgICAgICAgICAvLyBnbyBiYWNrIHRvIG9yaWdpbmFsIHBvc2l0aW9uLlxyXG4gICAgICAgICAgICBzLnNldFBvc2l0aW9uKHMuX2lPLnBvc2l0aW9uKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBleGl0ID0gcztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyAnQWxyZWFkeSBwbGF5aW5nIChtdWx0aS1zaG90KScsIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChleGl0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIGV4aXQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGVkZ2UgY2FzZTogcGxheSgpIHdpdGggZXhwbGljaXQgVVJMIHBhcmFtZXRlclxyXG4gICAgICBpZiAob09wdGlvbnMudXJsICYmIG9PcHRpb25zLnVybCAhPT0gcy51cmwpIHtcclxuXHJcbiAgICAgICAgLy8gc3BlY2lhbCBjYXNlIGZvciBjcmVhdGVTb3VuZCgpIGZvbGxvd2VkIGJ5IGxvYWQoKSAvIHBsYXkoKSB3aXRoIHVybDsgYXZvaWQgZG91YmxlLWxvYWQgY2FzZS5cclxuICAgICAgICBpZiAoIXMucmVhZHlTdGF0ZSAmJiAhcy5pc0hUTUw1ICYmIGZWID09PSA4ICYmIHVybE9taXR0ZWQpIHtcclxuXHJcbiAgICAgICAgICB1cmxPbWl0dGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gbG9hZCB1c2luZyBtZXJnZWQgb3B0aW9uc1xyXG4gICAgICAgICAgcy5sb2FkKHMuX2lPKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFzLmxvYWRlZCkge1xyXG5cclxuICAgICAgICBpZiAocy5yZWFkeVN0YXRlID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgc20yLl93RChmTiArICdBdHRlbXB0aW5nIHRvIGxvYWQnKTtcclxuXHJcbiAgICAgICAgICAvLyB0cnkgdG8gZ2V0IHRoaXMgc291bmQgcGxheWluZyBBU0FQXHJcbiAgICAgICAgICBpZiAoIXMuaXNIVE1MNSAmJiAhc20yLmh0bWw1T25seSkge1xyXG5cclxuICAgICAgICAgICAgLy8gZmxhc2g6IGFzc2lnbiBkaXJlY3RseSBiZWNhdXNlIHNldEF1dG9QbGF5KCkgaW5jcmVtZW50cyB0aGUgaW5zdGFuY2VDb3VudFxyXG4gICAgICAgICAgICBzLl9pTy5hdXRvUGxheSA9IHRydWU7XHJcbiAgICAgICAgICAgIHMubG9hZChzLl9pTyk7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIGlmIChzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGlPUyBuZWVkcyB0aGlzIHdoZW4gcmVjeWNsaW5nIHNvdW5kcywgbG9hZGluZyBhIG5ldyBVUkwgb24gYW4gZXhpc3Rpbmcgb2JqZWN0LlxyXG4gICAgICAgICAgICBzLmxvYWQocy5faU8pO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBzbTIuX3dEKGZOICsgJ1Vuc3VwcG9ydGVkIHR5cGUuIEV4aXRpbmcuJyk7XHJcbiAgICAgICAgICAgIGV4aXQgPSBzO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBIVE1MNSBoYWNrIC0gcmUtc2V0IGluc3RhbmNlT3B0aW9ucz9cclxuICAgICAgICAgIHMuaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAocy5yZWFkeVN0YXRlID09PSAyKSB7XHJcblxyXG4gICAgICAgICAgc20yLl93RChmTiArICdDb3VsZCBub3QgbG9hZCAtIGV4aXRpbmcnLCAyKTtcclxuICAgICAgICAgIGV4aXQgPSBzO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyAnTG9hZGluZyAtIGF0dGVtcHRpbmcgdG8gcGxheS4uLicpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBcInBsYXkoKVwiXHJcbiAgICAgICAgc20yLl93RChmTi5zdWJzdHIoMCwgZk4ubGFzdEluZGV4T2YoJzonKSkpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGV4aXQgIT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gZXhpdDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgZlYgPT09IDkgJiYgcy5wb3NpdGlvbiA+IDAgJiYgcy5wb3NpdGlvbiA9PT0gcy5kdXJhdGlvbikge1xyXG4gICAgICAgIC8vIGZsYXNoIDkgbmVlZHMgYSBwb3NpdGlvbiByZXNldCBpZiBwbGF5KCkgaXMgY2FsbGVkIHdoaWxlIGF0IHRoZSBlbmQgb2YgYSBzb3VuZC5cclxuICAgICAgICBzbTIuX3dEKGZOICsgJ1NvdW5kIGF0IGVuZCwgcmVzZXR0aW5nIHRvIHBvc2l0aW9uOiAwJyk7XHJcbiAgICAgICAgb09wdGlvbnMucG9zaXRpb24gPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU3RyZWFtcyB3aWxsIHBhdXNlIHdoZW4gdGhlaXIgYnVmZmVyIGlzIGZ1bGwgaWYgdGhleSBhcmUgYmVpbmcgbG9hZGVkLlxyXG4gICAgICAgKiBJbiB0aGlzIGNhc2UgcGF1c2VkIGlzIHRydWUsIGJ1dCB0aGUgc29uZyBoYXNuJ3Qgc3RhcnRlZCBwbGF5aW5nIHlldC5cclxuICAgICAgICogSWYgd2UganVzdCBjYWxsIHJlc3VtZSgpIHRoZSBvbnBsYXkoKSBjYWxsYmFjayB3aWxsIG5ldmVyIGJlIGNhbGxlZC5cclxuICAgICAgICogU28gb25seSBjYWxsIHJlc3VtZSgpIGlmIHRoZSBwb3NpdGlvbiBpcyA+IDAuXHJcbiAgICAgICAqIEFub3RoZXIgcmVhc29uIGlzIGJlY2F1c2Ugb3B0aW9ucyBsaWtlIHZvbHVtZSB3b24ndCBoYXZlIGJlZW4gYXBwbGllZCB5ZXQuXHJcbiAgICAgICAqIEZvciBub3JtYWwgc291bmRzLCBqdXN0IHJlc3VtZS5cclxuICAgICAgICovXHJcblxyXG4gICAgICBpZiAocy5wYXVzZWQgJiYgcy5wb3NpdGlvbiA+PSAwICYmICghcy5faU8uc2VydmVyVVJMIHx8IHMucG9zaXRpb24gPiAwKSkge1xyXG5cclxuICAgICAgICAvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS8zN2IxN2RmNzVjYzRkN2E5MGJmNlxyXG4gICAgICAgIHNtMi5fd0QoZk4gKyAnUmVzdW1pbmcgZnJvbSBwYXVzZWQgc3RhdGUnLCAxKTtcclxuICAgICAgICBzLnJlc3VtZSgpO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgcy5faU8gPSBtaXhpbihvT3B0aW9ucywgcy5faU8pO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBQcmVsb2FkIGluIHRoZSBldmVudCBvZiBwbGF5KCkgd2l0aCBwb3NpdGlvbiB1bmRlciBGbGFzaCxcclxuICAgICAgICAgKiBvciBmcm9tL3RvIHBhcmFtZXRlcnMgYW5kIG5vbi1SVE1QIGNhc2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAoKCghcy5pc0hUTUw1ICYmIHMuX2lPLnBvc2l0aW9uICE9PSBudWxsICYmIHMuX2lPLnBvc2l0aW9uID4gMCkgfHwgKHMuX2lPLmZyb20gIT09IG51bGwgJiYgcy5faU8uZnJvbSA+IDApIHx8IHMuX2lPLnRvICE9PSBudWxsKSAmJiBzLmluc3RhbmNlQ291bnQgPT09IDAgJiYgcy5wbGF5U3RhdGUgPT09IDAgJiYgIXMuX2lPLnNlcnZlclVSTCkge1xyXG5cclxuICAgICAgICAgIG9ucmVhZHkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gc291bmQgXCJjYW5wbGF5XCIgb3Igb25sb2FkKClcclxuICAgICAgICAgICAgLy8gcmUtYXBwbHkgcG9zaXRpb24vZnJvbS90byB0byBpbnN0YW5jZSBvcHRpb25zLCBhbmQgc3RhcnQgcGxheWJhY2tcclxuICAgICAgICAgICAgcy5faU8gPSBtaXhpbihvT3B0aW9ucywgcy5faU8pO1xyXG4gICAgICAgICAgICBzLnBsYXkocy5faU8pO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAvLyBIVE1MNSBuZWVkcyB0byBhdCBsZWFzdCBoYXZlIFwiY2FucGxheVwiIGZpcmVkIGJlZm9yZSBzZWVraW5nLlxyXG4gICAgICAgICAgaWYgKHMuaXNIVE1MNSAmJiAhcy5faHRtbDVfY2FucGxheSkge1xyXG5cclxuICAgICAgICAgICAgLy8gdGhpcyBoYXNuJ3QgYmVlbiBsb2FkZWQgeWV0LiBsb2FkIGl0IGZpcnN0LCBhbmQgdGhlbiBkbyB0aGlzIGFnYWluLlxyXG4gICAgICAgICAgICBzbTIuX3dEKGZOICsgJ0JlZ2lubmluZyBsb2FkIGZvciBub24temVybyBvZmZzZXQgY2FzZScpO1xyXG5cclxuICAgICAgICAgICAgcy5sb2FkKHtcclxuICAgICAgICAgICAgICAvLyBub3RlOiBjdXN0b20gSFRNTDUtb25seSBldmVudCBhZGRlZCBmb3IgZnJvbS90byBpbXBsZW1lbnRhdGlvbi5cclxuICAgICAgICAgICAgICBfb25jYW5wbGF5OiBvbnJlYWR5XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZXhpdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSBpZiAoIXMuaXNIVE1MNSAmJiAhcy5sb2FkZWQgJiYgKCFzLnJlYWR5U3RhdGUgfHwgcy5yZWFkeVN0YXRlICE9PSAyKSkge1xyXG5cclxuICAgICAgICAgICAgLy8gdG8gYmUgc2FmZSwgcHJlbG9hZCB0aGUgd2hvbGUgdGhpbmcgaW4gRmxhc2guXHJcblxyXG4gICAgICAgICAgICBzbTIuX3dEKGZOICsgJ1ByZWxvYWRpbmcgZm9yIG5vbi16ZXJvIG9mZnNldCBjYXNlJyk7XHJcblxyXG4gICAgICAgICAgICBzLmxvYWQoe1xyXG4gICAgICAgICAgICAgIG9ubG9hZDogb25yZWFkeVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGV4aXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGV4aXQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV4aXQ7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gb3RoZXJ3aXNlLCB3ZSdyZSByZWFkeSB0byBnby4gcmUtYXBwbHkgbG9jYWwgb3B0aW9ucywgYW5kIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgcy5faU8gPSBhcHBseUZyb21UbygpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHNtMi5fd0QoZk4gKyAnU3RhcnRpbmcgdG8gcGxheScpO1xyXG5cclxuICAgICAgICAvLyBpbmNyZW1lbnQgaW5zdGFuY2UgY291bnRlciwgd2hlcmUgZW5hYmxlZCArIHN1cHBvcnRlZFxyXG4gICAgICAgIGlmICghcy5pbnN0YW5jZUNvdW50IHx8IHMuX2lPLm11bHRpU2hvdEV2ZW50cyB8fCAocy5pc0hUTUw1ICYmIHMuX2lPLm11bHRpU2hvdCAmJiAhdXNlR2xvYmFsSFRNTDVBdWRpbykgfHwgKCFzLmlzSFRNTDUgJiYgZlYgPiA4ICYmICFzLmdldEF1dG9QbGF5KCkpKSB7XHJcbiAgICAgICAgICBzLmluc3RhbmNlQ291bnQrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlmIGZpcnN0IHBsYXkgYW5kIG9ucG9zaXRpb24gcGFyYW1ldGVycyBleGlzdCwgYXBwbHkgdGhlbSBub3dcclxuICAgICAgICBpZiAocy5faU8ub25wb3NpdGlvbiAmJiBzLnBsYXlTdGF0ZSA9PT0gMCkge1xyXG4gICAgICAgICAgYXR0YWNoT25Qb3NpdGlvbihzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHMucGxheVN0YXRlID0gMTtcclxuICAgICAgICBzLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBzLnBvc2l0aW9uID0gKHMuX2lPLnBvc2l0aW9uICE9PSBfdW5kZWZpbmVkICYmICFpc05hTihzLl9pTy5wb3NpdGlvbikgPyBzLl9pTy5wb3NpdGlvbiA6IDApO1xyXG5cclxuICAgICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgICAgcy5faU8gPSBwb2xpY3lGaXgobG9vcEZpeChzLl9pTykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHMuX2lPLm9ucGxheSAmJiBfdXBkYXRlUGxheVN0YXRlKSB7XHJcbiAgICAgICAgICBzLl9pTy5vbnBsYXkuYXBwbHkocyk7XHJcbiAgICAgICAgICBvbnBsYXlfY2FsbGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHMuc2V0Vm9sdW1lKHMuX2lPLnZvbHVtZSwgdHJ1ZSk7XHJcbiAgICAgICAgcy5zZXRQYW4ocy5faU8ucGFuLCB0cnVlKTtcclxuXHJcbiAgICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgICBzdGFydE9LID0gZmxhc2guX3N0YXJ0KHMuaWQsIHMuX2lPLmxvb3BzIHx8IDEsIChmViA9PT0gOSA/IHMucG9zaXRpb24gOiBzLnBvc2l0aW9uIC8gbXNlY1NjYWxlKSwgcy5faU8ubXVsdGlTaG90IHx8IGZhbHNlKTtcclxuXHJcbiAgICAgICAgICBpZiAoZlYgPT09IDkgJiYgIXN0YXJ0T0spIHtcclxuICAgICAgICAgICAgLy8gZWRnZSBjYXNlOiBubyBzb3VuZCBoYXJkd2FyZSwgb3IgMzItY2hhbm5lbCBmbGFzaCBjZWlsaW5nIGhpdC5cclxuICAgICAgICAgICAgLy8gYXBwbGllcyBvbmx5IHRvIEZsYXNoIDksIG5vbi1OZXRTdHJlYW0vTW92aWVTdGFyIHNvdW5kcy5cclxuICAgICAgICAgICAgLy8gaHR0cDovL2hlbHAuYWRvYmUuY29tL2VuX1VTL0ZsYXNoUGxhdGZvcm0vcmVmZXJlbmNlL2FjdGlvbnNjcmlwdC8zL2ZsYXNoL21lZGlhL1NvdW5kLmh0bWwjcGxheSUyOCUyOVxyXG4gICAgICAgICAgICBzbTIuX3dEKGZOICsgJ05vIHNvdW5kIGhhcmR3YXJlLCBvciAzMi1zb3VuZCBjZWlsaW5nIGhpdCcsIDIpO1xyXG4gICAgICAgICAgICBpZiAocy5faU8ub25wbGF5ZXJyb3IpIHtcclxuICAgICAgICAgICAgICBzLl9pTy5vbnBsYXllcnJvci5hcHBseShzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICBpZiAocy5pbnN0YW5jZUNvdW50IDwgMikge1xyXG5cclxuICAgICAgICAgICAgLy8gSFRNTDUgc2luZ2xlLWluc3RhbmNlIGNhc2VcclxuXHJcbiAgICAgICAgICAgIHN0YXJ0X2h0bWw1X3RpbWVyKCk7XHJcblxyXG4gICAgICAgICAgICBhID0gcy5fc2V0dXBfaHRtbDUoKTtcclxuXHJcbiAgICAgICAgICAgIHMuc2V0UG9zaXRpb24ocy5faU8ucG9zaXRpb24pO1xyXG5cclxuICAgICAgICAgICAgYS5wbGF5KCk7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEhUTUw1IG11bHRpLXNob3QgY2FzZVxyXG5cclxuICAgICAgICAgICAgc20yLl93RChzLmlkICsgJzogQ2xvbmluZyBBdWRpbygpIGZvciBpbnN0YW5jZSAjJyArIHMuaW5zdGFuY2VDb3VudCArICcuLi4nKTtcclxuXHJcbiAgICAgICAgICAgIGF1ZGlvQ2xvbmUgPSBuZXcgQXVkaW8ocy5faU8udXJsKTtcclxuXHJcbiAgICAgICAgICAgIG9uZW5kZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBldmVudC5yZW1vdmUoYXVkaW9DbG9uZSwgJ2VuZGVkJywgb25lbmRlZCk7XHJcbiAgICAgICAgICAgICAgcy5fb25maW5pc2gocyk7XHJcbiAgICAgICAgICAgICAgLy8gY2xlYW51cFxyXG4gICAgICAgICAgICAgIGh0bWw1VW5sb2FkKGF1ZGlvQ2xvbmUpO1xyXG4gICAgICAgICAgICAgIGF1ZGlvQ2xvbmUgPSBudWxsO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgb25jYW5wbGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgZXZlbnQucmVtb3ZlKGF1ZGlvQ2xvbmUsICdjYW5wbGF5Jywgb25jYW5wbGF5KTtcclxuICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgYXVkaW9DbG9uZS5jdXJyZW50VGltZSA9IHMuX2lPLnBvc2l0aW9uL21zZWNTY2FsZTtcclxuICAgICAgICAgICAgICB9IGNhdGNoKGVycikge1xyXG4gICAgICAgICAgICAgICAgY29tcGxhaW4ocy5pZCArICc6IG11bHRpU2hvdCBwbGF5KCkgZmFpbGVkIHRvIGFwcGx5IHBvc2l0aW9uIG9mICcgKyAocy5faU8ucG9zaXRpb24vbXNlY1NjYWxlKSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGF1ZGlvQ2xvbmUucGxheSgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZXZlbnQuYWRkKGF1ZGlvQ2xvbmUsICdlbmRlZCcsIG9uZW5kZWQpO1xyXG5cclxuICAgICAgICAgICAgLy8gYXBwbHkgdm9sdW1lIHRvIGNsb25lcywgdG9vXHJcbiAgICAgICAgICAgIGlmIChzLl9pTy52b2x1bWUgIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICBhdWRpb0Nsb25lLnZvbHVtZSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHMuX2lPLnZvbHVtZS8xMDApKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gcGxheWluZyBtdWx0aXBsZSBtdXRlZCBzb3VuZHM/IGlmIHlvdSBkbyB0aGlzLCB5b3UncmUgd2VpcmQgOykgLSBidXQgbGV0J3MgY292ZXIgaXQuXHJcbiAgICAgICAgICAgIGlmIChzLm11dGVkKSB7XHJcbiAgICAgICAgICAgICAgYXVkaW9DbG9uZS5tdXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChzLl9pTy5wb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgIC8vIEhUTUw1IGF1ZGlvIGNhbid0IHNlZWsgYmVmb3JlIG9ucGxheSgpIGV2ZW50IGhhcyBmaXJlZC5cclxuICAgICAgICAgICAgICAvLyB3YWl0IGZvciBjYW5wbGF5LCB0aGVuIHNlZWsgdG8gcG9zaXRpb24gYW5kIHN0YXJ0IHBsYXliYWNrLlxyXG4gICAgICAgICAgICAgIGV2ZW50LmFkZChhdWRpb0Nsb25lLCAnY2FucGxheScsIG9uY2FucGxheSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgLy8gYmVnaW4gcGxheWJhY2sgYXQgY3VycmVudFRpbWU6IDBcclxuICAgICAgICAgICAgICBhdWRpb0Nsb25lLnBsYXkoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBqdXN0IGZvciBjb252ZW5pZW5jZVxyXG4gICAgdGhpcy5zdGFydCA9IHRoaXMucGxheTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0b3BzIHBsYXlpbmcgYSBzb3VuZCAoYW5kIG9wdGlvbmFsbHksIGFsbCBzb3VuZHMpXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBiQWxsIE9wdGlvbmFsOiBXaGV0aGVyIHRvIHN0b3AgYWxsIHNvdW5kc1xyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnN0b3AgPSBmdW5jdGlvbihiQWxsKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gcy5faU8sXHJcbiAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uO1xyXG5cclxuICAgICAgaWYgKHMucGxheVN0YXRlID09PSAxKSB7XHJcblxyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IHN0b3AoKScpO1xyXG5cclxuICAgICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuICAgICAgICBzLl9yZXNldE9uUG9zaXRpb24oMCk7XHJcbiAgICAgICAgcy5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICAgIHMucGxheVN0YXRlID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSBvblBvc2l0aW9uIGxpc3RlbmVycywgaWYgYW55XHJcbiAgICAgICAgZGV0YWNoT25Qb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAvLyBhbmQgXCJ0b1wiIHBvc2l0aW9uLCBpZiBzZXRcclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLnRvKSB7XHJcbiAgICAgICAgICBzLmNsZWFyT25Qb3NpdGlvbihpbnN0YW5jZU9wdGlvbnMudG8pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgICBmbGFzaC5fc3RvcChzLmlkLCBiQWxsKTtcclxuXHJcbiAgICAgICAgICAvLyBoYWNrIGZvciBuZXRTdHJlYW06IGp1c3QgdW5sb2FkXHJcbiAgICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLnNlcnZlclVSTCkge1xyXG4gICAgICAgICAgICBzLnVubG9hZCgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIGlmIChzLl9hKSB7XHJcblxyXG4gICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uID0gcy5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgICAgIC8vIGFjdCBsaWtlIEZsYXNoLCB0aG91Z2hcclxuICAgICAgICAgICAgcy5zZXRQb3NpdGlvbigwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGhhY2s6IHJlZmxlY3Qgb2xkIHBvc2l0aW9uIGZvciBvbnN0b3AoKSAoYWxzbyBsaWtlIEZsYXNoKVxyXG4gICAgICAgICAgICBzLnBvc2l0aW9uID0gb3JpZ2luYWxQb3NpdGlvbjtcclxuXHJcbiAgICAgICAgICAgIC8vIGh0bWw1IGhhcyBubyBzdG9wKClcclxuICAgICAgICAgICAgLy8gTk9URTogcGF1c2luZyBtZWFucyBpT1MgcmVxdWlyZXMgaW50ZXJhY3Rpb24gdG8gcmVzdW1lLlxyXG4gICAgICAgICAgICBzLl9hLnBhdXNlKCk7XHJcblxyXG4gICAgICAgICAgICBzLnBsYXlTdGF0ZSA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBhbmQgdXBkYXRlIFVJXHJcbiAgICAgICAgICAgIHMuX29uVGltZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHN0b3BfaHRtbDVfdGltZXIoKTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcy5pbnN0YW5jZUNvdW50ID0gMDtcclxuICAgICAgICBzLl9pTyA9IHt9O1xyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLm9uc3RvcCkge1xyXG4gICAgICAgICAgaW5zdGFuY2VPcHRpb25zLm9uc3RvcC5hcHBseShzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5kb2N1bWVudGVkL2ludGVybmFsOiBTZXRzIGF1dG9QbGF5IGZvciBSVE1QLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gYXV0b1BsYXkgc3RhdGVcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuc2V0QXV0b1BsYXkgPSBmdW5jdGlvbihhdXRvUGxheSkge1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogQXV0b3BsYXkgdHVybmVkICcgKyAoYXV0b1BsYXkgPyAnb24nIDogJ29mZicpKTtcclxuICAgICAgcy5faU8uYXV0b1BsYXkgPSBhdXRvUGxheTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgZmxhc2guX3NldEF1dG9QbGF5KHMuaWQsIGF1dG9QbGF5KTtcclxuICAgICAgICBpZiAoYXV0b1BsYXkpIHtcclxuICAgICAgICAgIC8vIG9ubHkgaW5jcmVtZW50IHRoZSBpbnN0YW5jZUNvdW50IGlmIHRoZSBzb3VuZCBpc24ndCBsb2FkZWQgKFRPRE86IHZlcmlmeSBSVE1QKVxyXG4gICAgICAgICAgaWYgKCFzLmluc3RhbmNlQ291bnQgJiYgcy5yZWFkeVN0YXRlID09PSAxKSB7XHJcbiAgICAgICAgICAgIHMuaW5zdGFuY2VDb3VudCsrO1xyXG4gICAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBJbmNyZW1lbnRlZCBpbnN0YW5jZSBjb3VudCB0byAnK3MuaW5zdGFuY2VDb3VudCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVuZG9jdW1lbnRlZC9pbnRlcm5hbDogUmV0dXJucyB0aGUgYXV0b1BsYXkgYm9vbGVhbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBUaGUgY3VycmVudCBhdXRvUGxheSB2YWx1ZVxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5nZXRBdXRvUGxheSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgcmV0dXJuIHMuX2lPLmF1dG9QbGF5O1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiBhIHNvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuTXNlY09mZnNldCBQb3NpdGlvbiAobWlsbGlzZWNvbmRzKVxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnNldFBvc2l0aW9uID0gZnVuY3Rpb24obk1zZWNPZmZzZXQpIHtcclxuXHJcbiAgICAgIGlmIChuTXNlY09mZnNldCA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIG5Nc2VjT2Zmc2V0ID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHBvc2l0aW9uLCBwb3NpdGlvbjFLLFxyXG4gICAgICAgICAgLy8gVXNlIHRoZSBkdXJhdGlvbiBmcm9tIHRoZSBpbnN0YW5jZSBvcHRpb25zLCBpZiB3ZSBkb24ndCBoYXZlIGEgdHJhY2sgZHVyYXRpb24geWV0LlxyXG4gICAgICAgICAgLy8gcG9zaXRpb24gPj0gMCBhbmQgPD0gY3VycmVudCBhdmFpbGFibGUgKGxvYWRlZCkgZHVyYXRpb25cclxuICAgICAgICAgIG9mZnNldCA9IChzLmlzSFRNTDUgPyBNYXRoLm1heChuTXNlY09mZnNldCwgMCkgOiBNYXRoLm1pbihzLmR1cmF0aW9uIHx8IHMuX2lPLmR1cmF0aW9uLCBNYXRoLm1heChuTXNlY09mZnNldCwgMCkpKTtcclxuXHJcbiAgICAgIHMucG9zaXRpb24gPSBvZmZzZXQ7XHJcbiAgICAgIHBvc2l0aW9uMUsgPSBzLnBvc2l0aW9uL21zZWNTY2FsZTtcclxuICAgICAgcy5fcmVzZXRPblBvc2l0aW9uKHMucG9zaXRpb24pO1xyXG4gICAgICBzLl9pTy5wb3NpdGlvbiA9IG9mZnNldDtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgIHBvc2l0aW9uID0gKGZWID09PSA5ID8gcy5wb3NpdGlvbiA6IHBvc2l0aW9uMUspO1xyXG5cclxuICAgICAgICBpZiAocy5yZWFkeVN0YXRlICYmIHMucmVhZHlTdGF0ZSAhPT0gMikge1xyXG4gICAgICAgICAgLy8gaWYgcGF1c2VkIG9yIG5vdCBwbGF5aW5nLCB3aWxsIG5vdCByZXN1bWUgKGJ5IHBsYXlpbmcpXHJcbiAgICAgICAgICBmbGFzaC5fc2V0UG9zaXRpb24ocy5pZCwgcG9zaXRpb24sIChzLnBhdXNlZCB8fCAhcy5wbGF5U3RhdGUpLCBzLl9pTy5tdWx0aVNob3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSBpZiAocy5fYSkge1xyXG5cclxuICAgICAgICAvLyBTZXQgdGhlIHBvc2l0aW9uIGluIHRoZSBjYW5wbGF5IGhhbmRsZXIgaWYgdGhlIHNvdW5kIGlzIG5vdCByZWFkeSB5ZXRcclxuICAgICAgICBpZiAocy5faHRtbDVfY2FucGxheSkge1xyXG5cclxuICAgICAgICAgIGlmIChzLl9hLmN1cnJlbnRUaW1lICE9PSBwb3NpdGlvbjFLKSB7XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogRE9NL0pTIGVycm9ycy9leGNlcHRpb25zIHRvIHdhdGNoIG91dCBmb3I6XHJcbiAgICAgICAgICAgICAqIGlmIHNlZWsgaXMgYmV5b25kIChsb2FkZWQ/KSBwb3NpdGlvbiwgXCJET00gZXhjZXB0aW9uIDExXCJcclxuICAgICAgICAgICAgICogXCJJTkRFWF9TSVpFX0VSUlwiOiBET00gZXhjZXB0aW9uIDFcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IHNldFBvc2l0aW9uKCcgKyBwb3NpdGlvbjFLICsgJyknKTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgcy5fYS5jdXJyZW50VGltZSA9IHBvc2l0aW9uMUs7XHJcbiAgICAgICAgICAgICAgaWYgKHMucGxheVN0YXRlID09PSAwIHx8IHMucGF1c2VkKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhbGxvdyBzZWVrIHdpdGhvdXQgYXV0by1wbGF5L3Jlc3VtZVxyXG4gICAgICAgICAgICAgICAgcy5fYS5wYXVzZSgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgICAgICAgc20yLl93RChzLmlkICsgJzogc2V0UG9zaXRpb24oJyArIHBvc2l0aW9uMUsgKyAnKSBmYWlsZWQ6ICcgKyBlLm1lc3NhZ2UsIDIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uMUspIHtcclxuXHJcbiAgICAgICAgICAvLyB3YXJuIG9uIG5vbi16ZXJvIHNlZWsgYXR0ZW1wdHNcclxuICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IHNldFBvc2l0aW9uKCcgKyBwb3NpdGlvbjFLICsgJyk6IENhbm5vdCBzZWVrIHlldCwgc291bmQgbm90IHJlYWR5JywgMik7XHJcbiAgICAgICAgICByZXR1cm4gcztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocy5wYXVzZWQpIHtcclxuXHJcbiAgICAgICAgICAvLyBpZiBwYXVzZWQsIHJlZnJlc2ggVUkgcmlnaHQgYXdheSBieSBmb3JjaW5nIHVwZGF0ZVxyXG4gICAgICAgICAgcy5fb25UaW1lcih0cnVlKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhdXNlcyBzb3VuZCBwbGF5YmFjay5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMucGF1c2UgPSBmdW5jdGlvbihfYkNhbGxGbGFzaCkge1xyXG5cclxuICAgICAgaWYgKHMucGF1c2VkIHx8IChzLnBsYXlTdGF0ZSA9PT0gMCAmJiBzLnJlYWR5U3RhdGUgIT09IDEpKSB7XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IHBhdXNlKCknKTtcclxuICAgICAgcy5wYXVzZWQgPSB0cnVlO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBpZiAoX2JDYWxsRmxhc2ggfHwgX2JDYWxsRmxhc2ggPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICAgIGZsYXNoLl9wYXVzZShzLmlkLCBzLl9pTy5tdWx0aVNob3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzLl9zZXR1cF9odG1sNSgpLnBhdXNlKCk7XHJcbiAgICAgICAgc3RvcF9odG1sNV90aW1lcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocy5faU8ub25wYXVzZSkge1xyXG4gICAgICAgIHMuX2lPLm9ucGF1c2UuYXBwbHkocyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXN1bWVzIHNvdW5kIHBsYXliYWNrLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGVuIGF1dG8tbG9hZGVkIHN0cmVhbXMgcGF1c2Ugb24gYnVmZmVyIGZ1bGwgdGhleSBoYXZlIGEgcGxheVN0YXRlIG9mIDAuXHJcbiAgICAgKiBXZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBwbGF5U3RhdGUgaXMgc2V0IHRvIDEgd2hlbiB0aGVzZSBzdHJlYW1zIFwicmVzdW1lXCIuXHJcbiAgICAgKiBXaGVuIGEgcGF1c2VkIHN0cmVhbSBpcyByZXN1bWVkLCB3ZSBuZWVkIHRvIHRyaWdnZXIgdGhlIG9ucGxheSgpIGNhbGxiYWNrIGlmIGl0XHJcbiAgICAgKiBoYXNuJ3QgYmVlbiBjYWxsZWQgYWxyZWFkeS4gSW4gdGhpcyBjYXNlIHNpbmNlIHRoZSBzb3VuZCBpcyBiZWluZyBwbGF5ZWQgZm9yIHRoZVxyXG4gICAgICogZmlyc3QgdGltZSwgSSB0aGluayBpdCdzIG1vcmUgYXBwcm9wcmlhdGUgdG8gY2FsbCBvbnBsYXkoKSByYXRoZXIgdGhhbiBvbnJlc3VtZSgpLlxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5yZXN1bWUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuXHJcbiAgICAgIGlmICghcy5wYXVzZWQpIHtcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogcmVzdW1lKCknKTtcclxuICAgICAgcy5wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgcy5wbGF5U3RhdGUgPSAxO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy5pc01vdmllU3RhciAmJiAhaW5zdGFuY2VPcHRpb25zLnNlcnZlclVSTCkge1xyXG4gICAgICAgICAgLy8gQml6YXJyZSBXZWJraXQgYnVnIChDaHJvbWUgcmVwb3J0ZWQgdmlhIDh0cmFja3MuY29tIGR1ZGVzKTogQUFDIGNvbnRlbnQgcGF1c2VkIGZvciAzMCsgc2Vjb25kcyg/KSB3aWxsIG5vdCByZXN1bWUgd2l0aG91dCBhIHJlcG9zaXRpb24uXHJcbiAgICAgICAgICBzLnNldFBvc2l0aW9uKHMucG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gZmxhc2ggbWV0aG9kIGlzIHRvZ2dsZS1iYXNlZCAocGF1c2UvcmVzdW1lKVxyXG4gICAgICAgIGZsYXNoLl9wYXVzZShzLmlkLCBpbnN0YW5jZU9wdGlvbnMubXVsdGlTaG90KTtcclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIHMuX3NldHVwX2h0bWw1KCkucGxheSgpO1xyXG4gICAgICAgIHN0YXJ0X2h0bWw1X3RpbWVyKCk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIW9ucGxheV9jYWxsZWQgJiYgaW5zdGFuY2VPcHRpb25zLm9ucGxheSkge1xyXG5cclxuICAgICAgICBpbnN0YW5jZU9wdGlvbnMub25wbGF5LmFwcGx5KHMpO1xyXG4gICAgICAgIG9ucGxheV9jYWxsZWQgPSB0cnVlO1xyXG5cclxuICAgICAgfSBlbHNlIGlmIChpbnN0YW5jZU9wdGlvbnMub25yZXN1bWUpIHtcclxuXHJcbiAgICAgICAgaW5zdGFuY2VPcHRpb25zLm9ucmVzdW1lLmFwcGx5KHMpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZXMgc291bmQgcGxheWJhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnRvZ2dsZVBhdXNlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiB0b2dnbGVQYXVzZSgpJyk7XHJcblxyXG4gICAgICBpZiAocy5wbGF5U3RhdGUgPT09IDApIHtcclxuICAgICAgICBzLnBsYXkoe1xyXG4gICAgICAgICAgcG9zaXRpb246IChmViA9PT0gOSAmJiAhcy5pc0hUTUw1ID8gcy5wb3NpdGlvbiA6IHMucG9zaXRpb24gLyBtc2VjU2NhbGUpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzLnBhdXNlZCkge1xyXG4gICAgICAgIHMucmVzdW1lKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcy5wYXVzZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgcGFubmluZyAoTC1SKSBlZmZlY3QuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5QYW4gVGhlIHBhbiB2YWx1ZSAoLTEwMCB0byAxMDApXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuc2V0UGFuID0gZnVuY3Rpb24oblBhbiwgYkluc3RhbmNlT25seSkge1xyXG5cclxuICAgICAgaWYgKG5QYW4gPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBuUGFuID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGJJbnN0YW5jZU9ubHkgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBiSW5zdGFuY2VPbmx5ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgZmxhc2guX3NldFBhbihzLmlkLCBuUGFuKTtcclxuICAgICAgfSAvLyBlbHNlIHsgbm8gSFRNTDUgcGFuPyB9XHJcblxyXG4gICAgICBzLl9pTy5wYW4gPSBuUGFuO1xyXG5cclxuICAgICAgaWYgKCFiSW5zdGFuY2VPbmx5KSB7XHJcbiAgICAgICAgcy5wYW4gPSBuUGFuO1xyXG4gICAgICAgIHMub3B0aW9ucy5wYW4gPSBuUGFuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgdm9sdW1lLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuVm9sIFRoZSB2b2x1bWUgdmFsdWUgKDAgdG8gMTAwKVxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnNldFZvbHVtZSA9IGZ1bmN0aW9uKG5Wb2wsIF9iSW5zdGFuY2VPbmx5KSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogTm90ZTogU2V0dGluZyB2b2x1bWUgaGFzIG5vIGVmZmVjdCBvbiBpT1MgXCJzcGVjaWFsIHNub3dmbGFrZVwiIGRldmljZXMuXHJcbiAgICAgICAqIEhhcmR3YXJlIHZvbHVtZSBjb250cm9sIG92ZXJyaWRlcyBzb2Z0d2FyZSwgYW5kIHZvbHVtZVxyXG4gICAgICAgKiB3aWxsIGFsd2F5cyByZXR1cm4gMSBwZXIgQXBwbGUgZG9jcy4gKGlPUyA0ICsgNS4pXHJcbiAgICAgICAqIGh0dHA6Ly9kZXZlbG9wZXIuYXBwbGUuY29tL2xpYnJhcnkvc2FmYXJpL2RvY3VtZW50YXRpb24vQXVkaW9WaWRlby9Db25jZXB0dWFsL0hUTUwtY2FudmFzLWd1aWRlL0FkZGluZ1NvdW5kdG9DYW52YXNBbmltYXRpb25zL0FkZGluZ1NvdW5kdG9DYW52YXNBbmltYXRpb25zLmh0bWxcclxuICAgICAgICovXHJcblxyXG4gICAgICBpZiAoblZvbCA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIG5Wb2wgPSAxMDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChfYkluc3RhbmNlT25seSA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIF9iSW5zdGFuY2VPbmx5ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgIGZsYXNoLl9zZXRWb2x1bWUocy5pZCwgKHNtMi5tdXRlZCAmJiAhcy5tdXRlZCkgfHwgcy5tdXRlZCA/IDAgOiBuVm9sKTtcclxuXHJcbiAgICAgIH0gZWxzZSBpZiAocy5fYSkge1xyXG5cclxuICAgICAgICBpZiAoc20yLm11dGVkICYmICFzLm11dGVkKSB7XHJcbiAgICAgICAgICBzLm11dGVkID0gdHJ1ZTtcclxuICAgICAgICAgIHMuX2EubXV0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdmFsaWQgcmFuZ2UgZm9yIG5hdGl2ZSBIVE1MNSBBdWRpbygpOiAwLTFcclxuICAgICAgICBzLl9hLnZvbHVtZSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIG5Wb2wvMTAwKSk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBzLl9pTy52b2x1bWUgPSBuVm9sO1xyXG5cclxuICAgICAgaWYgKCFfYkluc3RhbmNlT25seSkge1xyXG4gICAgICAgIHMudm9sdW1lID0gblZvbDtcclxuICAgICAgICBzLm9wdGlvbnMudm9sdW1lID0gblZvbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE11dGVzIHRoZSBzb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMubXV0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgcy5tdXRlZCA9IHRydWU7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGZsYXNoLl9zZXRWb2x1bWUocy5pZCwgMCk7XHJcbiAgICAgIH0gZWxzZSBpZiAocy5fYSkge1xyXG4gICAgICAgIHMuX2EubXV0ZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5tdXRlcyB0aGUgc291bmQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnVubXV0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgcy5tdXRlZCA9IGZhbHNlO1xyXG4gICAgICB2YXIgaGFzSU8gPSAocy5faU8udm9sdW1lICE9PSBfdW5kZWZpbmVkKTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgZmxhc2guX3NldFZvbHVtZShzLmlkLCBoYXNJTyA/IHMuX2lPLnZvbHVtZSA6IHMub3B0aW9ucy52b2x1bWUpO1xyXG4gICAgICB9IGVsc2UgaWYgKHMuX2EpIHtcclxuICAgICAgICBzLl9hLm11dGVkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb2dnbGVzIHRoZSBtdXRlZCBzdGF0ZSBvZiBhIHNvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy50b2dnbGVNdXRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICByZXR1cm4gKHMubXV0ZWQgPyBzLnVubXV0ZSgpIDogcy5tdXRlKCkpO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBmaXJlZCB3aGVuIGEgc291bmQgcmVhY2hlcyBhIGdpdmVuIHBvc2l0aW9uIGR1cmluZyBwbGF5YmFjay5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gblBvc2l0aW9uIFRoZSBwb3NpdGlvbiB0byB3YXRjaCBmb3JcclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9NZXRob2QgVGhlIHJlbGV2YW50IGNhbGxiYWNrIHRvIGZpcmVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvU2NvcGUgT3B0aW9uYWw6IFRoZSBzY29wZSB0byBhcHBseSB0aGUgY2FsbGJhY2sgdG9cclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5vblBvc2l0aW9uID0gZnVuY3Rpb24oblBvc2l0aW9uLCBvTWV0aG9kLCBvU2NvcGUpIHtcclxuXHJcbiAgICAgIC8vIFRPRE86IGJhc2ljIGR1cGUgY2hlY2tpbmc/XHJcblxyXG4gICAgICBvblBvc2l0aW9uSXRlbXMucHVzaCh7XHJcbiAgICAgICAgcG9zaXRpb246IHBhcnNlSW50KG5Qb3NpdGlvbiwgMTApLFxyXG4gICAgICAgIG1ldGhvZDogb01ldGhvZCxcclxuICAgICAgICBzY29wZTogKG9TY29wZSAhPT0gX3VuZGVmaW5lZCA/IG9TY29wZSA6IHMpLFxyXG4gICAgICAgIGZpcmVkOiBmYWxzZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLy8gbGVnYWN5L2JhY2t3YXJkcy1jb21wYWJpbGl0eTogbG93ZXItY2FzZSBtZXRob2QgbmFtZVxyXG4gICAgdGhpcy5vbnBvc2l0aW9uID0gdGhpcy5vblBvc2l0aW9uO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyByZWdpc3RlcmVkIGNhbGxiYWNrKHMpIGZyb20gYSBzb3VuZCwgYnkgcG9zaXRpb24gYW5kL29yIGNhbGxiYWNrLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuUG9zaXRpb24gVGhlIHBvc2l0aW9uIHRvIGNsZWFyIGNhbGxiYWNrKHMpIGZvclxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb01ldGhvZCBPcHRpb25hbDogSWRlbnRpZnkgb25lIGNhbGxiYWNrIHRvIGJlIHJlbW92ZWQgd2hlbiBtdWx0aXBsZSBsaXN0ZW5lcnMgZXhpc3QgZm9yIG9uZSBwb3NpdGlvblxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLmNsZWFyT25Qb3NpdGlvbiA9IGZ1bmN0aW9uKG5Qb3NpdGlvbiwgb01ldGhvZCkge1xyXG5cclxuICAgICAgdmFyIGk7XHJcblxyXG4gICAgICBuUG9zaXRpb24gPSBwYXJzZUludChuUG9zaXRpb24sIDEwKTtcclxuXHJcbiAgICAgIGlmIChpc05hTihuUG9zaXRpb24pKSB7XHJcbiAgICAgICAgLy8gc2FmZXR5IGNoZWNrXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGk9MDsgaSA8IG9uUG9zaXRpb25JdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICBpZiAoblBvc2l0aW9uID09PSBvblBvc2l0aW9uSXRlbXNbaV0ucG9zaXRpb24pIHtcclxuICAgICAgICAgIC8vIHJlbW92ZSB0aGlzIGl0ZW0gaWYgbm8gbWV0aG9kIHdhcyBzcGVjaWZpZWQsIG9yLCBpZiB0aGUgbWV0aG9kIG1hdGNoZXNcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKCFvTWV0aG9kIHx8IChvTWV0aG9kID09PSBvblBvc2l0aW9uSXRlbXNbaV0ubWV0aG9kKSkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKG9uUG9zaXRpb25JdGVtc1tpXS5maXJlZCkge1xyXG4gICAgICAgICAgICAgIC8vIGRlY3JlbWVudCBcImZpcmVkXCIgY291bnRlciwgdG9vXHJcbiAgICAgICAgICAgICAgb25Qb3NpdGlvbkZpcmVkLS07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIG9uUG9zaXRpb25JdGVtcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9wcm9jZXNzT25Qb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIGksIGl0ZW0sIGogPSBvblBvc2l0aW9uSXRlbXMubGVuZ3RoO1xyXG5cclxuICAgICAgaWYgKCFqIHx8ICFzLnBsYXlTdGF0ZSB8fCBvblBvc2l0aW9uRmlyZWQgPj0gaikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChpID0gaiAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaXRlbSA9IG9uUG9zaXRpb25JdGVtc1tpXTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoIWl0ZW0uZmlyZWQgJiYgcy5wb3NpdGlvbiA+PSBpdGVtLnBvc2l0aW9uKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICBpdGVtLmZpcmVkID0gdHJ1ZTtcclxuICAgICAgICAgIG9uUG9zaXRpb25GaXJlZCsrO1xyXG4gICAgICAgICAgaXRlbS5tZXRob2QuYXBwbHkoaXRlbS5zY29wZSwgW2l0ZW0ucG9zaXRpb25dKTtcclxuICAgICAgICBcclxuICAgICAgICAgIC8vICByZXNldCBqIC0tIG9uUG9zaXRpb25JdGVtcy5sZW5ndGggY2FuIGJlIGNoYW5nZWQgaW4gdGhlIGl0ZW0gY2FsbGJhY2sgYWJvdmUuLi4gb2NjYXNpb25hbGx5IGJyZWFraW5nIHRoZSBsb29wLlxyXG5cdFx0ICAgICAgaiA9IG9uUG9zaXRpb25JdGVtcy5sZW5ndGg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICBcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9yZXNldE9uUG9zaXRpb24gPSBmdW5jdGlvbihuUG9zaXRpb24pIHtcclxuXHJcbiAgICAgIC8vIHJlc2V0IFwiZmlyZWRcIiBmb3IgaXRlbXMgaW50ZXJlc3RlZCBpbiB0aGlzIHBvc2l0aW9uXHJcbiAgICAgIHZhciBpLCBpdGVtLCBqID0gb25Qb3NpdGlvbkl0ZW1zLmxlbmd0aDtcclxuXHJcbiAgICAgIGlmICghaikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChpID0gaiAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaXRlbSA9IG9uUG9zaXRpb25JdGVtc1tpXTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoaXRlbS5maXJlZCAmJiBuUG9zaXRpb24gPD0gaXRlbS5wb3NpdGlvbikge1xyXG4gICAgICAgICAgaXRlbS5maXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgb25Qb3NpdGlvbkZpcmVkLS07XHJcbiAgICAgICAgfVxyXG4gICAgICBcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNNU291bmQoKSBwcml2YXRlIGludGVybmFsc1xyXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAqL1xyXG5cclxuICAgIGFwcGx5RnJvbVRvID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gcy5faU8sXHJcbiAgICAgICAgICBmID0gaW5zdGFuY2VPcHRpb25zLmZyb20sXHJcbiAgICAgICAgICB0ID0gaW5zdGFuY2VPcHRpb25zLnRvLFxyXG4gICAgICAgICAgc3RhcnQsIGVuZDtcclxuXHJcbiAgICAgIGVuZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAvLyBlbmQgaGFzIGJlZW4gcmVhY2hlZC5cclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBcIlRvXCIgdGltZSBvZiAnICsgdCArICcgcmVhY2hlZC4nKTtcclxuXHJcbiAgICAgICAgLy8gZGV0YWNoIGxpc3RlbmVyXHJcbiAgICAgICAgcy5jbGVhck9uUG9zaXRpb24odCwgZW5kKTtcclxuXHJcbiAgICAgICAgLy8gc3RvcCBzaG91bGQgY2xlYXIgdGhpcywgdG9vXHJcbiAgICAgICAgcy5zdG9wKCk7XHJcblxyXG4gICAgICB9O1xyXG5cclxuICAgICAgc3RhcnQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogUGxheWluZyBcImZyb21cIiAnICsgZik7XHJcblxyXG4gICAgICAgIC8vIGFkZCBsaXN0ZW5lciBmb3IgZW5kXHJcbiAgICAgICAgaWYgKHQgIT09IG51bGwgJiYgIWlzTmFOKHQpKSB7XHJcbiAgICAgICAgICBzLm9uUG9zaXRpb24odCwgZW5kKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9O1xyXG5cclxuICAgICAgaWYgKGYgIT09IG51bGwgJiYgIWlzTmFOKGYpKSB7XHJcblxyXG4gICAgICAgIC8vIGFwcGx5IHRvIGluc3RhbmNlIG9wdGlvbnMsIGd1YXJhbnRlZWluZyBjb3JyZWN0IHN0YXJ0IHBvc2l0aW9uLlxyXG4gICAgICAgIGluc3RhbmNlT3B0aW9ucy5wb3NpdGlvbiA9IGY7XHJcblxyXG4gICAgICAgIC8vIG11bHRpU2hvdCB0aW1pbmcgY2FuJ3QgYmUgdHJhY2tlZCwgc28gcHJldmVudCB0aGF0LlxyXG4gICAgICAgIGluc3RhbmNlT3B0aW9ucy5tdWx0aVNob3QgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgc3RhcnQoKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJldHVybiB1cGRhdGVkIGluc3RhbmNlT3B0aW9ucyBpbmNsdWRpbmcgc3RhcnRpbmcgcG9zaXRpb25cclxuICAgICAgcmV0dXJuIGluc3RhbmNlT3B0aW9ucztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGF0dGFjaE9uUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBpdGVtLFxyXG4gICAgICAgICAgb3AgPSBzLl9pTy5vbnBvc2l0aW9uO1xyXG5cclxuICAgICAgLy8gYXR0YWNoIG9ucG9zaXRpb24gdGhpbmdzLCBpZiBhbnksIG5vdy5cclxuXHJcbiAgICAgIGlmIChvcCkge1xyXG5cclxuICAgICAgICBmb3IgKGl0ZW0gaW4gb3ApIHtcclxuICAgICAgICAgIGlmIChvcC5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG4gICAgICAgICAgICBzLm9uUG9zaXRpb24ocGFyc2VJbnQoaXRlbSwgMTApLCBvcFtpdGVtXSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgZGV0YWNoT25Qb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIGl0ZW0sXHJcbiAgICAgICAgICBvcCA9IHMuX2lPLm9ucG9zaXRpb247XHJcblxyXG4gICAgICAvLyBkZXRhY2ggYW55IG9ucG9zaXRpb24oKS1zdHlsZSBsaXN0ZW5lcnMuXHJcblxyXG4gICAgICBpZiAob3ApIHtcclxuXHJcbiAgICAgICAgZm9yIChpdGVtIGluIG9wKSB7XHJcbiAgICAgICAgICBpZiAob3AuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuICAgICAgICAgICAgcy5jbGVhck9uUG9zaXRpb24ocGFyc2VJbnQoaXRlbSwgMTApKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBzdGFydF9odG1sNV90aW1lciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgaWYgKHMuaXNIVE1MNSkge1xyXG4gICAgICAgIHN0YXJ0VGltZXIocyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHN0b3BfaHRtbDVfdGltZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGlmIChzLmlzSFRNTDUpIHtcclxuICAgICAgICBzdG9wVGltZXIocyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHJlc2V0UHJvcGVydGllcyA9IGZ1bmN0aW9uKHJldGFpblBvc2l0aW9uKSB7XHJcblxyXG4gICAgICBpZiAoIXJldGFpblBvc2l0aW9uKSB7XHJcbiAgICAgICAgb25Qb3NpdGlvbkl0ZW1zID0gW107XHJcbiAgICAgICAgb25Qb3NpdGlvbkZpcmVkID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgb25wbGF5X2NhbGxlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgcy5faGFzVGltZXIgPSBudWxsO1xyXG4gICAgICBzLl9hID0gbnVsbDtcclxuICAgICAgcy5faHRtbDVfY2FucGxheSA9IGZhbHNlO1xyXG4gICAgICBzLmJ5dGVzTG9hZGVkID0gbnVsbDtcclxuICAgICAgcy5ieXRlc1RvdGFsID0gbnVsbDtcclxuICAgICAgcy5kdXJhdGlvbiA9IChzLl9pTyAmJiBzLl9pTy5kdXJhdGlvbiA/IHMuX2lPLmR1cmF0aW9uIDogbnVsbCk7XHJcbiAgICAgIHMuZHVyYXRpb25Fc3RpbWF0ZSA9IG51bGw7XHJcbiAgICAgIHMuYnVmZmVyZWQgPSBbXTtcclxuXHJcbiAgICAgIC8vIGxlZ2FjeTogMUQgYXJyYXlcclxuICAgICAgcy5lcURhdGEgPSBbXTtcclxuXHJcbiAgICAgIHMuZXFEYXRhLmxlZnQgPSBbXTtcclxuICAgICAgcy5lcURhdGEucmlnaHQgPSBbXTtcclxuXHJcbiAgICAgIHMuZmFpbHVyZXMgPSAwO1xyXG4gICAgICBzLmlzQnVmZmVyaW5nID0gZmFsc2U7XHJcbiAgICAgIHMuaW5zdGFuY2VPcHRpb25zID0ge307XHJcbiAgICAgIHMuaW5zdGFuY2VDb3VudCA9IDA7XHJcbiAgICAgIHMubG9hZGVkID0gZmFsc2U7XHJcbiAgICAgIHMubWV0YWRhdGEgPSB7fTtcclxuXHJcbiAgICAgIC8vIDAgPSB1bmluaXRpYWxpc2VkLCAxID0gbG9hZGluZywgMiA9IGZhaWxlZC9lcnJvciwgMyA9IGxvYWRlZC9zdWNjZXNzXHJcbiAgICAgIHMucmVhZHlTdGF0ZSA9IDA7XHJcblxyXG4gICAgICBzLm11dGVkID0gZmFsc2U7XHJcbiAgICAgIHMucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICBzLnBlYWtEYXRhID0ge1xyXG4gICAgICAgIGxlZnQ6IDAsXHJcbiAgICAgICAgcmlnaHQ6IDBcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHMud2F2ZWZvcm1EYXRhID0ge1xyXG4gICAgICAgIGxlZnQ6IFtdLFxyXG4gICAgICAgIHJpZ2h0OiBbXVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgcy5wbGF5U3RhdGUgPSAwO1xyXG4gICAgICBzLnBvc2l0aW9uID0gbnVsbDtcclxuXHJcbiAgICAgIHMuaWQzID0ge307XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICByZXNldFByb3BlcnRpZXMoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBzZXVkby1wcml2YXRlIFNNU291bmQgaW50ZXJuYWxzXHJcbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5fb25UaW1lciA9IGZ1bmN0aW9uKGJGb3JjZSkge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhUTUw1LW9ubHkgX3doaWxlcGxheWluZygpIGV0Yy5cclxuICAgICAgICogY2FsbGVkIGZyb20gYm90aCBIVE1MNSBuYXRpdmUgZXZlbnRzLCBhbmQgcG9sbGluZy9pbnRlcnZhbC1iYXNlZCB0aW1lcnNcclxuICAgICAgICogbWltaWNzIGZsYXNoIGFuZCBmaXJlcyBvbmx5IHdoZW4gdGltZS9kdXJhdGlvbiBjaGFuZ2UsIHNvIGFzIHRvIGJlIHBvbGxpbmctZnJpZW5kbHlcclxuICAgICAgICovXHJcblxyXG4gICAgICB2YXIgZHVyYXRpb24sIGlzTmV3ID0gZmFsc2UsIHRpbWUsIHggPSB7fTtcclxuXHJcbiAgICAgIGlmIChzLl9oYXNUaW1lciB8fCBiRm9yY2UpIHtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogTWF5IG5vdCBuZWVkIHRvIHRyYWNrIHJlYWR5U3RhdGUgKDEgPSBsb2FkaW5nKVxyXG5cclxuICAgICAgICBpZiAocy5fYSAmJiAoYkZvcmNlIHx8ICgocy5wbGF5U3RhdGUgPiAwIHx8IHMucmVhZHlTdGF0ZSA9PT0gMSkgJiYgIXMucGF1c2VkKSkpIHtcclxuXHJcbiAgICAgICAgICBkdXJhdGlvbiA9IHMuX2dldF9odG1sNV9kdXJhdGlvbigpO1xyXG5cclxuICAgICAgICAgIGlmIChkdXJhdGlvbiAhPT0gbGFzdEhUTUw1U3RhdGUuZHVyYXRpb24pIHtcclxuXHJcbiAgICAgICAgICAgIGxhc3RIVE1MNVN0YXRlLmR1cmF0aW9uID0gZHVyYXRpb247XHJcbiAgICAgICAgICAgIHMuZHVyYXRpb24gPSBkdXJhdGlvbjtcclxuICAgICAgICAgICAgaXNOZXcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBUT0RPOiBpbnZlc3RpZ2F0ZSB3aHkgdGhpcyBnb2VzIHdhY2sgaWYgbm90IHNldC9yZS1zZXQgZWFjaCB0aW1lLlxyXG4gICAgICAgICAgcy5kdXJhdGlvbkVzdGltYXRlID0gcy5kdXJhdGlvbjtcclxuXHJcbiAgICAgICAgICB0aW1lID0gKHMuX2EuY3VycmVudFRpbWUgKiBtc2VjU2NhbGUgfHwgMCk7XHJcblxyXG4gICAgICAgICAgaWYgKHRpbWUgIT09IGxhc3RIVE1MNVN0YXRlLnRpbWUpIHtcclxuXHJcbiAgICAgICAgICAgIGxhc3RIVE1MNVN0YXRlLnRpbWUgPSB0aW1lO1xyXG4gICAgICAgICAgICBpc05ldyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChpc05ldyB8fCBiRm9yY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHMuX3doaWxlcGxheWluZyh0aW1lLCB4LCB4LCB4LCB4KTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0vKiBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBzbTIuX3dEKCdfb25UaW1lcjogV2FybiBmb3IgXCInK3MuaWQrJ1wiOiAnKyghcy5fYT8nQ291bGQgbm90IGZpbmQgZWxlbWVudC4gJzonJykrKHMucGxheVN0YXRlID09PSAwPydwbGF5U3RhdGUgYmFkLCAwPyc6J3BsYXlTdGF0ZSA9ICcrcy5wbGF5U3RhdGUrJywgT0snKSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgcmV0dXJuIGlzTmV3O1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fZ2V0X2h0bWw1X2R1cmF0aW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gcy5faU8sXHJcbiAgICAgICAgICAvLyBpZiBhdWRpbyBvYmplY3QgZXhpc3RzLCB1c2UgaXRzIGR1cmF0aW9uIC0gZWxzZSwgaW5zdGFuY2Ugb3B0aW9uIGR1cmF0aW9uIChpZiBwcm92aWRlZCAtIGl0J3MgYSBoYWNrLCByZWFsbHksIGFuZCBzaG91bGQgYmUgcmV0aXJlZCkgT1IgbnVsbFxyXG4gICAgICAgICAgZCA9IChzLl9hICYmIHMuX2EuZHVyYXRpb24gPyBzLl9hLmR1cmF0aW9uICogbXNlY1NjYWxlIDogKGluc3RhbmNlT3B0aW9ucyAmJiBpbnN0YW5jZU9wdGlvbnMuZHVyYXRpb24gPyBpbnN0YW5jZU9wdGlvbnMuZHVyYXRpb24gOiBudWxsKSksXHJcbiAgICAgICAgICByZXN1bHQgPSAoZCAmJiAhaXNOYU4oZCkgJiYgZCAhPT0gSW5maW5pdHkgPyBkIDogbnVsbCk7XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fYXBwbHlfbG9vcCA9IGZ1bmN0aW9uKGEsIG5Mb29wcykge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIGJvb2xlYW4gaW5zdGVhZCBvZiBcImxvb3BcIiwgZm9yIHdlYmtpdD8gLSBzcGVjIHNheXMgc3RyaW5nLiBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sLW1hcmt1cC9hdWRpby5odG1sI2F1ZGlvLmF0dHJzLmxvb3BcclxuICAgICAgICogbm90ZSB0aGF0IGxvb3AgaXMgZWl0aGVyIG9mZiBvciBpbmZpbml0ZSB1bmRlciBIVE1MNSwgdW5saWtlIEZsYXNoIHdoaWNoIGFsbG93cyBhcmJpdHJhcnkgbG9vcCBjb3VudHMgdG8gYmUgc3BlY2lmaWVkLlxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoIWEubG9vcCAmJiBuTG9vcHMgPiAxKSB7XHJcbiAgICAgICAgc20yLl93RCgnTm90ZTogTmF0aXZlIEhUTUw1IGxvb3BpbmcgaXMgaW5maW5pdGUuJywgMSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgYS5sb29wID0gKG5Mb29wcyA+IDEgPyAnbG9vcCcgOiAnJyk7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9zZXR1cF9odG1sNSA9IGZ1bmN0aW9uKG9PcHRpb25zKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gbWl4aW4ocy5faU8sIG9PcHRpb25zKSxcclxuICAgICAgICAgIGEgPSB1c2VHbG9iYWxIVE1MNUF1ZGlvID8gZ2xvYmFsSFRNTDVBdWRpbyA6IHMuX2EsXHJcbiAgICAgICAgICBkVVJMID0gZGVjb2RlVVJJKGluc3RhbmNlT3B0aW9ucy51cmwpLFxyXG4gICAgICAgICAgc2FtZVVSTDtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBcIkZpcnN0IHRoaW5ncyBmaXJzdCwgSSwgUG9wcGEuLi5cIiAocmVzZXQgdGhlIHByZXZpb3VzIHN0YXRlIG9mIHRoZSBvbGQgc291bmQsIGlmIHBsYXlpbmcpXHJcbiAgICAgICAqIEZpeGVzIGNhc2Ugd2l0aCBkZXZpY2VzIHRoYXQgY2FuIG9ubHkgcGxheSBvbmUgc291bmQgYXQgYSB0aW1lXHJcbiAgICAgICAqIE90aGVyd2lzZSwgb3RoZXIgc291bmRzIGluIG1pZC1wbGF5IHdpbGwgYmUgdGVybWluYXRlZCB3aXRob3V0IHdhcm5pbmcgYW5kIGluIGEgc3R1Y2sgc3RhdGVcclxuICAgICAgICovXHJcblxyXG4gICAgICBpZiAodXNlR2xvYmFsSFRNTDVBdWRpbykge1xyXG5cclxuICAgICAgICBpZiAoZFVSTCA9PT0gZGVjb2RlVVJJKGxhc3RHbG9iYWxIVE1MNVVSTCkpIHtcclxuICAgICAgICAgIC8vIGdsb2JhbCBIVE1MNSBhdWRpbzogcmUtdXNlIG9mIFVSTFxyXG4gICAgICAgICAgc2FtZVVSTCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIGlmIChkVVJMID09PSBkZWNvZGVVUkkobGFzdFVSTCkpIHtcclxuXHJcbiAgICAgICAgLy8gb3B0aW9ucyBVUkwgaXMgdGhlIHNhbWUgYXMgdGhlIFwibGFzdFwiIFVSTCwgYW5kIHdlIHVzZWQgKGxvYWRlZCkgaXRcclxuICAgICAgICBzYW1lVVJMID0gdHJ1ZTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhKSB7XHJcblxyXG4gICAgICAgIGlmIChhLl9zKSB7XHJcblxyXG4gICAgICAgICAgaWYgKHVzZUdsb2JhbEhUTUw1QXVkaW8pIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChhLl9zICYmIGEuX3MucGxheVN0YXRlICYmICFzYW1lVVJMKSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIGdsb2JhbCBIVE1MNSBhdWRpbyBjYXNlLCBhbmQgbG9hZGluZyBhIG5ldyBVUkwuIHN0b3AgdGhlIGN1cnJlbnRseS1wbGF5aW5nIG9uZS5cclxuICAgICAgICAgICAgICBhLl9zLnN0b3AoKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCF1c2VHbG9iYWxIVE1MNUF1ZGlvICYmIGRVUkwgPT09IGRlY29kZVVSSShsYXN0VVJMKSkge1xyXG5cclxuICAgICAgICAgICAgLy8gbm9uLWdsb2JhbCBIVE1MNSByZXVzZSBjYXNlOiBzYW1lIHVybCwgaWdub3JlIHJlcXVlc3RcclxuICAgICAgICAgICAgcy5fYXBwbHlfbG9vcChhLCBpbnN0YW5jZU9wdGlvbnMubG9vcHMpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGE7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc2FtZVVSTCkge1xyXG5cclxuICAgICAgICAgIC8vIGRvbid0IHJldGFpbiBvblBvc2l0aW9uKCkgc3R1ZmYgd2l0aCBuZXcgVVJMcy5cclxuXHJcbiAgICAgICAgICBpZiAobGFzdFVSTCkge1xyXG4gICAgICAgICAgICByZXNldFByb3BlcnRpZXMoZmFsc2UpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGFzc2lnbiBuZXcgSFRNTDUgVVJMXHJcblxyXG4gICAgICAgICAgYS5zcmMgPSBpbnN0YW5jZU9wdGlvbnMudXJsO1xyXG5cclxuICAgICAgICAgIHMudXJsID0gaW5zdGFuY2VPcHRpb25zLnVybDtcclxuXHJcbiAgICAgICAgICBsYXN0VVJMID0gaW5zdGFuY2VPcHRpb25zLnVybDtcclxuXHJcbiAgICAgICAgICBsYXN0R2xvYmFsSFRNTDVVUkwgPSBpbnN0YW5jZU9wdGlvbnMudXJsO1xyXG5cclxuICAgICAgICAgIGEuX2NhbGxlZF9sb2FkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMuYXV0b0xvYWQgfHwgaW5zdGFuY2VPcHRpb25zLmF1dG9QbGF5KSB7XHJcblxyXG4gICAgICAgICAgcy5fYSA9IG5ldyBBdWRpbyhpbnN0YW5jZU9wdGlvbnMudXJsKTtcclxuICAgICAgICAgIHMuX2EubG9hZCgpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIG51bGwgZm9yIHN0dXBpZCBPcGVyYSA5LjY0IGNhc2VcclxuICAgICAgICAgIHMuX2EgPSAoaXNPcGVyYSAmJiBvcGVyYS52ZXJzaW9uKCkgPCAxMCA/IG5ldyBBdWRpbyhudWxsKSA6IG5ldyBBdWRpbygpKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBhc3NpZ24gbG9jYWwgcmVmZXJlbmNlXHJcbiAgICAgICAgYSA9IHMuX2E7XHJcblxyXG4gICAgICAgIGEuX2NhbGxlZF9sb2FkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICh1c2VHbG9iYWxIVE1MNUF1ZGlvKSB7XHJcblxyXG4gICAgICAgICAgZ2xvYmFsSFRNTDVBdWRpbyA9IGE7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMuaXNIVE1MNSA9IHRydWU7XHJcblxyXG4gICAgICAvLyBzdG9yZSBhIHJlZiBvbiB0aGUgdHJhY2tcclxuICAgICAgcy5fYSA9IGE7XHJcblxyXG4gICAgICAvLyBzdG9yZSBhIHJlZiBvbiB0aGUgYXVkaW9cclxuICAgICAgYS5fcyA9IHM7XHJcblxyXG4gICAgICBhZGRfaHRtbDVfZXZlbnRzKCk7XHJcblxyXG4gICAgICBzLl9hcHBseV9sb29wKGEsIGluc3RhbmNlT3B0aW9ucy5sb29wcyk7XHJcblxyXG4gICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLmF1dG9Mb2FkIHx8IGluc3RhbmNlT3B0aW9ucy5hdXRvUGxheSkge1xyXG5cclxuICAgICAgICBzLmxvYWQoKTtcclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIGVhcmx5IEhUTUw1IGltcGxlbWVudGF0aW9uIChub24tc3RhbmRhcmQpXHJcbiAgICAgICAgYS5hdXRvYnVmZmVyID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIHN0YW5kYXJkICgnbm9uZScgaXMgYWxzbyBhbiBvcHRpb24uKVxyXG4gICAgICAgIGEucHJlbG9hZCA9ICdhdXRvJztcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBhO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgYWRkX2h0bWw1X2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgaWYgKHMuX2EuX2FkZGVkX2V2ZW50cykge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGY7XHJcblxyXG4gICAgICBmdW5jdGlvbiBhZGQob0V2dCwgb0ZuLCBiQ2FwdHVyZSkge1xyXG4gICAgICAgIHJldHVybiBzLl9hID8gcy5fYS5hZGRFdmVudExpc3RlbmVyKG9FdnQsIG9GbiwgYkNhcHR1cmUgfHwgZmFsc2UpIDogbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcy5fYS5fYWRkZWRfZXZlbnRzID0gdHJ1ZTtcclxuXHJcbiAgICAgIGZvciAoZiBpbiBodG1sNV9ldmVudHMpIHtcclxuICAgICAgICBpZiAoaHRtbDVfZXZlbnRzLmhhc093blByb3BlcnR5KGYpKSB7XHJcbiAgICAgICAgICBhZGQoZiwgaHRtbDVfZXZlbnRzW2ZdKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgcmVtb3ZlX2h0bWw1X2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVyc1xyXG5cclxuICAgICAgdmFyIGY7XHJcblxyXG4gICAgICBmdW5jdGlvbiByZW1vdmUob0V2dCwgb0ZuLCBiQ2FwdHVyZSkge1xyXG4gICAgICAgIHJldHVybiAocy5fYSA/IHMuX2EucmVtb3ZlRXZlbnRMaXN0ZW5lcihvRXZ0LCBvRm4sIGJDYXB0dXJlIHx8IGZhbHNlKSA6IG51bGwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBSZW1vdmluZyBldmVudCBsaXN0ZW5lcnMnKTtcclxuICAgICAgcy5fYS5fYWRkZWRfZXZlbnRzID0gZmFsc2U7XHJcblxyXG4gICAgICBmb3IgKGYgaW4gaHRtbDVfZXZlbnRzKSB7XHJcbiAgICAgICAgaWYgKGh0bWw1X2V2ZW50cy5oYXNPd25Qcm9wZXJ0eShmKSkge1xyXG4gICAgICAgICAgcmVtb3ZlKGYsIGh0bWw1X2V2ZW50c1tmXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBzZXVkby1wcml2YXRlIGV2ZW50IGludGVybmFsc1xyXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLl9vbmxvYWQgPSBmdW5jdGlvbihuU3VjY2Vzcykge1xyXG5cclxuICAgICAgdmFyIGZOLFxyXG4gICAgICAgICAgLy8gY2hlY2sgZm9yIGR1cmF0aW9uIHRvIHByZXZlbnQgZmFsc2UgcG9zaXRpdmVzIGZyb20gZmxhc2ggOCB3aGVuIGxvYWRpbmcgZnJvbSBjYWNoZS5cclxuICAgICAgICAgIGxvYWRPSyA9ICEhblN1Y2Nlc3MgfHwgKCFzLmlzSFRNTDUgJiYgZlYgPT09IDggJiYgcy5kdXJhdGlvbik7XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgZk4gPSBzLmlkICsgJzogJztcclxuICAgICAgc20yLl93RChmTiArIChsb2FkT0sgPyAnb25sb2FkKCknIDogJ0ZhaWxlZCB0byBsb2FkIC8gaW52YWxpZCBzb3VuZD8nICsgKCFzLmR1cmF0aW9uID8gJyBaZXJvLWxlbmd0aCBkdXJhdGlvbiByZXBvcnRlZC4nIDogJyAtJykgKyAnICgnICsgcy51cmwgKyAnKScpLCAobG9hZE9LID8gMSA6IDIpKTtcclxuXHJcbiAgICAgIGlmICghbG9hZE9LICYmICFzLmlzSFRNTDUpIHtcclxuICAgICAgICBpZiAoc20yLnNhbmRib3gubm9SZW1vdGUgPT09IHRydWUpIHtcclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyBzdHIoJ25vTmV0JyksIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc20yLnNhbmRib3gubm9Mb2NhbCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgc20yLl93RChmTiArIHN0cignbm9Mb2NhbCcpLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgcy5sb2FkZWQgPSBsb2FkT0s7XHJcbiAgICAgIHMucmVhZHlTdGF0ZSA9IChsb2FkT0sgPyAzIDogMik7XHJcbiAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDApO1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9ubG9hZCkge1xyXG4gICAgICAgIHdyYXBDYWxsYmFjayhzLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHMuX2lPLm9ubG9hZC5hcHBseShzLCBbbG9hZE9LXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fb25idWZmZXJjaGFuZ2UgPSBmdW5jdGlvbihuSXNCdWZmZXJpbmcpIHtcclxuXHJcbiAgICAgIGlmIChzLnBsYXlTdGF0ZSA9PT0gMCkge1xyXG4gICAgICAgIC8vIGlnbm9yZSBpZiBub3QgcGxheWluZ1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKChuSXNCdWZmZXJpbmcgJiYgcy5pc0J1ZmZlcmluZykgfHwgKCFuSXNCdWZmZXJpbmcgJiYgIXMuaXNCdWZmZXJpbmcpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzLmlzQnVmZmVyaW5nID0gKG5Jc0J1ZmZlcmluZyA9PT0gMSk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAocy5faU8ub25idWZmZXJjaGFuZ2UpIHtcclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBCdWZmZXIgc3RhdGUgY2hhbmdlOiAnICsgbklzQnVmZmVyaW5nKTtcclxuICAgICAgICBzLl9pTy5vbmJ1ZmZlcmNoYW5nZS5hcHBseShzLCBbbklzQnVmZmVyaW5nXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQbGF5YmFjayBtYXkgaGF2ZSBzdG9wcGVkIGR1ZSB0byBidWZmZXJpbmcsIG9yIHJlbGF0ZWQgcmVhc29uLlxyXG4gICAgICogVGhpcyBzdGF0ZSBjYW4gYmUgZW5jb3VudGVyZWQgb24gaU9TIDwgNiB3aGVuIGF1dG8tcGxheSBpcyBibG9ja2VkLlxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5fb25zdXNwZW5kID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBpZiAocy5faU8ub25zdXNwZW5kKSB7XHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogUGxheWJhY2sgc3VzcGVuZGVkJyk7XHJcbiAgICAgICAgcy5faU8ub25zdXNwZW5kLmFwcGx5KHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmxhc2ggOS9tb3ZpZVN0YXIgKyBSVE1QLW9ubHkgbWV0aG9kLCBzaG91bGQgZmlyZSBvbmx5IG9uY2UgYXQgbW9zdFxyXG4gICAgICogYXQgdGhpcyBwb2ludCB3ZSBqdXN0IHJlY3JlYXRlIGZhaWxlZCBzb3VuZHMgcmF0aGVyIHRoYW4gdHJ5aW5nIHRvIHJlY29ubmVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5fb25mYWlsdXJlID0gZnVuY3Rpb24obXNnLCBsZXZlbCwgY29kZSkge1xyXG5cclxuICAgICAgcy5mYWlsdXJlcysrO1xyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBGYWlsdXJlICgnICsgcy5mYWlsdXJlcyArICcpOiAnICsgbXNnKTtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbmZhaWx1cmUgJiYgcy5mYWlsdXJlcyA9PT0gMSkge1xyXG4gICAgICAgIHMuX2lPLm9uZmFpbHVyZShtc2csIGxldmVsLCBjb2RlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBJZ25vcmluZyBmYWlsdXJlJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmxhc2ggOS9tb3ZpZVN0YXIgKyBSVE1QLW9ubHkgbWV0aG9kIGZvciB1bmhhbmRsZWQgd2FybmluZ3MvZXhjZXB0aW9ucyBmcm9tIEZsYXNoXHJcbiAgICAgKiBlLmcuLCBSVE1QIFwibWV0aG9kIG1pc3NpbmdcIiB3YXJuaW5nIChub24tZmF0YWwpIGZvciBnZXRTdHJlYW1MZW5ndGggb24gc2VydmVyXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLl9vbndhcm5pbmcgPSBmdW5jdGlvbihtc2csIGxldmVsLCBjb2RlKSB7XHJcblxyXG4gICAgICBpZiAocy5faU8ub253YXJuaW5nKSB7XHJcbiAgICAgICAgcy5faU8ub253YXJuaW5nKG1zZywgbGV2ZWwsIGNvZGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9vbmZpbmlzaCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgLy8gc3RvcmUgbG9jYWwgY29weSBiZWZvcmUgaXQgZ2V0cyB0cmFzaGVkLi4uXHJcbiAgICAgIHZhciBpb19vbmZpbmlzaCA9IHMuX2lPLm9uZmluaXNoO1xyXG5cclxuICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcbiAgICAgIHMuX3Jlc2V0T25Qb3NpdGlvbigwKTtcclxuXHJcbiAgICAgIC8vIHJlc2V0IHNvbWUgc3RhdGUgaXRlbXNcclxuICAgICAgaWYgKHMuaW5zdGFuY2VDb3VudCkge1xyXG5cclxuICAgICAgICBzLmluc3RhbmNlQ291bnQtLTtcclxuXHJcbiAgICAgICAgaWYgKCFzLmluc3RhbmNlQ291bnQpIHtcclxuXHJcbiAgICAgICAgICAvLyByZW1vdmUgb25Qb3NpdGlvbiBsaXN0ZW5lcnMsIGlmIGFueVxyXG4gICAgICAgICAgZGV0YWNoT25Qb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgIC8vIHJlc2V0IGluc3RhbmNlIG9wdGlvbnNcclxuICAgICAgICAgIHMucGxheVN0YXRlID0gMDtcclxuICAgICAgICAgIHMucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgICBzLmluc3RhbmNlQ291bnQgPSAwO1xyXG4gICAgICAgICAgcy5pbnN0YW5jZU9wdGlvbnMgPSB7fTtcclxuICAgICAgICAgIHMuX2lPID0ge307XHJcbiAgICAgICAgICBzdG9wX2h0bWw1X3RpbWVyKCk7XHJcblxyXG4gICAgICAgICAgLy8gcmVzZXQgcG9zaXRpb24sIHRvb1xyXG4gICAgICAgICAgaWYgKHMuaXNIVE1MNSkge1xyXG4gICAgICAgICAgICBzLnBvc2l0aW9uID0gMDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXMuaW5zdGFuY2VDb3VudCB8fCBzLl9pTy5tdWx0aVNob3RFdmVudHMpIHtcclxuICAgICAgICAgIC8vIGZpcmUgb25maW5pc2ggZm9yIGxhc3QsIG9yIGV2ZXJ5IGluc3RhbmNlXHJcbiAgICAgICAgICBpZiAoaW9fb25maW5pc2gpIHtcclxuICAgICAgICAgICAgc20yLl93RChzLmlkICsgJzogb25maW5pc2goKScpO1xyXG4gICAgICAgICAgICB3cmFwQ2FsbGJhY2socywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgaW9fb25maW5pc2guYXBwbHkocyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX3doaWxlbG9hZGluZyA9IGZ1bmN0aW9uKG5CeXRlc0xvYWRlZCwgbkJ5dGVzVG90YWwsIG5EdXJhdGlvbiwgbkJ1ZmZlckxlbmd0aCkge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG5cclxuICAgICAgcy5ieXRlc0xvYWRlZCA9IG5CeXRlc0xvYWRlZDtcclxuICAgICAgcy5ieXRlc1RvdGFsID0gbkJ5dGVzVG90YWw7XHJcbiAgICAgIHMuZHVyYXRpb24gPSBNYXRoLmZsb29yKG5EdXJhdGlvbik7XHJcbiAgICAgIHMuYnVmZmVyTGVuZ3RoID0gbkJ1ZmZlckxlbmd0aDtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1ICYmICFpbnN0YW5jZU9wdGlvbnMuaXNNb3ZpZVN0YXIpIHtcclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy5kdXJhdGlvbikge1xyXG4gICAgICAgICAgLy8gdXNlIGR1cmF0aW9uIGZyb20gb3B0aW9ucywgaWYgc3BlY2lmaWVkIGFuZCBsYXJnZXIuIG5vYm9keSBzaG91bGQgYmUgc3BlY2lmeWluZyBkdXJhdGlvbiBpbiBvcHRpb25zLCBhY3R1YWxseSwgYW5kIGl0IHNob3VsZCBiZSByZXRpcmVkLlxyXG4gICAgICAgICAgcy5kdXJhdGlvbkVzdGltYXRlID0gKHMuZHVyYXRpb24gPiBpbnN0YW5jZU9wdGlvbnMuZHVyYXRpb24pID8gcy5kdXJhdGlvbiA6IGluc3RhbmNlT3B0aW9ucy5kdXJhdGlvbjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcy5kdXJhdGlvbkVzdGltYXRlID0gcGFyc2VJbnQoKHMuYnl0ZXNUb3RhbCAvIHMuYnl0ZXNMb2FkZWQpICogcy5kdXJhdGlvbiwgMTApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIHMuZHVyYXRpb25Fc3RpbWF0ZSA9IHMuZHVyYXRpb247XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBmb3IgZmxhc2gsIHJlZmxlY3Qgc2VxdWVudGlhbC1sb2FkLXN0eWxlIGJ1ZmZlcmluZ1xyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIHMuYnVmZmVyZWQgPSBbe1xyXG4gICAgICAgICAgJ3N0YXJ0JzogMCxcclxuICAgICAgICAgICdlbmQnOiBzLmR1cmF0aW9uXHJcbiAgICAgICAgfV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGFsbG93IHdoaWxlbG9hZGluZyB0byBmaXJlIGV2ZW4gaWYgXCJsb2FkXCIgZmlyZWQgdW5kZXIgSFRNTDUsIGR1ZSB0byBIVFRQIHJhbmdlL3BhcnRpYWxzXHJcbiAgICAgIGlmICgocy5yZWFkeVN0YXRlICE9PSAzIHx8IHMuaXNIVE1MNSkgJiYgaW5zdGFuY2VPcHRpb25zLndoaWxlbG9hZGluZykge1xyXG4gICAgICAgIGluc3RhbmNlT3B0aW9ucy53aGlsZWxvYWRpbmcuYXBwbHkocyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX3doaWxlcGxheWluZyA9IGZ1bmN0aW9uKG5Qb3NpdGlvbiwgb1BlYWtEYXRhLCBvV2F2ZWZvcm1EYXRhTGVmdCwgb1dhdmVmb3JtRGF0YVJpZ2h0LCBvRVFEYXRhKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gcy5faU8sXHJcbiAgICAgICAgICBlcUxlZnQ7XHJcblxyXG4gICAgICBpZiAoaXNOYU4oblBvc2l0aW9uKSB8fCBuUG9zaXRpb24gPT09IG51bGwpIHtcclxuICAgICAgICAvLyBmbGFzaCBzYWZldHkgbmV0XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTYWZhcmkgSFRNTDUgcGxheSgpIG1heSByZXR1cm4gc21hbGwgLXZlIHZhbHVlcyB3aGVuIHN0YXJ0aW5nIGZyb20gcG9zaXRpb246IDAsIGVnLiAtNTAuMTIwMzk2ODc1LiBVbmV4cGVjdGVkL2ludmFsaWQgcGVyIFczLCBJIHRoaW5rLiBOb3JtYWxpemUgdG8gMC5cclxuICAgICAgcy5wb3NpdGlvbiA9IE1hdGgubWF4KDAsIG5Qb3NpdGlvbik7XHJcblxyXG4gICAgICBzLl9wcm9jZXNzT25Qb3NpdGlvbigpO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgZlYgPiA4KSB7XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMudXNlUGVha0RhdGEgJiYgb1BlYWtEYXRhICE9PSBfdW5kZWZpbmVkICYmIG9QZWFrRGF0YSkge1xyXG4gICAgICAgICAgcy5wZWFrRGF0YSA9IHtcclxuICAgICAgICAgICAgbGVmdDogb1BlYWtEYXRhLmxlZnRQZWFrLFxyXG4gICAgICAgICAgICByaWdodDogb1BlYWtEYXRhLnJpZ2h0UGVha1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMudXNlV2F2ZWZvcm1EYXRhICYmIG9XYXZlZm9ybURhdGFMZWZ0ICE9PSBfdW5kZWZpbmVkICYmIG9XYXZlZm9ybURhdGFMZWZ0KSB7XHJcbiAgICAgICAgICBzLndhdmVmb3JtRGF0YSA9IHtcclxuICAgICAgICAgICAgbGVmdDogb1dhdmVmb3JtRGF0YUxlZnQuc3BsaXQoJywnKSxcclxuICAgICAgICAgICAgcmlnaHQ6IG9XYXZlZm9ybURhdGFSaWdodC5zcGxpdCgnLCcpXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy51c2VFUURhdGEpIHtcclxuICAgICAgICAgIGlmIChvRVFEYXRhICE9PSBfdW5kZWZpbmVkICYmIG9FUURhdGEgJiYgb0VRRGF0YS5sZWZ0RVEpIHtcclxuICAgICAgICAgICAgZXFMZWZ0ID0gb0VRRGF0YS5sZWZ0RVEuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgcy5lcURhdGEgPSBlcUxlZnQ7XHJcbiAgICAgICAgICAgIHMuZXFEYXRhLmxlZnQgPSBlcUxlZnQ7XHJcbiAgICAgICAgICAgIGlmIChvRVFEYXRhLnJpZ2h0RVEgIT09IF91bmRlZmluZWQgJiYgb0VRRGF0YS5yaWdodEVRKSB7XHJcbiAgICAgICAgICAgICAgcy5lcURhdGEucmlnaHQgPSBvRVFEYXRhLnJpZ2h0RVEuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzLnBsYXlTdGF0ZSA9PT0gMSkge1xyXG5cclxuICAgICAgICAvLyBzcGVjaWFsIGNhc2UvaGFjazogZW5zdXJlIGJ1ZmZlcmluZyBpcyBmYWxzZSBpZiBsb2FkaW5nIGZyb20gY2FjaGUgKGFuZCBub3QgeWV0IHN0YXJ0ZWQpXHJcbiAgICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgZlYgPT09IDggJiYgIXMucG9zaXRpb24gJiYgcy5pc0J1ZmZlcmluZykge1xyXG4gICAgICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLndoaWxlcGxheWluZykge1xyXG4gICAgICAgICAgLy8gZmxhc2ggbWF5IGNhbGwgYWZ0ZXIgYWN0dWFsIGZpbmlzaFxyXG4gICAgICAgICAgaW5zdGFuY2VPcHRpb25zLndoaWxlcGxheWluZy5hcHBseShzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX29uY2FwdGlvbmRhdGEgPSBmdW5jdGlvbihvRGF0YSkge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIGludGVybmFsOiBmbGFzaCA5ICsgTmV0U3RyZWFtIChNb3ZpZVN0YXIvUlRNUC1vbmx5KSBmZWF0dXJlXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvRGF0YVxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IENhcHRpb24gZGF0YSByZWNlaXZlZC4nKTtcclxuXHJcbiAgICAgIHMuY2FwdGlvbmRhdGEgPSBvRGF0YTtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbmNhcHRpb25kYXRhKSB7XHJcbiAgICAgICAgcy5faU8ub25jYXB0aW9uZGF0YS5hcHBseShzLCBbb0RhdGFdKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fb25tZXRhZGF0YSA9IGZ1bmN0aW9uKG9NRFByb3BzLCBvTUREYXRhKSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogaW50ZXJuYWw6IGZsYXNoIDkgKyBOZXRTdHJlYW0gKE1vdmllU3Rhci9SVE1QLW9ubHkpIGZlYXR1cmVcclxuICAgICAgICogUlRNUCBtYXkgaW5jbHVkZSBzb25nIHRpdGxlLCBNb3ZpZVN0YXIgY29udGVudCBtYXkgaW5jbHVkZSBlbmNvZGluZyBpbmZvXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7YXJyYXl9IG9NRFByb3BzIChuYW1lcylcclxuICAgICAgICogQHBhcmFtIHthcnJheX0gb01ERGF0YSAodmFsdWVzKVxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IE1ldGFkYXRhIHJlY2VpdmVkLicpO1xyXG5cclxuICAgICAgdmFyIG9EYXRhID0ge30sIGksIGo7XHJcblxyXG4gICAgICBmb3IgKGkgPSAwLCBqID0gb01EUHJvcHMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgb0RhdGFbb01EUHJvcHNbaV1dID0gb01ERGF0YVtpXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcy5tZXRhZGF0YSA9IG9EYXRhO1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9ubWV0YWRhdGEpIHtcclxuICAgICAgICBzLl9pTy5vbm1ldGFkYXRhLmNhbGwocywgcy5tZXRhZGF0YSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX29uaWQzID0gZnVuY3Rpb24ob0lEM1Byb3BzLCBvSUQzRGF0YSkge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIGludGVybmFsOiBmbGFzaCA4ICsgZmxhc2ggOSBJRDMgZmVhdHVyZVxyXG4gICAgICAgKiBtYXkgaW5jbHVkZSBhcnRpc3QsIHNvbmcgdGl0bGUgZXRjLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2FycmF5fSBvSUQzUHJvcHMgKG5hbWVzKVxyXG4gICAgICAgKiBAcGFyYW0ge2FycmF5fSBvSUQzRGF0YSAodmFsdWVzKVxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IElEMyBkYXRhIHJlY2VpdmVkLicpO1xyXG5cclxuICAgICAgdmFyIG9EYXRhID0gW10sIGksIGo7XHJcblxyXG4gICAgICBmb3IgKGkgPSAwLCBqID0gb0lEM1Byb3BzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgIG9EYXRhW29JRDNQcm9wc1tpXV0gPSBvSUQzRGF0YVtpXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcy5pZDMgPSBtaXhpbihzLmlkMywgb0RhdGEpO1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9uaWQzKSB7XHJcbiAgICAgICAgcy5faU8ub25pZDMuYXBwbHkocyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGZsYXNoL1JUTVAtb25seVxyXG5cclxuICAgIHRoaXMuX29uY29ubmVjdCA9IGZ1bmN0aW9uKGJTdWNjZXNzKSB7XHJcblxyXG4gICAgICBiU3VjY2VzcyA9IChiU3VjY2VzcyA9PT0gMSk7XHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6ICcgKyAoYlN1Y2Nlc3MgPyAnQ29ubmVjdGVkLicgOiAnRmFpbGVkIHRvIGNvbm5lY3Q/IC0gJyArIHMudXJsKSwgKGJTdWNjZXNzID8gMSA6IDIpKTtcclxuICAgICAgcy5jb25uZWN0ZWQgPSBiU3VjY2VzcztcclxuXHJcbiAgICAgIGlmIChiU3VjY2Vzcykge1xyXG5cclxuICAgICAgICBzLmZhaWx1cmVzID0gMDtcclxuXHJcbiAgICAgICAgaWYgKGlkQ2hlY2socy5pZCkpIHtcclxuICAgICAgICAgIGlmIChzLmdldEF1dG9QbGF5KCkpIHtcclxuICAgICAgICAgICAgLy8gb25seSB1cGRhdGUgdGhlIHBsYXkgc3RhdGUgaWYgYXV0byBwbGF5aW5nXHJcbiAgICAgICAgICAgIHMucGxheShfdW5kZWZpbmVkLCBzLmdldEF1dG9QbGF5KCkpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChzLl9pTy5hdXRvTG9hZCkge1xyXG4gICAgICAgICAgICBzLmxvYWQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzLl9pTy5vbmNvbm5lY3QpIHtcclxuICAgICAgICAgIHMuX2lPLm9uY29ubmVjdC5hcHBseShzLCBbYlN1Y2Nlc3NdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9vbmRhdGFlcnJvciA9IGZ1bmN0aW9uKHNFcnJvcikge1xyXG5cclxuICAgICAgLy8gZmxhc2ggOSB3YXZlL2VxIGRhdGEgaGFuZGxlclxyXG4gICAgICAvLyBoYWNrOiBjYWxsZWQgYXQgc3RhcnQsIGFuZCBlbmQgZnJvbSBmbGFzaCBhdC9hZnRlciBvbmZpbmlzaCgpXHJcbiAgICAgIGlmIChzLnBsYXlTdGF0ZSA+IDApIHtcclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBEYXRhIGVycm9yOiAnICsgc0Vycm9yKTtcclxuICAgICAgICBpZiAocy5faU8ub25kYXRhZXJyb3IpIHtcclxuICAgICAgICAgIHMuX2lPLm9uZGF0YWVycm9yLmFwcGx5KHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICB0aGlzLl9kZWJ1ZygpO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9OyAvLyBTTVNvdW5kKClcclxuXHJcbiAgLyoqXHJcbiAgICogUHJpdmF0ZSBTb3VuZE1hbmFnZXIgaW50ZXJuYWxzXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICovXHJcblxyXG4gIGdldERvY3VtZW50ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgcmV0dXJuIChkb2MuYm9keSB8fCBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2RpdicpWzBdKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgaWQgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICByZXR1cm4gZG9jLmdldEVsZW1lbnRCeUlkKHNJRCk7XHJcblxyXG4gIH07XHJcblxyXG4gIG1peGluID0gZnVuY3Rpb24ob01haW4sIG9BZGQpIHtcclxuXHJcbiAgICAvLyBub24tZGVzdHJ1Y3RpdmUgbWVyZ2VcclxuICAgIHZhciBvMSA9IChvTWFpbiB8fCB7fSksIG8yLCBvO1xyXG5cclxuICAgIC8vIGlmIHVuc3BlY2lmaWVkLCBvMiBpcyB0aGUgZGVmYXVsdCBvcHRpb25zIG9iamVjdFxyXG4gICAgbzIgPSAob0FkZCA9PT0gX3VuZGVmaW5lZCA/IHNtMi5kZWZhdWx0T3B0aW9ucyA6IG9BZGQpO1xyXG5cclxuICAgIGZvciAobyBpbiBvMikge1xyXG5cclxuICAgICAgaWYgKG8yLmhhc093blByb3BlcnR5KG8pICYmIG8xW29dID09PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgbzJbb10gIT09ICdvYmplY3QnIHx8IG8yW29dID09PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgLy8gYXNzaWduIGRpcmVjdGx5XHJcbiAgICAgICAgICBvMVtvXSA9IG8yW29dO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIHJlY3Vyc2UgdGhyb3VnaCBvMlxyXG4gICAgICAgICAgbzFbb10gPSBtaXhpbihvMVtvXSwgbzJbb10pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvMTtcclxuXHJcbiAgfTtcclxuXHJcbiAgd3JhcENhbGxiYWNrID0gZnVuY3Rpb24ob1NvdW5kLCBjYWxsYmFjaykge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogMDMvMDMvMjAxMzogRml4IGZvciBGbGFzaCBQbGF5ZXIgMTEuNi42MDIuMTcxICsgRmxhc2ggOCAoZmxhc2hWZXJzaW9uID0gOCkgU1dGIGlzc3VlXHJcbiAgICAgKiBzZXRUaW1lb3V0KCkgZml4IGZvciBjZXJ0YWluIFNNU291bmQgY2FsbGJhY2tzIGxpa2Ugb25sb2FkKCkgYW5kIG9uZmluaXNoKCksIHdoZXJlIHN1YnNlcXVlbnQgY2FsbHMgbGlrZSBwbGF5KCkgYW5kIGxvYWQoKSBmYWlsIHdoZW4gRmxhc2ggUGxheWVyIDExLjYuNjAyLjE3MSBpcyBpbnN0YWxsZWQsIGFuZCB1c2luZyBzb3VuZE1hbmFnZXIgd2l0aCBmbGFzaFZlcnNpb24gPSA4ICh3aGljaCBpcyB0aGUgZGVmYXVsdCkuXHJcbiAgICAgKiBOb3Qgc3VyZSBvZiBleGFjdCBjYXVzZS4gU3VzcGVjdCByYWNlIGNvbmRpdGlvbiBhbmQvb3IgaW52YWxpZCAoTmFOLXN0eWxlKSBwb3NpdGlvbiBhcmd1bWVudCB0cmlja2xpbmcgZG93biB0byB0aGUgbmV4dCBKUyAtPiBGbGFzaCBfc3RhcnQoKSBjYWxsLCBpbiB0aGUgcGxheSgpIGNhc2UuXHJcbiAgICAgKiBGaXg6IHNldFRpbWVvdXQoKSB0byB5aWVsZCwgcGx1cyBzYWZlciBudWxsIC8gTmFOIGNoZWNraW5nIG9uIHBvc2l0aW9uIGFyZ3VtZW50IHByb3ZpZGVkIHRvIEZsYXNoLlxyXG4gICAgICogaHR0cHM6Ly9nZXRzYXRpc2ZhY3Rpb24uY29tL3NjaGlsbG1hbmlhL3RvcGljcy9yZWNlbnRfY2hyb21lX3VwZGF0ZV9zZWVtc190b19oYXZlX2Jyb2tlbl9teV9zbTJfYXVkaW9fcGxheWVyXHJcbiAgICAgKi9cclxuICAgIGlmICghb1NvdW5kLmlzSFRNTDUgJiYgZlYgPT09IDgpIHtcclxuICAgICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgLy8gYWRkaXRpb25hbCBzb3VuZE1hbmFnZXIgcHJvcGVydGllcyB0aGF0IHNvdW5kTWFuYWdlci5zZXR1cCgpIHdpbGwgYWNjZXB0XHJcblxyXG4gIGV4dHJhT3B0aW9ucyA9IHtcclxuICAgICdvbnJlYWR5JzogMSxcclxuICAgICdvbnRpbWVvdXQnOiAxLFxyXG4gICAgJ2RlZmF1bHRPcHRpb25zJzogMSxcclxuICAgICdmbGFzaDlPcHRpb25zJzogMSxcclxuICAgICdtb3ZpZVN0YXJPcHRpb25zJzogMVxyXG4gIH07XHJcblxyXG4gIGFzc2lnbiA9IGZ1bmN0aW9uKG8sIG9QYXJlbnQpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlY3Vyc2l2ZSBhc3NpZ25tZW50IG9mIHByb3BlcnRpZXMsIHNvdW5kTWFuYWdlci5zZXR1cCgpIGhlbHBlclxyXG4gICAgICogYWxsb3dzIHByb3BlcnR5IGFzc2lnbm1lbnQgYmFzZWQgb24gd2hpdGVsaXN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgaSxcclxuICAgICAgICByZXN1bHQgPSB0cnVlLFxyXG4gICAgICAgIGhhc1BhcmVudCA9IChvUGFyZW50ICE9PSBfdW5kZWZpbmVkKSxcclxuICAgICAgICBzZXR1cE9wdGlvbnMgPSBzbTIuc2V0dXBPcHRpb25zLFxyXG4gICAgICAgIGJvbnVzT3B0aW9ucyA9IGV4dHJhT3B0aW9ucztcclxuXHJcbiAgICAvLyA8ZD5cclxuXHJcbiAgICAvLyBpZiBzb3VuZE1hbmFnZXIuc2V0dXAoKSBjYWxsZWQsIHNob3cgYWNjZXB0ZWQgcGFyYW1ldGVycy5cclxuXHJcbiAgICBpZiAobyA9PT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgcmVzdWx0ID0gW107XHJcblxyXG4gICAgICBmb3IgKGkgaW4gc2V0dXBPcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGlmIChzZXR1cE9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpIHtcclxuICAgICAgICAgIHJlc3VsdC5wdXNoKGkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoaSBpbiBib251c09wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgaWYgKGJvbnVzT3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG5cclxuICAgICAgICAgIGlmICh0eXBlb2Ygc20yW2ldID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaChpICsgJzogey4uLn0nKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoc20yW2ldIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goaSArICc6IGZ1bmN0aW9uKCkgey4uLn0nKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGkpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuX3dEKHN0cignc2V0dXAnLCByZXN1bHQuam9pbignLCAnKSkpO1xyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgZm9yIChpIGluIG8pIHtcclxuXHJcbiAgICAgIGlmIChvLmhhc093blByb3BlcnR5KGkpKSB7XHJcblxyXG4gICAgICAgIC8vIGlmIG5vdCBhbiB7b2JqZWN0fSB3ZSB3YW50IHRvIHJlY3Vyc2UgdGhyb3VnaC4uLlxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIG9baV0gIT09ICdvYmplY3QnIHx8IG9baV0gPT09IG51bGwgfHwgb1tpXSBpbnN0YW5jZW9mIEFycmF5IHx8IG9baV0gaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuXHJcbiAgICAgICAgICAvLyBjaGVjayBcImFsbG93ZWRcIiBvcHRpb25zXHJcblxyXG4gICAgICAgICAgaWYgKGhhc1BhcmVudCAmJiBib251c09wdGlvbnNbb1BhcmVudF0gIT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHZhbGlkIHJlY3Vyc2l2ZSAvIG5lc3RlZCBvYmplY3Qgb3B0aW9uLCBlZy4sIHsgZGVmYXVsdE9wdGlvbnM6IHsgdm9sdW1lOiA1MCB9IH1cclxuICAgICAgICAgICAgc20yW29QYXJlbnRdW2ldID0gb1tpXTtcclxuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHNldHVwT3B0aW9uc1tpXSAhPT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgLy8gc3BlY2lhbCBjYXNlOiBhc3NpZ24gdG8gc2V0dXBPcHRpb25zIG9iamVjdCwgd2hpY2ggc291bmRNYW5hZ2VyIHByb3BlcnR5IHJlZmVyZW5jZXNcclxuICAgICAgICAgICAgc20yLnNldHVwT3B0aW9uc1tpXSA9IG9baV07XHJcblxyXG4gICAgICAgICAgICAvLyBhc3NpZ24gZGlyZWN0bHkgdG8gc291bmRNYW5hZ2VyLCB0b29cclxuICAgICAgICAgICAgc20yW2ldID0gb1tpXTtcclxuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGJvbnVzT3B0aW9uc1tpXSA9PT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgLy8gaW52YWxpZCBvciBkaXNhbGxvd2VkIHBhcmFtZXRlci4gY29tcGxhaW4uXHJcbiAgICAgICAgICAgIGNvbXBsYWluKHN0cigoc20yW2ldID09PSBfdW5kZWZpbmVkID8gJ3NldHVwVW5kZWYnIDogJ3NldHVwRXJyb3InKSwgaSksIDIpO1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiB2YWxpZCBleHRyYU9wdGlvbnMgKGJvbnVzT3B0aW9ucykgcGFyYW1ldGVyLlxyXG4gICAgICAgICAgICAgKiBpcyBpdCBhIG1ldGhvZCwgbGlrZSBvbnJlYWR5L29udGltZW91dD8gY2FsbCBpdC5cclxuICAgICAgICAgICAgICogbXVsdGlwbGUgcGFyYW1ldGVycyBzaG91bGQgYmUgaW4gYW4gYXJyYXksIGVnLiBzb3VuZE1hbmFnZXIuc2V0dXAoe29ucmVhZHk6IFtteUhhbmRsZXIsIG15U2NvcGVdfSk7XHJcbiAgICAgICAgICAgICAqL1xyXG5cclxuICAgICAgICAgICAgaWYgKHNtMltpXSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgIHNtMltpXS5hcHBseShzbTIsIChvW2ldIGluc3RhbmNlb2YgQXJyYXkgPyBvW2ldIDogW29baV1dKSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAvLyBnb29kIG9sZC1mYXNoaW9uZWQgZGlyZWN0IGFzc2lnbm1lbnRcclxuICAgICAgICAgICAgICBzbTJbaV0gPSBvW2ldO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyByZWN1cnNpb24gY2FzZSwgZWcuLCB7IGRlZmF1bHRPcHRpb25zOiB7IC4uLiB9IH1cclxuXHJcbiAgICAgICAgICBpZiAoYm9udXNPcHRpb25zW2ldID09PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpbnZhbGlkIG9yIGRpc2FsbG93ZWQgcGFyYW1ldGVyLiBjb21wbGFpbi5cclxuICAgICAgICAgICAgY29tcGxhaW4oc3RyKChzbTJbaV0gPT09IF91bmRlZmluZWQgPyAnc2V0dXBVbmRlZicgOiAnc2V0dXBFcnJvcicpLCBpKSwgMik7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gcmVjdXJzZSB0aHJvdWdoIG9iamVjdFxyXG4gICAgICAgICAgICByZXR1cm4gYXNzaWduKG9baV0sIGkpO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBwcmVmZXJGbGFzaENoZWNrKGtpbmQpIHtcclxuXHJcbiAgICAvLyB3aGV0aGVyIGZsYXNoIHNob3VsZCBwbGF5IGEgZ2l2ZW4gdHlwZVxyXG4gICAgcmV0dXJuIChzbTIucHJlZmVyRmxhc2ggJiYgaGFzRmxhc2ggJiYgIXNtMi5pZ25vcmVGbGFzaCAmJiAoc20yLmZsYXNoW2tpbmRdICE9PSBfdW5kZWZpbmVkICYmIHNtMi5mbGFzaFtraW5kXSkpO1xyXG5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVybmFsIERPTTItbGV2ZWwgZXZlbnQgaGVscGVyc1xyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqL1xyXG5cclxuICBldmVudCA9IChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBub3JtYWxpemUgZXZlbnQgbWV0aG9kc1xyXG4gICAgdmFyIG9sZCA9ICh3aW5kb3cuYXR0YWNoRXZlbnQpLFxyXG4gICAgZXZ0ID0ge1xyXG4gICAgICBhZGQ6IChvbGQgPyAnYXR0YWNoRXZlbnQnIDogJ2FkZEV2ZW50TGlzdGVuZXInKSxcclxuICAgICAgcmVtb3ZlOiAob2xkID8gJ2RldGFjaEV2ZW50JyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJylcclxuICAgIH07XHJcblxyXG4gICAgLy8gbm9ybWFsaXplIFwib25cIiBldmVudCBwcmVmaXgsIG9wdGlvbmFsIGNhcHR1cmUgYXJndW1lbnRcclxuICAgIGZ1bmN0aW9uIGdldEFyZ3Mob0FyZ3MpIHtcclxuXHJcbiAgICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChvQXJncyksXHJcbiAgICAgICAgICBsZW4gPSBhcmdzLmxlbmd0aDtcclxuXHJcbiAgICAgIGlmIChvbGQpIHtcclxuICAgICAgICAvLyBwcmVmaXhcclxuICAgICAgICBhcmdzWzFdID0gJ29uJyArIGFyZ3NbMV07XHJcbiAgICAgICAgaWYgKGxlbiA+IDMpIHtcclxuICAgICAgICAgIC8vIG5vIGNhcHR1cmVcclxuICAgICAgICAgIGFyZ3MucG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKGxlbiA9PT0gMykge1xyXG4gICAgICAgIGFyZ3MucHVzaChmYWxzZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBhcmdzO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhcHBseShhcmdzLCBzVHlwZSkge1xyXG5cclxuICAgICAgLy8gbm9ybWFsaXplIGFuZCBjYWxsIHRoZSBldmVudCBtZXRob2QsIHdpdGggdGhlIHByb3BlciBhcmd1bWVudHNcclxuICAgICAgdmFyIGVsZW1lbnQgPSBhcmdzLnNoaWZ0KCksXHJcbiAgICAgICAgICBtZXRob2QgPSBbZXZ0W3NUeXBlXV07XHJcblxyXG4gICAgICBpZiAob2xkKSB7XHJcbiAgICAgICAgLy8gb2xkIElFIGNhbid0IGRvIGFwcGx5KCkuXHJcbiAgICAgICAgZWxlbWVudFttZXRob2RdKGFyZ3NbMF0sIGFyZ3NbMV0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVsZW1lbnRbbWV0aG9kXS5hcHBseShlbGVtZW50LCBhcmdzKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGQoKSB7XHJcbiAgICAgIGFwcGx5KGdldEFyZ3MoYXJndW1lbnRzKSwgJ2FkZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbW92ZSgpIHtcclxuICAgICAgYXBwbHkoZ2V0QXJncyhhcmd1bWVudHMpLCAncmVtb3ZlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgJ2FkZCc6IGFkZCxcclxuICAgICAgJ3JlbW92ZSc6IHJlbW92ZVxyXG4gICAgfTtcclxuXHJcbiAgfSgpKTtcclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJuYWwgSFRNTDUgZXZlbnQgaGFuZGxpbmdcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqL1xyXG5cclxuICBmdW5jdGlvbiBodG1sNV9ldmVudChvRm4pIHtcclxuXHJcbiAgICAvLyB3cmFwIGh0bWw1IGV2ZW50IGhhbmRsZXJzIHNvIHdlIGRvbid0IGNhbGwgdGhlbSBvbiBkZXN0cm95ZWQgYW5kL29yIHVubG9hZGVkIHNvdW5kc1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3MsXHJcbiAgICAgICAgICByZXN1bHQ7XHJcblxyXG4gICAgICBpZiAoIXMgfHwgIXMuX2EpIHtcclxuICAgICAgICAvLyA8ZD5cclxuICAgICAgICBpZiAocyAmJiBzLmlkKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBJZ25vcmluZyAnICsgZS50eXBlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc20yLl93RChoNSArICdJZ25vcmluZyAnICsgZS50eXBlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gPC9kPlxyXG4gICAgICAgIHJlc3VsdCA9IG51bGw7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzdWx0ID0gb0ZuLmNhbGwodGhpcywgZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgfVxyXG5cclxuICBodG1sNV9ldmVudHMgPSB7XHJcblxyXG4gICAgLy8gSFRNTDUgZXZlbnQtbmFtZS10by1oYW5kbGVyIG1hcFxyXG5cclxuICAgIGFib3J0OiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IGFib3J0Jyk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gZW5vdWdoIGhhcyBsb2FkZWQgdG8gcGxheVxyXG5cclxuICAgIGNhbnBsYXk6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zLFxyXG4gICAgICAgICAgcG9zaXRpb24xSztcclxuXHJcbiAgICAgIGlmIChzLl9odG1sNV9jYW5wbGF5KSB7XHJcbiAgICAgICAgLy8gdGhpcyBldmVudCBoYXMgYWxyZWFkeSBmaXJlZC4gaWdub3JlLlxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzLl9odG1sNV9jYW5wbGF5ID0gdHJ1ZTtcclxuICAgICAgc20yLl93RChzLmlkICsgJzogY2FucGxheScpO1xyXG4gICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuXHJcbiAgICAgIC8vIHBvc2l0aW9uIGFjY29yZGluZyB0byBpbnN0YW5jZSBvcHRpb25zXHJcbiAgICAgIHBvc2l0aW9uMUsgPSAocy5faU8ucG9zaXRpb24gIT09IF91bmRlZmluZWQgJiYgIWlzTmFOKHMuX2lPLnBvc2l0aW9uKSA/IHMuX2lPLnBvc2l0aW9uL21zZWNTY2FsZSA6IG51bGwpO1xyXG5cclxuICAgICAgLy8gc2V0IHRoZSBwb3NpdGlvbiBpZiBwb3NpdGlvbiB3YXMgcHJvdmlkZWQgYmVmb3JlIHRoZSBzb3VuZCBsb2FkZWRcclxuICAgICAgaWYgKHRoaXMuY3VycmVudFRpbWUgIT09IHBvc2l0aW9uMUspIHtcclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBjYW5wbGF5OiBTZXR0aW5nIHBvc2l0aW9uIHRvICcgKyBwb3NpdGlvbjFLKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdGhpcy5jdXJyZW50VGltZSA9IHBvc2l0aW9uMUs7XHJcbiAgICAgICAgfSBjYXRjaChlZSkge1xyXG4gICAgICAgICAgc20yLl93RChzLmlkICsgJzogY2FucGxheTogU2V0dGluZyBwb3NpdGlvbiBvZiAnICsgcG9zaXRpb24xSyArICcgZmFpbGVkOiAnICsgZWUubWVzc2FnZSwgMik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBoYWNrIGZvciBIVE1MNSBmcm9tL3RvIGNhc2VcclxuICAgICAgaWYgKHMuX2lPLl9vbmNhbnBsYXkpIHtcclxuICAgICAgICBzLl9pTy5fb25jYW5wbGF5KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBjYW5wbGF5dGhyb3VnaDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3M7XHJcblxyXG4gICAgICBpZiAoIXMubG9hZGVkKSB7XHJcbiAgICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcbiAgICAgICAgcy5fd2hpbGVsb2FkaW5nKHMuYnl0ZXNMb2FkZWQsIHMuYnl0ZXNUb3RhbCwgcy5fZ2V0X2h0bWw1X2R1cmF0aW9uKCkpO1xyXG4gICAgICAgIHMuX29ubG9hZCh0cnVlKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIGR1cmF0aW9uY2hhbmdlOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIC8vIGR1cmF0aW9uY2hhbmdlIG1heSBmaXJlIGF0IHZhcmlvdXMgdGltZXMsIHByb2JhYmx5IHRoZSBzYWZlc3Qgd2F5IHRvIGNhcHR1cmUgYWNjdXJhdGUvZmluYWwgZHVyYXRpb24uXHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3MsXHJcbiAgICAgICAgICBkdXJhdGlvbjtcclxuXHJcbiAgICAgIGR1cmF0aW9uID0gcy5fZ2V0X2h0bWw1X2R1cmF0aW9uKCk7XHJcblxyXG4gICAgICBpZiAoIWlzTmFOKGR1cmF0aW9uKSAmJiBkdXJhdGlvbiAhPT0gcy5kdXJhdGlvbikge1xyXG5cclxuICAgICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBkdXJhdGlvbmNoYW5nZSAoJyArIGR1cmF0aW9uICsgJyknICsgKHMuZHVyYXRpb24gPyAnLCBwcmV2aW91c2x5ICcgKyBzLmR1cmF0aW9uIDogJycpKTtcclxuXHJcbiAgICAgICAgcy5kdXJhdGlvbkVzdGltYXRlID0gcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIC8vIFRPRE86IFJlc2VydmVkIGZvciBwb3RlbnRpYWwgdXNlXHJcbiAgICAvKlxyXG4gICAgZW1wdGllZDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBlbXB0aWVkJyk7XHJcblxyXG4gICAgfSksXHJcbiAgICAqL1xyXG5cclxuICAgIGVuZGVkOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcztcclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IGVuZGVkJyk7XHJcblxyXG4gICAgICBzLl9vbmZpbmlzaCgpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIGVycm9yOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IEhUTUw1IGVycm9yLCBjb2RlICcgKyB0aGlzLmVycm9yLmNvZGUpO1xyXG4gICAgICAvKipcclxuICAgICAgICogSFRNTDUgZXJyb3IgY29kZXMsIHBlciBXM0NcclxuICAgICAgICogRXJyb3IgMTogQ2xpZW50IGFib3J0ZWQgZG93bmxvYWQgYXQgdXNlcidzIHJlcXVlc3QuXHJcbiAgICAgICAqIEVycm9yIDI6IE5ldHdvcmsgZXJyb3IgYWZ0ZXIgbG9hZCBzdGFydGVkLlxyXG4gICAgICAgKiBFcnJvciAzOiBEZWNvZGluZyBpc3N1ZS5cclxuICAgICAgICogRXJyb3IgNDogTWVkaWEgKGF1ZGlvIGZpbGUpIG5vdCBzdXBwb3J0ZWQuXHJcbiAgICAgICAqIFJlZmVyZW5jZTogaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvdGhlLXZpZGVvLWVsZW1lbnQuaHRtbCNlcnJvci1jb2Rlc1xyXG4gICAgICAgKi9cclxuICAgICAgLy8gY2FsbCBsb2FkIHdpdGggZXJyb3Igc3RhdGU/XHJcbiAgICAgIHRoaXMuX3MuX29ubG9hZChmYWxzZSk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgbG9hZGVkZGF0YTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3M7XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBsb2FkZWRkYXRhJyk7XHJcblxyXG4gICAgICAvLyBzYWZhcmkgc2VlbXMgdG8gbmljZWx5IHJlcG9ydCBwcm9ncmVzcyBldmVudHMsIGV2ZW50dWFsbHkgdG90YWxsaW5nIDEwMCVcclxuICAgICAgaWYgKCFzLl9sb2FkZWQgJiYgIWlzU2FmYXJpKSB7XHJcbiAgICAgICAgcy5kdXJhdGlvbiA9IHMuX2dldF9odG1sNV9kdXJhdGlvbigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgbG9hZGVkbWV0YWRhdGE6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogbG9hZGVkbWV0YWRhdGEnKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBsb2Fkc3RhcnQ6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogbG9hZHN0YXJ0Jyk7XHJcbiAgICAgIC8vIGFzc3VtZSBidWZmZXJpbmcgYXQgZmlyc3RcclxuICAgICAgdGhpcy5fcy5fb25idWZmZXJjaGFuZ2UoMSk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgcGxheTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAvLyBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBwbGF5KCknKTtcclxuICAgICAgLy8gb25jZSBwbGF5IHN0YXJ0cywgbm8gYnVmZmVyaW5nXHJcbiAgICAgIHRoaXMuX3MuX29uYnVmZmVyY2hhbmdlKDApO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHBsYXlpbmc6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogcGxheWluZyAnICsgU3RyaW5nLmZyb21DaGFyQ29kZSg5ODM1KSk7XHJcbiAgICAgIC8vIG9uY2UgcGxheSBzdGFydHMsIG5vIGJ1ZmZlcmluZ1xyXG4gICAgICB0aGlzLl9zLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBwcm9ncmVzczogaHRtbDVfZXZlbnQoZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgLy8gbm90ZTogY2FuIGZpcmUgcmVwZWF0ZWRseSBhZnRlciBcImxvYWRlZFwiIGV2ZW50LCBkdWUgdG8gdXNlIG9mIEhUVFAgcmFuZ2UvcGFydGlhbHNcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcyxcclxuICAgICAgICAgIGksIGosIHByb2dTdHIsIGJ1ZmZlcmVkID0gMCxcclxuICAgICAgICAgIGlzUHJvZ3Jlc3MgPSAoZS50eXBlID09PSAncHJvZ3Jlc3MnKSxcclxuICAgICAgICAgIHJhbmdlcyA9IGUudGFyZ2V0LmJ1ZmZlcmVkLFxyXG4gICAgICAgICAgLy8gZmlyZWZveCAzLjYgaW1wbGVtZW50cyBlLmxvYWRlZC90b3RhbCAoYnl0ZXMpXHJcbiAgICAgICAgICBsb2FkZWQgPSAoZS5sb2FkZWQgfHwgMCksXHJcbiAgICAgICAgICB0b3RhbCA9IChlLnRvdGFsIHx8IDEpO1xyXG5cclxuICAgICAgLy8gcmVzZXQgdGhlIFwiYnVmZmVyZWRcIiAobG9hZGVkIGJ5dGUgcmFuZ2VzKSBhcnJheVxyXG4gICAgICBzLmJ1ZmZlcmVkID0gW107XHJcblxyXG4gICAgICBpZiAocmFuZ2VzICYmIHJhbmdlcy5sZW5ndGgpIHtcclxuXHJcbiAgICAgICAgLy8gaWYgbG9hZGVkIGlzIDAsIHRyeSBUaW1lUmFuZ2VzIGltcGxlbWVudGF0aW9uIGFzICUgb2YgbG9hZFxyXG4gICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0RPTS9UaW1lUmFuZ2VzXHJcblxyXG4gICAgICAgIC8vIHJlLWJ1aWxkIFwiYnVmZmVyZWRcIiBhcnJheVxyXG4gICAgICAgIC8vIEhUTUw1IHJldHVybnMgc2Vjb25kcy4gU00yIEFQSSB1c2VzIG1zZWMgZm9yIHNldFBvc2l0aW9uKCkgZXRjLiwgd2hldGhlciBGbGFzaCBvciBIVE1MNS5cclxuICAgICAgICBmb3IgKGkgPSAwLCBqID0gcmFuZ2VzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgICAgcy5idWZmZXJlZC5wdXNoKHtcclxuICAgICAgICAgICAgJ3N0YXJ0JzogcmFuZ2VzLnN0YXJ0KGkpICogbXNlY1NjYWxlLFxyXG4gICAgICAgICAgICAnZW5kJzogcmFuZ2VzLmVuZChpKSAqIG1zZWNTY2FsZVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB1c2UgdGhlIGxhc3QgdmFsdWUgbG9jYWxseVxyXG4gICAgICAgIGJ1ZmZlcmVkID0gKHJhbmdlcy5lbmQoMCkgLSByYW5nZXMuc3RhcnQoMCkpICogbXNlY1NjYWxlO1xyXG5cclxuICAgICAgICAvLyBsaW5lYXIgY2FzZSwgYnVmZmVyIHN1bTsgZG9lcyBub3QgYWNjb3VudCBmb3Igc2Vla2luZyBhbmQgSFRUUCBwYXJ0aWFscyAvIGJ5dGUgcmFuZ2VzXHJcbiAgICAgICAgbG9hZGVkID0gTWF0aC5taW4oMSwgYnVmZmVyZWQgLyAoZS50YXJnZXQuZHVyYXRpb24gKiBtc2VjU2NhbGUpKTtcclxuXHJcbiAgICAgICAgLy8gPGQ+XHJcbiAgICAgICAgaWYgKGlzUHJvZ3Jlc3MgJiYgcmFuZ2VzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgIHByb2dTdHIgPSBbXTtcclxuICAgICAgICAgIGogPSByYW5nZXMubGVuZ3RoO1xyXG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgICAgICBwcm9nU3RyLnB1c2goKGUudGFyZ2V0LmJ1ZmZlcmVkLnN0YXJ0KGkpICogbXNlY1NjYWxlKSArICctJyArIChlLnRhcmdldC5idWZmZXJlZC5lbmQoaSkgKiBtc2VjU2NhbGUpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHByb2dyZXNzLCB0aW1lUmFuZ2VzOiAnICsgcHJvZ1N0ci5qb2luKCcsICcpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc1Byb2dyZXNzICYmICFpc05hTihsb2FkZWQpKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBwcm9ncmVzcywgJyArIE1hdGguZmxvb3IobG9hZGVkICogMTAwKSArICclIGxvYWRlZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWlzTmFOKGxvYWRlZCkpIHtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogcHJldmVudCBjYWxscyB3aXRoIGR1cGxpY2F0ZSB2YWx1ZXMuXHJcbiAgICAgICAgcy5fd2hpbGVsb2FkaW5nKGxvYWRlZCwgdG90YWwsIHMuX2dldF9odG1sNV9kdXJhdGlvbigpKTtcclxuICAgICAgICBpZiAobG9hZGVkICYmIHRvdGFsICYmIGxvYWRlZCA9PT0gdG90YWwpIHtcclxuICAgICAgICAgIC8vIGluIGNhc2UgXCJvbmxvYWRcIiBkb2Vzbid0IGZpcmUgKGVnLiBnZWNrbyAxLjkuMilcclxuICAgICAgICAgIGh0bWw1X2V2ZW50cy5jYW5wbGF5dGhyb3VnaC5jYWxsKHRoaXMsIGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICByYXRlY2hhbmdlOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHJhdGVjaGFuZ2UnKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBzdXNwZW5kOiBodG1sNV9ldmVudChmdW5jdGlvbihlKSB7XHJcblxyXG4gICAgICAvLyBkb3dubG9hZCBwYXVzZWQvc3RvcHBlZCwgbWF5IGhhdmUgZmluaXNoZWQgKGVnLiBvbmxvYWQpXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcztcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHN1c3BlbmQnKTtcclxuICAgICAgaHRtbDVfZXZlbnRzLnByb2dyZXNzLmNhbGwodGhpcywgZSk7XHJcbiAgICAgIHMuX29uc3VzcGVuZCgpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHN0YWxsZWQ6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogc3RhbGxlZCcpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHRpbWV1cGRhdGU6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdGhpcy5fcy5fb25UaW1lcigpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHdhaXRpbmc6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zO1xyXG5cclxuICAgICAgLy8gc2VlIGFsc286IHNlZWtpbmdcclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogd2FpdGluZycpO1xyXG5cclxuICAgICAgLy8gcGxheWJhY2sgZmFzdGVyIHRoYW4gZG93bmxvYWQgcmF0ZSwgZXRjLlxyXG4gICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgxKTtcclxuXHJcbiAgICB9KVxyXG5cclxuICB9O1xyXG5cclxuICBodG1sNU9LID0gZnVuY3Rpb24oaU8pIHtcclxuXHJcbiAgICAvLyBwbGF5YWJpbGl0eSB0ZXN0IGJhc2VkIG9uIFVSTCBvciBNSU1FIHR5cGVcclxuXHJcbiAgICB2YXIgcmVzdWx0O1xyXG5cclxuICAgIGlmICghaU8gfHwgKCFpTy50eXBlICYmICFpTy51cmwgJiYgIWlPLnNlcnZlclVSTCkpIHtcclxuXHJcbiAgICAgIC8vIG5vdGhpbmcgdG8gY2hlY2tcclxuICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgfSBlbHNlIGlmIChpTy5zZXJ2ZXJVUkwgfHwgKGlPLnR5cGUgJiYgcHJlZmVyRmxhc2hDaGVjayhpTy50eXBlKSkpIHtcclxuXHJcbiAgICAgIC8vIFJUTVAsIG9yIHByZWZlcnJpbmcgZmxhc2hcclxuICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFVzZSB0eXBlLCBpZiBzcGVjaWZpZWQuIFBhc3MgZGF0YTogVVJJcyB0byBIVE1MNS4gSWYgSFRNTDUtb25seSBtb2RlLCBubyBvdGhlciBvcHRpb25zLCBzbyBqdXN0IGdpdmUgJ2VyXHJcbiAgICAgIHJlc3VsdCA9ICgoaU8udHlwZSA/IGh0bWw1Q2FuUGxheSh7dHlwZTppTy50eXBlfSkgOiBodG1sNUNhblBsYXkoe3VybDppTy51cmx9KSB8fCBzbTIuaHRtbDVPbmx5IHx8IGlPLnVybC5tYXRjaCgvZGF0YVxcOi9pKSkpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICBodG1sNVVubG9hZCA9IGZ1bmN0aW9uKG9BdWRpbykge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJuYWwgbWV0aG9kOiBVbmxvYWQgbWVkaWEsIGFuZCBjYW5jZWwgYW55IGN1cnJlbnQvcGVuZGluZyBuZXR3b3JrIHJlcXVlc3RzLlxyXG4gICAgICogRmlyZWZveCBjYW4gbG9hZCBhbiBlbXB0eSBVUkwsIHdoaWNoIGFsbGVnZWRseSBkZXN0cm95cyB0aGUgZGVjb2RlciBhbmQgc3RvcHMgdGhlIGRvd25sb2FkLlxyXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvRW4vVXNpbmdfYXVkaW9fYW5kX3ZpZGVvX2luX0ZpcmVmb3gjU3RvcHBpbmdfdGhlX2Rvd25sb2FkX29mX21lZGlhXHJcbiAgICAgKiBIb3dldmVyLCBGaXJlZm94IGhhcyBiZWVuIHNlZW4gbG9hZGluZyBhIHJlbGF0aXZlIFVSTCBmcm9tICcnIGFuZCB0aHVzIHJlcXVlc3RpbmcgdGhlIGhvc3RpbmcgcGFnZSBvbiB1bmxvYWQuXHJcbiAgICAgKiBPdGhlciBVQSBiZWhhdmlvdXIgaXMgdW5jbGVhciwgc28gZXZlcnlvbmUgZWxzZSBnZXRzIGFuIGFib3V0OmJsYW5rLXN0eWxlIFVSTC5cclxuICAgICAqL1xyXG5cclxuICAgIHZhciB1cmw7XHJcblxyXG4gICAgaWYgKG9BdWRpbykge1xyXG5cclxuICAgICAgLy8gRmlyZWZveCBhbmQgQ2hyb21lIGFjY2VwdCBzaG9ydCBXQVZlIGRhdGE6IFVSSXMuIENob21lIGRpc2xpa2VzIGF1ZGlvL3dhdiwgYnV0IGFjY2VwdHMgYXVkaW8vd2F2IGZvciBkYXRhOiBNSU1FLlxyXG4gICAgICAvLyBEZXNrdG9wIFNhZmFyaSBjb21wbGFpbnMgLyBmYWlscyBvbiBkYXRhOiBVUkksIHNvIGl0IGdldHMgYWJvdXQ6YmxhbmsuXHJcbiAgICAgIHVybCA9IChpc1NhZmFyaSA/IGVtcHR5VVJMIDogKHNtMi5odG1sNS5jYW5QbGF5VHlwZSgnYXVkaW8vd2F2JykgPyBlbXB0eVdBViA6IGVtcHR5VVJMKSk7XHJcblxyXG4gICAgICBvQXVkaW8uc3JjID0gdXJsO1xyXG5cclxuICAgICAgLy8gcmVzZXQgc29tZSBzdGF0ZSwgdG9vXHJcbiAgICAgIGlmIChvQXVkaW8uX2NhbGxlZF91bmxvYWQgIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBvQXVkaW8uX2NhbGxlZF9sb2FkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHVzZUdsb2JhbEhUTUw1QXVkaW8pIHtcclxuXHJcbiAgICAgIC8vIGVuc3VyZSBVUkwgc3RhdGUgaXMgdHJhc2hlZCwgYWxzb1xyXG4gICAgICBsYXN0R2xvYmFsSFRNTDVVUkwgPSBudWxsO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdXJsO1xyXG5cclxuICB9O1xyXG5cclxuICBodG1sNUNhblBsYXkgPSBmdW5jdGlvbihvKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcnkgdG8gZmluZCBNSU1FLCB0ZXN0IGFuZCByZXR1cm4gdHJ1dGhpbmVzc1xyXG4gICAgICogbyA9IHtcclxuICAgICAqICB1cmw6ICcvcGF0aC90by9hbi5tcDMnLFxyXG4gICAgICogIHR5cGU6ICdhdWRpby9tcDMnXHJcbiAgICAgKiB9XHJcbiAgICAgKi9cclxuXHJcbiAgICBpZiAoIXNtMi51c2VIVE1MNUF1ZGlvIHx8ICFzbTIuaGFzSFRNTDUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB1cmwgPSAoby51cmwgfHwgbnVsbCksXHJcbiAgICAgICAgbWltZSA9IChvLnR5cGUgfHwgbnVsbCksXHJcbiAgICAgICAgYUYgPSBzbTIuYXVkaW9Gb3JtYXRzLFxyXG4gICAgICAgIHJlc3VsdCxcclxuICAgICAgICBvZmZzZXQsXHJcbiAgICAgICAgZmlsZUV4dCxcclxuICAgICAgICBpdGVtO1xyXG5cclxuICAgIC8vIGFjY291bnQgZm9yIGtub3duIGNhc2VzIGxpa2UgYXVkaW8vbXAzXHJcblxyXG4gICAgaWYgKG1pbWUgJiYgc20yLmh0bWw1W21pbWVdICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIHJldHVybiAoc20yLmh0bWw1W21pbWVdICYmICFwcmVmZXJGbGFzaENoZWNrKG1pbWUpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWh0bWw1RXh0KSB7XHJcbiAgICAgIFxyXG4gICAgICBodG1sNUV4dCA9IFtdO1xyXG4gICAgICBcclxuICAgICAgZm9yIChpdGVtIGluIGFGKSB7XHJcbiAgICAgIFxyXG4gICAgICAgIGlmIChhRi5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG4gICAgICBcclxuICAgICAgICAgIGh0bWw1RXh0LnB1c2goaXRlbSk7XHJcbiAgICAgIFxyXG4gICAgICAgICAgaWYgKGFGW2l0ZW1dLnJlbGF0ZWQpIHtcclxuICAgICAgICAgICAgaHRtbDVFeHQgPSBodG1sNUV4dC5jb25jYXQoYUZbaXRlbV0ucmVsYXRlZCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGh0bWw1RXh0ID0gbmV3IFJlZ0V4cCgnXFxcXC4oJytodG1sNUV4dC5qb2luKCd8JykrJykoXFxcXD8uKik/JCcsJ2knKTtcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE86IFN0cmlwIFVSTCBxdWVyaWVzLCBldGMuXHJcbiAgICBmaWxlRXh0ID0gKHVybCA/IHVybC50b0xvd2VyQ2FzZSgpLm1hdGNoKGh0bWw1RXh0KSA6IG51bGwpO1xyXG5cclxuICAgIGlmICghZmlsZUV4dCB8fCAhZmlsZUV4dC5sZW5ndGgpIHtcclxuICAgICAgXHJcbiAgICAgIGlmICghbWltZSkge1xyXG4gICAgICBcclxuICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgIFxyXG4gICAgICAgIC8vIGF1ZGlvL21wMyAtPiBtcDMsIHJlc3VsdCBzaG91bGQgYmUga25vd25cclxuICAgICAgICBvZmZzZXQgPSBtaW1lLmluZGV4T2YoJzsnKTtcclxuICAgICAgXHJcbiAgICAgICAgLy8gc3RyaXAgXCJhdWRpby9YOyBjb2RlY3MuLi5cIlxyXG4gICAgICAgIGZpbGVFeHQgPSAob2Zmc2V0ICE9PSAtMSA/IG1pbWUuc3Vic3RyKDAsb2Zmc2V0KSA6IG1pbWUpLnN1YnN0cig2KTtcclxuICAgICAgXHJcbiAgICAgIH1cclxuICAgIFxyXG4gICAgfSBlbHNlIHtcclxuICAgIFxyXG4gICAgICAvLyBtYXRjaCB0aGUgcmF3IGV4dGVuc2lvbiBuYW1lIC0gXCJtcDNcIiwgZm9yIGV4YW1wbGVcclxuICAgICAgZmlsZUV4dCA9IGZpbGVFeHRbMV07XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZmlsZUV4dCAmJiBzbTIuaHRtbDVbZmlsZUV4dF0gIT09IF91bmRlZmluZWQpIHtcclxuICAgIFxyXG4gICAgICAvLyByZXN1bHQga25vd25cclxuICAgICAgcmVzdWx0ID0gKHNtMi5odG1sNVtmaWxlRXh0XSAmJiAhcHJlZmVyRmxhc2hDaGVjayhmaWxlRXh0KSk7XHJcbiAgICBcclxuICAgIH0gZWxzZSB7XHJcbiAgICBcclxuICAgICAgbWltZSA9ICdhdWRpby8nICsgZmlsZUV4dDtcclxuICAgICAgcmVzdWx0ID0gc20yLmh0bWw1LmNhblBsYXlUeXBlKHt0eXBlOm1pbWV9KTtcclxuICAgIFxyXG4gICAgICBzbTIuaHRtbDVbZmlsZUV4dF0gPSByZXN1bHQ7XHJcbiAgICBcclxuICAgICAgLy8gc20yLl93RCgnY2FuUGxheVR5cGUsIGZvdW5kIHJlc3VsdDogJyArIHJlc3VsdCk7XHJcbiAgICAgIHJlc3VsdCA9IChyZXN1bHQgJiYgc20yLmh0bWw1W21pbWVdICYmICFwcmVmZXJGbGFzaENoZWNrKG1pbWUpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICB0ZXN0SFRNTDUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEludGVybmFsOiBJdGVyYXRlcyBvdmVyIGF1ZGlvRm9ybWF0cywgZGV0ZXJtaW5pbmcgc3VwcG9ydCBlZy4gYXVkaW8vbXAzLCBhdWRpby9tcGVnIGFuZCBzbyBvblxyXG4gICAgICogYXNzaWducyByZXN1bHRzIHRvIGh0bWw1W10gYW5kIGZsYXNoW10uXHJcbiAgICAgKi9cclxuXHJcbiAgICBpZiAoIXNtMi51c2VIVE1MNUF1ZGlvIHx8ICFzbTIuaGFzSFRNTDUpIHtcclxuICAgIFxyXG4gICAgICAvLyB3aXRob3V0IEhUTUw1LCB3ZSBuZWVkIEZsYXNoLlxyXG4gICAgICBzbTIuaHRtbDUudXNpbmdGbGFzaCA9IHRydWU7XHJcbiAgICAgIG5lZWRzRmxhc2ggPSB0cnVlO1xyXG4gICAgXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIC8vIGRvdWJsZS13aGFtbXk6IE9wZXJhIDkuNjQgdGhyb3dzIFdST05HX0FSR1VNRU5UU19FUlIgaWYgbm8gcGFyYW1ldGVyIHBhc3NlZCB0byBBdWRpbygpLCBhbmQgV2Via2l0ICsgaU9TIGhhcHBpbHkgdHJpZXMgdG8gbG9hZCBcIm51bGxcIiBhcyBhIFVSTC4gOi9cclxuICAgIHZhciBhID0gKEF1ZGlvICE9PSBfdW5kZWZpbmVkID8gKGlzT3BlcmEgJiYgb3BlcmEudmVyc2lvbigpIDwgMTAgPyBuZXcgQXVkaW8obnVsbCkgOiBuZXcgQXVkaW8oKSkgOiBudWxsKSxcclxuICAgICAgICBpdGVtLCBsb29rdXAsIHN1cHBvcnQgPSB7fSwgYUYsIGk7XHJcblxyXG4gICAgZnVuY3Rpb24gY3AobSkge1xyXG5cclxuICAgICAgdmFyIGNhblBsYXksIGosXHJcbiAgICAgICAgICByZXN1bHQgPSBmYWxzZSxcclxuICAgICAgICAgIGlzT0sgPSBmYWxzZTtcclxuXHJcbiAgICAgIGlmICghYSB8fCB0eXBlb2YgYS5jYW5QbGF5VHlwZSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChtIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgIFxyXG4gICAgICAgIC8vIGl0ZXJhdGUgdGhyb3VnaCBhbGwgbWltZSB0eXBlcywgcmV0dXJuIGFueSBzdWNjZXNzZXNcclxuICAgIFxyXG4gICAgICAgIGZvciAoaSA9IDAsIGogPSBtLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgXHJcbiAgICAgICAgICBpZiAoc20yLmh0bWw1W21baV1dIHx8IGEuY2FuUGxheVR5cGUobVtpXSkubWF0Y2goc20yLmh0bWw1VGVzdCkpIHtcclxuICAgIFxyXG4gICAgICAgICAgICBpc09LID0gdHJ1ZTtcclxuICAgICAgICAgICAgc20yLmh0bWw1W21baV1dID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgICAgICAgICAvLyBub3RlIGZsYXNoIHN1cHBvcnQsIHRvb1xyXG4gICAgICAgICAgICBzbTIuZmxhc2hbbVtpXV0gPSAhIShtW2ldLm1hdGNoKGZsYXNoTUlNRSkpO1xyXG4gICAgXHJcbiAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICByZXN1bHQgPSBpc09LO1xyXG4gICAgXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICBcclxuICAgICAgICBjYW5QbGF5ID0gKGEgJiYgdHlwZW9mIGEuY2FuUGxheVR5cGUgPT09ICdmdW5jdGlvbicgPyBhLmNhblBsYXlUeXBlKG0pIDogZmFsc2UpO1xyXG4gICAgICAgIHJlc3VsdCA9ICEhKGNhblBsYXkgJiYgKGNhblBsYXkubWF0Y2goc20yLmh0bWw1VGVzdCkpKTtcclxuICAgIFxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyB0ZXN0IGFsbCByZWdpc3RlcmVkIGZvcm1hdHMgKyBjb2RlY3NcclxuXHJcbiAgICBhRiA9IHNtMi5hdWRpb0Zvcm1hdHM7XHJcblxyXG4gICAgZm9yIChpdGVtIGluIGFGKSB7XHJcblxyXG4gICAgICBpZiAoYUYuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuXHJcbiAgICAgICAgbG9va3VwID0gJ2F1ZGlvLycgKyBpdGVtO1xyXG5cclxuICAgICAgICBzdXBwb3J0W2l0ZW1dID0gY3AoYUZbaXRlbV0udHlwZSk7XHJcblxyXG4gICAgICAgIC8vIHdyaXRlIGJhY2sgZ2VuZXJpYyB0eXBlIHRvbywgZWcuIGF1ZGlvL21wM1xyXG4gICAgICAgIHN1cHBvcnRbbG9va3VwXSA9IHN1cHBvcnRbaXRlbV07XHJcblxyXG4gICAgICAgIC8vIGFzc2lnbiBmbGFzaFxyXG4gICAgICAgIGlmIChpdGVtLm1hdGNoKGZsYXNoTUlNRSkpIHtcclxuXHJcbiAgICAgICAgICBzbTIuZmxhc2hbaXRlbV0gPSB0cnVlO1xyXG4gICAgICAgICAgc20yLmZsYXNoW2xvb2t1cF0gPSB0cnVlO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIHNtMi5mbGFzaFtpdGVtXSA9IGZhbHNlO1xyXG4gICAgICAgICAgc20yLmZsYXNoW2xvb2t1cF0gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBhc3NpZ24gcmVzdWx0IHRvIHJlbGF0ZWQgZm9ybWF0cywgdG9vXHJcblxyXG4gICAgICAgIGlmIChhRltpdGVtXSAmJiBhRltpdGVtXS5yZWxhdGVkKSB7XHJcblxyXG4gICAgICAgICAgZm9yIChpID0gYUZbaXRlbV0ucmVsYXRlZC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG5cclxuICAgICAgICAgICAgLy8gZWcuIGF1ZGlvL200YVxyXG4gICAgICAgICAgICBzdXBwb3J0WydhdWRpby8nICsgYUZbaXRlbV0ucmVsYXRlZFtpXV0gPSBzdXBwb3J0W2l0ZW1dO1xyXG4gICAgICAgICAgICBzbTIuaHRtbDVbYUZbaXRlbV0ucmVsYXRlZFtpXV0gPSBzdXBwb3J0W2l0ZW1dO1xyXG4gICAgICAgICAgICBzbTIuZmxhc2hbYUZbaXRlbV0ucmVsYXRlZFtpXV0gPSBzdXBwb3J0W2l0ZW1dO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzdXBwb3J0LmNhblBsYXlUeXBlID0gKGEgPyBjcCA6IG51bGwpO1xyXG4gICAgc20yLmh0bWw1ID0gbWl4aW4oc20yLmh0bWw1LCBzdXBwb3J0KTtcclxuXHJcbiAgICBzbTIuaHRtbDUudXNpbmdGbGFzaCA9IGZlYXR1cmVDaGVjaygpO1xyXG4gICAgbmVlZHNGbGFzaCA9IHNtMi5odG1sNS51c2luZ0ZsYXNoO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBzdHJpbmdzID0ge1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgbm90UmVhZHk6ICdVbmF2YWlsYWJsZSAtIHdhaXQgdW50aWwgb25yZWFkeSgpIGhhcyBmaXJlZC4nLFxyXG4gICAgbm90T0s6ICdBdWRpbyBzdXBwb3J0IGlzIG5vdCBhdmFpbGFibGUuJyxcclxuICAgIGRvbUVycm9yOiBzbSArICdleGNlcHRpb24gY2F1Z2h0IHdoaWxlIGFwcGVuZGluZyBTV0YgdG8gRE9NLicsXHJcbiAgICBzcGNXbW9kZTogJ1JlbW92aW5nIHdtb2RlLCBwcmV2ZW50aW5nIGtub3duIFNXRiBsb2FkaW5nIGlzc3VlKHMpJyxcclxuICAgIHN3ZjQwNDogc21jICsgJ1ZlcmlmeSB0aGF0ICVzIGlzIGEgdmFsaWQgcGF0aC4nLFxyXG4gICAgdHJ5RGVidWc6ICdUcnkgJyArIHNtICsgJy5kZWJ1Z0ZsYXNoID0gdHJ1ZSBmb3IgbW9yZSBzZWN1cml0eSBkZXRhaWxzIChvdXRwdXQgZ29lcyB0byBTV0YuKScsXHJcbiAgICBjaGVja1NXRjogJ1NlZSBTV0Ygb3V0cHV0IGZvciBtb3JlIGRlYnVnIGluZm8uJyxcclxuICAgIGxvY2FsRmFpbDogc21jICsgJ05vbi1IVFRQIHBhZ2UgKCcgKyBkb2MubG9jYXRpb24ucHJvdG9jb2wgKyAnIFVSTD8pIFJldmlldyBGbGFzaCBwbGF5ZXIgc2VjdXJpdHkgc2V0dGluZ3MgZm9yIHRoaXMgc3BlY2lhbCBjYXNlOlxcbmh0dHA6Ly93d3cubWFjcm9tZWRpYS5jb20vc3VwcG9ydC9kb2N1bWVudGF0aW9uL2VuL2ZsYXNocGxheWVyL2hlbHAvc2V0dGluZ3NfbWFuYWdlcjA0Lmh0bWxcXG5NYXkgbmVlZCB0byBhZGQvYWxsb3cgcGF0aCwgZWcuIGM6L3NtMi8gb3IgL3VzZXJzL21lL3NtMi8nLFxyXG4gICAgd2FpdEZvY3VzOiBzbWMgKyAnU3BlY2lhbCBjYXNlOiBXYWl0aW5nIGZvciBTV0YgdG8gbG9hZCB3aXRoIHdpbmRvdyBmb2N1cy4uLicsXHJcbiAgICB3YWl0Rm9yZXZlcjogc21jICsgJ1dhaXRpbmcgaW5kZWZpbml0ZWx5IGZvciBGbGFzaCAod2lsbCByZWNvdmVyIGlmIHVuYmxvY2tlZCkuLi4nLFxyXG4gICAgd2FpdFNXRjogc21jICsgJ1dhaXRpbmcgZm9yIDEwMCUgU1dGIGxvYWQuLi4nLFxyXG4gICAgbmVlZEZ1bmN0aW9uOiBzbWMgKyAnRnVuY3Rpb24gb2JqZWN0IGV4cGVjdGVkIGZvciAlcycsXHJcbiAgICBiYWRJRDogJ1NvdW5kIElEIFwiJXNcIiBzaG91bGQgYmUgYSBzdHJpbmcsIHN0YXJ0aW5nIHdpdGggYSBub24tbnVtZXJpYyBjaGFyYWN0ZXInLFxyXG4gICAgY3VycmVudE9iajogc21jICsgJ19kZWJ1ZygpOiBDdXJyZW50IHNvdW5kIG9iamVjdHMnLFxyXG4gICAgd2FpdE9ubG9hZDogc21jICsgJ1dhaXRpbmcgZm9yIHdpbmRvdy5vbmxvYWQoKScsXHJcbiAgICBkb2NMb2FkZWQ6IHNtYyArICdEb2N1bWVudCBhbHJlYWR5IGxvYWRlZCcsXHJcbiAgICBvbmxvYWQ6IHNtYyArICdpbml0Q29tcGxldGUoKTogY2FsbGluZyBzb3VuZE1hbmFnZXIub25sb2FkKCknLFxyXG4gICAgb25sb2FkT0s6IHNtICsgJy5vbmxvYWQoKSBjb21wbGV0ZScsXHJcbiAgICBkaWRJbml0OiBzbWMgKyAnaW5pdCgpOiBBbHJlYWR5IGNhbGxlZD8nLFxyXG4gICAgc2VjTm90ZTogJ0ZsYXNoIHNlY3VyaXR5IG5vdGU6IE5ldHdvcmsvaW50ZXJuZXQgVVJMcyB3aWxsIG5vdCBsb2FkIGR1ZSB0byBzZWN1cml0eSByZXN0cmljdGlvbnMuIEFjY2VzcyBjYW4gYmUgY29uZmlndXJlZCB2aWEgRmxhc2ggUGxheWVyIEdsb2JhbCBTZWN1cml0eSBTZXR0aW5ncyBQYWdlOiBodHRwOi8vd3d3Lm1hY3JvbWVkaWEuY29tL3N1cHBvcnQvZG9jdW1lbnRhdGlvbi9lbi9mbGFzaHBsYXllci9oZWxwL3NldHRpbmdzX21hbmFnZXIwNC5odG1sJyxcclxuICAgIGJhZFJlbW92ZTogc21jICsgJ0ZhaWxlZCB0byByZW1vdmUgRmxhc2ggbm9kZS4nLFxyXG4gICAgc2h1dGRvd246IHNtICsgJy5kaXNhYmxlKCk6IFNodXR0aW5nIGRvd24nLFxyXG4gICAgcXVldWU6IHNtYyArICdRdWV1ZWluZyAlcyBoYW5kbGVyJyxcclxuICAgIHNtRXJyb3I6ICdTTVNvdW5kLmxvYWQoKTogRXhjZXB0aW9uOiBKUy1GbGFzaCBjb21tdW5pY2F0aW9uIGZhaWxlZCwgb3IgSlMgZXJyb3IuJyxcclxuICAgIGZiVGltZW91dDogJ05vIGZsYXNoIHJlc3BvbnNlLCBhcHBseWluZyAuJyArIHN3ZkNTUy5zd2ZUaW1lZG91dCArICcgQ1NTLi4uJyxcclxuICAgIGZiTG9hZGVkOiAnRmxhc2ggbG9hZGVkJyxcclxuICAgIGZiSGFuZGxlcjogc21jICsgJ2ZsYXNoQmxvY2tIYW5kbGVyKCknLFxyXG4gICAgbWFuVVJMOiAnU01Tb3VuZC5sb2FkKCk6IFVzaW5nIG1hbnVhbGx5LWFzc2lnbmVkIFVSTCcsXHJcbiAgICBvblVSTDogc20gKyAnLmxvYWQoKTogY3VycmVudCBVUkwgYWxyZWFkeSBhc3NpZ25lZC4nLFxyXG4gICAgYmFkRlY6IHNtICsgJy5mbGFzaFZlcnNpb24gbXVzdCBiZSA4IG9yIDkuIFwiJXNcIiBpcyBpbnZhbGlkLiBSZXZlcnRpbmcgdG8gJXMuJyxcclxuICAgIGFzMmxvb3A6ICdOb3RlOiBTZXR0aW5nIHN0cmVhbTpmYWxzZSBzbyBsb29waW5nIGNhbiB3b3JrIChmbGFzaCA4IGxpbWl0YXRpb24pJyxcclxuICAgIG5vTlNMb29wOiAnTm90ZTogTG9vcGluZyBub3QgaW1wbGVtZW50ZWQgZm9yIE1vdmllU3RhciBmb3JtYXRzJyxcclxuICAgIG5lZWRmbDk6ICdOb3RlOiBTd2l0Y2hpbmcgdG8gZmxhc2ggOSwgcmVxdWlyZWQgZm9yIE1QNCBmb3JtYXRzLicsXHJcbiAgICBtZlRpbWVvdXQ6ICdTZXR0aW5nIGZsYXNoTG9hZFRpbWVvdXQgPSAwIChpbmZpbml0ZSkgZm9yIG9mZi1zY3JlZW4sIG1vYmlsZSBmbGFzaCBjYXNlJyxcclxuICAgIG5lZWRGbGFzaDogc21jICsgJ0ZhdGFsIGVycm9yOiBGbGFzaCBpcyBuZWVkZWQgdG8gcGxheSBzb21lIHJlcXVpcmVkIGZvcm1hdHMsIGJ1dCBpcyBub3QgYXZhaWxhYmxlLicsXHJcbiAgICBnb3RGb2N1czogc21jICsgJ0dvdCB3aW5kb3cgZm9jdXMuJyxcclxuICAgIHBvbGljeTogJ0VuYWJsaW5nIHVzZVBvbGljeUZpbGUgZm9yIGRhdGEgYWNjZXNzJyxcclxuICAgIHNldHVwOiBzbSArICcuc2V0dXAoKTogYWxsb3dlZCBwYXJhbWV0ZXJzOiAlcycsXHJcbiAgICBzZXR1cEVycm9yOiBzbSArICcuc2V0dXAoKTogXCIlc1wiIGNhbm5vdCBiZSBhc3NpZ25lZCB3aXRoIHRoaXMgbWV0aG9kLicsXHJcbiAgICBzZXR1cFVuZGVmOiBzbSArICcuc2V0dXAoKTogQ291bGQgbm90IGZpbmQgb3B0aW9uIFwiJXNcIicsXHJcbiAgICBzZXR1cExhdGU6IHNtICsgJy5zZXR1cCgpOiB1cmwsIGZsYXNoVmVyc2lvbiBhbmQgaHRtbDVUZXN0IHByb3BlcnR5IGNoYW5nZXMgd2lsbCBub3QgdGFrZSBlZmZlY3QgdW50aWwgcmVib290KCkuJyxcclxuICAgIG5vVVJMOiBzbWMgKyAnRmxhc2ggVVJMIHJlcXVpcmVkLiBDYWxsIHNvdW5kTWFuYWdlci5zZXR1cCh7dXJsOi4uLn0pIHRvIGdldCBzdGFydGVkLicsXHJcbiAgICBzbTJMb2FkZWQ6ICdTb3VuZE1hbmFnZXIgMjogUmVhZHkuICcgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKDEwMDAzKSxcclxuICAgIHJlc2V0OiBzbSArICcucmVzZXQoKTogUmVtb3ZpbmcgZXZlbnQgY2FsbGJhY2tzJyxcclxuICAgIG1vYmlsZVVBOiAnTW9iaWxlIFVBIGRldGVjdGVkLCBwcmVmZXJyaW5nIEhUTUw1IGJ5IGRlZmF1bHQuJyxcclxuICAgIGdsb2JhbEhUTUw1OiAnVXNpbmcgc2luZ2xldG9uIEhUTUw1IEF1ZGlvKCkgcGF0dGVybiBmb3IgdGhpcyBkZXZpY2UuJyxcclxuICAgIGlnbm9yZU1vYmlsZTogJ0lnbm9yaW5nIG1vYmlsZSByZXN0cmljdGlvbnMgZm9yIHRoaXMgZGV2aWNlLidcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgc3RyID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gaW50ZXJuYWwgc3RyaW5nIHJlcGxhY2UgaGVscGVyLlxyXG4gICAgLy8gYXJndW1lbnRzOiBvIFssaXRlbXMgdG8gcmVwbGFjZV1cclxuICAgIC8vIDxkPlxyXG5cclxuICAgIHZhciBhcmdzLFxyXG4gICAgICAgIGksIGosIG8sXHJcbiAgICAgICAgc3N0cjtcclxuXHJcbiAgICAvLyByZWFsIGFycmF5LCBwbGVhc2VcclxuICAgIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcblxyXG4gICAgLy8gZmlyc3QgYXJndW1lbnRcclxuICAgIG8gPSBhcmdzLnNoaWZ0KCk7XHJcblxyXG4gICAgc3N0ciA9IChzdHJpbmdzICYmIHN0cmluZ3Nbb10gPyBzdHJpbmdzW29dIDogJycpO1xyXG5cclxuICAgIGlmIChzc3RyICYmIGFyZ3MgJiYgYXJncy5sZW5ndGgpIHtcclxuICAgICAgZm9yIChpID0gMCwgaiA9IGFyZ3MubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgc3N0ciA9IHNzdHIucmVwbGFjZSgnJXMnLCBhcmdzW2ldKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzc3RyO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICBsb29wRml4ID0gZnVuY3Rpb24oc09wdCkge1xyXG5cclxuICAgIC8vIGZsYXNoIDggcmVxdWlyZXMgc3RyZWFtID0gZmFsc2UgZm9yIGxvb3BpbmcgdG8gd29ya1xyXG4gICAgaWYgKGZWID09PSA4ICYmIHNPcHQubG9vcHMgPiAxICYmIHNPcHQuc3RyZWFtKSB7XHJcbiAgICAgIF93RFMoJ2FzMmxvb3AnKTtcclxuICAgICAgc09wdC5zdHJlYW0gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc09wdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgcG9saWN5Rml4ID0gZnVuY3Rpb24oc09wdCwgc1ByZSkge1xyXG5cclxuICAgIGlmIChzT3B0ICYmICFzT3B0LnVzZVBvbGljeUZpbGUgJiYgKHNPcHQub25pZDMgfHwgc09wdC51c2VQZWFrRGF0YSB8fCBzT3B0LnVzZVdhdmVmb3JtRGF0YSB8fCBzT3B0LnVzZUVRRGF0YSkpIHtcclxuICAgICAgc20yLl93RCgoc1ByZSB8fCAnJykgKyBzdHIoJ3BvbGljeScpKTtcclxuICAgICAgc09wdC51c2VQb2xpY3lGaWxlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc09wdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgY29tcGxhaW4gPSBmdW5jdGlvbihzTXNnKSB7XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAoaGFzQ29uc29sZSAmJiBjb25zb2xlLndhcm4gIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgY29uc29sZS53YXJuKHNNc2cpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc20yLl93RChzTXNnKTtcclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgZG9Ob3RoaW5nID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICB9O1xyXG5cclxuICBkaXNhYmxlT2JqZWN0ID0gZnVuY3Rpb24obykge1xyXG5cclxuICAgIHZhciBvUHJvcDtcclxuXHJcbiAgICBmb3IgKG9Qcm9wIGluIG8pIHtcclxuICAgICAgaWYgKG8uaGFzT3duUHJvcGVydHkob1Byb3ApICYmIHR5cGVvZiBvW29Qcm9wXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIG9bb1Byb3BdID0gZG9Ob3RoaW5nO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb1Byb3AgPSBudWxsO1xyXG5cclxuICB9O1xyXG5cclxuICBmYWlsU2FmZWx5ID0gZnVuY3Rpb24oYk5vRGlzYWJsZSkge1xyXG5cclxuICAgIC8vIGdlbmVyYWwgZmFpbHVyZSBleGNlcHRpb24gaGFuZGxlclxyXG5cclxuICAgIGlmIChiTm9EaXNhYmxlID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIGJOb0Rpc2FibGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZGlzYWJsZWQgfHwgYk5vRGlzYWJsZSkge1xyXG4gICAgICBzbTIuZGlzYWJsZShiTm9EaXNhYmxlKTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgbm9ybWFsaXplTW92aWVVUkwgPSBmdW5jdGlvbihzbVVSTCkge1xyXG5cclxuICAgIHZhciB1cmxQYXJhbXMgPSBudWxsLCB1cmw7XHJcblxyXG4gICAgaWYgKHNtVVJMKSB7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoc21VUkwubWF0Y2goL1xcLnN3ZihcXD8uKik/JC9pKSkge1xyXG4gICAgICBcclxuICAgICAgICB1cmxQYXJhbXMgPSBzbVVSTC5zdWJzdHIoc21VUkwudG9Mb3dlckNhc2UoKS5sYXN0SW5kZXhPZignLnN3Zj8nKSArIDQpO1xyXG4gICAgICBcclxuICAgICAgICBpZiAodXJsUGFyYW1zKSB7XHJcbiAgICAgICAgICAvLyBhc3N1bWUgdXNlciBrbm93cyB3aGF0IHRoZXkncmUgZG9pbmdcclxuICAgICAgICAgIHJldHVybiBzbVVSTDtcclxuICAgICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB9IGVsc2UgaWYgKHNtVVJMLmxhc3RJbmRleE9mKCcvJykgIT09IHNtVVJMLmxlbmd0aCAtIDEpIHtcclxuICAgICAgXHJcbiAgICAgICAgLy8gYXBwZW5kIHRyYWlsaW5nIHNsYXNoLCBpZiBuZWVkZWRcclxuICAgICAgICBzbVVSTCArPSAnLyc7XHJcbiAgICAgIFxyXG4gICAgICB9XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICB1cmwgPSAoc21VUkwgJiYgc21VUkwubGFzdEluZGV4T2YoJy8nKSAhPT0gLSAxID8gc21VUkwuc3Vic3RyKDAsIHNtVVJMLmxhc3RJbmRleE9mKCcvJykgKyAxKSA6ICcuLycpICsgc20yLm1vdmllVVJMO1xyXG5cclxuICAgIGlmIChzbTIubm9TV0ZDYWNoZSkge1xyXG4gICAgICB1cmwgKz0gKCc/dHM9JyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdXJsO1xyXG5cclxuICB9O1xyXG5cclxuICBzZXRWZXJzaW9uSW5mbyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIHNob3J0LWhhbmQgZm9yIGludGVybmFsIHVzZVxyXG5cclxuICAgIGZWID0gcGFyc2VJbnQoc20yLmZsYXNoVmVyc2lvbiwgMTApO1xyXG5cclxuICAgIGlmIChmViAhPT0gOCAmJiBmViAhPT0gOSkge1xyXG4gICAgICBzbTIuX3dEKHN0cignYmFkRlYnLCBmViwgZGVmYXVsdEZsYXNoVmVyc2lvbikpO1xyXG4gICAgICBzbTIuZmxhc2hWZXJzaW9uID0gZlYgPSBkZWZhdWx0Rmxhc2hWZXJzaW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRlYnVnIGZsYXNoIG1vdmllLCBpZiBhcHBsaWNhYmxlXHJcblxyXG4gICAgdmFyIGlzRGVidWcgPSAoc20yLmRlYnVnTW9kZSB8fCBzbTIuZGVidWdGbGFzaCA/ICdfZGVidWcuc3dmJyA6ICcuc3dmJyk7XHJcblxyXG4gICAgaWYgKHNtMi51c2VIVE1MNUF1ZGlvICYmICFzbTIuaHRtbDVPbmx5ICYmIHNtMi5hdWRpb0Zvcm1hdHMubXA0LnJlcXVpcmVkICYmIGZWIDwgOSkge1xyXG4gICAgICBzbTIuX3dEKHN0cignbmVlZGZsOScpKTtcclxuICAgICAgc20yLmZsYXNoVmVyc2lvbiA9IGZWID0gOTtcclxuICAgIH1cclxuXHJcbiAgICBzbTIudmVyc2lvbiA9IHNtMi52ZXJzaW9uTnVtYmVyICsgKHNtMi5odG1sNU9ubHkgPyAnIChIVE1MNS1vbmx5IG1vZGUpJyA6IChmViA9PT0gOSA/ICcgKEFTMy9GbGFzaCA5KScgOiAnIChBUzIvRmxhc2ggOCknKSk7XHJcblxyXG4gICAgLy8gc2V0IHVwIGRlZmF1bHQgb3B0aW9uc1xyXG4gICAgaWYgKGZWID4gOCkge1xyXG4gICAgXHJcbiAgICAgIC8vICtmbGFzaCA5IGJhc2Ugb3B0aW9uc1xyXG4gICAgICBzbTIuZGVmYXVsdE9wdGlvbnMgPSBtaXhpbihzbTIuZGVmYXVsdE9wdGlvbnMsIHNtMi5mbGFzaDlPcHRpb25zKTtcclxuICAgICAgc20yLmZlYXR1cmVzLmJ1ZmZlcmluZyA9IHRydWU7XHJcbiAgICBcclxuICAgICAgLy8gK21vdmllc3RhciBzdXBwb3J0XHJcbiAgICAgIHNtMi5kZWZhdWx0T3B0aW9ucyA9IG1peGluKHNtMi5kZWZhdWx0T3B0aW9ucywgc20yLm1vdmllU3Rhck9wdGlvbnMpO1xyXG4gICAgICBzbTIuZmlsZVBhdHRlcm5zLmZsYXNoOSA9IG5ldyBSZWdFeHAoJ1xcXFwuKG1wM3wnICsgbmV0U3RyZWFtVHlwZXMuam9pbignfCcpICsgJykoXFxcXD8uKik/JCcsICdpJyk7XHJcbiAgICAgIHNtMi5mZWF0dXJlcy5tb3ZpZVN0YXIgPSB0cnVlO1xyXG4gICAgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgXHJcbiAgICAgIHNtMi5mZWF0dXJlcy5tb3ZpZVN0YXIgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlZ0V4cCBmb3IgZmxhc2ggY2FuUGxheSgpLCBldGMuXHJcbiAgICBzbTIuZmlsZVBhdHRlcm4gPSBzbTIuZmlsZVBhdHRlcm5zWyhmViAhPT0gOCA/ICdmbGFzaDknIDogJ2ZsYXNoOCcpXTtcclxuXHJcbiAgICAvLyBpZiBhcHBsaWNhYmxlLCB1c2UgX2RlYnVnIHZlcnNpb25zIG9mIFNXRnNcclxuICAgIHNtMi5tb3ZpZVVSTCA9IChmViA9PT0gOCA/ICdzb3VuZG1hbmFnZXIyLnN3ZicgOiAnc291bmRtYW5hZ2VyMl9mbGFzaDkuc3dmJykucmVwbGFjZSgnLnN3ZicsIGlzRGVidWcpO1xyXG5cclxuICAgIHNtMi5mZWF0dXJlcy5wZWFrRGF0YSA9IHNtMi5mZWF0dXJlcy53YXZlZm9ybURhdGEgPSBzbTIuZmVhdHVyZXMuZXFEYXRhID0gKGZWID4gOCk7XHJcblxyXG4gIH07XHJcblxyXG4gIHNldFBvbGxpbmcgPSBmdW5jdGlvbihiUG9sbGluZywgYkhpZ2hQZXJmb3JtYW5jZSkge1xyXG5cclxuICAgIGlmICghZmxhc2gpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGZsYXNoLl9zZXRQb2xsaW5nKGJQb2xsaW5nLCBiSGlnaFBlcmZvcm1hbmNlKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgaW5pdERlYnVnID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gc3RhcnRzIGRlYnVnIG1vZGUsIGNyZWF0aW5nIG91dHB1dCA8ZGl2PiBmb3IgVUFzIHdpdGhvdXQgY29uc29sZSBvYmplY3RcclxuXHJcbiAgICAvLyBhbGxvdyBmb3JjZSBvZiBkZWJ1ZyBtb2RlIHZpYSBVUkxcclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKHNtMi5kZWJ1Z1VSTFBhcmFtLnRlc3Qod2wpKSB7XHJcbiAgICAgIHNtMi5zZXR1cE9wdGlvbnMuZGVidWdNb2RlID0gc20yLmRlYnVnTW9kZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlkKHNtMi5kZWJ1Z0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG9ELCBvRGVidWcsIG9UYXJnZXQsIG9Ub2dnbGUsIHRtcDtcclxuXHJcbiAgICBpZiAoc20yLmRlYnVnTW9kZSAmJiAhaWQoc20yLmRlYnVnSUQpICYmICghaGFzQ29uc29sZSB8fCAhc20yLnVzZUNvbnNvbGUgfHwgIXNtMi5jb25zb2xlT25seSkpIHtcclxuXHJcbiAgICAgIG9EID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICBvRC5pZCA9IHNtMi5kZWJ1Z0lEICsgJy10b2dnbGUnO1xyXG5cclxuICAgICAgb1RvZ2dsZSA9IHtcclxuICAgICAgICAncG9zaXRpb24nOiAnZml4ZWQnLFxyXG4gICAgICAgICdib3R0b20nOiAnMHB4JyxcclxuICAgICAgICAncmlnaHQnOiAnMHB4JyxcclxuICAgICAgICAnd2lkdGgnOiAnMS4yZW0nLFxyXG4gICAgICAgICdoZWlnaHQnOiAnMS4yZW0nLFxyXG4gICAgICAgICdsaW5lSGVpZ2h0JzogJzEuMmVtJyxcclxuICAgICAgICAnbWFyZ2luJzogJzJweCcsXHJcbiAgICAgICAgJ3RleHRBbGlnbic6ICdjZW50ZXInLFxyXG4gICAgICAgICdib3JkZXInOiAnMXB4IHNvbGlkICM5OTknLFxyXG4gICAgICAgICdjdXJzb3InOiAncG9pbnRlcicsXHJcbiAgICAgICAgJ2JhY2tncm91bmQnOiAnI2ZmZicsXHJcbiAgICAgICAgJ2NvbG9yJzogJyMzMzMnLFxyXG4gICAgICAgICd6SW5kZXgnOiAxMDAwMVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgb0QuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKCctJykpO1xyXG4gICAgICBvRC5vbmNsaWNrID0gdG9nZ2xlRGVidWc7XHJcbiAgICAgIG9ELnRpdGxlID0gJ1RvZ2dsZSBTTTIgZGVidWcgY29uc29sZSc7XHJcblxyXG4gICAgICBpZiAodWEubWF0Y2goL21zaWUgNi9pKSkge1xyXG4gICAgICAgIG9ELnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgICBvRC5zdHlsZS5jdXJzb3IgPSAnaGFuZCc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAodG1wIGluIG9Ub2dnbGUpIHtcclxuICAgICAgICBpZiAob1RvZ2dsZS5oYXNPd25Qcm9wZXJ0eSh0bXApKSB7XHJcbiAgICAgICAgICBvRC5zdHlsZVt0bXBdID0gb1RvZ2dsZVt0bXBdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgb0RlYnVnID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICBvRGVidWcuaWQgPSBzbTIuZGVidWdJRDtcclxuICAgICAgb0RlYnVnLnN0eWxlLmRpc3BsYXkgPSAoc20yLmRlYnVnTW9kZSA/ICdibG9jaycgOiAnbm9uZScpO1xyXG5cclxuICAgICAgaWYgKHNtMi5kZWJ1Z01vZGUgJiYgIWlkKG9ELmlkKSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBvVGFyZ2V0ID0gZ2V0RG9jdW1lbnQoKTtcclxuICAgICAgICAgIG9UYXJnZXQuYXBwZW5kQ2hpbGQob0QpO1xyXG4gICAgICAgIH0gY2F0Y2goZTIpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihzdHIoJ2RvbUVycm9yJykgKyAnIFxcbicgKyBlMi50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb1RhcmdldC5hcHBlbmRDaGlsZChvRGVidWcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG9UYXJnZXQgPSBudWxsO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICBpZENoZWNrID0gdGhpcy5nZXRTb3VuZEJ5SWQ7XHJcblxyXG4gIC8vIDxkPlxyXG4gIF93RFMgPSBmdW5jdGlvbihvLCBlcnJvckxldmVsKSB7XHJcblxyXG4gICAgcmV0dXJuICghbyA/ICcnIDogc20yLl93RChzdHIobyksIGVycm9yTGV2ZWwpKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgdG9nZ2xlRGVidWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgbyA9IGlkKHNtMi5kZWJ1Z0lEKSxcclxuICAgIG9UID0gaWQoc20yLmRlYnVnSUQgKyAnLXRvZ2dsZScpO1xyXG5cclxuICAgIGlmICghbykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRlYnVnT3Blbikge1xyXG4gICAgICAvLyBtaW5pbWl6ZVxyXG4gICAgICBvVC5pbm5lckhUTUwgPSAnKyc7XHJcbiAgICAgIG8uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG9ULmlubmVySFRNTCA9ICctJztcclxuICAgICAgby5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH1cclxuXHJcbiAgICBkZWJ1Z09wZW4gPSAhZGVidWdPcGVuO1xyXG5cclxuICB9O1xyXG5cclxuICBkZWJ1Z1RTID0gZnVuY3Rpb24oc0V2ZW50VHlwZSwgYlN1Y2Nlc3MsIHNNZXNzYWdlKSB7XHJcblxyXG4gICAgLy8gdHJvdWJsZXNob290ZXIgZGVidWcgaG9va3NcclxuXHJcbiAgICBpZiAod2luZG93LnNtMkRlYnVnZ2VyICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc20yRGVidWdnZXIuaGFuZGxlRXZlbnQoc0V2ZW50VHlwZSwgYlN1Y2Nlc3MsIHNNZXNzYWdlKTtcclxuICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgLy8gb2ggd2VsbFxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG4gIC8vIDwvZD5cclxuXHJcbiAgZ2V0U1dGQ1NTID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGNzcyA9IFtdO1xyXG5cclxuICAgIGlmIChzbTIuZGVidWdNb2RlKSB7XHJcbiAgICAgIGNzcy5wdXNoKHN3ZkNTUy5zbTJEZWJ1Zyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNtMi5kZWJ1Z0ZsYXNoKSB7XHJcbiAgICAgIGNzcy5wdXNoKHN3ZkNTUy5mbGFzaERlYnVnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc20yLnVzZUhpZ2hQZXJmb3JtYW5jZSkge1xyXG4gICAgICBjc3MucHVzaChzd2ZDU1MuaGlnaFBlcmYpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjc3Muam9pbignICcpO1xyXG5cclxuICB9O1xyXG5cclxuICBmbGFzaEJsb2NrSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vICpwb3NzaWJsZSogZmxhc2ggYmxvY2sgc2l0dWF0aW9uLlxyXG5cclxuICAgIHZhciBuYW1lID0gc3RyKCdmYkhhbmRsZXInKSxcclxuICAgICAgICBwID0gc20yLmdldE1vdmllUGVyY2VudCgpLFxyXG4gICAgICAgIGNzcyA9IHN3ZkNTUyxcclxuICAgICAgICBlcnJvciA9IHtcclxuICAgICAgICAgIHR5cGU6J0ZMQVNIQkxPQ0snXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG4gICAgICAvLyBubyBmbGFzaCwgb3IgdW51c2VkXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXNtMi5vaygpKSB7XHJcblxyXG4gICAgICBpZiAobmVlZHNGbGFzaCkge1xyXG4gICAgICAgIC8vIG1ha2UgdGhlIG1vdmllIG1vcmUgdmlzaWJsZSwgc28gdXNlciBjYW4gZml4XHJcbiAgICAgICAgc20yLm9NQy5jbGFzc05hbWUgPSBnZXRTV0ZDU1MoKSArICcgJyArIGNzcy5zd2ZEZWZhdWx0ICsgJyAnICsgKHAgPT09IG51bGwgPyBjc3Muc3dmVGltZWRvdXQgOiBjc3Muc3dmRXJyb3IpO1xyXG4gICAgICAgIHNtMi5fd0QobmFtZSArICc6ICcgKyBzdHIoJ2ZiVGltZW91dCcpICsgKHAgPyAnICgnICsgc3RyKCdmYkxvYWRlZCcpICsgJyknIDogJycpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLmRpZEZsYXNoQmxvY2sgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gZmlyZSBvbnJlYWR5KCksIGNvbXBsYWluIGxpZ2h0bHlcclxuICAgICAgcHJvY2Vzc09uRXZlbnRzKHtcclxuICAgICAgICB0eXBlOiAnb250aW1lb3V0JyxcclxuICAgICAgICBpZ25vcmVJbml0OiB0cnVlLFxyXG4gICAgICAgIGVycm9yOiBlcnJvclxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNhdGNoRXJyb3IoZXJyb3IpO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAvLyBTTTIgbG9hZGVkIE9LIChvciByZWNvdmVyZWQpXHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKHNtMi5kaWRGbGFzaEJsb2NrKSB7XHJcbiAgICAgICAgc20yLl93RChuYW1lICsgJzogVW5ibG9ja2VkJyk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgaWYgKHNtMi5vTUMpIHtcclxuICAgICAgICBzbTIub01DLmNsYXNzTmFtZSA9IFtnZXRTV0ZDU1MoKSwgY3NzLnN3ZkRlZmF1bHQsIGNzcy5zd2ZMb2FkZWQgKyAoc20yLmRpZEZsYXNoQmxvY2sgPyAnICcgKyBjc3Muc3dmVW5ibG9ja2VkIDogJycpXS5qb2luKCcgJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIGFkZE9uRXZlbnQgPSBmdW5jdGlvbihzVHlwZSwgb01ldGhvZCwgb1Njb3BlKSB7XHJcblxyXG4gICAgaWYgKG9uX3F1ZXVlW3NUeXBlXSA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICBvbl9xdWV1ZVtzVHlwZV0gPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBvbl9xdWV1ZVtzVHlwZV0ucHVzaCh7XHJcbiAgICAgICdtZXRob2QnOiBvTWV0aG9kLFxyXG4gICAgICAnc2NvcGUnOiAob1Njb3BlIHx8IG51bGwpLFxyXG4gICAgICAnZmlyZWQnOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gIH07XHJcblxyXG4gIHByb2Nlc3NPbkV2ZW50cyA9IGZ1bmN0aW9uKG9PcHRpb25zKSB7XHJcblxyXG4gICAgLy8gaWYgdW5zcGVjaWZpZWQsIGFzc3VtZSBPSy9lcnJvclxyXG5cclxuICAgIGlmICghb09wdGlvbnMpIHtcclxuICAgICAgb09wdGlvbnMgPSB7XHJcbiAgICAgICAgdHlwZTogKHNtMi5vaygpID8gJ29ucmVhZHknIDogJ29udGltZW91dCcpXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFkaWRJbml0ICYmIG9PcHRpb25zICYmICFvT3B0aW9ucy5pZ25vcmVJbml0KSB7XHJcbiAgICAgIC8vIG5vdCByZWFkeSB5ZXQuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob09wdGlvbnMudHlwZSA9PT0gJ29udGltZW91dCcgJiYgKHNtMi5vaygpIHx8IChkaXNhYmxlZCAmJiAhb09wdGlvbnMuaWdub3JlSW5pdCkpKSB7XHJcbiAgICAgIC8vIGludmFsaWQgY2FzZVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHN0YXR1cyA9IHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IChvT3B0aW9ucyAmJiBvT3B0aW9ucy5pZ25vcmVJbml0ID8gc20yLm9rKCkgOiAhZGlzYWJsZWQpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy8gcXVldWUgc3BlY2lmaWVkIGJ5IHR5cGUsIG9yIG5vbmVcclxuICAgICAgICBzcmNRdWV1ZSA9IChvT3B0aW9ucyAmJiBvT3B0aW9ucy50eXBlID8gb25fcXVldWVbb09wdGlvbnMudHlwZV0gfHwgW10gOiBbXSksXHJcblxyXG4gICAgICAgIHF1ZXVlID0gW10sIGksIGosXHJcbiAgICAgICAgYXJncyA9IFtzdGF0dXNdLFxyXG4gICAgICAgIGNhblJldHJ5ID0gKG5lZWRzRmxhc2ggJiYgIXNtMi5vaygpKTtcclxuXHJcbiAgICBpZiAob09wdGlvbnMuZXJyb3IpIHtcclxuICAgICAgYXJnc1swXS5lcnJvciA9IG9PcHRpb25zLmVycm9yO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAoaSA9IDAsIGogPSBzcmNRdWV1ZS5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgaWYgKHNyY1F1ZXVlW2ldLmZpcmVkICE9PSB0cnVlKSB7XHJcbiAgICAgICAgcXVldWUucHVzaChzcmNRdWV1ZVtpXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XHJcbiAgICBcclxuICAgICAgLy8gc20yLl93RChzbSArICc6IEZpcmluZyAnICsgcXVldWUubGVuZ3RoICsgJyAnICsgb09wdGlvbnMudHlwZSArICcoKSBpdGVtJyArIChxdWV1ZS5sZW5ndGggPT09IDEgPyAnJyA6ICdzJykpOyBcclxuICAgICAgZm9yIChpID0gMCwgaiA9IHF1ZXVlLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICBcclxuICAgICAgICBpZiAocXVldWVbaV0uc2NvcGUpIHtcclxuICAgICAgICAgIHF1ZXVlW2ldLm1ldGhvZC5hcHBseShxdWV1ZVtpXS5zY29wZSwgYXJncyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHF1ZXVlW2ldLm1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAgIGlmICghY2FuUmV0cnkpIHtcclxuICAgICAgICAgIC8vIHVzZUZsYXNoQmxvY2sgYW5kIFNXRiB0aW1lb3V0IGNhc2UgZG9lc24ndCBjb3VudCBoZXJlLlxyXG4gICAgICAgICAgcXVldWVbaV0uZmlyZWQgPSB0cnVlO1xyXG4gICAgICBcclxuICAgICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB9XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgaW5pdFVzZXJPbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGlmIChzbTIudXNlRmxhc2hCbG9jaykge1xyXG4gICAgICAgIGZsYXNoQmxvY2tIYW5kbGVyKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHByb2Nlc3NPbkV2ZW50cygpO1xyXG5cclxuICAgICAgLy8gY2FsbCB1c2VyLWRlZmluZWQgXCJvbmxvYWRcIiwgc2NvcGVkIHRvIHdpbmRvd1xyXG5cclxuICAgICAgaWYgKHR5cGVvZiBzbTIub25sb2FkID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgX3dEUygnb25sb2FkJywgMSk7XHJcbiAgICAgICAgc20yLm9ubG9hZC5hcHBseSh3aW5kb3cpO1xyXG4gICAgICAgIF93RFMoJ29ubG9hZE9LJywgMSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzbTIud2FpdEZvcldpbmRvd0xvYWQpIHtcclxuICAgICAgICBldmVudC5hZGQod2luZG93LCAnbG9hZCcsIGluaXRVc2VyT25sb2FkKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sIDEpO1xyXG5cclxuICB9O1xyXG5cclxuICBkZXRlY3RGbGFzaCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGF0IHRpcDogRmxhc2ggRGV0ZWN0IGxpYnJhcnkgKEJTRCwgKEMpIDIwMDcpIGJ5IENhcmwgXCJEb2NZZXNcIiBTLiBZZXN0cmF1XHJcbiAgICAgKiBodHRwOi8vZmVhdHVyZWJsZW5kLmNvbS9qYXZhc2NyaXB0LWZsYXNoLWRldGVjdGlvbi1saWJyYXJ5Lmh0bWwgLyBodHRwOi8vZmVhdHVyZWJsZW5kLmNvbS9saWNlbnNlLnR4dFxyXG4gICAgICovXHJcblxyXG4gICAgaWYgKGhhc0ZsYXNoICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIC8vIHRoaXMgd29yayBoYXMgYWxyZWFkeSBiZWVuIGRvbmUuXHJcbiAgICAgIHJldHVybiBoYXNGbGFzaDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaGFzUGx1Z2luID0gZmFsc2UsIG4gPSBuYXZpZ2F0b3IsIG5QID0gbi5wbHVnaW5zLCBvYmosIHR5cGUsIHR5cGVzLCBBWCA9IHdpbmRvdy5BY3RpdmVYT2JqZWN0O1xyXG5cclxuICAgIGlmIChuUCAmJiBuUC5sZW5ndGgpIHtcclxuICAgICAgXHJcbiAgICAgIHR5cGUgPSAnYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2gnO1xyXG4gICAgICB0eXBlcyA9IG4ubWltZVR5cGVzO1xyXG4gICAgICBcclxuICAgICAgaWYgKHR5cGVzICYmIHR5cGVzW3R5cGVdICYmIHR5cGVzW3R5cGVdLmVuYWJsZWRQbHVnaW4gJiYgdHlwZXNbdHlwZV0uZW5hYmxlZFBsdWdpbi5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgIGhhc1BsdWdpbiA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIFxyXG4gICAgfSBlbHNlIGlmIChBWCAhPT0gX3VuZGVmaW5lZCAmJiAhdWEubWF0Y2goL01TQXBwSG9zdC9pKSkge1xyXG4gICAgXHJcbiAgICAgIC8vIFdpbmRvd3MgOCBTdG9yZSBBcHBzIChNU0FwcEhvc3QpIGFyZSB3ZWlyZCAoY29tcGF0aWJpbGl0eT8pIGFuZCB3b24ndCBjb21wbGFpbiBoZXJlLCBidXQgd2lsbCBiYXJmIGlmIEZsYXNoL0FjdGl2ZVggb2JqZWN0IGlzIGFwcGVuZGVkIHRvIHRoZSBET00uXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgb2JqID0gbmV3IEFYKCdTaG9ja3dhdmVGbGFzaC5TaG9ja3dhdmVGbGFzaCcpO1xyXG4gICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAvLyBvaCB3ZWxsXHJcbiAgICAgICAgb2JqID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaGFzUGx1Z2luID0gKCEhb2JqKTtcclxuICAgICAgXHJcbiAgICAgIC8vIGNsZWFudXAsIGJlY2F1c2UgaXQgaXMgQWN0aXZlWCBhZnRlciBhbGxcclxuICAgICAgb2JqID0gbnVsbDtcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGhhc0ZsYXNoID0gaGFzUGx1Z2luO1xyXG5cclxuICAgIHJldHVybiBoYXNQbHVnaW47XHJcblxyXG4gIH07XHJcblxyXG5mZWF0dXJlQ2hlY2sgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgZmxhc2hOZWVkZWQsXHJcbiAgICAgICAgaXRlbSxcclxuICAgICAgICBmb3JtYXRzID0gc20yLmF1ZGlvRm9ybWF0cyxcclxuICAgICAgICAvLyBpUGhvbmUgPD0gMy4xIGhhcyBicm9rZW4gSFRNTDUgYXVkaW8oKSwgYnV0IGZpcm13YXJlIDMuMiAob3JpZ2luYWwgaVBhZCkgKyBpT1M0IHdvcmtzLlxyXG4gICAgICAgIGlzU3BlY2lhbCA9IChpc19pRGV2aWNlICYmICEhKHVhLm1hdGNoKC9vcyAoMXwyfDNfMHwzXzEpXFxzL2kpKSk7XHJcblxyXG4gICAgaWYgKGlzU3BlY2lhbCkge1xyXG5cclxuICAgICAgLy8gaGFzIEF1ZGlvKCksIGJ1dCBpcyBicm9rZW47IGxldCBpdCBsb2FkIGxpbmtzIGRpcmVjdGx5LlxyXG4gICAgICBzbTIuaGFzSFRNTDUgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIGlnbm9yZSBmbGFzaCBjYXNlLCBob3dldmVyXHJcbiAgICAgIHNtMi5odG1sNU9ubHkgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gaGlkZSB0aGUgU1dGLCBpZiBwcmVzZW50XHJcbiAgICAgIGlmIChzbTIub01DKSB7XHJcbiAgICAgICAgc20yLm9NQy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIGlmIChzbTIudXNlSFRNTDVBdWRpbykge1xyXG5cclxuICAgICAgICBpZiAoIXNtMi5odG1sNSB8fCAhc20yLmh0bWw1LmNhblBsYXlUeXBlKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKCdTb3VuZE1hbmFnZXI6IE5vIEhUTUw1IEF1ZGlvKCkgc3VwcG9ydCBkZXRlY3RlZC4nKTtcclxuICAgICAgICAgIHNtMi5oYXNIVE1MNSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gPGQ+XHJcbiAgICAgICAgaWYgKGlzQmFkU2FmYXJpKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKHNtYyArICdOb3RlOiBCdWdneSBIVE1MNSBBdWRpbyBpbiBTYWZhcmkgb24gdGhpcyBPUyBYIHJlbGVhc2UsIHNlZSBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MzIxNTkgLSAnICsgKCFoYXNGbGFzaCA/ICcgd291bGQgdXNlIGZsYXNoIGZhbGxiYWNrIGZvciBNUDMvTVA0LCBidXQgbm9uZSBkZXRlY3RlZC4nIDogJ3dpbGwgdXNlIGZsYXNoIGZhbGxiYWNrIGZvciBNUDMvTVA0LCBpZiBhdmFpbGFibGUnKSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNtMi51c2VIVE1MNUF1ZGlvICYmIHNtMi5oYXNIVE1MNSkge1xyXG5cclxuICAgICAgLy8gc29ydCBvdXQgd2hldGhlciBmbGFzaCBpcyBvcHRpb25hbCwgcmVxdWlyZWQgb3IgY2FuIGJlIGlnbm9yZWQuXHJcblxyXG4gICAgICAvLyBpbm5vY2VudCB1bnRpbCBwcm92ZW4gZ3VpbHR5LlxyXG4gICAgICBjYW5JZ25vcmVGbGFzaCA9IHRydWU7XHJcblxyXG4gICAgICBmb3IgKGl0ZW0gaW4gZm9ybWF0cykge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChmb3JtYXRzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICBpZiAoZm9ybWF0c1tpdGVtXS5yZXF1aXJlZCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoIXNtMi5odG1sNS5jYW5QbGF5VHlwZShmb3JtYXRzW2l0ZW1dLnR5cGUpKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgLy8gMTAwJSBIVE1MNSBtb2RlIGlzIG5vdCBwb3NzaWJsZS5cclxuICAgICAgICAgICAgICBjYW5JZ25vcmVGbGFzaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGZsYXNoTmVlZGVkID0gdHJ1ZTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzbTIucHJlZmVyRmxhc2ggJiYgKHNtMi5mbGFzaFtpdGVtXSB8fCBzbTIuZmxhc2hbZm9ybWF0c1tpdGVtXS50eXBlXSkpIHtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAvLyBmbGFzaCBtYXkgYmUgcmVxdWlyZWQsIG9yIHByZWZlcnJlZCBmb3IgdGhpcyBmb3JtYXQuXHJcbiAgICAgICAgICAgICAgZmxhc2hOZWVkZWQgPSB0cnVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2FuaXR5IGNoZWNrLi4uXHJcbiAgICBpZiAoc20yLmlnbm9yZUZsYXNoKSB7XHJcbiAgICAgIGZsYXNoTmVlZGVkID0gZmFsc2U7XHJcbiAgICAgIGNhbklnbm9yZUZsYXNoID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBzbTIuaHRtbDVPbmx5ID0gKHNtMi5oYXNIVE1MNSAmJiBzbTIudXNlSFRNTDVBdWRpbyAmJiAhZmxhc2hOZWVkZWQpO1xyXG5cclxuICAgIHJldHVybiAoIXNtMi5odG1sNU9ubHkpO1xyXG5cclxuICB9O1xyXG5cclxuICBwYXJzZVVSTCA9IGZ1bmN0aW9uKHVybCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJuYWw6IEZpbmRzIGFuZCByZXR1cm5zIHRoZSBmaXJzdCBwbGF5YWJsZSBVUkwgKG9yIGZhaWxpbmcgdGhhdCwgdGhlIGZpcnN0IFVSTC4pXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZyBvciBhcnJheX0gdXJsIEEgc2luZ2xlIFVSTCBzdHJpbmcsIE9SLCBhbiBhcnJheSBvZiBVUkwgc3RyaW5ncyBvciB7dXJsOicvcGF0aC90by9yZXNvdXJjZScsIHR5cGU6J2F1ZGlvL21wMyd9IG9iamVjdHMuXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgaSwgaiwgdXJsUmVzdWx0ID0gMCwgcmVzdWx0O1xyXG5cclxuICAgIGlmICh1cmwgaW5zdGFuY2VvZiBBcnJheSkge1xyXG5cclxuICAgICAgLy8gZmluZCB0aGUgZmlyc3QgZ29vZCBvbmVcclxuICAgICAgZm9yIChpID0gMCwgaiA9IHVybC5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuXHJcbiAgICAgICAgaWYgKHVybFtpXSBpbnN0YW5jZW9mIE9iamVjdCkge1xyXG5cclxuICAgICAgICAgIC8vIE1JTUUgY2hlY2tcclxuICAgICAgICAgIGlmIChzbTIuY2FuUGxheU1JTUUodXJsW2ldLnR5cGUpKSB7XHJcbiAgICAgICAgICAgIHVybFJlc3VsdCA9IGk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHNtMi5jYW5QbGF5VVJMKHVybFtpXSkpIHtcclxuXHJcbiAgICAgICAgICAvLyBVUkwgc3RyaW5nIGNoZWNrXHJcbiAgICAgICAgICB1cmxSZXN1bHQgPSBpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG5vcm1hbGl6ZSB0byBzdHJpbmdcclxuICAgICAgaWYgKHVybFt1cmxSZXN1bHRdLnVybCkge1xyXG4gICAgICAgIHVybFt1cmxSZXN1bHRdID0gdXJsW3VybFJlc3VsdF0udXJsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXN1bHQgPSB1cmxbdXJsUmVzdWx0XTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgLy8gc2luZ2xlIFVSTCBjYXNlXHJcbiAgICAgIHJlc3VsdCA9IHVybDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcblxyXG4gIHN0YXJ0VGltZXIgPSBmdW5jdGlvbihvU291bmQpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGF0dGFjaCBhIHRpbWVyIHRvIHRoaXMgc291bmQsIGFuZCBzdGFydCBhbiBpbnRlcnZhbCBpZiBuZWVkZWRcclxuICAgICAqL1xyXG5cclxuICAgIGlmICghb1NvdW5kLl9oYXNUaW1lcikge1xyXG5cclxuICAgICAgb1NvdW5kLl9oYXNUaW1lciA9IHRydWU7XHJcblxyXG4gICAgICBpZiAoIW1vYmlsZUhUTUw1ICYmIHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCkge1xyXG5cclxuICAgICAgICBpZiAoaDVJbnRlcnZhbFRpbWVyID09PSBudWxsICYmIGg1VGltZXJDb3VudCA9PT0gMCkge1xyXG5cclxuICAgICAgICAgIGg1SW50ZXJ2YWxUaW1lciA9IHNldEludGVydmFsKHRpbWVyRXhlY3V0ZSwgc20yLmh0bWw1UG9sbGluZ0ludGVydmFsKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoNVRpbWVyQ291bnQrKztcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIHN0b3BUaW1lciA9IGZ1bmN0aW9uKG9Tb3VuZCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGV0YWNoIGEgdGltZXJcclxuICAgICAqL1xyXG5cclxuICAgIGlmIChvU291bmQuX2hhc1RpbWVyKSB7XHJcblxyXG4gICAgICBvU291bmQuX2hhc1RpbWVyID0gZmFsc2U7XHJcblxyXG4gICAgICBpZiAoIW1vYmlsZUhUTUw1ICYmIHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCkge1xyXG5cclxuICAgICAgICAvLyBpbnRlcnZhbCB3aWxsIHN0b3AgaXRzZWxmIGF0IG5leHQgZXhlY3V0aW9uLlxyXG5cclxuICAgICAgICBoNVRpbWVyQ291bnQtLTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIHRpbWVyRXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogbWFudWFsIHBvbGxpbmcgZm9yIEhUTUw1IHByb2dyZXNzIGV2ZW50cywgaWUuLCB3aGlsZXBsYXlpbmcoKVxyXG4gICAgICogKGNhbiBhY2hpZXZlIGdyZWF0ZXIgcHJlY2lzaW9uIHRoYW4gY29uc2VydmF0aXZlIGRlZmF1bHQgSFRNTDUgaW50ZXJ2YWwpXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgaTtcclxuXHJcbiAgICBpZiAoaDVJbnRlcnZhbFRpbWVyICE9PSBudWxsICYmICFoNVRpbWVyQ291bnQpIHtcclxuXHJcbiAgICAgIC8vIG5vIGFjdGl2ZSB0aW1lcnMsIHN0b3AgcG9sbGluZyBpbnRlcnZhbC5cclxuXHJcbiAgICAgIGNsZWFySW50ZXJ2YWwoaDVJbnRlcnZhbFRpbWVyKTtcclxuXHJcbiAgICAgIGg1SW50ZXJ2YWxUaW1lciA9IG51bGw7XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNoZWNrIGFsbCBIVE1MNSBzb3VuZHMgd2l0aCB0aW1lcnNcclxuXHJcbiAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHJcbiAgICAgIGlmIChzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0uaXNIVE1MNSAmJiBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0uX2hhc1RpbWVyKSB7XHJcbiAgICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLl9vblRpbWVyKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIGNhdGNoRXJyb3IgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IChvcHRpb25zICE9PSBfdW5kZWZpbmVkID8gb3B0aW9ucyA6IHt9KTtcclxuXHJcbiAgICBpZiAodHlwZW9mIHNtMi5vbmVycm9yID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHNtMi5vbmVycm9yLmFwcGx5KHdpbmRvdywgW3tcclxuICAgICAgICB0eXBlOiAob3B0aW9ucy50eXBlICE9PSBfdW5kZWZpbmVkID8gb3B0aW9ucy50eXBlIDogbnVsbClcclxuICAgICAgfV0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcHRpb25zLmZhdGFsICE9PSBfdW5kZWZpbmVkICYmIG9wdGlvbnMuZmF0YWwpIHtcclxuICAgICAgc20yLmRpc2FibGUoKTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgYmFkU2FmYXJpRml4ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBcImJhZFwiIFNhZmFyaSAoT1MgWCAxMC4zIC0gMTAuNykgbXVzdCBmYWxsIGJhY2sgdG8gZmxhc2ggZm9yIE1QMy9NUDRcclxuICAgIGlmICghaXNCYWRTYWZhcmkgfHwgIWRldGVjdEZsYXNoKCkpIHtcclxuICAgICAgLy8gZG9lc24ndCBhcHBseVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFGID0gc20yLmF1ZGlvRm9ybWF0cywgaSwgaXRlbTtcclxuXHJcbiAgICBmb3IgKGl0ZW0gaW4gYUYpIHtcclxuXHJcbiAgICAgIGlmIChhRi5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG5cclxuICAgICAgICBpZiAoaXRlbSA9PT0gJ21wMycgfHwgaXRlbSA9PT0gJ21wNCcpIHtcclxuXHJcbiAgICAgICAgICBzbTIuX3dEKHNtICsgJzogVXNpbmcgZmxhc2ggZmFsbGJhY2sgZm9yICcgKyBpdGVtICsgJyBmb3JtYXQnKTtcclxuICAgICAgICAgIHNtMi5odG1sNVtpdGVtXSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIC8vIGFzc2lnbiByZXN1bHQgdG8gcmVsYXRlZCBmb3JtYXRzLCB0b29cclxuICAgICAgICAgIGlmIChhRltpdGVtXSAmJiBhRltpdGVtXS5yZWxhdGVkKSB7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IGFGW2l0ZW1dLnJlbGF0ZWQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICBzbTIuaHRtbDVbYUZbaXRlbV0ucmVsYXRlZFtpXV0gPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBQc2V1ZG8tcHJpdmF0ZSBmbGFzaC9FeHRlcm5hbEludGVyZmFjZSBtZXRob2RzXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqL1xyXG5cclxuICB0aGlzLl9zZXRTYW5kYm94VHlwZSA9IGZ1bmN0aW9uKHNhbmRib3hUeXBlKSB7XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICAvLyBTZWN1cml0eSBzYW5kYm94IGFjY29yZGluZyB0byBGbGFzaCBwbHVnaW5cclxuICAgIHZhciBzYiA9IHNtMi5zYW5kYm94O1xyXG5cclxuICAgIHNiLnR5cGUgPSBzYW5kYm94VHlwZTtcclxuICAgIHNiLmRlc2NyaXB0aW9uID0gc2IudHlwZXNbKHNiLnR5cGVzW3NhbmRib3hUeXBlXSAhPT0gX3VuZGVmaW5lZD9zYW5kYm94VHlwZSA6ICd1bmtub3duJyldO1xyXG5cclxuICAgIGlmIChzYi50eXBlID09PSAnbG9jYWxXaXRoRmlsZScpIHtcclxuXHJcbiAgICAgIHNiLm5vUmVtb3RlID0gdHJ1ZTtcclxuICAgICAgc2Iubm9Mb2NhbCA9IGZhbHNlO1xyXG4gICAgICBfd0RTKCdzZWNOb3RlJywgMik7XHJcblxyXG4gICAgfSBlbHNlIGlmIChzYi50eXBlID09PSAnbG9jYWxXaXRoTmV0d29yaycpIHtcclxuXHJcbiAgICAgIHNiLm5vUmVtb3RlID0gZmFsc2U7XHJcbiAgICAgIHNiLm5vTG9jYWwgPSB0cnVlO1xyXG5cclxuICAgIH0gZWxzZSBpZiAoc2IudHlwZSA9PT0gJ2xvY2FsVHJ1c3RlZCcpIHtcclxuXHJcbiAgICAgIHNiLm5vUmVtb3RlID0gZmFsc2U7XHJcbiAgICAgIHNiLm5vTG9jYWwgPSBmYWxzZTtcclxuXHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMuX2V4dGVybmFsSW50ZXJmYWNlT0sgPSBmdW5jdGlvbihzd2ZWZXJzaW9uKSB7XHJcblxyXG4gICAgLy8gZmxhc2ggY2FsbGJhY2sgY29uZmlybWluZyBmbGFzaCBsb2FkZWQsIEVJIHdvcmtpbmcgZXRjLlxyXG4gICAgLy8gc3dmVmVyc2lvbjogU1dGIGJ1aWxkIHN0cmluZ1xyXG5cclxuICAgIGlmIChzbTIuc3dmTG9hZGVkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZTtcclxuXHJcbiAgICBkZWJ1Z1RTKCdzd2YnLCB0cnVlKTtcclxuICAgIGRlYnVnVFMoJ2ZsYXNodG9qcycsIHRydWUpO1xyXG4gICAgc20yLnN3ZkxvYWRlZCA9IHRydWU7XHJcbiAgICB0cnlJbml0T25Gb2N1cyA9IGZhbHNlO1xyXG5cclxuICAgIGlmIChpc0JhZFNhZmFyaSkge1xyXG4gICAgICBiYWRTYWZhcmlGaXgoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjb21wbGFpbiBpZiBKUyArIFNXRiBidWlsZC92ZXJzaW9uIHN0cmluZ3MgZG9uJ3QgbWF0Y2gsIGV4Y2x1ZGluZyArREVWIGJ1aWxkc1xyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAoIXN3ZlZlcnNpb24gfHwgc3dmVmVyc2lvbi5yZXBsYWNlKC9cXCtkZXYvaSwnJykgIT09IHNtMi52ZXJzaW9uTnVtYmVyLnJlcGxhY2UoL1xcK2Rldi9pLCAnJykpIHtcclxuXHJcbiAgICAgIGUgPSBzbSArICc6IEZhdGFsOiBKYXZhU2NyaXB0IGZpbGUgYnVpbGQgXCInICsgc20yLnZlcnNpb25OdW1iZXIgKyAnXCIgZG9lcyBub3QgbWF0Y2ggRmxhc2ggU1dGIGJ1aWxkIFwiJyArIHN3ZlZlcnNpb24gKyAnXCIgYXQgJyArIHNtMi51cmwgKyAnLiBFbnN1cmUgYm90aCBhcmUgdXAtdG8tZGF0ZS4nO1xyXG5cclxuICAgICAgLy8gZXNjYXBlIGZsYXNoIC0+IEpTIHN0YWNrIHNvIHRoaXMgZXJyb3IgZmlyZXMgaW4gd2luZG93LlxyXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uIHZlcnNpb25NaXNtYXRjaCgpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZSk7XHJcbiAgICAgIH0sIDApO1xyXG5cclxuICAgICAgLy8gZXhpdCwgaW5pdCB3aWxsIGZhaWwgd2l0aCB0aW1lb3V0XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgLy8gSUUgbmVlZHMgYSBsYXJnZXIgdGltZW91dFxyXG4gICAgc2V0VGltZW91dChpbml0LCBpc0lFID8gMTAwIDogMSk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFByaXZhdGUgaW5pdGlhbGl6YXRpb24gaGVscGVyc1xyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqL1xyXG5cclxuICBjcmVhdGVNb3ZpZSA9IGZ1bmN0aW9uKHNtSUQsIHNtVVJMKSB7XHJcblxyXG4gICAgaWYgKGRpZEFwcGVuZCAmJiBhcHBlbmRTdWNjZXNzKSB7XHJcbiAgICAgIC8vIGlnbm9yZSBpZiBhbHJlYWR5IHN1Y2NlZWRlZFxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1zZygpIHtcclxuXHJcbiAgICAgIC8vIDxkPlxyXG5cclxuICAgICAgdmFyIG9wdGlvbnMgPSBbXSxcclxuICAgICAgICAgIHRpdGxlLFxyXG4gICAgICAgICAgbXNnID0gW10sXHJcbiAgICAgICAgICBkZWxpbWl0ZXIgPSAnICsgJztcclxuXHJcbiAgICAgIHRpdGxlID0gJ1NvdW5kTWFuYWdlciAnICsgc20yLnZlcnNpb24gKyAoIXNtMi5odG1sNU9ubHkgJiYgc20yLnVzZUhUTUw1QXVkaW8gPyAoc20yLmhhc0hUTUw1ID8gJyArIEhUTUw1IGF1ZGlvJyA6ICcsIG5vIEhUTUw1IGF1ZGlvIHN1cHBvcnQnKSA6ICcnKTtcclxuXHJcbiAgICAgIGlmICghc20yLmh0bWw1T25seSkge1xyXG5cclxuICAgICAgICBpZiAoc20yLnByZWZlckZsYXNoKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ3ByZWZlckZsYXNoJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc20yLnVzZUhpZ2hQZXJmb3JtYW5jZSkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCd1c2VIaWdoUGVyZm9ybWFuY2UnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzbTIuZmxhc2hQb2xsaW5nSW50ZXJ2YWwpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgnZmxhc2hQb2xsaW5nSW50ZXJ2YWwgKCcgKyBzbTIuZmxhc2hQb2xsaW5nSW50ZXJ2YWwgKyAnbXMpJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc20yLmh0bWw1UG9sbGluZ0ludGVydmFsKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ2h0bWw1UG9sbGluZ0ludGVydmFsICgnICsgc20yLmh0bWw1UG9sbGluZ0ludGVydmFsICsgJ21zKScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNtMi53bW9kZSkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCd3bW9kZSAoJyArIHNtMi53bW9kZSArICcpJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc20yLmRlYnVnRmxhc2gpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgnZGVidWdGbGFzaCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNtMi51c2VGbGFzaEJsb2NrKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ2ZsYXNoQmxvY2snKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBpZiAoc20yLmh0bWw1UG9sbGluZ0ludGVydmFsKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ2h0bWw1UG9sbGluZ0ludGVydmFsICgnICsgc20yLmh0bWw1UG9sbGluZ0ludGVydmFsICsgJ21zKScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIG1zZyA9IG1zZy5jb25jYXQoW29wdGlvbnMuam9pbihkZWxpbWl0ZXIpXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5fd0QodGl0bGUgKyAobXNnLmxlbmd0aCA/IGRlbGltaXRlciArIG1zZy5qb2luKCcsICcpIDogJycpLCAxKTtcclxuXHJcbiAgICAgIHNob3dTdXBwb3J0KCk7XHJcblxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcblxyXG4gICAgICAvLyAxMDAlIEhUTUw1IG1vZGVcclxuICAgICAgc2V0VmVyc2lvbkluZm8oKTtcclxuXHJcbiAgICAgIGluaXRNc2coKTtcclxuICAgICAgc20yLm9NQyA9IGlkKHNtMi5tb3ZpZUlEKTtcclxuICAgICAgaW5pdCgpO1xyXG5cclxuICAgICAgLy8gcHJldmVudCBtdWx0aXBsZSBpbml0IGF0dGVtcHRzXHJcbiAgICAgIGRpZEFwcGVuZCA9IHRydWU7XHJcblxyXG4gICAgICBhcHBlbmRTdWNjZXNzID0gdHJ1ZTtcclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmxhc2ggcGF0aFxyXG4gICAgdmFyIHJlbW90ZVVSTCA9IChzbVVSTCB8fCBzbTIudXJsKSxcclxuICAgIGxvY2FsVVJMID0gKHNtMi5hbHRVUkwgfHwgcmVtb3RlVVJMKSxcclxuICAgIHN3ZlRpdGxlID0gJ0pTL0ZsYXNoIGF1ZGlvIGNvbXBvbmVudCAoU291bmRNYW5hZ2VyIDIpJyxcclxuICAgIG9UYXJnZXQgPSBnZXREb2N1bWVudCgpLFxyXG4gICAgZXh0cmFDbGFzcyA9IGdldFNXRkNTUygpLFxyXG4gICAgaXNSVEwgPSBudWxsLFxyXG4gICAgaHRtbCA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaHRtbCcpWzBdLFxyXG4gICAgb0VtYmVkLCBvTW92aWUsIHRtcCwgbW92aWVIVE1MLCBvRWwsIHMsIHgsIHNDbGFzcztcclxuXHJcbiAgICBpc1JUTCA9IChodG1sICYmIGh0bWwuZGlyICYmIGh0bWwuZGlyLm1hdGNoKC9ydGwvaSkpO1xyXG4gICAgc21JRCA9IChzbUlEID09PSBfdW5kZWZpbmVkID8gc20yLmlkIDogc21JRCk7XHJcblxyXG4gICAgZnVuY3Rpb24gcGFyYW0obmFtZSwgdmFsdWUpIHtcclxuICAgICAgcmV0dXJuICc8cGFyYW0gbmFtZT1cIicgKyBuYW1lICsgJ1wiIHZhbHVlPVwiJyArIHZhbHVlICsgJ1wiIC8+JztcclxuICAgIH1cclxuXHJcbiAgICAvLyBzYWZldHkgY2hlY2sgZm9yIGxlZ2FjeSAoY2hhbmdlIHRvIEZsYXNoIDkgVVJMKVxyXG4gICAgc2V0VmVyc2lvbkluZm8oKTtcclxuICAgIHNtMi51cmwgPSBub3JtYWxpemVNb3ZpZVVSTChvdmVySFRUUCA/IHJlbW90ZVVSTCA6IGxvY2FsVVJMKTtcclxuICAgIHNtVVJMID0gc20yLnVybDtcclxuXHJcbiAgICBzbTIud21vZGUgPSAoIXNtMi53bW9kZSAmJiBzbTIudXNlSGlnaFBlcmZvcm1hbmNlID8gJ3RyYW5zcGFyZW50JyA6IHNtMi53bW9kZSk7XHJcblxyXG4gICAgaWYgKHNtMi53bW9kZSAhPT0gbnVsbCAmJiAodWEubWF0Y2goL21zaWUgOC9pKSB8fCAoIWlzSUUgJiYgIXNtMi51c2VIaWdoUGVyZm9ybWFuY2UpKSAmJiBuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goL3dpbjMyfHdpbjY0L2kpKSB7XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBleHRyYS1zcGVjaWFsIGNhc2U6IG1vdmllIGRvZXNuJ3QgbG9hZCB1bnRpbCBzY3JvbGxlZCBpbnRvIHZpZXcgd2hlbiB1c2luZyB3bW9kZSA9IGFueXRoaW5nIGJ1dCAnd2luZG93JyBoZXJlXHJcbiAgICAgICAqIGRvZXMgbm90IGFwcGx5IHdoZW4gdXNpbmcgaGlnaCBwZXJmb3JtYW5jZSAocG9zaXRpb246Zml4ZWQgbWVhbnMgb24tc2NyZWVuKSwgT1IgaW5maW5pdGUgZmxhc2ggbG9hZCB0aW1lb3V0XHJcbiAgICAgICAqIHdtb2RlIGJyZWFrcyBJRSA4IG9uIFZpc3RhICsgV2luNyB0b28gaW4gc29tZSBjYXNlcywgYXMgb2YgSmFudWFyeSAyMDExICg/KVxyXG4gICAgICAgKi9cclxuICAgICAgbWVzc2FnZXMucHVzaChzdHJpbmdzLnNwY1dtb2RlKTtcclxuICAgICAgc20yLndtb2RlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBvRW1iZWQgPSB7XHJcbiAgICAgICduYW1lJzogc21JRCxcclxuICAgICAgJ2lkJzogc21JRCxcclxuICAgICAgJ3NyYyc6IHNtVVJMLFxyXG4gICAgICAncXVhbGl0eSc6ICdoaWdoJyxcclxuICAgICAgJ2FsbG93U2NyaXB0QWNjZXNzJzogc20yLmFsbG93U2NyaXB0QWNjZXNzLFxyXG4gICAgICAnYmdjb2xvcic6IHNtMi5iZ0NvbG9yLFxyXG4gICAgICAncGx1Z2luc3BhZ2UnOiBodHRwICsgJ3d3dy5tYWNyb21lZGlhLmNvbS9nby9nZXRmbGFzaHBsYXllcicsXHJcbiAgICAgICd0aXRsZSc6IHN3ZlRpdGxlLFxyXG4gICAgICAndHlwZSc6ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCcsXHJcbiAgICAgICd3bW9kZSc6IHNtMi53bW9kZSxcclxuICAgICAgLy8gaHR0cDovL2hlbHAuYWRvYmUuY29tL2VuX1VTL2FzMy9tb2JpbGUvV1M0YmViY2Q2NmE3NDI3NWMzNmNmYjgxMzcxMjQzMThlZWJjNi03ZmZkLmh0bWxcclxuICAgICAgJ2hhc1ByaW9yaXR5JzogJ3RydWUnXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChzbTIuZGVidWdGbGFzaCkge1xyXG4gICAgICBvRW1iZWQuRmxhc2hWYXJzID0gJ2RlYnVnPTEnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghc20yLndtb2RlKSB7XHJcbiAgICAgIC8vIGRvbid0IHdyaXRlIGVtcHR5IGF0dHJpYnV0ZVxyXG4gICAgICBkZWxldGUgb0VtYmVkLndtb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpc0lFKSB7XHJcblxyXG4gICAgICAvLyBJRSBpcyBcInNwZWNpYWxcIi5cclxuICAgICAgb01vdmllID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICBtb3ZpZUhUTUwgPSBbXHJcbiAgICAgICAgJzxvYmplY3QgaWQ9XCInICsgc21JRCArICdcIiBkYXRhPVwiJyArIHNtVVJMICsgJ1wiIHR5cGU9XCInICsgb0VtYmVkLnR5cGUgKyAnXCIgdGl0bGU9XCInICsgb0VtYmVkLnRpdGxlICsnXCIgY2xhc3NpZD1cImNsc2lkOkQyN0NEQjZFLUFFNkQtMTFjZi05NkI4LTQ0NDU1MzU0MDAwMFwiIGNvZGViYXNlPVwiaHR0cDovL2Rvd25sb2FkLm1hY3JvbWVkaWEuY29tL3B1Yi9zaG9ja3dhdmUvY2Ficy9mbGFzaC9zd2ZsYXNoLmNhYiN2ZXJzaW9uPTYsMCw0MCwwXCI+JyxcclxuICAgICAgICBwYXJhbSgnbW92aWUnLCBzbVVSTCksXHJcbiAgICAgICAgcGFyYW0oJ0FsbG93U2NyaXB0QWNjZXNzJywgc20yLmFsbG93U2NyaXB0QWNjZXNzKSxcclxuICAgICAgICBwYXJhbSgncXVhbGl0eScsIG9FbWJlZC5xdWFsaXR5KSxcclxuICAgICAgICAoc20yLndtb2RlPyBwYXJhbSgnd21vZGUnLCBzbTIud21vZGUpOiAnJyksXHJcbiAgICAgICAgcGFyYW0oJ2JnY29sb3InLCBzbTIuYmdDb2xvciksXHJcbiAgICAgICAgcGFyYW0oJ2hhc1ByaW9yaXR5JywgJ3RydWUnKSxcclxuICAgICAgICAoc20yLmRlYnVnRmxhc2ggPyBwYXJhbSgnRmxhc2hWYXJzJywgb0VtYmVkLkZsYXNoVmFycykgOiAnJyksXHJcbiAgICAgICAgJzwvb2JqZWN0PidcclxuICAgICAgXS5qb2luKCcnKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgb01vdmllID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2VtYmVkJyk7XHJcbiAgICAgIGZvciAodG1wIGluIG9FbWJlZCkge1xyXG4gICAgICAgIGlmIChvRW1iZWQuaGFzT3duUHJvcGVydHkodG1wKSkge1xyXG4gICAgICAgICAgb01vdmllLnNldEF0dHJpYnV0ZSh0bXAsIG9FbWJlZFt0bXBdKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgaW5pdERlYnVnKCk7XHJcbiAgICBleHRyYUNsYXNzID0gZ2V0U1dGQ1NTKCk7XHJcbiAgICBvVGFyZ2V0ID0gZ2V0RG9jdW1lbnQoKTtcclxuXHJcbiAgICBpZiAob1RhcmdldCkge1xyXG5cclxuICAgICAgc20yLm9NQyA9IChpZChzbTIubW92aWVJRCkgfHwgZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuXHJcbiAgICAgIGlmICghc20yLm9NQy5pZCkge1xyXG5cclxuICAgICAgICBzbTIub01DLmlkID0gc20yLm1vdmllSUQ7XHJcbiAgICAgICAgc20yLm9NQy5jbGFzc05hbWUgPSBzd2ZDU1Muc3dmRGVmYXVsdCArICcgJyArIGV4dHJhQ2xhc3M7XHJcbiAgICAgICAgcyA9IG51bGw7XHJcbiAgICAgICAgb0VsID0gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKCFzbTIudXNlRmxhc2hCbG9jaykge1xyXG4gICAgICAgICAgaWYgKHNtMi51c2VIaWdoUGVyZm9ybWFuY2UpIHtcclxuICAgICAgICAgICAgLy8gb24tc2NyZWVuIGF0IGFsbCB0aW1lc1xyXG4gICAgICAgICAgICBzID0ge1xyXG4gICAgICAgICAgICAgICdwb3NpdGlvbic6ICdmaXhlZCcsXHJcbiAgICAgICAgICAgICAgJ3dpZHRoJzogJzhweCcsXHJcbiAgICAgICAgICAgICAgJ2hlaWdodCc6ICc4cHgnLFxyXG4gICAgICAgICAgICAgIC8vID49IDZweCBmb3IgZmxhc2ggdG8gcnVuIGZhc3QsID49IDhweCB0byBzdGFydCB1cCB1bmRlciBGaXJlZm94L3dpbjMyIGluIHNvbWUgY2FzZXMuIG9kZD8geWVzLlxyXG4gICAgICAgICAgICAgICdib3R0b20nOiAnMHB4JyxcclxuICAgICAgICAgICAgICAnbGVmdCc6ICcwcHgnLFxyXG4gICAgICAgICAgICAgICdvdmVyZmxvdyc6ICdoaWRkZW4nXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBoaWRlIG9mZi1zY3JlZW4sIGxvd2VyIHByaW9yaXR5XHJcbiAgICAgICAgICAgIHMgPSB7XHJcbiAgICAgICAgICAgICAgJ3Bvc2l0aW9uJzogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAnd2lkdGgnOiAnNnB4JyxcclxuICAgICAgICAgICAgICAnaGVpZ2h0JzogJzZweCcsXHJcbiAgICAgICAgICAgICAgJ3RvcCc6ICctOTk5OXB4JyxcclxuICAgICAgICAgICAgICAnbGVmdCc6ICctOTk5OXB4J1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoaXNSVEwpIHtcclxuICAgICAgICAgICAgICBzLmxlZnQgPSBNYXRoLmFicyhwYXJzZUludChzLmxlZnQsIDEwKSkgKyAncHgnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaXNXZWJraXQpIHtcclxuICAgICAgICAgIC8vIHNvdW5kY2xvdWQtcmVwb3J0ZWQgcmVuZGVyL2NyYXNoIGZpeCwgc2FmYXJpIDVcclxuICAgICAgICAgIHNtMi5vTUMuc3R5bGUuekluZGV4ID0gMTAwMDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXNtMi5kZWJ1Z0ZsYXNoKSB7XHJcbiAgICAgICAgICBmb3IgKHggaW4gcykge1xyXG4gICAgICAgICAgICBpZiAocy5oYXNPd25Qcm9wZXJ0eSh4KSkge1xyXG4gICAgICAgICAgICAgIHNtMi5vTUMuc3R5bGVbeF0gPSBzW3hdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG5cclxuICAgICAgICAgIGlmICghaXNJRSkge1xyXG4gICAgICAgICAgICBzbTIub01DLmFwcGVuZENoaWxkKG9Nb3ZpZSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgb1RhcmdldC5hcHBlbmRDaGlsZChzbTIub01DKTtcclxuXHJcbiAgICAgICAgICBpZiAoaXNJRSkge1xyXG4gICAgICAgICAgICBvRWwgPSBzbTIub01DLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XHJcbiAgICAgICAgICAgIG9FbC5jbGFzc05hbWUgPSBzd2ZDU1Muc3dmQm94O1xyXG4gICAgICAgICAgICBvRWwuaW5uZXJIVE1MID0gbW92aWVIVE1MO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGFwcGVuZFN1Y2Nlc3MgPSB0cnVlO1xyXG5cclxuICAgICAgICB9IGNhdGNoKGUpIHtcclxuXHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKCdkb21FcnJvcicpICsgJyBcXG4nICsgZS50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gU00yIGNvbnRhaW5lciBpcyBhbHJlYWR5IGluIHRoZSBkb2N1bWVudCAoZWcuIGZsYXNoYmxvY2sgdXNlIGNhc2UpXHJcbiAgICAgICAgc0NsYXNzID0gc20yLm9NQy5jbGFzc05hbWU7XHJcbiAgICAgICAgc20yLm9NQy5jbGFzc05hbWUgPSAoc0NsYXNzID8gc0NsYXNzICsgJyAnIDogc3dmQ1NTLnN3ZkRlZmF1bHQpICsgKGV4dHJhQ2xhc3MgPyAnICcgKyBleHRyYUNsYXNzIDogJycpO1xyXG4gICAgICAgIHNtMi5vTUMuYXBwZW5kQ2hpbGQob01vdmllKTtcclxuXHJcbiAgICAgICAgaWYgKGlzSUUpIHtcclxuICAgICAgICAgIG9FbCA9IHNtMi5vTUMuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICAgIG9FbC5jbGFzc05hbWUgPSBzd2ZDU1Muc3dmQm94O1xyXG4gICAgICAgICAgb0VsLmlubmVySFRNTCA9IG1vdmllSFRNTDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFwcGVuZFN1Y2Nlc3MgPSB0cnVlO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBkaWRBcHBlbmQgPSB0cnVlO1xyXG5cclxuICAgIGluaXRNc2coKTtcclxuXHJcbiAgICAvLyBzbTIuX3dEKHNtICsgJzogVHJ5aW5nIHRvIGxvYWQgJyArIHNtVVJMICsgKCFvdmVySFRUUCAmJiBzbTIuYWx0VVJMID8gJyAoYWx0ZXJuYXRlIFVSTCknIDogJycpLCAxKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgaW5pdE1vdmllID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgY3JlYXRlTW92aWUoKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGF0dGVtcHQgdG8gZ2V0LCBvciBjcmVhdGUsIG1vdmllIChtYXkgYWxyZWFkeSBleGlzdClcclxuICAgIGlmIChmbGFzaCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzbTIudXJsKSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU29tZXRoaW5nIGlzbid0IHJpZ2h0IC0gd2UndmUgcmVhY2hlZCBpbml0LCBidXQgdGhlIHNvdW5kTWFuYWdlciB1cmwgcHJvcGVydHkgaGFzIG5vdCBiZWVuIHNldC5cclxuICAgICAgICogVXNlciBoYXMgbm90IGNhbGxlZCBzZXR1cCh7dXJsOiAuLi59KSwgb3IgaGFzIG5vdCBzZXQgc291bmRNYW5hZ2VyLnVybCAobGVnYWN5IHVzZSBjYXNlKSBkaXJlY3RseSBiZWZvcmUgaW5pdCB0aW1lLlxyXG4gICAgICAgKiBOb3RpZnkgYW5kIGV4aXQuIElmIHVzZXIgY2FsbHMgc2V0dXAoKSB3aXRoIGEgdXJsOiBwcm9wZXJ0eSwgaW5pdCB3aWxsIGJlIHJlc3RhcnRlZCBhcyBpbiB0aGUgZGVmZXJyZWQgbG9hZGluZyBjYXNlLlxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgICBfd0RTKCdub1VSTCcpO1xyXG4gICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBpbmxpbmUgbWFya3VwIGNhc2VcclxuICAgIGZsYXNoID0gc20yLmdldE1vdmllKHNtMi5pZCk7XHJcblxyXG4gICAgaWYgKCFmbGFzaCkge1xyXG5cclxuICAgICAgaWYgKCFvUmVtb3ZlZCkge1xyXG5cclxuICAgICAgICAvLyB0cnkgdG8gY3JlYXRlXHJcbiAgICAgICAgY3JlYXRlTW92aWUoc20yLmlkLCBzbTIudXJsKTtcclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIHRyeSB0byByZS1hcHBlbmQgcmVtb3ZlZCBtb3ZpZSBhZnRlciByZWJvb3QoKVxyXG4gICAgICAgIGlmICghaXNJRSkge1xyXG4gICAgICAgICAgc20yLm9NQy5hcHBlbmRDaGlsZChvUmVtb3ZlZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNtMi5vTUMuaW5uZXJIVE1MID0gb1JlbW92ZWRIVE1MO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb1JlbW92ZWQgPSBudWxsO1xyXG4gICAgICAgIGRpZEFwcGVuZCA9IHRydWU7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBmbGFzaCA9IHNtMi5nZXRNb3ZpZShzbTIuaWQpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIHNtMi5vbmluaXRtb3ZpZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBzZXRUaW1lb3V0KHNtMi5vbmluaXRtb3ZpZSwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBmbHVzaE1lc3NhZ2VzKCk7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIGRlbGF5V2FpdEZvckVJID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgc2V0VGltZW91dCh3YWl0Rm9yRUksIDEwMDApO1xyXG5cclxuICB9O1xyXG5cclxuICByZWJvb3RJbnRvSFRNTDUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IHRyeSBmb3IgYSByZWJvb3Qgd2l0aCBwcmVmZXJGbGFzaDogZmFsc2UsIGlmIDEwMCUgSFRNTDUgbW9kZSBpcyBwb3NzaWJsZSBhbmQgdXNlRmxhc2hCbG9jayBpcyBub3QgZW5hYmxlZC5cclxuXHJcbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGNvbXBsYWluKHNtYyArICd1c2VGbGFzaEJsb2NrIGlzIGZhbHNlLCAxMDAlIEhUTUw1IG1vZGUgaXMgcG9zc2libGUuIFJlYm9vdGluZyB3aXRoIHByZWZlckZsYXNoOiBmYWxzZS4uLicpO1xyXG5cclxuICAgICAgc20yLnNldHVwKHtcclxuICAgICAgICBwcmVmZXJGbGFzaDogZmFsc2VcclxuICAgICAgfSkucmVib290KCk7XHJcblxyXG4gICAgICAvLyBpZiBmb3Igc29tZSByZWFzb24geW91IHdhbnQgdG8gZGV0ZWN0IHRoaXMgY2FzZSwgdXNlIGFuIG9udGltZW91dCgpIGNhbGxiYWNrIGFuZCBsb29rIGZvciBodG1sNU9ubHkgYW5kIGRpZEZsYXNoQmxvY2sgPT0gdHJ1ZS5cclxuICAgICAgc20yLmRpZEZsYXNoQmxvY2sgPSB0cnVlO1xyXG5cclxuICAgICAgc20yLmJlZ2luRGVsYXllZEluaXQoKTtcclxuXHJcbiAgICB9LCAxKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgd2FpdEZvckVJID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIHAsXHJcbiAgICAgICAgbG9hZEluY29tcGxldGUgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIXNtMi51cmwpIHtcclxuICAgICAgLy8gTm8gU1dGIHVybCB0byBsb2FkIChub1VSTCBjYXNlKSAtIGV4aXQgZm9yIG5vdy4gV2lsbCBiZSByZXRyaWVkIHdoZW4gdXJsIGlzIHNldC5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh3YWl0aW5nRm9yRUkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHdhaXRpbmdGb3JFSSA9IHRydWU7XHJcbiAgICBldmVudC5yZW1vdmUod2luZG93LCAnbG9hZCcsIGRlbGF5V2FpdEZvckVJKTtcclxuXHJcbiAgICBpZiAoaGFzRmxhc2ggJiYgdHJ5SW5pdE9uRm9jdXMgJiYgIWlzRm9jdXNlZCkge1xyXG4gICAgICAvLyBTYWZhcmkgd29uJ3QgbG9hZCBmbGFzaCBpbiBiYWNrZ3JvdW5kIHRhYnMsIG9ubHkgd2hlbiBmb2N1c2VkLlxyXG4gICAgICBfd0RTKCd3YWl0Rm9jdXMnKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZGlkSW5pdCkge1xyXG4gICAgICBwID0gc20yLmdldE1vdmllUGVyY2VudCgpO1xyXG4gICAgICBpZiAocCA+IDAgJiYgcCA8IDEwMCkge1xyXG4gICAgICAgIGxvYWRJbmNvbXBsZXRlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBwID0gc20yLmdldE1vdmllUGVyY2VudCgpO1xyXG5cclxuICAgICAgaWYgKGxvYWRJbmNvbXBsZXRlKSB7XHJcbiAgICAgICAgLy8gc3BlY2lhbCBjYXNlOiBpZiBtb3ZpZSAqcGFydGlhbGx5KiBsb2FkZWQsIHJldHJ5IHVudGlsIGl0J3MgMTAwJSBiZWZvcmUgYXNzdW1pbmcgZmFpbHVyZS5cclxuICAgICAgICB3YWl0aW5nRm9yRUkgPSBmYWxzZTtcclxuICAgICAgICBzbTIuX3dEKHN0cignd2FpdFNXRicpKTtcclxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChkZWxheVdhaXRGb3JFSSwgMSk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKCFkaWRJbml0KSB7XHJcblxyXG4gICAgICAgIHNtMi5fd0Qoc20gKyAnOiBObyBGbGFzaCByZXNwb25zZSB3aXRoaW4gZXhwZWN0ZWQgdGltZS4gTGlrZWx5IGNhdXNlczogJyArIChwID09PSAwID8gJ1NXRiBsb2FkIGZhaWxlZCwgJyA6ICcnKSArICdGbGFzaCBibG9ja2VkIG9yIEpTLUZsYXNoIHNlY3VyaXR5IGVycm9yLicgKyAoc20yLmRlYnVnRmxhc2ggPyAnICcgKyBzdHIoJ2NoZWNrU1dGJykgOiAnJyksIDIpO1xyXG5cclxuICAgICAgICBpZiAoIW92ZXJIVFRQICYmIHApIHtcclxuXHJcbiAgICAgICAgICBfd0RTKCdsb2NhbEZhaWwnLCAyKTtcclxuXHJcbiAgICAgICAgICBpZiAoIXNtMi5kZWJ1Z0ZsYXNoKSB7XHJcbiAgICAgICAgICAgIF93RFMoJ3RyeURlYnVnJywgMik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHAgPT09IDApIHtcclxuXHJcbiAgICAgICAgICAvLyBpZiAwIChub3QgbnVsbCksIHByb2JhYmx5IGEgNDA0LlxyXG4gICAgICAgICAgc20yLl93RChzdHIoJ3N3ZjQwNCcsIHNtMi51cmwpLCAxKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkZWJ1Z1RTKCdmbGFzaHRvanMnLCBmYWxzZSwgJzogVGltZWQgb3V0JyArIChvdmVySFRUUCA/ICcgKENoZWNrIGZsYXNoIHNlY3VyaXR5IG9yIGZsYXNoIGJsb2NrZXJzKSc6JyAoTm8gcGx1Z2luL21pc3NpbmcgU1dGPyknKSk7XHJcblxyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIC8vIGdpdmUgdXAgLyB0aW1lLW91dCwgZGVwZW5kaW5nXHJcblxyXG4gICAgICBpZiAoIWRpZEluaXQgJiYgb2tUb0Rpc2FibGUpIHtcclxuXHJcbiAgICAgICAgaWYgKHAgPT09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAvLyBTV0YgZmFpbGVkIHRvIHJlcG9ydCBsb2FkIHByb2dyZXNzLiBQb3NzaWJseSBibG9ja2VkLlxyXG5cclxuICAgICAgICAgIGlmIChzbTIudXNlRmxhc2hCbG9jayB8fCBzbTIuZmxhc2hMb2FkVGltZW91dCA9PT0gMCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHNtMi51c2VGbGFzaEJsb2NrKSB7XHJcblxyXG4gICAgICAgICAgICAgIGZsYXNoQmxvY2tIYW5kbGVyKCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBfd0RTKCd3YWl0Rm9yZXZlcicpO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBubyBjdXN0b20gZmxhc2ggYmxvY2sgaGFuZGxpbmcsIGJ1dCBTV0YgaGFzIHRpbWVkIG91dC4gV2lsbCByZWNvdmVyIGlmIHVzZXIgdW5ibG9ja3MgLyBhbGxvd3MgU1dGIGxvYWQuXHJcblxyXG4gICAgICAgICAgICBpZiAoIXNtMi51c2VGbGFzaEJsb2NrICYmIGNhbklnbm9yZUZsYXNoKSB7XHJcblxyXG4gICAgICAgICAgICAgIHJlYm9vdEludG9IVE1MNSgpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgX3dEUygnd2FpdEZvcmV2ZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gZmlyZSBhbnkgcmVndWxhciByZWdpc3RlcmVkIG9udGltZW91dCgpIGxpc3RlbmVycy5cclxuICAgICAgICAgICAgICBwcm9jZXNzT25FdmVudHMoe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ29udGltZW91dCcsXHJcbiAgICAgICAgICAgICAgICBpZ25vcmVJbml0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcclxuICAgICAgICAgICAgICAgICAgdHlwZTogJ0lOSVRfRkxBU0hCTE9DSydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gU1dGIGxvYWRlZD8gU2hvdWxkbid0IGJlIGEgYmxvY2tpbmcgaXNzdWUsIHRoZW4uXHJcblxyXG4gICAgICAgICAgaWYgKHNtMi5mbGFzaExvYWRUaW1lb3V0ID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICBfd0RTKCd3YWl0Rm9yZXZlcicpO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNtMi51c2VGbGFzaEJsb2NrICYmIGNhbklnbm9yZUZsYXNoKSB7XHJcblxyXG4gICAgICAgICAgICAgIHJlYm9vdEludG9IVE1MNSgpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgZmFpbFNhZmVseSh0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9LCBzbTIuZmxhc2hMb2FkVGltZW91dCk7XHJcblxyXG4gIH07XHJcblxyXG4gIGhhbmRsZUZvY3VzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgZnVuY3Rpb24gY2xlYW51cCgpIHtcclxuICAgICAgZXZlbnQucmVtb3ZlKHdpbmRvdywgJ2ZvY3VzJywgaGFuZGxlRm9jdXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpc0ZvY3VzZWQgfHwgIXRyeUluaXRPbkZvY3VzKSB7XHJcbiAgICAgIC8vIGFscmVhZHkgZm9jdXNlZCwgb3Igbm90IHNwZWNpYWwgU2FmYXJpIGJhY2tncm91bmQgdGFiIGNhc2VcclxuICAgICAgY2xlYW51cCgpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBva1RvRGlzYWJsZSA9IHRydWU7XHJcbiAgICBpc0ZvY3VzZWQgPSB0cnVlO1xyXG4gICAgX3dEUygnZ290Rm9jdXMnKTtcclxuXHJcbiAgICAvLyBhbGxvdyBpbml0IHRvIHJlc3RhcnRcclxuICAgIHdhaXRpbmdGb3JFSSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIGtpY2sgb2ZmIEV4dGVybmFsSW50ZXJmYWNlIHRpbWVvdXQsIG5vdyB0aGF0IHRoZSBTV0YgaGFzIHN0YXJ0ZWRcclxuICAgIGRlbGF5V2FpdEZvckVJKCk7XHJcblxyXG4gICAgY2xlYW51cCgpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIGZsdXNoTWVzc2FnZXMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyA8ZD5cclxuXHJcbiAgICAvLyBTTTIgcHJlLWluaXQgZGVidWcgbWVzc2FnZXNcclxuICAgIGlmIChtZXNzYWdlcy5sZW5ndGgpIHtcclxuICAgICAgc20yLl93RCgnU291bmRNYW5hZ2VyIDI6ICcgKyBtZXNzYWdlcy5qb2luKCcgJyksIDEpO1xyXG4gICAgICBtZXNzYWdlcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgc2hvd1N1cHBvcnQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyA8ZD5cclxuXHJcbiAgICBmbHVzaE1lc3NhZ2VzKCk7XHJcblxyXG4gICAgdmFyIGl0ZW0sIHRlc3RzID0gW107XHJcblxyXG4gICAgaWYgKHNtMi51c2VIVE1MNUF1ZGlvICYmIHNtMi5oYXNIVE1MNSkge1xyXG4gICAgICBmb3IgKGl0ZW0gaW4gc20yLmF1ZGlvRm9ybWF0cykge1xyXG4gICAgICAgIGlmIChzbTIuYXVkaW9Gb3JtYXRzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcbiAgICAgICAgICB0ZXN0cy5wdXNoKGl0ZW0gKyAnID0gJyArIHNtMi5odG1sNVtpdGVtXSArICghc20yLmh0bWw1W2l0ZW1dICYmIG5lZWRzRmxhc2ggJiYgc20yLmZsYXNoW2l0ZW1dID8gJyAodXNpbmcgZmxhc2gpJyA6IChzbTIucHJlZmVyRmxhc2ggJiYgc20yLmZsYXNoW2l0ZW1dICYmIG5lZWRzRmxhc2ggPyAnIChwcmVmZXJyaW5nIGZsYXNoKScgOiAoIXNtMi5odG1sNVtpdGVtXSA/ICcgKCcgKyAoc20yLmF1ZGlvRm9ybWF0c1tpdGVtXS5yZXF1aXJlZCA/ICdyZXF1aXJlZCwgJyA6ICcnKSArICdhbmQgbm8gZmxhc2ggc3VwcG9ydCknIDogJycpKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzbTIuX3dEKCdTb3VuZE1hbmFnZXIgMiBIVE1MNSBzdXBwb3J0OiAnICsgdGVzdHMuam9pbignLCAnKSwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICBpbml0Q29tcGxldGUgPSBmdW5jdGlvbihiTm9EaXNhYmxlKSB7XHJcblxyXG4gICAgaWYgKGRpZEluaXQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgIC8vIGFsbCBnb29kLlxyXG4gICAgICBfd0RTKCdzbTJMb2FkZWQnLCAxKTtcclxuICAgICAgZGlkSW5pdCA9IHRydWU7XHJcbiAgICAgIGluaXRVc2VyT25sb2FkKCk7XHJcbiAgICAgIGRlYnVnVFMoJ29ubG9hZCcsIHRydWUpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgd2FzVGltZW91dCA9IChzbTIudXNlRmxhc2hCbG9jayAmJiBzbTIuZmxhc2hMb2FkVGltZW91dCAmJiAhc20yLmdldE1vdmllUGVyY2VudCgpKSxcclxuICAgICAgICByZXN1bHQgPSB0cnVlLFxyXG4gICAgICAgIGVycm9yO1xyXG5cclxuICAgIGlmICghd2FzVGltZW91dCkge1xyXG4gICAgICBkaWRJbml0ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBlcnJvciA9IHtcclxuICAgICAgdHlwZTogKCFoYXNGbGFzaCAmJiBuZWVkc0ZsYXNoID8gJ05PX0ZMQVNIJyA6ICdJTklUX1RJTUVPVVQnKVxyXG4gICAgfTtcclxuXHJcbiAgICBzbTIuX3dEKCdTb3VuZE1hbmFnZXIgMiAnICsgKGRpc2FibGVkID8gJ2ZhaWxlZCB0byBsb2FkJyA6ICdsb2FkZWQnKSArICcgKCcgKyAoZGlzYWJsZWQgPyAnRmxhc2ggc2VjdXJpdHkvbG9hZCBlcnJvcicgOiAnT0snKSArICcpICcgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGRpc2FibGVkID8gMTAwMDYgOiAxMDAwMyksIGRpc2FibGVkID8gMjogMSk7XHJcblxyXG4gICAgaWYgKGRpc2FibGVkIHx8IGJOb0Rpc2FibGUpIHtcclxuXHJcbiAgICAgIGlmIChzbTIudXNlRmxhc2hCbG9jayAmJiBzbTIub01DKSB7XHJcbiAgICAgICAgc20yLm9NQy5jbGFzc05hbWUgPSBnZXRTV0ZDU1MoKSArICcgJyArIChzbTIuZ2V0TW92aWVQZXJjZW50KCkgPT09IG51bGwgPyBzd2ZDU1Muc3dmVGltZWRvdXQgOiBzd2ZDU1Muc3dmRXJyb3IpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwcm9jZXNzT25FdmVudHMoe1xyXG4gICAgICAgIHR5cGU6ICdvbnRpbWVvdXQnLFxyXG4gICAgICAgIGVycm9yOiBlcnJvcixcclxuICAgICAgICBpZ25vcmVJbml0OiB0cnVlXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgZGVidWdUUygnb25sb2FkJywgZmFsc2UpO1xyXG4gICAgICBjYXRjaEVycm9yKGVycm9yKTtcclxuXHJcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICBkZWJ1Z1RTKCdvbmxvYWQnLCB0cnVlKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFkaXNhYmxlZCkge1xyXG5cclxuICAgICAgaWYgKHNtMi53YWl0Rm9yV2luZG93TG9hZCAmJiAhd2luZG93TG9hZGVkKSB7XHJcblxyXG4gICAgICAgIF93RFMoJ3dhaXRPbmxvYWQnKTtcclxuICAgICAgICBldmVudC5hZGQod2luZG93LCAnbG9hZCcsIGluaXRVc2VyT25sb2FkKTtcclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIDxkPlxyXG4gICAgICAgIGlmIChzbTIud2FpdEZvcldpbmRvd0xvYWQgJiYgd2luZG93TG9hZGVkKSB7XHJcbiAgICAgICAgICBfd0RTKCdkb2NMb2FkZWQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgICBpbml0VXNlck9ubG9hZCgpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBhcHBseSB0b3AtbGV2ZWwgc2V0dXBPcHRpb25zIG9iamVjdCBhcyBsb2NhbCBwcm9wZXJ0aWVzLCBlZy4sIHRoaXMuc2V0dXBPcHRpb25zLmZsYXNoVmVyc2lvbiAtPiB0aGlzLmZsYXNoVmVyc2lvbiAoc291bmRNYW5hZ2VyLmZsYXNoVmVyc2lvbilcclxuICAgKiB0aGlzIG1haW50YWlucyBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LCBhbmQgYWxsb3dzIHByb3BlcnRpZXMgdG8gYmUgZGVmaW5lZCBzZXBhcmF0ZWx5IGZvciB1c2UgYnkgc291bmRNYW5hZ2VyLnNldHVwKCkuXHJcbiAgICovXHJcblxyXG4gIHNldFByb3BlcnRpZXMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgaSxcclxuICAgICAgICBvID0gc20yLnNldHVwT3B0aW9ucztcclxuXHJcbiAgICBmb3IgKGkgaW4gbykge1xyXG5cclxuICAgICAgaWYgKG8uaGFzT3duUHJvcGVydHkoaSkpIHtcclxuXHJcbiAgICAgICAgLy8gYXNzaWduIGxvY2FsIHByb3BlcnR5IGlmIG5vdCBhbHJlYWR5IGRlZmluZWRcclxuXHJcbiAgICAgICAgaWYgKHNtMltpXSA9PT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgIHNtMltpXSA9IG9baV07XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoc20yW2ldICE9PSBvW2ldKSB7XHJcblxyXG4gICAgICAgICAgLy8gbGVnYWN5IHN1cHBvcnQ6IHdyaXRlIG1hbnVhbGx5LWFzc2lnbmVkIHByb3BlcnR5IChlZy4sIHNvdW5kTWFuYWdlci51cmwpIGJhY2sgdG8gc2V0dXBPcHRpb25zIHRvIGtlZXAgdGhpbmdzIGluIHN5bmNcclxuICAgICAgICAgIHNtMi5zZXR1cE9wdGlvbnNbaV0gPSBzbTJbaV07XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG5cclxuICBpbml0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gY2FsbGVkIGFmdGVyIG9ubG9hZCgpXHJcblxyXG4gICAgaWYgKGRpZEluaXQpIHtcclxuICAgICAgX3dEUygnZGlkSW5pdCcpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xlYW51cCgpIHtcclxuICAgICAgZXZlbnQucmVtb3ZlKHdpbmRvdywgJ2xvYWQnLCBzbTIuYmVnaW5EZWxheWVkSW5pdCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuXHJcbiAgICAgIGlmICghZGlkSW5pdCkge1xyXG4gICAgICAgIC8vIHdlIGRvbid0IG5lZWQgbm8gc3RlZW5raW5nIGZsYXNoIVxyXG4gICAgICAgIGNsZWFudXAoKTtcclxuICAgICAgICBzbTIuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgaW5pdENvbXBsZXRlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBmbGFzaCBwYXRoXHJcbiAgICBpbml0TW92aWUoKTtcclxuXHJcbiAgICB0cnkge1xyXG5cclxuICAgICAgLy8gYXR0ZW1wdCB0byB0YWxrIHRvIEZsYXNoXHJcbiAgICAgIGZsYXNoLl9leHRlcm5hbEludGVyZmFjZVRlc3QoZmFsc2UpO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEFwcGx5IHVzZXItc3BlY2lmaWVkIHBvbGxpbmcgaW50ZXJ2YWwsIE9SLCBpZiBcImhpZ2ggcGVyZm9ybWFuY2VcIiBzZXQsIGZhc3RlciB2cy4gZGVmYXVsdCBwb2xsaW5nXHJcbiAgICAgICAqIChkZXRlcm1pbmVzIGZyZXF1ZW5jeSBvZiB3aGlsZWxvYWRpbmcvd2hpbGVwbGF5aW5nIGNhbGxiYWNrcywgZWZmZWN0aXZlbHkgZHJpdmluZyBVSSBmcmFtZXJhdGVzKVxyXG4gICAgICAgKi9cclxuICAgICAgc2V0UG9sbGluZyh0cnVlLCAoc20yLmZsYXNoUG9sbGluZ0ludGVydmFsIHx8IChzbTIudXNlSGlnaFBlcmZvcm1hbmNlID8gMTAgOiA1MCkpKTtcclxuXHJcbiAgICAgIGlmICghc20yLmRlYnVnTW9kZSkge1xyXG4gICAgICAgIC8vIHN0b3AgdGhlIFNXRiBmcm9tIG1ha2luZyBkZWJ1ZyBvdXRwdXQgY2FsbHMgdG8gSlNcclxuICAgICAgICBmbGFzaC5fZGlzYWJsZURlYnVnKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5lbmFibGVkID0gdHJ1ZTtcclxuICAgICAgZGVidWdUUygnanN0b2ZsYXNoJywgdHJ1ZSk7XHJcblxyXG4gICAgICBpZiAoIXNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgICAvLyBwcmV2ZW50IGJyb3dzZXIgZnJvbSBzaG93aW5nIGNhY2hlZCBwYWdlIHN0YXRlIChvciByYXRoZXIsIHJlc3RvcmluZyBcInN1c3BlbmRlZFwiIHBhZ2Ugc3RhdGUpIHZpYSBiYWNrIGJ1dHRvbiwgYmVjYXVzZSBmbGFzaCBtYXkgYmUgZGVhZFxyXG4gICAgICAgIC8vIGh0dHA6Ly93d3cud2Via2l0Lm9yZy9ibG9nLzUxNi93ZWJraXQtcGFnZS1jYWNoZS1paS10aGUtdW5sb2FkLWV2ZW50L1xyXG4gICAgICAgIGV2ZW50LmFkZCh3aW5kb3csICd1bmxvYWQnLCBkb05vdGhpbmcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSBjYXRjaChlKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKCdqcy9mbGFzaCBleGNlcHRpb246ICcgKyBlLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgZGVidWdUUygnanN0b2ZsYXNoJywgZmFsc2UpO1xyXG5cclxuICAgICAgY2F0Y2hFcnJvcih7XHJcbiAgICAgICAgdHlwZTogJ0pTX1RPX0ZMQVNIX0VYQ0VQVElPTicsXHJcbiAgICAgICAgZmF0YWw6IHRydWVcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBkb24ndCBkaXNhYmxlLCBmb3IgcmVib290KClcclxuICAgICAgZmFpbFNhZmVseSh0cnVlKTtcclxuXHJcbiAgICAgIGluaXRDb21wbGV0ZSgpO1xyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpbml0Q29tcGxldGUoKTtcclxuXHJcbiAgICAvLyBkaXNjb25uZWN0IGV2ZW50c1xyXG4gICAgY2xlYW51cCgpO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBkb21Db250ZW50TG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgaWYgKGRpZERDTG9hZGVkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkaWREQ0xvYWRlZCA9IHRydWU7XHJcblxyXG4gICAgLy8gYXNzaWduIHRvcC1sZXZlbCBzb3VuZE1hbmFnZXIgcHJvcGVydGllcyBlZy4gc291bmRNYW5hZ2VyLnVybFxyXG4gICAgc2V0UHJvcGVydGllcygpO1xyXG5cclxuICAgIGluaXREZWJ1ZygpO1xyXG5cclxuICAgIGlmICghaGFzRmxhc2ggJiYgc20yLmhhc0hUTUw1KSB7XHJcblxyXG4gICAgICBzbTIuX3dEKCdTb3VuZE1hbmFnZXIgMjogTm8gRmxhc2ggZGV0ZWN0ZWQnICsgKCFzbTIudXNlSFRNTDVBdWRpbyA/ICcsIGVuYWJsaW5nIEhUTUw1LicgOiAnLiBUcnlpbmcgSFRNTDUtb25seSBtb2RlLicpLCAxKTtcclxuXHJcbiAgICAgIHNtMi5zZXR1cCh7XHJcbiAgICAgICAgJ3VzZUhUTUw1QXVkaW8nOiB0cnVlLFxyXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBhcmVuJ3QgcHJlZmVycmluZyBmbGFzaCwgZWl0aGVyXHJcbiAgICAgICAgLy8gVE9ETzogcHJlZmVyRmxhc2ggc2hvdWxkIG5vdCBtYXR0ZXIgaWYgZmxhc2ggaXMgbm90IGluc3RhbGxlZC4gQ3VycmVudGx5LCBzdHVmZiBicmVha3Mgd2l0aG91dCB0aGUgYmVsb3cgdHdlYWsuXHJcbiAgICAgICAgJ3ByZWZlckZsYXNoJzogZmFsc2VcclxuICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3RIVE1MNSgpO1xyXG5cclxuICAgIGlmICghaGFzRmxhc2ggJiYgbmVlZHNGbGFzaCkge1xyXG5cclxuICAgICAgbWVzc2FnZXMucHVzaChzdHJpbmdzLm5lZWRGbGFzaCk7XHJcblxyXG4gICAgICAvLyBUT0RPOiBGYXRhbCBoZXJlIHZzLiB0aW1lb3V0IGFwcHJvYWNoLCBldGMuXHJcbiAgICAgIC8vIGhhY2s6IGZhaWwgc29vbmVyLlxyXG4gICAgICBzbTIuc2V0dXAoe1xyXG4gICAgICAgICdmbGFzaExvYWRUaW1lb3V0JzogMVxyXG4gICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKSB7XHJcbiAgICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZG9tQ29udGVudExvYWRlZCwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRNb3ZpZSgpO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBkb21Db250ZW50TG9hZGVkSUUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZiAoZG9jLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcclxuICAgICAgZG9tQ29udGVudExvYWRlZCgpO1xyXG4gICAgICBkb2MuZGV0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGRvbUNvbnRlbnRMb2FkZWRJRSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIHdpbk9uTG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIGNhdGNoIGVkZ2UgY2FzZSBvZiBpbml0Q29tcGxldGUoKSBmaXJpbmcgYWZ0ZXIgd2luZG93LmxvYWQoKVxyXG4gICAgd2luZG93TG9hZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBjYXRjaCBjYXNlIHdoZXJlIERPTUNvbnRlbnRMb2FkZWQgaGFzIGJlZW4gc2VudCwgYnV0IHdlJ3JlIHN0aWxsIGluIGRvYy5yZWFkeVN0YXRlID0gJ2ludGVyYWN0aXZlJ1xyXG4gICAgZG9tQ29udGVudExvYWRlZCgpO1xyXG5cclxuICAgIGV2ZW50LnJlbW92ZSh3aW5kb3csICdsb2FkJywgd2luT25Mb2FkKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLy8gc25pZmYgdXAtZnJvbnRcclxuICBkZXRlY3RGbGFzaCgpO1xyXG5cclxuICAvLyBmb2N1cyBhbmQgd2luZG93IGxvYWQsIGluaXQgKHByaW1hcmlseSBmbGFzaC1kcml2ZW4pXHJcbiAgZXZlbnQuYWRkKHdpbmRvdywgJ2ZvY3VzJywgaGFuZGxlRm9jdXMpO1xyXG4gIGV2ZW50LmFkZCh3aW5kb3csICdsb2FkJywgZGVsYXlXYWl0Rm9yRUkpO1xyXG4gIGV2ZW50LmFkZCh3aW5kb3csICdsb2FkJywgd2luT25Mb2FkKTtcclxuXHJcbiAgaWYgKGRvYy5hZGRFdmVudExpc3RlbmVyKSB7XHJcblxyXG4gICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBkb21Db250ZW50TG9hZGVkLCBmYWxzZSk7XHJcblxyXG4gIH0gZWxzZSBpZiAoZG9jLmF0dGFjaEV2ZW50KSB7XHJcblxyXG4gICAgZG9jLmF0dGFjaEV2ZW50KCdvbnJlYWR5c3RhdGVjaGFuZ2UnLCBkb21Db250ZW50TG9hZGVkSUUpO1xyXG5cclxuICB9IGVsc2Uge1xyXG5cclxuICAgIC8vIG5vIGFkZC9hdHRhY2hldmVudCBzdXBwb3J0IC0gc2FmZSB0byBhc3N1bWUgbm8gSlMgLT4gRmxhc2ggZWl0aGVyXHJcbiAgICBkZWJ1Z1RTKCdvbmxvYWQnLCBmYWxzZSk7XHJcbiAgICBjYXRjaEVycm9yKHtcclxuICAgICAgdHlwZTogJ05PX0RPTTJfRVZFTlRTJyxcclxuICAgICAgZmF0YWw6IHRydWVcclxuICAgIH0pO1xyXG5cclxuICB9XHJcblxyXG59IC8vIFNvdW5kTWFuYWdlcigpXHJcblxyXG4vLyBTTTJfREVGRVIgZGV0YWlsczogaHR0cDovL3d3dy5zY2hpbGxtYW5pYS5jb20vcHJvamVjdHMvc291bmRtYW5hZ2VyMi9kb2MvZ2V0c3RhcnRlZC8jbGF6eS1sb2FkaW5nXHJcblxyXG5pZiAod2luZG93LlNNMl9ERUZFUiA9PT0gX3VuZGVmaW5lZCB8fCAhU00yX0RFRkVSKSB7XHJcbiAgc291bmRNYW5hZ2VyID0gbmV3IFNvdW5kTWFuYWdlcigpO1xyXG59XHJcblxyXG4vKipcclxuICogU291bmRNYW5hZ2VyIHB1YmxpYyBpbnRlcmZhY2VzXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKi9cclxuXHJcbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG5cclxuICAvKipcclxuICAgKiBjb21tb25KUyBtb2R1bGVcclxuICAgKi9cclxuXHJcbiAgbW9kdWxlLmV4cG9ydHMuU291bmRNYW5hZ2VyID0gU291bmRNYW5hZ2VyO1xyXG4gIG1vZHVsZS5leHBvcnRzLnNvdW5kTWFuYWdlciA9IHNvdW5kTWFuYWdlcjtcclxuXHJcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEFNRCAtIHJlcXVpcmVKU1xyXG4gICAqIGJhc2ljIHVzYWdlOlxyXG4gICAqIHJlcXVpcmUoW1wiL3BhdGgvdG8vc291bmRtYW5hZ2VyMi5qc1wiXSwgZnVuY3Rpb24oU291bmRNYW5hZ2VyKSB7XHJcbiAgICogICBTb3VuZE1hbmFnZXIuZ2V0SW5zdGFuY2UoKS5zZXR1cCh7XHJcbiAgICogICAgIHVybDogJy9zd2YvJyxcclxuICAgKiAgICAgb25yZWFkeTogZnVuY3Rpb24oKSB7IC4uLiB9XHJcbiAgICogICB9KVxyXG4gICAqIH0pO1xyXG4gICAqXHJcbiAgICogU00yX0RFRkVSIHVzYWdlOlxyXG4gICAqIHdpbmRvdy5TTTJfREVGRVIgPSB0cnVlO1xyXG4gICAqIHJlcXVpcmUoW1wiL3BhdGgvdG8vc291bmRtYW5hZ2VyMi5qc1wiXSwgZnVuY3Rpb24oU291bmRNYW5hZ2VyKSB7XHJcbiAgICogICBTb3VuZE1hbmFnZXIuZ2V0SW5zdGFuY2UoZnVuY3Rpb24oKSB7XHJcbiAgICogICAgIHZhciBzb3VuZE1hbmFnZXIgPSBuZXcgU291bmRNYW5hZ2VyLmNvbnN0cnVjdG9yKCk7XHJcbiAgICogICAgIHNvdW5kTWFuYWdlci5zZXR1cCh7XHJcbiAgICogICAgICAgdXJsOiAnL3N3Zi8nLFxyXG4gICAqICAgICAgIC4uLlxyXG4gICAqICAgICB9KTtcclxuICAgKiAgICAgLi4uXHJcbiAgICogICAgIHNvdW5kTWFuYWdlci5iZWdpbkRlbGF5ZWRJbml0KCk7XHJcbiAgICogICAgIHJldHVybiBzb3VuZE1hbmFnZXI7XHJcbiAgICogICB9KVxyXG4gICAqIH0pOyBcclxuICAgKi9cclxuXHJcbiAgZGVmaW5lKGZ1bmN0aW9uKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZSB0aGUgZ2xvYmFsIGluc3RhbmNlIG9mIFNvdW5kTWFuYWdlci5cclxuICAgICAqIElmIGEgZ2xvYmFsIGluc3RhbmNlIGRvZXMgbm90IGV4aXN0IGl0IGNhbiBiZSBjcmVhdGVkIHVzaW5nIGEgY2FsbGJhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gc21CdWlsZGVyIE9wdGlvbmFsOiBDYWxsYmFjayB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBTb3VuZE1hbmFnZXIgaW5zdGFuY2VcclxuICAgICAqIEByZXR1cm4ge1NvdW5kTWFuYWdlcn0gVGhlIGdsb2JhbCBTb3VuZE1hbmFnZXIgaW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0SW5zdGFuY2Uoc21CdWlsZGVyKSB7XHJcbiAgICAgIGlmICghd2luZG93LnNvdW5kTWFuYWdlciAmJiBzbUJ1aWxkZXIgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xyXG4gICAgICAgIHZhciBpbnN0YW5jZSA9IHNtQnVpbGRlcihTb3VuZE1hbmFnZXIpO1xyXG4gICAgICAgIGlmIChpbnN0YW5jZSBpbnN0YW5jZW9mIFNvdW5kTWFuYWdlcikge1xyXG4gICAgICAgICAgd2luZG93LnNvdW5kTWFuYWdlciA9IGluc3RhbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gd2luZG93LnNvdW5kTWFuYWdlcjtcclxuICAgIH1cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbnN0cnVjdG9yOiBTb3VuZE1hbmFnZXIsXHJcbiAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxufVxyXG5cclxuLy8gc3RhbmRhcmQgYnJvd3NlciBjYXNlXHJcblxyXG4vLyBjb25zdHJ1Y3RvclxyXG53aW5kb3cuU291bmRNYW5hZ2VyID0gU291bmRNYW5hZ2VyO1xyXG5cclxuLyoqXHJcbiAqIG5vdGU6IFNNMiByZXF1aXJlcyBhIHdpbmRvdyBnbG9iYWwgZHVlIHRvIEZsYXNoLCB3aGljaCBtYWtlcyBjYWxscyB0byB3aW5kb3cuc291bmRNYW5hZ2VyLlxyXG4gKiBGbGFzaCBtYXkgbm90IGFsd2F5cyBiZSBuZWVkZWQsIGJ1dCB0aGlzIGlzIG5vdCBrbm93biB1bnRpbCBhc3luYyBpbml0IGFuZCBTTTIgbWF5IGV2ZW4gXCJyZWJvb3RcIiBpbnRvIEZsYXNoIG1vZGUuXHJcbiAqL1xyXG5cclxuLy8gcHVibGljIEFQSSwgZmxhc2ggY2FsbGJhY2tzIGV0Yy5cclxud2luZG93LnNvdW5kTWFuYWdlciA9IHNvdW5kTWFuYWdlcjtcclxuXHJcbn0od2luZG93KSk7XHJcbiJdfQ==
