<template>
    <div class="content">
        <!-- 搜索区域 -->
        <el-card class="search-card" :body-style="cardPad">
            <el-form :model="queryParams" :inline="true" label-width="100px">
                <el-form-item label="学员姓名">
                    <el-input v-model="queryParams.studentName" style="width: 200px" placeholder="请输入学员姓名" clearable />
                </el-form-item>
                <el-form-item label="学员状态">
                    <el-select v-model="queryParams.status" style="width: 200px" placeholder="请选择学员状态" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="在读" value="在读" />
                        <el-option label="休学" value="休学" />
                        <el-option label="毕业" value="毕业" />
                        <el-option label="退学" value="退学" />
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
                    <el-button type="primary" :icon="Plus" @click="handleAdd">新建学员</el-button>
                    <el-button :icon="Upload" @click="handleImport">批量导入</el-button>
                    <el-button :icon="Download" @click="handleExport">导出</el-button>
                </el-col>
            </el-row>
        </el-card>

        <!-- 表格区域 -->
        <div class="table-container">
            <el-table :data="tableData" v-bind="{ ...tableConfig }" v-loading="loading">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="studentId" label="学员ID" />
                <el-table-column prop="studentName" label="学员姓名" />
                <el-table-column prop="nickname" label="昵称" />
                <el-table-column prop="phone" label="联系电话" />
                <el-table-column prop="email" label="邮箱" />
                <el-table-column prop="campus" label="所属校区" />
                <el-table-column prop="enrollmentDate" label="入学时间" />
                <el-table-column prop="status" label="状态" align="center">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="totalPoints" label="总积分" />
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
                        <el-button link type="info" size="small" @click="handleCourses(row)">
                            课程记录
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

    <!-- 新建/编辑学员对话框 -->
    <el-dialog v-model="dialogShow" width="800" :title="title" destroy-on-close>
        <el-form :model="studentForm" :rules="formRules" ref="studentFormRef" v-bind="{ ...formConfig }">
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="学员姓名" prop="studentName" v-bind="{ ...formItemConfig }">
                        <el-input v-model="studentForm.studentName" placeholder="请输入学员姓名" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="昵称" prop="nickname" v-bind="{ ...formItemConfig }">
                        <el-input v-model="studentForm.nickname" placeholder="请输入昵称" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="联系电话" prop="phone" v-bind="{ ...formItemConfig }">
                        <el-input v-model="studentForm.phone" placeholder="请输入联系电话" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="邮箱" prop="email" v-bind="{ ...formItemConfig }">
                        <el-input v-model="studentForm.email" placeholder="请输入邮箱" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="身份证号" prop="idCard" v-bind="{ ...formItemConfig }">
                        <el-input v-model="studentForm.idCard" placeholder="请输入身份证号" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="性别" prop="gender" v-bind="{ ...formItemConfig }">
                        <el-select v-model="studentForm.gender" placeholder="请选择性别">
                            <el-option label="男" value="男" />
                            <el-option label="女" value="女" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="所属校区" prop="campus" v-bind="{ ...formItemConfig }">
                        <el-select v-model="studentForm.campus" placeholder="请选择所属校区">
                            <el-option label="北京校区" value="北京校区" />
                            <el-option label="上海校区" value="上海校区" />
                            <el-option label="广州校区" value="广州校区" />
                            <el-option label="深圳校区" value="深圳校区" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="入学时间" prop="enrollmentDate" v-bind="{ ...formItemConfig }">
                        <el-date-picker v-model="studentForm.enrollmentDate" type="date" placeholder="请选择入学时间"
                            format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="学员状态" prop="status" v-bind="{ ...formItemConfig }">
                        <el-select v-model="studentForm.status" placeholder="请选择学员状态">
                            <el-option label="在读" value="在读" />
                            <el-option label="休学" value="休学" />
                            <el-option label="毕业" value="毕业" />
                            <el-option label="退学" value="退学" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="年龄" prop="age" v-bind="{ ...formItemConfig }">
                        <el-input-number v-model="studentForm.age" :min="1" :max="100" placeholder="请输入年龄"
                            style="width: 100%" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-form-item label="家庭住址" prop="address" v-bind="{ ...formItemConfig }">
                <el-input v-model="studentForm.address" placeholder="请输入家庭住址" />
            </el-form-item>

            <el-form-item label="备注" prop="remark" v-bind="{ ...formItemConfig }">
                <el-input v-model="studentForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
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
    <el-dialog v-model="detailDialogShow" width="1000" title="学员详情" destroy-on-close>
        <div class="detail-content">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="学员ID">{{ detailData.studentId }}</el-descriptions-item>
                <el-descriptions-item label="学员姓名">{{ detailData.studentName }}</el-descriptions-item>
                <el-descriptions-item label="昵称">{{ detailData.nickname }}</el-descriptions-item>
                <el-descriptions-item label="联系电话">{{ detailData.phone }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ detailData.email }}</el-descriptions-item>
                <el-descriptions-item label="身份证号">{{ detailData.idCard }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ detailData.gender }}</el-descriptions-item>
                <el-descriptions-item label="年龄">{{ detailData.age }}</el-descriptions-item>
                <el-descriptions-item label="所属校区">{{ detailData.campus }}</el-descriptions-item>
                <el-descriptions-item label="入学时间">{{ detailData.enrollmentDate }}</el-descriptions-item>
                <el-descriptions-item label="学员状态">
                    <el-tag :type="getStatusType(detailData.status)">
                        {{ detailData.status }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="总积分">{{ detailData.totalPoints }}</el-descriptions-item>
                <el-descriptions-item label="创建人">{{ detailData.creator }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
                <el-descriptions-item label="家庭住址" :span="2">{{ detailData.address }}</el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">{{ detailData.remark }}</el-descriptions-item>
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
    name: 'StudentIndex'
})

// 响应式数据
const loading = ref(false)
const dialogShow = ref(false)
const detailDialogShow = ref(false)
const title = ref('')

// 查询参数
const queryParams = reactive({
    studentName: '',
    status: '',
    campus: '',
    phone: '',
    createTime: [] as string[]
})

// 表单引用和数据
const studentFormRef = ref()
const studentForm = reactive({
    id: '',
    studentName: '',
    nickname: '',
    phone: '',
    email: '',
    idCard: '',
    gender: '',
    campus: '',
    enrollmentDate: '',
    status: '',
    age: '',
    address: '',
    remark: ''
})

// 表单验证规则
const formRules = {
    studentName: [{ required: true, message: '请输入学员姓名', trigger: 'blur' }],
    nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
    ],
    idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    campus: [{ required: true, message: '请选择所属校区', trigger: 'change' }],
    enrollmentDate: [{ required: true, message: '请选择入学时间', trigger: 'change' }],
    status: [{ required: true, message: '请选择学员状态', trigger: 'change' }]
}

// 详情数据
const detailData = ref<any>({})

// 表格数据
const tableData = ref([
    {
        studentId: 'ST2025001',
        studentName: '王小明',
        nickname: '小明',
        phone: '13812345678',
        email: 'xiaoming@example.com',
        idCard: '320102199501234567',
        gender: '男',
        campus: '北京校区',
        enrollmentDate: '2025-01-15',
        status: '在读',
        age: 28,
        totalPoints: 2580,
        address: '北京市朝阳区xxx街道xxx号',
        creator: '张老师',
        createTime: '2025-01-15 09:30:00',
        remark: '学习积极主动，英语基础较好'
    },
    {
        studentId: 'ST2025002',
        studentName: '李小红',
        nickname: '小红',
        phone: '13987654321',
        email: 'xiaohong@example.com',
        idCard: '310102199602234568',
        gender: '女',
        campus: '上海校区',
        enrollmentDate: '2025-02-01',
        status: '在读',
        age: 27,
        totalPoints: 1980,
        address: '上海市浦东新区xxx路xxx号',
        creator: '李老师',
        createTime: '2025-02-01 10:15:00',
        remark: '雅思目标7分，需要加强口语练习'
    },
    {
        studentId: 'ST2025003',
        studentName: '张三',
        nickname: '阿三',
        phone: '13765432109',
        email: 'zhangsan@example.com',
        idCard: '440102199703234569',
        gender: '男',
        campus: '广州校区',
        enrollmentDate: '2024-10-10',
        status: '毕业',
        age: 26,
        totalPoints: 4560,
        address: '广州市天河区xxx大道xxx号',
        creator: '王老师',
        createTime: '2024-10-10 14:20:00',
        remark: '商务英语专业，已通过相关考试'
    },
    {
        studentId: 'ST2025004',
        studentName: '赵敏',
        nickname: '敏敏',
        phone: '13654321098',
        email: 'zhaomin@example.com',
        idCard: '440302199804234570',
        gender: '女',
        campus: '深圳校区',
        enrollmentDate: '2024-12-01',
        status: '休学',
        age: 25,
        totalPoints: 1250,
        address: '深圳市南山区xxx街xxx号',
        creator: '刘老师',
        createTime: '2024-12-01 16:45:00',
        remark: '因个人原因申请休学，计划明年复学'
    }
])

// 分页数据
const totalNum = ref(150)
const currentPage = ref(1)
const pageSize = ref(pageNationConfig.pageSize)

/**
 * 获取状态类型
 */
const getStatusType = (status: string) => {
    const typeMap: Record<string, string> = {
        '在读': 'success',
        '休学': 'warning',
        '毕业': 'info',
        '退学': 'danger'
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
        studentName: '',
        status: '',
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
    title.value = '新建学员'
    resetForm()
    dialogShow.value = true
}

/**
 * 编辑
 */
const handleEdit = (row: any) => {
    title.value = '编辑学员'
    Object.assign(studentForm, row)
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
 * 课程记录
 */
const handleCourses = (row: any) => {
    ElMessage.info(`查看学员"${row.studentName}"的课程记录`)
}

/**
 * 删除
 */
const handleDelete = async (row: any) => {
    try {
        await ElMessageBox.confirm(`确定要删除学员"${row.studentName}"吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        ElMessage.success(`学员"${row.studentName}"已删除`)
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
    Object.assign(studentForm, {
        id: '',
        studentName: '',
        nickname: '',
        phone: '',
        email: '',
        idCard: '',
        gender: '',
        campus: '',
        enrollmentDate: '',
        status: '',
        age: '',
        address: '',
        remark: ''
    })
}

/**
 * 取消操作
 */
const cancelHandler = () => {
    studentFormRef.value?.resetFields()
    dialogShow.value = false
}

/**
 * 确认操作
 */
const confirmHandler = async () => {
    try {
        await studentFormRef.value.validate()
        loading.value = true

        // 模拟API调用
        setTimeout(() => {
            loading.value = false
            dialogShow.value = false
            ElMessage.success(title.value === '新建学员' ? '创建成功' : '修改成功')
            handleQuery()
        }, 1000)
    } catch (error) {
        console.error('表单验证失败:', error)
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
