<template>
<el-container class="container">
    <el-header class="header">
        <el-row>
            <el-col :span="22">
                <h1>电商管理系统</h1>
            </el-col>
            <el-col :span="2">
                <a href="#" @click.prevent="handleExit">退出</a>
            </el-col>
        </el-row>
    </el-header>
    <el-container>
        <!-- 侧边栏 -->
        <el-aside width="200px" class="aside" >
            <el-menu class="menu" :unique-opend="true" :router="true">

                <el-submenu :index="index+''" v-for="(item,index) in menus" :key="index">
                    <template slot="title">
                        <i class="el-icon-s-tools"></i>
                        <span>{{item.authName}}</span>
                    </template>
                    <el-menu-item :index="'/'+item1.path" v-for="(item1,index) in item.children" :key="index">
                        <i class="el-icon-menu"></i>
                        <span slot="title">{{item1.authName}}</span>
                    </el-menu-item>
                </el-submenu>

            </el-menu>
        </el-aside>
         
         <!-- 主体 -->
        <el-main class="main">
            <router-view></router-view>
        </el-main>

    </el-container>
</el-container>
</template>

<script>
export default {
    data() {
        return {
            menus: [],   //菜单项
        }
    },
    //判断是否有token   仅仅事在第一次首页时才生效。最终效果：每次页面跳转都需要验证 
    /* beforeCreate() {
        let token = localStorage.getItem('token')
        if (!token) { //true 没有登陆 token = null
            //跳转登录
            this.$router.push({
                name: 'login'
            })

            this.$message.warning('请先登陆！')
        } */
    created () {
         this.$http.get(`menus`)
                    .then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data
                        if (status === 200) {      
                               this.menus = data
                        } 
                    }).catch(res => {});
    },
    methods: {
        //退出
        handleExit() {
            //清空
            localStorage.clear()
            //跳转页面
            this.$router.push({
                name: 'login'
            })
        }
    },
}
</script>

<style scoped>
.header {
    background-color: #222;
    color: #fff;
    text-align: center;
    line-height: 60px;
}

.header a {
    color: #fff;
}

.container,
.aside,
.menu {
    height: 100%
}
.main{
    background-color: #e8edf2;
}
</style>
