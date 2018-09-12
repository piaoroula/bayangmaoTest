<template>
  <div class="app-container">
    <div style="margin-bottom:20px;background:#f3f3f3;height:84px;padding:0px 20px;">
      <el-form ref="demandForm" :model="demandForm" :inline="true" style="margin-bottom:20px;width:90%;float:left">
        <el-row :gutter="20">
          <el-col style="width:200px">
            <div class="grid-content bg-purple">
              <el-form-item label="编号：">
                <el-input v-model="demandForm.id" style="width:100px"></el-input>
              </el-form-item>
            </div>
          </el-col>
          <el-col style="width:200px">
            <div class="grid-content bg-purple">
              <el-form-item label="活动ID：">
                <el-input v-model="demandForm.activityId" style="width:100px"></el-input>
              </el-form-item>
            </div>
          </el-col>
          <el-col style="width:200px">
            <div class="grid-content bg-purple">
              <el-form-item label="用户ID：">
                <el-input v-model="demandForm.userId" style="width:100px"></el-input>
              </el-form-item>
            </div>
          </el-col>
          <el-col style="width:500px">
            <div class="grid-content bg-purple">
              <el-form-item label="时间">
                <el-date-picker v-model="demandForm.dateTime" type="datetimerange" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right">
                </el-date-picker>
              </el-form-item>
            </div>
          </el-col>
          <el-col style="width:200px">
            <div class="grid-content bg-purple" style="width:200px">
              <el-form-item label="状态">
                <el-radio-group v-model="demandForm.state">
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
    </div>
    <!-- 需求列表 -->
    <el-table :data="demandData" :empty-text='emptytext' v-loading.body="listLoading" element-loading-text="Loading" border="" fit="" highlight-current-row="" ref="multipleTable">
      <el-table-column label="编号" width="80" align="center">
        <template slot-scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column label="活动标题" prop="title">
        <template slot-scope="scope">
          {{scope.row.title}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="activityId" label="活动ID" width="400">
        <template slot-scope="scope">
          <span>{{scope.row.activityId}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="userId" label="用户ID" width="100">
        <template slot-scope="scope">
          <span>{{scope.row.userId}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="state" label="状态" width="250">
        <template slot-scope="scope">
          <el-switch style="display: block" v-model="scope.row.state" active-color="#13ce66" inactive-color="#ff4949" :active-value="true" :inactive-value="false" active-text="已审" inactive-text="未审" @click.native="changeSwitch(scope.$index,scope.row)">
          </el-switch>
          <!-- <span>{{convert(scope.row.State)}}</span> -->
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
          <el-button size="mini" type="primary" plain="" @click.native="handleDemand(scope.$index, scope.row)">查看</el-button>
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

    <!--查看需求页面-->
    <el-dialog title="查看需求信息" :visible.sync="demandVisible" :data='demandDetail'>
      <div class='title'>
        <span class='titleName'>活动名称：</span>
        <div class='inf'>{{demandDetail.title}}</div>
      </div>
      <div class='creationTime'>
        <span class='titleName'>创建日期：</span>
        <div class='inf'>{{demandDetail.creationTime}}</div>
      </div>
      <div class='describe'>
        <span class='titleName'>描述：</span>
        <div class='inf'>{{demandDetail.describe}}</div>

      </div>
      <div class='pic'>
        <span class='titleName'>图片：</span>
        <div class='inf'>
          <img :src='demandDetail.pic' v-for='pics in picList' :key='pics.id' />
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveDeamand()">保存</el-button>
        <el-button @click="demandVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { quillEditor } from "vue-quill-editor";
import { fetchDemandList, fetchDemandDetail, handelState } from "@/api/demand";
var moment = require("moment");
import Vue from "vue";
export default {
  data() {
    return {
      emptytext: "暂无数据",
      demandData: [],
      postfile: "",
      listLoading: true,
      demandDetail: {
        title: "",
        describe: "",
        creationTime: "",
        pic: []
      },
      picList: [
        {
          id: "",
          demandId: "",
          path: "",
          creationTime: ""
        }
      ],
      editorOption: {},
      formLabelWidth: "80px",
      demandVisible: false,
      curPage: 1,
      totalCount: 0,
      pageSize: 20,
      multipleSelection: [], //存放目前选中的所有项。
      demandForm: {
        id: null,
        activityId: null,
        userId: null,
        state: null,
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
      fileList: [],
      imageUrl: ""
    };
  },
  created() {
    this.fetchData();
    //接收活动页面传过来的参数
    let id = this.$route.query.id;
    this.demandForm.activityId = id;
  },
  methods: {
    //获取数据
    fetchData() {
      this.listLoading = true;
      var data = {
        id: this.demandForm.id,
        activityId: this.demandForm.activityId,
        userId: this.demandForm.userId,
        begintime: moment(this.demandForm.dateTime[0]).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        endtime: moment(this.demandForm.dateTime[1]).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        state: this.demandForm.state,
        page: this.curPage,
        limit: this.pageSize
      };
      fetchDemandList(data).then(response => {
        if (response.data.code == 0) {
          if (response.data.total > 0) {
            this.demandData = response.data.items;
            this.totalCount = response.data.total;
            this.listLoading = false;
          } else if (response.data.total == 0) {
            this.demandData = [];
            this.totalCount = 0;
            this.listLoading = false;
          }
        }
      });
    },

    //搜索
    onSearch() {
      this.fetchData();
    },

    //编辑需求列表的状态
    changeSwitch(index, row) {
      console.log(row);
      var data = {
        id: row.id,
        state: row.state
      };
      handelState(data).then(response => {
        console.log(response);
        if (response.data.code == 0) {
          this.$message.success(response.data.msg);
        } else {
          this.$message.error(response.data.msg);
        }
      });
    },

    //查看需求详情
    handleDemand(index, row) {
      this.demandVisible = true;
      fetchDemandDetail(row.id).then(demandData => {
        console.log(demandData);
        if (demandData.data.code == 0) {
          this.demandDetail = row;
          this.picList = row.fileList;
          this.picList.forEach(picture => {
            var picpathArry = [];
            picpathArry.push(picture.path);
            this.demandDetail.pic = picpathArry;
          });
        } else {
          this.$message.error(demandData.data.msg);
        }
      });
    },
    //关闭需求详情页面
    saveDeamand() {
      this.demandVisible = false;
    },

    //每页显示数据量变更
    handleSizeChange(val) {
      this.pageSize = val;
      console.log(val);
      this.fetchData();
    },
    handleCurrentChange(val) {
      this.curPage = val;
      console.log(val);
      this.fetchData();
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
  width: 90%;
  height: 90%;
  top: 5% !important;
  margin-top: 0px !important;
}
.title,
.creationTime,
.describe,
.pic {
  margin: 10px 0px;
}
.pic img {
  width: 150px;
  height: 150px;
  padding: 0px 10px;
}
.titleName {
  font-weight: 600;
  line-height: 30px;
  font-size: 15px;
}
.inf {
  line-height: 30px;
  font-size: 14px;
  padding: 0px 10px;
}
</style>
