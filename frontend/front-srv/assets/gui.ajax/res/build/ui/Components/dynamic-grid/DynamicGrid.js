/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _Store = require('./Store');

var _Store2 = _interopRequireDefault(_Store);

var _GridBuilder = require('./GridBuilder');

var _GridBuilder2 = _interopRequireDefault(_GridBuilder);

/**
 * Automatic layout for presenting draggable cards to users. Used for user and admin dashboard.
 */
var React = require('react');
var Pydio = require('pydio');

var _require = require('react-grid-layout');

var Responsive = _require.Responsive;
var WidthProvider = _require.WidthProvider;

var _Pydio$requireLib = Pydio.requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

var CardsGrid = (function (_React$Component) {
    _inherits(CardsGrid, _React$Component);

    function CardsGrid(props, context) {
        _classCallCheck(this, CardsGrid);

        _React$Component.call(this, props, context);
        this._storeObserver = (function (e) {
            var _this = this;

            this._forceUpdate = true;
            this.setState({
                cards: props.store.getCards()
            }, function () {
                _this._forceUpdate = false;
            });
        }).bind(this);
        props.store.observe("cards", this._storeObserver);
        this.state = { cards: props.store.getCards() };
    }

    /**
     * Save layouts in the users preference.
     *
     * @param {object} allLayouts Responsive layouts passed for saving
     */

    CardsGrid.prototype.saveFullLayouts = function saveFullLayouts(allLayouts) {
        var savedPref = this.props.store.getUserPreference('Layout');
        // Compare JSON versions to avoid saving unnecessary changes
        if (savedPref && this.previousLayout && this.previousLayout == JSON.stringify(allLayouts)) {
            return;
        }
        this.previousLayout = JSON.stringify(allLayouts);
        this.props.store.saveUserPreference('Layout', allLayouts);
    };

    CardsGrid.prototype.onLayoutChange = function onLayoutChange(currentLayout, allLayouts) {
        if (this._blockLayoutSave) {
            return;
        }
        this.saveFullLayouts(allLayouts);
    };

    CardsGrid.prototype.componentWillUnmount = function componentWillUnmount() {
        this.props.store.stopObserving("cards", this._storeObserver);
    };

    CardsGrid.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        if (this.props && nextProps.editMode !== this.props.editMode) {
            Object.keys(this.refs).forEach((function (k) {
                this.refs[k].toggleEditMode(nextProps.editMode);
            }).bind(this));
        }
    };

    CardsGrid.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
        return this._forceUpdate || false;
    };

    CardsGrid.prototype.removeCard = function removeCard(itemKey) {
        this.props.removeCard(itemKey);
    };

    CardsGrid.prototype.buildCards = function buildCards(cards) {
        var _this2 = this;

        var index = 0;
        var layouts = { lg: [], md: [], sm: [], xs: [], xxs: [] };
        var items = [];
        var additionalNamespaces = [];
        var rand = Math.random();
        var savedLayouts = this.props.store.getUserPreference('Layout');
        var buildLayout = function buildLayout(classObject, itemKey, item, x, y) {
            var layout = classObject.getGridLayout(x, y);
            layout['handle'] = 'h4';
            if (item['gridHandle']) {
                layout['handle'] = item['gridHandle'];
            }
            layout['i'] = itemKey;
            return layout;
        };
        cards.map(function (item) {

            var parts = item.componentClass.split(".");
            var classNS = parts[0];
            var className = parts[1];
            var classObject;
            if (global[classNS] && global[classNS][className]) {
                classObject = global[classNS][className];
            } else {
                if (!global[classNS]) {
                    additionalNamespaces.push(classNS);
                }
                return;
            }
            var props = _extends({}, item.props);
            var itemKey = props['key'] = item['id'] || 'item_' + index;
            props.ref = itemKey;
            props.pydio = _this2.props.pydio;
            props.onCloseAction = function () {
                _this2.removeCard(itemKey);
            };
            props.preferencesProvider = _this2.props.store;
            var defaultX = 0,
                defaultY = 0;
            if (item.defaultPosition) {
                defaultX = item.defaultPosition.x;
                defaultY = item.defaultPosition.y;
            }
            var defaultLayout = buildLayout(classObject, itemKey, item, defaultX, defaultY);

            for (var breakpoint in layouts) {
                if (!layouts.hasOwnProperty(breakpoint)) continue;
                var breakLayout = layouts[breakpoint];
                // Find corresponding element in preference
                var existing;
                if (savedLayouts && savedLayouts[breakpoint]) {
                    savedLayouts[breakpoint].map(function (gridData) {
                        if (gridData['i'] == itemKey && gridData['h'] == defaultLayout['h']) {
                            existing = gridData;
                        }
                    });
                }
                if (existing) {
                    breakLayout.push(existing);
                } else if (item.defaultLayouts && item.defaultLayouts[breakpoint]) {
                    var crtLayout = buildLayout(classObject, itemKey, item, item.defaultLayouts[breakpoint].x, item.defaultLayouts[breakpoint].y);
                    breakLayout.push(crtLayout);
                } else {
                    breakLayout.push(defaultLayout);
                }
            }
            index++;
            items.push(React.createElement(classObject, props));
        });

        if (additionalNamespaces.length) {
            this._blockLayoutSave = true;
            _pydioHttpResourcesManager2['default'].loadClassesAndApply(additionalNamespaces, (function () {
                this.setState({ additionalNamespacesLoaded: additionalNamespaces }, (function () {
                    this._blockLayoutSave = false;
                }).bind(this));
            }).bind(this));
        }
        return { cards: items, layouts: layouts };
    };

    CardsGrid.prototype.render = function render() {
        var _buildCards = this.buildCards(this.state.cards);

        var cards = _buildCards.cards;
        var layouts = _buildCards.layouts;

        var ResponsiveGridLayout = WidthProvider(Responsive);
        return React.createElement(
            ResponsiveGridLayout,
            {
                className: 'dashboard-layout',
                cols: this.props.cols || { lg: 10, md: 8, sm: 8, xs: 4, xxs: 2 },
                layouts: layouts,
                rowHeight: 5,
                onLayoutChange: this.onLayoutChange.bind(this),
                isDraggable: !this.props.disableDrag,
                style: this.props.style,
                autoSize: false
            },
            cards
        );
    };

    return CardsGrid;
})(React.Component);

var DynamicGrid = (function (_React$Component2) {
    _inherits(DynamicGrid, _React$Component2);

    function DynamicGrid(props) {
        _classCallCheck(this, DynamicGrid);

        _React$Component2.call(this, props);
        var store = new _Store2['default'](props.storeNamespace, props.defaultCards, props.pydio);

        this.state = {
            editMode: false,
            store: store
        };
    }

    DynamicGrid.prototype.removeCard = function removeCard(cardId) {

        this.state.store.removeCard(cardId);
    };

    DynamicGrid.prototype.addCard = function addCard(cardDefinition) {

        this.state.store.addCard(cardDefinition);
    };

    DynamicGrid.prototype.resetCardsAndLayout = function resetCardsAndLayout() {
        this.state.store.saveUserPreference('Layout', null);
        this.state.store.setCards(this.props.defaultCards);
    };

    DynamicGrid.prototype.toggleEditMode = function toggleEditMode() {
        this.setState({ editMode: !this.state.editMode });
    };

    DynamicGrid.prototype.render = function render() {
        var _this3 = this;

        var monitorWidgetEditing = (function (status) {
            this.setState({ widgetEditing: status });
        }).bind(this);

        var builder = undefined;
        if (this.props.builderNamespaces && this.state.editMode) {
            builder = React.createElement(_GridBuilder2['default'], {
                className: 'admin-helper-panel',
                namespaces: this.props.builderNamespaces,
                onCreateCard: this.addCard.bind(this),
                onResetLayout: this.resetCardsAndLayout.bind(this),
                onEditStatusChange: monitorWidgetEditing,
                getMessage: function (id) {
                    var ns = arguments.length <= 1 || arguments[1] === undefined ? 'ajxp_admin' : arguments[1];
                    return _this3.props.getMessage(id, ns);
                }
            });
        }

        var rglStyle = this.props.rglStyle || {};
        return React.createElement(
            'div',
            { style: _extends({}, this.props.style, { width: '100%', flex: '1' }), className: this.state.editMode ? "builder-open" : "" },
            !this.props.disableEdit && React.createElement(
                'div',
                { style: { position: 'absolute', bottom: 30, right: 18, zIndex: 11 } },
                React.createElement(MaterialUI.FloatingActionButton, {
                    tooltip: this.props.getMessage('home.49'),
                    onClick: this.toggleEditMode.bind(this),
                    iconClassName: this.state.editMode ? "icon-ok" : "mdi mdi-pencil",
                    mini: this.state.editMode,
                    disabled: this.state.editMode && this.state.widgetEditing
                })
            ),
            builder,
            React.createElement(
                'div',
                { className: 'home-dashboard', style: { height: '100%' } },
                React.createElement(CardsGrid, {
                    disableDrag: this.props.disableDrag,
                    cols: this.props.cols,
                    store: this.state.store,
                    style: rglStyle,
                    pydio: this.props.pydio,
                    editMode: this.state.editMode,
                    removeCard: this.removeCard.bind(this)
                })
            )
        );
    };

    return DynamicGrid;
})(React.Component);

exports['default'] = DynamicGrid = PydioContextConsumer(DynamicGrid);
exports['default'] = DynamicGrid;
module.exports = exports['default'];
