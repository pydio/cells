import React from 'react'
import {Step, StepLabel, StepContent, RaisedButton} from 'material-ui'
import StepActions from './StepActions'
import Pydio from 'pydio'

class StepEmptyConfig extends React.Component {
    constructor(props) {
        super(props);
    }

    T(id){
        return Pydio.getInstance().MessageHash['migration.' + id] || id;
    }

    render() {
        const {onBack, onComplete, nextLabel, legend, styles, otherButtons} = this.props;
        const {title, ...remainingProps} = this.props;

        return (
            <Step {...remainingProps}>
                <StepLabel>{title}</StepLabel>
                <StepContent>
                    <div style={styles.stepLegend}>
                        {legend}
                    </div>
                    <StepActions>
                        {otherButtons}
                        {onBack &&
                            <RaisedButton
                                onClick={() => onBack()}
                                label={this.T('back')}
                            />
                        }
                        &nbsp;&nbsp;
                        <RaisedButton
                            primary={true}
                            onClick={() => onComplete()}
                            label={nextLabel || this.T('next')}
                        />
                    </StepActions>

                </StepContent>
            </Step>
        )
    }
}

export {StepEmptyConfig as default}