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
