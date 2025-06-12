import { useState, useEffect, useCallback } from 'react';
import Pydio from 'pydio'

/**
 * @template T
 * @param {string} key   - the pref key, e.g. 'FilesList.ShowExtensions'
 * @param {T} defaultValue
 * @returns {[T, (newValue: T) => void]}
 */
const useUserPreference = (key, defaultValue, fixedValue)  => {
    //TODO
    //const pydio = useContext(PydioContext);

    const pydio = Pydio.getInstance()

    // Helper to get current server‐side pref
    const readPref = useCallback(() => {
        if (fixedValue) {
            return fixedValue;
        }
        if (!pydio.user) return defaultValue;
        return pydio.user.getLayoutPreference(key, defaultValue);
    }, [pydio.user, key, defaultValue, fixedValue]);

    // Local state mirrors the server value
    const [value, setValue] = useState(readPref);

    // Sync up whenever preferences are reloaded elsewhere
    useEffect(() => {
        if (fixedValue) {
            return
        }
        const onReload = () => {
            setValue(readPref());
        };
        pydio.observe('reload_layout_preferences', onReload);
        return () => {
            pydio.stopObserving('reload_layout_preferences', onReload);
        };
    }, [pydio, readPref]);

    // When caller sets a new value: update both state & server
    const setPref = useCallback(
        (newValue) => {
            if(fixedValue) {
                return
            }
            setValue(newValue);
            pydio.user &&
            pydio.user.setLayoutPreference(key, newValue);
        },
        [pydio.user, key, fixedValue]
    );

    return [value, setPref];
}

export {useUserPreference}