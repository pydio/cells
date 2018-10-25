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

import Pydio from 'pydio'
const {JobsJob, JobsTask, JobsTaskStatus} = require('pydio/http/rest-api');
const {JobsStore} = Pydio.requireLib("boot");

class Task {

    constructor(){
        pydio = Pydio.getInstance();
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
        this.job.openDetailPane = () => {
            pydio.Controller.fireAction("upload");
        };
        JobsStore.getInstance().enqueueLocalJob(this.job);
    }

    setProgress(progress){
        this.task.Progress = progress;
        this.task.Status = JobsTaskStatus.constructFromObject('Running');
        this.notifyMainStore();
    }
    setPending(queueSize){
        this.task.StatusMessage = Pydio.getInstance().MessageHash['html_uploader.1'].replace('%s', queueSize);
        this.task.Status = JobsTaskStatus.constructFromObject('Idle');
        this.notifyMainStore();
    }
    setRunning(queueSize){
        this.task.Status = JobsTaskStatus.constructFromObject('Running');
        this.task.StatusMessage = Pydio.getInstance().MessageHash['html_uploader.2'].replace('%s', queueSize);
        this.notifyMainStore();
    }
    setIdle(){
        this.task.Status = JobsTaskStatus.constructFromObject('Idle');
        this.task.StatusMessage = '';
        this.notifyMainStore();
    }

    notifyMainStore(){
        this.task.startTime = (new Date).getTime() / 1000;
        this.job.Tasks = [this.task];
        JobsStore.getInstance().enqueueLocalJob(this.job);
    }

    static getInstance(){
        if(!Task.__INSTANCE) {
            Task.__INSTANCE = new Task();
        }
        return Task.__INSTANCE;
    }

}

export {Task as default}