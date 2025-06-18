<template>
    <div class="content">
        <!-- 搜索区域 -->
        <el-card class="search-card" :body-style="cardPad">
            <el-form :model="queryParams" :inline="true" label-width="100px">
                <el-form-item label="学员姓名">
                    <el-input v-model="queryParams.studentName" style="width: 200px" placeholder="请输入学员姓名" clearable />
                </el-form-item>
                <el-form-item label="联系电话">
                    <el-input v-model="queryParams.phone" style="width: 200px" placeholder="请输入联系电话" clearable />
                </el-form-item>
                <el-form-item label="合同状态">
                    <el-select v-model="queryParams.status" style="width: 200px" placeholder="请选择合同状态" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="有效" value="有效" />
                        <el-option label="即将到期" value="即将到期" />
                        <el-option label="已过期" value="已过期" />
                    </el-select>
                </el-form-item>
                <el-form-item label="合同有效期">
                    <el-date-picker v-model="queryParams.validityPeriod" style="width: 300px" type="daterange"
                        range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD" clearable />
                </el-form-item>
                <el-form-item label="负责人">
                    <el-input v-model="queryParams.responsible" style="width: 200px" placeholder="请输入负责人" clearable />
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
                    <div class="button-container">
                        <el-button type="primary" :icon="Plus" @click="handleAdd">新建</el-button>
                        <el-button :icon="Download" @click="handleBatchDownload">批量下载</el-button>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 表格区域 -->
        <div class="table-container">
            <el-table :data="tableData" v-bind="{ ...tableConfig }" v-loading="loading">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="contractNumber" label="合同编号" />
                <el-table-column prop="studentName" label="学员姓名" />
                <el-table-column prop="phone" label="联系电话" />
                <el-table-column prop="status" label="合同状态">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="remainingHours" label="剩余课时" />
                <el-table-column prop="signDate" label="签约日期" />
                <el-table-column prop="validityPeriod" label="合同有效期" />
                <el-table-column prop="responsible" label="负责人" />
                <el-table-column prop="createTime" label="创建时间" />
                <el-table-column label="操作" fixed="right" width="200">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleDetail(row)">详情</el-button>
                        <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                        <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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

    <!-- 新建/编辑合同弹窗 -->
    <el-dialog v-model="contractDialogShow" :width="800" :title="isEdit ? '编辑合同' : '新建合同'" destroy-on-close>
        <el-form :model="contractForm" :rules="contractFormRules" ref="contractFormRef" label-width="120px">
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="学员姓名" prop="studentName">
                        <el-input v-model="contractForm.studentName" placeholder="请输入学员姓名" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="联系电话" prop="phone">
                        <el-input v-model="contractForm.phone" placeholder="请输入联系电话" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="总课时（节）" prop="totalHours">
                        <el-input-number v-model="contractForm.totalHours" :min="1" controls-position="right"
                            placeholder="请输入总课时" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="剩余课时（节）" prop="remainingHours">
                        <el-input-number v-model="contractForm.remainingHours" :min="0" controls-position="right"
                            placeholder="请输入剩余课时" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="签约日期" prop="signDate">
                        <el-date-picker v-model="contractForm.signDate" type="date" placeholder="选择签约日期"
                            format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="合同有效期" prop="validityPeriod">
                        <el-date-picker v-model="contractForm.validityPeriod" type="daterange" range-separator="~"
                            start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="负责人" prop="responsible">
                        <el-input v-model="contractForm.responsible" placeholder="请输入负责人" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="合同上传" prop="contractFile">
                        <el-upload class="upload-demo" drag action="#" :auto-upload="false" accept=".pdf,.doc,.docx">
                            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                            <div class="el-upload__text">
                                将文件拖到此处，或<em>点击上传</em>
                            </div>
                        </el-upload>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="补充说明" prop="description">
                <el-input v-model="contractForm.description" type="textarea" :rows="3" placeholder="请输入补充说明" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="contractDialogShow = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">保存</el-button>
            </div>
        </template>
    </el-dialog>

    <!-- 合同详情弹窗 -->
    <el-dialog v-model="detailDialogShow" width="800" title="合同详情" destroy-on-close>
        <div class="detail-content">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="合同编号">{{ detailData.contractNumber }}</el-descriptions-item>
                <el-descriptions-item label="学员姓名">{{ detailData.studentName }}</el-descriptions-item>
                <el-descriptions-item label="联系电话">{{ detailData.phone }}</el-descriptions-item>
                <el-descriptions-item label="合同状态">
                    <el-tag :type="getStatusType(detailData.status)">{{ detailData.status }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="总课时">{{ detailData.totalHours }}节</el-descriptions-item>
                <el-descriptions-item label="剩余课时">{{ detailData.remainingHours }}节</el-descriptions-item>
                <el-descriptions-item label="签约日期">{{ detailData.signDate }}</el-descriptions-item>
                <el-descriptions-item label="合同有效期">{{ detailData.validityPeriod }}</el-descriptions-item>
                <el-descriptions-item label="负责人">{{ detailData.responsible }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
                <el-descriptions-item label="补充说明" :span="2">
                    <div class="content-text">{{ detailData.description }}</div>
                </el-descriptions-item>
            </el-descriptions>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download, UploadFilled } from '@element-plus/icons-vue'
import { tableConfig } from '@/config/tableConfig'
import { pageNationConfig } from '@/config/pageConfig'
import { cardPad } from '@/config/cardConfig'
import { formConfig, formItemConfig } from '@/config/formConfig'

// 响应式数据
const loading = ref(false)
const contractDialogShow = ref(false)
const detailDialogShow = ref(false)
const isEdit = ref(false)
const contractFormRef = ref()

// 查询参数
const queryParams = reactive({
    studentName: '',
    phone: '',
    status: '',
    validityPeriod: [],
    responsible: ''
})

// 表格数据
const tableData = ref([
    {
        contractNumber: '87262690176',
        studentName: '周建豪',
        phone: '15267352220',
        status: '即将到期',
        totalHours: 20,
        remainingHours: 10,
        signDate: '2025-10-10',
        validityPeriod: '2025-06-15 ~ 2025-12-15',
        responsible: '邵静',
        createTime: '2025-10-10 10:10:10',
        description: '这是一个测试合同'
    },
    {
        contractNumber: '87262690177',
        studentName: '李小明',
        phone: '15267352221',
        status: '有效',
        totalHours: 30,
        remainingHours: 25,
        signDate: '2025-09-15',
        validityPeriod: '2025-09-15 ~ 2026-03-15',
        responsible: '王老师',
        createTime: '2025-09-15 14:30:20',
        description: '标准课程合同'
    },
    {
        contractNumber: '87262690178',
        studentName: '张小红',
        phone: '15267352222',
        status: '已过期',
        totalHours: 15,
        remainingHours: 0,
        signDate: '2024-10-10',
        validityPeriod: '2024-10-10 ~ 2025-04-10',
        responsible: '李老师',
        createTime: '2024-10-10 09:20:30',
        description: '短期课程合同'
    }
])

// 分页数据
const totalNum = ref(100)
const currentPage = ref(1)
const pageSize = ref(pageNationConfig.pageSize)

// 合同表单数据
const contractForm = reactive({
    studentName: '',
    phone: '',
    totalHours: null,
    remainingHours: null,
    signDate: '',
    validityPeriod: [],
    responsible: '',
    contractFile: null,
    description: ''
})

// 表单验证规则
const contractFormRules = {
    studentName: [{ required: true, message: '请输入学员姓名', trigger: 'blur' }],
    phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    totalHours: [{ required: true, message: '请输入总课时', trigger: 'blur' }],
    remainingHours: [{ required: true, message: '请输入剩余课时', trigger: 'blur' }],
    signDate: [{ required: true, message: '请选择签约日期', trigger: 'change' }],
    validityPeriod: [{ required: true, message: '请选择合同有效期', trigger: 'change' }],
    responsible: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
}

// 详情数据
const detailData = ref<any>({})

/**
 * 获取状态类型
 */
const getStatusType = (status: string) => {
    switch (status) {
        case '有效':
            return 'success'
        case '即将到期':
            return 'warning'
        case '已过期':
            return 'danger'
        default:
            return 'info'
    }
}

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
    queryParams.phone = ''
    queryParams.status = ''
    queryParams.validityPeriod = []
    queryParams.responsible = ''
    handleQuery()
}

/**
 * 新建合同
 */
const handleAdd = () => {
    isEdit.value = false
    resetContractForm()
    contractDialogShow.value = true
}

/**
 * 编辑合同
 */
const handleEdit = (row: any) => {
    isEdit.value = true
    Object.assign(contractForm, {
        ...row,
        validityPeriod: row.validityPeriod.split(' ~ ')
    })
    contractDialogShow.value = true
}

/**
 * 查看详情
 */
const handleDetail = (row: any) => {
    detailData.value = { ...row }
    detailDialogShow.value = true
}

/**
 * 删除合同
 */
const handleDelete = (row: any) => {
    ElMessageBox.confirm('确定要删除该合同吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        ElMessage.success('删除成功')
        handleQuery()
    })
}

/**
 * 批量下载
 */
const handleBatchDownload = () => {
    ElMessage.success('下载功能开发中...')
}

/**
 * 提交表单
 */
const handleSubmit = () => {
    contractFormRef.value?.validate((valid: boolean) => {
        if (valid) {
            ElMessage.success(isEdit.value ? '编辑成功' : '新建成功')
            contractDialogShow.value = false
            handleQuery()
        }
    })
}

/**
 * 重置表单
 */
const resetContractForm = () => {
    Object.assign(contractForm, {
        studentName: '',
        phone: '',
        totalHours: null,
        remainingHours: null,
        signDate: '',
        validityPeriod: [],
        responsible: '',
        contractFile: null,
        description: ''
    })
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

.action-card {
    margin-bottom: 20px;
}

.search-buttons {
    margin-top: 20px;
}

.button-container {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
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

.detail-content .content-text {
    max-height: 100px;
    overflow-y: auto;
}

.dialog-footer {
    text-align: right;
}

.upload-demo {
    width: 100%;
}
</style>
