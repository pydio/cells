import React from 'react';
import {Paper, TextField, FontIcon, IconButton, RadioButtonGroup, Checkbox, SelectField, MenuItem,
    RaisedButton, FlatButton, Step, Stepper, StepLabel, StepContent, LinearProgress, CircularProgress} from 'material-ui'
import {connect} from 'react-redux';
import {Field, reduxForm, formValueSelector, change} from 'redux-form';
import Client from './client';
import validator from 'validator';
import InstallInstallConfig from './gen/model/InstallInstallConfig';
import InstallServiceApi from './gen/api/InstallServiceApi';
import InstallCheckResult from './gen/model/InstallCheckResult';
import InstallPerformCheckRequest from './gen/model/InstallPerformCheckRequest';
import { load as loadConfig } from './config'
import languages from './gen/languages'
const defaultLanguage = 'en-us';
import Url from 'url-parse'

const client = new Client();
const api = new InstallServiceApi(client);

const supportedLanguages = [
    <MenuItem key={"en-us"} value={"en-us"} primaryText={"English"}/>,
    <MenuItem key={"fr"} value={"fr"} primaryText={"Français"}/>,
    <MenuItem key={"de"} value={"de"} primaryText={"Deutsch"}/>,
    <MenuItem key={"es-es"} value={"es-es"} primaryText={"Español"}/>,
    <MenuItem key={"it"} value={"it"} primaryText={"Italiano"}/>,
    <MenuItem key={"pt-br"} value={"pt-br"} primaryText={"Português do Brasil"}/>
]

const noWrap = {
    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
};
const hintColor='rgba(0,0,0, 0.33)';
const panelBG = 'rgba(225, 234, 242, 0.98)'
const v2Block = {
    backgroundColor:'#dde3ea',
    borderRadius:'3px 3px 0 0',
    height:52,
    marginTop: 8,
    boxSizing: 'border-box'
};
const underline = {
    idle: {borderBottom:'1px solid rgb(193 199 206)'},
    focus: {borderBottom:'2px solid var(--md-sys-color-primary)'}
};

const fieldStyles = {
    textFieldV2: {
        style: {...v2Block},
        inputStyle: {position: 'absolute', height: 30, marginTop: 0, bottom: 2, paddingLeft: 8, paddingRight: 8},
        hintStyle: {bottom: 4, paddingLeft: 7, color: hintColor, ...noWrap, width: '100%'},
        underlineStyle: {opacity: 1, bottom: 0, ...underline.idle},
        underlineFocusStyle: {opacity: 1, borderRadius: 0, bottom: 0, ...underline.focus},
        floatingLabelFixed: true,
        floatingLabelStyle: {top: 26, left: 8, width: '127%', ...noWrap},
        floatingLabelShrinkStyle: {top: 26, left: 8},
        errorStyle: {
            position: 'absolute', bottom: 8, right: 8,
            maxWidth: '60%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'
        }
    },
    selectFieldV2: {
        style: {...v2Block, padding: 8, paddingRight: 0, overflow: 'hidden'},
        menuStyle: {marginTop: -6},
        hintStyle: {paddingLeft: 0, marginBottom: -7, paddingRight: 56, color: hintColor, ...noWrap, width: '100%'},
        underlineStyle: {opacity: 1, bottom: 0, left: 0, right: 0, ...underline.idle},
        underlineFocusStyle: {opacity: 1, borderRadius: 0, bottom: 0, ...underline.focus},
        floatingLabelFixed: true,
        floatingLabelStyle: {top: 26, left: 8, width: '127%', ...noWrap},
        floatingLabelShrinkStyle: {top: 26, left: 8},
        dropDownMenuProps: {
            iconStyle: {right: 0, fill: '#9e9e9e'},
            menuStyle: {background: 'white'}
        }
    },
    textareaFieldV2: {
        rows: 15,
        rowsMax: 15,
        style: {height: 388},
        inputStyle: {
            backgroundColor: v2Block.backgroundColor,
            height: 380,
            borderRadius: v2Block.borderRadius,
            marginTop: 8,
            paddingLeft: 8
        },
        textareaStyle: {marginTop: 24, marginBottom: 0},
        floatingLabelFixed: true,
        floatingLabelStyle: {top: 35, left: 6, width: '127%', ...noWrap},
        floatingLabelShrinkStyle: {top: 35, left: 6},
        hintStyle: {paddingLeft: 7, color: hintColor, ...noWrap, width: '100%', top: 12, bottom: 'inherit'},
        underlineStyle: {opacity: 1, bottom: 0, ...underline.idle},
        underlineFocusStyle: {opacity: 1, bottom: 0, borderRadius: '0px 0px 3px 3px', ...underline.focus},
        errorStyle: {position: 'absolute', bottom: 8, right: 8}
    },

};

const renderTextField = ({input, label, floatingLabel, meta: {touched, error}, ...custom}) => {
    if (custom && custom.multiLine) {
        return (
            <TextField
                hintText={label}
                floatingLabelText={floatingLabel}
                floatingLabelFixed={true}
                errorText={touched && error}
                fullWidth={true}
                {...fieldStyles.textareaFieldV2}
                {...input}
                {...custom}
            />
        )
    } else {
        return (
            <TextField
                hintText={label}
                floatingLabelText={floatingLabel}
                floatingLabelFixed={true}
                errorText={touched && error}
                fullWidth={true}
                {...fieldStyles.textFieldV2}
                {...input}
                {...custom}
            />
        )
    }
};

const renderPassField = ({input, label, floatingLabel, meta: {touched, error}, ...custom}) => (
  <TextField
    hintText={label}
    floatingLabelText={floatingLabel}
    floatingLabelFixed={true}
    errorText={error}
    fullWidth={true}
    type={"password"}
    autoComplete={"new-password"}
    {...fieldStyles.textFieldV2}
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

const renderInvertCheckbox = ({input, label}) => (
  <Checkbox
    label={label}
    labelStyle={{lineHeight: '15px'}}
    checked={input.value ? false : true}
    onCheck={(e, v) => {
        input.onChange(!v)
    }}
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
        {...fieldStyles.selectFieldV2}
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
        prevConnectionType: null,
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
            if(values.config && values.config.dbUseDefaults) {
                this.setState({dbUseDefaultsToggle: true})
            }
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

    componentDidUpdate(prevProps) {
        const { dbConnectionType, change } = this.props;
        if (prevProps.dbConnectionType === dbConnectionType) {
            return
        }
        this.setState({prevDbConnectionType: dbConnectionType});
        // Adjust fields based on dbConnectionType
        switch (dbConnectionType) {
            case 'tcp':
            case 'mysql_tcp':
                change('dbTCPPort', '3306');
                break;
            case 'pg_tcp':
                change('dbTCPPort', '5432');
                break;
            case 'sqlite':
                change('dbSocketFile', '/var/cells/cells.db');
                break;
            case 'mysql_socket':
                change('dbSocketFile', '/tmp/mysql.sock');
                break;
            case 'pg_socket':
                change('dbSocketFile', '/var/run/postgresql');
                break;
            default:
                break;
        }    }

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
            this.setState({performingCheck: null});
        })
    }

    checkMongoDSN(callback) {
        const {DocumentsDSN} = this.props;
        const request = new InstallPerformCheckRequest();
        request.Name = "MONGO";
        request.Config = InstallInstallConfig.constructFromObject({DocumentsDSN});
        this.setState({performingCheck: 'MONGO'});
        api.performInstallCheck(request).then(res => {
            const checkResult = res.Result;
            callback(checkResult);
        }).catch(reason => {
            const checkResult = InstallCheckResult.constructFromObject({Name: 'MONGO', Success:false, JsonResult: JSON.stringify({error: reason.message})});
            callback(checkResult)
        }).finally(() => {
            this.setState({performingCheck: null});
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

    checkS3Config(callback, keys = false){
        const {s3Config} = this.props;
        const request = new InstallPerformCheckRequest();
        request.Name = keys ? "S3_KEYS" : "S3_BUCKETS";
        request.Config = InstallInstallConfig.constructFromObject(s3Config);
        this.setState({performingCheck: 'S3_KEYS', s3CheckKeysSuccess: null, s3CheckKeysError: null, s3BucketsPrefix: ''});
        api.performInstallCheck(request).then(res => {
            const checkResult = res.Result;
            callback(checkResult);
        }).catch(reason => {
            const checkResult = InstallCheckResult.constructFromObject({Name: "S3_KEYS", Success:false, JsonResult: JSON.stringify({error: reason.message})});
            callback(checkResult);
        }).finally(() => {
            this.setState({performingCheck: null});
        })
    }

    renderS3BucketsList(){
        const {s3Config} = this.props;
        const {s3CheckKeysSuccess} = this.state;
        let {buckets, canCreate} = s3CheckKeysSuccess;
        if(!buckets){
            buckets = [];
        }
        const keys = ['Default', 'Personal', 'Cells', 'Binaries', 'Thumbs', 'Versions'];
        const newBuckets = keys.map(k => s3Config['dsS3Bucket'+k]);
        const notExist = newBuckets.filter(b => buckets.indexOf(b) === -1);
        const exist = newBuckets.filter(b => buckets.indexOf(b) > -1);
        const result = {};
        if(canCreate) {
            result.Valid = true;
            result.NeedsCreates = notExist.length > 0;
            result.Component = (
                <span>
                    <FontIcon className={"mdi mdi-check"} color={"#2e7d32"} style={{fontSize:'inherit'}}/>
                    {exist.length>0 && <span>{this.t('form.bucketList.found')} : {exist.join(', ')}. </span>}
                    {notExist.length>0 && <span>{this.t('form.bucketList.toCreate')} : {notExist.join(', ')}. </span>}
                </span>
            );
        } else {
            if(notExist.length) {
                result.Valid = false;
                result.Component = <div><FontIcon className={"mdi mdi-alert"} color={"#c62828"} style={{fontSize:'inherit'}}/> {this.t('form.bucketList.notFound')} : {notExist.join(', ')}. <span style={{color:'"#c62828"'}}>{this.t('form.bucketList.warnCreate')}</span></div>
            } else {
                result.Valid = true;
                result.Component = <div><FontIcon className={"mdi mdi-check"} color={"#2e7d32"} style={{fontSize:'inherit'}}/> {this.t('form.bucketList.found')} : {newBuckets.join(', ')}.</div>
            }
        }
        return result;
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
        const {handleSubmit, licenseRequired, invalid, dsType} = this.props;
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
                if(dsType === 'S3'){
                    const {s3CheckKeysSuccess, s3BucketsPrefix} = this.state;
                    nextInvalid = !s3CheckKeysSuccess || !s3BucketsPrefix || !this.renderS3BucketsList().Valid;
                    if(!nextInvalid && this.renderS3BucketsList().NeedsCreates) {
                        nextAction = () => {
                            // First create buckets if necessary
                            this.checkS3Config((result) => {
                                const data = JSON.parse(result.JsonResult);
                                if (result.Success) {
                                    this.handleNext();
                                    handleSubmit();
                                } else {
                                    this.setState({s3CheckBucketsError: data.error})
                                }
                            });
                        };
                    }
                }
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
                        style={{borderRadius: 20, marginRight: 5}}
                        buttonStyle={{borderRadius: 20}}
                        labelStyle={{textTransform: 'none', fontWeight: 400}}
                        />
                    )}
                    <RaisedButton
                        label={stepIndex === 3 + stepOffset? this.t('stepper.button.last') : this.t('stepper.button.next')}
                        primary={true}
                        onClick={nextAction}
                        disabled={nextDisabled || invalid || nextInvalid}
                        style={{borderRadius: 20}}
                        buttonStyle={{borderRadius: 20}}
                        overlayStyle={{borderRadius: 20}}
                        labelStyle={{textTransform: 'none', fontWeight: 400}}
                    />
                </div>
            </div>
        );
    }

    render() {

        const {dbConnectionType, handleSubmit, installPerformed, installError, initialChecks, licenseRequired, licenseString,
            frontendPassword, frontendLogin, frontendRepeatPassword, DocumentsDSN, change} = this.props;

        const {stepIndex, licenseAgreed, showAdvanced, installEvents, installProgress, serverRestarted, willReloadIn,
            agreementText, dbCheckError, dbCheckSuccess, s3CheckKeysSuccess, s3CheckKeysError, s3BucketsPrefix, s3CheckBucketsError, licCheckFailed,
            performingCheck, tablesFoundConfirm, adminFoundOverride, mongoDSNValid, mongoDSNError, lang} = this.state;

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
                overflowY : 'auto',
                overflowX: 'hidden'
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
                                    <Field name="licenseString" component={renderTextField} floatingLabel={this.t('license.fieldLabel')} label={this.t('license.fieldLegend')} multiLine={true} rowsMax={15}/>
                                </div>
                            }
                        </div>
                        <div style={{margin: '12px 0', display:'flex', alignItems: 'center'}}>
                            <span style={{flex: 1}}/>
                            <div>
                                <FlatButton
                                    label="Back"
                                    onClick={this.handlePrev.bind(this)}
                                    style={{borderRadius: 20, marginRight: 5}}
                                    buttonStyle={{borderRadius: 20}}
                                    overlayStyle={{borderRadius: 20}}
                                    labelStyle={{textTransform: 'none', fontWeight: 400}}
                                />
                                <RaisedButton
                                    label={'Next'} primary={true} onClick={nextAction} disabled={(!licCheckPassed && !licenseString)}
                                    style={{borderRadius: 20}}
                                    buttonStyle={{borderRadius: 20}}
                                    overlayStyle={{borderRadius: 20}}
                                    labelStyle={{textTransform: 'none', fontWeight: 400}}
                                />
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
        const {dbConfig = {}} = this.props
        const {dbUseDefaultsToggle} = this.state
        const tablesFound = dbCheckSuccess && dbCheckSuccess.tablesFound;
        steps.push(
            <Step key={steps.length-1} style={stepperStyles.step}>
                <StepLabel style={stepIndex >= 1 + stepOffset ? stepperStyles.label : {}}>{this.t('database.stepLabel')}</StepLabel>
                <StepContent style={stepperStyles.content}>
                    <div style={stepperStyles.contentScroller}>
                        <h3>{this.t('database.title')}</h3>

                        {dbUseDefaultsToggle &&
                        <div>
                            <p>{this.t('database.useDefaultsSet')}</p>
                            <Field name="dbUseDefaults" component={renderInvertCheckbox} label={<span>{this.t('database.forceConfigure')} <span style={{fontWeight: 500}}>{this.t('database.legend.bold')}.</span></span>}/>
                        </div>
                        }
                        {!dbUseDefaultsToggle &&
                        <div>{this.t('database.legend1')}<br/>{this.t('database.legend2')}</div>
                        }
                        {dbCheckError &&
                        <div style={{color: '#E53935', paddingTop: 10, fontWeight: 500}}>{dbCheckError}</div>
                        }

                        {(!dbUseDefaultsToggle || !dbConfig.dbUseDefaults) &&
                        <div style={flexContainer}>
                            <Field name="dbConnectionType" component={renderSelectField} label={this.t('database.stepLabel')}>
                                <MenuItem value="tcp" primaryText={this.t('form.dbConnectionType.mysql_tcp')} />
                                <MenuItem value="mysql_socket" primaryText={this.t('form.dbConnectionType.mysql_socket')} />
                                <MenuItem value="pg_tcp" primaryText={this.t('form.dbConnectionType.pg_tcp')} />
                                <MenuItem value="pg_socket" primaryText={this.t('form.dbConnectionType.pg_socket')} />
                                <MenuItem value="sqlite" primaryText={this.t('form.dbConnectionType.sqlite')} />
                                <MenuItem value="manual" primaryText={this.t('form.dbConnectionType.manual')} />
                            </Field>

                            {(dbConnectionType === "tcp" || dbConnectionType === "mysql_tcp" || dbConnectionType === "pg_tcp") && (
                                <div style={flexContainer}>
                                    <div style={{display:'flex'}}>
                                        <div style={{flex: 4, marginRight: 2}}><Field name="dbTCPHostname" component={renderTextField} floatingLabel={this.t('form.dbTCPHostname.label')} label={this.t('form.dbTCPHostname.legend')} /></div>
                                        <div style={{flex: 1, marginLeft: 2}}><Field name="dbTCPPort" component={renderTextField} floatingLabel={this.t('form.dbTCPPort.label')} label={this.t('form.dbTCPPort.legend')} /></div>
                                    </div>
                                    <Field name="dbTCPName" component={renderTextField} floatingLabel={this.t('form.dbName.label')} label={this.t('form.dbName.legend')} />
                                    <div style={{display:'flex'}}>
                                        <div style={{flex: 1, marginRight: 2}}><Field name="dbTCPUser" component={renderTextField} floatingLabel={this.t('form.dbUser.label')} label={this.t('form.dbUser.legend')} /></div>
                                        <div style={{flex: 1, marginLeft: 2}}><Field name="dbTCPPassword" component={renderPassField} floatingLabel={this.t('form.dbPassword.label')} label={this.t('form.dbPassword.legend')} /></div>
                                    </div>
                                </div>
                            )}

                            {(dbConnectionType === "mysql_socket" || dbConnectionType === "pg_socket") && (
                                <div style={flexContainer}>
                                    <Field name="dbSocketFile" component={renderTextField} floatingLabel={this.t('form.dbSocketFile.label')} label={this.t('form.dbSocketFile.legend')} defaultValue="/tmp/mysql.sock" />
                                    <Field name="dbSocketName" component={renderTextField} floatingLabel={this.t('form.dbName.label')} label={this.t('form.dbName.legend')} defaultValue="pydio" />
                                    <div style={{display:'flex'}}>
                                        <div style={{flex: 1, marginRight: 2}}><Field name="dbSocketUser" component={renderTextField} floatingLabel={this.t('form.dbUser.label')} label={this.t('form.dbUser.legend')} /></div>
                                        <div style={{flex: 1, marginLeft: 2}}><Field name="dbSocketPassword" component={renderTextField} floatingLabel={this.t('form.dbPassword.label')} label={this.t('form.dbPassword.legend')} /></div>
                                    </div>
                                </div>
                            )}

                            {dbConnectionType === "sqlite" && (
                                <div style={flexContainer}>
                                    <Field name="dbSocketFile" component={renderTextField} floatingLabel={this.t('form.dbSocketFileSQLite.label')} label={this.t('form.dbSocketFileSQLite.legend')} />
                                </div>
                            )}

                            {dbConnectionType === "manual" && (
                                <div style={flexContainer}>
                                    <Field name="dbManualDSN" component={renderTextField} floatingLabel={this.t('form.dbManualDSN.label')} label={this.t('form.dbManualDSN.legend')} />
                                </div>
                            )}
                        </div>
                        }

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
                            <Field name="frontendDefaultLanguage" component={renderSelectField} label={this.t('form.frontendDefaultLanguage.label')}>{supportedLanguages}</Field>
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

        let DSNURL;
        if (DocumentsDSN) {
            DSNURL = new Url(DocumentsDSN)
        } else {
            DSNURL = new Url('mongodb://localhost:27017/cells?maxPoolSize=20&w=majority')
        }
        let DSNSearchParams;
        try{
            DSNSearchParams = new URL(DSNURL.toString()).searchParams
        }catch (e){}
        const changeDSN = (url, key, value) => {
            if(key === "authSource") {
                const sp = new URL(url.toString()).searchParams
                if (value) {
                    sp.set("authSource", value)
                } else {
                    sp.delete("authSource")
                }
                url.set('query', '?' + sp.toString())
            } else if (key === 'query') {
                if(value[value.length-1]=== "&") {
                    value += 'newParam'
                }
                url.set('query', value)
            } else {
                url.set(key, value);
            }
            change('DocumentsDSN', url.toString())
        }

        const {dsType, s3Config} = this.props;
        steps.push(
            <Step key={steps.length-1} style={stepperStyles.step}>
                <StepLabel style={stepIndex >= 3 + stepOffset ? stepperStyles.label : {}}>{this.t('advanced.stepLabel')}</StepLabel>
                <StepContent style={stepperStyles.content}>
                    <div style={stepperStyles.contentScroller}>
                        <h3>{this.t('advanced.title')}</h3>
                        {this.t('advanced.legend')}

                        <Checkbox
                            label={this.t('advanced.mongo.title')}
                            onCheck={(e,v) => change('DocumentsDSN', v ? 'mongodb://localhost:27017/cells?maxPoolSize=20&w=majority':'')}
                            checked={!!DocumentsDSN}
                            labelPosition={"left"}
                            style={{marginTop: 10, marginBottom: 8}}
                            labelStyle={{fontSize: 14}}
                        />
                        {!!DocumentsDSN &&
                            <div style={{paddingBottom: 20}}>
                                {!mongoDSNError && <div style={{opacity:.7,width:440}}>{this.t('advanced.mongo.legend')}</div>}
                                {!!mongoDSNError && <div style={{color:'#E53935'}}>{mongoDSNError}</div>}
                                <div style={{display:'flex', alignItems:'flex-end'}}>
                                    <TextField value={DSNURL.hostname} onChange={(e,v)=>changeDSN(DSNURL, 'hostname', v)} floatingLabelText={this.t('advanced.mongo.host')} fullWidth={true} floatingLabelFixed={true} {...fieldStyles.textFieldV2}/>
                                    <div style={{marginRight: 10}} />
                                    <TextField value={DSNURL.port} onChange={(e,v)=>changeDSN(DSNURL, 'port', v)} floatingLabelText={this.t('advanced.mongo.port')} fullWidth={true} floatingLabelFixed={true} {...fieldStyles.textFieldV2}/>
                                    <div style={{marginRight: 10}} />
                                    <TextField value={DSNURL.pathname.replace('/', '')} onChange={(e,v)=>changeDSN(DSNURL, 'pathname', '/' + v)} floatingLabelText={this.t('advanced.mongo.db')} fullWidth={true} floatingLabelFixed={true} {...fieldStyles.textFieldV2}/>
                                {performingCheck === 'MONGO' && <div style={{minWidth:48, height:48, padding:12, boxSizing:'border-box'}}><CircularProgress size={20} thickness={2.5}/></div>}
                                    <div>
                                {mongoDSNValid && <FontIcon className={"mdi mdi-check"} color={"#4caf50"} style={{width: 25, height: 32, marginLeft: 10}}/>}
                                {!mongoDSNValid && performingCheck !== 'MONGO' &&
                                    <IconButton
                                    disabled={!DocumentsDSN || !!performingCheck}
                                    iconClassName={"mdi mdi-login-variant"}
                                    tooltip={this.t('advanced.mongo.validate')}
                                    tooltipPosition={"bottom-left"}
                                    onClick={() => {
                                    this.setState({mongoDSNError:null})
                                    this.checkMongoDSN((result) => {
                                    const data = JSON.parse(result.JsonResult);
                                    if (result.Success) {
                                    this.setState({mongoDSNValid: true});
                                } else {
                                    this.setState({mongoDSNValid: false, mongoDSNError: data.error})
                                }
                                }, true);
                                }}
                                    />
                                }
                                    </div>
                                </div>
                                <div style={{display:'flex', alignItems:'flex-end'}}>
                                    <TextField value={DSNURL.username} onChange={(e,v)=>changeDSN(DSNURL, 'username', v)} floatingLabelText={this.t('advanced.mongo.username')} fullWidth={true} floatingLabelFixed={true} {...fieldStyles.textFieldV2}/>
                                    <div style={{marginRight: 10}} />
                                    <TextField value={DSNURL.password} onChange={(e,v)=>changeDSN(DSNURL, 'password', v)} floatingLabelText={"Password"} fullWidth={true} type={this.t('advanced.mongo.password')} floatingLabelFixed={true} {...fieldStyles.textFieldV2}/>
                                    <div style={{marginRight: 10}} />
                                    <TextField value={DSNSearchParams&&DSNSearchParams.get('authSource')||""}
                                               onChange={(e,v)=>changeDSN(DSNURL, 'authSource', v)}
                                               floatingLabelText={this.t('advanced.mongo.authSource')} fullWidth={true} floatingLabelFixed={true} {...fieldStyles.textFieldV2}/>
                                    <div style={{minWidth:48}}/>
                                </div>
                                <div style={{display:'flex'}}>
                                    <TextField value={DSNURL.query} onChange={(e,v)=>{changeDSN(DSNURL, 'query', v)}} floatingLabelText={'Full query string (avoid edit manually, prefer copy/pasting)'} fullWidth={true} floatingLabelFixed={true} {...fieldStyles.textFieldV2}/>
                                    <div style={{minWidth:48}}/>
                                </div>
                            </div>
                        }
                        <div style={{display:'flex', alignItems:'center', height: 40, cursor:'pointer', width: 478}} onClick={() => {this.setState({showAdvanced:!showAdvanced})}}>
                            <div style={{flex: 1, fontSize: 14}}>{this.t('advanced.toggle')}</div>
                            <FontIcon className={showAdvanced?"mdi mdi-chevron-down":"mdi mdi-chevron-right"}/>
                        </div>
                        {showAdvanced &&
                        <div style={flexContainer}>
                            <div style={{marginTop: 20}}>
                                {this.t('advanced.default.datasource')}
                            </div>
                            <div>
                                <Field name="dsType" component={renderSelectField} label={this.t('form.dsType.Label')}>
                                    <MenuItem value="" primaryText={this.t('form.dsType.FS')} />
                                    <MenuItem value="S3" primaryText={this.t('form.dsType.S3')} />
                                </Field>
                            </div>
                            {dsType !== 'S3' &&
                                <div>
                                    <Field name="dsFolder" component={renderTextField} floatingLabel={this.t('form.dsFolder.label')} label={this.t('form.dsFolder.legend')}/>
                                </div>
                            }
                            {dsType === 'S3' &&
                            <div>
                                <div style={{display: 'flex', alignItems: 'flex-end'}}>
                                    <div style={{flex: 1, marginRight: 5}}>
                                        <Field name="dsS3Custom" component={renderTextField}
                                               floatingLabel={this.t('form.dsS3Custom.label')}
                                               label={this.t('form.dsS3Custom.legend')}
                                        />
                                    </div>
                                    <div style={{flex: 1, marginLeft: 5}}>
                                        <Field name="dsS3CustomRegion" component={renderTextField}
                                               floatingLabel={this.t('form.dsS3CustomRegion.label')}
                                               label={this.t('form.dsS3CustomRegion.legend')}/>
                                    </div>
                                    <div style={{width: 48}}/>
                                </div>
                                <div style={{display: 'flex', alignItems: 'flex-end'}}>
                                    <div style={{flex: 1, marginRight: 5}}>
                                        <Field name="dsS3ApiKey" component={renderTextField}
                                               floatingLabel={this.t('form.dsS3ApiKey.label')}
                                               label={this.t('form.dsS3ApiKey.legend')}
                                               errorText={(s3CheckKeysError && s3CheckKeysError.error) || s3CheckBucketsError}
                                        />
                                    </div>
                                    <div style={{flex: 1, marginLeft: 5}}>
                                        <Field name="dsS3ApiSecret" component={renderPassField}
                                               floatingLabel={this.t('form.dsS3ApiSecret.label')}
                                               label={this.t('form.dsS3ApiSecret.legend')}/>
                                    </div>
                                    {performingCheck === 'S3_KEYS' && <div style={{width:48, height:48, padding:12, boxSizing:'border-box'}}><CircularProgress size={20} thickness={2.5}/></div>}
                                    <div>
                                        {performingCheck !== 'S3_KEYS' &&
                                            <IconButton
                                                disabled={!s3Config || !s3Config.dsS3ApiKey || !s3Config.dsS3ApiSecret}
                                                iconClassName={"mdi mdi-login-variant"}
                                                tooltip={this.t('form.dsS3ValidateKeys')}
                                                tooltipPosition={"bottom-left"}
                                                onClick={() => {
                                                    this.checkS3Config((result) => {
                                                        const data = JSON.parse(result.JsonResult);
                                                        if (result.Success) {
                                                            this.setState({s3CheckKeysSuccess: data});
                                                        } else {
                                                            this.setState({s3CheckKeysError: data})
                                                        }
                                                    }, true);
                                                }}
                                            />
                                        }
                                    </div>
                                </div>
                                {s3CheckKeysSuccess &&
                                <div>
                                    <TextField
                                        value={s3BucketsPrefix || ''}
                                        onChange={(e,v)=>{
                                            this.setState({s3BucketsPrefix: v});
                                            change('dsS3BucketDefault', v + 'pydiods1');
                                            change('dsS3BucketPersonal', v + 'personal');
                                            change('dsS3BucketCells', v + 'cellsdata');
                                            change('dsS3BucketBinaries', v + 'binaries');
                                            change('dsS3BucketVersions', v + 'versions');
                                            change('dsS3BucketThumbs', v + 'thumbs');
                                        }}
                                        floatingLabelText={this.t('form.s3BucketsPrefix.label')}
                                        floatingLabelFixed={true}
                                        hintText={this.t('form.s3BucketsPrefix.legend')}
                                        fullWidth={true}
                                    />
                                    <div>{s3BucketsPrefix && this.renderS3BucketsList().Component}</div>
                                </div>
                                }
                            </div>
                            }
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
                            <LinearProgress min={0} max={100} value={installProgress} style={{width: '100%'}} mode={"indeterminate"}/>
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
                            {this.t('apply.success.restarted').replace('%1', willReloadIn)}
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
                                style={{borderRadius: 20}}
                                buttonStyle={{borderRadius: 20}}
                                overlayStyle={{borderRadius: 20}}
                                labelStyle={{textTransform: 'none', fontWeight: 400}}
                            />
                        </div>
                    </div>
                    }
                </StepContent>
            </Step>
        );

        return (
            <Paper zDepth={2} style={{width: 800, minHeight: panelHeight, margin: 'auto', position:'relative', backgroundColor:panelBG, borderRadius: 20}}>
                <div style={{width: 256, height: panelHeight, backgroundColor: 'rgb(94, 142, 174)', fontSize: 13, display:'flex', flexDirection:'column', borderRadius: '20px 0 0 20px'}}>
                    <div style={{backgroundImage:'url(res/css/PydioLogo250.png)', backgroundSize:'90%',
                        backgroundRepeat: 'no-repeat', backgroundPosition:'center center', width: 256, height: 100}}></div>
                    <form onSubmit={handleSubmit} autoComplete={"off"} style={{flex: 1}}>
                        <Stepper activeStep={stepIndex} orientation="vertical">
                            {steps}
                        </Stepper>
                    </form>
                    <div style={{height: 56, padding:'0px 16px'}}>
                        <SelectField value={lang} onChange={(e,i,v)=>{change('frontendDefaultLanguage', v), this.setState({lang: v})}} fullWidth={true} labelStyle={{color: 'rgba(255,255,255,.87)'}} underlineStyle={{display:'none'}}>{supportedLanguages}</SelectField>
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
    const dbConfig = selector(state, 'dbConnectionType', 'dbManualDSN', 'dbSocketFile', 'dbSocketName', 'dbSocketUser', 'dbTCPHostname', 'dbTCPName', 'dbTCPPort', 'dbTCPUser', 'dbTCPPassword', 'dbSocketPassword', 'dbUseDefaults');
    const initialChecks = selector(state, 'CheckResults');
    const licenseRequired = selector(state, 'licenseRequired');
    const licenseString = selector(state, 'licenseString');
    const frontendLogin = selector(state, 'frontendLogin');
    const frontendPassword = selector(state, 'frontendPassword');
    const frontendRepeatPassword = selector(state, 'frontendRepeatPassword');
    const dsType = selector(state, 'dsType');
    const s3Config = selector(state, 'dsS3Custom', 'dsS3CustomRegion', 'dsS3ApiKey', 'dsS3ApiSecret', 'dsS3BucketDefault', 'dsS3BucketPersonal', 'dsS3BucketCells', 'dsS3BucketBinaries', 'dsS3BucketThumbs', 'dsS3BucketVersions');
    const DocumentsDSN = selector(state, 'DocumentsDSN')

    // Make a request to retrieve those values
    return {
        initialValues: state.config.data,
        dbConnectionType,
        dbConfig,
        s3Config,
        dsType,
        initialChecks,
        licenseRequired,
        licenseString,
        frontendPassword,
        frontendLogin,
        frontendRepeatPassword,
        DocumentsDSN
    }
}, { load: loadConfig } )(InstallForm);


export default InstallForm
