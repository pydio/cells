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

var Store = (function (_Observable) {
    _inherits(Store, _Observable);

    /**
     * Init a card store
     * @param prefNamespace Namespace for getting/setting user preferences
     * @param defaultCards Array of cards to be displayed by default
     */

    function Store(prefNamespace, defaultCards, pydioObject) {
        _classCallCheck(this, Store);

        _Observable.call(this);
        this._namespace = prefNamespace;
        this._pydio = pydioObject;
        this._cards = this.getUserPreference("Cards");
        if (!this._cards) {
            this._cards = defaultCards;
        }
    }

    Store.prototype.getUserPreference = function getUserPreference(prefName) {
        var prefKey = this._namespace + prefName;
        var guiPrefs = this._pydio.user.getPreference('gui_preferences', true);
        if (guiPrefs && guiPrefs[prefKey]) {
            return guiPrefs[prefKey];
        } else {
            return null;
        }
    };

    Store.prototype.saveUserPreference = function saveUserPreference(prefName, prefValue) {
        var prefKey = this._namespace + prefName;
        var guiPrefs = this._pydio.user.getPreference('gui_preferences', true);
        if (!guiPrefs) guiPrefs = {};
        guiPrefs[prefKey] = prefValue;
        this._pydio.user.setPreference('gui_preferences', guiPrefs, true);
        this._pydio.user.savePreference('gui_preferences');
    };

    Store.prototype.saveCards = function saveCards(cards) {
        this.saveUserPreference('Cards', cards);
    };

    Store.prototype.resetCards = function resetCards() {
        this.saveUserPreference('Cards', null);
    };

    Store.prototype.setCards = function setCards(newCards) {
        this._cards = newCards;
        this.notify("cards", this._cards);
        this.saveCards(newCards);
    };

    Store.prototype.getCards = function getCards() {
        return this._cards;
    };

    Store.prototype.removeCard = function removeCard(cardId) {
        var index = -1;
        var currentCards = this.getCards();
        currentCards.map(function (card, arrayIndex) {
            if (card.id == cardId) index = arrayIndex;
        });
        if (index == -1) {
            console.warn('Card ID not found, this is strange.', cardId);
            return;
        }
        var newCards;
        if (index == 0) newCards = currentCards.slice(1);else if (index == currentCards.length - 1) newCards = currentCards.slice(0, -1);else newCards = currentCards.slice(0, index).concat(currentCards.slice(index + 1));
        this.setCards(newCards);
    };

    Store.prototype.createCardId = function createCardId(cardDefinition) {
        var randomize = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        var id = LangUtils.computeStringSlug(cardDefinition['title']);
        if (randomize) {
            id += '-' + Math.round(Math.random() * 100 + 10);
        }
        var alreadyExists = false;
        this._cards.map((function (card) {
            if (card.id == id) alreadyExists = true;
        }).bind(this));
        if (alreadyExists) {
            id = this.createCardId(cardDefinition, true);
        }
        return id;
    };

    Store.prototype.addCard = function addCard(cardDefinition) {
        //console.log(cardDefinition);

        cardDefinition['id'] = this.createCardId(cardDefinition);
        this.setCards(this._cards.concat([cardDefinition]));
    };

    return Store;
})(Observable);

exports['default'] = Store;
module.exports = exports['default'];
