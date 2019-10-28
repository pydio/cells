'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var Connect = (function (_React$Component) {
    _inherits(Connect, _React$Component);

    function Connect(props) {
        _classCallCheck(this, Connect);

        _get(Object.getPrototypeOf(Connect.prototype), 'constructor', this).call(this, props);
    }

    _createClass(Connect, [{
        key: 'getLeftGridY',
        value: function getLeftGridY() {
            var _props = this.props;
            var dotsRadius = _props.dotsRadius;
            var subheaderHeight = _props.subheaderHeight;
            var leftGridHeight = _props.leftGridHeight;
            var leftGridOffset = _props.leftGridOffset;

            return leftGridHeight / 2 + dotsRadius + subheaderHeight + leftGridOffset;
        }
    }, {
        key: 'getRightGridY',
        value: function getRightGridY() {
            var _props2 = this.props;
            var dotsRadius = _props2.dotsRadius;
            var subheaderHeight = _props2.subheaderHeight;
            var rightGridHeight = _props2.rightGridHeight;
            var rightGridOffset = _props2.rightGridOffset;

            return rightGridHeight / 2 + dotsRadius + subheaderHeight + rightGridOffset;
        }

        /**
         *
         * @param ctx {CanvasRenderingContext2D}
         * @param offsetX int
         * @param offsetY int
         * @param gridHeight int
         * @param dotsNumber int
         */
    }, {
        key: 'drawGrid',
        value: function drawGrid(ctx, offsetX, offsetY, gridHeight, dotsNumber) {
            var dotsRadius = this.props.dotsRadius;

            ctx.strokeStyle = 'rgba(204, 204, 204, 0.6)';
            ctx.beginPath();
            for (var i = 0; i < dotsNumber; i++) {
                var centerX = offsetX;
                var centerY = offsetY + i * gridHeight;
                ctx.moveTo(centerX + dotsRadius, centerY);
                ctx.arc(centerX, centerY, dotsRadius, 0, Math.PI * 2, true);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
            }
            ctx.stroke();
        }

        /**
         *
         * @param ctx {CanvasRenderingContext2D}
         * @param leftDotIndex int
         * @param rightDotIndex int
         * @param color
         */
    }, {
        key: 'linkDots',
        value: function linkDots(ctx, leftDotIndex, rightDotIndex) {
            var color = arguments.length <= 3 || arguments[3] === undefined ? undefined : arguments[3];
            var _props3 = this.props;
            var leftGridX = _props3.leftGridX;
            var rightGridX = _props3.rightGridX;
            var dotsRadius = _props3.dotsRadius;
            var leftGridHeight = _props3.leftGridHeight;
            var rightGridHeight = _props3.rightGridHeight;

            var leftGridY = this.getLeftGridY();
            var rightGridY = this.getRightGridY();

            ctx.strokeStyle = color || '#9e9e9e';
            ctx.beginPath();
            var leftDotCenterX = leftGridX + dotsRadius;
            var leftDotCenterY = leftGridY + leftDotIndex * leftGridHeight;

            var rightDotCenterX = rightGridX - dotsRadius;
            var rightDotCenterY = rightGridY + rightDotIndex * rightGridHeight;
            ctx.moveTo(leftDotCenterX, leftDotCenterY);
            var cpointDiff = (rightDotCenterX - leftDotCenterX) * 3 / 5;
            ctx.bezierCurveTo(leftDotCenterX + cpointDiff, leftDotCenterY, rightDotCenterX - cpointDiff, rightDotCenterY, rightDotCenterX, rightDotCenterY);
            ctx.stroke();
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.buildCanvas(this.props);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            this.buildCanvas(nextProps);
        }
    }, {
        key: 'buildCanvas',
        value: function buildCanvas(props) {
            var canvas = this.canvas;
            if (!canvas.getContext) {
                return null;
            }

            var leftGridX = props.leftGridX;
            var rightGridX = props.rightGridX;
            var leftGridHeight = props.leftGridHeight;
            var rightGridHeight = props.rightGridHeight;

            var leftGridY = this.getLeftGridY();
            var rightGridY = this.getRightGridY();

            var leftNumber = props.leftNumber;
            var rightNumber = props.rightNumber;
            var links = props.links;

            var ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#757575';

            this.drawGrid(ctx, leftGridX, leftGridY, leftGridHeight, leftNumber);
            this.drawGrid(ctx, rightGridX, rightGridY, rightGridHeight, rightNumber);

            for (var i = 0; i < links.length; i++) {
                this.linkDots(ctx, links[i].left, links[i].right, links[i].color);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props4 = this.props;
            var dotsRadius = _props4.dotsRadius;
            var rightGridX = _props4.rightGridX;
            var leftGridHeight = _props4.leftGridHeight;
            var rightGridHeight = _props4.rightGridHeight;
            var subheaderHeight = _props4.subheaderHeight;
            var leftGridOffset = _props4.leftGridOffset;
            var rightGridOffset = _props4.rightGridOffset;
            var _props5 = this.props;
            var leftNumber = _props5.leftNumber;
            var rightNumber = _props5.rightNumber;
            var style = _props5.style;

            var width = rightGridX + dotsRadius + 2;
            var height = Math.max(leftNumber * leftGridHeight + leftGridOffset, rightNumber * rightGridHeight + rightGridOffset) + subheaderHeight;

            return _react2['default'].createElement('canvas', { style: _extends({}, style, { background: "transparent", width: width, height: height }), ref: function (canvas) {
                    return _this.canvas = canvas;
                }, height: height, width: width });
        }
    }]);

    return Connect;
})(_react2['default'].Component);

Connect.defaultProps = {
    dotsRadius: 4,
    subheaderHeight: 40,
    leftGridX: 10,
    leftGridHeight: 72,
    leftGridOffset: 0,
    rightGridX: 140,
    rightGridHeight: 72,
    rightGridOffset: 0
};

exports['default'] = Connect;
module.exports = exports['default'];
