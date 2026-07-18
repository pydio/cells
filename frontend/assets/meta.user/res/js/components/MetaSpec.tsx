export interface SelectItem {
    key: string;
    value: string;
    color?: string;
}

export interface NamespaceMeta {
    label: string;
    type:
        | 'text'
        | 'textarea'
        | 'json'
        | 'stars_rate'
        | 'choice'
        | 'css_label'
        | 'tags'
        | 'date'
        | 'integer'
        | 'boolean'
        | 'url'
        | 'tag_cloud'
        | 'auto_complete';
    readonly?: boolean;
    required?: boolean;
    errorText?: string;
    data?: {
        items?: SelectItem[];
        steps?: boolean;
        format?: string;
        policyContextEditable?: boolean;
    };
    description?: string;
}
