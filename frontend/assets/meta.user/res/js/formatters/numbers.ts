type NumberFormat = 'general' | 'currency' | 'bytesize' | 'percentage' | 'progress'

export const getNumberPrefix = (type: NumberFormat) => {
    switch (type) {
        case 'currency':
            return '€'
        case 'bytesize':
            return ''
        default:
            return ''
    }
}

export const getNumberSuffix = (type: NumberFormat) => {
    switch (type) {
        case 'bytesize':
            return 'B'
        case 'percentage':
            return '%'
        case 'progress':
            return ''
        default:
            return ''
    }
}
