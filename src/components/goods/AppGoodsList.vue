<template>
<div>
    <el-card class="box-card">
        <com-breadcrumb level1="商品管理" level2="商品列表"></com-breadcrumb>
        <!-- 搜索框 -->
        <el-row class="row">
            <el-col :span="6">
                <el-input placeholder="请输入内容" v-model="searchValue" class="input-with-select">
                    <el-button slot="append" @click="loadData" icon="el-icon-search"></el-button>
                </el-input>
            </el-col>
            <el-col :span="6">
                <el-button type="success" plain class="addBtn" @click="$router.push({name:'goodsadd'})">添加商品</el-button>
            </el-col>
        </el-row>

        <!-- 数据表格 -->
        <el-table :data="goods" border style="width: 100%" v-loading="loading" height="400">
            <el-table-column type="index" label="#" width="50">
            </el-table-column>
            <el-table-column prop="goods_name" label="商品名称">
            </el-table-column>
            <el-table-column prop="goods_price" label="商品价格（元）" width="100">
            </el-table-column>
            <el-table-column prop="goods_weight" label="商品重量" width="100">
            </el-table-column>
            <el-table-column label="创建日期" width="160">
                <template slot-scope="scope">
                    {{scope.row.add_time|moment('YYYY-MM-DD HH:mm:ss')}}
                </template>
            </el-table-column>

            <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="handleShowEdit(scope.row.goods_id)"></el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.row.goods_id)"></el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页栏 -->
        <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>

    </el-card>
</div>
</template>

<script>
export default {
    data() {
        return {
            goods: [],
            pagenum: 1,
            pagesize: 5,
            total: 0,
            searchValue: '',
            loading: false,
        }
    },
    created() {
        //查询数据
        this.loadData();
    },
    methods: {
        //修改跳转
        handleShowEdit(id) {
            this.$router.push({
                name: 'goodsedit',
                params: {
                    id: id
                }
            })
        },
        //删除用户
        handleDelete(id) {
            this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                center: true
            }).then(() => {
                this.$http.delete(`goods/${id}`)
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
            await this.$http.get(`goods?query=${this.searchValue}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`)
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
                        this.goods = data.goods
                        this.pagenum = data.pagenum
                        this.total = data.total
                    }

                }).catch(res => {})
            this.loading = false
        },
        handleSizeChange(val) {
            this.pagesize = parseInt(val)
            this.loadData()
        },
        handleCurrentChange(val) {
            this.pagenum = parseInt(val)
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
