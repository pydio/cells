import React from 'react'
import Pydio from 'pydio'
import {Dialog, FlatButton, RaisedButton, MenuItem} from 'material-ui'
import uuid from "uuid4";
import TplManager from "../graph/TplManager";
const {ModernTextField, ModernSelectField} = Pydio.requireLib('hoc');
import {JobsJob, JobsAction} from 'pydio/http/rest-api';

class TemplateDialog extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            templateLabel: props.defaultLabel || '',
            templateDescription:props.defaultDescription || '',
            templateIcon:props.defaultIcon || 'mdi mdi-chip',
        }
    }

    save(){
        const {onDismiss, type, data} = this.props;
        const {templateLabel, templateDescription, templateIcon} = this.state;

        if(type === 'job') {

            const tpl = JobsJob.constructFromObject(JSON.parse(JSON.stringify(data)));
            tpl.ID = uuid();
            tpl.Label = [templateLabel, templateDescription, templateIcon].join('||');
            tpl.Tasks = [];
            TplManager.getInstance().saveJob(tpl).then(() => {
                Pydio.getInstance().UI.displayMessage('SUCCESS', 'Successfully saved job as template')
            }).catch(e => {
                Pydio.getInstance().UI.displayMessage('ERROR', 'Could not save template: ' + e.message);
            });

        } else if (type === 'action') {

            const copy = JobsAction.constructFromObject(JSON.parse(JSON.stringify(data)));
            delete(copy.ChainedActions);
            delete(copy.FailedActions);
            copy.Label = templateLabel;
            copy.Description = templateDescription;
            TplManager.getInstance().saveAction(uuid(), copy).then(() => {
                Pydio.getInstance().UI.displayMessage('SUCCESS', 'Successfully saved as template');
            }).catch(e => {
                Pydio.getInstance().UI.displayMessage('ERROR', e.message);
            });


        } else if(type === 'selector') {

            const {isFilter, selectorType} = this.props;
            TplManager.getInstance().saveSelector(uuid(), isFilter, templateLabel, templateDescription, selectorType, data).then(() => {
                Pydio.getInstance().UI.displayMessage('SUCCESS', 'Successfully saved as template');
            }).catch(e => {
                Pydio.getInstance().UI.displayMessage('ERROR', e.message);
            });


        }

        onDismiss();
    }


    render(){

        const {type, onDismiss, actionsDescriptions = {}} = this.props;
        const {templateLabel, templateDescription, templateIcon} = this.state;
        const children = [];
        let title;

        children.push(<ModernTextField fullWidth={true} hintText={"Label"} value={templateLabel} onChange={(e,v)=>{this.setState({templateLabel:v})}}/>);

        if(type === 'job') {
            title = "Save job as template";
            children.push(
                <ModernSelectField fullWidth={true} hintText={"Icon"} value={templateIcon} onChange={(e,i,v)=>{this.setState({templateIcon:v})}}>
                    <MenuItem value={"mdi mdi-chip"} primaryText={<span><span className={"mdi mdi-chip"}/> Default Icon</span>}/>
                    {Object.keys(actionsDescriptions).filter(id => !!actionsDescriptions[id].Icon).map(id => {
                        const a = actionsDescriptions[id];
                        return <MenuItem value={"mdi mdi-" + a.Icon} primaryText={<span><span className={"mdi mdi-" + a.Icon}/> {a.Icon}</span>}/>
                    })}
                </ModernSelectField>
            );
        } else if(type === 'action'){
            title = "Save action as template";
        } else if(type === 'selector'){
            title = "Save filter/selector as template";
        }

        children.push(<ModernTextField fullWidth={true} hintText={"Additional description"} multiLine={true} rowsMax={2} value={templateDescription} onChange={(e,v)=>{this.setState({templateDescription:v})}}/>);

        children.push(
            <div style={{paddingTop: 20, textAlign:'right'}}>
            </div>
        );


        return (
            <Dialog
                title={<h3><span className={"mdi mdi-book-plus"}/> {title}</h3>}
                open={true}
                onRequestClose={()=>{onDismiss()}}
                actions={[
                    <FlatButton label={"Cancel"} onTouchTap={onDismiss}/>,
                    <RaisedButton label={"Create Template"} disabled={!templateLabel} primary={true} onTouchTap={() => {this.save()}}/>
                ]}
            >
                {children}
            </Dialog>
        );

    }

}

export default TemplateDialog