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
 * The latest code can be found at <https://pydio.com>.
 */

// Import Builder class
import Builder from './Builder'
import TemplateBuilder from './TemplateBuilder'
import ThemeModifier from './ThemeModifier'
import AsyncComponent from './AsyncComponent'
import withProgressiveBg from './withProgressiveBg'

import AsyncModal from './modal/AsyncModal'
import ActionDialogMixin from './modal/ActionDialogMixin'
import CancelButtonProviderMixin from './modal/CancelButtonProviderMixin'
import SubmitButtonProviderMixin from './modal/SubmitButtonProviderMixin'
import Modal from './modal/Modal'
import ConfirmDialog from './modal/ConfirmDialog'
import PromptDialog from './modal/PromptDialog'
import ActivityWarningDialog from './modal/ActivityWarningDialog'
import ServerPromptDialog from './modal/ServerPromptDialog'
import PromptValidators from './modal/PromptValidators'

import MessageBar from './modal/MessageBar'
import AbstractDialogModifier from './modal/AbstractDialogModifier'
import Loader from './Loader'
import Router from './router/Router'
import NetworkLoader from './modal/NetworkLoader'
import HiddenDownloadForm from './HiddenDownloadForm'

import PydioContextProvider from './PydioContextProvider'
import PydioContextConsumer from './PydioContextConsumer'

import moment from './Moment'

import TasksPanel from './tasks/TasksPanel'
import JobsStore from './tasks/JobsStore'
import SingleJobProgress from './tasks/SingleJobProgress'
import JobEntry from './tasks/JobEntry'
import useRunningTasksMonitor from './tasks/useRunningTasksMonitor'

import Tooltip from 'material-ui/internal/Tooltip'
import M3Tooltip from '@mui/material/Tooltip'

import './modal/popoverFix'

export {
    Builder,
    TemplateBuilder,
    AsyncComponent,
    ThemeModifier,

    AsyncModal,
    ActionDialogMixin,
    CancelButtonProviderMixin,
    SubmitButtonProviderMixin,
    AbstractDialogModifier,
    Modal,
    ConfirmDialog,
    PromptDialog,
    ServerPromptDialog,
    ActivityWarningDialog,
    PromptValidators,

    Loader,
    Router,
    MessageBar,
    NetworkLoader,
    HiddenDownloadForm,
    withProgressiveBg,

    PydioContextProvider,
    PydioContextConsumer,

    Tooltip,
    M3Tooltip,
    moment,

    TasksPanel,
    JobsStore,
    SingleJobProgress,
    JobEntry,
    useRunningTasksMonitor
}