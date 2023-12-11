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
          <div class="" @click="toggleDetail($index)" >{{ row.file_path }}</div>
          <div v-show="row.showDetail" >
            <CodeDiff
              :old-string="row.old_content"
              :new-string="row.new_content"
              :file-name="row.file_path"
              :context=5
              :renderNothingWhenEmpty="true"
              output-format="line-by-line"/>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="GPT建议" width="600" align="left" header-align="center">
        <template slot-scope="{row, $index}">
          <el-card v-show="! row.showGpt">
            <p><strong><b>业务推测： </b></strong></p>
            <p>{{ row.gpt_result.business[0] }}</p>
            <el-button style="float: right; padding: 3px 0" type="text" @click="toggleGpt($index)">查看详情</el-button>
          </el-card>
          <el-card class="box-card" v-show="row.showGpt">
<!--            <div v-for="(v,k) in row.gpt_result" :key="o" class="text item">-->
<!--              <li> {{'列表内容 ' + o }} </li>-->
<!--            </div>-->
            <p><strong><b>业务推测： </b></strong></p>
            <p>{{ row.gpt_result.business[0] }}</p>
            <p><strong><b>改动影响： </b></strong></p>
            <p>{{ row.gpt_result.effect[0] }}</p>
            <p><strong><b>稳定性建议： </b></strong></p>
            <p>{{ row.gpt_result.stability[0] }}</p>
            <p><strong><b>测试用例建议： </b></strong></p>
            <div v-for="(v,k) in row.gpt_result.checklist" :key="o" class="text item">
              <li> {{ v }} </li>

            </div>
            <el-button style="float: right; padding: 3px 0" type="text" @click="toggleGpt($index)">收起</el-button>
          </el-card>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row && row.status >2" type="primary" size="mini" @click="handleModifyStatus(row.id)">
            查看详情
          </el-button>
          <el-button type="warning" size="mini" @click="handleModifyStatus(row)">
            更新任务
          </el-button>
          <el-button v-if="row && (row.status == 4 || row.status == 99)" size="mini" type="danger" @click="handleModifyStatus(row,$index)">
            删除
          </el-button>
        </template>
        </el-table-column>
    </el-table>

<!--    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page_num" :limit.sync="listQuery.page_size" @pagination="getTaskList" />-->

  </div>
</template>

<script>
import { getTaskDetail } from '@/api/smart-diff'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import '@/assets/custom-theme/index.css'
import CodeDiff from 'vue-code-diff'

export default {
  name: 'SmartDiff',
  components: { CodeDiff, Pagination },
  computed: {
    'paramId': function () {
      return this.$route.params.id;
    }
  },
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
      }
    }
  },
  created() {
    this.getTaskDetailList();
    this.listQuery.task_id = this.paramId;

  },
  methods: {
    toggleDetail(index) {
      console.log("进入 toggle")
      console.log(index)
      this.diffList[index].showDetail = !this.diffList[index].showDetail;
    },
    toggleGpt(index) {
      console.log("进入 toggle")
      console.log(index)
      this.diffList[index].showGpt = !this.diffList[index].showGpt;
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
              showGpt: false,
            }
          }
        )
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getStatusText(change_type) {
      switch (change_type) {
        case "":
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
