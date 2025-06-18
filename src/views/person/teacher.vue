<template>
    <div class="content">
        <!-- 搜索区域 -->
        <el-card class="search-card" :body-style="cardPad">
            <el-form :model="queryParams" :inline="true" label-width="100px">
                <el-form-item label="教师姓名">
                    <el-input v-model="queryParams.teacherName" style="width: 200px" placeholder="请输入教师姓名" clearable />
                </el-form-item>
                <el-form-item label="任教科目">
                    <el-select v-model="queryParams.subject" style="width: 200px" placeholder="请选择任教科目" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="雅思" value="雅思" />
                        <el-option label="商务英语" value="商务英语" />
                    </el-select>
                </el-form-item>
                <el-form-item label="所属校区">
                    <el-select v-model="queryParams.campus" style="width: 200px" placeholder="请选择所属校区" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="北京校区" value="北京校区" />
                        <el-option label="上海校区" value="上海校区" />
                        <el-option label="广州校区" value="广州校区" />
                        <el-option label="深圳校区" value="深圳校区" />
                    </el-select>
                </el-form-item>
                <el-form-item label="联系电话">
                    <el-input v-model="queryParams.phone" style="width: 200px" placeholder="请输入联系电话" clearable />
                </el-form-item>
                <el-form-item label="创建时间">
                    <el-date-picker v-model="queryParams.createTime" style="width: 300px" type="daterange"
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
                <el-col :span="24">
                    <el-button type="primary" :icon="Plus" @click="handleAdd">新建教师</el-button>
                    <el-button :icon="Upload" @click="handleImport">批量导入</el-button>
                    <el-button :icon="Download" @click="handleExport">导出</el-button>
                </el-col>
            </el-row>
        </el-card>

        <!-- 表格区域 -->
        <div class="table-container">
            <el-table :data="tableData" v-bind="{ ...tableConfig }" v-loading="loading">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="teacherId" label="教师ID" />
                <el-table-column prop="teacherName" label="教师姓名" />
                <el-table-column prop="nickname" label="教师昵称" />
                <el-table-column prop="idCard" label="身份证号" />
                <el-table-column prop="certificateNo" label="教师资格证编号" />
                <el-table-column prop="phone" label="联系电话" />
                <el-table-column prop="subject" label="任教科目" />
                <el-table-column prop="campus" label="所属校区" />
                <el-table-column prop="entryTime" label="入职时间" />
                <el-table-column prop="creator" label="创建人" />
                <el-table-column prop="createTime" label="创建时间" />
                <el-table-column fixed="right" label="操作" width="200" align="center">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleDetail(row)">
                            详情
                        </el-button>
                        <el-button link type="success" size="small" @click="handleEdit(row)">
                            编辑
                        </el-button>
                        <el-button link type="info" size="small" @click="handleEvaluation(row)">
                            查看评价
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

    <!-- 新建/编辑教师对话框 -->
    <el-dialog v-model="dialogShow" width="800" :title="title" destroy-on-close>
        <el-form :model="teacherForm" :rules="formRules" ref="teacherFormRef" v-bind="{ ...formConfig }">
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="教师姓名" prop="teacherName" v-bind="{ ...formItemConfig }">
                        <el-input v-model="teacherForm.teacherName" placeholder="请输入教师姓名" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="教师昵称" prop="nickname" v-bind="{ ...formItemConfig }">
                        <el-input v-model="teacherForm.nickname" placeholder="请输入教师昵称" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="身份证号" prop="idCard" v-bind="{ ...formItemConfig }">
                        <el-input v-model="teacherForm.idCard" placeholder="请输入身份证号" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="联系电话" prop="phone" v-bind="{ ...formItemConfig }">
                        <el-input v-model="teacherForm.phone" placeholder="请输入联系电话" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="任教科目" prop="subject" v-bind="{ ...formItemConfig }">
                        <el-select v-model="teacherForm.subject" placeholder="请选择任教科目">
                            <el-option label="雅思" value="雅思" />
                            <el-option label="商务英语" value="商务英语" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="所属校区" prop="campus" v-bind="{ ...formItemConfig }">
                        <el-select v-model="teacherForm.campus" placeholder="请选择所属校区">
                            <el-option label="北京校区" value="北京校区" />
                            <el-option label="上海校区" value="上海校区" />
                            <el-option label="广州校区" value="广州校区" />
                            <el-option label="深圳校区" value="深圳校区" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="入职时间" prop="entryTime" v-bind="{ ...formItemConfig }">
                        <el-date-picker v-model="teacherForm.entryTime" type="date" placeholder="请选择入职时间"
                            format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="资质证书" prop="certificates" v-bind="{ ...formItemConfig }">
                <el-upload v-model:file-list="teacherForm.certificateFiles" :before-upload="beforeUpload"
                    :on-remove="handleRemove" list-type="picture" :limit="3">
                    <el-button type="primary">
                        <el-icon>
                            <Upload />
                        </el-icon>
                        上传资质证书
                    </el-button>
                    <template #tip>
                        <div class="el-upload__tip">
                            只能上传jpg/png文件，且不超过2MB，最多3张
                        </div>
                    </template>
                </el-upload>
            </el-form-item>
            <el-form-item label="证书编号" prop="certificateNo" v-bind="{ ...formItemConfig }">
                <el-input v-model="teacherForm.certificateNo" placeholder="请输入教师资格证编号" />
            </el-form-item>
            <el-form-item label="个人简介" prop="description" v-bind="{ ...formItemConfig }">
                <el-input v-model="teacherForm.description" type="textarea" :rows="4" placeholder="请输入个人简介" />
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
    <el-dialog v-model="detailDialogShow" width="1000" title="教师详情" destroy-on-close>
        <div class="detail-content">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="教师ID">{{ detailData.teacherId }}</el-descriptions-item>
                <el-descriptions-item label="教师姓名">{{ detailData.teacherName }}</el-descriptions-item>
                <el-descriptions-item label="教师昵称">{{ detailData.nickname }}</el-descriptions-item>
                <el-descriptions-item label="身份证号">{{ detailData.idCard }}</el-descriptions-item>
                <el-descriptions-item label="教师资格证编号">{{ detailData.certificateNo }}</el-descriptions-item>
                <el-descriptions-item label="联系电话">{{ detailData.phone }}</el-descriptions-item>
                <el-descriptions-item label="任教科目">{{ detailData.subject }}</el-descriptions-item>
                <el-descriptions-item label="所属校区">{{ detailData.campus }}</el-descriptions-item>
                <el-descriptions-item label="入职时间">{{ detailData.entryTime }}</el-descriptions-item>
                <el-descriptions-item label="创建人">{{ detailData.creator }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
                <el-descriptions-item label="个人简介" :span="2">{{ detailData.description }}</el-descriptions-item>
            </el-descriptions>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Upload, Download } from '@element-plus/icons-vue'
import { tableConfig } from '@/config/tableConfig'
import { formConfig, formItemConfig } from '@/config/formConfig'
import { pageNationConfig } from '@/config/pageConfig'
import { cardPad } from '@/config/cardConfig'

/**
 * 组件名称
 */
defineOptions({
    name: 'TeacherIndex'
})

// 响应式数据
const loading = ref(false)
const dialogShow = ref(false)
const detailDialogShow = ref(false)
const title = ref('')

// 查询参数
const queryParams = reactive({
    teacherName: '',
    subject: '',
    campus: '',
    phone: '',
    createTime: [] as string[]
})

// 表单引用和数据
const teacherFormRef = ref()
const teacherForm = reactive({
    id: '',
    teacherName: '',
    nickname: '',
    idCard: '',
    phone: '',
    certificateNo: '',
    subject: '',
    campus: '',
    entryTime: '',
    description: '',
    certificateFiles: [] as any[]
})

// 表单验证规则
const formRules = {
    teacherName: [{ required: true, message: '请输入教师姓名', trigger: 'blur' }],
    nickname: [{ required: true, message: '请输入教师昵称', trigger: 'blur' }],
    idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
    certificateNo: [{ required: true, message: '请输入教师资格证编号', trigger: 'blur' }],
    subject: [{ required: true, message: '请选择任教科目', trigger: 'change' }],
    campus: [{ required: true, message: '请选择所属校区', trigger: 'change' }],
    entryTime: [{ required: true, message: '请选择入职时间', trigger: 'change' }]
}

// 详情数据
const detailData = ref<any>({})

// 表格数据
const tableData = ref([
    {
        teacherId: '87262690176',
        teacherName: '蔡国宇',
        nickname: '菜鸟',
        idCard: '320122199802023827',
        certificateNo: 'JSCZ+年份+7位数字',
        phone: '15267352220',
        subject: '雅思/商务英语',
        campus: '北京校区',
        entryTime: '2025-10-10',
        creator: '邵静',
        createTime: '2025-10-10 10:10:10',
        description: '资深英语教师，拥有丰富的教学经验'
    },
    {
        teacherId: '87262690177',
        teacherName: '张兰',
        nickname: '兰老师',
        idCard: '320122199801023828',
        certificateNo: 'JSCZ20257654321',
        phone: '15267352221',
        subject: '雅思',
        campus: '上海校区',
        entryTime: '2025-09-15',
        creator: '邵静',
        createTime: '2025-09-15 14:20:30',
        description: '雅思教学专家，擅长口语和写作指导'
    },
    {
        teacherId: '87262690178',
        teacherName: '李明',
        nickname: '明哥',
        idCard: '320122199803023829',
        certificateNo: 'JSCZ20251234567',
        phone: '15267352222',
        subject: '商务英语',
        campus: '广州校区',
        entryTime: '2025-08-20',
        creator: '邵静',
        createTime: '2025-08-20 16:45:12',
        description: '商务英语资深讲师，具有海外工作经验'
    }
])

// 分页数据
const totalNum = ref(100)
const currentPage = ref(1)
const pageSize = ref(pageNationConfig.pageSize)

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
        teacherName: '',
        subject: '',
        campus: '',
        phone: '',
        createTime: []
    })
    handleQuery()
}

/**
 * 新建
 */
const handleAdd = () => {
    title.value = '新建教师'
    resetForm()
    dialogShow.value = true
}

/**
 * 编辑
 */
const handleEdit = (row: any) => {
    title.value = '编辑教师'
    Object.assign(teacherForm, {
        ...row,
        certificateFiles: []
    })
    dialogShow.value = true
}

/**
 * 详情
 */
const handleDetail = (row: any) => {
    detailData.value = { ...row }
    detailDialogShow.value = true
}

/**
 * 查看评价
 */
const handleEvaluation = (row: any) => {
    ElMessage.info(`查看教师"${row.teacherName}"的评价`)
}

/**
 * 删除
 */
const handleDelete = async (row: any) => {
    try {
        await ElMessageBox.confirm(`确定要删除教师"${row.teacherName}"吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        ElMessage.success(`教师"${row.teacherName}"已删除`)
        handleQuery()
    } catch {
        // 用户取消操作
    }
}

/**
 * 批量导入
 */
const handleImport = () => {
    ElMessage.info('批量导入功能')
}

/**
 * 导出
 */
const handleExport = () => {
    ElMessage.info('导出功能')
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
    Object.assign(teacherForm, {
        id: '',
        teacherName: '',
        nickname: '',
        idCard: '',
        phone: '',
        certificateNo: '',
        subject: '',
        campus: '',
        entryTime: '',
        description: '',
        certificateFiles: []
    })
}

/**
 * 取消操作
 */
const cancelHandler = () => {
    teacherFormRef.value?.resetFields()
    dialogShow.value = false
}

/**
 * 确认操作
 */
const confirmHandler = async () => {
    try {
        await teacherFormRef.value.validate()
        loading.value = true

        // 模拟API调用
        setTimeout(() => {
            loading.value = false
            dialogShow.value = false
            ElMessage.success(title.value === '新建教师' ? '创建成功' : '修改成功')
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
    const index = teacherForm.certificateFiles.findIndex(item => item.uid === file.uid)
    if (index > -1) {
        teacherForm.certificateFiles.splice(index, 1)
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

    .search-card {
        margin-bottom: 20px;
    }

    .action-card {
        margin-bottom: 20px;
    }
}

.detail-content {
    padding: 20px 0;
}

:deep(.el-descriptions__label) {
    font-weight: 600;
    background: #fafafa;
}

// 分页容器样式
.pagination-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    border-radius: 6px;
}
</style>