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
import React from 'react'
import {muiThemeable} from 'material-ui/styles'
import {Card, CardTitle, CardMedia, CardActions, CardText, FlatButton, List, ListItem, Divider, IconButton, FontIcon} from 'material-ui'
import {MessagesConsumerMixin} from '../util/Mixins'
import shuffle from 'lodash.shuffle'

let Dashboard = React.createClass({

    mixins: [MessagesConsumerMixin],

    getInitialState: function(){
        return {kb: []};
    },

    componentDidMount: function(){
        PydioApi.getClient().loadFile('plug/access.settings/res/i18n/kb.json', (transport) => {
            const data = transport.responseJSON;
            this.setState({kb: data});
        });
    },

    getOpenIcon: function(link){
        return (
            <IconButton
                iconClassName="mdi mdi-arrow-right"
                iconStyle={{color:'rgba(0,0,0,.33)'}}
                tooltip="Open in new window"
                tooltipPosition="bottom-left"
                onTouchTap={() => {window.open(link)}}
            />
        );
    },

    getDocButton: function(icon, message, link){
        return <FlatButton
            key={message}
            label={message}
            primary={true}
            icon={<FontIcon className={"mdi mdi-" + icon}/>}
            onTouchTap={()=>{window.open(link)}}/>
    },

    welcomeClick: function(e){
        if(e.target.getAttribute('data-path')){
            let p = e.target.getAttribute('data-path');
            if(p === '/plugins/manager'){
                p = '/parameters/manager';
            }
            this.props.pydio.goTo(p);
        }
    },

    render: function(){

        const verticalFlex = {display:'flex', flexDirection:'column', height: '100%'};
        const flexFill = {flex:1};
        const paperStyle = {flex: 1, minWidth: 450, margin: 5};
        const flexContainerStyle = {...verticalFlex};
        const {accent2Color} = this.props.muiTheme.palette;


        const {pydio} = this.props;
        const message = (id) => {return pydio.MessageHash['admin_dashboard.' + id]};

        // ADMIN GUIDE BUTTONS
        const guidesButtons = [
            {icon:'clock-start', id:'start', link:'https://pydio.com/en/docs/cells/v1/getting-started'},
            {icon:'network', id:'ws', link:'https://pydio.com/en/docs/cells/v1/storage-data-and-metadata'},
            {icon:'account-multiple', id:'users', link:'https://pydio.com/en/docs/cells/v1/access-control-and-security'},
            {icon:'professional-hexagon', id:'advanced', link:'https://pydio.com/en/docs/cells/v1/advanced'}
        ];

        // DOCS LIST
        let kbItems = [];
        shuffle(this.state.kb).forEach((object) => {
            kbItems.push(<ListItem key={object.title} primaryText={object.title} secondaryText={object.desc} rightIconButton={this.getOpenIcon(object.link)} secondaryTextLines={2} disabled={true}/>);
            kbItems.push(<Divider key={object.title + '-divider'}/>);
        });
        // Remove last divider
        if(kbItems.length) {
            kbItems.pop();
        }

        const WELCOME_COMMUNITY_CARD = (
            <Card style={{...paperStyle, minWidth:'95%'}}  containerStyle={flexContainerStyle}>
                <CardTitle
                    title={message('welc.title')}
                    subtitle={message('welc.subtitle')}
                />
                <CardText style={flexFill}>
                    <style dangerouslySetInnerHTML={{__html:'.doc-link{color: '+accent2Color+';cursor: pointer;text-decoration:underline;}'}}/>
                    <div style={{lineHeight:'1.6em'}}>
                        <span dangerouslySetInnerHTML={{__html:message('welc.intro')}} onClick={this.welcomeClick}></span>
                        <span dangerouslySetInnerHTML={{__html:message('welc.import')}} onClick={this.welcomeClick}></span>
                    </div>
                    <p style={{fontSize: 14}}>{message('welc.guide')}</p>
                </CardText>
                <Divider/>
                <CardActions style={{textAlign:'right'}}>
                    {guidesButtons.map((object) => {
                        return this.getDocButton(object.icon, message('welc.btn.' + object.id), object.link);
                    })}
                </CardActions>
            </Card>
        );

        const PAY_IT_FORWARD_CARD = (
            <Card style={paperStyle} containerStyle={flexContainerStyle}>
                <CardTitle title={message('cont.title')} subtitle={message('cont.subtitle')} />
                <CardText style={flexFill}>
                    <div className="mdi mdi-github-circle" style={{fontSize: 60, display:'inline-block', float:'left', marginRight:10, marginBottom:10}}/>
                    {message('cont.intro')}
                    <List>
                        <ListItem disabled={true} primaryText={message('cont.topic.report')} rightIconButton={this.getOpenIcon('https://forum.pydio.com/')}/>
                        <Divider/>
                        <ListItem disabled={true} primaryText={message('cont.topic.report.2')} rightIconButton={this.getOpenIcon('https://github.com/pydio/cells')}/>
                        <Divider/>
                        <ListItem disabled={true} primaryText={message('cont.topic.pr')} rightIconButton={this.getOpenIcon('https://github.com/pydio/cells')}/>
                        <Divider/>
                        <ListItem disabled={true} primaryText={message('cont.topic.translate')} rightIconButton={this.getOpenIcon('https://pydio.com/en/community/contribute/adding-translation-pydio')} />
                    </List>
                </CardText>
                <Divider/>
                <CardActions style={{textAlign:'right'}}>
                    <FlatButton label={message('cont.btn.github')} primary={true} icon={<FontIcon className="mdi mdi-github-box" />} onTouchTap={()=>{window.open('https://github.com/pydio/cells')}} />
                    <FlatButton label={message('cont.btn.tw')} primary={true} icon={<FontIcon className="mdi mdi-twitter-box" />} onTouchTap={()=>{window.open('https://twitter.com/Pydio')}} />
                    <FlatButton label={message('cont.btn.fb')} primary={true} icon={<FontIcon className="mdi mdi-facebook-box" />} onTouchTap={()=>{window.open('https://facebook.com/Pydio/')}} />
                </CardActions>
            </Card>
        );


        const DISCOVER_ENTERPRISE_CARD = (
            <Card style={paperStyle} containerStyle={flexContainerStyle}>
                <CardMedia
                    overlay={<CardTitle title={message('ent.title')} subtitle={message('ent.subtitle')}/>}
                >
                    <div style={{height:230, backgroundImage:'url(plug/access.settings/res/images/dashboard.png)', backgroundSize:'cover',borderRadius:3}}/>
                </CardMedia>
                <List style={flexFill}>
                    <ListItem leftIcon={<FontIcon style={{color:accent2Color}} className="mdi mdi-certificate"/>} primaryText={message('ent.features')} secondaryText={message('ent.features.legend')} disabled={true} />
                    <Divider/>
                    <ListItem leftIcon={<FontIcon style={{color:accent2Color}} className="mdi mdi-chart-areaspline"/>} primaryText={message('ent.advanced')} secondaryText={message('ent.advanced.legend')} disabled={true} />
                    <Divider/>
                    <ListItem leftIcon={<FontIcon style={{color:accent2Color}} className="mdi mdi-message-alert"/>} primaryText={message('ent.support')} secondaryText={message('ent.support.legend')} disabled={true} />
                    <Divider/>
                    <ListItem leftIcon={<FontIcon style={{color:accent2Color}} className="mdi mdi-download"/>} onTouchTap={()=>{pydio.goTo('/admin/update')}} primaryText={<span style={{color:'rgb(1, 141, 204)'}}>{message('ent.upgrade')}</span>} secondaryText={message('ent.upgrade.legend')}/>
                </List>
                <Divider/>
                <CardActions style={{textAlign:'right'}}>
                    <FlatButton label={message('ent.btn.more')} icon={<FontIcon className={"icomoon-cells"}/>} primary={true}  onTouchTap={()=>{window.open('https://pydio.com/en/features/pydio-cells-overview')}} />
                    <FlatButton label={message('ent.btn.contact')}  icon={<FontIcon className={"mdi mdi-domain"}/>} primary={true}  onTouchTap={()=>{window.open('https://pydio.com/en/pricing/contact')}} />
                </CardActions>
            </Card>
        );

        return (
            <div className={"main-layout-nav-to-stack vertical-layout"}>
                <div className={"layout-fill"} style={{display:'flex', alignItems:'top', flexWrap:'wrap', padding: 5}}>
                    {WELCOME_COMMUNITY_CARD}
                    {DISCOVER_ENTERPRISE_CARD}
                    {PAY_IT_FORWARD_CARD}
                </div>
            </div>
        )
    }

});

Dashboard = muiThemeable()(Dashboard);
export {Dashboard as default}