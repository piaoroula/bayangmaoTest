import Mock from 'mockjs'
import { param2Obj } from '@/utils'
var moment = require("moment");
const taskData = []
const count = 100
var data
for (let i = 0; i < count; i++) {
  taskData.push(Mock.mock({
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
    endTime: '@datetime',
    comment_disabled: true,
    pageviews: '@integer(300, 5000)',
    platforms: ['a-platform'],
    expenses: '',
    isEnable: "@boolean",
    'fileList|1-10': [{
      id: '@increment',
      demandId: '@increment',
      creationTime: '@datetime',
      path: '@IMG(200x100,#FFF, Hello Mock.js!)'
    }]
  }))
}
export default {
  //任务列表
  GettaskList: config => {
    const { id, title, begintime, endtime, isEnable, page = 1, limit = 20 } = param2Obj(config.url)
    let mockList = taskData.filter(item => {
      if (id && (item.id).toString() != id) return false
      if (title && (item.title).replace(/\s/g, "+") != title) return false
      if (isEnable && (item.isEnable).toString() !== state) return false
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

  //获取任务详情
  getTaskDetail: config => {
    const { id } = param2Obj(config.url)
    taskData.some(item => {
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

  //编辑任务详情
  editTaskDetail: config => {
    const { id, title, describe, expenses, isEnable, endTime } = JSON.parse(config.body)
    if (expenses != '') {
      taskData.some(item => {
        if (item.id == id) {
          item.title == title,
            item.expenses == expenses,
            item.isEnable == isEnable,
            item.describe == describe,
            // item.image == image,
            item.endTime == endTime
          data = {
            code: 0,
            msg: '修改成功',
          }
          return true
        } else {
          data = {
            code: 1,
            msg: '参数错误',
          }
        }
        return false
      })
      return data
    }
  },

  //新增任务
  addTask: config => {
    const { title, describe, expenses, isEnable, endTime } = JSON.parse(config.body)
    //获取最大的id值
    var idArry = [];
    taskData.forEach(item => {
      idArry.push(item.id)
    })
    var maxId = Math.max.apply(Math, idArry);
    console.log(maxId)
    if (title != undefined && describe != undefined && expenses != undefined && isEnable != undefined && endTime != undefined) {
      var addDta = {
        id: maxId + 1,
        title: title,
        describe: describe,
        expenses: expenses,
        isEnable: isEnable,
        creationTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        endTime: endTime,
      }
      taskData.splice(0, 0, addDta)
      return {
        code: 0,
        msg: '添加数据成功'
      }
    } else {
      return {
        code: 1,
        msg: '添加数据失败'
      }
    }
  }
}