<template>
  <div class="app-container">
    <div style="margin-bottom:20px;">
      <el-button type="danger" plain @click="deleteSelection()">删除</el-button>
      <el-button type="primary" plain @click="toggleSelection()">取消选择</el-button>
    </div>
    <el-table :data="userList" :empty-text='emptytext' v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row ref="multipleTable" @selection-change="handleSelectionChange">
      >
      <el-table-column type="selection" width="70" align="center">
      </el-table-column>
      <el-table-column label="ID" width="400" align="center">
        <template slot-scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="150" align="center">
        <template slot-scope="scope">
          {{scope.row.userName}}
        </template>
      </el-table-column>
      <el-table-column label="电话" width="200" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.phoneNumber}}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.email}}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="400" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.setRoles}}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="操作" align="center" width='400' fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handlEdieUser(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="success" @click="resetpass(scope.$index, scope.row)">重置密码</el-button>
          <el-button size="mini" type="warning" @click="handelupdatePass(scope.$index, scope.row)">修改密码</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="CurrentPage" :page-sizes="[20,50, 150, 200, 250]" :page-size="PageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalCount">
    </el-pagination>

    <!--编辑页面-->
    <el-dialog title="编辑用户信息" :visible.sync="userVisible">
      <el-form :model="editUser" :rules="editUserRules" ref="editUserRuleForm">
        <el-form-item label="电话" :label-width="formLabelWidth" prop='phoneNumber'>
          <el-input v-model="editUser.phoneNumber" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth" prop='email'>
          <el-input v-model="editUser.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色" :label-width="formLabelWidth">
          <el-checkbox-group v-model="editUser.roleNames">
            <el-checkbox v-for="setRoles in setRoleList" :label="setRoles.name" :key="setRoles.id" :checked="checked" @change="checked=!checked" :value="setRoles.id"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveUser(editUser)">更 新</el-button>
      </div>
    </el-dialog>
    <!--修改用户密码-->

    <el-dialog title="修改用户密码" :visible.sync="updatePassVisible">
      <el-form :model="updatePass" status-icon :rules="rules2" ref="updatePassRuleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="旧密码" :label-width="formLabelWidth" prop='oldPass'>
          <el-input type="password" v-model="updatePass.oldPass" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码" :label-width="formLabelWidth" prop="newPass">
          <el-input type="password" v-model="updatePass.newPass" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" :label-width="formLabelWidth" prop="sureNewPass">
          <el-input type="password" v-model="updatePass.sureNewPass" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updatePassVisible = false">取 消</el-button>
        <el-button type="primary" @click="savePass(updatePass)">更 新</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Vue from "vue";
import {
  fetchUserList,
  fetchUserDetail,
  handelEditUser,
  ResetUserPass,
  changeUserPass,
  DeleteUser,
  deleteUsers
} from "@/api/userList";
import { isvalidateEmail, validatePhoneNumber } from "@/utils/validate";
export default {
  data() {
    var validateOldDPass = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入密码"));
      } else {
        return callback(); // 还有这里，确保每个验证函数都要有
      }
    };
    var validatePass = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入密码"));
      } else {
        if (this.updatePass.sureNewPass !== "") {
          this.$refs.updatePassRuleForm.validateField("sureNewPass");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.updatePass.newPass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    var validatephoneNumber = (rule, value, callback) => {
      if (!validatePhoneNumber(value)) {
        callback(new Error("请输入正确的手机号"));
      } else {
        callback();
      }
    };
    var validateEmail = (rule, value, callback) => {
      if (!isvalidateEmail(value)) {
        callback(new Error("请输入正确的邮箱"));
      } else {
        callback();
      }
    };
    return {
      userList: [],
      emptytext: "暂无数据",
      listLoading: true,
      editUser: {
        userName: "",
        phoneNumber: "",
        email: "",
        index: "",
        RoleNames: []
      },
      editUserRules: {
        phoneNumber: [{ validator: validatephoneNumber, trigger: "blur" }],
        email: [{ validator: validateEmail, trigger: "blur" }]
      },
      checked: false,
      setRoleList: [
        {
          name: "admin",
          id: 0
        },
        {
          name: "editor",
          id: 1
        },
        {
          name: "其他",
          id: 2
        }
      ],
      formLabelWidth: "70px",
      userVisible: false,
      CurrentPage: 1,
      totalCount: 0,
      PageSize: 20,
      multipleSelection: [], //存放目前选中的所有项
      updatePass: {
        id: "",
        userName: "",
        oldPass: "",
        newPass: "",
        sureNewPass: ""
      },
      rules2: {
        oldPass: [{ validator: validateOldDPass, trigger: "blur" }],
        newPass: [{ validator: validatePass, trigger: "blur" }],
        sureNewPass: [{ validator: validatePass2, trigger: "blur" }]
      },
      updatePassVisible: false
    };
  },
  created() {
    this.fetchData();
  },

  methods: {
    //获取用户列表
    fetchData() {
      this.listLoading = true;
      fetchUserList({ page: this.CurrentPage, limit: this.PageSize }).then(
        response => {
          if (response.data.total > 0) {
            if (response.data.code == 0) {
              this.userList = response.data.items;
              this.totalCount = response.data.total;
              this.listLoading = false;
            } else {
              this.listLoading = false;
              this.userList = [];
              this.totalCount = 0;
              this.emptytext = "暂无数据";
            }
          } else {
            this.listLoading = false;
            this.userList = [];
            this.totalCount = 0;
            this.emptytext = "暂无数据";
          }
        }
      );
    },

    //编辑用户信息
    handlEdieUser(index, row) {
      this.userVisible = true;
      console.log(row);
      //获取用户详细信息
      fetchUserDetail(row.id).then(res => {
        console.log(res);
        if (res.data.code == 0) {
          this.editUser = row;
          this.editUser.roleNames = row.setRoles.split(",");
        }
      });
    },

    //更新用户数据
    saveUser(editUser) {
      var data = {
        id: editUser.id,
        phoneNumber: editUser.phoneNumber,
        email: editUser.email,
        roleNames: editUser.roleNames
      };
      this.$refs.editUserRuleForm.validate(valid => {
        if (valid) {
          handelEditUser(data).then(res => {
            console.log(res);
            if (res.data.code == 0) {
              this.userVisible = false;
              this.$message.success(res.data.msg);
            } else {
              this.$message.error(res.data.msg);
            }
          });
        }
      });
    },

    //重置密码
    resetpass(index, row) {
      this.$confirm(
        "确定要重置用户：" + row.userName + "的密码?",
        "密码重置确认",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        }
      )
        .then(() => {
          console.log(row.id);
          ResetUserPass(row.id).then(res => {
            console.log(res);
            if (res.data.code == 0) {
              this.$message.success(
                "" + row.userName + "用户" + res.data.msg + ""
              );
            } else {
              this.$message.error(
                "" + row.userName + "用户" + res.data.msg + ""
              );
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消重置密码"
          });
        });
    },
    //显示修改密码弹框
    handelupdatePass(index, row) {
      this.updatePassVisible = true;
      this.updatePass = row;
    },

    //保存修改修改密码
    savePass(updatePass) {
      this.$confirm(
        "确定要修改用户：" + updatePass.userName + "的密码?",
        "密码修改确认",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        }
      )
        .then(() => {
          var passData = {
            id: updatePass.id,
            oldPass: updatePass.oldPass,
            newPass: updatePass.newPass,
            sureNewPass: updatePass.sureNewPass
          };
          this.$refs.updatePassRuleForm.validate(valid => {
            if (valid) {
              changeUserPass(passData).then(res => {
                console.log(res);
                if (res.data.code == 0) {
                  this.updatePassVisible = false;
                  this.$message.success(
                    "" + updatePass.userName + "" + res.data.msg + ""
                  );
                } else {
                  this.$message.error(
                    "" + updatePass.userName + "" + res.data.msg + ""
                  );
                }
              });
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消重置密码"
          });
        });
    },

    //删除用户
    handleDelete(index, row) {
      this.$confirm(
        "此操作将永久删除用户" + row.userName + ", 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          DeleteUser(row.id).then(deleres => {
            console.log(deleres);
            if (deleres.data.code == 0) {
              this.userList = deleres.data.userData;
              this.totalCount = deleres.data.total;
              this.$message.success(
                "" + row.userName + "用户" + deleres.data.msg + ""
              );
            } else {
              this.$message.error(
                "" + row.userName + "用户" + deleres.data.msg + ""
              );
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },

    //批量删除用户
    deleteSelection(index, rows) {
      if (this.multipleSelection.length == 0) return;
      var array = [];
      this.multipleSelection.forEach(rows => {
        array.push(rows.id);
      });
      this.$confirm("此操作将永久删除数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteUsers(array).then(deleres => {
            console.log(deleres);
            if (deleres.data.code == 0) {
              this.userList = deleres.data.data;
              this.totalCount = deleres.data.total;
              this.$message.success(
                "" + array.length + "个用户" + deleres.data.msg + ""
              );
            } else {
              this.$message.error(deleres.data.msg);
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },

    //取消选择
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    //分页
    handleSizeChange(val) {
      this.PageSize = val;
      this.handleSizeChange();
    },
    handleCurrentChange(val) {
      this.CurrentPage = val;
      this.handleCurrentChange();
    }

    //修改角色弹出框
    // handleSetUserRole(row) {
    //   this.setRolesVisible = true;
    //   this.axios.get('/api/user/GetRoles').then(roleData => {
    //     console.log(roleData);
    //     if (roleData.data.code == 0) {
    //       this.setRoleList = roleData.data.data;
    //     } else {
    //       this.$message.error('获取角色列表失败')
    //     }
    //   })
    // }
  }
};
</script>

<style>
.el-pagination {
  padding: 30px 5px;
  text-align: center;
}
</style>
