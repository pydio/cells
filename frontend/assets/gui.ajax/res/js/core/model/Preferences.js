export default class Preferences {

    static lookupByPath(current, path, defaultValue) {
        if(path === '') {
            return current
        }
        const parts = path.split('.')
        let missing = false
        parts.forEach(part => {
            if(missing) {
                return // break by ignoring
            }
            if(current[part] === undefined) {
                missing = true
            }
            current = current[part]
        })
        return missing ? defaultValue : current
    }

    static updateByPath(top, path, value) {
        const parts = path.split('.')
        if(parts.length > 1 && top[path] !== undefined) {
            // Already stored in legacy format, remove existing key
            delete(top[path])
        }
        const lastPart = parts.pop()
        let current = top;
        parts.forEach(part => {
            if(current[part] === undefined){
                current[part] = {}
            }
            current = current[part]
        })
        if(value === undefined) {
            delete(current[lastPart])
        } else {
            current[lastPart] = value
        }
    }

    static migratePreferences(current, newVersion) {
        const currentVersion = current.PrefVersion || 0
        let migrated = current
        for(let i = currentVersion+1; i <= newVersion; i++) {
            switch (i) {
                case 1:
                    migrated = {PrefVersion: i}
                    const keys = [
                        'UserAccount.WelcomeModal.Shown',
                        'WelcomeComponent.MUITour',
                        'WelcomeComponent.Pydio8.TourGuide.FSTemplate',
                        'WelcomeComponent.Pydio8.TourGuide.Welcome'
                    ];
                    keys.forEach(key => {
                        if(current[key] !== undefined) {
                            Preferences.updateByPath(migrated, key, current[key])
                        }
                    })

                    break;
                default:
                    break;
            }
        }
        return migrated
    }
}