/*
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
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var JobsStore = (function (_Observable) {
    _inherits(JobsStore, _Observable);

    /**
     * @param pydio Pydio
     */

    function JobsStore(pydio) {
        var _this = this;

        _classCallCheck(this, JobsStore);

        _Observable.call(this);
        this.pydio = pydio;
        this.loaded = false;
        this.tasksList = new Map();
        this.localJobs = new Map();
        this.pydio.observe("task_message", function (jsonObject) {
            var Job = jsonObject.Job;
            var TaskUpdated = jsonObject.TaskUpdated;

            var job = _pydioHttpRestApi.JobsJob.constructFromObject(Job);
            var task = _pydioHttpRestApi.JobsTask.constructFromObject(TaskUpdated);
            if (job.Tasks === undefined) {
                job.Tasks = [task];
            }
            _this.tasksList.set(job.ID, job);
            _this.notify("tasks_updated");
        });

        this.pydio.observe("registry_loaded", function () {
            setTimeout(function () {
                _this.getJobs(true).then(function (res) {
                    _this.notify("tasks_updated");
                });
            }, 500);
        });
    }

    /**
     * @param forceRefresh bool
     * @return Promise
     */

    JobsStore.prototype.getJobs = function getJobs() {
        var _this2 = this;

        var forceRefresh = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        if (!this.pydio.user) {
            this.tasksList = new Map();
            this.localJobs = new Map();
            return Promise.resolve(this.tasksList);
        }

        if (!this.loaded || forceRefresh) {
            // Reset to local tasks only, then reload
            this.tasksList = this.localJobs;
            return new Promise(function (resolve, reject) {
                var api = new _pydioHttpRestApi.JobsServiceApi(_pydioHttpApi2['default'].getRestClient());
                var request = new _pydioHttpRestApi.JobsListJobsRequest();
                request.LoadTasks = _pydioHttpRestApi.JobsTaskStatus.constructFromObject('Running');
                api.userListJobs(request).then(function (result) {
                    _this2.loaded = true;
                    if (result.Jobs) {
                        result.Jobs.map(function (job) {
                            _this2.tasksList.set(job.ID, job);
                        });
                    }
                    resolve(_this2.tasksList);
                })['catch'](function (reason) {
                    reject(reason);
                });
            });
        } else {
            this.localJobs.forEach(function (j) {
                _this2.tasksList.set(j.ID, j);
            });
            return Promise.resolve(this.tasksList);
        }
    };

    /**
     * Get all tasks (running or not)
     * @return {Promise}
     */

    JobsStore.prototype.getAdminJobs = function getAdminJobs() {
        var owner = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
        var triggerType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        var api = new _pydioHttpRestApi.JobsServiceApi(_pydioHttpApi2['default'].getRestClient());
        var request = new _pydioHttpRestApi.JobsListJobsRequest();
        request.LoadTasks = _pydioHttpRestApi.JobsTaskStatus.constructFromObject('Any');
        if (owner !== null) {
            request.Owner = owner;
        } else {
            request.Owner = "*";
        }
        if (triggerType !== null) {
            if (triggerType === "schedule") {
                request.TimersOnly = true;
            } else if (triggerType === "events") {
                request.EventsOnly = true;
            }
        }
        return api.userListJobs(request);
    };

    /**
     * @param job JobsJob
     */

    JobsStore.prototype.enqueueLocalJob = function enqueueLocalJob(job) {
        this.localJobs.set(job.ID, job);
        this.notify("tasks_updated");
    };

    /**
     *
     * @param task JobsTask
     * @param status string
     * @return {Promise}
     */

    JobsStore.prototype.controlTask = function controlTask(task, status) {
        var _this3 = this;

        var api = new _pydioHttpRestApi.JobsServiceApi(_pydioHttpApi2['default'].getRestClient());
        var cmd = new _pydioHttpRestApi.JobsCtrlCommand();
        cmd.Cmd = _pydioHttpRestApi.JobsCommand.constructFromObject(status);
        cmd.TaskId = task.ID;
        if (status === 'Delete') {
            cmd.JobId = task.JobID;
        }
        return api.userControlJob(cmd).then(function () {
            if (status === 'Delete') {
                _this3.notify('tasks_updated');
            }
        });
    };

    /**
     * Delete a list of tasks
     * @param jobID
     * @param tasks [JobsTask]
     * @return {Promise<any>}
     */

    JobsStore.prototype.deleteTasks = function deleteTasks(jobID, tasks) {
        var _this4 = this;

        var api = new _pydioHttpRestApi.JobsServiceApi(_pydioHttpApi2['default'].getRestClient());
        var req = new _pydioHttpRestApi.JobsDeleteTasksRequest();
        req.TaskID = tasks.map(function (t) {
            return t.ID;
        });
        req.JobId = jobID;
        return api.userDeleteTasks(req).then(function () {
            _this4.notify('tasks_updated');
        });
    };

    /**
     * Delete all finished tasks for a given job
     * @param jobId
     * @return {Promise<any>}
     */

    JobsStore.prototype.deleteAllTasksForJob = function deleteAllTasksForJob(jobId) {
        var _this5 = this;

        var api = new _pydioHttpRestApi.JobsServiceApi(_pydioHttpApi2['default'].getRestClient());
        var req = new _pydioHttpRestApi.JobsDeleteTasksRequest();
        req.JobId = jobId;
        req.Status = [_pydioHttpRestApi.JobsTaskStatus.constructFromObject("Finished"), _pydioHttpRestApi.JobsTaskStatus.constructFromObject("Interrupted"), _pydioHttpRestApi.JobsTaskStatus.constructFromObject("Error")];
        return api.userDeleteTasks(req).then(function () {
            _this5.notify('tasks_updated');
        });
    };

    /**
     *
     * @param job
     * @param command
     * @return {Promise.<TResult>|*}
     */

    JobsStore.prototype.controlJob = function controlJob(job, command) {
        var _this6 = this;

        var api = new _pydioHttpRestApi.JobsServiceApi(_pydioHttpApi2['default'].getRestClient());
        var cmd = new _pydioHttpRestApi.JobsCtrlCommand();
        cmd.Cmd = _pydioHttpRestApi.JobsCommand.constructFromObject(command);
        cmd.JobId = job.ID;
        return api.userControlJob(cmd).then(function () {
            _this6.notify('tasks_updated');
        });
    };

    /**
     * @return {JobsStore}
     */

    JobsStore.getInstance = function getInstance() {
        if (!JobsStore.STORE_INSTANCE) {
            var pydio = global.pydio;

            JobsStore.STORE_INSTANCE = new JobsStore(pydio);
        }
        return JobsStore.STORE_INSTANCE;
    };

    return JobsStore;
})(_pydioLangObservable2['default']);

JobsStore.STORE_INSTANCE = null;

exports['default'] = JobsStore;
module.exports = exports['default'];
