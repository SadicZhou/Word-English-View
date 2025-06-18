<template>
    <div class="content">
        <!-- 搜索区域 -->
        <el-card class="search-card" :body-style="cardPad">
            <el-form :model="queryParams" :inline="true" label-width="100px">
                <el-form-item label="学员姓名">
                    <el-input v-model="queryParams.studentName" style="width: 200px" placeholder="请输入学员姓名" clearable />
                </el-form-item>
                <el-form-item label="积分类型">
                    <el-select v-model="queryParams.pointType" style="width: 200px" placeholder="请选择积分类型" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="签到积分" value="签到积分" />
                        <el-option label="课程积分" value="课程积分" />
                        <el-option label="活动积分" value="活动积分" />
                        <el-option label="推荐积分" value="推荐积分" />
                        <el-option label="消费积分" value="消费积分" />
                    </el-select>
                </el-form-item>
                <el-form-item label="积分变动">
                    <el-select v-model="queryParams.changeType" style="width: 200px" placeholder="请选择积分变动" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="增加" value="增加" />
                        <el-option label="减少" value="减少" />
                    </el-select>
                </el-form-item>
                <el-form-item label="记录时间">
                    <el-date-picker v-model="queryParams.recordTime" style="width: 300px" type="daterange"
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
                <el-table-column prop="recordId" label="记录ID" />
                <el-table-column prop="studentName" label="学员姓名" />
                <el-table-column prop="pointsType" label="积分类型" />
                <el-table-column prop="changeType" label="变动类型">
                    <template #default="{ row }">
                        <el-tag :type="row.changeType === '增加' ? 'success' : 'danger'">
                            {{ row.changeType }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="pointsChange" label="积分变动">
                    <template #default="{ row }">
                        <span :class="{
                            'points-increase': row.changeType === '增加',
                            'points-decrease': row.changeType === '减少'
                        }">
                            {{ row.changeType === '增加' ? '+' : '-' }}{{ Math.abs(row.pointsChange) }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="currentPoints" label="当前积分" />
                <el-table-column prop="reason" label="变动原因" show-overflow-tooltip />
                <el-table-column prop="relatedCourse" label="关联课程" show-overflow-tooltip />
                <el-table-column prop="recordTime" label="记录时间" />
                <el-table-column label="操作" fixed="right" width="100">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleDetail(row)">详情</el-button>
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

    <!-- 积分记录详情弹窗 -->
    <el-dialog v-model="detailDialogShow" width="600" title="积分记录详情" destroy-on-close>
        <div class="detail-content">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="记录ID">{{ detailData.recordId }}</el-descriptions-item>
                <el-descriptions-item label="学员姓名">{{ detailData.studentName }}</el-descriptions-item>
                <el-descriptions-item label="积分类型">{{ detailData.pointsType }}</el-descriptions-item>
                <el-descriptions-item label="变动类型">
                    <el-tag :type="detailData.changeType === '增加' ? 'success' : 'danger'">
                        {{ detailData.changeType }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="积分变动">
                    <span :class="{
                        'points-increase': detailData.changeType === '增加',
                        'points-decrease': detailData.changeType === '减少'
                    }">
                        {{ detailData.changeType === '增加' ? '+' : '-' }}{{ Math.abs(detailData.pointsChange) }}
                    </span>
                </el-descriptions-item>
                <el-descriptions-item label="当前积分">{{ detailData.currentPoints }}</el-descriptions-item>
                <el-descriptions-item label="关联课程" :span="2">{{ detailData.relatedCourse || '无'
                    }}</el-descriptions-item>
                <el-descriptions-item label="变动原因" :span="2">
                    <div class="content-text">{{ detailData.reason }}</div>
                </el-descriptions-item>
                <el-descriptions-item label="记录时间" :span="2">{{ detailData.recordTime }}</el-descriptions-item>
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
    studentName: '',
    pointType: '',
    changeType: '',
    recordTime: []
})

// 表格数据
const tableData = ref([
    {
        recordId: 'PTS001',
        studentName: '周建豪',
        pointsType: '课程签到',
        changeType: '增加',
        pointsChange: 10,
        currentPoints: 150,
        reason: '完成《商务英语基础语法（一）》课程签到',
        relatedCourse: '商务英语基础语法（一）',
        recordTime: '2025-10-10 14:30:00'
    },
    {
        recordId: 'PTS002',
        studentName: '李小明',
        pointsType: '完成作业',
        changeType: '增加',
        pointsChange: 20,
        currentPoints: 180,
        reason: '完成课后作业并获得优秀评价',
        relatedCourse: '雅思实战演练03',
        recordTime: '2025-10-11 16:20:00'
    },
    {
        recordId: 'PTS003',
        studentName: '王小红',
        pointsType: '课程评价',
        changeType: '增加',
        pointsChange: 5,
        currentPoints: 95,
        reason: '对课程进行评价',
        relatedCourse: '商务英语基础语法（二）',
        recordTime: '2025-10-12 18:45:00'
    },
    {
        recordId: 'PTS004',
        studentName: '张三',
        pointsType: '积分兑换',
        changeType: '减少',
        pointsChange: -50,
        currentPoints: 100,
        reason: '兑换学习资料包',
        relatedCourse: '',
        recordTime: '2025-10-13 10:15:00'
    },
    {
        recordId: 'PTS005',
        studentName: '李四',
        pointsType: '推荐朋友',
        changeType: '增加',
        pointsChange: 30,
        currentPoints: 130,
        reason: '成功推荐朋友注册并报名课程',
        relatedCourse: '',
        recordTime: '2025-10-14 12:30:00'
    },
    {
        recordId: 'PTS006',
        studentName: '王五',
        pointsType: '系统奖励',
        changeType: '增加',
        pointsChange: 25,
        currentPoints: 75,
        reason: '连续学习7天奖励',
        relatedCourse: '',
        recordTime: '2025-10-15 08:00:00'
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
    queryParams.studentName = ''
    queryParams.pointType = ''
    queryParams.changeType = ''
    queryParams.recordTime = []
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

<style scoped>
.content {
    padding: 20px;
}

.search-card {
    margin-bottom: 20px;
}

.table-container {
    background: white;
    border-radius: 6px;
    padding: 20px;
    margin-bottom: 20px;
}

.pagination-container {
    display: flex;
    justify-content: center;
    background: white;
    padding: 20px;
    border-radius: 6px;
}

.points-increase {
    color: #67c23a;
    font-weight: bold;
}

.points-decrease {
    color: #f56c6c;
    font-weight: bold;
}

.detail-content .content-text {
    max-height: 100px;
    overflow-y: auto;
}
</style>
