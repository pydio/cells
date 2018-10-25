'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('pydio/http/rest-api'),
    JobsJob = _require.JobsJob,
    JobsTask = _require.JobsTask,
    JobsTaskStatus = _require.JobsTaskStatus;

var _Pydio$requireLib = _pydio2.default.requireLib("boot"),
    JobsStore = _Pydio$requireLib.JobsStore;

var Task = function () {
    function Task() {
        _classCallCheck(this, Task);

        pydio = _pydio2.default.getInstance();
        this.job = new JobsJob();
        this.job.ID = 'local-upload-task';
        this.job.Owner = pydio.user.id;
        this.job.Label = pydio.MessageHash['html_uploader.7'];
        this.job.Stoppable = true;
        this.task = new JobsTask();
        this.job.Tasks = [this.task];
        this.task.HasProgress = true;
        this.task.ID = "upload";
        this.task.Status = JobsTaskStatus.constructFromObject('Idle');
        this.job.openDetailPane = function () {
            pydio.Controller.fireAction("upload");
        };
        JobsStore.getInstance().enqueueLocalJob(this.job);
    }

    _createClass(Task, [{
        key: 'setProgress',
        value: function setProgress(progress) {
            this.task.Progress = progress;
            this.task.Status = JobsTaskStatus.constructFromObject('Running');
            this.notifyMainStore();
        }
    }, {
        key: 'setPending',
        value: function setPending(queueSize) {
            this.task.StatusMessage = _pydio2.default.getInstance().MessageHash['html_uploader.1'].replace('%s', queueSize);
            this.task.Status = JobsTaskStatus.constructFromObject('Idle');
            this.notifyMainStore();
        }
    }, {
        key: 'setRunning',
        value: function setRunning(queueSize) {
            this.task.Status = JobsTaskStatus.constructFromObject('Running');
            this.task.StatusMessage = _pydio2.default.getInstance().MessageHash['html_uploader.2'].replace('%s', queueSize);
            this.notifyMainStore();
        }
    }, {
        key: 'setIdle',
        value: function setIdle() {
            this.task.Status = JobsTaskStatus.constructFromObject('Idle');
            this.task.StatusMessage = '';
            this.notifyMainStore();
        }
    }, {
        key: 'notifyMainStore',
        value: function notifyMainStore() {
            this.task.startTime = new Date().getTime() / 1000;
            this.job.Tasks = [this.task];
            JobsStore.getInstance().enqueueLocalJob(this.job);
        }
    }], [{
        key: 'getInstance',
        value: function getInstance() {
            if (!Task.__INSTANCE) {
                Task.__INSTANCE = new Task();
            }
            return Task.__INSTANCE;
        }
    }]);

    return Task;
}();

exports.default = Task;
