import Mock from 'mockjs'
import { param2Obj } from '@/utils'
const demandData = []
const count = 100
var data
for (let i = 0; i < count; i++) {
  demandData.push(Mock.mock({
    id: '@increment',
    activityId: '@natural',
    userId: '@id',
    author: '@first',
    reviewer: '@first',
    title: '@title(5, 10)',
    describe: '@paragraph',
    forecast: '@float(0, 100, 2, 2)',
    importance: '@integer(1, 3)',
    'type|1': ['CN', 'US', 'JP', 'EU'],
    'status|1': ['published', 'draft', 'deleted'],
    creationTime: '@datetime',
    comment_disabled: true,
    pageviews: '@integer(300, 5000)',
    platforms: ['a-platform'],
    state: "@boolean",
    'fileList|1-10': [{
      id: '@increment',
      demandId: '@increment',
      creationTime: '@datetime',
      path: '@IMG(200x100,#FFF, Hello Mock.js!)'
    }]
  }))
}
export default {
  //需求列表
  GetdemandList: config => {
    const { id, activityId, userId, begintime, endtime, state, page = 1, limit = 20 } = param2Obj(config.url)
    let mockList = demandData.filter(item => {
      if (id && (item.id).toString() != id) return false
      if (activityId && (item.activityId).toString() != activityId) return false
      if (userId && (item.userId).toString() != userId) return false
      if (state && (item.state).toString() !== state) return false
      if (begintime && (item.creationTime).replace(/\s/g, "+") < begintime) return false
      if (endtime && (item.creationTime).replace(/\s/g, "+") > endtime) return false
      return true
    })
    const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))
    return {
      code: 0,
      total: mockList.length, //线报总数
      items: pageList,     //每一页显示的数据
    }
  },
  //编辑需求状态
  editDemandState: config => {
    const { id, state } = JSON.parse(config.body)   //post请求
    // const { id, state } = param2Obj(config.url)   //get请求
    demandData.some(k => {
      if (k.id == id) {
        k.state == state
        data = {
          code: 0,
          msg: '状态修改成功'
        }
        return true
      } else {
        data = {
          code: 1,
          msg: '参数错误'
        }
      }
      return false
    })
    return data
  },
  //需求详细信息
  GetdemandDetail: config => {

    const { id } = param2Obj(config.url)   //get请求

    demandData.some(item => {
      if (item.id === JSON.parse(id)) {
        data = {
          code: 0,
          msg: '获取成功'
        }
        return true
      } else {
        data = {
          code: 1,
          msg: '获取失败'
        }
      }
      return false
    })
    return data
  },
}
