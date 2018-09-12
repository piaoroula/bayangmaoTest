<template>
  <div class="app-container">
    <div style="margin-bottom:20px;background:#f3f3f3;height:84px;padding:0px 20px;">
      <el-form ref="reportForm" :model="reportForm" :inline="true" style="margin-bottom:20px;width:90%;float:left">
        <el-row :gutter="20">
          <el-col style="width:200px">
            <div class="grid-content bg-purple">
              <el-form-item label="编号：">
                <el-input v-model="reportForm.id" style="width:100px"></el-input>
              </el-form-item>
            </div>
          </el-col>
          <el-col style="width:500px">
            <div class="grid-content bg-purple">
              <el-form-item label="标题：">
                <el-input v-model="reportForm.title" style="width:300px"></el-input>
              </el-form-item>
            </div>
          </el-col>
          <el-col style="width:500px">
            <div class="grid-content bg-purple">
              <el-form-item label="时间">
                <el-date-picker v-model="reportForm.dateTime" type="datetimerange" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right">
                </el-date-picker>
              </el-form-item>
            </div>
          </el-col>
          <el-col style="width:200px">
            <div class="grid-content bg-purple" style="width:200px">
              <el-form-item label="状态">
                <el-radio-group v-model="reportForm.state">
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
                <el-button type="primary" icon="el-icon-search" @click="onSearch(reportForm)">搜索</el-button>
              </el-form-item>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <el-button type="danger" @click="addReports()" style="float:right;margin-top:20px">+新增线报</el-button>
    </div>
    <!-- 线报列表 -->
    <el-table :data="report" :empty-text='emptytext' v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row ref="multipleTable" @selection-change="handleSelectionChange">
      >
      <el-table-column type="selection" width="70" align="center">
      </el-table-column>
      <el-table-column label="ID" width="80" align="center">
        <template slot-scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column label="标题">
        <template slot-scope="scope">
          {{scope.row.title}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="状态" width="200">
        <template slot-scope="scope">
          {{convert(scope.row.state)}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="发布时间" width="300">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.creationTime}}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="操作" width="220" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="handleReport(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" plain @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="grid-content bg-purple" style="padding: 30px 5px;">
          <el-button type="danger" plain @click="deleteSelection()">批量删除</el-button>
          <el-button type="primary" plain @click="toggleSelection()">取消选择</el-button>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="grid-content bg-purple">
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="curPage" :page-sizes="[10,20,30,40,50]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalCount">
          </el-pagination>
        </div>
      </el-col>
    </el-row>

    <!--编辑页面-->
    <el-dialog title="编辑线报信息" :visible.sync="reportVisible">
      <el-form :model="editReport">
        <el-form-item label="标题" :label-width="formLabelWidth">
          <el-input v-model="editReport.title" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="内容" :label-width="formLabelWidth">
          <quill-editor ref="reportEditor" v-model="editReport.content" :options="editorOption">
          </quill-editor>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveReport(editReport)">更 新</el-button>
        <el-button @click="reportVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <!--新增线报界面-->
    <el-dialog title="新增线报" :visible.sync="addVisible">
      <el-form :model="addReport">
        <el-form-item label="标题" :label-width="formLabelWidth" prop='title'>
          <el-input v-model="addReport.title" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="内容" :label-width="formLabelWidth" prop='content'>
          <quill-editor ref="reportAdd" v-model="addReport.content" :options="addOption">
          </quill-editor>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveAddreport(addReport)">增 加</el-button>
        <el-button @click="addVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { quillEditor } from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import Vue from "vue";
var moment = require("moment");
import {
  getReportList,
  getReportDetail,
  editReportDetail,
  deleteReport,
  batchDeleteReport,
  createReport
} from "@/api/report";

export default {
  data() {
    return {
      emptytext: "暂无数据",
      report: [],
      listLoading: true,
      editReport: {
        id: "",
        title: "",
        content: ""
      },
      editorOption: {},
      formLabelWidth: "60px",
      reportVisible: false,
      curPage: 1,
      totalCount: 0,
      pageSize: 20,
      multipleSelection: [], //存放目前选中的所有项。
      reportForm: {
        id: null,
        title: null,
        state: null,
        dateTime: [
          new Date().setDate(new Date().getDate() - 3),
          new Date().setDate(new Date().getDate() + 1)
        ]
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
      addReport: {
        title: "",
        content: ""
      },
      addOption: {},
      addVisible: false
    };
  },
  components: {
    quillEditor
  },
  created() {
    this.getList();
  },
  methods: {
    //线报列表
    getList() {
      this.listLoading = true;
      var data = {
        id: this.reportForm.id,
        begintime: moment(this.reportForm.dateTime[0]).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        endtime: moment(this.reportForm.dateTime[1]).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        title: this.reportForm.title,
        state: this.reportForm.state,
        page: this.curPage,
        limit: this.pageSize
      };
      getReportList(data).then(res => {
        console.log(res.data);
        if (res.data.code == 0) {
          if (res.data.total > 0) {
            this.report = res.data.items;
            this.totalCount = res.data.total;
            this.listLoading = false;
          } else {
            this.report = {};
            this.totalCount = 0;
            this.listLoading = false;
            this.emptytext = "暂时没有数据";
          }
        }
      });
    },
    //搜索线报
    onSearch() {
      this.getList();
    },
    // 编辑线报数据
    handleReport(index, row) {
      this.reportVisible = true;
      getReportDetail(row.id).then(res => {
        if (res.data.code == 0) {
          this.editReport = row;
        }
      });
    },

    //更新编辑数据
    saveReport() {
      var data = {
        id: this.editReport.id,
        title: this.editReport.title,
        content: this.editReport.content
      };
      editReportDetail(data).then(res => {
        console.log(res.data.code);
        if (res.data.code == 0) {
          this.$message.success(res.data.msg);
          this.reportVisible = false;
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    //单行删除数据
    handleDelete(index, row) {
      deleteReport(row.id).then(res => {
        if (res.data.code == 0) {
          this.getList();
          this.$message.success(res.data.msg);
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    //批量删除
    deleteSelection(index, rows) {
      if (this.multipleSelection.length == 0) return;
      var array = [];
      this.multipleSelection.forEach(rows => {
        array.push(rows.id);
      });
      batchDeleteReport(array).then(res => {
        if (res.data.code == 0) {
          this.getList();
          this.$message.success(res.data.msg);
        }
      });
    },

    //新增线报
    addReports() {
      this.addVisible = true;
      this.addReport = {};
    },
    saveAddreport() {
      var addData = {
        title: this.addReport.title,
        content: this.addReport.content
      };
      if (
        this.addReport.title !== undefined &&
        this.addReport.content !== undefined
      ) {
        createReport(addData).then(res => {
          if (res.data.code == 0) {
            this.getList();
            this.$message.success(res.data.msg);
            this.addVisible = false;
          } else {
            this.$message.error(res.data.msg);
          }
        });
      } else {
        this.$message.error("标题和内容不能为空");
      }
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
    // 分页
    handleSizeChange(val) {
      this.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.curPage = val;
      this.getList();
    },
    //状态转换
    convert(state) {
      if (state) {
        return "已审";
      } else {
        return "未审";
      }
    }
  }
};
</script>

<style>
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
  top: 5% !important;
  margin-top: 0px !important;
}
.ql-editor {
  min-height: 200px !important;
}
</style>
