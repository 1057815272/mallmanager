<template>
<div>
    <el-card class="box-card">
        <com-breadcrumb level1="商品管理" level2="商品分类"></com-breadcrumb>
        <!-- 按钮 -->
        <el-button type="success" plain class="addBtn" @click="handleAddGoodsCate()">添加分类</el-button>
    

        <!-- 数据表格 -->
        <el-table :data="category" border  v-loading="loading" height="450">
            <!-- <el-table-column prop="cat_name" label="分类名称">
            </el-table-column> -->
            <!-- 树状菜单 -->
            <el-tree-grid
                prop="cat_name"
                label="分类名称"
                treeKey="cat_id"
                parentKey="cat_pid"
                levelKey="cat_level"
                childKey="children"
                :indentSize="30"
                folderIcon=""
            >
            </el-tree-grid>
            <el-table-column  label="级别">
                <template slot-scope="scope">
                     <span v-if="scope.row.cat_level === 0">一级</span>
                     <span v-if="scope.row.cat_level === 1">二级</span>
                     <span v-if="scope.row.cat_level === 2">三级</span>
                </template>
            </el-table-column>
            <el-table-column  label="是否有效">
                <template slot-scope="scope">
                       {{scope.row.cat_deleted?"无效":"有效"}}
                </template>   
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit" circle plain 
                    @click="handleShowEdit(scope.row)"></el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" circle plain 
                    @click="handleDelete(scope.row.cat_id)"></el-button>
                </template>
            </el-table-column>
        </el-table>

       <!-- 分页栏 -->
        <el-pagination class="pagination" @size-change="handleSizeChange" 
        @current-change="handleCurrentChange" 
        :current-page="pagenum" :page-sizes="[10, 15, 20, 25]" 
        :page-size="pagesize" 
        layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>

        <!-- 添加用户对话框 -->
        <el-dialog title="添加商品分类" :visible.sync="addUserDialogFormVisible" 
        width="40%" @close="handleCloseDialog()">
            <el-form  :model="formData" >
                <el-form-item label="分类名称"   label-width="120px">
                    <el-input v-model="formData.cat_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="选择分类"  label-width="120px">
                    <el-cascader :options="cateOptions" clearable v-model="selectOptions" :props="defaultProps"></el-cascader>
                    分类不选，即为根级
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addUserDialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleAdd()">确 定 </el-button>
            </div>
        </el-dialog>  

        <!-- 编辑用户 -->
        <el-dialog title="商品分类" :visible.sync="EditUserDialogFormVisible" width="40%"
         @close="handleCloseDialog()">
            <el-form  :model="formData" >
               <el-form-item label="分类名称"   label-width="120px">
                    <el-input v-model="formData.cat_name" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="EditUserDialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleEdit">修改</el-button>
            </div>
        </el-dialog>  

    </el-card>
</div>
</template>

<script>
 var ElTreeGrid = require('element-tree-grid')
export default {
    data() {
        return {
            loading: false,
            category: [],
            cateOptions:[], // 选中分类
            selectOptions: [], //选中
            pagenum: 1,
            pagesize:10,
            total: 0,
            // 绑定表单数据
            formData: {},
            addUserDialogFormVisible :false,   //添加对话框
            EditUserDialogFormVisible:false,   //编辑对话框
            defaultProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                checkStrictly:true
            }
        }
    },
    components: {
        ElTreeGrid,
    },
    created() {
        //查询数据
        this.loadData();
    },
    methods: {
        //打开修改对话框
        handleShowEdit(category){
               this.formData = {
                   cat_id:category.cat_id,
                   cat_name:category.cat_name
               }
               this.EditUserDialogFormVisible = true
        },
        //修改
        handleEdit(){
                  this.$http.put(`categories/${this.formData.cat_id}`,this.formData)
                .then(res => {
                    /* console.log(res); */
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200){
                       this.loadData()
                       this.$message.success(msg)
                       this.EditUserDialogFormVisible = false
                    }
                }).catch(res => {})
        },
        //添加分类
        handleAdd(){
             if(this.selectOptions.length === 0){
                 this.formData.cat_level = 0
                 this.formData.cat_pid = 0
             }else if(this.selectOptions.length ===1){
                 this.formData.cat_level = 1
                 this.formData.cat_pid = this.selectOptions[0]
             }else if(this.selectOptions.length ===2){
                 this.formData.cat_level = 2
                 this.formData.cat_pid = this.selectOptions[1]
             }
             //发送请求
             this.$http.post(`categories`,this.formData)
                .then(res => {
                    /* console.log(res); */
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 201){
                       this.loadData()
                       this.$message.success(msg)
                       this.addUserDialogFormVisible = false
                       this.selectOptions = []
                    }
                }).catch(res => {})
        },
        //打开添加分类对话框
        handleAddGoodsCate(){
             this.$http.get(`categories? type=2`)
                .then(res => {
                    /* console.log(res); */
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200){
                        this.cateOptions = data
                        this.addUserDialogFormVisible = true
      
                    }

                }).catch(res => {})
        },
        //关闭添加对话框
        handleCloseDialog() {
            //清楚数据
            this.formData = {}
        },
        //删除分类
        handleDelete(id) {
         this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                center: true
            }).then(() => {
                this.$http.delete(`categories/${id}`)
                    .then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data
                        if (status === 200) {
                            this.loadData()
                            this.$message.success(msg)
                        }
                    }).catch(res => {})
            }).catch(() => {})
        },
        //加载
        async loadData() {
            this.loading = true
            await this.$http.get(`categories? type=3&pagenum=${this.pagenum}&pagesize=${this.pagesize}`)
                .then(res => {
                    /* console.log(res); */
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200){
                        this.category = data.result
                        this.pagenum = data.pagenum
                        this.total = data.total 
                    }
                }).catch(res => {})
            this.loading = false
        },
        handleSizeChange(val) {
            this.pagesize = val
            this.loadData()
        },
        handleCurrentChange(val) {
            this.pagenum = val
            this.loadData()
        }, 
    },
}
</script>

<style scoped>

.addBtn {
    margin: 20px;
}

.pagination {
    text-align: center;
    margin: 30px 0;
}
</style>
