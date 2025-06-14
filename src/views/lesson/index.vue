<template>
    <div class="content">
        <!-- 搜索区域 -->
        <el-card :body-style="cardPad" class="search-card">
            <el-row>
                <div class="keyword">课程类型</div>
                <el-col :span="4">
                    <el-select v-model="queryParams.courseType" style="width: 95%" placeholder="请选择课程类型" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="雅思" value="雅思" />
                        <el-option label="商务英语" value="商务英语" />
                    </el-select>
                </el-col>
                <div class="keyword">授课老师</div>
                <el-col :span="4">
                    <el-input v-model="queryParams.teacher" style="width: 95%" placeholder="请输入授课老师" clearable />
                </el-col>
                <div class="keyword">状态</div>
                <el-col :span="4">
                    <el-select v-model="queryParams.status" style="width: 95%" placeholder="请选择状态" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="待审核" value="待审核" />
                        <el-option label="已驳回" value="已驳回" />
                        <el-option label="已取消" value="已取消" />
                        <el-option label="已通过" value="已通过" />
                    </el-select>
                </el-col>
            </el-row>
            <el-row>
                <div class="keyword">创建时间</div>
                <el-col :span="8">
                    <el-date-picker v-model="queryParams.createTime" style="width: 97.5%" type="daterange"
                        range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD" />
                </el-col>
            </el-row>
            <el-row class="search-buttons">
                <el-col :span="24">
                    <div class="button-container">
                        <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
                        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 操作区域 -->
        <el-card :body-style="cardPad" class="action-card">
            <el-row>
                <el-col :span="24">
                    <el-button type="primary" :icon="Plus" @click="handleAdd">新建课程</el-button>
                </el-col>
            </el-row>
        </el-card>

        <!-- 表格区域 -->
        <div class="table-container">
            <el-table :data="tableData" v-bind="{ ...tableConfig }" v-loading="loading">
                <el-table-column prop="id" label="课程ID" width="150" />
                <el-table-column prop="courseName" label="课程名称" />
                <el-table-column prop="courseType" label="课程类型" width="120" />
                <el-table-column prop="teacher" label="授课老师" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="classroom" label="教室地点" width="120" />
                <el-table-column prop="classTime" label="上课时间" width="200" />
                <el-table-column prop="creator" label="创建人" />
                <el-table-column prop="createTime" label="创建时间" width="180" />
                <el-table-column fixed="right" label="操作" width="200" align="center">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleDetail(row)">
                            详情
                        </el-button>
                        <el-button v-if="row.status === '待审核'" link type="warning" size="small"
                            @click="handleWithdraw(row)">
                            撤回
                        </el-button>
                        <el-button v-if="row.status === '已驳回'" link type="success" size="small"
                            @click="handleResubmit(row)">
                            重新提交
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

    <!-- 新建/编辑课程对话框 -->
    <el-dialog v-model="dialogShow" width="800" :title="title" destroy-on-close>
        <el-form :model="lessonForm" :rules="formRules" ref="lessonFormRef" v-bind="{ ...formConfig }">
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="课程名称" prop="courseName" v-bind="{ ...formItemConfig }">
                        <el-input v-model="lessonForm.courseName" placeholder="请输入课程名称" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="课程类型" prop="courseType" v-bind="{ ...formItemConfig }">
                        <el-select v-model="lessonForm.courseType" placeholder="请选择课程类型">
                            <el-option label="雅思" value="雅思" />
                            <el-option label="商务英语" value="商务英语" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="授课老师" prop="teacher" v-bind="{ ...formItemConfig }">
                        <el-input v-model="lessonForm.teacher" placeholder="请输入授课老师" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="教室地点" prop="classroom" v-bind="{ ...formItemConfig }">
                        <el-input v-model="lessonForm.classroom" placeholder="请输入教室地点" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-form-item label="上课时间" prop="classTime" v-bind="{ ...formItemConfig }">
                <el-date-picker v-model="lessonForm.classTime" type="datetimerange" range-separator="至"
                    start-placeholder="开始时间" end-placeholder="结束时间" format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm" style="width: 100%" />
            </el-form-item>

            <el-form-item label="课程大纲" prop="syllabus" v-bind="{ ...formItemConfig }">
                <el-upload v-model:file-list="lessonForm.syllabusFiles" :before-upload="beforeUpload"
                    :on-remove="handleRemove" list-type="picture" :limit="1">
                    <el-button type="primary">
                        <el-icon>
                            <Upload />
                        </el-icon>
                        上传课程大纲
                    </el-button>
                    <template #tip>
                        <div class="el-upload__tip">
                            只能上传jpg/png文件，且不超过2MB
                        </div>
                    </template>
                </el-upload>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="cancelHandler">取消</el-button>
                <el-button type="primary" @click="confirmHandler">确认</el-button>
            </div>
        </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogShow" width="1000" title="课程详情" destroy-on-close>
        <div class="detail-content">
            <!-- 基础信息 -->
            <div class="detail-section">
                <h3 class="section-title">基础信息</h3>
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="课程ID">{{ detailData.id }}</el-descriptions-item>
                    <el-descriptions-item label="课程名称">{{ detailData.courseName }}</el-descriptions-item>
                    <el-descriptions-item label="课程类型">{{ detailData.courseType }}</el-descriptions-item>
                    <el-descriptions-item label="授课老师">{{ detailData.teacher }}</el-descriptions-item>
                    <el-descriptions-item label="状态">
                        <el-tag :type="getStatusType(detailData.status)">
                            {{ detailData.status }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="教室地点">{{ detailData.classroom }}</el-descriptions-item>
                    <el-descriptions-item label="上课时间">{{ detailData.classTime }}</el-descriptions-item>
                    <el-descriptions-item label="创建人">{{ detailData.creator }}</el-descriptions-item>
                    <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
                    <el-descriptions-item v-if="detailData.rejectReason" label="驳回原因" :span="2">
                        {{ detailData.rejectReason }}
                    </el-descriptions-item>
                </el-descriptions>

                <!-- 课程大纲 -->
                <div class="syllabus-section" style="margin-top: 20px;">
                    <h4>课程大纲：</h4>
                    <div class="syllabus-preview">
                        <el-image v-if="detailData.syllabusUrl" :src="detailData.syllabusUrl" alt="课程大纲"
                            style="width: 200px; height: 150px" fit="cover" :preview-src-list="[detailData.syllabusUrl]"
                            preview-teleported />
                        <span v-else>暂无课程大纲</span>
                    </div>
                </div>
            </div>

            <!-- 操作记录 -->
            <div class="detail-section" style="margin-top: 30px;">
                <h3 class="section-title">操作记录</h3>
                <el-table :data="operationRecords" size="small">
                    <el-table-column prop="index" label="序号" width="80" />
                    <el-table-column prop="operator" label="操作人" width="120" />
                    <el-table-column prop="action" label="动作" width="120">
                        <template #default="{ row }">
                            <el-tag size="small">{{ row.action }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="rejectReason" label="驳回原因" show-overflow-tooltip />
                    <el-table-column prop="operationTime" label="操作时间" width="180" />
                </el-table>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Upload } from '@element-plus/icons-vue'
import { tableConfig } from '@/config/tableConfig'
import { formConfig, formItemConfig } from '@/config/formConfig'
import { pageNationConfig } from '@/config/pageConfig'
import { cardPad } from '@/config/cardConfig'

/**
 * 组件名称
 */
defineOptions({
    name: 'LessonIndex'
})

// 响应式数据
const loading = ref(false)
const dialogShow = ref(false)
const detailDialogShow = ref(false)
const title = ref('')

// 查询参数
const queryParams = reactive({
    courseType: '',
    teacher: '',
    status: '',
    createTime: [] as string[]
})

// 表单引用和数据
const lessonFormRef = ref()
const lessonForm = reactive({
    id: '',
    courseName: '',
    courseType: '',
    teacher: '',
    classroom: '',
    classTime: [] as string[],
    syllabusFiles: [] as any[]
})

// 表单验证规则
const formRules = {
    courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
    courseType: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
    teacher: [{ required: true, message: '请输入授课老师', trigger: 'blur' }],
    classroom: [{ required: true, message: '请输入教室地点', trigger: 'blur' }],
    classTime: [{ required: true, message: '请选择上课时间', trigger: 'change' }]
}

// 详情数据
const detailData = ref<any>({})

// 表格数据
const tableData = ref([
    {
        id: '87262690176',
        courseName: '雅思基础课程',
        courseType: '雅思',
        teacher: '张兰',
        status: '待审核',
        classroom: '302室',
        classTime: '2025-06-15 14:00 ~ 2025-06-15 15:30',
        creator: '张兰（教师）',
        createTime: '2025-10-10 10:10:10'
    },
    {
        id: '87262690177',
        courseName: '商务英语进阶',
        courseType: '商务英语',
        teacher: '李明',
        status: '已驳回',
        classroom: '303室',
        classTime: '2025-06-16 14:00 ~ 2025-06-16 15:30',
        creator: '李明（教师）',
        createTime: '2025-10-10 11:10:10'
    },
    {
        id: '87262690178',
        courseName: '雅思口语专项',
        courseType: '雅思',
        teacher: '王芳',
        status: '已通过',
        classroom: '304室',
        classTime: '2025-06-17 14:00 ~ 2025-06-17 15:30',
        creator: '王芳（教师）',
        createTime: '2025-10-10 12:10:10'
    },
    {
        id: '87262690179',
        courseName: '商务英语写作',
        courseType: '商务英语',
        teacher: '赵强',
        status: '已取消',
        classroom: '305室',
        classTime: '2025-06-18 14:00 ~ 2025-06-18 15:30',
        creator: '赵强（教师）',
        createTime: '2025-10-10 13:10:10'
    }
])

// 操作记录数据
const operationRecords = ref([
    {
        index: 1,
        operator: '张三',
        action: '创建课程',
        rejectReason: '',
        operationTime: '2019-11-30 15:21:10'
    },
    {
        index: 2,
        operator: '李四',
        action: '审核驳回',
        rejectReason: '课程大纲不够详细，请补充具体的教学内容和目标',
        operationTime: '2019-11-30 15:20:09'
    },
    {
        index: 3,
        operator: '张三',
        action: '重新提交',
        rejectReason: '',
        operationTime: '2019-11-30 11:20:09'
    },
    {
        index: 4,
        operator: '李四',
        action: '审核通过',
        rejectReason: '',
        operationTime: '2019-11-30 10:20:09'
    }
])

// 分页数据
const totalNum = ref(100)
const currentPage = ref(1)
const pageSize = ref(pageNationConfig.pageSize)

/**
 * 获取状态类型
 */
const getStatusType = (status: string) => {
    const typeMap: Record<string, string> = {
        '待审核': 'warning',
        '已驳回': 'danger',
        '已取消': 'info',
        '已通过': 'success'
    }
    return typeMap[status] || 'info'
}

/**
 * 查询
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
 * 重置
 */
const handleReset = () => {
    Object.assign(queryParams, {
        courseType: '',
        teacher: '',
        status: '',
        createTime: []
    })
    handleQuery()
}

/**
 * 新建
 */
const handleAdd = () => {
    title.value = '新建课程'
    resetForm()
    dialogShow.value = true
}

/**
 * 详情
 */
const handleDetail = (row: any) => {
    detailData.value = {
        ...row,
        rejectReason: row.status === '已驳回' ? '课程大纲不够详细，请补充具体的教学内容和目标' : '',
        syllabusUrl: 'https://via.placeholder.com/400x300/409EFF/fff?text=课程大纲' // 示例图片
    }
    detailDialogShow.value = true
}

/**
 * 撤回
 */
const handleWithdraw = async (row: any) => {
    try {
        await ElMessageBox.confirm(`确定要撤回课程"${row.courseName}"吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        ElMessage.success(`课程"${row.courseName}"已撤回`)
        handleQuery()
    } catch {
        // 用户取消操作
    }
}

/**
 * 重新提交
 */
const handleResubmit = async (row: any) => {
    try {
        await ElMessageBox.confirm(`确定要重新提交课程"${row.courseName}"吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
        })
        ElMessage.success(`课程"${row.courseName}"已重新提交`)
        handleQuery()
    } catch {
        // 用户取消操作
    }
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

/**
 * 重置表单
 */
const resetForm = () => {
    Object.assign(lessonForm, {
        id: '',
        courseName: '',
        courseType: '',
        teacher: '',
        classroom: '',
        classTime: [],
        syllabusFiles: []
    })
}

/**
 * 取消操作
 */
const cancelHandler = () => {
    lessonFormRef.value?.resetFields()
    dialogShow.value = false
}

/**
 * 确认操作
 */
const confirmHandler = async () => {
    try {
        await lessonFormRef.value.validate()
        loading.value = true

        // 模拟API调用
        setTimeout(() => {
            loading.value = false
            dialogShow.value = false
            ElMessage.success(title.value === '新建课程' ? '创建成功' : '修改成功')
            handleQuery()
        }, 1000)
    } catch (error) {
        console.error('表单验证失败:', error)
    }
}

/**
 * 上传前处理
 */
const beforeUpload = (file: any) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
        ElMessage.error('图片必须小于 2MB!')
        return false
    }
    return true
}

/**
 * 移除文件
 */
const handleRemove = (file: any) => {
    const index = lessonForm.syllabusFiles.findIndex(item => item.uid === file.uid)
    if (index > -1) {
        lessonForm.syllabusFiles.splice(index, 1)
    }
}

// 组件挂载时加载数据
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

        .keyword {
            font-weight: bold;
            font-size: 15px;
            color: #909399;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 10px;
        }

        // 按钮容器样式
        .button-container {
            display: flex;
            justify-content: flex-end; // 按钮靠右对齐
            margin-top: 15px;

            .el-button {
                margin-left: 10px; // 按钮之间的间距

                &:first-child {
                    margin-left: 0; // 第一个按钮不需要左边距
                }
            }
        }

        // 为搜索栏中的每个元素添加间距
        :deep(.el-row) {
            margin-bottom: 15px;

            &:last-child {
                margin-bottom: 0;
            }
        }
    }
}

// 详情内容样式
.detail-content {
    .detail-section {
        .section-title {
            margin-bottom: 16px;
            font-size: 16px;
            font-weight: 600;
            color: #262626;
            border-bottom: 1px solid #e8e8e8;
            padding-bottom: 8px;
        }

        .syllabus-section {
            h4 {
                margin-bottom: 12px;
                font-size: 14px;
                font-weight: 600;
            }

            .syllabus-preview {
                display: flex;
                align-items: center;
                gap: 12px;
            }
        }
    }
}

// 对话框样式调整
:deep(.el-dialog__body) {
    padding: 20px;
}

:deep(.el-descriptions__label) {
    font-weight: 600;
    background: #fafafa;
}
</style>
