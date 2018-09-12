import Mock from 'mockjs'
import { param2Obj } from '@/utils'
import { isvalidateEmail, validatePhoneNumber } from "@/utils/validate";
let userData = []
const count = 30
var data
for (let i = 0; i < count; i++) {
  userData.push(Mock.mock({
    id: '@increment',
    userName: '@first',
    phoneNumber: '@string("number", 11)',
    email: '@email',
    password: 'a123456',
    'setRoles|1': ['admin', 'editor', '其他'],
  }))
}
export default {
  GetUserList: config => {
    const { id, title, isEnable, page = 1, limit = 20 } = param2Obj(config.url)
    let mockList = userData.filter(item => {
      if (id && item.id != id) return false
      if (title && (item.title).indexOf(title) < 0) return false
      if (isEnable != null) {
        if (item.isEnable !== JSON.parse(config.body).isEnable) {
          return false
        }
      }
      return true
    })
    const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))
    return {
      code: 0,
      total: mockList.length, //线报总数
      items: pageList,     //每一页显示的数据
    }
  },
  //获取用户信息
  getUserDetail: config => {
    const { id } = param2Obj(config.url)
    userData.some(item => {
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

  //编辑用户信息
  editUser: config => {
    const { id, phoneNumber, email, roleNames } = JSON.parse(config.body)
    if (validatePhoneNumber(phoneNumber) && isvalidateEmail(email)) {
      userData.some(item => {
        if (item.id == id) {
          item.phoneNumber = phoneNumber,
            item.email = email,
            item.setRoles = roleNames.join(",")
          data = {
            code: 0,
            item,
            msg: '编辑成功'
          }
          return true
        } else {
          data = {
            code: 1,
            msg: '编辑失败'
          }
        }
        return false
      })
      return data
    } else {
      data = { msg: '请输入正确的手机号和邮箱' }
      return data
    }
  },
  //重置密码
  resetPass: config => {
    const { id } = JSON.parse(config.body)
    userData.some(item => {
      if (item.id === JSON.parse(id)) {
        item.password == '123456'
        data = {
          code: 0,
          msg: '密码重置成功'
        }
        return true
      } else {
        data = {
          code: 1,
          msg: '密码重置失败'
        }
      }
      return false
    })
    return data
  },
  //修改密码
  updateUserPass: config => {
    const { id, newPass, sureNewPass } = JSON.parse(config.body)
    if (newPass != undefined && sureNewPass != undefined) {
      userData.some(item => {
        if (item.id === JSON.parse(id)) {
          data = {
            code: 0,
            msg: '密码修改成功'
          }
          return true
        } else {
          data = {
            code: 1,
            msg: '密码修改失败'
          }
        }
        return false
      })
      return data
    } else {
      data = { msg: '参数不能为空' }
      return data
    }
  },
  //单条删除数据
  deleteUser: config => {
    const { id } = JSON.parse(config.body)
    userData.some(item => {
      if (item.id === JSON.parse(id)) {
        userData = userData.filter(k => k.id != id)
        data = {
          code: 0,
          msg: '删除成功',
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
  batchDeleteUser: config => {
    const { ids } = JSON.parse(config.body)
    userData = userData.filter(item => {
      if (ids.indexOf(item.id) === -1) return true
    })
    return {
      code: 0,
      msg: "删除成功"
    }
  }
}