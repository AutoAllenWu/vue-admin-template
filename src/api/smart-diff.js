import request from '@/utils/diff-request'

export function getAllTasks(query) {
  return request({
    url: '/api/task/get_all_task',
    method: 'get',
    params: query
  })
}
export function getTaskDetail(query) {
  return request({
    url: '/api/task/get_task_detail',
    method: 'get',
    params: query
  })
}


export function rejectGptAdvice(data) {
  return request({
    url: '/api/gpt/reject',
    method: 'post',
    data
  })
}
export function resetGptAdvice(data) {
  return request({
    url: '/api/gpt/reset',
    method: 'post',
    data
  })
}

export function createGptCase(data) {
  return request({
    url: '/api/gpt/createCase',
    method: 'post',
    data
  })
}
export function createTaskApi(data) {
  return request({
    url: '/api/task/add',
    method: 'post',
    data
  })
}

export function addProjectApi(data) {
  return request({
    url: '/api/project/add',
    method: 'post',
    data
  })
}

export function getProjectTree() {
  return request({
    url: '/api/project/getAllTree',
    method: 'get',
  })
}

export function getProjectTList(query) {
  return request({
    url: '/api/project/getProjectList',
    method: 'get',
    params: query
  })
}

export function deleteProjectApi(data) {
  return request({
    url: '/api/project/delete',
    method: 'post',
    data
  })
}

export function updateProjectApi(data) {
  return request({
    url: '/api/project/update',
    method: 'post',
    data
  })
}

export function addGroupApi(data) {
  return request({
    url: '/api/group/add',
    method: 'post',
    data
  })
}

export function deleteGroupApi(data) {
  return request({
    url: '/api/group/delete',
    method: 'post',
    data
  })
}

export function updateGroupApi(data) {
  return request({
    url: '/api/group/update',
    method: 'post',
    data
  })
}

export function getConfigListApi(query) {
  return request({
    url: '/api/gpt/config/getList',
    method: 'get',
    params: query
  })
}

export function updateConfigApi(data) {
  return request({
    url: '/api/gpt/config/update',
    method: 'post',
    data
  })
}
