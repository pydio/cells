import dayjs from 'dayjs'
import 'dayjs/locale/ca'
import 'dayjs/locale/cs'
import 'dayjs/locale/da'
import 'dayjs/locale/de'
import 'dayjs/locale/es'
import 'dayjs/locale/et'
import 'dayjs/locale/fi'
import 'dayjs/locale/fr'
import 'dayjs/locale/el'
import 'dayjs/locale/he'
import 'dayjs/locale/hu'
import 'dayjs/locale/it'
import 'dayjs/locale/ja'
import 'dayjs/locale/ko'
import 'dayjs/locale/nl'
import 'dayjs/locale/nn'
import 'dayjs/locale/pl'
import 'dayjs/locale/pt'
import 'dayjs/locale/pt-br'
import 'dayjs/locale/ru'
import 'dayjs/locale/si'
import 'dayjs/locale/sv'
import 'dayjs/locale/tr'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'

import updateLocale from 'dayjs/plugin/updateLocale'
import calendar from 'dayjs/plugin/calendar'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import localeData from 'dayjs/plugin/localeData'
import duration from 'dayjs/plugin/duration'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(updateLocale)
dayjs.extend(calendar);
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(duration)
dayjs.extend(localeData)
dayjs.extend(localizedFormat)
export {dayjs as default};