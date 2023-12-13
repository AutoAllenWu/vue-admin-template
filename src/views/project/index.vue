<template>
  <div class="app-container">
    <div style="display: flex; justify-items: center; flex-wrap: nowrap; justify-content: space-between;">
      <div class="transition-box" style="border:0px groove #b4bccc ; padding: 20px; height: fit-content;width: 20%;">
        <el-tree
            :data="projectTreeList"
            node-key="id"
            style="height: 20%"
            @node-click="handleNodeClick"
            ref="tree"
            :highlight-current="true"
            @current-change="handleNodeChange"
        >
          <template #default="{ node, data }">
              <span>
                {{ node.label }}
                <el-tag class="custom-button" type="primary" v-if="currentNodeData === data" size="mini"
                        @click.stop="handleAddNode(node,data)">添加节点</el-tag>
                <el-tag class="custom-button" type="info" v-if="currentNodeData === data" size="mini"
                        @click.stop="handleAddNode(node,data)">从git导入</el-tag>
              </span>
          </template>
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
      <div
          style="display: flex;border:1px groove #dfe4ed ; padding: 20px; height: fit-content;width: 80%; background: 	#F8F8FF">
        <el-row>
          <el-col :span="2">
            <el-button style="margin-bottom: 10px" icon="el-icon-document-add" class="el-button--mini" type="primary"
                       @click="handleAddProjectForm">添加项目
            </el-button>
          </el-col>
          <el-col :span="22" align="right">
            <el-button style="background-color: rgb(252, 190, 60); color: white; margin-bottom: 10px"
                       icon="el-icon-folder-add" class="el-button--mini" type="info">从git导入
            </el-button>
          </el-col>
          <el-col :span="24">
            <el-table
                v-loading="listLoading"
                :data="gitProjectList"
                border
                fit
                highlight-current-row
                style="width: 100%"
            >
              <!--          style="width: 2003px; height: 2000px"-->

              <el-table-column label="ID" prop="id" align="center" header-align="center" min-width="80px">
                <template slot-scope="{row, $index}">
                  <span>{{ row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column label="项目名称" align="center" header-align="center" min-width="240px">
                <template slot-scope="{row, $index}">
                  <span>{{ row.description }}</span>
                </template>
              </el-table-column>
              <el-table-column label="GIT地址" align="left" header-align="center" min-width="320px">
                <template slot-scope="{row, $index}">
                  <span>{{ row.ssh_url }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Promt配置" align="center" header-align="center" min-width="240px">
                <template slot-scope="{row, $index}">
                  <span>{{ row.gpt_name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" min-width="300" class-name="small-padding fixed-width">
                <template slot-scope="{row, $index}">
                  <el-button type="primary" size="mini">
                    查看详情
                  </el-button>
                  <el-button style="background-color: rgb(252, 190, 60); color: white" size="mini">
                    更新任务
                  </el-button>
                  <el-button size="mini" type="danger">
                    删除
                  </el-button>
                </template>
              </el-table-column>

            </el-table>
            <pagination v-show="projectListTotal > 10" :total="projectListTotal" :page.sync="listQuery.page_num"
                        :limit.sync="listQuery.page_size" @pagination="getProjectListOnNavi"/>
          </el-col>

          <el-dialog title="手动创建任务" :visible.sync="createProjectFormVisible" center>
            <el-form label-width="200px" style="border:1px solid #C4E1C5 ; padding: 20px" oncancel="resetForm">
              <el-row>
                <el-col>
                  <el-form-item label="Git地址(ssh地址)：">
                    <el-input placeholder="例: git@gitlab.staff.xdf.cn:airesearch-ocr/general-ocr.git"
                              v-model="createProjectFormData.ssh_url"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="Git地址(http地址)：">
                    <el-input placeholder="例: http://gitlab.staff.xdf.cn/airesearch-ocr/general-ocr.git"
                              v-model="createProjectFormData.http_url"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="中文描述：">
                    <el-input v-model="createProjectFormData.description"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="基准分支(默认master)：">
                    <el-input v-model="createProjectFormData.default_main"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="选择GptPromt：">
                    <el-input v-model="createProjectFormData.gpt_config"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="加入的业务组：">
                    <el-input :disabled="true" :placeholder="currentNodeData ? currentNodeData.label : ''"
                              v-model="currentNodeData.label"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <div style="text-align: right">
                <el-button :disabled="listLoading" type="primary" @close="handleFormClose"
                           @click="handleAddProject(createProjectFormData)">提交
                </el-button>
              </div>
            </el-form>
          </el-dialog>
        </el-row>
      </div>
    </div>
  </div>


</template>

<script>
import {getProjectTree as getProjectTreeApi, getProjectTList, addProjectApi} from '@/api/smart-diff'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import '@/assets/custom-theme/index.css'
import CodeDiff from 'vue-code-diff'

export default {
  name: 'ProjectManagement',
  components: {Pagination},

  data() {
    return {
      createProjectFormVisible: false,
      gitProjectList: [],
      listLoading: false,
      dataNotice: '',
      listQuery: {
        page_num: 1,
        page_size: 20,
        project_group_id: 0
      },
      projectListTotal: 0,
      projectTreeList: [],
      currentNodeData: '',
      createProjectFormData: {
        "ssh_url": '',
        "http_url": '',
        "description": '',
        "default_main": 'master',
        "gpt_config": 0,
        "project_group_id": 0
      },
        rules:{
            input: [
                { required: true, message: '请输入内容', trigger: 'blur' }
            ]
        }
    }
  },
  created() {
    this.getProjectTree()
  },
  methods: {
    handleFormClose() {
      this.listLoading = false
    },
    handleAddProject(data) {

        addProjectApi(data).then(
            response => {
                if (response.code == 200) {
                    getProjectTList()
                    this.successNotice("添加项目成功")
                }
                else
                {
                    this.successNotice("添加项目失败")
                }
            }
        )
    },
    handleAddProjectForm() {
        console.log(this.currentNodeData)
      if ( this.currentNodeData.children.length > 0 ) {
        this.failNotice('请先选择一个子业务线节点')
        return
      }
      this.createProjectFormVisible = true;
      this.createProjectFormData.project_group_id = this.currentNodeData.id;
    },
    handleAddNode(node, data) {
      this.successNotice(data.label)
    },
    handleNodeChange(data) {
      this.currentNodeData = data;
    },
    successNotice(message) {
      this.$notify({
        title: 'Success',
        message: message,
        type: 'success',
        duration: 2000
      })
    },
    failNotice(message) {
      this.$notify({
        title: 'Failed',
        message: message,
        type: 'fail',
        duration: 2000
      })
    },
    getProjectListOnNavi() {
      getProjectTList(this.listQuery).then(
          response => {
            if (response.code == 200) {
              this.gitProjectList = response.data.items
              this.projectListTotal = response.data.total
              this.successNotice("获取项目列表成功")
            } else {
              this.failNotice("获取项目列表失败")
              this.dataNotice = "没有数据"
            }
            setTimeout(() => {
              this.listLoading = false
            }, 1.5 * 1000)

          }
      )
    },
    handleNodeClick(data, node, event) {
      if (node.isLeaf) {
        this.listQuery.project_group_id = data.id
        this.listLoading = true
        getProjectTList(this.listQuery).then(
            response => {
              if (response.code == 200) {
                this.gitProjectList = response.data.items
                this.projectListTotal = response.data.total
                this.successNotice("获取项目列表成功")
              } else {
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
    getProjectTree() {
      getProjectTreeApi().then(
          response => {
            this.projectTreeList = response.data
          }
      )
    },
  }
}

</script>
<style>
.custom-button .el-button {
  padding: 1px 1px;
  font-size: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

</style>
