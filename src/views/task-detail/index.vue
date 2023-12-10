<template>
  <div class="app-container">
    <p>{{ paramId }}</p>
    <p>this.$route.params.id</p>
    <p>this.$route.params.id</p>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 2003px;"
    >
      <el-table-column label="任务ID" prop="id" align="center" width="1400">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="GIT_SSH" width="600" align="center">
        <template slot-scope="{row}">
          <span>{{ row.ssh_url }}</span>
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

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page_num" :limit.sync="listQuery.page_size" @pagination="getTaskList" />

  </div>
</template>

<script>
import { getAllTasks } from '@/api/smart-diff'
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
      }
    }
  },
  created() {
    this.getTaskList()
  },
  methods: {
    openNewGptWindow(taskId) {
      // 获取目标路由的完整 URL
      const { href } = this.$router.resolve({ name: 'Table' })

      // 打开新窗口并跳转到目标路由
      window.open(href, '_blank')
    },
    getTaskList() {
      this.listLoading = true
      getAllTasks(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
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
