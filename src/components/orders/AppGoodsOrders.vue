<template>
<div>
    <el-card class="box-card">
        <com-breadcrumb level1="订单管理" level2="订单列表"></com-breadcrumb>

        <!-- 数据表格 -->
        <el-table :data="orders" border v-loading="loading" height="450" style="margin-top:20px">
            <el-table-column type="index" label="#" width="50">
            </el-table-column>
            <el-table-column prop="order_number" label="订单编号">
            </el-table-column>
            <el-table-column prop="order_price" label="订单价格">
            </el-table-column>
            <el-table-column  label="是否付款">
                <template slot-scope="scope">
                     <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
                     <el-tag v-else-if="scope.row.pay_status === '0' ">未付款</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="is_send" label="是否发货">
            </el-table-column>
            <el-table-column prop="create_time" label="下单时间">
                <template slot-scope="scope">
                    {{scope.row.create_time|moment('YYYY-MM-DD HH:mm:ss')}}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="handleShowEdit(scope.row.order_id)"></el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页栏 -->
        <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[10, 15, 20, 25]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>

        <!-- 编辑对话框 -->
         <el-dialog title="编辑订单" :visible.sync="EditUserDialogFormVisible"
         width="40%" @close="handleClose()">
            <el-form  :model="formData" >
                <el-form-item label="订单号" label-width="120px">
                    {{formData.order_number}}
                </el-form-item>
                <el-form-item label="是否发货" label-width="120px">
                    <el-switch
                         v-model="is_send"
                         active-value="是"
                         inactive-value="否"
                         active-color="#13ce66"
                         inactive-color="#ff4949"
                    ></el-switch>
                </el-form-item>
                <el-form-item label="订单支付" label-width="120px">
                    <el-radio-group v-model="formData.order_pay" >
                        <el-radio label="0">未支付</el-radio>
                        <el-radio label="1">微信</el-radio>
                        <el-radio label="2">支付宝</el-radio>
                        <el-radio label="3">银联</el-radio>
                    </el-radio-group>
                </el-form-item>
                 <el-form-item label="订单价格" label-width="120px">
                    <el-input v-model="formData.order_price" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="送货地址" label-width="120px">
                    <el-cascader v-model="selectOptions" :options="cityOptions" clearable></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" label-width="120px">
                    <el-input v-model="address" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="EditUserDialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleEdit()">修改</el-button>
            </div>
        </el-dialog> 

    </el-card>
</div>
</template>

<script>
import { provinceAndCityData, regionData, provinceAndCityDataPlus,
regionDataPlus, CodeToText, TextToCode } from 'element-china-area-data'
export default {
    data() {
        return {
            loading: false,
            orders: [],
            pagenum: 1,
            pagesize: 10,
            total: 0,
            EditUserDialogFormVisible: false,
            // 绑定表单数据
            formData: {},
            address:'', //详细地址
            is_send:'', //是否发货
            cityOptions:regionData,
            selectOptions:[],
            
        }
    },
    created() {
        //查询数据
        this.loadData();
    },
    methods: {
        //修改订单提交
        handleEdit() {
            //处理订单发货状态
            this.formData.is_send = this.is_send ==='是'?'1':'0'
            //支付状态
            if(this.formData.order_pay === '0'){
                this.formData.pay_status = '0'
            }else{
                this.formData.pay_status = '1'
            }

            //地址
            this.formData.consignee_addr = (this.selectOptions.length===0?
            '':this.selectOptions.join(','))+(this.address===''?'':(','
            +this.address))


            this.$http.put(`orders/${this.formData.order_id}`, this.formData)
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
                        this.EditUserDialogFormVisible = false
                    }
                }).catch(res => {})
        },
        //打开修改对话框
        handleShowEdit(id) {
            this.EditUserDialogFormVisible = true
            //根据ID查询用户信息
            this.$http.get(`orders/${id}`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.formData = {
                            order_id :data.order_id,
                            order_number:data.order_number,
                            order_price:data.order_price,
                            order_pay:data.order_pay,
                            is_send:data.is_send,
                            pay_status:data.pay_status,
                            consignee_addr:data.consignee_addr
                        }
                        this.is_send = data.is_send
                        //处理地址
                       // this.selectOptions=[]
                        let arr1 = data.consignee_addr ===''?[]:data.
                        consignee_addr.split(',',3)
                        let arr2 = data.consignee_addr ===''?'':data.
                        consignee_addr.substring(data.consignee_addr.lastIndexOf(',')+1)
                        this.selectOptions = arr1
                        this.address = arr2
                    }
                }).catch(res => {})

        },
        //关闭对话框
        handleClose(formName) {
            //清楚数据
            this.formData = {}
        },
        //加载
        async loadData() {
            this.loading = true
            await this.$http.get(`orders?pagenum=${this.pagenum}&pagesize=${this.pagesize}`)
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
                        this.orders = data.goods
                        this.pagenum = parseInt(data.pagenum)
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
.pagination {
    text-align: center;
    margin: 30px 0;
}
</style>
