<template>
<el-card class="box-card">
    <!-- 面包屑 -->
    <com-breadcrumb level1="商品管理" level2="商品列表"></com-breadcrumb>

    <!-- 提示添加商品 -->
    <el-alert title="商品添加" type="success" class="alert" center show-icon></el-alert>

    <!-- 步骤条 -->
    <el-steps :active="active*1" align-center finish-status="success" class="alert">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
    </el-steps>

    <el-form label-position="top" label-width="80px" :model="formdata">
        <!-- tags标签页 -->
        <el-tabs tab-position="left" v-model="active" class="alert" 
        :before-leave="handleChangeTabs" @tab-click="handleTags">
            <el-tab-pane label="基本信息" name="1">
                <!-- 基本信息表单 -->
                <el-form-item label="商品名称">
                    <el-input v-model="formdata.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格">
                    <el-input v-model="formdata.goods_price"></el-input>
                </el-form-item>
                <el-form-item label="商品重量">
                    <el-input v-model="formdata.goods_weight"></el-input>
                </el-form-item>
                <el-form-item label="商品数量">
                    <el-input v-model="formdata.goods_number"></el-input>
                </el-form-item>
                <el-form-item label="商品分类">
                    <!-- 级联下拉框 -->
                    <el-cascader :options="categorys" clearable v-model="selectOptions" 
                    :props="defauleProps"></el-cascader>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="2">
                <!-- 动态参数 -->
                <el-form-item :label="item.attr_name" v-for="(item, index) in 
                goodsDyParams" :key="index">
                    <el-checkbox v-model="item.attr_vals" :label="item1" border v-for="(item1, index) in 
                    item.attr_vals" :key="index"></el-checkbox>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="3">
                <!-- 静态参数 -->
                <el-form-item  :label="item.attr_name" v-for="(item, index) in goodsStaticParams" 
                :key="index">
                    <!-- 级联下拉框 -->
                    <el-input v-model="item.attr_vals"></el-input>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="4">
                <!-- 图片上传 -->
                <el-upload
                action="http://localhost:8888/api/private/v1/upload"
                list-type="picture-card"
                :headers="tokenHeader"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
                :on-remove="handleRemove">
                <i class="el-icon-plus"></i>
                </el-upload>
            <el-dialog :visible.sync="dialogVisible">
               <img width="100%" :src="dialogImageUrl" alt="">
            </el-dialog>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="5">
                <!-- 富文本控件 -->
                <quill-editor v-model="formdata.goods_introduce"></quill-editor>

                <!-- 提交按钮 -->
                <div class="addBtn">
                    <el-button type="success" @click="handleAddGoods">添加商品</el-button>
                </div>
                
            </el-tab-pane>
        </el-tabs>
    </el-form>
</el-card>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import { quillEditor } from 'vue-quill-editor'

export default {
    data() {
        return {
            active: '1', //tags标签页选中得值
            formdata: {
                goods_cat:[],
                pics:[],
                }, //商品数据
            categorys: [], //分类参数
            selectOptions:[1,3,6],  //选中分类参数
            goodsDyParams: [], //商品动态参数
            goodsStaticParams: [], //商品动态参数
            defauleProps: { //商品分类数据
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',   
            },
            dialogImageUrl:'',    //照片墙的显示
            dialogVisible:false,     //图片显示的地址
            tokenHeader:{
                'Authorization':localStorage.getItem('token')
              }
        }
    },
    components: {
        quillEditor,
    },
    created() {
        //加载分类参数
        this.loadDataCategory()
    },
    methods: {
        //添加商品
        handleAddGoods(){
             //1.处理goods_cat   以,合并
             this.formdata.goods_cat=this.selectOptions.join(',')
             //2.商品参数 = 动态+静态
             /* this.formdata.attrs = [...this.goodsDyParams,...this.goodsStaticParams] */
             let arr1 = this.goodsDyParams.map(item=>{
                 let val = item.attr_vals ===''?'':item.attr_vals.join(',')
                 return {'attr_id':item.attr_id,'attr_value':val}
             })
             let arr2 = this.goodsStaticParams.map(item=>{
                 return {'attr_id':item.attr_id,'attr_value':item.attr_vals}
             })
             this.formdata.attrs = [...arr1,...arr2]
              this.$http.post(`goods`,this.formdata)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 201) {
                        this.$message.success(msg)
                        this.formdata={}
                        //跳转商品列表
                        this.$router.push({name:'goods'})
                    }
                }).catch(res => {})
        },
        //上传前验证
          beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG或PNG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
      },
        //点击图片移除
      handleRemove(file, fileList) {
        this.formdata.pics.forEach((item,index)=>{
            if (item.pic === file.response.data.tmp_path) {
                this.formdata.pics.spice(index,1)
            }
        })
      },
      //上传成功处理
      handleAvatarSuccess(res,file) {
        if (res.meta.status === 200) {
             this.$message.success('图片上传成功！')
             this.formdata.pics.push({'pic':res.data.tmp_path})
        }else{
              this.$message.error('图片上传失败！')
        }
      },
        //当标签被选中时
       async handleTags(){
            //商品参数 （动态参数）
            if(this.active === '2'){
               await this.loadDataParams('many')
               this.goodsDyParams.forEach(item=>{
                   item.attr_vals =item.attr_vals ===0?'':item.attr_vals.split(',')
               })
            }else if(this.active === "3"){
                  await this.loadDataParams() 
            }
        },
        //当标签页变换时
        handleChangeTabs() {
            if (this.selectOptions.length !== 3) {
                this.$message.warning('请先选择商品分类');
                return false
            }
        },
        //分类参数
      async loadDataParams(type = 'only'){
            //获取分类 ID
            let cate_id = this.selectOptions[2]
            //发送请求
              const res =  await this.$http.get(`categories/${cate_id}/attributes?sel=${type}`)
              if(type === "many"){
                  this.goodsDyParams = res.data.data
              }else{
                  this.goodsStaticParams = res.data.data
              }
                    
                 
        },
        //商品分类
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
.addBtn{
    display: flex;
    align-items:initial;
    margin-top: 40px;
}
</style>
