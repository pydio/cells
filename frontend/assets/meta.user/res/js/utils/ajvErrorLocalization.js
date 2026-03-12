const KEYWORD_TO_I18N_KEY = {
    required: 'meta.user.validation.required',
    type: 'meta.user.validation.type',
    minLength: 'meta.user.validation.minLength',
    maxLength: 'meta.user.validation.maxLength',
    minimum: 'meta.user.validation.minimum',
    maximum: 'meta.user.validation.maximum',
    enum: 'meta.user.validation.enum',
    pattern: 'meta.user.validation.pattern',
    additionalProperties: 'meta.user.validation.additionalProperties',
};

const normalizeMessage = (value) => {
    if (typeof value === 'string') return value;
    if (value && typeof value.other === 'string') return value.other;
    return undefined;
};

const getGlobalMessageHash = () => {
    if (typeof globalThis === 'undefined') return undefined;
    return globalThis.pydio?.MessageHash;
};

const getTranslator = (t) => {
    if (typeof t === 'function') return t;

    const messageHash = t || getGlobalMessageHash();
    if (!messageHash) return () => undefined;

    return (key) => {
        const fallbackKey = key.replace(/^meta\.user\./, '');
        return normalizeMessage(messageHash[key]) || normalizeMessage(messageHash[fallbackKey]);
    };
};

const formatParam = (value) => {
    if (Array.isArray(value)) return value.join(', ');
    if (value === undefined || value === null) return '';
    return `${value}`;
};

const interpolate = (template, params) => template.replace(/\{(\w+)\}/g, (_, key) => formatParam(params[key]));

const canInterpolate = (template, params) => {
    const tokens = template.match(/\{(\w+)\}/g) || [];

    return tokens.every((token) => {
        const key = token.slice(1, -1);
        const value = params[key];
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== null && `${value}`.length > 0;
    });
};

const buildParams = (error = {}) => {
    const params = { ...(error.params || {}) };

    if (error.keyword === 'required' && params.missingProperty && !params.field) {
        params.field = params.missingProperty;
    }

    return params;
};

const resolveTemplate = (error, translate) => {
    if (error.keyword === 'format') {
        const format = error.params?.format;
        return translate(`meta.user.validation.format.${format}`)
            || translate('meta.user.validation.format.default');
    }

    const messageKey = KEYWORD_TO_I18N_KEY[error.keyword];
    if (!messageKey) return undefined;
    return translate(messageKey);
};

export const localizeAjvError = (error, t) => {
    if (!error) return '';

    const translate = getTranslator(t);
    const template = resolveTemplate(error, translate);
    if (!template) return error.message || 'Invalid value';

    const params = buildParams(error);
    if (!canInterpolate(template, params)) return error.message || 'Invalid value';

    return interpolate(template, params);
};
