import request from '@/utils/request'

export function fetchUserList(query) {
  return request({
    url: '/api/user/GetUsers',
    method: 'get',
    params: query
  })
}
export function fetchUserDetail(id) {
  return request({
    url: '/api/user/GetUser',
    method: 'get',
    params: {
      id
    }
  })
}
export function handelEditUser(data) {
  return request({
    url: '/api/user/UpdateUser',
    method: 'post',
    data
  })
}
export function ResetUserPass(id) {
  return request({
    url: '/api/user/ResetUserPass',
    method: 'post',
    data: { id }
  })
}
export function changeUserPass(data) {
  return request({
    url: '/api/user/updateUserPass',
    method: 'post',
    data
  })
}
export function DeleteUser(id) {
  return request({
    url: '/api/user/DeleteUser',
    method: 'post',
    data: { id }
  })
}
export function deleteUsers(ids) {
  return request({
    url: '/api/user/deleteUsers',
    method: 'post',
    data: { ids }
  })
}