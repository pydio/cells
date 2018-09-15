import React from 'react'
import Pydio from 'pydio'
const {AddressBook, UserAvatar, CellActionsRenderer} = Pydio.requireLib('components');
import {List, ListItem, Subheader, Divider, IconMenu, IconButton} from 'material-ui'
import IdmObjectHelper from 'pydio/model/idm-object-helper';
import DOMUtils from 'pydio/util/dom'

class AddressBookPanel extends React.Component{

    constructor(props){
        super(props);
        this.state = {noCell: false, cellModel: null};
        this._observer = () => {this.forceUpdate()};
    }

    componentDidMount(){
        this.loadCell();
    }

    componentWillUnmount(){
        if(this.state.cellModel) {
            this.state.cellModel.stopObserving('update', this._observer);
        }
    }

    loadCell(){
        const {pydio} = this.props;
        pydio.user.getActiveRepositoryAsCell().then(cell => {
            if(cell) {
                cell.observe('update', this._observer);
                this.setState({cellModel: cell, noCell: false, cellId: pydio.user.activeRepository});
            } else {
                this.setState({noCell: true, cellId: pydio.user.activeRepository});
            }
        });
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.pydio.user.activeRepository !== this.state.cellId){
            if(this.state.cellModel) {
                this.state.cellModel.stopObserving('update', this._observer);
            }
            this.loadCell();
        }
    }

    renderListItem(acl){
        const {pydio} = this.props;
        const {cellModel} = this.state;
        const label = IdmObjectHelper.extractLabel(pydio, acl);
        let userAvatar, avatarIcon, userType, userId;
        if(acl.User && acl.User.Attributes && acl.User.Attributes['avatar']){
            userAvatar = acl.User.Attributes['avatar'];
        }
        if(acl.User){
            userType = 'user';
            userId = acl.User.Login;
        } else if(acl.Group){
            userType = 'group';
            userId = acl.Group.Uuid;
        } else {
            userId = acl.Role.Uuid;
            userType = 'team';
        }


        const avatar = (
            <UserAvatar
                avatarSize={36}
                pydio={pydio}
                userType={userType}
                userId={userId}
                userLabel={label}
                avatar={userAvatar}
                avatarOnly={true}
                useDefaultAvatar={true}
        />);

        let rightMenu;
        const menuItems = new CellActionsRenderer(pydio, cellModel, acl).renderItems();
        if(menuItems.length){
            rightMenu = (
                <IconMenu
                    iconButtonElement={<IconButton iconClassName="mdi mdi-dots-vertical" iconStyle={{color: 'rgba(0,0,0,.33)'}}/>}
                    targetOrigin={{horizontal:'right', vertical:'top'}}
                    anchorOrigin={{horizontal:'right', vertical:'top'}}
                >{menuItems}</IconMenu>
            );
        }

        return <ListItem primaryText={label} leftAvatar={avatar} rightIconButton={rightMenu}/>

    }

    render(){

        const {pydio} = this.props;
        const {cellModel, noCell} = this.state;
        let cellInfo;
        if(!noCell && cellModel){
            const acls = cellModel.getAcls();
            let items = [];
            Object.keys(acls).map((roleId) => {
                items.push(this.renderListItem(acls[roleId]));
                items.push(<Divider inset={true}/>);
            });
            items.pop();
            cellInfo = (
                <div style={{borderBottom: '1px solid #e0e0e0'}}>
                    <List>
                        <Subheader>{pydio.MessageHash['639']}</Subheader>
                        {items}
                    </List>
                </div>
            )
        }
        const columnStyle = {
            position: 'absolute',
            width: 270,
            top: 100,
            bottom: 0,
            backgroundColor: '#fafafa',
            borderLeft: '1px solid #e0e0e0',
            transition: DOMUtils.getBeziersTransition()
        };

        return (
            <div id={"info_panel"} style={{...columnStyle, display:'flex', flexDirection:'column'}}>
                {cellInfo}
                <AddressBook
                    mode="selector"
                    bookColumn={true}
                    pydio={pydio}
                    disableSearch={false}
                    style={{height: null,flex: 1}}
                    actionsForCell={!noCell && cellModel ? cellModel : true}
                />
            </div>
        );

    }

}

export {AddressBookPanel as default}