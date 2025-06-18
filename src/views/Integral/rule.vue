<template>
    <div class="content">
        <!-- 搜索区域 -->
        <el-card class="search-card" :body-style="cardPad">
            <el-form :model="queryParams" :inline="true" label-width="100px">
                <el-form-item label="规则名称">
                    <el-input v-model="queryParams.ruleName" style="width: 200px" placeholder="请输入规则名称" clearable />
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
                <el-form-item label="状态">
                    <el-select v-model="queryParams.status" style="width: 200px" placeholder="请选择状态" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="启用" value="启用" />
                        <el-option label="禁用" value="禁用" />
                    </el-select>
                </el-form-item>
                <el-form-item label="创建时间">
                    <el-date-picker v-model="queryParams.createTime" style="width: 300px" type="daterange"
                        range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD" clearable />
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
                        <el-button type="primary" :icon="Plus" @click="handleAdd">新建规则</el-button>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 表格区域 -->
        <div class="table-container">
            <el-table :data="tableData" v-bind="{ ...tableConfig }" v-loading="loading">
                <el-table-column prop="ruleId" label="规则ID" />
                <el-table-column prop="ruleName" label="规则名称" />
                <el-table-column prop="ruleType" label="规则类型" />
                <el-table-column prop="pointsValue" label="积分值">
                    <template #default="{ row }">
                        <span :class="{
                            'points-increase': row.pointsValue > 0,
                            'points-decrease': row.pointsValue < 0
                        }">
                            {{ row.pointsValue > 0 ? '+' : '' }}{{ row.pointsValue }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="triggerCondition" label="触发条件" show-overflow-tooltip />
                <el-table-column prop="dailyLimit" label="每日限制">
                    <template #default="{ row }">
                        {{ row.dailyLimit === -1 ? '无限制' : `${row.dailyLimit}次` }}
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '启用' ? 'success' : 'danger'">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" />
                <el-table-column prop="updateTime" label="更新时间" />
                <el-table-column label="操作" fixed="right" width="200">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleDetail(row)">详情</el-button>
                        <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                        <el-button link :type="row.status === '启用' ? 'warning' : 'success'" size="small"
                            @click="handleToggleStatus(row)">
                            {{ row.status === '启用' ? '禁用' : '启用' }}
                        </el-button>
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

    <!-- 新建/编辑规则弹窗 -->
    <el-dialog v-model="ruleDialogShow" :width="600" :title="isEdit ? '编辑规则' : '新建规则'" destroy-on-close>
        <el-form :model="ruleForm" :rules="ruleFormRules" ref="ruleFormRef" label-width="120px">
            <el-form-item label="规则名称" prop="ruleName">
                <el-input v-model="ruleForm.ruleName" placeholder="请输入规则名称" />
            </el-form-item>
            <el-form-item label="规则类型" prop="ruleType">
                <el-select v-model="ruleForm.ruleType" placeholder="请选择规则类型">
                    <el-option label="课程签到" value="课程签到" />
                    <el-option label="完成作业" value="完成作业" />
                    <el-option label="课程评价" value="课程评价" />
                    <el-option label="推荐朋友" value="推荐朋友" />
                    <el-option label="系统奖励" value="系统奖励" />
                    <el-option label="积分兑换" value="积分兑换" />
                </el-select>
            </el-form-item>
            <el-form-item label="积分值" prop="pointsValue">
                <el-input-number v-model="ruleForm.pointsValue" :min="-999" :max="999" controls-position="right"
                    placeholder="请输入积分值" />
                <div class="form-tips">正值表示获得积分，负值表示消耗积分</div>
            </el-form-item>
            <el-form-item label="触发条件" prop="triggerCondition">
                <el-input v-model="ruleForm.triggerCondition" type="textarea" :rows="3" placeholder="请输入触发条件" />
            </el-form-item>
            <el-form-item label="每日限制" prop="dailyLimit">
                <el-input-number v-model="ruleForm.dailyLimit" :min="-1" controls-position="right"
                    placeholder="请输入每日限制次数" />
                <div class="form-tips">-1表示无限制</div>
            </el-form-item>
            <el-form-item label="规则状态" prop="status">
                <el-radio-group v-model="ruleForm.status">
                    <el-radio value="启用">启用</el-radio>
                    <el-radio value="禁用">禁用</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="规则描述" prop="description">
                <el-input v-model="ruleForm.description" type="textarea" :rows="3" placeholder="请输入规则描述" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="ruleDialogShow = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">保存</el-button>
            </div>
        </template>
    </el-dialog>

    <!-- 规则详情弹窗 -->
    <el-dialog v-model="detailDialogShow" width="600" title="规则详情" destroy-on-close>
        <div class="detail-content">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="规则ID">{{ detailData.ruleId }}</el-descriptions-item>
                <el-descriptions-item label="规则名称">{{ detailData.ruleName }}</el-descriptions-item>
                <el-descriptions-item label="规则类型">{{ detailData.ruleType }}</el-descriptions-item>
                <el-descriptions-item label="积分值">
                    <span :class="{
                        'points-increase': detailData.pointsValue > 0,
                        'points-decrease': detailData.pointsValue < 0
                    }">
                        {{ detailData.pointsValue > 0 ? '+' : '' }}{{ detailData.pointsValue }}
                    </span>
                </el-descriptions-item>
                <el-descriptions-item label="每日限制">
                    {{ detailData.dailyLimit === -1 ? '无限制' : `${detailData.dailyLimit}次` }}
                </el-descriptions-item>
                <el-descriptions-item label="规则状态">
                    <el-tag :type="detailData.status === '启用' ? 'success' : 'danger'">
                        {{ detailData.status }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ detailData.updateTime }}</el-descriptions-item>
                <el-descriptions-item label="触发条件" :span="2">
                    <div class="content-text">{{ detailData.triggerCondition }}</div>
                </el-descriptions-item>
                <el-descriptions-item label="规则描述" :span="2">
                    <div class="content-text">{{ detailData.description }}</div>
                </el-descriptions-item>
            </el-descriptions>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { tableConfig } from '@/config/tableConfig'
import { pageNationConfig } from '@/config/pageConfig'
import { cardPad } from '@/config/cardConfig'
import { formConfig, formItemConfig } from '@/config/formConfig'

// 响应式数据
const loading = ref(false)
const ruleDialogShow = ref(false)
const detailDialogShow = ref(false)
const isEdit = ref(false)
const ruleFormRef = ref()

// 查询参数
const queryParams = reactive({
    ruleName: '',
    pointType: '',
    status: '',
    createTime: []
})

// 表格数据
const tableData = ref([
    {
        ruleId: 'RULE001',
        ruleName: '课程签到奖励',
        ruleType: '课程签到',
        pointsValue: 10,
        triggerCondition: '学员完成课程签到',
        dailyLimit: 3,
        status: '启用',
        description: '学员每次课程签到可获得积分奖励',
        createTime: '2025-10-01 09:00:00',
        updateTime: '2025-10-01 09:00:00'
    },
    {
        ruleId: 'RULE002',
        ruleName: '作业完成奖励',
        ruleType: '完成作业',
        pointsValue: 20,
        triggerCondition: '学员完成课后作业并提交',
        dailyLimit: -1,
        status: '启用',
        description: '学员完成作业后可获得积分奖励',
        createTime: '2025-10-01 09:00:00',
        updateTime: '2025-10-01 09:00:00'
    },
    {
        ruleId: 'RULE003',
        ruleName: '课程评价奖励',
        ruleType: '课程评价',
        pointsValue: 5,
        triggerCondition: '学员对课程进行评价',
        dailyLimit: 1,
        status: '启用',
        description: '学员对课程进行评价后可获得积分奖励',
        createTime: '2025-10-01 09:00:00',
        updateTime: '2025-10-01 09:00:00'
    },
    {
        ruleId: 'RULE004',
        ruleName: '推荐朋友奖励',
        ruleType: '推荐朋友',
        pointsValue: 50,
        triggerCondition: '成功推荐朋友注册并报名课程',
        dailyLimit: 5,
        status: '启用',
        description: '成功推荐朋友后可获得积分奖励',
        createTime: '2025-10-01 09:00:00',
        updateTime: '2025-10-01 09:00:00'
    },
    {
        ruleId: 'RULE005',
        ruleName: '学习资料兑换',
        ruleType: '积分兑换',
        pointsValue: -30,
        triggerCondition: '使用积分兑换学习资料',
        dailyLimit: 2,
        status: '启用',
        description: '使用积分兑换学习资料包',
        createTime: '2025-10-01 09:00:00',
        updateTime: '2025-10-01 09:00:00'
    },
    {
        ruleId: 'RULE006',
        ruleName: '连续学习奖励',
        ruleType: '系统奖励',
        pointsValue: 25,
        triggerCondition: '连续学习7天',
        dailyLimit: 1,
        status: '禁用',
        description: '连续学习达到一定天数后可获得奖励',
        createTime: '2025-10-01 09:00:00',
        updateTime: '2025-10-05 14:30:00'
    }
])

// 分页数据
const totalNum = ref(100)
const currentPage = ref(1)
const pageSize = ref(pageNationConfig.pageSize)

// 规则表单数据
const ruleForm = reactive({
    ruleName: '',
    ruleType: '',
    pointsValue: null,
    triggerCondition: '',
    dailyLimit: null,
    status: '启用',
    description: ''
})

// 表单验证规则
const ruleFormRules = {
    ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
    ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
    pointsValue: [{ required: true, message: '请输入积分值', trigger: 'blur' }],
    triggerCondition: [{ required: true, message: '请输入触发条件', trigger: 'blur' }],
    dailyLimit: [{ required: true, message: '请输入每日限制', trigger: 'blur' }],
    status: [{ required: true, message: '请选择规则状态', trigger: 'change' }]
}

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
    queryParams.ruleName = ''
    queryParams.pointType = ''
    queryParams.status = ''
    queryParams.createTime = []
    handleQuery()
}

/**
 * 新建规则
 */
const handleAdd = () => {
    isEdit.value = false
    resetRuleForm()
    ruleDialogShow.value = true
}

/**
 * 编辑规则
 */
const handleEdit = (row: any) => {
    isEdit.value = true
    Object.assign(ruleForm, { ...row })
    ruleDialogShow.value = true
}

/**
 * 查看详情
 */
const handleDetail = (row: any) => {
    detailData.value = { ...row }
    detailDialogShow.value = true
}

/**
 * 切换规则状态
 */
const handleToggleStatus = (row: any) => {
    const action = row.status === '启用' ? '禁用' : '启用'
    ElMessageBox.confirm(`确定要${action}该规则吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        row.status = action
        ElMessage.success(`${action}成功`)
        handleQuery()
    })
}

/**
 * 删除规则
 */
const handleDelete = (row: any) => {
    ElMessageBox.confirm('确定要删除该规则吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        ElMessage.success('删除成功')
        handleQuery()
    })
}

/**
 * 提交表单
 */
const handleSubmit = () => {
    ruleFormRef.value?.validate((valid: boolean) => {
        if (valid) {
            ElMessage.success(isEdit.value ? '编辑成功' : '新建成功')
            ruleDialogShow.value = false
            handleQuery()
        }
    })
}

/**
 * 重置表单
 */
const resetRuleForm = () => {
    Object.assign(ruleForm, {
        ruleName: '',
        ruleType: '',
        pointsValue: null,
        triggerCondition: '',
        dailyLimit: null,
        status: '启用',
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

.dialog-footer {
    text-align: right;
}

.form-tips {
    color: #909399;
    font-size: 12px;
    margin-top: 4px;
}
</style>
