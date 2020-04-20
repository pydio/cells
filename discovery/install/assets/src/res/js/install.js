import React from 'react';
import {Paper, TextField, FontIcon, RadioButtonGroup, Checkbox, SelectField, MenuItem,
    RaisedButton, FlatButton, Step, Stepper, StepLabel, StepContent, LinearProgress, CircularProgress} from 'material-ui'
import {connect} from 'react-redux';
import {Field, reduxForm, formValueSelector} from 'redux-form';
import Client from './client';
import validator from 'validator';
import InstallInstallConfig from './gen/model/InstallInstallConfig';
import InstallServiceApi from './gen/api/InstallServiceApi';
import InstallCheckResult from './gen/model/InstallCheckResult';
import InstallPerformCheckRequest from './gen/model/InstallPerformCheckRequest';
import { load as loadConfig } from './config'
import languages from './gen/languages'
const defaultLanguage = 'en-us';

const client = new Client();
const api = new InstallServiceApi(client);

const renderTextField = ({input, label, floatingLabel, meta: {touched, error}, ...custom}) => (
  <TextField
    hintText={label}
    floatingLabelText={floatingLabel}
    floatingLabelFixed={true}
    errorText={touched && error}
    fullWidth={true}
    {...input}
    {...custom}
  />
);

const renderPassField = ({input, label, floatingLabel, meta: {touched, error}, ...custom}) => (
  <TextField
    hintText={label}
    floatingLabelText={floatingLabel}
    floatingLabelFixed={true}
    errorText={error}
    fullWidth={true}
    type={"password"}
    autoComplete={"new-password"}
    {...input}
    {...custom}
  />
);

const renderCheckbox = ({input, label}) => (
  <Checkbox
    label={label}

    checked={input.value ? true : false}
    onCheck={input.onChange}
  />
);

const renderRadioGroup = ({input, ...rest}) => (
  <RadioButtonGroup
    {...input}
    {...rest}
    valueSelected={input.value}
    onChange={(event, value) => input.onChange(value)}
  />
);

const renderSelectField = ({
  input,
  label,
  floatingLabel,
  meta: {touched, error},
  children,
  ...custom
}) => (
    <SelectField
        fullWidth={true}
        floatingLabelText={label}
        floatingLabelFixed={true}
        errorText={touched && error}
        {...input}
        onChange={(event, index, value) => input.onChange(value)}
        children={children}
        {...custom}
    />
)


/**
 * Vertical steppers are designed for narrow screen sizes. They are ideal for mobile.
 *
 * To use the vertical stepper with the contained content as seen in spec examples,
 * you must use the `<StepContent>` component inside the `<Step>`.
 *
 * <small>(The vertical stepper can also be used without `<StepContent>` to display a basic stepper.)</small>
 */
class InstallForm extends React.Component {

    state = {
        finished: false,
        stepIndex: 0,
        dbConnectionType: "tcp",
        licenseAgreed: false,
        showAdvanced: false,
        installEvents: [],
        installProgress: 0,
        serverRestarted:false,
        lang:defaultLanguage
    };

    constructor(props) {
        super(props);
        // Initial load
        api.getInstall().then((values) => {
            props.load(values.config)
        });
        api.getAgreement().then((resp) => {
            this.setState({agreementText: resp.Text});
        });
    }

    t(s){
        const {lang} = this.state;
        if(languages && languages[lang] && languages[lang][s]){
            return languages[lang][s]['other']
        } else if(lang !== defaultLanguage && languages && languages[defaultLanguage] && languages[defaultLanguage][s]){
            return languages[defaultLanguage][s]['other']
        } else {
            return s
        }
    }

    componentDidMount(){
        client.pollEvents((events) => {
            const newEvents = [...this.state.installEvents, ...events];
            const last = events.pop();// update last progress
            let p = this.state.installProgress;
            if(last.data.Progress){
                p = last.data.Progress;
            }
            this.setState({installEvents:newEvents, installProgress: p});
        }, () => {
            // This is call when it is finished
            const newEvents = [...this.state.installEvents, {data:{Progress:100, Message: "Server Restarted"}}];
            this.setState({
                installEvents:newEvents,
                serverRestarted: true,
                willReloadIn: 5
            });
            setTimeout(()=>{this.setState({willReloadIn: 4})}, 1000);
            setTimeout(()=>{this.setState({willReloadIn: 3})}, 2000);
            setTimeout(()=>{this.setState({willReloadIn: 2})}, 3000);
            setTimeout(()=>{this.setState({willReloadIn: 1})}, 4000);
            setTimeout(() => {
                window.location.reload()
            }, 5000);
        });
    }

    checkDbConfig(callback) {
        const {dbConfig} = this.props;
        const request = new InstallPerformCheckRequest();
        request.Name = "DB";
        request.Config = InstallInstallConfig.constructFromObject(dbConfig);
        this.setState({performingCheck: 'DB'});
        api.performInstallCheck(request).then(res => {
            const checkResult = res.Result;
            callback(checkResult);
        }).catch(reason => {
            const checkResult = InstallCheckResult.constructFromObject({Success:false, JsonResult: JSON.stringify({error: reason.message})});
            callback(checkResult)
        }).finally(() => {
            this.setState({performingCheck: 'DB'});
        })
    }

    checkLicenseConfig(callback) {
        const request = new InstallPerformCheckRequest();
        request.Name = "LICENSE";
        request.Config = InstallInstallConfig.constructFromObject({licenseString:this.props.licenseString});
        this.setState({performingCheck: 'LICENSE'});
        api.performInstallCheck(request).then(res => {
            const checkResult = res.Result;
            callback(checkResult);
        }).catch(reason => {
            const checkResult = InstallCheckResult.constructFromObject({Name: "LICENSE", Success:false, JsonResult: JSON.stringify({error: reason.message})});
            callback(checkResult);
        }).finally(() => {
            this.setState({performingCheck: null});
        })
    }

    reset = () => {
        this.setState({
            stepIndex: 0,
            finished: false
        });
    };

    handleNext = () => {
        const {stepIndex} = this.state;
        this.setState({
            stepIndex: stepIndex + 1,
            finished: stepIndex >= 4,
        });
    };

    handlePrev = () => {
        const {stepIndex} = this.state;
        if (stepIndex > 0) {
            this.setState({stepIndex: stepIndex - 1});
        }
    };

    renderStepActions(step, nextDisabled = false, leftAction = null) {
        const {stepIndex, tablesFoundConfirm, dbCheckSuccess} = this.state;
        const {handleSubmit, licenseRequired, invalid} = this.props;
        const stepOffset = licenseRequired ? 1 : 0;

        let nextAction;
        let nextInvalid;
        switch (stepIndex) {
            case 1 + stepOffset :
                nextAction = () => {
                    this.checkDbConfig((checkResult) => {
                        if (checkResult.Success){
                            const successData = JSON.parse(checkResult.JsonResult);
                            if(!successData || !successData.tablesFound || tablesFoundConfirm) {
                                this.handleNext();
                            }
                            this.setState({dbCheckError: null, dbCheckSuccess: JSON.parse(checkResult.JsonResult)});
                        } else {
                            this.setState({dbCheckError: JSON.parse(checkResult.JsonResult).error, dbCheckSuccess: null});
                        }
                    })
                };
                if(dbCheckSuccess && dbCheckSuccess.tablesFound && !tablesFoundConfirm){
                    nextInvalid = true;
                }
                break;
            case 3 + stepOffset :
                nextAction = () => {this.handleNext(); handleSubmit()};
                break;
            default:
                nextAction = this.handleNext;
                break;
        }

        return (
            <div style={{margin: '12px 0', display:'flex', alignItems: 'center'}}>
                {leftAction}
                <span style={{flex: 1}}/>
                <div>
                    {step > 0 && (
                        <FlatButton
                        label={this.t('stepper.button.back')}
                        disabled={stepIndex === 0}
                        onClick={this.handlePrev}
                        style={{marginRight: 5}}
                        />
                    )}
                    <RaisedButton
                        label={stepIndex === 3 + stepOffset? this.t('stepper.button.last') : this.t('stepper.button.next')}
                        primary={true}
                        onClick={nextAction}
                        disabled={nextDisabled || invalid || nextInvalid}
                    />
                </div>
            </div>
        );
    }

    render() {

        const {dbConnectionType, handleSubmit, installPerformed, installError, initialChecks, licenseRequired, licenseString,
            frontendPassword, frontendLogin, frontendRepeatPassword} = this.props;

        const {stepIndex, licenseAgreed, showAdvanced, installEvents, installProgress, serverRestarted, willReloadIn,
            agreementText, dbCheckError, dbCheckSuccess, licCheckFailed, tablesFoundConfirm, adminFoundOverride, lang} = this.state;

        const flexContainer = {
            display: 'flex',
            flexDirection: 'column',
        };
        const panelHeight = 580;

        const stepperStyles = {
            step: {
                marginBottom: -14,
                width: 256
            },
            label:{
                color:'white'
            },
            content: {
                position: 'absolute',
                top: 14,
                left: 256,
                right: 0,
                borderLeft: 0,
                padding: 24,
                maxHeight: panelHeight - 20,
                marginLeft: 0,
                lineHeight: '1.4em'
            },
            contentScroller : {
                height: panelHeight - 88,
                overflowY : 'auto'
            }
        };
        let leftAction, additionalStep;
        let stepOffset = 0;
        if(stepIndex === 0){
            leftAction = (
                <div>
                    <Checkbox checked={licenseAgreed} label={this.t('welcome.agreed')} style={{width: 300}} onCheck={() => {this.setState({licenseAgreed:!licenseAgreed})}}/>
                </div>
            );
        }
        if (licenseRequired) {
            stepOffset = 1;
            let licCheckPassed, nextAction;
            if(initialChecks && initialChecks.length){
                initialChecks.map(c => {
                    if (c.Name === "LICENSE" && c.Success) {
                        licCheckPassed = JSON.parse(c.JsonResult);
                        nextAction = this.handleNext.bind(this)
                    }
                })
            }
            if(!nextAction) {
                nextAction = () => {
                    this.checkLicenseConfig((result) => {
                        if (result.Success) {
                            this.setState({licCheckFailed: false});
                            this.handleNext();
                        } else {
                            this.setState({licCheckFailed: true});
                        }
                    });
                };
            }
            additionalStep = (
                <Step key={"license"} style={stepperStyles.step}>
                    <StepLabel style={stepIndex >= 1 ? stepperStyles.label : {}}>{this.t('license.stepLabel')}</StepLabel>
                    <StepContent style={stepperStyles.content}>
                        <div style={stepperStyles.contentScroller}>
                            <h3>{this.t('license.title')}</h3>
                            {licCheckPassed &&
                                <div style={{padding:'20px 0', color:'#388E3C', fontSize:14}}>
                                    {this.t('license.success')}
                                    <br/>
                                    {this.t('license.details').replace('%count', licCheckPassed.users).replace('%expiration', new Date(licCheckPassed.expireTime*1000).toISOString())}
                                </div>
                            }
                            {licCheckFailed &&
                                <div style={{color: '#E53935', paddingTop: 10, fontWeight: 500}}>{this.t('license.failed')}</div>
                            }
                            {!licCheckPassed &&
                                <div>
                                    {this.t('license.required')} <a href={"mailto:services@pydio.com"}>services@pydio.com</a>.
                                    <Field name="licenseString" component={renderTextField} floatingLabel={this.t('license.fieldLabel')} label={this.t('license.fieldLegend')} />
                                </div>
                            }
                        </div>
                        <div style={{margin: '12px 0', display:'flex', alignItems: 'center'}}>
                            <span style={{flex: 1}}/>
                            <div>
                                <FlatButton label="Back" onClick={this.handlePrev.bind(this)} style={{marginRight: 5}} />
                                <RaisedButton label={'Next'} primary={true} onClick={nextAction} disabled={(!licCheckPassed && !licenseString)}/>
                            </div>
                        </div>
                    </StepContent>
                </Step>
            );
        }

        const steps = [];
        steps.push(
            <Step key={steps.length-1} style={stepperStyles.step}>
                <StepLabel style={stepperStyles.label}>{this.t('welcome.stepLabel')}</StepLabel>
                <StepContent style={stepperStyles.content}>
                    <div style={stepperStyles.contentScroller}>
                        <h3>{this.t('welcome.title')}</h3>
                        <p>{this.t('welcome.legend')}</p>
                        <pre style={{height: 350, border: '1px solid #CFD8DC', borderRadius: 2, backgroundColor: '#ECEFF1', padding: 10, overflowY:'scroll', lineHeight:'1.4em'}}>
                            {agreementText}
                        </pre>
                    </div>
                    {this.renderStepActions(0, !licenseAgreed, leftAction)}
                </StepContent>
            </Step>);

        if(additionalStep){
            steps.push(additionalStep);
        }

        const tablesFound = dbCheckSuccess && dbCheckSuccess.tablesFound;
        steps.push(
            <Step key={steps.length-1} style={stepperStyles.step}>
                <StepLabel style={stepIndex >= 1 + stepOffset ? stepperStyles.label : {}}>{this.t('database.stepLabel')}</StepLabel>
                <StepContent style={stepperStyles.content}>
                    <div style={stepperStyles.contentScroller}>
                        <h3>{this.t('database.title')}</h3>
                        {this.t('database.legend')}
                        <b>{this.t('database.legend.bold')}</b>
                        {dbCheckError &&
                            <div style={{color: '#E53935', paddingTop: 10, fontWeight: 500}}>{dbCheckError}</div>
                        }
                        <div style={flexContainer}>
                            <Field name="dbConnectionType" component={renderSelectField}>
                                <MenuItem value="tcp" primaryText={this.t('form.dbConnectionType.tcp')} />
                                <MenuItem value="socket" primaryText={this.t('form.dbConnectionType.socket')} />
                                <MenuItem value="manual" primaryText={this.t('form.dbConnectionType.manual')} />
                            </Field>

                            {dbConnectionType === "tcp" && (
                                <div style={flexContainer}>
                                    <div style={{display:'flex'}}>
                                        <div style={{flex: 1, marginRight: 2}}><Field name="dbTCPHostname" component={renderTextField} floatingLabel={this.t('form.dbTCPHostname.label')} label={this.t('form.dbTCPHostname.legend')} /></div>
                                        <div style={{flex: 1, marginLeft: 2}}><Field name="dbTCPPort" component={renderTextField} floatingLabel={this.t('form.dbTCPPort.label')} label={this.t('form.dbTCPPort.legend')} /></div>
                                    </div>
                                    <Field name="dbTCPName" component={renderTextField} floatingLabel={this.t('form.dbName.label')} label={this.t('form.dbName.legend')} />
                                    <div style={{display:'flex'}}>
                                        <div style={{flex: 1, marginRight: 2}}><Field name="dbTCPUser" component={renderTextField} floatingLabel={this.t('form.dbUser.label')} label={this.t('form.dbUser.legend')} /></div>
                                        <div style={{flex: 1, marginLeft: 2}}><Field name="dbTCPPassword" component={renderPassField} floatingLabel={this.t('form.dbPassword.label')} label={this.t('form.dbPassword.legend')} /></div>
                                    </div>
                                </div>
                            )}

                            {dbConnectionType === "socket" && (
                                <div style={flexContainer}>
                                    <Field name="dbSocketFile" component={renderTextField} floatingLabel={this.t('form.dbSocketFile.label')} label={this.t('form.dbSocketFile.legend')} defaultValue="/tmp/mysql.sock" />
                                    <Field name="dbSocketName" component={renderTextField} floatingLabel={this.t('form.dbName.label')} label={this.t('form.dbName.legend')} defaultValue="pydio" />
                                    <div style={{display:'flex'}}>
                                        <div style={{flex: 1, marginRight: 2}}><Field name="dbSocketUser" component={renderTextField} floatingLabel={this.t('form.dbUser.label')} label={this.t('form.dbUser.legend')} /></div>
                                        <div style={{flex: 1, marginLeft: 2}}><Field name="dbSocketPassword" component={renderTextField} floatingLabel={this.t('form.dbPassword.label')} label={this.t('form.dbPassword.legend')} /></div>
                                    </div>
                                </div>
                            )}

                            {dbConnectionType === "manual" && (
                                <div style={flexContainer}>
                                    <Field name="dbManualDSN" component={renderTextField} floatingLabel={this.t('form.dbManualDSN.label')} label={this.t('form.dbManualDSN.legend')} />
                                </div>
                            )}
                        </div>
                        {tablesFound &&
                            <div style={{marginTop: 40, display: 'flex'}}>
                                <div>
                                    <Checkbox checked={tablesFoundConfirm} onCheck={(e,v) => {this.setState({tablesFoundConfirm: v})}}/>
                                </div>
                                <div style={{color:'#E65100', flex: 1}}>
                                    {this.t('database.installDetected')}
                                    <a style={{fontWeight: 500, cursor: 'pointer'}} onClick={(e) => {e.preventDefault(); e.stopPropagation(); this.setState({dbCheckSuccess: null, tablesFoundConfirm: null})}}>{this.t('database.installDetected.retry')}</a>.
                                </div>
                            </div>
                        }
                    </div>
                    {this.renderStepActions(1 + stepOffset)}
                </StepContent>
            </Step>
        );

        const adminFound = dbCheckSuccess && dbCheckSuccess.adminFound;
        steps.push(
            <Step key={steps.length-1} style={stepperStyles.step}>
                <StepLabel style={stepIndex >= 2 + stepOffset ? stepperStyles.label : {}}>{this.t('admin.stepLabel')}</StepLabel>
                <StepContent style={stepperStyles.content}>
                    <div style={stepperStyles.contentScroller}>
                        <h3>{this.t('admin.title')}</h3>
                        {this.t('admin.legend')}

                        <div style={flexContainer}>
                            <Field name="frontendApplicationTitle" component={renderTextField} floatingLabel={this.t('form.frontendApplicationTitle.label')} label={this.t('form.frontendApplicationTitle.legend')} />
                            <Field name="frontendDefaultLanguage" component={renderSelectField} label={this.t('form.frontendDefaultLanguage.label')}>
                                <MenuItem value={"en"} primaryText={"English"}/>
                                <MenuItem value={"fr"} primaryText={"Français"}/>
                                <MenuItem value={"de"} primaryText={"Deutsch"}/>
                                <MenuItem value={"es"} primaryText={"Español"}/>
                                <MenuItem value={"it"} primaryText={"Italiano"}/>
                                <MenuItem value={"pt"} primaryText={"Português"}/>
                            </Field>
                            {adminFound &&
                            <div style={{marginTop: 10}}>
                                <Checkbox checked={adminFoundOverride} onCheck={(e,v)=>{this.setState({adminFoundOverride: v})}} label={this.t('admin.adminFound')}/>
                            </div>
                            }
                            {(!adminFound || adminFoundOverride) &&
                            <div>
                                <Field name="frontendLogin" component={renderTextField} floatingLabel={this.t('form.frontendLogin.label')} label={this.t('form.frontendLogin.legend')} />
                                <div style={{display:'flex'}}>
                                    <div style={{flex: 1, marginRight: 5}}>
                                        <Field name="frontendPassword" component={renderPassField} floatingLabel={this.t('form.frontendPassword.label')} label={this.t('form.frontendPassword.legend')} />
                                    </div>
                                    <div style={{flex: 1, marginLeft: 5}}>
                                        <Field name="frontendRepeatPassword" component={renderPassField} floatingLabel={this.t('form.frontendRepeatPassword.label')} label={this.t('form.frontendRepeatPassword.legend')} />
                                    </div>
                                </div>
                            </div>
                            }
                        </div>
                    </div>
                    {this.renderStepActions(3 + stepOffset, !(adminFound || (frontendLogin && frontendPassword && frontendRepeatPassword)))}
                </StepContent>
            </Step>
        );

        steps.push(
            <Step key={steps.length-1} style={stepperStyles.step}>
                <StepLabel style={stepIndex >= 3 + stepOffset ? stepperStyles.label : {}}>{this.t('advanced.stepLabel')}</StepLabel>
                <StepContent style={stepperStyles.content}>
                    <div style={stepperStyles.contentScroller}>
                        <h3>{this.t('advanced.title')}</h3>
                        {this.t('advanced.legend')}

                        <div style={{display:'flex', alignItems:'center', height: 40, cursor:'pointer'}} onClick={() => {this.setState({showAdvanced:!showAdvanced})}}>
                            <div style={{flex: 1, fontSize: 14}}>{this.t('advanced.toggle')}</div>
                            <FontIcon className={showAdvanced?"mdi mdi-chevron-down":"mdi mdi-chevron-right"}/>
                        </div>
                        {showAdvanced &&
                        <div style={flexContainer}>
                            <div style={{marginTop: 10}}>
                                {this.t('advanced.default.datasource')}
                            </div>
                            <div>
                                <Field name="dsFolder" component={renderTextField} floatingLabel={this.t('form.dsFolder.label')} label={this.t('form.dsFolder.legend')} />
                            </div>
                        </div>
                        }
                    </div>
                    {this.renderStepActions(3 + stepOffset)}
                </StepContent>
            </Step>
        );

        const eventsLength = installEvents.length - 1;
        steps.push(
            <Step key={steps.length-1} style={stepperStyles.step}>
                <StepLabel style={stepIndex >= 4 + stepOffset ? stepperStyles.label : {}}>{this.t('apply.stepLabel')}</StepLabel>
                <StepContent style={stepperStyles.content}>
                    <div style={stepperStyles.contentScroller}>
                        <h3>{this.t('apply.title')}</h3>
                        <div style={{padding: '20px 0'}}>
                            <LinearProgress min={0} max={100} value={installProgress} style={{width: '100%'}} mode={"determinate"}/>
                        </div>
                        <div style={{...flexContainer, paddingRight: 20, paddingTop: 10, fontSize: 14, paddingBottom: 20}}>
                            {installEvents.map((e,i) => {
                                let icon = <FontIcon className={"mdi mdi-check"}/>;
                                if(e.data.Message.indexOf('...') > -1 ) {
                                    if(i < eventsLength) return null;// if it's not the last, the next message will replace it
                                    icon = <CircularProgress size={20} thickness={2} color={"rgba(0, 0, 0, 0.87)"}/>;
                                }
                                return <div key={i} style={{display:'flex', alignItems:'center', height: 40}}><div style={{flex: 1}}>{e.data.Message}</div>{icon}</div>
                            })}
                        </div>
                        {installPerformed && !serverRestarted &&
                        <div>
                            {this.t('apply.success')}
                        </div>
                        }
                        {installPerformed && serverRestarted &&
                        <div>
                            {this.t('apply.success.restarted')}
                        </div>
                        }
                        {installError &&
                        <div>
                            {this.t('apply.error')}<br/>
                            {this.t('apply.error.detail')}<br/>
                            {installError}
                        </div>
                        }
                    </div>
                    {installPerformed && serverRestarted &&
                    <div style={{margin: '12px 0', display:'flex', alignItems: 'center'}}>
                        <span style={{flex: 1}}/>
                        <div>
                            <RaisedButton
                                label={this.t('stepper.button.reload')}
                                secondary={true}
                                onClick={() => {window.location.reload()}}
                            />
                        </div>
                    </div>
                    }
                </StepContent>
            </Step>
        );

        return (
            <Paper zDepth={2} style={{width: 800, minHeight: panelHeight, margin: 'auto', position:'relative', backgroundColor:'rgba(255,255,255,0.96)'}}>
                <div style={{width: 256, height: panelHeight, backgroundColor: '#607D8B', fontSize: 13, display:'flex', flexDirection:'column'}}>
                    <div style={{backgroundImage:'url(res/css/PydioLogo250.png)', backgroundSize:'90%',
                        backgroundRepeat: 'no-repeat', backgroundPosition:'center center', width: 256, height: 100}}></div>
                    <form onSubmit={handleSubmit} autoComplete={"off"} style={{flex: 1}}>
                        <Stepper activeStep={stepIndex} orientation="vertical">
                            {steps}
                        </Stepper>
                    </form>
                    <div style={{height: 56, padding:'0px 120px 0px 16px'}}>
                        <SelectField value={lang} onChange={(e,i,v)=>{this.setState({lang: v})}} fullWidth={true} labelStyle={{color: 'rgba(255,255,255,.87)'}} underlineStyle={{display:'none'}}>
                            <MenuItem value={"en-us"} primaryText={"English"}/>
                            <MenuItem value={"fr"} primaryText={"Français"}/>
                            <MenuItem value={"de"} primaryText={"Deutsch"}/>
                            <MenuItem value={"es"} primaryText={"Español"}/>
                            <MenuItem value={"it"} primaryText={"Italiano"}/>
                            <MenuItem value={"pt"} primaryText={"Português"}/>
                        </SelectField>
                    </div>
                </div>
            </Paper>
    );
  }
}

// The order of the decoration does not matter.

// Decorate with redux-form
InstallForm = reduxForm({
    form: 'install',
    validate:values => {
        const errors = {};
        if(values['frontendLogin']){
            const v = values['frontendLogin'];
            const re = new RegExp(/^[0-9A-Z\-_.:\+]+$/i);
            if(!(validator.isEmail(v) || re.test(v)) || !validator.isLowercase(v)){
                errors['frontendLogin'] = 'Please use lowercase alphanumeric characters or valid emails for logins';
            }
        }
        if(values['frontendPassword'] && values['frontendRepeatPassword'] && values['frontendRepeatPassword'] !== values['frontendPassword']) {
            errors['frontendRepeatPassword'] = 'Passwords differ!'
        }
        //console.log(errors);
        return errors;
    }
})(InstallForm);

// Decorate with connect to read form values
const selector = formValueSelector('install'); // <-- same as form name
InstallForm = connect(state => {
    const dbConnectionType = selector(state, 'dbConnectionType');
    const dbConfig = selector(state, 'dbConnectionType', 'dbManualDSN', 'dbSocketFile', 'dbSocketName', 'dbSocketUser', 'dbTCPHostname', 'dbTCPName', 'dbTCPPort', 'dbTCPUser', 'dbTCPPassword', 'dbSocketPassword');
    const initialChecks = selector(state, 'CheckResults');
    const licenseRequired = selector(state, 'licenseRequired');
    const licenseString = selector(state, 'licenseString');
    const frontendLogin = selector(state, 'frontendLogin');
    const frontendPassword = selector(state, 'frontendPassword');
    const frontendRepeatPassword = selector(state, 'frontendRepeatPassword');


    // Make a request to retrieve those values
    return {
        initialValues: state.config.data,
        dbConnectionType: dbConnectionType,
        dbConfig: dbConfig,
        initialChecks: initialChecks,
        licenseRequired,
        licenseString, frontendPassword, frontendLogin, frontendRepeatPassword
    }
}, { load: loadConfig } )(InstallForm);


export default InstallForm
