<template>
  <div class="app-container">
    <div >
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="confgList"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column class="small-padding" label="id" align="left" header-align="center" min-width="50">
          <template slot-scope="{row,$index}">
            <div class="el-table__expand-column" style="white-space: pre-wrap;text-align: center">{{ row.id }}</div>
          </template>
        </el-table-column>

        <el-table-column class="small-padding" label="文件白名单" align="left" header-align="center">
          <template slot-scope="{row,$index}">
            <div class="el-table__expand-column" style="white-space: pre-wrap;text-align: center"
                 v-for="(item, index) in row.white_list" :key="index">
              <el-tag type="info">{{ item }}</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="配置名称" align="left" header-align="center">
          <template slot-scope="{row,$index}">
            <div class="el-table__expand-column" style="white-space: pre-wrap;text-align: center">{{
                row.config_name
              }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="提示词" align="left" header-align="center" min-width="500">
          <template slot-scope="{row,$index}">
            <div style="white-space: pre-wrap;" class="el-table__expand-column">{{ row.gpt_config }}</div>
          </template>
        </el-table-column>

        <el-table-column label="版本号" align="left" header-align="center" min-width="50">
          <template slot-scope="{row,$index}">
            <div class="el-table__expand-column" style="white-space: pre-wrap;text-align: center">
              {{ row.version_id }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="处理类" align="left" header-align="center" min-width="100">
          <template slot-scope="{row,$index}">
            <div class="el-table__expand-column" style="white-space: pre-wrap;text-align: center">
              {{ row.handler }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="{row,$index}">
          <el-button-group>
            <el-button type="text" circle icon="el-icon-edit" size="mini" @click="handleEditButton(row)">编辑</el-button>
            <el-button type="text" round icon="el-icon-info" size="mini" @click="">修改记录</el-button>
          </el-button-group>
          </template>
        </el-table-column>

      </el-table>

      <el-pagination v-show="configListtotal > 0" :total="configListtotal" :page.sync="listQuery.page_num" :limit.sync="listQuery.page_size" @pagination="getConfigList" style="float: right"/>



      <el-dialog title="编辑提示词" :visible.sync="configEditVisible" center @close="handleEditFormClose">
        <el-form label-width="200px" style="border:1px solid #C4E1C5 ; padding: 20px">
          <el-row>
            <el-col>
              <el-form-item  label="文件白名单：" >
                <el-tag closable v-for="(tag, tag_index) in editConfigFormData.white_list" @close="handleTagClose(tag_index)" :key="tag_index" style="margin-left: 10px">{{ tag }}</el-tag>
                <div>
                  <el-input type="text" size="small" style="width: 400px" placeholder="请输入内容" v-model="editConfigFormInputs"></el-input>
                  <el-button type="success" icon="el-icon-check" circle size="mini" style="margin-left: 20px" @click="handleInput"></el-button>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col >
              <el-form-item label="提示词名称：">
                <el-input v-model="editConfigFormData.config_name" ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col >
              <el-form-item label="提示词内容：">
                <el-input prefix-icon="el-icon-monitor" suffix-icon="el-icon-monitor" type="textarea" rows="10" v-model="editConfigFormData.gpt_config" autosize="autosize"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col >
              <el-form-item label="处理类：">
                <el-input :disabled="1>0" v-model="editConfigFormData.handler"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <div style="text-align: right"> <el-button :disabled="listLoading" type="primary"  @click="handleEditConfigForm(editConfigFormData)">提交</el-button></div>
        </el-form>
      </el-dialog>

    </div>

  </div>
</template>

<script>
import {getConfigListApi,updateConfigApi} from '@/api/smart-diff'
import Pagination from '@/components/Pagination/index.vue' // secondary package based on el-pagination
import '@/assets/custom-theme/index.css'
import CodeDiff from 'vue-code-diff'

export default {
  name: 'PromtList',
  components: {CodeDiff, Pagination},
  computed: {},
  data() {
    return {
      autosize:{ minRows: 5, maxRows: 20 },
      editConfigFormInputs:"",
      tableKey: 0,
      confgList: null,
      configListtotal: 0,
      listLoading: true,
      configEditVisible: false,
      oldContent: '1234', // 原始内容
      newContent: '123', // 修改后的内容
      listQuery: {
        page_num: 1,
        page_size: 20,
      },
      currentRow: null,
      editConfigFormData:{
        "id":0,
        "white_list":[],
        "config_name":"",
        "gpt_config":"",
        "old_gpt_config":"",
        "handler":"",
        "version_id":0
      },
      createCaseRow: null
    }
  },
  created() {
    this.getConfigList();
  },
  methods: {
    handleEditConfigForm(){
      updateConfigApi(this.editConfigFormData).then(
        response => {
          if (response.code == 200) {
            this.getConfigList()
            this.successNotice("更新配置成功")
            this.configEditVisible = false
          } else {
            this.failNotice(response.message)
          }
        }
      )
    },
    handleInput() {
      if (this.editConfigFormInputs) {
        this.editConfigFormData.white_list.push(this.editConfigFormInputs);
        this.editConfigFormInputs = "";
      }},
    handleTagClose(index){
      this.editConfigFormData.white_list.splice(index, 1);
    },
    handleEditFormClose(){
      this.configEditVisible=false;
    },
    handleEditButton(row){
      this.editConfigFormData.handler = row.handler;
      this.editConfigFormData.gpt_config = row.gpt_config;
      this.editConfigFormData.old_gpt_config = row.gpt_config;
      this.editConfigFormData.config_name = row.config_name;
      this.editConfigFormData.white_list = row.white_list;
      this.editConfigFormData.id = row.id;
      this.editConfigFormData.version_id = row.version_id;
      this.configEditVisible = true;
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
    getConfigList() {
      this.listLoading = true
      getConfigListApi(this.listQuery).then(response => {
        this.confgList = response.data.items
        this.confgList = this.confgList.map(
          item => {
            return {
              ...item,
              canEdit: false,
            }
          }
        )
        this.configListtotal = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    }
}}

</script>
<!--          <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">-->
<!--            <template slot-scope="{row,$index}">-->
<!--              <el-tag class="el-tag&#45;&#45;success" v-if="row && row.is_cased == 1">-->
<!--                已接受-->
<!--              </el-tag>-->
<!--              <el-tag class="el-tag&#45;&#45;danger" v-if="row && row.is_cased == 2">-->
<!--                已拒绝-->
<!--              </el-tag>-->

<!--              <el-popconfirm-->
<!--                ref="acceptPopConfirm"-->
<!--                title="接受建议并新建case，确定么？"-->
<!--                confirmButtonText="确定"-->
<!--                cancelButtonText="取消"-->
<!--                @onConfirm="acceptConfirmHandler(row, $index)"-->
<!--              >-->
<!--                <el-button v-if="row && row.is_cased == 0 && row.checklist_id" type="primary" size="mini"-->
<!--                           slot="reference" style="margin-left: 20px; margin-right: 20px">-->
<!--                  接受-->
<!--                </el-button>-->
<!--              </el-popconfirm>-->
<!--              <el-button v-if="row.is_cased == 2" type="warning" size="mini" @click="handleReset(row,$index)"-->
<!--                         style="float: right;margin-left: 20px; margin-right: 20px">-->
<!--                重置-->
<!--              </el-button>-->
<!--              <el-button v-if="row && (row.is_cased == 0)" size="mini" type="danger" @click="handleReject(row,$index)"-->
<!--                         style="margin-left: 20px; margin-right: 20px">-->
<!--                拒绝-->
<!--              </el-button>-->
<!--            </template>-->
<!--          </el-table-column>-->
