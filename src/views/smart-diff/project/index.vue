<template>
  <div class="app-container" style="border-color: mintcream">
    <div style="display: flex; justify-items: center; flex-wrap: nowrap; justify-content: space-between;">
      <div class="slideInRight-transition" style=" display: flex; height: fit-content;width: 20%;">
        <el-tree
          :data="projectTreeList"
          node-key="id"
          style="height: 20%"
          default-expand-all
          @node-click="handleNodeClick"
          ref="tree"
          :highlight-current="true"
          @current-change="handleNodeChange"
        >
          <template slot-scope="{ node, data }">
              <span>
                {{ node.label }}
                <el-tag style="margin-left: 100px" class="custom-button" type="primary" v-show="currentNodeData.id === data.id" size="mini"
                        @click.stop="handleAddNode(node,data)">添加节点</el-tag>
                <el-tag style="margin-left: 5px" class="custom-button" type="info" v-show="currentNodeData.id === data.id" size="mini"
                        @click.stop="handleUpdateNode(node,data)">更新节点</el-tag>
                <el-popconfirm
                  confirm-button-text='确定'
                  cancel-button-text='取消'
                  icon="el-icon-info"
                  icon-color="red"
                  title="删除将导致所有工程/diff不可见，但记录会保留，确定么？"
                  @onConfirm="handleDeleteNodeConfirm(data)"
                >
                  <el-tag style="margin-left: 5px" v-show="currentNodeData.id === data.id" type="info" size="mini" slot="reference" @click.stop="">删除</el-tag>
                </el-popconfirm>
                <!--                <el-popconfirm-->
                <!--                  ref="popconfirm1"-->
                <!--                  title="删除将导致所有工程/diff不可见，但记录会保留，确定么？"-->
                <!--                  confirmButtonText="确定"-->
                <!--                  cancelButtonText="取消"-->
                <!--                  @onConfirm="handleDeleteNodeConfirm(data)"-->
                <!--                >-->
                <!--                </el-popconfirm>-->
                <!--                <el-button ref="deleteTag" slot="reference" type="info" v-if="currentNodeData === data" size="mini" >-->

                <!--                  删除节点</el-button>-->
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
      <div class="slideInRight-transition" style="display: flex; height: fit-content;width: 80%; margin-right: 20px">
        <el-row>
          <el-col :span="2">
            <el-button style="margin-bottom: 10px" icon="el-icon-document-add" class="el-button--mini" type="primary"
                       @click="handleAddProjectForm">添加项目
            </el-button>
          </el-col>
          <el-col :span="22" align="right">
            <el-button style="background-color: rgb(252, 190, 60); color: white; margin-bottom: 10px"
                       icon="el-icon-folder-add" class="el-button--mini" type="info" @click="handleBatchImport">从git导入
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
                  <el-button type="primary" size="mini" @click="handleUpdateProject(row)">
                    更新
                  </el-button>
                  <!--                  <el-button style="background-color: rgb(252, 190, 60); color: white" size="mini">-->
                  <!--                    更新任务-->
                  <!--                  </el-button>-->
                  <el-popconfirm
                    ref="acceptPopConfirm"
                    title="删除将导致所有diff不可见，但记录会保留，确定么？"
                    confirmButtonText="确定"
                    cancelButtonText="取消"
                    @onConfirm="handleDeleteProject(row)"
                  >
                    <el-button size="mini" type="danger" slot="reference" style="margin-left: 20px; margin-right: 20px">
                      删除
                    </el-button>
                  </el-popconfirm>
                </template>
              </el-table-column>

            </el-table>
            <pagination v-show="projectListTotal > 10" :total="projectListTotal" :page.sync="listQuery.page_num"
                        :limit.sync="listQuery.page_size" @pagination="getProjectListOnNavi(false)"/>
          </el-col>

          <el-dialog title="添加项目" :visible.sync="createProjectFormVisible" center>
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

          <el-dialog title="更新项目" :visible.sync="updateProjectFormVisible" center>
            <el-form label-width="200px" style="border:1px solid #C4E1C5 ; padding: 20px" oncancel="resetForm">
              <el-row>
                <el-col>
                  <el-form-item label="Git地址(ssh地址)：">
                    <el-input
                      v-model="updateProjectFormData.ssh_url"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="Git地址(http地址)：">
                    <el-input
                      v-model="updateProjectFormData.http_url"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="中文描述：">
                    <el-input v-model="updateProjectFormData.description"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="基准分支(默认master)：">
                    <el-input v-model="updateProjectFormData.default_main"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="选择GptPromt：">
                    <el-input v-model="updateProjectFormData.gpt_config"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="加入的业务组：">
                    <el-input :disabled="true"
                              v-model="currentNodeData.label"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <div style="text-align: right">
                <el-button :disabled="listLoading" type="primary" @close="handleFormClose"
                           @click="handleUpdateProjectForm()">提交
                </el-button>
              </div>
            </el-form>
          </el-dialog>

          <el-dialog title="新增节点" :visible.sync="addNodeFormVisible" center style="width: 80%">
            <el-form label-width="200px" style="border:1px solid #C4E1C5 ; padding: 10px">
              <el-row>
                <el-col>
                  <el-form-item label="节点名称：">
                    <el-input
                      v-model="addNodeFormData.group_name"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="父节点：">
                    <el-input :disabled="true"
                              v-model="currentNodeData.label"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <div style="text-align: right">
                <el-button :disabled="listLoading" type="primary" @close="handleFormClose"
                           @click="handleAddNodeForm">提交
                </el-button>
              </div>
            </el-form>
          </el-dialog>


          <el-dialog title="更新节点" :visible.sync="updateNodeFormVisible" center style="width: 80%">
            <el-form label-width="200px" style="border:1px solid #C4E1C5 ; padding: 10px">
              <el-row>
                <el-col>
                  <el-form-item label="节点名称：">
                    <el-input
                      v-model="updateNodeFormData.group_name"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <div style="text-align: right">
                <el-button type="primary" @close="handleFormClose"
                           @click="handleUpdateNodeForm">提交
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
import {
  getProjectTree as getProjectTreeApi,
  getProjectTList,
  addProjectApi,
  deleteProjectApi,
  updateProjectApi,
  addGroupApi,
  deleteGroupApi,
  updateGroupApi
} from '@/api/smart-diff'
import Pagination from '@/components/Pagination/index.vue' // secondary package based on el-pagination
import '@/assets/custom-theme/index.css'
import CodeDiff from 'vue-code-diff'

export default {
  name: 'ProjectManagement',
  components: {Pagination},

  data() {
    return {
      showConfirm: false,
      updateProjectFormVisible: false,
      createProjectFormVisible: false,
      addNodeFormVisible: false,
      gitProjectList: [],
      listLoading: false,
      dataNotice: '',
      listQuery: {
        page_num: 1,
        page_size: 20,
        project_group_id: 0
      },
      updateNodeFormData: {
        "id": 0,
        "group_name": ''
      },
      updateNodeFormVisible: false,
      addNodeFormData: {
        "parent_id": 0,
        "group_name": ''
      },
      deleteNodeFormData: {
        "id": 0
      },

      projectListTotal: 0,
      projectTreeList: [],
      currentNodeData: '',
      updateProjectFormData: {
        "id": 0,
        "ssh_url": '',
        "http_url": '',
        "description": '',
        "default_main": 'master',
        "gpt_config": 1,
        "project_group_id": 0
      },

      createProjectFormData: {
        "ssh_url": '',
        "http_url": '',
        "description": '',
        "default_main": 'master',
        "gpt_config": 1,
        "project_group_id": 0
      },
      rules: {
        input: [
          {required: true, message: '请输入内容', trigger: 'blur'}
        ]
      },
      deleteProjectData: {
        "project_id": 0
      },
      theLastClickNode: 0
    }
  },
  mounted() {
    console.log(this.$refs)
  },
  created() {
    this.getProjectTree()

  },
  methods: {
    acceptConfirmHandler(row, index) {

    },
    handleUpdateProjectForm() {
      updateProjectApi(this.updateProjectFormData).then(
        response => {
          if (response.code == 200) {
            this.getProjectListOnNavi(true)
            this.successNotice("更新项目成功")
            this.updateProjectFormVisible = false
          } else {
            this.successNotice(response.message)
          }
        }
      )
    },

    handleUpdateProject(row) {
      this.updateProjectFormData.id = row.id
      this.updateProjectFormData.ssh_url = row.ssh_url
      this.updateProjectFormData.http_url = row.http_url
      this.updateProjectFormData.description = row.description
      this.updateProjectFormData.default_main = row.default_main
      this.updateProjectFormData.gpt_config = row.gpt_id
      this.updateProjectFormVisible = true
    },
    handleDeleteProject(row) {
      this.deleteProjectData.project_id = row.id
      deleteProjectApi(this.deleteProjectData).then(
        response => {
          if (response.code == 200) {
            this.getProjectListOnNavi(true)
            this.successNotice("删除项目成功")
            this.createProjectFormVisible = false
          } else {
            this.successNotice(response.message)
          }
        }
      )
    },
    handleFormClose() {
      this.listLoading = false
    },
    handleAddProject(data) {
      addProjectApi(data).then(
        response => {
          if (response.code == 200) {
            this.getProjectListOnNavi(true)
            this.successNotice("添加项目成功")
            this.createProjectFormVisible = false
          } else {
            this.successNotice("添加项目失败")
          }
        }
      )
    },
    handleAddProjectForm() {
      console.log(this.currentNodeData)
      if (this.currentNodeData === '' || this.currentNodeData.children.length > 0) {
        this.failNotice('请先选择一个子业务线节点')
        return
      }
      this.createProjectFormVisible = true;
      this.createProjectFormData.project_group_id = this.currentNodeData.id;
    },
    handleAddNode(node, data) {
      this.addNodeFormData.parent_id = data.id
      this.addNodeFormVisible = true
    },
    handleAddNodeForm() {
      addGroupApi(this.addNodeFormData).then(
        response => {
          if (response.code == 200) {
            this.getProjectTree()
            this.successNotice("添加节点成功")
            this.addNodeFormVisible = false
          } else {
            this.failNotice("添加节点失败")
          }
        }
      )
    },
    handleUpdateNodeForm() {
      updateGroupApi(this.updateNodeFormData).then(
        response => {
          if (response.code == 200) {
            this.getProjectTree()
            this.successNotice("更新节点成功")
            this.updateNodeFormVisible = false
          } else {
            this.failNotice("更新节点失败")
          }
        }
      )
    },
    handleUpdateNode(node, data) {
      this.updateNodeFormData.id = data.id
      this.updateNodeFormData.group_name = data.label
      this.updateNodeFormVisible = true
    },
    handleDeleteNode() {
      // 获取 Popconfirm 实例
      const popconfirm = this.$refs.acceptPopNodeConfirm
      console.log(this.$refs)
      // 手动显示 Popconfirm
      popconfirm.$refs.popper.doShow()
      console.log(popconfirm.$refs.popper)
    },
    handleDeleteNodeConfirm(data) {
      this.currentNodeData = data
      this.deleteNodeFormData.id = data.id
      deleteGroupApi(this.deleteNodeFormData).then(
        response => {
          if (response.code == 200) {
            this.getProjectTree()
            this.successNotice("删除节点成功")
          } else {
            this.failNotice("删除节点失败")
          }
        }
      )
    },
    handleNodeChange(data) {
      console.log(this.currentNodeData)

      if (!data.children || data.children.length === 0) {
        this.listQuery.project_group_id = data.id

        if (this.currentNodeData.id !== data.id) {
          this.getProjectListOnNavi(true)
        }
      }
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
    getProjectListOnNavi(ifMute) {
      this.listLoading = true
      getProjectTList(this.listQuery).then(
        response => {
          if (response.code == 200) {
            this.gitProjectList = response.data.items
            this.projectListTotal = response.data.total
            if (!ifMute) {
              this.successNotice("获取项目列表成功")
              this.listLoading = false
            }

          } else {
            if (!ifMute) {
              this.failNotice("获取项目列表失败")
              this.listLoading = false
            }

            this.dataNotice = "没有数据"
          }
        }
      )
      this.listLoading = false
    },
    handleNodeClick(data, node, event) {
      // if (node.isLeaf) {
      //     this.listQuery.project_group_id = data.id
      // }
    },
    getProjectTree() {
      getProjectTreeApi().then(
        response => {
          this.projectTreeList = response.data
        }
      )

    },
    handleBatchImport() {
      this.$notify({
        title: '待实现功能',
        message: '开发中，敬请期待',
        type: 'warning'
      })
    }
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
