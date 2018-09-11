import request from '@/utils/request'

export function fetchDemandList(data) {
  return request({
    url: '/api/manager/task/GetDemandList/',
    method: 'post',
    data
  })
}
export function fetchDemandDetail(id) {
  return request({
    url: '/api/manager/task/GetDemandDetail/',
    method: 'get',
    params: {
      id
    }
  })
}
export function handelState(data) {
  return request({
    url: '/api/manager/task/EditDemandState/',
    method: 'post',
    data
  })
}