'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _reactScrollbar = require('react-scrollbar');

var _reactScrollbar2 = _interopRequireDefault(_reactScrollbar);

exports['default'] = function (PydioComponent) {
    var scrollAreaProps = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var VerticalScrollArea = (function (_Component) {
        _inherits(VerticalScrollArea, _Component);

        function VerticalScrollArea() {
            _classCallCheck(this, VerticalScrollArea);

            _Component.apply(this, arguments);
        }

        VerticalScrollArea.prototype.render = function render() {
            if (this.props.id || scrollAreaProps.id) {
                var props = _extends({}, this.props, { id: undefined, style: undefined, className: undefined });
                return React.createElement(
                    'div',
                    {
                        id: scrollAreaProps.id || this.props.id,
                        style: _extends({}, this.props.style, scrollAreaProps.style),
                        className: scrollAreaProps.className || this.props.className
                    },
                    React.createElement(
                        _reactScrollbar2['default'],
                        {
                            speed: 0.8,
                            horizontal: false,
                            style: { height: '100%' },
                            verticalScrollbarStyle: { borderRadius: 10, width: 6 },
                            verticalContainerStyle: { width: 8 }
                        },
                        React.createElement(PydioComponent, props)
                    )
                );
            } else {
                return React.createElement(
                    _reactScrollbar2['default'],
                    {
                        speed: 0.8,
                        horizontal: false,
                        verticalScrollbarStyle: { borderRadius: 10, width: 6 },
                        verticalContainerStyle: { width: 8 },
                        style: _extends({}, this.props.style, scrollAreaProps.style),
                        className: scrollAreaProps.className || this.props.className
                    },
                    React.createElement(PydioComponent, this.props)
                );
            }
        };

        return VerticalScrollArea;
    })(_react.Component);

    return VerticalScrollArea;
};

module.exports = exports['default'];
