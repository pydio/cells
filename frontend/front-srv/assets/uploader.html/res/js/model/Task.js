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
import {JobsJob, JobsTask, JobsTaskStatus} from 'cells-sdk'
const {JobsStore} = Pydio.requireLib("boot");
import StatusItem from './StatusItem'

class Task {

    /**
     * @param session {Session}
     */
    constructor(session){
        const pydio = Pydio.getInstance();
        this.job = new JobsJob();
        this.job.ID = 'local-upload-task-' + session.getId();
        this.job.Owner = pydio.user.id;
        const m = (id) => pydio.MessageHash['html_uploader.task.' + id] || id;
        this.job.Label = m('label');
        this.job.Stoppable = true;
        const task = new JobsTask();
        this.task = task;
        this.job.Tasks = [this.task];
        this.task.HasProgress = true;
        this.task.ID = "upload";
        this.task.Status = JobsTaskStatus.constructFromObject('Idle');
        this.job.openDetailPane = () => {
            pydio.Controller.fireAction("upload");
        };

        task._statusObserver = (s)=>{
            if(s === StatusItem.StatusFolders && session.getCreateFolders()) {
                this.job.Label = m('status.folders');
                const ff = session.getCreateFolders();
                if(ff > 1) {
                    task.StatusMessage = m('message.folder-many').replace('%s', ff)
                } else {
                    task.StatusMessage = m('message.folder-one')
                }
                task.Status = JobsTaskStatus.constructFromObject('Running');
            } else if(s === StatusItem.StatusAnalyze) {
                this.job.Label = m('status.analyse')
                const aa = session.getChildren().length;
                if (aa > 1) {
                    task.StatusMessage = m('message.analyse-many').replace('%s', aa)
                } else if (aa === 1){
                    task.StatusMessage = m('message.analyse-one')
                } else {
                    task.StatusMessage = m('message.analyse-wait');
                }
                task.Status = JobsTaskStatus.constructFromObject('Running');
            } else if(s === 'ready') {
                this.job.Label = m('7');
                task.StatusMessage = m('status.ready');
                task.Status = JobsTaskStatus.constructFromObject('Idle');
            } else if(s === 'paused'){
                this.job.Label = m('status.paused');
                task.Status = JobsTaskStatus.constructFromObject('Paused');
            } else if(s === 'loading') {
                this.job.Label = m('status.upload');
                task.Status = JobsTaskStatus.constructFromObject('Running');
            }
            this.notifyMainStore();
        };
        task._progressObserver = (p)=>{
            this.job.Label = m('status.upload');
            task.Progress = p / 100;
            task.Status = JobsTaskStatus.constructFromObject('Running');
            if (p > 0) {
                task.StatusMessage = m('message.upload-progress').replace('%s', Math.ceil(p));
            }
            this.notifyMainStore();
        };
        session.observe('status', task._statusObserver);
        session.observe('progress', task._progressObserver);

        task._statusObserver(session.getStatus());
        task._progressObserver(session.getProgress());

        JobsStore.getInstance().enqueueLocalJob(this.job);
    }


    setIdle(){
        if(this.task.Progress === 1) {
            JobsStore.getInstance().deleteLocalJob(this.job.ID);
            return;
        }
        this.task.Status = JobsTaskStatus.constructFromObject('Idle');
        this.task.StatusMessage = '';
        this.notifyMainStore();
    }

    notifyMainStore(){
        if(this.task.Progress === 1){
            return // do not enqueue finished sessions !
        }
        this.task.StartTime = (new Date).getTime() / 1000;
        this.job.Tasks = [this.task];
        JobsStore.getInstance().enqueueLocalJob(this.job);
    }

    static create(session){
        return new Task(session);
    }

}

export {Task as default}