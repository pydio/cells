import React from 'react'
import StepEmptyConfig from './StepEmptyConfig'
import Pydio from 'pydio'
import {FontIcon} from 'material-ui'

class StepPrerequisites extends React.Component {

    T(id){
        return Pydio.getInstance().MessageHash['migration.' + id] || id;
    }

    render() {

        const content = (
            <div>
                <p style={{backgroundColor: '#C62828', color: 'white', borderRadius: 2, padding: 12, fontWeight: 500}}>
                    {this.T('step.prereq.disclaimer')}<br/><br/>
                    {this.T('step.prereq.disclaimer2')}
                    <a href={"https://pydio.com/en/user/login"} style={{textDecoration:'underline', color:'white'}}>{<FontIcon  color={"white"} className={"mdi mdi-open-in-new"}/>}</a>.
                </p>
                <p>
                    {this.T('step.prereq.welcome')}<br/>
                    {this.T('step.prereq.check')}
                    <ul>
                        <li style={{listStyle:'inherit', margin: 20}}>{this.T('step.prereq.check.copy')}</li>
                        <li style={{listStyle:'inherit', margin: 20}}>{this.T('step.prereq.check.install')}<a href={"https://download.pydio.com/pub/plugins/archives/action.migration.tar.gz"} target={"_blank"}><FontIcon className={"mdi mdi-open-in-new"}/></a>.</li>
                        <li style={{listStyle:'inherit', margin: 20}}>{this.T('step.prereq.check.admincell')}</li>
                        <li style={{listStyle:'inherit', margin: 20}}>{this.T('step.prereq.check.adminpydio')}</li>
                    </ul>
                </p>
            </div>
        );

        return <StepEmptyConfig {...this.props} title={this.T('step.prereq.title')} legend={content} nextLabel={this.T('step.prereq.start')}/>

    }

}

export {StepPrerequisites as default}