<template>
    <div class="content">
        <!-- 搜索区域 -->
        <el-card class="search-card" :body-style="cardPad">
            <el-form :model="queryParams" :inline="true" label-width="100px">
                <el-form-item label="评价人">
                    <el-input v-model="queryParams.evaluator" style="width: 200px" placeholder="请输入评价人" clearable />
                </el-form-item>
                <el-form-item label="课程名称">
                    <el-input v-model="queryParams.courseName" style="width: 200px" placeholder="请输入课程名称" clearable />
                </el-form-item>
                <el-form-item label="授课老师">
                    <el-input v-model="queryParams.teacher" style="width: 200px" placeholder="请输入授课老师" clearable />
                </el-form-item>
                <el-form-item label="评价时间">
                    <el-date-picker v-model="queryParams.evaluateTime" style="width: 300px" type="daterange"
                        range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
                    <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 表格区域 -->
        <div class="table-container">
            <el-table :data="tableData" v-bind="{ ...tableConfig }" v-loading="loading">
                <el-table-column prop="evaluateId" label="评价ID" />
                <el-table-column prop="evaluator" label="评价人" />
                <el-table-column prop="courseName" label="课程名称" />
                <el-table-column prop="teacher" label="授课老师" />
                <el-table-column prop="classTime" label="上课时间" />
                <el-table-column prop="rating" label="评分">
                    <template #default="{ row }">
                        <el-rate v-model="row.rating" disabled show-score text-color="#ff9900" />
                    </template>
                </el-table-column>
                <el-table-column prop="content" label="评价内容" show-overflow-tooltip />
                <el-table-column prop="evaluateTime" label="评价时间" />
                <el-table-column label="操作" fixed="right">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleDetail(row)">
                            详情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 分页区域 -->
        <div class="pagination-container">
            <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="totalNum"
                :page-sizes="pageNationConfig.pageSizes" v-model:current-page="currentPage" v-model:page-size="pageSize"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
    </div>

    <!-- 评价详情弹窗 -->
    <el-dialog v-model="detailDialogShow" width="800" title="评价详情" destroy-on-close>
        <div class="detail-content">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="评价ID">{{ detailData.evaluateId }}</el-descriptions-item>
                <el-descriptions-item label="评价时间">{{ detailData.evaluateTime }}</el-descriptions-item>
                <el-descriptions-item label="评价人">{{ detailData.evaluator }}</el-descriptions-item>
                <el-descriptions-item label="课程名称">{{ detailData.courseName }}</el-descriptions-item>
                <el-descriptions-item label="授课老师">{{ detailData.teacher }}</el-descriptions-item>
                <el-descriptions-item label="上课时间">{{ detailData.classTime }}</el-descriptions-item>
                <el-descriptions-item label="评分">
                    <el-rate v-model="detailData.rating" disabled show-score text-color="#ff9900" />
                </el-descriptions-item>
                <el-descriptions-item label="评价内容" :span="2">
                    <div class="content-text">{{ detailData.content }}</div>
                </el-descriptions-item>
            </el-descriptions>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { tableConfig } from '@/config/tableConfig'
import { pageNationConfig } from '@/config/pageConfig'
import { cardPad } from '@/config/cardConfig'

// 响应式数据
const loading = ref(false)
const detailDialogShow = ref(false)

// 查询参数
const queryParams = reactive({
    evaluator: '',
    courseName: '',
    teacher: '',
    evaluateTime: []
})

// 表格数据
const tableData = ref([
    {
        evaluateId: '87262690176',
        evaluator: '周建豪',
        courseName: '商务英语基础语法（一）',
        teacher: '12345666张兰',
        classTime: '06/15 14:00-15:30',
        rating: 5,
        content: '老师讲得很好，内容丰富，受益匪浅...',
        evaluateTime: '2025-10-10 10:10:10'
    },
    {
        evaluateId: '87262690177',
        evaluator: '李小明',
        courseName: '雅思实战演练03',
        teacher: '12345666张兰',
        classTime: '06/16 14:00-15:30',
        rating: 4,
        content: '课程内容很实用，老师很专业...',
        evaluateTime: '2025-10-11 10:10:10'
    },
    {
        evaluateId: '87262690178',
        evaluator: '王小红',
        courseName: '商务英语基础语法（二）',
        teacher: '12345666张兰',
        classTime: '06/17 14:00-15:30',
        rating: 5,
        content: '非常满意，老师教学方法很好...',
        evaluateTime: '2025-10-12 10:10:10'
    }
])

// 分页数据
const totalNum = ref(100)
const currentPage = ref(1)
const pageSize = ref(pageNationConfig.pageSize)

// 详情数据
const detailData = ref<any>({})

/**
 * 查询数据
 */
const handleQuery = () => {
    loading.value = true
    // 模拟API调用
    setTimeout(() => {
        loading.value = false
        ElMessage.success('查询成功')
    }, 1000)
}

/**
 * 重置查询条件
 */
const handleReset = () => {
    queryParams.evaluator = ''
    queryParams.courseName = ''
    queryParams.teacher = ''
    queryParams.evaluateTime = []
    handleQuery()
}

/**
 * 查看详情
 */
const handleDetail = (row: any) => {
    detailData.value = { ...row }
    detailDialogShow.value = true
}

/**
 * 分页大小改变
 */
const handleSizeChange = (val: number) => {
    pageSize.value = val
    handleQuery()
}

/**
 * 当前页改变
 */
const handleCurrentChange = (val: number) => {
    currentPage.value = val
    handleQuery()
}

onMounted(() => {
    handleQuery()
})
</script>

<style scoped lang="scss">
.content {
    width: 99%;

    // 搜索卡片样式
    .search-card {
        margin-bottom: 20px;
    }

    // 表格容器样式
    .table-container {
        margin-bottom: 20px;
    }

    // 分页容器样式
    .pagination-container {
        display: flex;
        justify-content: flex-end;
    }
}

// 详情内容样式
.detail-content {
    .content-text {
        line-height: 1.6;
        word-break: break-all;
    }
}
</style>
