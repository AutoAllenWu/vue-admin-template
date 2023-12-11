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
