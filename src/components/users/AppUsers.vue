<template>
<div>
    <el-card class="box-card">
        <com-breadcrumb level1="用户管理" level2="用户列表" ></com-breadcrumb>
        <!-- 搜索框 -->
        <el-row class="row">
            <el-col :span="6">
                <el-input placeholder="请输入内容" v-model="searchValue" class="input-with-select">
                    <el-button slot="append" @click="loadData" icon="el-icon-search"></el-button>
                </el-input>
            </el-col>
            <el-col :span="6">
                <el-button type="success" plain class="addBtn" @click="addUserDialogFormVisible = true">添加用户</el-button>
            </el-col>
        </el-row>

        <!-- 数据表格 -->
        <el-table :data="users" border style="width: 100%" v-loading="loading">
            <el-table-column type="index" label="#" width="50">
            </el-table-column>
            <el-table-column prop="username" label="姓名">
            </el-table-column>
            <el-table-column prop="email" label="邮箱">
            </el-table-column>
            <el-table-column prop="mobile" label="电话">
            </el-table-column>
            <el-table-column prop="create_time" label="创建日期">
                <template slot-scope="scope">
                    {{scope.row.create_time|moment('YYYY-MM-DD HH:mm:ss')}}
                </template>
            </el-table-column>
            <el-table-column prop="mg_state" label="用户状态">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.mg_state" actiove-color="#13ce66" inactive-color="#ff4949" @change="handleChangeStatus(scope.row.id,scope.row.mg_state)">
                    </el-switch>
                </template>
            </el-table-column>

            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="handleShowEdit(scope.row.id)"></el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.row.id)"></el-button>
                    <el-button size="mini" type="success" icon="el-icon-check" circle plain @click="handleShowRole(scope.row.id)"></el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页栏 -->
        <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[2, 4, 6, 8]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>

        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户" :visible.sync="addUserDialogFormVisible" width="40%" @close="handleClose('ruleAddForm')">
            <el-form label-width="120px" :model="formData" :rules="rules" ref="ruleAddForm">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="formData.username" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="formData.password" auto-complete="off" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="repwd">
                    <el-input v-model="formData.repwd" auto-complete="off" show-password></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="formData.email" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="mobile">
                    <el-input v-model="formData.mobile" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addUserDialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定 </el-button>
            </div>
        </el-dialog>

        <!-- 编辑用户 -->
        <el-dialog title="编辑用户" :visible.sync="EditUserDialogFormVisible" width="40%" @close="handleClose('ruleEditForm')">
            <el-form label-width="120px" :model="formData" :rules="rules" ref="ruleEditForm">
                <el-form-item label="用户名">
                    <el-input v-model="formData.username" auto-complete="off" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="formData.email" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="mobile">
                    <el-input v-model="formData.mobile" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="EditUserDialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleEdit('ruleEditForm')">修改</el-button>
            </div>
        </el-dialog>

         <!-- 分配角色 -->
        <el-dialog title="编辑用户" :visible.sync="RoleUserDialogFormVisible" width="40%" 
        @close = "handleCloseRole">
            <el-form label-width="120px" :model="formData">
                <el-form-item label="用户名">
                   {{formData.username}}
                </el-form-item>

                <el-form-item label="角色">
                    <el-select v-model="formData.rid" placeholder="请选择">
                    <el-option
                     v-for="item in roles"
                     :key="item.id"
                     :label="item.roleName"
                     :value="item.id">
                    </el-option>
  </el-select>
                </el-form-item>
              
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="RoleUserDialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleEditRole">确定</el-button>
            </div>
        </el-dialog>

    </el-card>
</div>
</template>

<script>
export default {
    data() {
        var validateRepwd = (rule, value, callback) => {
            if (value === '' || value === undefined) {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.formData.password) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        }
        var validateEmail = (rule, value, callback) => {
            let reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
            if (value === '' || value === undefined) {
                callback(new Error('请输入邮箱'));
            } else if (!reg.test(value)) {
                callback(new Error('邮箱格式不合法'));
            } else {
                callback();
            }
        }
        var validateMobile = (rule, value, callback) => {
            let reg = /^1[3-9]\d{9}$/
            if (value === '' || value === undefined) {
                callback(new Error('请输入手机号'));
            } else if (!reg.test(value)) {
                callback(new Error('手机格式不合法'));
            } else {
                callback();
            }
        }
        return {
            users: [],
            pagenum: 1,
            pagesize: 2,
            total: 0,
            searchValue: '',
            addUserDialogFormVisible: false,
            EditUserDialogFormVisible: false,
            RoleUserDialogFormVisible:false,
            loading:false,
            // 绑定表单数据
            formData: {},
            roles: {},
            // 表单验证规则 
            rules: {
                username: [{
                        required: true,
                        message: '请输入用户名称',
                        trigger: 'blur'
                    },
                    {
                        min: 2,
                        max: 10,
                        message: '长度在 2 到 10 个字符',
                        trigger: 'blur'
                    }
                ],
                password: [{
                        required: true,
                        message: '请输入密码',
                        trigger: 'blur'
                    },
                    {
                        min: 6,
                        max: 16,
                        message: '长度在 6 到 16 个字符',
                        trigger: 'blur'
                    }
                ],
                repwd: [{
                    required: true,
                    validator: validateRepwd,
                    trigger: 'blur'
                }],
                email: [{
                    required: true,
                    validator: validateEmail,
                    trigger: 'blur'
                }],
                mobile: [{
                    required: true,
                    validator: validateMobile,
                    trigger: 'blur'
                }],
            },

        }
    },
    created() {
        //查询数据
        this.loadData();
    },
    methods: {
        //关闭角色对话框
        handleCloseRole(){
            this.formData = {}
        },
        //分配角色
        handleEditRole(){
            if(this.formData.rid === undefined){
                this.$message.warning('请选择分配的角色')
                return
            }
            //发送请求
             this.$http.put(`users/${this.formData.id}/role`,this.formData)
                        .then(res => {
                            const {
                                data,
                                meta: {
                                    msg,
                                    status
                                }
                            } = res.data
                            if (status === 200) {
                                  this.RoleUserDialogFormVisible = false
                                  this.$message.success(msg)
                            } 

                        }).catch(res => {})
        },
        //打开角色对话框
        handleShowRole(id){
            this.RoleUserDialogFormVisible = true
            //查询用户信息
              this.$http.get(`users/${id}`)
                        .then(res => {
                            const {
                                data,
                                meta: {
                                    msg,
                                    status
                                }
                            } = res.data
                            if (status === 200) {
                                  this.formData =data
                                  //处理为-1
                                  this.formData.rid = data.rid == -1?data.rid = 
                                  undefined : data.rid
                            } 

                        }).catch(res => {})
            //加载角色列表
            this.$http.get(`roles`)
                        .then(res => {
                            const {
                                data,
                                meta: {
                                    msg,
                                    status
                                }
                            } = res.data
                            if (status === 200) {
                                  this.roles = data
                            } 

                        }).catch(res => {})
        },
        //修改用户
        handleEdit(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    //发送请求
                    this.$http.put(`users/${this.formData.id}`, this.formData)
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
                                this.EditUserDialogFormVisible = false
                            } 

                        }).catch(res => {})
                } else {
                    return false;
                }
            })
        },
        //打开修改对话框
        handleShowEdit(id) {
            this.EditUserDialogFormVisible = true
            //根据ID查询用户信息
            this.$http.get(`users/${id}`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.formData = data
                    } 
                }).catch(res => {})

        },
        //添加用户
        addUser() {
            this.$refs['ruleAddForm'].validate((valid) => {
                if (valid) {
                    //发送请求
                    this.$http.post(`users`, this.formData)
                        .then(res => {
                            const {
                                data,
                                meta: {
                                    msg,
                                    status
                                }
                            } = res.data
                            if (status === 201) {
                                this.loadData()
                                this.$message.success(msg)
                                this.addUserDialogFormVisible = false
                            } 

                        }).catch(res => {})
                } else {
                    return false;
                }
            })
        },
        //关闭添加对话框
        handleClose(formName) {
            //清楚数据
            this.formData = {}
            //重新验证
            this.$refs[formName].resetFields();

        },
        //删除用户
        handleDelete(id) {
            this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                .then(async () => {
                    const res = await this.$http.delete(`users/${id}`)
                    const data = res.data
                    // console.log(data) 
                    const {
                        meta: {
                            status,
                            msg
                        }
                    } = data
                    if (status === 200) {
                        // 删除成功 重新加载数据 
                        this.pagenum = 1
                        this.loadData()
                    }
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: msg
                    })
                })
        },
        //改变状态
        handleChangeStatus(id, state) {
            this.$http.put(`users/${id}/state/${state}`)
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
        },
        //加载
        async loadData() {
            this.loading = true
          await  this.$http.get(`users?query=${this.searchValue}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`)
                .then(res => {
                    /* console.log(res); */
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.users = data.users
                        this.pagenum = data.pagenum
                        this.total = data.total
                    }

                }).catch(res => {})
                this.loading =false
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
.row {
    margin: 20px 0;
}

.addBtn {
    margin-left: 10px;
}

.pagination {
    text-align: center;
    margin: 30px 0;
}
</style>
