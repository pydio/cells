import React from "react"
import CompositeModel from './CompositeModel'
import SharedUsers from '../cells/SharedUsers'
import PropTypes from 'prop-types';
import Pydio from 'pydio'
import {muiThemeable} from 'material-ui/styles'
import {Divider, FlatButton, Popover, Menu, MenuItem, FontIcon, Subheader} from 'material-ui'
import ActionButton from "../main/ActionButton";
import {PaneToggler} from "../links/Panel"

class NewCellsList extends React.Component {

    constructor(props){
        super(props);
        const {compositeModel} = props;
        let edit= null
        if(compositeModel.getCells().length === 0){
            edit = 'NEWCELL';
        }
        this.state = {
            edit
        };
    }

    addToCellsMenuItems(m){
        let addItems = [];
        // List user available cells - Exclude cells where this node is already shared
        const {pydio, compositeModel} = this.props;
        const currentCells = compositeModel.getCells().map(cellModel => cellModel.getUuid());
        let newone, existing;
        if(currentCells.filter(c => !c).length === 0){
            addItems.push(<MenuItem primaryText={m('cell.add.new')} onClick={() => {this.setState({addMenuOpen:false}); compositeModel.createEmptyCell()}} leftIcon={<FontIcon className={"icomoon-cells-full-plus"}/>}/>)
            newone = true
        }
        pydio.user.getRepositoriesList().forEach(repository => {
            if (repository.getOwner() === 'shared' && currentCells.indexOf(repository.getId()) === -1){
                const touchTap = () => {
                    this.setState({addMenuOpen:false});
                    compositeModel.addToExistingCell(repository.getId());
                };
                addItems.push(<MenuItem primaryText={repository.getLabel()} onClick={touchTap} leftIcon={<FontIcon className={"icomoon-cells"}/>}/>);
                existing = true;
            }
        });
        let addLabel;
        if(existing && newone){
            addLabel = m('cell.add.existing-or-new')
        } else if(existing){
            addLabel = m('cell.add.existing')
        } else if(newone){
            addLabel = m('cell.add.new')
        }
        return {addItems, addLabel};
    }

    removeCurrentNodeFromCell(cellModel){
        const {compositeModel} = this.props;
        if(compositeModel.getCells().filter(c => c !== cellModel).length === 0) {
            // There will be no more cell after that remove. Create an empty one.
            compositeModel.createEmptyCell();
        }
        cellModel.removeRootNode(compositeModel.getNode().getMetadata().get('uuid'))
    }

    render(){

        const {compositeModel, pydio, usersInvitations, muiTheme} = this.props;
        const {edit} = this.state;
        const m = (id) => pydio.MessageHash['share_center.' + id];

        // Share is not allowed - Directly return
        if(compositeModel.getNode() && !compositeModel.canCreateCells()){
            return (
                <div style={{fontSize: 13, fontWeight: 500, color: 'rgba(0, 0, 0, 0.43)', padding: 8}}>
                    {m(compositeModel.getNode().isLeaf()?'227':'228')}
                </div>
            );
        }

        const multiple = compositeModel.getCells().length > 1
        let cells = [];
        compositeModel.getCells().map(cellModel => {
            const cellUsers = (
                <div style={{margin: '0 -10px'}}>
                    <SharedUsers
                        pydio={pydio}
                        cellAcls={cellModel.getAcls()}
                        excludes={[pydio.user.id]}
                        onUserObjectAdd={cellModel.addUser.bind(cellModel)}
                        onUserObjectRemove={cellModel.removeUser.bind(cellModel)}
                        onUserObjectUpdateRight={cellModel.updateUserRight.bind(cellModel)}
                        sendInvitations={(targetUsers) => usersInvitations(targetUsers, cellModel)}
                        saveSelectionAsTeam={false}
                        withActionLinks={(links) => {
                            if (!cellModel.isEditable()) {
                                return links;
                            }
                            return [...links, <ActionButton mdiIcon={"delete-forever"} destructive={true} messageId={m('cells.remove.node')} callback={() => {this.removeCurrentNodeFromCell(cellModel)}}/>]
                        }}
                        readonly={!cellModel.isEditable()}
                        completerStyle={{margin: '-6px 8px 16px'}}
                    />
                </div>
            );

            if (multiple){
                cells.push(<PaneToggler title={cellModel.getLabel()} legend={cellModel.getAclsSubjects()}>{cellUsers}</PaneToggler>)
            } else {
                cells.push(<div style={{padding: 16}}>{cellUsers}</div>)
            }
            cells.push(<Divider/>);
        });
        cells.pop();

        const {addItems, addLabel} = this.addToCellsMenuItems(m);
        let addToCellMenu;
        if(addItems.length){
            const {muiTheme} = this.props;
            addToCellMenu = <span id={"share-dialog-addtocell-menu"}>
                <FlatButton
                    iconClassName={"icomoon-cells-full-plus"}
                    style={{width: '100%'}}
                    iconStyle={{color: muiTheme.palette.accent2Color}}
                    primary={true}
                    tooltip={m(263)}
                    label={addLabel}
                    tooltipPosition={"bottom-left"}
                    onClick={(event)=>{this.setState({
                        addMenuOpen:true,
                        addMenuAnchor:event.currentTarget
                    })}}
                />
                <Popover
                    open={this.state.addMenuOpen}
                    anchorEl={this.state.addMenuAnchor}
                    onRequestClose={()=>{this.setState({addMenuOpen: false})}}
                    anchorOrigin={{horizontal:'left', vertical:'top'}}
                    targetOrigin={{horizontal:'left', vertical:'bottom'}}
                >
                    <Menu desktop={true} listStyle={{paddingTop: 0}} width={250}>
                        <Subheader>{addLabel}</Subheader>
                        {addItems}
                    </Menu>
                </Popover>
            </span>
        }

        return (
            <div style={{...this.props.style, minHeight: 300}}>
                {cells}
                {addToCellMenu && <div style={{position:'absolute', bottom: 10, left: 10}}>{addToCellMenu}</div>}
            </div>
        );
    }

}

NewCellsList.PropTypes = {
    pydio: PropTypes.instanceOf(Pydio),
    compositeModel: PropTypes.instanceOf(CompositeModel).isRequired,
    usersInvitations: PropTypes.func,
};

NewCellsList = muiThemeable()(NewCellsList);

export {NewCellsList as default}