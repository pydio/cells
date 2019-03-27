'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
    function Task(session) {
        var _this = this;

        _classCallCheck(this, Task);

        pydio = _pydio2.default.getInstance();
        this.job = new JobsJob();
        this.job.ID = 'local-upload-task-' + session.getId();
        this.job.Owner = pydio.user.id;
        this.job.Label = pydio.MessageHash['html_uploader.7'];
        this.job.Stoppable = true;
        var task = new JobsTask();
        this.task = task;
        this.job.Tasks = [this.task];
        this.task.HasProgress = true;
        this.task.ID = "upload";
        this.task.Status = JobsTaskStatus.constructFromObject('Idle');
        this.job.openDetailPane = function () {
            pydio.Controller.fireAction("upload");
        };

        task._statusObserver = function (s) {
            if (s === 'analyse') {
                _this.job.Label = 'Preparing files for upload';
                if (session.getChildren().length) {
                    task.StatusMessage = 'Analyzing (' + session.getChildren().length + ') items';
                } else {
                    task.StatusMessage = 'Please wait...';
                }
                task.Status = JobsTaskStatus.constructFromObject('Running');
            } else if (s === 'ready') {
                _this.job.Label = pydio.MessageHash['html_uploader.7'];
                task.StatusMessage = 'Ready to upload';
                task.Status = JobsTaskStatus.constructFromObject('Idle');
            } else if (s === 'paused') {
                _this.job.Label = 'Task paused';
                task.Status = JobsTaskStatus.constructFromObject('Paused');
            }
            _this.notifyMainStore();
        };
        task._progressObserver = function (p) {
            task.Progress = p / 100;
            task.Status = JobsTaskStatus.constructFromObject('Running');
            if (p > 0) {
                task.StatusMessage = 'Uploading ' + Math.ceil(p) + '%';
            }
            _this.notifyMainStore();
        };
        session.observe('status', task._statusObserver);
        session.observe('progress', task._progressObserver);

        task._statusObserver(session.getStatus());
        task._progressObserver(session.getProgress());

        JobsStore.getInstance().enqueueLocalJob(this.job);
    }

    _createClass(Task, [{
        key: 'setIdle',
        value: function setIdle() {
            this.task.Status = JobsTaskStatus.constructFromObject('Idle');
            this.task.StatusMessage = '';
            this.notifyMainStore();
        }
    }, {
        key: 'notifyMainStore',
        value: function notifyMainStore() {
            this.task.StartTime = new Date().getTime() / 1000;
            this.job.Tasks = [this.task];
            JobsStore.getInstance().enqueueLocalJob(this.job);
        }
    }], [{
        key: 'create',
        value: function create(session) {
            return new Task(session);
        }
    }]);

    return Task;
}();

exports.default = Task;
