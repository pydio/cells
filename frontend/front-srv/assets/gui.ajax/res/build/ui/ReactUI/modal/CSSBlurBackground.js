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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var CSSBlurBackground = (function (_Component) {
    _inherits(CSSBlurBackground, _Component);

    function CSSBlurBackground(props, context) {
        _classCallCheck(this, CSSBlurBackground);

        _Component.call(this, props, context);
        this.state = {};
    }

    CSSBlurBackground.prototype.componentDidMount = function componentDidMount() {
        this.activateResizeObserver();
    };

    CSSBlurBackground.prototype.componentWillUnmount = function componentWillUnmount() {
        this.deactivateResizeObserver();
    };

    CSSBlurBackground.prototype.activateResizeObserver = function activateResizeObserver() {
        var _this = this;

        if (this._resizeObserver) return;
        this._resizeObserver = function () {
            _this.computeBackgroundData();
        };
        DOMUtils.observeWindowResize(this._resizeObserver);
        this.computeBackgroundData();
    };

    CSSBlurBackground.prototype.deactivateResizeObserver = function deactivateResizeObserver() {
        if (this._resizeObserver) {
            DOMUtils.stopObservingWindowResize(this._resizeObserver);
            this._resizeObserver = null;
        }
    };

    CSSBlurBackground.prototype.computeBackgroundData = function computeBackgroundData() {

        var pydioMainElement = document.getElementById(window.pydio.Parameters.get('MAIN_ELEMENT'));
        var reference = pydioMainElement.querySelector('div[data-reactroot]');
        if (!reference) {
            return;
        }
        if (this.backgroundImageData) {
            this.computeRatio();
            return;
        }

        var url = window.getComputedStyle(reference).getPropertyValue('background-image');
        var backgroundImage = new Image();
        backgroundImage.src = url.replace(/"/g, "").replace(/url\(|\)$/ig, "");

        var oThis = this;
        backgroundImage.onload = function () {
            var width = this.width;
            var height = this.height;

            oThis.backgroundImageData = {
                url: url,
                width: width,
                height: height
            };

            oThis.computeRatio();
        };
    };

    CSSBlurBackground.prototype.computeRatio = function computeRatio() {
        var _backgroundImageData = this.backgroundImageData;
        var width = _backgroundImageData.width;
        var height = _backgroundImageData.height;
        var url = _backgroundImageData.url;

        var screenWidth = DOMUtils.getViewportWidth();
        var screenHeight = DOMUtils.getViewportHeight();

        var imageRatio = width / height;
        var coverRatio = screenWidth / screenHeight;

        var coverHeight = undefined,
            scale = undefined,
            coverWidth = undefined;
        if (imageRatio >= coverRatio) {
            coverHeight = screenHeight;
            scale = coverHeight / height;
            coverWidth = width * scale;
        } else {
            coverWidth = screenWidth;
            scale = coverWidth / width;
            coverHeight = height * scale;
        }
        var cover = coverWidth + 'px ' + coverHeight + 'px';
        this.setState({
            backgroundImage: url,
            backgroundSize: cover
        });
    };

    CSSBlurBackground.prototype.render = function render() {
        var _state = this.state;
        var backgroundImage = _state.backgroundImage;
        var backgroundSize = _state.backgroundSize;

        if (!backgroundImage) return null;
        return React.createElement('style', { dangerouslySetInnerHTML: {
                __html: ['.react-mui-context div[data-reactroot].dialogRootBlur > div > div.dialogRootBlur:before {', '  background-image: ' + backgroundImage + ';', '  background-size: ' + backgroundSize + ';', '}'].join('\n')
            } });
    };

    return CSSBlurBackground;
})(Component);

exports['default'] = CSSBlurBackground;
module.exports = exports['default'];
