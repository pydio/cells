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
        const {stepIndex} = this.state;
        const {handleSubmit, licenseRequired, invalid} = this.props;
        const stepOffset = licenseRequired ? 1 : 0;

        let nextAction;
        switch (stepIndex) {
            case 1 + stepOffset :
                nextAction = () => {
                    this.checkDbConfig((checkResult) => {
                        if (checkResult.Success){
                            this.handleNext();
                            this.setState({dbCheckError: null});
                        } else {
                            this.setState({dbCheckError: JSON.parse(checkResult.JsonResult).error});
                        }
                    })
                };
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
                        label="Back"
                        disabled={stepIndex === 0}
                        onClick={this.handlePrev}
                        style={{marginRight: 5}}
                        />
                    )}
                    <RaisedButton
                        label={stepIndex === 3 + stepOffset? 'Install Now' : 'Next'}
                        primary={true}
                        onClick={nextAction}
                        disabled={nextDisabled || invalid}
                    />
                </div>
            </div>
        );
    }

    render() {

        const {dbConnectionType, handleSubmit, installPerformed, installError, initialChecks, licenseRequired, licenseString, frontendPassword} = this.props;
        const {stepIndex, licenseAgreed, showAdvanced, installEvents, installProgress, serverRestarted, willReloadIn, agreementText, dbCheckError, licCheckFailed} = this.state;

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
                    <Checkbox checked={licenseAgreed} label={"I agree with these terms"} style={{width: 300}} onCheck={() => {this.setState({licenseAgreed:!licenseAgreed})}}/>
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
                    <StepLabel style={stepIndex >= 1 ? stepperStyles.label : {}}>Enterprise License</StepLabel>
                    <StepContent style={stepperStyles.content}>
                        <div style={stepperStyles.contentScroller}>
                            <h3>Pydio Cells Enterprise License</h3>
                            {licCheckPassed &&
                                <div style={{padding:'20px 0', color:'#388E3C', fontSize:14}}>License file was successfully detected.
                                    <br/>This installation is valid for {licCheckPassed.users} users until {new Date(licCheckPassed.expireTime*1000).toISOString()}.
                                    </div>
                            }
                            {licCheckFailed &&
                                <div style={{color: '#E53935', paddingTop: 10, fontWeight: 500}}>Error while trying to verify this license string. Please contact the support.</div>
                            }
                            {!licCheckPassed &&
                                <div>
                                    A valid license is required to run this installation.
                                    <Field name="licenseString" component={renderTextField} floatingLabel="License String" label="Please copy/paste the license string provided to you." />
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
                <StepLabel style={stepperStyles.label}>Terms of Use </StepLabel>
                <StepContent style={stepperStyles.content}>
                    <div style={stepperStyles.contentScroller}>
                        <h3>Welcome to Pydio Cells Installation Wizard</h3>
                        <p>This will install all services on the current server. Please agree with the terms of the license below before starting</p>
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

        steps.push(
            <Step key={steps.length-1} style={stepperStyles.step}>
                <StepLabel style={stepIndex >= 1 + stepOffset ? stepperStyles.label : {}}>Database connection</StepLabel>
                <StepContent style={stepperStyles.content}>
                    <div style={stepperStyles.contentScroller}>
                        <h3>Database Configuration</h3>
                        Pydio requires at least one SQL storage for configuration and data indexation.
                        Configure here the connection to your MySQL/MariaDB server. Please make sure that your database is running <b>MySQL version 5.6 or higher</b>.
                        {dbCheckError &&
                        <div style={{color: '#E53935', paddingTop: 10, fontWeight: 500}}>{dbCheckError}</div>
                        }
                        <div style={flexContainer}>
                            <Field name="dbConnectionType" component={renderSelectField}>
                                <MenuItem value="tcp" primaryText="TCP" />
                                <MenuItem value="socket" primaryText="Socket" />
                                <MenuItem value="manual" primaryText="Manual" />
                            </Field>

                            {dbConnectionType === "tcp" && (
                                <div style={flexContainer}>
                                    <div style={{display:'flex'}}>
                                        <div style={{flex: 1, marginRight: 2}}><Field name="dbTCPHostname" component={renderTextField} floatingLabel="Host Name" label="Server where mysql is running" /></div>
                                        <div style={{flex: 1, marginLeft: 2}}><Field name="dbTCPPort" component={renderTextField} floatingLabel="Port" label="Port to connect to mysql" /></div>
                                    </div>
                                    <Field name="dbTCPName" component={renderTextField} floatingLabel="Database Name" label="Database to use (created it if does not exist)" />
                                    <div style={{display:'flex'}}>
                                        <div style={{flex: 1, marginRight: 2}}><Field name="dbTCPUser" component={renderTextField} floatingLabel="Database User" label="Leave blank if not required" /></div>
                                        <div style={{flex: 1, marginLeft: 2}}><Field name="dbTCPPassword" component={renderPassField} floatingLabel="Database Password" label="Leave blank if not required" /></div>
                                    </div>
                                </div>
                            )}

                            {dbConnectionType === "socket" && (
                                <div style={flexContainer}>
                                    <Field name="dbSocketFile" component={renderTextField} floatingLabel="Socket" label="Enter the location of the socket file to use to connect" defaultValue="/tmp/mysql.sock" />
                                    <Field name="dbSocketName" component={renderTextField} floatingLabel="Database Name" label="Enter the name of a database to use - it will be created if it doesn't already exist" defaultValue="pydio" />
                                    <div style={{display:'flex'}}>
                                        <div style={{flex: 1, marginRight: 2}}><Field name="dbSocketUser" component={renderTextField} floatingLabel="Database User" label="Leave blank if not required" /></div>
                                        <div style={{flex: 1, marginLeft: 2}}><Field name="dbSocketPassword" component={renderTextField} floatingLabel="Database Password" label="Leave blank if not required" /></div>
                                    </div>
                                </div>
                            )}

                            {dbConnectionType === "manual" && (
                                <div style={flexContainer}>
                                    <Field name="dbManualDSN" component={renderTextField} floatingLabel="DSN" label="Use golang style DSN to describe the DB connection" />
                                </div>
                            )}
                        </div>
                    </div>
                    {this.renderStepActions(1 + stepOffset)}
                </StepContent>
            </Step>
        );

        steps.push(
            <Step key={steps.length-1} style={stepperStyles.step}>
                <StepLabel style={stepIndex >= 2 + stepOffset ? stepperStyles.label : {}}>Admin User</StepLabel>
                <StepContent style={stepperStyles.content}>
                    <div style={stepperStyles.contentScroller}>
                        <h3>Admin user and frontend defaults</h3>
                        Provide credentials for the administrative user. Leave fields empty if you are deploying on top of an existing installation.

                        <div style={flexContainer}>
                            <Field name="frontendApplicationTitle" component={renderTextField} floatingLabel="Application Title" label="Main title of your installation." />
                            <Field name="frontendDefaultLanguage" component={renderSelectField} label="Default Language (set by default for all users).">
                                <MenuItem value={"en"} primaryText={"English"}/>
                                <MenuItem value={"fr"} primaryText={"Français"}/>
                                <MenuItem value={"de"} primaryText={"Deutsch"}/>
                                <MenuItem value={"es"} primaryText={"Español"}/>
                                <MenuItem value={"it"} primaryText={"Italiano"}/>
                                <MenuItem value={"pt"} primaryText={"Português"}/>
                            </Field>
                            <Field name="frontendLogin" component={renderTextField} floatingLabel="Login of the admin user" label="Skip this if an admin is already created in the database." />
                            <Field name="frontendPassword" component={renderPassField} floatingLabel="Password of the admin user" label="Skip this if an admin is already created in the database." />
                            {frontendPassword &&
                                <Field name="frontendRepeatPassword" component={renderPassField} floatingLabel="Please confirm password" label="Type again the admin password" />
                            }
                        </div>
                    </div>
                    {this.renderStepActions(3 + stepOffset)}
                </StepContent>
            </Step>
        );

        steps.push(
            <Step key={steps.length-1} style={stepperStyles.step}>
                <StepLabel style={stepIndex >= 3 + stepOffset ? stepperStyles.label : {}}>Advanced Settings</StepLabel>
                <StepContent style={stepperStyles.content}>
                    <div style={stepperStyles.contentScroller}>
                        <h3>Advanced Settings</h3>
                        Pydio Cells services will be deployed on this machine. You may review some advanced settings below for fine-tuning your configuration.

                        <div style={{display:'flex', alignItems:'center', height: 40, cursor:'pointer'}} onClick={() => {this.setState({showAdvanced:!showAdvanced})}}>
                            <div style={{flex: 1, fontSize: 14}}>Show Advanced Settings</div>
                            <FontIcon className={showAdvanced?"mdi mdi-chevron-down":"mdi mdi-chevron-right"}/>
                        </div>
                        {showAdvanced &&
                        <div style={flexContainer}>
                            <div style={{marginTop: 10}}>
                                A default data source to store users personal data and cells data is created at startup. You can create other datasources later on.
                            </div>
                            <div>
                                <Field name="dsFolder" component={renderTextField} floatingLabel="Path of the default datasource" label="Use an absolute path on the server" />
                            </div>
                            <div style={{marginTop: 20}}>
                                Services are authenticating using OpenIDConnect protocol. This keypair will be added to the frontend, it is not used outside of the application.
                                You should leave the default value unless you are reinstalling on a top of a running frontend.
                            </div>
                            <div style={{display:'flex'}}>
                                <div style={{flex: 1, marginRight: 2}}><Field name="externalDexID" component={renderTextField} floatingLabel="OIDC Client ID" label="Use default if not sure" /></div>
                                <div style={{flex: 1, marginLeft: 2}}><Field name="externalDexSecret" component={renderTextField} floatingLabel="OIDC Client Secret" label="Leave blank if not required" /></div>
                            </div>
                            <div style={{marginTop: 20}}>
                                Services will detect available ports automatically and this is hidden by the unique http access. You may choose ports that suits your security
                                policies or just leave default values.
                            </div>
                            <div style={{display:'flex'}}>
                                <div style={{flex: 1, marginRight: 2}}><Field name="externalDex" component={renderTextField} floatingLabel="OIDC" label="OIDC" /></div>
                                <div style={{flex: 1, marginLeft: 2}}><Field name="externalMicro" component={renderTextField} floatingLabel="API" label="API" /></div>
                                <div style={{flex: 1, marginLeft: 2}}><Field name="externalGateway" component={renderTextField} floatingLabel="Data" label="Data" /></div>
                                <div style={{flex: 1, marginLeft: 2}}><Field name="externalWebsocket" component={renderTextField} floatingLabel="WebSocket" label="Websocket" /></div>
                                <div style={{flex: 1, marginLeft: 2}}><Field name="externalDAV" component={renderTextField} floatingLabel="DAV" label="DAV" /></div>
                                <div style={{flex: 1, marginLeft: 2}}><Field name="externalWOPI" component={renderTextField} floatingLabel="WOPI" label="WOPI" /></div>
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
                <StepLabel style={stepIndex >= 4 + stepOffset ? stepperStyles.label : {}}>Apply Installation</StepLabel>
                <StepContent style={stepperStyles.content}>
                    <div style={stepperStyles.contentScroller}>
                        <h3>Please wait while installing Pydio ...</h3>
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
                            Install was succesful and services are now starting, this installer will reload the page when services are started.
                            <br/><b>Please note</b> that if you have configured the server with a self-signed certificate, browser security will prevent automatic reloading.
                            In that case, please wait and manually <a style={{textDecoration:'underline', cursor:'pointer'}} onClick={()=>{window.location.reload()}}>reload the page</a>.
                        </div>
                        }
                        {installPerformed && serverRestarted &&
                        <div>
                            Install was succesful and services are now started, please reload the page now (it will be automatically reloaded in {willReloadIn}s)
                        </div>
                        }
                        {installError &&
                        <div>
                            There was an error while performing installation ! Please check your configuration <br/>
                            Error was : {installError}
                        </div>
                        }
                    </div>
                    {installPerformed && serverRestarted &&
                    <div style={{margin: '12px 0', display:'flex', alignItems: 'center'}}>
                        <span style={{flex: 1}}/>
                        <div>
                            <RaisedButton
                                label={'Reload'}
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
                <div style={{width: 256, height: panelHeight, backgroundColor: '#607D8B', fontSize: 13}}>
                    <div style={{backgroundImage:'url(res/css/PydioLogo250.png)', backgroundSize:'90%',
                        backgroundRepeat: 'no-repeat', backgroundPosition:'center center', width: 256, height: 100}}></div>
                    <form onSubmit={handleSubmit} autoComplete={"off"}>
                        <Stepper activeStep={stepIndex} orientation="vertical">
                            {steps}
                        </Stepper>
                    </form>
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
        if(values['frontendPassword'] && values['frontendRepeatPassword'] !== values['frontendPassword']) {
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
    const frontendPassword = selector(state, 'frontendPassword');


    // Make a request to retrieve those values
    return {
        initialValues: state.config.data,
        dbConnectionType: dbConnectionType,
        dbConfig: dbConfig,
        initialChecks: initialChecks,
        licenseRequired,
        licenseString, frontendPassword
    }
}, { load: loadConfig } )(InstallForm);


export default InstallForm
