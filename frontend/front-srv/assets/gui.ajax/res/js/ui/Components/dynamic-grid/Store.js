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

class Store extends Observable{

    /**
     * Init a card store
     * @param prefNamespace Namespace for getting/setting user preferences
     * @param defaultCards Array of cards to be displayed by default
     */
    constructor(prefNamespace, defaultCards, pydioObject){
        super();
        this._namespace = prefNamespace;
        this._pydio = pydioObject;
        this._cards = this.getUserPreference("Cards");
        if(!this._cards){
            this._cards = defaultCards;
        }
    }

    getUserPreference(prefName){
        return this._pydio.user.getLayoutPreference(this._namespace + prefName, null)
    }

    saveUserPreference(prefName, prefValue){
        this._pydio.user.setLayoutPreference(this._namespace + prefName, prefValue)
    }

    saveCards(cards){
        this.saveUserPreference('Cards', cards);
    }

    resetCards(){
        this.saveUserPreference('Cards', null);
    }

    setCards(newCards){
        this._cards = newCards;
        this.notify("cards", this._cards);
        this.saveCards(newCards);
    }

    getCards(){
        return this._cards;
    }

    removeCard(cardId){
        var index = -1;
        var currentCards = this.getCards();
        currentCards.map(function(card, arrayIndex){
            if(card.id == cardId) index = arrayIndex;
        });
        if(index == -1){
            console.warn('Card ID not found, this is strange.', cardId);
            return;
        }
        var newCards;
        if(index == 0) newCards = currentCards.slice(1);
        else if(index == currentCards.length-1) newCards = currentCards.slice(0, -1);
        else newCards = currentCards.slice(0,index).concat(currentCards.slice(index+1));
        this.setCards(newCards);
    }

    createCardId(cardDefinition, randomize=false){
        var id = LangUtils.computeStringSlug(cardDefinition['title']);
        if(randomize){
            id += '-' + Math.round(Math.random() * 100 + 10);
        }
        var alreadyExists = false;
        this._cards.map(function(card){
            if(card.id == id) alreadyExists = true;
        }.bind(this));
        if(alreadyExists){
            id = this.createCardId(cardDefinition, true);
        }
        return id;
    }

    addCard(cardDefinition){
        //console.log(cardDefinition);

        cardDefinition['id'] = this.createCardId(cardDefinition);
        this.setCards(this._cards.concat([cardDefinition]));
    }

}

export {Store as default}