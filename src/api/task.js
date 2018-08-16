import request from '@/utils/request'

export function fetchTaskList(query) {
  return request({
    url: '/api/manager/task/GetTaskList/',
    method: 'get',
    params: query
  })
}

export function fetchTaskDetail(id) {
  return request({
    url: '/api/manager/task/getTaskDetail/',
    method: 'get',
    params: {
      id
    }
  })
}
export function saveEditTask(data) {
  return request({
    url: '/api/manager/task/editTaskDetail/',
    method: 'post',
    data
  })
}
export function handelAddTask(data) {
  return request({
    url: '/api/manager/task/addTask/',
    method: 'post',
    data
  })
}