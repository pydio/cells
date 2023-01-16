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

const React = require('react')
const Pydio = require('pydio')
import PydioApi from 'pydio/http/api'
import ResourcesManager from 'pydio/http/resources-manager'
import deepEqual from 'deep-equal'
const {Responsive, WidthProvider} = require('react-grid-layout');
const {PydioContextConsumer} = Pydio.requireLib('boot');

import Store from './Store'
import GridBuilder from './GridBuilder'

/**
 * Automatic layout for presenting draggable cards to users. Used for user and admin dashboard.
 */
class CardsGrid extends React.Component {

    constructor(props, context) {
        super(props, context);
        this._storeObserver = function(e){
            this._forceUpdate = true;
            this.setState({
                cards: props.store.getCards()
            }, ()=>{this._forceUpdate = false});
        }.bind(this);
        props.store.observe("cards", this._storeObserver);
        this.state = {cards: props.store.getCards()};

        // Throttle and monitor subsequent requests
        this.requests = [];
        this.throttle = PydioApi.getThrottler({concurrent: 6})
        const aborterPlugin = (request) => {
            this.requests.push(request);
            return request;
        };

        this.restClient = PydioApi.getRestClient({
            silent: true,
            plugins:[
                this.throttle.plugin(),
                aborterPlugin
            ],
        });
    }

    /**
     * Save layouts in the users preference.
     *
     * @param {object} allLayouts Responsive layouts passed for saving
     */
    saveFullLayouts(allLayouts) {
        const saveLayout = {}
        Object.keys(allLayouts).forEach(k => {
            saveLayout[k] = allLayouts[k].map(o => {return {i:o.i, h:o.h, w:o.w, x:o.x, y:o.y}})
        })
        const savedPref = this.props.store.getUserPreference('Layout');
        if(!deepEqual(savedPref, saveLayout)){
            this.props.store.saveUserPreference('Layout', saveLayout);
        }
    }

    onLayoutChange(currentLayout, allLayouts){
        if(this._blockLayoutSave) {
            return;
        }
        this.saveFullLayouts(allLayouts);
    }

    componentWillUnmount() {
        this.props.store.stopObserving("cards", this._storeObserver);
        this.throttle.options({active: false});
        this.requests.filter(r => r.xhr).map(r => r.xhr.abort());
    }

    componentWillReceiveProps(nextProps) {
        if(this.props && nextProps.editMode !== this.props.editMode){
            Object.keys(this.refs).forEach(function(k){
                this.refs[k].toggleEditMode(nextProps.editMode);
            }.bind(this));
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this._forceUpdate || false;
    }

    removeCard(itemKey){
        this.props.removeCard(itemKey);
    }

    buildCards(cards){

        let index = 0;
        let layouts = {lg:[], md:[], sm:[], xs:[], xxs:[]};
        let items = [];
        let additionalNamespaces = [];
        const rand = Math.random();
        const savedLayouts = this.props.store.getUserPreference('Layout');
        const buildLayout = function(classObject, itemKey, item, x, y){
            let layout = classObject.getGridLayout(x, y);
            layout['handle'] = 'h4';
            if(item['gridHandle']){
                layout['handle'] = item['gridHandle'];
            }
            layout['i'] = itemKey;
            return layout;
        };
        cards.map((item) => {

            var parts = item.componentClass.split(".");
            var classNS = parts[0];
            var className = parts[1];
            var classObject;
            if(global[classNS] && global[classNS][className]){
                classObject = global[classNS][className];
            }else{
                if(!global[classNS]) {
                    additionalNamespaces.push(classNS);
                }
                return;
            }
            var props = {...item.props};
            var itemKey = props['key'] = item['id'] || 'item_' + index;
            props.ref=itemKey;
            props.restClient=this.restClient;
            props.pydio=this.props.pydio;
            props.onCloseAction = ()=> {
                this.removeCard(itemKey);
            };
            props.preferencesProvider = this.props.store;
            var defaultX = 0, defaultY = 0;
            if(item.defaultPosition){
                defaultX = item.defaultPosition.x;
                defaultY = item.defaultPosition.y;
            }
            const defaultLayout = buildLayout(classObject, itemKey, item, defaultX, defaultY);

            for(let breakpoint in layouts){
                if(!layouts.hasOwnProperty(breakpoint)){
                    continue;
                }
                var breakLayout = layouts[breakpoint];
                // Find corresponding element in preference
                var existing;
                if(savedLayouts && savedLayouts[breakpoint]){
                    savedLayouts[breakpoint].map(function(gridData){
                        if(gridData['i'] === itemKey && gridData['h'] === defaultLayout['h']){
                            existing = gridData;
                        }
                    });
                }
                if(existing) {
                    breakLayout.push(existing);
                }else if(item.defaultLayouts && item.defaultLayouts[breakpoint]){
                    let crtLayout = buildLayout(classObject, itemKey, item, item.defaultLayouts[breakpoint].x, item.defaultLayouts[breakpoint].y);
                    breakLayout.push(crtLayout);
                }else{
                    breakLayout.push(defaultLayout);
                }
            }
            index++;
            items.push(React.createElement(classObject, props));

        });

        if(additionalNamespaces.length){
            this._blockLayoutSave = true;
            ResourcesManager.loadClassesAndApply(additionalNamespaces, function(){
                this.setState({additionalNamespacesLoaded:additionalNamespaces}, function(){
                    this._blockLayoutSave = false;
                }.bind(this));
            }.bind(this));
        }
        return {cards: items, layouts: layouts};
    };

    render() {
        const {cards, layouts} = this.buildCards(this.state.cards);
        const ResponsiveGridLayout = WidthProvider(Responsive);
        return (
            <ResponsiveGridLayout
                className="dashboard-layout"
                cols={this.props.cols || {lg: 10, md: 8, sm: 8, xs: 4, xxs: 2}}
                layouts={layouts}
                rowHeight={5}
                onLayoutChange={this.onLayoutChange.bind(this)}
                isDraggable={!this.props.disableDrag}
                style={this.props.style}
                autoSize={false}
            >
                {cards}
            </ResponsiveGridLayout>
        );
    }
}

class DynamicGrid extends React.Component {

    constructor(props) {
        super(props);
        const store = new Store(props.storeNamespace, props.defaultCards, props.pydio);

        this.state = {
            editMode: false,
            store   : store
        };
    }

    removeCard(cardId){

        this.state.store.removeCard(cardId);
    }

    addCard(cardDefinition){

        this.state.store.addCard(cardDefinition);
    }

    resetCardsAndLayout(){
        this.state.store.saveUserPreference('Layout', null);
        this.state.store.setCards(this.props.defaultCards);
    }

    toggleEditMode(){
        this.setState({editMode:!this.state.editMode});
    }

    render() {

        const monitorWidgetEditing = function(status){
            this.setState({widgetEditing:status});
        }.bind(this);

        let builder;
        if(this.props.builderNamespaces && this.state.editMode){
            builder = (
                <GridBuilder
                    className="admin-helper-panel"
                    namespaces={this.props.builderNamespaces}
                    onCreateCard={this.addCard.bind(this)}
                    onResetLayout={this.resetCardsAndLayout.bind(this)}
                    onEditStatusChange={monitorWidgetEditing}
                    getMessage={(id,ns='ajxp_admin') => {return this.props.getMessage(id, ns)}}
                />);
        }

        const rglStyle  = this.props.rglStyle || {};
        return (
            <div style={{...this.props.style, width:'100%', flex:'1'}} className={this.state.editMode?"builder-open":""}>
                {!this.props.disableEdit &&
                    <div style={{position:'absolute',bottom:30,right:18, zIndex:11}}>
                        <MaterialUI.FloatingActionButton
                            tooltip={this.props.getMessage('home.49')}
                            onClick={this.toggleEditMode.bind(this)}
                            iconClassName={this.state.editMode?"icon-ok":"mdi mdi-pencil"}
                            mini={this.state.editMode}
                            disabled={this.state.editMode && this.state.widgetEditing}
                        />
                    </div>
                }
                {builder}
                <div className="home-dashboard" style={{height:'100%'}}>
                    <CardsGrid
                        disableDrag={this.props.disableDrag}
                        cols={this.props.cols}
                        store={this.state.store}
                        style={rglStyle}
                        pydio={this.props.pydio}
                        editMode={this.state.editMode}
                        removeCard={this.removeCard.bind(this)}
                    />
                </div>
            </div>
        );
    }
}

DynamicGrid = PydioContextConsumer(DynamicGrid);
export {DynamicGrid as default}