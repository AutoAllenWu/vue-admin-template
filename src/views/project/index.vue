<template>
  <div class="app-container">

    <div style="display: flex; justify-items: center; flex-wrap: nowrap; justify-content: space-between;">
      <div class="transition-box" style="border:1px groove #b4bccc ; padding: 20px; height: fit-content;width: 20%;" >
          <el-tree
            :data="projectTreeList"
            node-key="id"
            @node-drag-start="handleDragStart"
            @node-drag-enter="handleDragEnter"
            @node-drag-leave="handleDragLeave"
            @node-drag-over="handleDragOver"
            @node-drag-end="handleDragEnd"
            @node-drop="handleDrop"
            draggable
            :allow-drop="allowDrop"
            :allow-drag="allowDrag"
            style="height: 2000px"
          >
          </el-tree>
        </div>
      <div style="display: flex; width: calc(80%);">
        <el-table>
          v-loading="listLoading"
          :data="gitProjectList"
          border
          fit
          highlight-current-row
          style="width: 2003px; height: 2000px"
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="listQuery.page_num" :limit.sync="listQuery.page_size" @pagination="getTaskList" />
      </div>
    </div>

<!--    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page_num" :limit.sync="listQuery.page_size" @pagination="getTaskList" />-->



  </div>
</template>

<script>
import { getTaskDetail, rejectGptAdvice, resetGptAdvice, createGptCase } from '@/api/smart-diff'
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
      taskVisible:false,
      //projectTreeList:[],
      gitProjectList: [],
      listLoading: true,
      listQuery: {
        page_num: 1,
        page_size: 20,
        task_id: this.paramId
      },
      projectTreeList :[{
        id: 1,
        label: '一级 1',
        children: [{
          id: 4,
          label: '二级 1-1',
          children: [{
            id: 9,
            label: '三级 1-1-1'
          }, {
            id: 10,
            label: '三级 1-1-2'
          }]
        }]
      }, {
      id: 2,
        label: '一级 2',
        children: [{
        id: 5,
        label: '二级 2-1'
      }, {
        id: 6,
        label: '二级 2-2'
      }]
    }, {
      id: 3,
        label: '一级 3',
        children: [{
        id: 7,
        label: '二级 3-1'
      }, {
        id: 8,
        label: '二级 3-2',
        children: [{
          id: 11,
          label: '三级 3-2-1'
        }, {
          id: 12,
          label: '三级 3-2-2'
        }, {
          id: 13,
          label: '三级 3-2-3'
        }]
      }]
    }]
    }
  },
  created() {
    // this.getTaskDetailList();
    // this.listQuery.task_id = this.paramId;

  },
  methods: {

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
