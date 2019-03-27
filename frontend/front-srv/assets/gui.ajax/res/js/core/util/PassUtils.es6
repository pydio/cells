/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com/>.
 *
 */
import ResourcesManager from '../http/ResourcesManager'
import validator from 'validator'
import Pydio from '../Pydio'

/**
 *
 * Utils to compute password strength
 *
 */
export default class PassUtils{

    /**
     * Check if loginString is lowercase, a valid email or just alphanumeric
     * @param loginString
     * @return {string} Error string or empty string
     */
    static isValidLogin(loginString) {
        const messages = Pydio.getMessages();
        const re = new RegExp(/^[0-9A-Z\-_.:\+]+$/i);
        if (!validator.isLowercase(loginString)){
            return messages['validation.login.lowercase'] || "only lowercase";
        } else if(!(re.test(loginString) || validator.isEmail(loginString))){
            return messages['validation.login.format'] || 'only alphanumeric characters or valid emails';
        }
        return ''
    }

    static getState(passValue = '', confirmValue = '', crtState={valid: false}, onChange = (status)=>{}){
        let state = {
            valid: true,
            passErrorText: null,
            passHintText: null,
            confirmErrorText: null,
        };
        if (!passValue && !confirmValue ){
            state.valid = false;
        } else {
            PassUtils.checkPasswordStrength(passValue, (valid, message) => {
                state.valid = valid;
                if(!valid){
                    state.passErrorText = message;
                } else {
                    state.passHintText = message;
                }
            });
            if(!confirmValue) {
                state.valid = false;
                state.confirmErrorText = Pydio.getMessages()[621];
            } else if (confirmValue !== passValue) {
                state.valid = false;
                state.confirmErrorText = Pydio.getMessages()[238];
            }
        }
        if(crtState.valid !== state.valid){
            onChange(state.valid);
        }
        return state;
    }

    static getOptions(){
        if(PassUtils.Options){
            return PassUtils.Options;
        }
        PassUtils.Options = {
            pydioMessages:[379,380,381,382,383,384,385],
            messages: ["Unsafe password word!", "Too short", "Very weak", "Weak", "Medium", "Strong", "Very strong"],
            colors: ["#f00", "#999", "#C70F0F", "#C70F0F", "#FF8432", "#279D00", "#279D00"],
            scores: [10, 15, 30, 40],
            common: ["password", "123456", "123", "1234", "mypass", "pass", "letmein", "qwerty", "monkey", "asdfgh", "zxcvbn", "pass"],
            minchar: 8
        };
        const pydioMin = parseInt(global.pydio.getPluginConfigs("core.auth").get("PASSWORD_MINLENGTH"));
        if(pydioMin){
            PassUtils.Options.minchar = pydioMin;
        }
        return PassUtils.Options;
    }

    static checkPasswordStrength(value, callback) {
        try{
            const PassPolicyLib = ResourcesManager.requireLib("PasswordPolicy", false);
            if(PassPolicyLib && PassPolicyLib.Checker){
                const {Checker} = PassPolicyLib;
                if(Checker) {
                    Checker.checkPasswordStrength(value, callback);
                    return;
                }
            }
        } catch (e){}
        // Update with Pydio options
        const options = PassUtils.getOptions();
        if(options.minchar && value.length < options.minchar){
            callback(false, Pydio.getMessages()[380]);
            return;
        }
        const wrappedCallback = (msgId, percent) => {
            let s = options.messages[msgId];
            try{
                s = Pydio.getMessages()[options.pydioMessages[msgId]];
            }catch(e){}
            callback(percent > 1, s);
        };
        const strength = PassUtils.getPasswordScore(value, options.minchar);
        if (strength === -200) {
            wrappedCallback(0, 0);
        } else {
            if (strength < 0 && strength > -199) {
                wrappedCallback(1, 10);
            } else {
                if (strength <= options.scores[0]) {
                    wrappedCallback(2, 10);
                } else {
                    if (strength > options.scores[0] && strength <= options.scores[1]) {
                        wrappedCallback(3, 25);
                    } else if (strength > options.scores[1] && strength <= options.scores[2]) {
                        wrappedCallback(4, 55);
                    } else if (strength > options.scores[2] && strength <= options.scores[3]) {
                        wrappedCallback(5, 80);
                    } else {
                        wrappedCallback(6, 98);
                    }
                }
            }
        }
    }

    static getPasswordScore(value, minchar) {

        let strength = 0;
        if (value.length < minchar) {
            strength = (strength - 100);
        } else {
            if (value.length >= minchar && value.length <= (minchar + 2)) {
                strength = (strength + 6);
            } else {
                if (value.length >= (minchar + 3) && value.length <= (minchar + 4)) {
                    strength = (strength + 12);
                } else {
                    if (value.length >= (minchar + 5)) {
                        strength = (strength + 18);
                    }
                }
            }
        }
        if (value.match(/[a-z]/)) {
            strength = (strength + 1);
        }
        if (value.match(/[A-Z]/)) {
            strength = (strength + 5);
        }
        if (value.match(/\d+/)) {
            strength = (strength + 5);
        }
        if (value.match(/(.*[0-9].*[0-9].*[0-9])/)) {
            strength = (strength + 7);
        }
        if (value.match(/.[!@#$%^&*?_~]/)) {
            strength = (strength + 5);
        }
        if (value.match(/(.*[!@#$%^&*?_~].*[!@#$%^&*?_~])/)) {
            strength = (strength + 7);
        }
        if (value.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
            strength = (strength + 2);
        }
        if (value.match(/([a-zA-Z])/) && value.match(/([0-9])/)) {
            strength = (strength + 3);
        }
        if (value.match(/([a-zA-Z0-9].*[!@#$%^&*?_~])|([!@#$%^&*?_~].*[a-zA-Z0-9])/)) {
            strength = (strength + 3);
        }
        const common = ["password", "123456", "123", "1234", "mypass", "pass", "letmein", "qwerty", "monkey", "asdfgh", "zxcvbn", "pass"];
        if(common.indexOf(value.toLowerCase()) !== -1){
            strength = -200;
        }
        return strength;
    }
}

