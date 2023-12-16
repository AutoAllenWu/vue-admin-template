<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.git_ssh_url" placeholder="Git模糊匹配" style="width: 400px; margin-bottom: 20px" class="filter-item" @keyup.enter.native="handleFilter" />

      <el-select v-model="listQuery.status" placeholder="任务状态" clearable class="filter-item" style="width: 130px; margin-left: 20px; margin-bottom: 20px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>

      <el-button  class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter" style=" margin-left: 20px; margin-bottom: 20px">
        搜索
      </el-button>
      <el-button class="filter-item"  style="margin-left: 400px; margin-bottom: 20px; float: right" type="info" icon="el-icon-edit" @click="handleCreate">
        创建任务
      </el-button>

    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="任务ID" prop="id" align="center" width="80">
<!--      <el-table-column label="任务ID" prop="id" align="center">-->
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
<!--      <el-table-column label="项目描述" width="200" align="center">-->
      <el-table-column label="项目描述" align="center">
        <template slot-scope="{row}">
          <span>{{ row.git_description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="GIT_SSH" align="center">
<!--      <el-table-column label="GIT_SSH" width="450" align="center">-->
        <template slot-scope="{row}">
          <span>{{ row.ssh_url }}</span>
        </template>
      </el-table-column>
      <el-table-column label="基准分支" align="center">
<!--      <el-table-column label="基准分支" width="100" align="center">-->
        <template slot-scope="{row}">
          <span>{{ row.base_branch }}</span>
        </template></el-table-column>
      <el-table-column label="CommitID" align="center">
<!--      <el-table-column label="基准CommitID" width="120" align="center">-->
        <template slot-scope="{row}">
          <span>{{ row.base_commit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="对比分支" align="center" style="white-space: nowrap;">
<!--      <el-table-column label="对比分支" width="240" align="center">-->
        <template slot-scope="{row}">
          <span>{{ row.beta_branch }}</span>
        </template>
      </el-table-column>
      <el-table-column label="CommitID"  align="center">
<!--      <el-table-column label="对比CommitID" width="120" align="center">-->
        <template slot-scope="{row}">
          <span>{{ row.beta_commit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务状态" align="center">
<!--      <el-table-column label="任务状态" width="150" align="center">-->
        <template slot-scope="{row}" type="success">
          <!--          <span><el-tag class="tag-item" @type="getTagType(row.status)" > {{ getStatusText(row.status) }}</el-tag></span>-->
          <span><el-tag class="tag-item" :type="getTagType(row.status)"> {{ getStatusText(row.status) }}</el-tag></span>
        </template>
      </el-table-column>
      <el-table-column label="发起人"  align="center">
<!--      <el-table-column label="发起人" width="150" align="center">-->
        <template slot-scope="{row}">
          <span>{{ row.creator }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" width="200" align="center">
        <template slot-scope="{row}">
          <span>{{ row.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结果汇总" width="150" align="center">
        <template slot-scope="{row}">
          <span>共计diff文件 {{ row.diff_result_count }} 个</span> <br>
          <span>GPT分析成功 {{ row.gpt_result_count }} 个</span> <br>
          <span>GPT提供的case建议 {{ row.gpt_advice_count }} 个</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row && row.status >2" type="primary" size="mini" @click="handleUpdate(row.id)">
            查看详情
          </el-button>
          <el-button style="background-color: rgb(252, 190, 60); color: white" size="mini" @click="handleUpdate(row)">
            更新任务
          </el-button>
          <el-button v-if="row && (row.status == 4 || row.status == 99)" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page_num" :limit.sync="listQuery.page_size" @pagination="getTaskList" />

    <el-dialog title="手动创建任务" :visible.sync="taskVisible" center>
      <el-form label-width="200px" style="border:1px solid #C4E1C5 ; padding: 20px" oncancel="resetForm">
        <el-row>
          <el-col>
            <el-form-item  label="Git地址(ssh地址)：">
              <el-input placeholder="请确保已在项目管理里添加过该项目，否则不予执行"  v-model="createTaskFormData.git_uri"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col >
            <el-form-item label="待对比分支：">
              <el-input v-model="createTaskFormData.betaBranch"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col >
            <el-form-item label="基准分支(默认master)：">
              <el-input v-model="createTaskFormData.baseBranch"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col >
            <el-form-item label="CheckList ID：">
              <el-input v-model="createTaskFormData.checkListId"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div style="text-align: right"> <el-button :disabled="isProcessing" type="primary" @close="handleFormClose" @click="createTask(createTaskFormData)">提交</el-button></div>
      </el-form>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getAllTasks, createTaskApi } from '@/api/smart-diff'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import '@/assets/custom-theme/index.css'
import CodeDiff from 'vue-code-diff'

const calendarTypeOptions = [
  { key: '1', display_name: '初始化' },
  { key: '2', display_name: '获取分支成功' },
  { key: '3', display_name: 'Diff分支成功' },
  { key: '4', display_name: 'GPT处理成功' },
  { key: '-4', display_name: '获取分支失败' },
  { key: '-3', display_name: 'Diff分支失败' },
  { key: '-2', display_name: 'GPT处理失败' },
  { key: '99', display_name: '任务完成' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ConfigHistory',
  components: { CodeDiff, Pagination },
  // directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      createTaskFormData:{'betaBranch':'', 'git_uri':'','baseBranch':'master','checkListId':'0'},
      isProcessing:false,
      taskVisible: false,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      oldContent: '1234', // 原始内容
      newContent: '123', // 修改后的内容
      fileName: 'a/b/c/d/e.java',
      listQuery: {
        page_num: 1,
        page_size: 20,
        git_ssh_url: undefined,
        // page / limit
        // importance: undefined,
        // title: undefined,
        status: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getTaskList()
  },
  methods: {
    handleFormClose(){
      this.isProcessing=false
    },
    createTask(data){
      if(this.isProcessing == true){
        return
      }
      this.isProcessing = true
      for (let key in data) {
        if (data[key] === 0 || data[key] === '') {
          delete data[key];
        }
      }
      createTaskApi(data).then(
        response => {
            console.log(response);
            console.log(response.msg);
            if(response.code == 200){
                this.$notify({
                    title: 'Success',
                    message: '创建任务成功',
                    type: 'success',
                    duration: 2000
                });
                this.resetForm();
                this.taskVisible = false;
                this.getTaskList();
            } else {

                this.$notify({
                    title: 'Fail',
                    message: response.msg,
                    type: 'error',
                    duration: 2000
                })
            }

        }
      )
      this.isProcessing=false

    },

    openNewGptWindow(taskId) {
      // 获取目标路由的完整 URL
      const { href } = this.$router.resolve({ name: 'smartDiffTaskDetail', params: {id: taskId}})

      // 打开新窗口并跳转到目标路由
      window.open(href, '_blank')
    },
    getStatusText(status) {
      switch (status) {
        case 1:
          return '初始化'
        case 2:
          return '获取分支成功'
        case 3:
          return 'Diff分支成功'
        case 4 :
          return 'GPT处理成功'
        case 99:
          return '任务完成'
        case -2:
          return '获取分支失败'
        case -3:
          return 'Diff分支失败'
        case -4:
          return 'GPT处理失败'
        default:
          return ''
      }
    },
    getTagType(status) {
      switch (status) {
        case 4:
        case 99:
          return 'success'
        case -2:
        case -3:
        case -4:
          return 'danger'
        default:
          return 'info'
      }
    },
    getTaskList() {
      this.listLoading = true
      getAllTasks(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
      })
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page_nume = 1
      this.getTaskList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      this.isProcessing = false
      this.taskVisible = true
      // this.resetTemp()
      // this.dialogStatus = 'create'
      // this.dialogFormVisible = true
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          // createArticle(this.temp).then(() => {
          //   this.list.unshift(this.temp)
          //   this.dialogFormVisible = false
          //   this.$notify({
          //     title: 'Success',
          //     message: 'Created Successfully',
          //     type: 'success',
          //     duration: 2000
          //   })
          // })
        }
      })
    },
    handleUpdate(taskId) {
      // this.temp = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
      // this.dialogStatus = 'update'
      this.openNewGptWindow(taskId)
      // this.dialogFormVisible = true
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          // updateArticle(tempData).then(() => {
          //   const index = this.list.findIndex(v => v.id === this.temp.id)
          //   this.list.splice(index, 1, this.temp)
          //   this.dialogFormVisible = false
          //   this.$notify({
          //     title: 'Success',
          //     message: 'Update Successfully',
          //     type: 'success',
          //     duration: 2000
          //   })
          // })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    // handleFetchPv(pv) {
    //   fetchPv(pv).then(response => {
    //     this.pvData = response.data.pvData
    //     this.dialogPvVisible = true
    //   })
    // },
    // handleDownload() {
    //   this.downloadLoading = true
    //   import('@/vendor/Export2Excel').then(excel => {
    //     const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
    //     const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
    //     const data = this.formatJson(filterVal)
    //     excel.export_json_to_excel({
    //       header: tHeader,
    //       data,
    //       filename: 'table-list'
    //     })
    //     this.downloadLoading = false
    //   })
    // },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    resetForm(){
      this.createTaskFormData={'betaBranch':'', 'git_uri':'','baseBranch':'master','checkListId':'0'}
    }
  }
}
</script>
