<template>
  <div class="app-container">
    <el-table

      :key="tableKey"
      v-loading="listLoading"
      :data="diffList"
      border
      fit
      highlight-current-row
      style="width: 2003px;"
    >
      <el-table-column label="改动文件" prop="file_path" align="left" header-align="center" min-width="600">
        <template slot-scope="{row,$index}">
          <div class="" @click="toggleDetail($index)">{{ row.file_path }}</div>
          <div v-show="row.showDetail">
            <CodeDiff
              :old-string="row.old_content"
              :new-string="row.new_content"
              :file-name="row.file_path"
              :context="5"
              :render-nothing-when-empty="true"
              output-format="line-by-line"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="GPT建议" width="600" align="left" header-align="center">
        <template slot-scope="{row, $index}">
          <el-card v-show="! row.showGpt">
            <p><strong><b>测试用例建议： </b></strong></p>
            <div v-for="(v,k) in row.gpt_result.checklist" :key="k" class="text item">
              <li> {{ v }} </li>
            </div>
            <el-button style="float: right; padding: 3px 0" type="text" @click="toggleGpt($index)">查看详情</el-button>
          </el-card>
          <el-card v-show="row.showGpt" class="box-card">
            <!--            <div v-for="(v,k) in row.gpt_result" :key="o" class="text item">-->
            <!--              <li> {{'列表内容 ' + o }} </li>-->
            <!--            </div>-->
            <p><strong><b>业务解释： </b></strong></p>
            <p>{{ row.gpt_result.business[0] }}</p>
            <p><strong><b>改动影响： </b></strong></p>
            <p>{{ row.gpt_result.effect[0] }}</p>
            <p><strong><b>稳定性建议： </b></strong></p>
            <p>{{ row.gpt_result.stability[0] }}</p>
            <p><strong><b>测试用例建议： </b></strong></p>
            <div v-for="(v,k) in row.gpt_result.checklist" :key="k" class="text item">
              <li> {{ v }} </li>
            </div>
            <el-button style="float: right; padding: 3px 0" type="text" @click="toggleGpt($index)">收起</el-button>
          </el-card>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-tag v-if="row && row.is_cased == 1" class="el-tag--success">
            已接受
          </el-tag>
          <el-tag v-if="row && row.is_cased == 2" class="el-tag--danger">
            已拒绝
          </el-tag>

          <el-popconfirm
            ref="acceptPopConfirm"
            title="接受建议并新建case，确定么？"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @onConfirm="acceptConfirmHandler(row, $index)"
          >
            <el-button v-if="row && row.is_cased == 0 && row.checklist_id" slot="reference" type="primary" size="mini" style="margin-left: 20px; margin-right: 20px">
              接受
            </el-button>
          </el-popconfirm>
          <el-button v-if="row.is_cased == 2" type="warning" size="mini" style="float: right;margin-left: 20px; margin-right: 20px" @click="handleReset(row,$index)">
            重置
          </el-button>
          <el-button v-if="row && (row.is_cased == 0)" size="mini" type="danger" style="margin-left: 20px; margin-right: 20px" @click="handleReject(row,$index)">
            拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page_num" :limit.sync="listQuery.page_size" @pagination="getTaskList" />-->

  </div>
</template>

<script>
import { getTaskDetail, rejectGptAdvice, resetGptAdvice, createGptCase } from '@/api/smart-diff'
import Pagination from '@/components/Pagination/index.vue' // secondary package based on el-pagination
import '@/assets/custom-theme/index.css'
import CodeDiff from 'vue-code-diff'

export default {
  name: 'TaskDetail',
  components: { CodeDiff, Pagination },
  data() {
    return {
      tableKey: 0,
      diffList: null,
      total: 0,
      listLoading: true,
      oldContent: '1234', // 原始内容
      newContent: '123', // 修改后的内容
      fileName: 'a/b/c/d/e.java',
      listQuery: {
        page_num: 1,
        page_size: 20,
        task_id: this.paramId
      },
      currentRow: null,
      rejectData: { 'gpt_result_id': null },
      resetData: { 'gpt_result_id': null },
      createCaseData: { 'check_list_id': null, 'gpt_result_id': null },
      createCaseRow: null
    }
  },
  computed: {
    'paramId': function() {
      return this.$route.params.id
    }
  },
  created() {
    this.getTaskDetailList()
    this.listQuery.task_id = this.paramId
  },
  methods: {
    acceptConfirmHandler(row, index) {
      console.log('Confirmed')
      this.createCaseData.check_list_id = row.checklist_id
      this.createCaseData.gpt_result_id = row.gpt_result_id
      createGptCase(this.createCaseData).then(
        response => {
          if (response.code == 200) {
            this.diffList[index].is_cased = 1
            this.$notify({
              title: 'Success',
              message: '操作成功',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$notify({
              title: 'Failed',
              message: '操作失败',
              type: 'fail',
              duration: 2000
            })
          }
        }
      )
    },
    handleReject(row, index) {
      this.rejectData.gpt_result_id = row.gpt_result_id
      rejectGptAdvice(this.rejectData).then(
        response => {
          if (response.code == 200) {
            this.diffList[index].is_cased = 2
            this.$notify({
              title: 'Success',
              message: '操作成功',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$notify({
              title: 'Failed',
              message: '操作失败',
              type: 'fail',
              duration: 2000
            })
          }
        }
      )
    },
    handleAccept(row, index) {

    },
    handleReset(row, index) {
      this.resetData.gpt_result_id = row.gpt_result_id
      resetGptAdvice(this.resetData).then(
        response => {
          if (response.code == 200) {
            this.diffList[index].is_cased = 0
            this.$notify({
              title: 'Success',
              message: '操作成功',
              type: 'success',
              duration: 2000
            })
          }
        }
      )
    },
    toggleDetail(index) {
      console.log('进入 toggle')
      console.log(index)
      this.diffList[index].showDetail = !this.diffList[index].showDetail
    },
    toggleGpt(index) {
      console.log('进入 toggle')
      console.log(index)
      this.diffList[index].showGpt = !this.diffList[index].showGpt
    },
    openNewGptWindow(taskId) {
      // 获取目标路由的完整 URL
      const { href } = this.$router.resolve({ name: 'Table' })

      // 打开新窗口并跳转到目标路由
      window.open(href, '_blank')
    },
    getTaskDetailList() {
      this.listLoading = true
      getTaskDetail(this.listQuery).then(response => {
        this.diffList = response.data.items
        this.diffList = this.diffList.map(
          item => {
            return {
              ...item,
              showDetail: false,
              showGpt: false
            }
          }
        )
        this.total = response.data.total

        this.listLoading = false
      })
      this.listLoading = false
    },
    getStatusText(change_type) {
      switch (change_type) {
        case '':
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
    }
  }
}

</script>
