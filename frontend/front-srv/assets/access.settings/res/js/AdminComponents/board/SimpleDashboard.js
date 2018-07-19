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
const React = require('react')
const {muiThemeable} = require('material-ui/styles')
const {Paper, Card, CardTitle, CardMedia, CardActions, CardHeader, CardText,
    FlatButton, List, ListItem, Divider, IconButton, FontIcon} = require('material-ui')
import {MessagesConsumerMixin} from '../util/Mixins'
const shuffle = require('lodash.shuffle')

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
        return (
            <div style={{width:180}} key={icon}>
                <FlatButton
                    primary={true}
                    style={{height:110,lineHeight:'20px'}}
                    label={<div><div style={{fontSize:36}} className={"mdi mdi-" + icon}/><div>{message}</div></div>}
                    fullWidth={true}
                    onTouchTap={()=>{window.open(link)}}
                />
            </div>
        );
    },

    welcomeClick: function(e){
        if(e.target.getAttribute('data-path')){
            const p = e.target.getAttribute('data-path');
            this.props.pydio.goTo(p);
        }
    },

    render: function(){

        const horizontalFlex = {display:'flex', width:'100%'};
        const verticalFlex = {display:'flex', flexDirection:'column', height: '100%'};
        const flexFill = {flex:1};
        const flexFillNo = {width:120};

        const paperStyle = {width:500, marginLeft:12, marginTop: 12};
        const flexContainerStyle = {...verticalFlex};
        const {primary1Color, accent1Color, accent2Color} = this.props.muiTheme.palette;
        const textLinkStyle = {cursor: 'pointer', color: accent1Color};

        const MEDIA_TEST_CARD = (
            <Card style={paperStyle}>
                <CardMedia
                    overlay={<CardTitle title="Want to contribute?" subtitle="Pydio is Open Source and will always be" />}
                ><div>
                    <div style={{backgroundColor: '#b0bec5', display:'flex', alignItems:'center', justifyContent:'center', height:400}}>
                        <div className="mdi mdi-github-circle" style={{fontSize: 200, paddingBottom:60}}></div>
                    </div>
                </div>
                </CardMedia>
                <CardActions>
                    <FlatButton label="Get Started"/>
                </CardActions>

            </Card>
        );

        const {pydio} = this.props;
        const message = (id) => {return pydio.MessageHash['admin_dashboard.' + id]};
        const OPEN_IN_NEW_ICON = <IconButton iconClassName="mdi mdi-arrow-right" iconStyle={{color:'rgba(0,0,0,.33)'}} tooltip="Open in new window"/>;

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
            <Card style={paperStyle}>
                <CardTitle
                    title={message('welc.title')}
                    subtitle={message('welc.subtitle')}
                />
                <CardText>
                    <style dangerouslySetInnerHTML={{__html:'.doc-link{color: '+accent2Color+';cursor: pointer;}'}}/>
                    <span dangerouslySetInnerHTML={{__html:message('welc.intro')}} onClick={this.welcomeClick}></span>
                </CardText>
                <CardText>
                    {message('welc.guide')}
                    <div style={{...horizontalFlex, flexWrap:'wrap',justifyContent:'center', padding:'10px 20px 0'}}>
                        {guidesButtons.map((object) => {
                            return this.getDocButton(object.icon, message('welc.btn.' + object.id), object.link);
                        })}
                    </div>
                </CardText>
            </Card>
        );

        const GET_SOME_HELP_CARD = (
            <Card style={paperStyle} containerStyle={flexContainerStyle}>
                <CardTitle
                    title={message('kb.title')}
                    subtitle={message('kb.subtitle')}
                />
                <CardText>{message('kb.intro')}</CardText>
                <List style={{overflow: 'auto', flex:1, maxHeight: 320}}>{kbItems}</List>
                <Divider/>
                <CardActions style={{textAlign:'right'}}>
                    <FlatButton label={message('kb.btn.alldocs')} primary={true} onTouchTap={()=>{window.open('https://github.com/pydio/cells/wiki')}}/>
                    <FlatButton label={message('kb.btn.forum')} primary={true} onTouchTap={()=>{window.open('https://forum.pydio.com/')}}/>
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
                <CardActions style={{textAlign:'center'}}>
                    <FlatButton label={message('cont.btn.github')} primary={true} icon={<FontIcon className="mdi mdi-github-box" />} onTouchTap={()=>{window.open('https://github.com/pydio/cells')}} />
                    <FlatButton label={message('cont.btn.tw')} primary={true} icon={<FontIcon className="mdi mdi-twitter-box" />} onTouchTap={()=>{window.open('https://twitter.com/Pydio')}} />
                    <FlatButton label={message('cont.btn.fb')} primary={true} icon={<FontIcon className="mdi mdi-facebook-box" />} onTouchTap={()=>{window.open('https://facebook.com/Pydio/')}} />
                </CardActions>
            </Card>
        );


        const DISCOVER_ENTERPRISE_CARD = (
            <Card style={paperStyle}>
                <CardMedia
                    overlay={<CardTitle title={message('ent.title')} subtitle={message('ent.subtitle')}/>}
                >
                    <div style={{height:230, backgroundImage:'url(plug/access.settings/res/images/dashboard.png)', backgroundSize:'cover',borderRadius:3}}/>
                </CardMedia>
                <List>
                    <ListItem leftIcon={<FontIcon style={{color:accent2Color}} className="mdi mdi-certificate"/>} primaryText={message('ent.features')} secondaryText={message('ent.features.legend')} />
                    <Divider/>
                    <ListItem leftIcon={<FontIcon style={{color:accent2Color}} className="mdi mdi-chart-areaspline"/>} primaryText={message('ent.advanced')} secondaryText={message('ent.advanced.legend')} />
                    <Divider/>
                    <ListItem leftIcon={<FontIcon style={{color:accent2Color}} className="mdi mdi-message-alert"/>} primaryText={message('ent.support')} secondaryText={message('ent.support.legend')} />
                </List>
                <Divider/>
                <CardActions style={{textAlign:'right'}}>
                    <FlatButton label={message('ent.btn.more')} primary={true}  onTouchTap={()=>{window.open('https://pydio.com/en/features/pydio-cells-overview')}} />
                    <FlatButton label={message('ent.btn.contact')} primary={true}  onTouchTap={()=>{window.open('https://pydio.com/en/pricing/contact')}} />
                </CardActions>
            </Card>
        );

        return (
            <div style={{flex:'1', overflow: 'auto', height: '100%', paddingBottom: 10}}>
                <div style={{display:'flex', alignItems:'top', flexWrap:'wrap'}}>
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