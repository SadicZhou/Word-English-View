<template>
    <div class="content">
        <!-- 搜索区域 -->
        <el-card class="search-card" :body-style="cardPad">
            <el-form :model="queryParams" :inline="true" label-width="100px">
                <el-form-item label="状态">
                    <el-select v-model="queryParams.status" style="width: 200px" placeholder="请选择状态" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="已读" value="已读" />
                        <el-option label="未读" value="未读" />
                    </el-select>
                </el-form-item>
                <el-form-item label="通知类型">
                    <el-select v-model="queryParams.notificationType" style="width: 200px" placeholder="请选择通知类型"
                        clearable>
                        <el-option label="全部" value="" />
                        <el-option label="剩余课程不足提醒" value="剩余课程不足提醒" />
                        <el-option label="合同到期提醒" value="合同到期提醒" />
                        <el-option label="恶意约课预警" value="恶意约课预警" />
                        <el-option label="课程变更通知" value="课程变更通知" />
                    </el-select>
                </el-form-item>
                <el-form-item label="发送时间">
                    <el-date-picker v-model="queryParams.sendTime" style="width: 300px" type="daterange"
                        range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
                    <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 操作区域 -->
        <el-card class="action-card" :body-style="cardPad">
            <el-row>
                <el-col :span="24" style="text-align: right;">
                    <el-button type="primary" @click="markAllAsRead">全部已读</el-button>
                </el-col>
            </el-row>
        </el-card>

        <!-- 表格区域 -->
        <div class="table-container">
            <el-table :data="tableData" v-bind="{ ...tableConfig }" v-loading="loading">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="title" label="通知标题" />
                <el-table-column prop="status" label="状态">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '已读' ? 'success' : 'warning'">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="notificationType" label="通知类型" />
                <el-table-column prop="content" label="通知内容" show-overflow-tooltip />
                <el-table-column prop="sender" label="发件人" />
                <el-table-column prop="sendTime" label="发送时间" />
                <el-table-column fixed="right" label="操作" width="120" align="center">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleDetail(row)">
                            详情
                        </el-button>
                        <el-button link type="danger" size="small" @click="handleDelete(row)">
                            删除
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

    <!-- 通知详情对话框 -->
    <el-dialog v-model="detailDialogShow" width="800" title="详情" destroy-on-close>
        <div class="detail-content">
            <el-descriptions :column="1" border>
                <el-descriptions-item label="通知标题">{{ detailData.title }}</el-descriptions-item>
                <el-descriptions-item label="发送时间">{{ detailData.sendTime }}</el-descriptions-item>
                <el-descriptions-item label="通知类型">{{ detailData.notificationType }}</el-descriptions-item>
                <el-descriptions-item label="通知内容">{{ detailData.content }}</el-descriptions-item>
                <el-descriptions-item label="发件人">{{ detailData.sender }}</el-descriptions-item>
            </el-descriptions>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="detailDialogShow = false">关闭</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { cardPad } from '@/config/cardConfig'
import { pageNationConfig } from '@/config/pageConfig'
import { tableConfig } from '@/config/tableConfig'

// 消息数据类型定义
interface MessageItem {
    id: number
    title: string
    status: string
    notificationType: string
    content: string
    sender: string
    sendTime: string
}

/**
 * 响应式数据
 */
const loading = ref(false)
const tableData = ref<MessageItem[]>([])
const totalNum = ref(0)
const currentPage = ref(1)
const pageSize = ref(pageNationConfig.pageSize)

// 查询参数
const queryParams = reactive({
    status: '',
    notificationType: '',
    sendTime: null
})

// 详情对话框
const detailDialogShow = ref(false)
const detailData = ref<MessageItem>({
    id: 0,
    title: '',
    status: '',
    notificationType: '',
    content: '',
    sender: '',
    sendTime: ''
})

/**
 * 查询数据
 */
const handleQuery = () => {
    console.log('查询消息列表', queryParams)
    // 这里调用API获取数据
    getMockData()
}

/**
 * 重置查询
 */
const handleReset = () => {
    Object.assign(queryParams, {
        status: '',
        notificationType: '',
        sendTime: null
    })
    handleQuery()
}

/**
 * 分页处理
 */
const handleSizeChange = (val: number) => {
    pageSize.value = val
    handleQuery()
}

const handleCurrentChange = (val: number) => {
    currentPage.value = val
    handleQuery()
}

/**
 * 查看详情
 */
const handleDetail = (row: any) => {
    detailData.value = { ...row }
    detailDialogShow.value = true

    // 如果是未读消息，标记为已读
    if (row.status === '未读') {
        row.status = '已读'
        // 这里可以调用API更新状态
    }
}

/**
 * 删除消息
 */
const handleDelete = (row: any) => {
    ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        console.log('删除消息', row.id)
        // 这里调用API删除
        ElMessage.success('删除成功')
        handleQuery()
    }).catch(() => {
        // 取消删除
    })
}

/**
 * 全部已读
 */
const markAllAsRead = () => {
    ElMessageBox.confirm('确定要将所有消息标记为已读吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
    }).then(() => {
        // 这里调用API标记全部已读
        tableData.value.forEach((item: any) => {
            item.status = '已读'
        })
        ElMessage.success('已全部标记为已读')
    }).catch(() => {
        // 取消操作
    })
}

/**
 * 获取模拟数据
 */
const getMockData = () => {
    loading.value = true
    setTimeout(() => {
        tableData.value = [
            {
                id: 1,
                title: '周建豪剩余课程不足',
                status: '已读',
                notificationType: '剩余课程不足提醒',
                content: '课程不足，请提醒学员续课',
                sender: '系统通知',
                sendTime: '2025-10-10 10:10:10'
            },
            {
                id: 2,
                title: '周建豪剩余课程不足',
                status: '未读',
                notificationType: '剩余课程不足提醒',
                content: '课程不足，请提醒学员续课',
                sender: '系统通知',
                sendTime: '2025-10-10 10:10:10'
            },
            {
                id: 3,
                title: '周建豪剩余课程不足',
                status: '未读',
                notificationType: '剩余课程不足提醒',
                content: '课程不足，请提醒学员续课',
                sender: '系统通知',
                sendTime: '2025-10-10 10:10:10'
            }
        ]
        totalNum.value = 50
        loading.value = false
    }, 1000)
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

.action-card {
    margin-bottom: 20px;
}

.table-container {
    margin-bottom: 20px;
}

.pagination-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    border-radius: 6px;
}

.detail-content {
    padding: 20px 0;
}

.dialog-footer {
    text-align: center;
}
</style>
