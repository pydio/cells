import {Component, PropTypes} from 'react';
import {Paper, TextField, Checkbox} from 'material-ui'
import Pydio from 'pydio'
import AdminStyles from "../board/AdminStyles";
const {asGridItem} = Pydio.requireLib('components');
const {PydioContextConsumer} = Pydio.requireLib('boot');

const globalMessages = global.pydio.MessageHash;

class ToDoList extends Component{

    constructor(props, context){
        super(props, context);
        const {preferencesProvider, widgetId} = this.props;

        if (preferencesProvider){
            const tasks = preferencesProvider.getUserPreference('ToDoList-' + widgetId);
            if(tasks && typeof tasks === "object"){
                this.state = {tasks:tasks, edit:false};
                return;
            }
        }
        this.state = {
            edit:false,
            input: '',
            tasks:[
                {
                    label:this.props.getMessage("home.77", "ajxp_admin"),
                    isDone:false
                },
                {
                    label:this.props.getMessage("home.77", "ajxp_admin") +  " ("+this.props.getMessage("home.78", "ajxp_admin")+")",
                    isDone:true
                }
            ]
        };
    }

    addTask(){
        const {input} = this.state;
        if (!input){
            return;
        }
        let {tasks} = this.state;
        tasks.push({
            label:input,
            isDone:false
        });
        if(this.props.preferencesProvider){
            this.props.preferencesProvider.saveUserPreference('ToDoList-' + this.props['widgetId'], tasks);
        }
        this.setState({tasks, input:''});
    }

    handleNewTaskKeyDown(event) {
        if (event.keyCode === 13) {
            this.addTask();
        }
    }

    removeTask(index){
        const {tasks} = this.state;
        let newTasks = [];
        for(let i=0; i < tasks.length; i++){
            if(i !== index) newTasks.push(tasks[i]);
        }
        if(this.props.preferencesProvider){
            this.props.preferencesProvider.saveUserPreference('ToDoList-' + this.props['widgetId'], newTasks);
        }
        this.setState({tasks:newTasks});
    }

    changeTaskState(index){
        const {tasks} = this.state;
        let newTasks = [];
        for(let i=0; i < tasks.length; i++){
            if(i === index){
                newTasks.push({label: tasks[i].label, isDone: !(tasks[i].isDone)});
            } else {
                newTasks.push(tasks[i]);
            }
        }
        if(this.props.preferencesProvider){
            this.props.preferencesProvider.saveUserPreference('ToDoList-' + this.props['widgetId'], newTasks);
        }
        this.setState({tasks:newTasks});
    }

    render(){
        let index = -1;
        const tasks = this.state.tasks.map(function(item){
            index++;
            let taskLabel;
            if (item.isDone){
                taskLabel = (<p className="task-done" title={item.label}>{item.label}</p>);
            } else {
                taskLabel = (<p title={item.label}>{item.label}</p>);
            }
            return(
                <div style={{display:'flex', alignItems:'baseline', paddingBottom: 5, width:'100%'}} key={"task"+index}>
                    <div style={{flex: 1}}>
                        <Checkbox
                            onCheck={this.changeTaskState.bind(this, index)}
                            checked={item.isDone}
                            label={taskLabel}
                            labelPosition={"right"}
                        />
                    </div>
                    <span onClick={this.removeTask.bind(this, index)} className={'mdi mdi-delete'} style={{cursor: 'pointer', color: '#9e9e9e', fontSize: 24}} />
                </div>
            );
        }.bind(this));
        const adminStyles = AdminStyles();
        return (
            <Paper {...this.props} transitionEnabled={false}
                   {...adminStyles.body.block.props}
                   style={{...adminStyles.body.block.container, margin:0,...this.props.style}}
            >
                {this.props.closeButton}
                <div style={{display:'flex', width:'100%', height:'100%', flexDirection:'column'}}>
                    {<h4>{"Todo List"}</h4>}
                    <div style={{padding: '0 20px'}}>
                        <TextField
                            value={this.state.input}
                            fullWidth={true}
                            onKeyDown={this.handleNewTaskKeyDown.bind(this)}
                            hintText={globalMessages['ajxp_admin.home.76']}
                            onChange={(e,val) => {this.setState({input: val})}}
                        />
                    </div>
                    <div style={{padding:'0 20px', flex: 1, overflowY: 'auto'}}>
                        {tasks}
                    </div>
                </div>
            </Paper>
        );
    }
}

ToDoList.propTypes = {
    title:PropTypes.string
};

ToDoList = PydioContextConsumer(ToDoList);
ToDoList = asGridItem(
    ToDoList,
    globalMessages['ajxp_admin.home.75'],
    {gridWidth:2,gridHeight:26},
    [{name:'title',label:globalMessages['ajxp_admin.home.30'], type:'string', mandatory:true, 'default':globalMessages['ajxp_admin.home.75']}]
);

export {ToDoList as default}