import Mock from 'mockjs'
import { param2Obj } from '@/utils'
var moment = require("moment");
let reportData = []
let data
const count = 100

for (let i = 0; i < count; i++) {
  reportData.push(Mock.mock({
    id: '@increment',
    timestamp: +Mock.Random.date('T'),
    author: '@first',
    reviewer: '@first',
    title: '@title(5, 10)',
    content: '我是测试数据',
    creationTime: moment(new Date(new Date().getTime() - 1 * 5 * 60 * 1000)).format(
      "YYYY-MM-DD HH:mm:ss"
    ), //5分钟前
    state: "@boolean",
  }))
}
export default {
  //线报数据列表  
  GetList: config => {
    const { id, begintime, endtime, creationTime, title, state, page = 1, limit = 20, sort } = JSON.parse(config.body)
    let mockList = reportData.filter(item => {
      if (id && (item.id).toString() != id) return false
      if (begintime && item.creationTime < begintime) return false
      if (endtime && item.creationTime > endtime) return false
      if (state && item.state != state) return false
      if (title && (item.title).indexOf(title) < 0) return false   //title传过来的时候空格被序列化了，所以replace(/\s/g, "+")是将空格转化成+了
      return true
    })
    const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))
    return {
      code: 0,
      total: mockList.length, //线报总数
      items: pageList,     //每一页显示的数据
    }
  },

  //获取线报详细数据
  getReport: config => {
    const { id } = param2Obj(config.url)
    reportData.some(item => {
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

  //更新数据
  updateReport: config => {
    const { id, title, content } = JSON.parse(config.body)
    reportData.some(u => {
      if (u.id == id) {
        u.title = title
        u.content = content
        data = {
          code: 0,
          msg: '编辑成功'
        }
        return true
      } else {
        data = {
          code: 1,
          msg: '编辑失败'
        }
        return false
      }
    })
    return data
  },

  //删除数据
  deleteReport: config => {
    const { id } = JSON.parse(config.body)
    reportData.some(item => {
      if (item.id === JSON.parse(id)) {
        reportData = reportData.filter(k => k.id != id)
        data = {
          code: 0,
          msg: '删除成功',
          total: reportData.length,
          reportData
        }
        return true
      } else {
        data = {
          code: 1,
          msg: '删除失败'
        }
      }
      return false
    })
    return data
  },

  //批量删除
  batchremove: config => {
    let { ids } = JSON.parse(config.body)
    reportData = reportData.filter(e => {
      if (!ids) return false
      if (ids) return !ids.includes(e.id)
    })
    return {
      code: 0,
      msg: '删除成功',
      data: reportData,
      total: reportData.length
    }
  },
  //新增数据
  addReport: config => {
    const { title, content } = JSON.parse(config.body)
    //获取最大的id
    var arryId = [];
    reportData.forEach(item => {
      arryId.push(item.id);
    });
    var max2 = arryId.sort(function (a, b) {
      return b - a;
    })[0];
    var newId = max2 + 1;

    var time = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    if (title != undefined && content != undefined) {
      var addData = {
        id: newId,
        title: title,
        content: content,
        state: true,
        creationTime: time
      }
      reportData.splice(0, 0, addData)   //(0, 0, addData)，0为索引值，第二个0为添加1条数据，设置在表格的第一行添加数据
      data = {
        code: 0,
        msg: '添加成功',
      }
      return data
    }
  }

}
export { reportData };