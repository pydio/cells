import React from 'react'
import StepEmptyConfig from './StepEmptyConfig'
import Pydio from 'pydio'
import {FontIcon} from 'material-ui'

class StepPrerequisites extends React.Component {

    T(id){
        return Pydio.getInstance().MessageHash['migration.' + id] || id;
    }

    render() {

        const {advanced} = this.props;

        const content = (
            <div>
                <p>
                    {this.T('step.prereq.welcome')}<br/>
                    {this.T('step.prereq.check')}
                </p>
                <div style={{display:'flex'}}>
                    <div style={{border: '2px solid rgb(96, 125, 138)', borderRadius:8, padding:'8px 16px', flex: 1, marginRight: 8}}>
                        <h4 style={{color:'#607D8B', paddingTop: 0}}>{this.T('step.prereq.step1')}</h4>
                        <p><FontIcon className={"mdi mdi-check"} style={{fontSize:'inherit'}}/> {this.T('step.prereq.check.adminpydio')}</p>
                        <p><FontIcon className={"mdi mdi-check"} style={{fontSize:'inherit'}}/> {this.T('step.prereq.check.install')} : <a href={"https://download.pydio.com/pub/plugins/archives/action.migration.tar.gz"} target={"_blank"}><FontIcon style={{fontSize:'inherit'}} className={"mdi mdi-open-in-new"}/></a></p>
                    </div>
                    <div style={{border: '2px solid rgb(96, 125, 138)', borderRadius:8, padding:'8px 16px', flex: 1}}>
                        <h4 style={{color:'#607D8B', paddingTop: 0}}>{this.T('step.prereq.step2')}</h4>
                        <p><FontIcon className={"mdi mdi-check"} style={{fontSize:'inherit'}}/> {this.T('step.prereq.check.admincell')}</p>
                        <p><FontIcon className={"mdi mdi-check"} style={{fontSize:'inherit'}}/> {this.T('step.prereq.check.copy')}</p>
                    </div>
                    <div style={{border: '2px solid rgb(96, 125, 138)', borderRadius:8, padding:'8px 16px', flex: 1, marginLeft: 8}}>
                        <h4 style={{color:'#607D8B', paddingTop: 0}}>{this.T('step.prereq.step3')}</h4>
                        <p><FontIcon className={"mdi mdi-check"} style={{fontSize:'inherit'}}/> {this.T('step.prereq.ds.create')}</p>
                        {advanced &&
                            <p><FontIcon className={"mdi mdi-check"} style={{fontSize:'inherit'}}/> {this.T('step.prereq.ds.tpl.ed')}</p>
                        }
                        {!advanced &&
                            <p><FontIcon className={"mdi mdi-alert"} style={{fontSize:'inherit'}}/> {this.T('step.prereq.ds.tpl.home')}</p>
                        }
                        <p><FontIcon className={"mdi mdi-check"} style={{fontSize:'inherit'}}/> {this.T('step.prereq.ds.done')}</p>
                    </div>
                </div>
            </div>
        );


        return <StepEmptyConfig {...this.props} title={this.T('step.prereq.title')} legend={content} nextLabel={this.T('step.prereq.start')}/>

    }

}

export {StepPrerequisites as default}