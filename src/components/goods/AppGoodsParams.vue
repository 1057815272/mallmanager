<template>
<el-card class="box-card">
    <!-- 面包屑 -->
    <com-breadcrumb level1="商品管理" level2="分类参数"></com-breadcrumb>

    <!-- 添加提示 -->
    <el-alert title="只允许为第三级分类添加参数" type="error" class="alert"></el-alert>

    <!-- 商品分类 -->
    <el-row class="alert">
        <span>商品分类</span>
        <el-cascader :options="categorys" v-model="selectOptions" :props="defaultProps" :show-all-levels="false" @change="handleCateChange"></el-cascader>
    </el-row>
    <!-- 卡片式动态参数切换 -->
    <el-tabs type="card" class="alert" value="1">
        <el-tab-pane label="动态参数" name="1">
            <el-button type="danger" @click="dialogFormVisibleDy=true">设置动态参数</el-button>
            <!-- 表格 -->
            <el-table :data="goodsDyParams" v-loading="loading">
                <!-- 展开行 -->
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <el-tag :key="tag" v-for="tag in props.row.attr_vals" closable :disable-transitions="false" @close="handleClose(props.row,tag)">
                            {{tag}}
                        </el-tag>
                        <el-input class="input-new-tag" v-if="inputVisible" v-model="inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(props.row)" @blur="handleInputConfirm(props.row)">
                        </el-input>
                        <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#" width="80">
                </el-table-column>
                <el-table-column prop="attr_name" label="属性名称">
                </el-table-column>
                <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" circle plain 
                        @click="handleShowEdit(scope.row.attr_id,'many')"></el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" circle plain 
                        @click="handleDelete(scope.row.attr_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态参数" name="2">
            <el-button type="danger" @click="dialogFormVisibleStatic= true">设置静态参数</el-button>
            <!-- 表格 -->
            <el-table :data="goodsStaticParams" v-loading="loading">
                <el-table-column type="index" label="#" width="80">
                </el-table-column>
                <el-table-column prop="attr_name" label="属性名称">
                </el-table-column>
                <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" circle plain 
                        @click="handleShowEdit(scope.row.attr_id,'only')"></el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" circle plain 
                        @click="handleDelete(scope.row.attr_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
        
        <!-- 添加或修改静态参数 -->
        <el-dialog :title="(formdata.attr_id==null?'添加':'修改')+'静态参数'" :visible.sync="dialogFormVisibleStatic" width="40%" @closed="handleCloseDialog">
            <el-form :model="formdata">
                <el-form-item label="参数名称" label-width="120px">
                    <el-input v-model="formdata.attr_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="参数属性" label-width="120px">
                    <el-row>
                        <el-col :span="16">
                            <el-input v-model="formdata.attr_vals" auto-complete="off"></el-input>
                        </el-col>
                        <el-col :span="6">
                            &nbsp;&nbsp;&nbsp;属性以,隔开
                        </el-col>
                    </el-row>

                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisibleStatic = false">取 消</el-button>
                <el-button type="primary" @click="handleGoodsEdit('only')">确 定 </el-button>
            </div>
        </el-dialog>

        <!-- 添加或修改动态参数 -->
        <el-dialog :title="(formdata.attr_id==null?'添加':'修改')+'动态参数'" :visible.sync="dialogFormVisibleDy" width="40%" @closed="handleCloseDialog">
            <el-form :model="formdata">
                <el-form-item label="参数名称" label-width="120px">
                    <el-input v-model="formdata.attr_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="参数属性" label-width="120px">
                    <el-row>
                        <el-col :span="16">
                            <el-input v-model="formdata.attr_vals" auto-complete="off"></el-input>
                        </el-col>
                        <el-col :span="6">
                            &nbsp;&nbsp;&nbsp;属性以,隔开
                        </el-col>
                    </el-row>

                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisibleDy = false">取 消</el-button>
                <el-button type="primary" @click="handleGoodsEdit('many')">确 定 </el-button>
            </div>
        </el-dialog>
    </el-tabs>
</el-card>
</template>

<script>
export default {
    data() {
        return {
            loading: false,
            categorys: [],
            selectOptions: [1, 3, 6], //选中
            goodsDyParams: [], //动态参数列表
            goodsStaticParams: [], //静态参数列表
            inputVisible: false,
            inputValue: '',
            dialogFormVisibleDy: false,
            dialogFormVisibleStatic:false,
            formdata: {},
            defaultProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
            }
        }
    },
    created() {
        this.loadDataCategory();
        this.handleCateChange()
    },
    methods: {
        //打开修改动态参数对话框
        handleShowEdit(id,type) {
            this.dialogFormVisibleDy = true
            //根据ID查找分类参数
            this.$http.get(`categories/${this.selectOptions[2]}/attributes/${id}`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.formdata = data
                        if(type==='only'){
                            this.dialogFormVisibleStatic = true
                        }else{
                            this.dialogFormVisibleDy = true
                        }
                    }
                }).catch(res => {})
        },
        //删除动态参数
        handleDelete(id) {
            this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                center: true
            }).then(() => {
                this.$http.delete(`categories/${this.selectOptions[2]}/attributes/${id}`)
                    .then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data
                        if (status === 200) {
                            this.handleCateChange()
                            this.$message.success(msg)
                        }
                    }).catch(res => {})
            }).catch(() => {})
        },
        //编辑动态静态参数
        handleGoodsEdit(type) {
            //验证略
            let req = null
            if (this.formdata.attr_id != null) {
                req = this.$http.put(`categories/${this.selectOptions[2]}/attributes/${this.formdata.attr_id}`, this.formdata)
            } else {
                this.formdata.attr_sel = type   //参数类型
                req = this.$http.post(`categories/${this.selectOptions[2]}/attributes`, this.formdata)
            }
            //发送请求
            req.then(res => {
                const {
                    data,
                    meta: {
                        msg,
                        status
                    }
                } = res.data
                if (status === 201 || status === 200) {
                    this.handleCateChange()
                    if(type === 'many'){
                        this.dialogFormVisibleDy = false
                    }else{
                        this.dialogFormVisibleStatic = false
                    }   
                    this.$message.success(msg)
                } 
            }).catch(res => {})
        },
        //关闭动态参数添加
        handleCloseDialog() {
            this.formdata = {}
        },
        //关闭动态标签属性
        handleClose(dyParams, tag) {
            dyParams.attr_vals.forEach((item, index) => {
                if (item === tag) {
                    dyParams.attr_vals.splice(index, 1);
                }
            })
            //发送请求 修改参数
            let formdate = {
                ...dyParams
            }
            formdate.attr_vals = dyParams.attr_vals.length === 0 ?
                '' : dyParams.attr_vals.join(',')
            this.$http.put(`categories/${this.selectOptions[2]}/attributes/
            ${dyParams.attr_id}`, formdate)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.$message.success(msg)
                    }
                }).catch(res => {})
        },
        //动态标签实现输入
        showInput() {
            this.inputVisible = true;
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        //确定添加动态标签
        handleInputConfirm(dyParams) {
            let inputValue = this.inputValue;
            if (inputValue) {
                dyParams.attr_vals.push(inputValue);
                //发送请求 修改参数
                let formdata = {
                    ...dyParams
                }
                formdata.attr_vals = dyParams.attr_vals.length === 0 ?
                    '' : dyParams.attr_vals.join(',')
                this.$http.put(`categories/${this.selectOptions[2]}/attributes/
            ${dyParams.attr_id}`, formdata)
                    .then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data
                        if (status === 200) {
                            this.$message.success(msg)
                        }
                    }).catch(res => {})
            }
            this.inputVisible = false;
            this.inputValue = '';
        },
        //选中分类参数加载动态和静态参数
        async handleCateChange() {
            this.loading = true
            //获取分类 ID
            let cate_id = this.selectOptions[2]
            //发送请求
            if (cate_id == null) {
                this.loading = false
                return
            }
            await this.$http.get(`categories/${cate_id}/attributes?sel=many`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.goodsDyParams = data
                        //处理动态参数
                        this.goodsDyParams.map(item => {
                            item.attr_vals = item.attr_vals !== '' ? item.attr_vals.split(',') : []
                        })
                    }
                }).catch(res => {})

            await this.$http.get(`categories/${cate_id}/attributes?sel=only`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.goodsStaticParams = data
                    }
                }).catch(res => {})
            this.loading = false
        },
        //分类参数
        loadDataCategory() {
            this.$http.get(`categories?type=3`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.categorys = data
                    }
                }).catch(res => {})
        }
    },
}
</script>

<style scoped>
.alert {
    margin-top: 20px;
}

.el-tag+.el-tag {
    margin-left: 10px;
}

.button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
}

.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
}
</style>
