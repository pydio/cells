import React from 'react'
import StepEmptyConfig from './StepEmptyConfig'
import Pydio from 'pydio'
import {FontIcon, RaisedButton} from 'material-ui'

class StepDisclaimer extends React.Component {

    T(id){
        return Pydio.getInstance().MessageHash['migration.' + id] || id;
    }

    render() {

        const {advanced} = this.props;

        const content = (
            <div>
                <p style={{border: '2px solid #C62828', color: '#C62828', borderRadius: 4, padding: 12, fontWeight: 500, marginBottom: 8}}>
                    {this.T('step.disclaimer')}<br/><br/>
                    {this.T('step.disclaimer.' + (advanced ? "ed":"home"))}
                </p>
            </div>
        );

        const otherButtons = [];
        if (advanced){
            otherButtons.push(<RaisedButton label={this.T('step.disclaimer.support')} onClick={()=>{window.open('https://pydio.com/en/user/login')}}/>)
        } else {
            otherButtons.push(<RaisedButton label={this.T('step.disclaimer.quote')} onClick={()=>{window.open('https://pydio.com/en/pricing/contact')}}/>)
        }


        return <StepEmptyConfig {...this.props} title={this.T('step.disclaimer.title')} legend={content} nextLabel={this.T('step.disclaimer.start')} otherButtons={otherButtons}/>

    }

}

export {StepDisclaimer as default}