import React from "react"
import CompositeModel from './CompositeModel'
import SharedUsers from '../cells/SharedUsers'
import PropTypes from 'prop-types';
import Pydio from 'pydio'
import {muiThemeable} from 'material-ui/styles'
import {Paper, Divider, Toggle, IconButton, FlatButton, Popover, Menu, List, ListItem, IconMenu, MenuItem, FontIcon, Subheader} from 'material-ui'

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

    addToCellsMenuItems(){
        let addItems = [];
        // List user available cells - Exclude cells where this node is already shared
        const {pydio, compositeModel} = this.props;
        const currentCells = compositeModel.getCells().map(cellModel => cellModel.getUuid());
        let newone, existing;
        if(currentCells.filter(c => !c).length === 0){
            addItems.push(<MenuItem primaryText={"Create new Cell"} onClick={() => {this.setState({addMenuOpen:false}); compositeModel.createEmptyCell()}} leftIcon={<FontIcon className={"icomoon-cells-full-plus"}/>}/>)
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
            addLabel = "Add to existing or new Cell"
        } else if(existing){
            addLabel = "Add to existing Cell"
        } else if(newone){
            addLabel = "Create a new Cell"
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
        let uniqueCell;
        let cells = [];
        compositeModel.getCells().map(cellModel => {
            const label = cellModel.getLabel();
            const isEdit = (!cellModel.getUuid() && edit==='NEWCELL') || edit === cellModel.getUuid() || !multiple;
            const toggleState = () => {
                if(isEdit && edit === 'NEWCELL'){
                    // Remove new cell if it was created empty
                    const acls = cellModel.getAcls();
                    if(!Object.keys(acls).length){
                        compositeModel.removeNewCell(cellModel);
                    }
                }
                this.setState({edit:isEdit?null:cellModel.getUuid()});
            };

            const removeNode = () => {
                cellModel.removeRootNode(compositeModel.getNode().getMetadata().get('uuid'));
            };
            let rightIcon;
            if(isEdit){
                rightIcon = <IconButton iconClassName={"mdi mdi-close"} tooltip={pydio.MessageHash['86']} onClick={toggleState}/>;
            } else if (cellModel.isEditable()) {
                rightIcon = (
                    <IconMenu
                        iconButtonElement={<IconButton iconClassName={"mdi mdi-dots-vertical"}/>}
                        anchorOrigin={{horizontal:'right', vertical:'top'}}
                        targetOrigin={{horizontal:'right', vertical:'top'}}
                    >
                        <MenuItem primaryText={m(258)} onClick={toggleState}/>
                        <MenuItem primaryText={m(259)} onClick={removeNode}/>
                    </IconMenu>
                );
            }
            if(multiple){
                cells.push(
                    <ListItem
                        primaryText={label}
                        secondaryText={cellModel.getAclsSubjects()}
                        rightIconButton={rightIcon}
                        onClick={toggleState}
                        disabled={edit === 'NEWCELL' && !isEdit}
                    />
                );
            } else if (cellModel.getUuid()) {
                uniqueCell = cellModel;
            }
            if(isEdit){
                cells.push(
                    <Paper zDepth={0} style={{padding: 0, margin: 10}}>
                        <SharedUsers
                            pydio={pydio}
                            cellAcls={cellModel.getAcls()}
                            excludes={[pydio.user.id]}
                            onUserObjectAdd={cellModel.addUser.bind(cellModel)}
                            onUserObjectRemove={cellModel.removeUser.bind(cellModel)}
                            onUserObjectUpdateRight={cellModel.updateUserRight.bind(cellModel)}
                            sendInvitations={(targetUsers) => usersInvitations(targetUsers, cellModel)}
                            saveSelectionAsTeam={false}
                            readonly={!cellModel.isEditable()}
                            completerStyle={{margin: '-6px 8px 16px'}}
                        />
                    </Paper>
                );
            }
            cells.push(<Divider/>);
        });
        cells.pop();

        let deleteUniqueCellButton;
        let legend;
        if(multiple){
            legend = "Shared in multiple cells"
        } else if(uniqueCell) {
            legend = <span>Shared in <span style={{fontWeight: 500, color:muiTheme.palette.accent2Color}}>{uniqueCell.getLabel()}</span></span>
            deleteUniqueCellButton = (
                <Toggle
                    toggled={true}
                    iconClassName={"icomoon-cells-full-minus"}
                    iconStyle={{color: muiTheme.palette.accent2Color}}
                    tooltip={"Remove from this cell"}
                    tooltipPosition={"bottom-left"}
                    onToggle={() => {this.removeCurrentNodeFromCell(uniqueCell)}}
                />)
        } else {
            legend = "Share with specific users or groups"
        }

        const {addItems, addLabel} = this.addToCellsMenuItems();
        let addToCellMenu;
        if(addItems.length){
            const {muiTheme} = this.props;
            addToCellMenu = <span>
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
                    anchorOrigin={{horizontal:'middle', vertical:'bottom'}}
                    targetOrigin={{horizontal:'middle', vertical:'top'}}
                >
                    <Menu desktop={true} listStyle={{paddingTop: 0}}>
                        <Subheader>Add to new or existing Cell</Subheader>
                        {addItems}
                    </Menu>
                </Popover>
            </span>
        }

        return (
            <div style={this.props.style}>
                <div style={{display:'none', alignItems:'center', backgroundColor: 'rgb(246, 246, 248)', borderBottom: '0px solid rgb(224, 224, 224)', fontSize: 15}}>
                    <div style={{flex: 1, padding: 15, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{legend}</div>
                    {deleteUniqueCellButton && <div>{deleteUniqueCellButton}</div>}
                    <div style={{width: 10}}/>
                </div>
                <List style={{minHeight: 300}}>{cells}</List>
                {addToCellMenu && <div style={{borderTop:'1px solid #e0e0e0', padding:'20px 16px'}}>{addToCellMenu}</div>}
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