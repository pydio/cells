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
import Observable from 'pydio/lang/observable'
import {JobsServiceApi, JobsListJobsRequest, JobsDeleteTasksRequest, JobsJob, JobsTask, JobsTaskStatus, JobsCtrlCommand, JobsCommand} from 'cells-sdk'
import PydioApi from 'pydio/http/api'
import Pydio from 'pydio'
import {debounce} from 'lodash'

class JobsStore extends Observable {

    /**
     * @param pydio Pydio
     */
    constructor(pydio){
        super();
        this.pydio = pydio;
        this.loaded = false;
        this.tasksList = new Map();
        this.tasksUpdates = new Map();
        this.localJobs = new Map();
        this.reloadPending = debounce(this.scanPending, 5000);
        this.pydio.observe("task_message", jsonObject => {

            const {Job, TaskUpdated, NanoStamp} = jsonObject;
            const job = JobsJob.constructFromObject(Job);
            const task = JobsTask.constructFromObject(TaskUpdated);
            if(NanoStamp > 0 && this.tasksUpdates.has(job.ID)){
                if(NanoStamp < this.tasksUpdates.get(job.ID)) {
                    // Ignore, this is not the last one
                    return;
                }
            }
            this.tasksUpdates.set(job.ID, NanoStamp);
            if (job.Tasks === undefined) {
                job.Tasks = [task];
            }
            this.tasksList.set(job.ID, job);
            this.notify("tasks_updated", job.ID);
            let hasPending = false;
            if (job.Tasks) {
                job.Tasks.forEach(task => {
                    if (task.Status === 'Running' && task.StatusMessage === 'Pending') {
                        hasPending = true;
                    }
                })
            }
            if (hasPending) {
                this.reloadPending();
            }
        });

        this.pydio.observe("registry_loaded", ()=>{
            setTimeout(()=>{
                this.getJobs(true).then(() =>{
                    this.notify("tasks_updated");
                });
            }, 500);
        });

    }

    scanPending() {
        if(!this.pydio.user || !this.tasksList || !this.tasksList.size){
            return;
        }
        let hasPending = false;
        this.tasksList.forEach(job => {
            if (job.Tasks) {
                job.Tasks.forEach(task => {
                    if (task.Status === 'Running' && task.StatusMessage === 'Pending') {
                        hasPending = true;
                    }
                })
            }
        });
        if (hasPending) {
            this.getJobs(true).then(() =>{
                this.notify("tasks_updated");
            });
        }
    }

    /**
     * @param forceRefresh bool
     * @return Promise
     */
    getJobs(forceRefresh = false){

        if(!this.pydio.user){
            this.tasksList = new Map();
            this.localJobs = new Map();
            return Promise.resolve(this.tasksList);
        }

        if(!this.loaded || forceRefresh) {
            // Reset to local tasks only, then reload
            this.tasksList = new Map();
            this.localJobs.forEach(j => {
                this.tasksList.set(j.ID, j);
            });
            const api = new JobsServiceApi(PydioApi.getRestClient());
            const request = new JobsListJobsRequest();
            request.LoadTasks = JobsTaskStatus.constructFromObject('Running');
            return api.userListJobs(request).then(result => {
                this.loaded = true;
                const jj = result.Jobs || []
                jj.map(job => this.tasksList.set(job.ID, job));
                return this.tasksList
            })
        } else {
            this.localJobs.forEach(j => {
                this.tasksList.set(j.ID, j);
            });
            return Promise.resolve(this.tasksList);
        }
    }

    /**
     * Get all tasks (running or not)
     * @return {Promise}
     */
    getAdminJobs(owner = null, triggerType = null, jobId = "", maxTasks = 0) {
        const api = new JobsServiceApi(PydioApi.getRestClient());
        const request = new JobsListJobsRequest();
        request.LoadTasks = JobsTaskStatus.constructFromObject('Any');
        if (owner !== null){
            request.Owner = owner;
        } else {
            request.Owner = "*";
        }
        if (maxTasks > 0) {
            request.TasksLimit = maxTasks;
        }
        if(jobId && jobId instanceof Array){
            request.JobIDs = jobId;
        } else if (jobId !== "") {
            request.JobIDs = [jobId];
        }
        if (triggerType !== null) {
            if (triggerType === "schedule") {
                request.TimersOnly = true;
            } else if(triggerType === "events") {
                request.EventsOnly = true;
            }
        }
        return api.userListJobs(request);
    }

    /**
     * @param job JobsJob
     */
    enqueueLocalJob(job){
        this.localJobs.set(job.ID, job);
        this.notify("tasks_updated", job.ID);
    }

    deleteLocalJob(jobID) {
        this.localJobs.delete(jobID);
        if(this.tasksList && this.tasksList.has(jobID)) {
            this.tasksList.delete(jobID);
        }
        this.notify("tasks_updated");
    }

    /**
     *
     * @param task JobsTask
     * @param status string
     * @return {Promise}
     */
    controlTask(task, status){
        const api = new JobsServiceApi(PydioApi.getRestClient());
        let cmd = new JobsCtrlCommand();
        cmd.Cmd = JobsCommand.constructFromObject(status);
        cmd.TaskId = task.ID;
        if(status === 'Delete'){
            cmd.JobId = task.JobID;
        }
        return api.userControlJob(cmd).then(()=>{
            if (status === 'Delete') {
                this.notify('tasks_updated', task.JobID);
            }
        });
    }

    /**
     * Delete a list of tasks
     * @param jobID
     * @param tasks [JobsTask]
     * @return {Promise<any>}
     */
    deleteTasks(jobID, tasks){
        const api = new JobsServiceApi(PydioApi.getRestClient());
        const req = new JobsDeleteTasksRequest();
        req.TaskID = tasks.map(t => t.ID);
        req.JobId = jobID;
        return api.userDeleteTasks(req).then(()=>{
            this.notify('tasks_updated', jobID);
        })
    }

    /**
     * Delete all finished tasks for a given job
     * @param jobId
     * @return {Promise<any>}
     */
    deleteAllTasksForJob(jobId) {
        const api = new JobsServiceApi(PydioApi.getRestClient());
        const req = new JobsDeleteTasksRequest();
        req.JobId = jobId;
        req.Status = [
            JobsTaskStatus.constructFromObject("Finished"),
            JobsTaskStatus.constructFromObject("Interrupted"),
            JobsTaskStatus.constructFromObject("Error"),
        ];
        return api.userDeleteTasks(req).then(()=>{
            this.notify('tasks_updated', jobId);
        })
    }

    /**
     *
     * @param job
     * @param command
     * @return {Promise.<TResult>|*}
     */
    controlJob(job, command) {
        const api = new JobsServiceApi(PydioApi.getRestClient());
        let cmd = new JobsCtrlCommand();
        cmd.Cmd = JobsCommand.constructFromObject(command);
        cmd.JobId = job.ID;
        return api.userControlJob(cmd).then(()=>{
            this.notify('tasks_updated', job.ID);
        });
    }


    /**
     * @return {JobsStore}
     */
    static getInstance(){
        if (!JobsStore.STORE_INSTANCE) {
            const {pydio} = global;
            JobsStore.STORE_INSTANCE = new JobsStore(pydio);
        }
        return JobsStore.STORE_INSTANCE;
    }

    /**
     * Post a fake job to open panel and work on component UX
     */
    static debugFakeJob(id = 'local-debug-fake-job'){
        const pydio = Pydio.getInstance();
        const job = new JobsJob();
        job.ID = id;
        job.Owner = pydio.user.id;
        job.Label = 'Fake job title';
        job.Stoppable = true;
        const task = new JobsTask();
        job.Tasks = [task];
        task.HasProgress = true;
        task.Progress = 0.7;
        task.ID = "debug-task";
        task.Status = JobsTaskStatus.constructFromObject('Running');
        task.StatusMessage = 'this is my task currently running status... It may be a long text';
        JobsStore.getInstance().enqueueLocalJob(job);
    }


}

JobsStore.STORE_INSTANCE = null;

export {JobsStore as default}