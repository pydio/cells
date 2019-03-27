import React from 'react'
import {MessagesConsumerMixin} from "../util/Mixins";
import {Line} from 'react-chartjs';
import GraphModel from './GraphModel'

const RemoteGraphLine = React.createClass({

    mixins:[MessagesConsumerMixin],

    propTypes:{
        queryName:React.PropTypes.string,
        start:React.PropTypes.number,
        frequency:React.PropTypes.string,
        onDataLoaded:React.PropTypes.func,
        width:React.PropTypes.number,
        height:React.PropTypes.number,
        chartOptions:React.PropTypes.object,
        filters:React.PropTypes.object
    },

    triggerReload:function(){
        this.loadData();
    },

    getDefaultProps: function(){
        return {
            start:0,
            width:300,
            height:200,
            frequency:'H',
            onDataLoaded:function(){},
            chartOptions:{
                responsive:true,
                useCSSTransforms:false,
                maintainAspectRatio:false,
                tooltipTemplate: "<%= value %> <%= datasetLabel %>",
                multiTooltipTemplate: "<%= value %> <%= datasetLabel %>"
            }
        };
    },

    getInitialState:function(){
        return {
            loaded:false,
            colorIndex: (Math.floor(Math.random() * 100) % 3),
            chartData:{labels:[], datasets:[]}
        };
    },

    componentWillReceiveProps(nextProps){
        if(nextProps.start !== this.props.start || nextProps.frequency !== this.props.frequency){
            this.setState({newLoad:true});
        }
    },

    componentDidMount(){
        this.firstLoad = setTimeout(this.loadData, 500);
        //this.loadData();
    },

    componentWillUnmount(){
        if(this.firstLoad){
            global.clearTimeout(this.firstLoad);
        }
    },

    componentDidUpdate(){
        if(this.state.newLoad){
            this.setState({newLoad:false}, this.loadData);
        }
    },

    loadData(){
        this.firstLoad = null;
        const model = new GraphModel();
        const {queryName, frequency, start} = this.props;
        const queries = queryName.split(",");
        Promise.all(queries.map(q => model.loadData(q, frequency, start))).then(results => {
            const dataSets = [];
            let theLabels, theLinks;
            queries.forEach((qName, index) => {
                const {labels, points, links} = results[index];
                const dataSet = this.makeDataSet(qName, points, index);
                dataSets.push(dataSet);
                theLabels = labels;
                theLinks = links;
            });
            this.setState({
                chartData:{
                    labels:theLabels,
                    datasets:dataSets
                },
                links:theLinks,
                loaded:true
            });
            this.props.onDataLoaded({links: theLinks}, dataSets);
        }).catch(reason => {
            // Todo
        });

    },

    parseData:function(queryName, jsonData){
        if(jsonData.data instanceof Array){
            jsonData.data = {unique:jsonData.data};
        }
        if(jsonData.meta instanceof Array){
            jsonData.meta = {unique:jsonData.meta};
        }
        var received = jsonData.data;
        // TO BE TAKEN FROM CONFIG
        var sortKey = 'Date_sortable';
        var labelKey = 'Date';
        var labels = [];
        var datasets = {};
        var datasetsLabels = {};

        // First compute all keys
        var presort = [];
        var presortLabels = {};
        var foundLabels = [];
        for(var k in received){
            if(!received.hasOwnProperty(k)) continue;
            datasets[k] = [];
            received[k].map(function(entry){
                if(foundLabels.indexOf(entry[labelKey]) === -1){
                    presort.push(entry[sortKey]);
                    presortLabels[entry[sortKey]] = entry[labelKey];//.replace(' 2015', '');
                    foundLabels.push(entry[labelKey]);
                }
            });
        }
        presort.sort();
        presort.map(function(sortedKey){
            for(var k in received) {
                if (!received.hasOwnProperty(k)) continue;
                var foundEntry = null;
                received[k].map(function(entry){
                    if(entry[labelKey] == presortLabels[sortedKey]){
                        foundEntry = entry;
                    }
                });
                var value = 0;
                if(foundEntry){
                    // find a value key here
                    for(var prop in foundEntry){
                        if(!foundEntry.hasOwnProperty(prop) || prop == sortKey || prop == labelKey) continue;
                        value = foundEntry[prop];
                        datasetsLabels[k] = prop;
                        break;
                    }
                }
                datasets[k].push(value);
                if(!datasetsLabels[k] && jsonData.meta && jsonData.meta[k]){
                    var meta = jsonData.meta[k];
                    if(meta['AXIS'] && meta['AXIS']['y']) datasetsLabels[k] = meta['AXIS']['y'];
                    else datasetsLabels[k] = meta['LABEL'];
                }
            }
            labels.push(presortLabels[sortedKey].replace(' 2015', ''));
        });
        var preparedDataSets = [];
        var index = 0;
        for(var qK in datasets){
            if(datasets.hasOwnProperty(qK)){
                var dLabel = datasetsLabels[qK] || '';
                preparedDataSets.push(this.makeDataSet(dLabel, datasets[qK]));
                index ++;
            }
        }
        this.setState({
            chartData:{
                labels:labels,
                datasets:preparedDataSets
            },
            links:jsonData.links,
            loaded:true
        });
        this.props.onDataLoaded(jsonData, preparedDataSets);
    },

    makeDataSet:function(label, data, index){
        //const colors = ['70, 191, 189','151,187,205','220,220,220'];
        const colors = ['0, 150, 136','33,150,243','255,87,34'];
        const color = colors[index];
        return {
            label: label,
            fillColor: "rgba("+color+",0.2)",
            strokeColor: "rgba("+color+",1)",
            pointColor: "rgba("+color+",1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba("+color+",1)",
            data: data
        };
    },

    resizeChart:function(){
        if(this.refs['chart']){
            this.refs['chart'].getChart().resize();
        }
    },

    render: function() {
        var chart;
        if (this.state.loaded) {
            chart = <Line
                ref="chart"
                key="chart"
                data={this.state.chartData}
                options={this.props.chartOptions}
                width={this.props.width}
                height={this.props.height}
            />;
        } else {
            chart = <div className="graph-loading">{this.context.getMessage('home.6', 'ajxp_admin')}</div>;
        }
        return chart;
    }
});

export {RemoteGraphLine as default}