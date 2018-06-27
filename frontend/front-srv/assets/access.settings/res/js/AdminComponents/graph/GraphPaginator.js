import React from 'react'
import {IconButton, IconMenu, MenuItem, DatePicker, FontIcon} from 'material-ui'
import {MessagesConsumerMixin} from '../util/Mixins'

const GraphPaginator = React.createClass({

    mixins:[MessagesConsumerMixin],

    propTypes:{
        start:React.PropTypes.number.isRequired,
        onRangeChange:React.PropTypes.func.isRequired,
        links:React.PropTypes.array,
        pickerOnShow:React.PropTypes.func,
        pickerOnDismiss:React.PropTypes.func
    },

    getInitialState:function(){
        return {paginatorType:'pages'}
    },

    makeLink: function(type, links){
        var found, clickFunc = function(){};
        links.map(function(l){
            if(l.Rel !== type) return;
            found = true;
            clickFunc = function(){
                this.props.onRangeChange(l.RefTime, l.Count);
            }.bind(this);
        }.bind(this));
        var icon;
        if(type === "LAST") icon = "chevron-double-left";
        if(type === "NEXT") icon = "chevron-left";
        if(type === "PREV") icon = "chevron-right";
        if(type === "FIRST") icon = "chevron-double-right";
        return <IconButton
            key={type}
            iconClassName={'mdi mdi-' + icon}
            onTouchTap={clickFunc}
            disabled={!found}
        />

    },

    render: function(){

        const {frequency} = this.props;

        let links=[];
        links.push(
            <IconMenu
                key="paginatorMenu"
                iconButtonElement={<IconButton iconClassName={"mdi mdi-calendar-clock"} iconStyle={{color: '#9e9e9e'}} tooltip={'Time Range'}/>}
                desktop={true}
                anchorOrigin={{horizontal:'right', vertical:'top'}}
                targetOrigin={{horizontal:'right', vertical:'top'}}
            >
                {
                    [{f:'H',l:'Last Hour'}, {f:'D',l:'Last Day'}, {f:'W',l:'Last Week'}, {f:'M',l:'Last Month'}, {f:'Y',l:'Last Year'}].map(entry => {
                        return (
                            <MenuItem
                                insetChildren={frequency !== entry.f}
                                primaryText={entry.l}
                                onTouchTap={() => this.props.onFrequencyChange(entry.f)}
                                leftIcon={frequency === entry.f ? <FontIcon className={"mdi mdi-check"}/> : null}
                            />
                        );

                    })
                }
            </IconMenu>
        );
        if(this.props.links){
            links.push(this.makeLink('NEXT', this.props.links));
            links.push(this.makeLink('PREV', this.props.links));
            links.push(this.makeLink('FIRST', this.props.links));
        }

        return <div className="graphs-paginator">{links}</div>;
    }
});

export {GraphPaginator as default}