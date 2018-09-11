<template>
  <div class="app-container">
    <div style="margin-bottom:20px;background:#f3f3f3;height:84px;padding:0px 20px;">
      <el-form ref="taskForm" :model="taskForm" :inline="true" style="margin-bottom:20px;width:90%;float:left">
        <el-row :gutter="20">
          <el-col style="width:200px">
            <div class="grid-content bg-purple">
              <el-form-item label="编号：">
                <el-input v-model="taskForm.id" style="width:100px"></el-input>
              </el-form-item>
            </div>
          </el-col>
          <el-col style="width:500px">
            <div class="grid-content bg-purple">
              <el-form-item label="标题：">
                <el-input v-model="taskForm.title" style="width:300px"></el-input>
              </el-form-item>
            </div>
          </el-col>
          <el-col style="width:500px">
            <div class="grid-content bg-purple">
              <el-form-item label="时间">
                <el-date-picker v-model="taskForm.dateTime" type="datetimerange" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right">
                </el-date-picker>
              </el-form-item>
            </div>
          </el-col>
          <el-col style="width:200px">
            <div class="grid-content bg-purple" style="width:200px">
              <el-form-item label="状态">
                <el-radio-group v-model="taskForm.isEnable">
                  <el-radio v-for="states in statelist" :key="states.id" :label="states.id">
                    {{states.value}}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
          </el-col>
          <el-col style="width:70px;margin-left:30px">
            <div class="grid-content bg-purple">
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="onSearch()">搜索</el-button>
              </el-form-item>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <el-button type="danger" @click="addTask()" style="float:right;margin-top:20px">+新增活动</el-button>
    </div>
    <!-- 活动列表 -->
    <el-table :data="taskData" :empty-text='emptytext' v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row ref="multipleTable">
      <el-table-column label="编号" width="80" align="center">
        <template slot-scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column label="活动标题">
        <template slot-scope="scope">
          <!-- <router-link to="{path:'/demand/demand',params:{id:row.Id}}"> -->
          <span class="title" @click="goDemand(scope.$index, scope.row)">{{ scope.row.title }}</span>
          <!-- </router-link> -->
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="发布时间" width="300">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.creationTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="结束时间" width="300">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.endTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="审核状态" width="100">
        <template slot-scope="scope">
          <span>{{convert(scope.row.isEnable)}}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="操作" width="220" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="handleTask(scope.$index, scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="grid-content bg-purple">
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="curPage" :page-sizes="[20,50]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalCount">
          </el-pagination>
        </div>
      </el-col>
    </el-row>

    <!--编辑活动页面-->
    <el-dialog title="编辑活动信息" :visible.sync="taskVisible">
      <el-form :model="editTask">
        <el-form-item label="标题" :label-width="formLabelWidth">
          <el-input v-model="editTask.title" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" :label-width="formLabelWidth">
          <quill-editor ref="taskEditor" v-model="editTask.describe" :options="editorOption">
          </quill-editor>
        </el-form-item>
        <el-form-item label="费用" :label-width="formLabelWidth" prop='Expenses'>
          <el-input v-model="editTask.expenses" placeholder="请输入费用">
          </el-input>
        </el-form-item>
        <el-form-item label="状态" :label-width="formLabelWidth">
          <el-switch style="display: block" v-model="editTask.isEnable" active-color="#13ce66" inactive-color="#ff4949" :active-value="true" :inactive-value="false" active-text="已审" inactive-text="未审" @change="convert(isEnable)">
          </el-switch>
        </el-form-item>
        <el-form-item label="上传主图" :label-width="formLabelWidth" prop='Image'>
          <el-upload class="avatar-uploader" v-model="editTask.image" action="http://localhost:9528/api/manager/task/UploadFile" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="结束时间" :label-width="formLabelWidth" prop='endTime'>
          <el-date-picker v-model="editTask.endTime" type="datetime" placeholder="选择日期时间" default-time="12:00:00">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveTask()">更 新</el-button>
        <el-button @click="taskVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <!--新增活动界面-->
    <el-dialog title="新增活动" :visible.sync="addVisible">
      <el-form :model="addTaskForm" :rules="addTaskRules" ref="addTaskForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="标题" :label-width="formLabelWidth" prop='title'>
          <el-input v-model="addTaskForm.title" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" :label-width="formLabelWidth" prop='describe'>
          <quill-editor ref="taskAdd" v-model="addTaskForm.describe" :options="addOption">
          </quill-editor>
        </el-form-item>
        <el-form-item label="费用" :label-width="formLabelWidth" prop='expenses'>
          <el-input v-model="addTaskForm.expenses" placeholder="请输入费用">
          </el-input>
        </el-form-item>
        <el-form-item label="状态" :label-width="formLabelWidth">
          <div style="margin-top: 20px">
            <el-radio-group v-model="addTaskForm.isEnable" size="small">
              <el-radio border v-for='Enablevalue in isEnableList' :label="Enablevalue.value" :key='Enablevalue.id'>{{Enablevalue.name}}</el-radio>
              <!-- <el-radio label="true" border>已审</el-radio>
              <el-radio label="false" border>未审</el-radio> -->
            </el-radio-group>
          </div>
        </el-form-item>
        <el-form-item label="上传主图" :label-width="formLabelWidth" prop='image'>
          <el-upload class="avatar-uploader" v-model="addTaskForm.image" action="http://localhost:9528/api/manager/task/UploadFile" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="结束时间" :label-width="formLabelWidth" prop='endTime'>
          <el-date-picker v-model="addTaskForm.endTime" type="datetime" placeholder="选择日期时间" default-time="12:00:00">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveaddTaskForm(addTaskForm)">增 加</el-button>
        <el-button @click="addVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Vue from "vue";

import {
  fetchTaskList,
  fetchTaskDetail,
  saveEditTask,
  handelAddTask
} from "@/api/task";
var moment = require("moment");
import { quillEditor } from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
export default {
  data() {
    return {
      emptytext: "暂无数据",
      taskData: [],
      postfile: "",
      listLoading: true,
      editTask: {
        id: "",
        title: "",
        describe: "",
        endTime: "",
        expenses: "",
        isEnable: "",
        image: ""
      },
      editorOption: {},
      formLabelWidth: "80px",
      taskVisible: false,
      curPage: 1,
      totalCount: 0,
      pageSize: 20,
      multipleSelection: [], // 存放目前选中的所有项。
      taskForm: {
        id: "",
        title: "",
        isEnable: "",
        dateTime: [new Date().setDate(new Date().getDate() - 3), new Date()]
      },
      statelist: [
        {
          value: "已审",
          id: true
        },
        {
          value: "未审",
          id: false
        }
      ],
      isEnableList: [
        {
          name: "已审",
          value: true
        },
        {
          name: "未审",
          value: false
        }
      ],
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近二个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 60);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      addTaskForm: {
        title: "",
        describe: "",
        endTime: "",
        expenses: "",
        image: "",
        isEnable: ""
      },
      addTaskRules: {},
      fileList: [],
      addOption: {},
      addVisible: false,
      imageUrl: ""
    };
  },
  components: {
    quillEditor
  },
  created() {
    this.fetchData();
  },
  methods: {
    // 获取活动列表页
    fetchData() {
      this.listLoading = true;
      var data = {
        id: this.taskForm.id,
        title: this.taskForm.title,
        begintime: moment(this.taskForm.dateTime[0]).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        endtime: moment(this.taskForm.dateTime[1]).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        isEnable: this.taskForm.isEnable,
        Page: this.curPage,
        PageSize: this.pageSize
      };
      fetchTaskList(data).then(response => {
        if (response.data.code == 0) {
          if (response.data.total > 0) {
            this.taskData = response.data.items;
            this.totalCount = response.data.total;
            this.listLoading = false;
          } else {
            this.taskData = [];
            this.totalCount = 0;
            this.listLoading = false;
            this.emptytext = "暂无数据";
          }
        }
      });
    },

    // 搜索活动列表
    onSearch() {
      this.fetchData();
    },

    // 编辑任务,获取任务详细
    handleTask(index, row) {
      this.taskVisible = true;
      fetchTaskDetail(row.id).then(response => {
        if (response.data.code == 0) {
          this.editTask = row;
          this.imageUrl = this.editTask.image;
        } else {
          this.$message.error(response.data.msg);
        }
      });
    },

    saveTask() {
      var data = {
        id: this.editTask.id,
        title: this.editTask.title,
        expenses: this.editTask.expenses,
        isEnable: this.editTask.isEnable,
        // image: editTask.image,
        endTime: moment(this.editTask.endTime).format("YYYY-MM-DD HH:mm:ss")
      };
      if (this.editTask.expenses != "") {
        saveEditTask(data).then(res => {
          if (res.data.code == 0) {
            this.taskVisible = false;
            this.$message.success(res.data.msg);
          } else {
            this.$message.error(res.data.msg);
          }
        });
      } else {
        this.$message.error("费用不能为空");
      }
    },

    // 编辑活动状态转换
    convert(isEnable) {
      if (isEnable == true) {
        return "已审";
      } else if (isEnable == false) {
        return "未审";
      }
    },

    // 每页显示数据量变更
    handleSizeChange(val) {
      this.pageSize = val;
      console.log(val);
      this.fetchData();
    },
    handleCurrentChange(val) {
      this.curPage = val;
      this.fetchData();
    },

    // 新增活动、
    addTask() {
      this.addVisible = true;
      this.imageUrl = "";
      this.addTaskForm = {};
    },

    // 保存新增活动数据
    saveaddTaskForm(addTaskForm) {
      var addData = {
        title: addTaskForm.title,
        describe: addTaskForm.describe,
        endTime: moment(addTaskForm.endTime).format("YYYY-MM-DD HH:mm:ss"),
        expenses: addTaskForm.expenses,
        isEnable: addTaskForm.isEnable
        // image: this.imageUrl
      };
      if (
        this.addTaskForm.title != undefined &&
        this.addTaskForm.describe != undefined &&
        this.addTaskForm.expenses != undefined &&
        this.addTaskForm.isEnable != undefined &&
        this.addTaskForm.endTime != undefined
      ) {
        handelAddTask(addData).then(res => {
          if (res.data.code == 0) {
            this.fetchData();
            this.$message.success(res.data.msg);
            this.addVisible = false;
          } else {
            this.$message.error(res.data.msg);
          }
        });
      } else {
        this.$message.error("提示：标题、描述、费用、状态、结束时间不能为空");
      }
    },
    handleAvatarSuccess(res, file) {
      this.imageUrl = res.data;
      console.log(this.imageUrl);
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error("提示：上传头像图片大小不能超过 2MB!");
      }
      return isLt2M;
    },

    // 点击标题跳转到对应的需求页面
    goDemand(index, row) {
      this.$router.push({
        path: "/demand/demand",
        query: {
          id: row.id
        }
      });
    }
  }
};
</script>

<style>
.title:hover {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: #409eff;
  color: #409eff;
}
.el-pagination {
  padding: 30px 5px;
  text-align: center;
}

.el-form-item {
  margin-top: 22px;
}

.el-dialog {
  width: 60%;
  height: 90%;
  overflow-y: scroll;
  top: 5% !important;
  margin-top: 0px !important;
}

.el-dialog__body {
  padding: 0px 20px;
}

.ql-editor {
  min-height: 200px !important;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>






