import request from '@/utils/request'

export function getReportList(query) {
  return request({
    url: '/api/manager/report/GetList',
    method: 'get',
    params: query
  })
}

export function getReportDetail(id) {
  return request({
    url: '/api/manager/report/GetDetail',
    method: 'get',
    params: { id }
  })
}

export function editReportDetail(data) {
  return request({
    url: '/api/manager/report/Edit',
    method: 'post',
    data
  })
}

export function deleteReport(id) {
  return request({
    url: '/api/manager/report/Delete',
    method: 'post',
    data: {
      id
    }
  })
}

export function batchDeleteReport(ids) {
  return request({
    url: '/api/manager/report/batchDelete',
    method: 'post',
    data: {
      ids
    }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createReport(data) {
  return request({
    url: '/api/manager/report/addReport',
    method: 'post',
    data
  })
}


