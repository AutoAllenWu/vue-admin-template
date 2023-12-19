<template>
  <div class="app-container">
    <div class="filter-container">
      <!--      <el-input v-model="listQuery.git_ssh_url" placeholder="Git模糊匹配" style="width: 400px; margin-bottom: 20px" class="filter-item" @keyup.enter.native="handleFilter" />-->

      <!--      <el-select v-model="listQuery.status" placeholder="任务状态" clearable class="filter-item" style="width: 130px; margin-left: 20px; margin-bottom: 20px">-->
      <!--        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />-->
      <!--      </el-select>-->
      <el-select
        v-model="listQuery.config_id"
        filterable
        clearable
        placeholder="请选择"
      >
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.gpt_name"
          :value="item.id"
        />
      </el-select>

      <el-button class="filter-item" type="primary" icon="el-icon-search" style=" margin-left: 20px; margin-bottom: 20px" @click="handleFilterClick">
        搜索
      </el-button>

    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="配置ID" prop="id" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配置描述" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改前内容" align="center">
        <template slot-scope="{row}">
          <span>{{ row.old_content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改后内容" align="center">
        <template slot-scope="{row}">
          <span>{{ row.new_content }}</span>
        </template></el-table-column>
      <el-table-column label="版本号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.version_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleDetail(row)">
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="diffViewVisible">
      <div style="margin-bottom: 40px">
        <CodeDiff
          :old-string="old_content"
          :new-string="new_content"
          :context="20"
          :render-nothing-when-empty="true"
          output-format="line-by-line"
        />
      </div></el-dialog>
    <!--    <pagination v-show="listTotal>0" :total="listTotal" :page.sync="listQuery.page_num" :limit.sync="listQuery.page_size" @pagination="getTaskList" />-->
  </div>
</template>

<script>
import { getConfigOptionsApi, getConfigListApi, getConfigLogsApi } from '@/api/smart-diff'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import '@/assets/custom-theme/index.css'
import CodeDiff from 'vue-code-diff'

export default {
  name: 'ConfigHistory',
  components: { CodeDiff, Pagination },
  // directives: { waves },
  filters: {

  },
  data() {
    return {
      options: [],
      list: [],
      listQuery: {
        'page_num': 1,
        'page_size': 20,
        'config_id': null
      },
      listTotal: 0,
      selected_id: null,
      listLoading: false,
      diffViewVisible: false,
      old_content: null,
      new_content: null
    }
  },
  created() {
    this.getConfigOptions()
  },
  methods: {
    handleDetail(row) {
      this.new_content = row.new_content
      this.old_content = row.old_content
      this.diffViewVisible = true
    },
    getConfigOptions() {
      getConfigOptionsApi(this.listQuery).then(
        response => {
          if (response.code == 200) {
            this.options = response.data.items
            // this.listTotal = response.data.total
          } else {
            this.failNotice(response.message)
          }
        }
      )
    },
    handleFilter() {
      this.getConfigList()
    },
    getConfigList() {
      this.listLoading = true
      getConfigLogsApi(this.listQuery).then(
        response => {
          if (response.code == 200) {
            this.list = response.data.items
            this.listTotal = response.data.total
          } else {
            this.failNotice(response.message)
          }
        }
      )
      this.listLoading = false
    },
    handleFilterClick() {
      this.getConfigList()
    }
  }
}
</script>
