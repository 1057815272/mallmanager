<template>
<el-card class="box-card">
    <com-breadcrumb level1="数据统计" level2="数据报表"></com-breadcrumb>
    <!-- 绘制圆形区域 -->
    <div id="main" style="width:800px;height:400px;margin-top:20px"></div>
</el-card>
</template>

<script>
/* 引入echarts */
const echarts = require('echarts')

export default {
    /* 必须等页面加载完成 */
   async mounted() {
        let myChart = echarts.init(document.getElementById('main'))
        var option2;
        var option1 = {
            title: {
                text: '区域销售情况统计图'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
        };
        /* 发送请求获取数据 */
         await this.$http.get(`reports/type/1`)
            .then(res => {
                const {
                    data,
                    meta: {
                        msg,
                        status
                    }
                } = res.data
                if (status === 200) {
                    option2 = data
                }

            }).catch(res => {}) 

        var option = {
            ...option1,
            ...option2
        }
        myChart.setOption(option)
    },
}
</script>

<style scoped>

</style>
