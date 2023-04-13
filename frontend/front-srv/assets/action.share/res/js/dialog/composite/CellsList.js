import React from "react"
import ReactDOM from 'react-dom'
import CompositeModel from './CompositeModel'
import ShareHelper from '../main/ShareHelper'
import SharedUsers from '../cells/SharedUsers'
import PropTypes from 'prop-types';
import Pydio from 'pydio'
import {muiThemeable} from 'material-ui/styles'
import {Paper, Divider, RaisedButton, IconButton, Menu, List, ListItem, IconMenu, MenuItem, FontIcon} from 'material-ui'
const {ThemedContainers:{Popover}} = Pydio.requireLib('hoc');

class CellsList extends React.Component {

    constructor(props){
        super(props);
        this.state = {edit: null};
    }

    addToCellsMenuItems(){
        let items = [];
        // List user available cells - Exclude cells where this node is already shared
        const {pydio, compositeModel} = this.props;
        const currentCells = compositeModel.getCells().map(cellModel => cellModel.getUuid());
        pydio.user.getRepositoriesList().forEach(repository => {
            if (repository.getOwner() === 'shared' && currentCells.indexOf(repository.getId()) === -1){
                const touchTap = () => {
                    this.setState({addMenuOpen:false});
                    compositeModel.addToExistingCell(repository.getId());
                };
                items.push(<MenuItem primaryText={repository.getLabel()} onClick={touchTap} leftIcon={<FontIcon className={"icomoon-cells"}/>}/>);
            }
        });
        return items;
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const {edit} = this.state;
        const {compositeModel} = nextProps;
        if(edit === 'NEWCELL' && !compositeModel.isDirty()){
            this.setState({edit: null});
            compositeModel.getCells().map(cellModel => {
                const acls = cellModel.getAcls();
                if(!Object.keys(acls).length){
                    compositeModel.removeNewCell(cellModel);
                }
            });
        }
    }

    render(){

        const {compositeModel, pydio, usersInvitations, muiTheme} = this.props;
        const m = (id) => pydio.MessageHash['share_center.' + id];
        const {edit} = this.state;
        let cells = [];
        compositeModel.getCells().map(cellModel => {
            const label = cellModel.getLabel();
            const isEdit = (!cellModel.getUuid() && edit==='NEWCELL') || edit === cellModel.getUuid();
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
            cells.push(
                <ListItem
                    primaryText={label}
                    secondaryText={cellModel.getAclsSubjects()}
                    rightIconButton={rightIcon}
                    onClick={toggleState}
                    style={isEdit?{backgroundColor:'rgb(245, 245, 245)'}:{}}
                    disabled={edit === 'NEWCELL' && !isEdit}
                />
            );
            if(isEdit){
                cells.push(
                    <Paper zDepth={0} style={{backgroundColor:'rgb(245, 245, 245)', margin: '0 0 16px', padding: '0 10px 10px'}}>
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
                        />
                    </Paper>
                );
            }
            cells.push(<Divider/>);
        });
        cells.pop();

        let legend;
        if(cells.length && edit !== 'NEWCELL') {
            legend = <div>{m(260)}</div>
        } else if (cells.length && edit==='NEWCELL') {
            legend = <div>{m(261)}</div>
        } else {
            legend = (
                <div style={{padding:'21px 16px 21px 0px', cursor: 'pointer', display: 'flex', alignItems:'center'}} onClick={() =>{compositeModel.createEmptyCell();this.setState({edit:'NEWCELL'})}}>
                    <IconButton iconClassName={"icomoon-cells-clear-plus"} iconStyle={{color: muiTheme.palette.primary1Color}}/>
                    <span style={{flex: 1, marginLeft: 8}}>{m(262)}</span>
                </div>
            );
        }

        const addCellItems = this.addToCellsMenuItems();
        let addToCellMenu;
        if(addCellItems.length){
            addToCellMenu = <span>
                <RaisedButton
                    ref={"addCellButton"}
                    style={{marginLeft: 10}}
                    primary={true}
                    label={m(263)}
                    onClick={(event)=>{this.setState({addMenuOpen:true, addMenuAnchor:ReactDOM.findDOMNode(this.refs['addCellButton'])})}}
                />
                <Popover
                    open={this.state.addMenuOpen}
                    anchorEl={this.state.addMenuAnchor}
                    onRequestClose={()=>{this.setState({addMenuOpen: false})}}
                    anchorOrigin={{horizontal:'left', vertical:'bottom'}}
                    targetOrigin={{horizontal:'left', vertical:'top'}}
                >
                    <Menu>{addCellItems}</Menu>
                </Popover>
            </span>
        }

        const legendStyle ={
            fontSize:13,
            fontWeight:500,
            color:muiTheme.palette.mui3['on-surface-variant']
        }


        const auth = ShareHelper.getAuthorizations();
        if(compositeModel.getNode()){
            const nodeLeaf = compositeModel.getNode().isLeaf();
            const canShare = (nodeLeaf && auth.file_workspaces) || (!nodeLeaf && auth.folder_workspaces);
            if(!canShare){
                return (
                    <div style={{...legendStyle, padding: 8}}>
                        {m(nodeLeaf?'227':'228')}
                    </div>
                );
            }
        }

        return (
            <div style={this.props.style}>
                <div style={{paddingBottom: 20}}>
                    <RaisedButton label={m(264)} disabled={edit==='NEWCELL'} primary={true} onClick={()=>{compositeModel.createEmptyCell();this.setState({edit:'NEWCELL'})}}/>
                    {addToCellMenu}
                </div>
                <div style={legendStyle}>{legend}</div>
                <List>{cells}</List>
            </div>
        );
    }

}

CellsList.PropTypes = {
    pydio: PropTypes.instanceOf(Pydio),
    compositeModel: PropTypes.instanceOf(CompositeModel).isRequired,
    usersInvitations: PropTypes.func,
};

CellsList = muiThemeable()(CellsList);

export {CellsList as default}