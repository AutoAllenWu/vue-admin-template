<template>
  <div class="app-container">
    <div style="display: flex; justify-items: center; flex-wrap: nowrap; justify-content: space-between;">
      <div class="transition-box" style="border:1px groove #b4bccc ; padding: 20px; height: fit-content;width: 20%;" >
          <el-tree
            :data="projectTreeList"
            node-key="id"
            draggable
            style="height: 50%"
            @node-click="handleNodeClick"
          >
          </el-tree>
        </div>
<!--      @node-drag-start="handleDragStart"-->
<!--      @node-drag-enter="handleDragEnter"-->
<!--      @node-drag-leave="handleDragLeave"-->
<!--      @node-drag-over="handleDragOver"-->
<!--      @node-drag-end="handleDragEnd"-->
<!--      @node-drop="handleDrop"-->
<!--      :allow-drop="allowDrop"-->
<!--      :allow-drag="allowDrag"-->
      <div style="display: flex;border:0px groove #dfe4ed ; padding: 20px; height: fit-content;width: 80%;">
        <el-table
          v-loading="listLoading"
          :data="gitProjectList"
          border
          fit
          highlight-current-row

          >
<!--          style="width: 2003px; height: 2000px"-->

        <el-table-column label="ID" prop="id" align="left" header-align="center" min-width="80px" >
          <template slot-scope="{row, $index}">
            <span>{{ row.id }}</span>
          </template>
        </el-table-column>
          <el-table-column label="项目名称" align="left" header-align="center" min-width="240px">
            <template slot-scope="{row, $index}">
              <span>{{ row.description }}</span>
            </template>
          </el-table-column>
          <el-table-column label="GIT地址"  align="left" header-align="center" min-width="240px">
            <template slot-scope="{row, $index}">
              <span>{{ row.ssh_url }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Promt配置" align="left" header-align="center" min-width="240px">
            <template slot-scope="{row, $index}">
              <span>{{ row.gpt_name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" min-width="300" class-name="small-padding fixed-width">
            <template slot-scope="{row, $index}">
              <el-button  type="primary" size="mini">
                查看详情
              </el-button>
              <el-button style="background-color: rgb(252, 190, 60); color: white" size="mini" >
                更新任务
              </el-button>
              <el-button size="mini" type="danger" >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
<!--          <template slot-scope="{row,$index}">-->
<!--            <div class="" @click="toggleDetail($index)" >{{ row.file_path }}</div>-->
<!--          </template>-->

<!--        <pagination v-show="total>0" :total="total" :page.sync="listQuery.page_num" :limit.sync="listQuery.page_size" @pagination="getTaskList" />-->
      </div>
    </div>

<!--    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page_num" :limit.sync="listQuery.page_size" @pagination="getTaskList" />-->



  </div>
</template>

<script>
import { getProjectTree as getProjectTreeApi, getProjectTList } from '@/api/smart-diff'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import '@/assets/custom-theme/index.css'
import CodeDiff from 'vue-code-diff'

export default {
  name: 'ProjectManagement',
  components: { Pagination },

  data() {
    return {
      gitProjectList: [],
      listLoading: false,
      dataNotice: '',
      listQuery: {
        page_num: 1,
        page_size: 20,
        project_group_id: 0
      },
      projectListTotal:0,
      projectTreeList: []
    }
  },
  created() {
    this.getProjectTree()
  },
  methods: {
    successNotice(message){
      this.$notify({
        title: 'Success',
        message: message,
        type: 'success',
        duration: 2000
      })
    },
    failNotice(message){
      this.$notify({
        title: 'Failed',
        message: message,
        type: 'fail',
        duration: 2000
      })
    },
    handleNodeClick(data, node, event) {
      if (node.isLeaf) {
        this.listQuery.project_group_id = node.id
        this.listLoading = true
        getProjectTList(this.listQuery).then(
          response => {
            if (response.code == 200) {
              this.gitProjectList = response.data.items
              this.projectListTotal = response.data.total
              this.successNotice("获取项目列表成功")
            }
            else
            {
              this.failNotice("获取项目列表失败")
              this.dataNotice = "没有数据"
            }
            setTimeout(() => {
              this.listLoading = false
            }, 1.5 * 1000)

          }

        )
      }
    },
    getProjectTree(){
      getProjectTreeApi().then(
        response => {
          this.projectTreeList = response.data
        }
      )
    },
  }
}

</script>
