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

const PropTypes = require('prop-types');
import TeamCard from './TeamCard'
const React = require('react')
import UserCard from './UserCard'
const {Paper, IconButton} = require('material-ui')

/**
 * Container for UserCard or TeamCard
 */
class RightPanelCard extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = {edit: false};
        const {model} = this.props;
        model.observe('update', ()=>this.forceUpdate())
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.item !== this.props.item){
            this.setState({edit: false});
        }
    }

    render(){

        let content;
        const {model, style, zDepth=2} = this.props;
        const {edit} = this.state;
        const setEdit=(ed)=>this.setState({edit: ed})

        const item = model.rightItem()
        const onRequestClose = () => {model.clearRightItem()}
        const onDeleteAction= (p, sel, skip) => model.deleteItems(p, sel, skip)
        const onCreateAction= (i) => {model.setCreateItem(i)}
        const onUpdateAction= (item) => {
            const {model} = this.props;
            if(item._parent && item._parent === model.contextItem()){
                model.reloadContext()
            }
        }

        const cardProps = {
            ...this.props,
            item,
            onRequestClose,
            onDeleteAction,
            onCreateAction,
            onUpdateAction,
            edit,
            setEdit
        }

        if(item && item.type === 'user'){
            content = <UserCard {...cardProps}/>
        }else if(item && item.IdmRole && item.IdmRole.IsTeam){
            content = <TeamCard {...cardProps}/>
        }

        return (
            <Paper zDepth={zDepth} style={{position:'relative', borderRadius: 6, ...style}}>
                <IconButton iconClassName={"mdi mdi-close"} style={{position:'absolute', top: 12, right: 12, zIndex: 2}} iconStyle={{color: '#e0e0e0'}} onClick={onRequestClose}/>
                {content}
            </Paper>
        );
    }

}

RightPanelCard.propTypes = {
    /**
     * Pydio instance
     */
    pydio: PropTypes.instanceOf(Pydio),
    /**
     * Selected item
     */
    item: PropTypes.object,
    /**
     * Applies to root container
     */
    style: PropTypes.object,
    /**
     * Forwarded to child
     */
    onRequestClose: PropTypes.func,
    /**
     * Forwarded to child
     */
    onDeleteAction: PropTypes.func,
    /**
     * Forwarded to child
     */
    onUpdateAction: PropTypes.func
};

export {RightPanelCard as default}