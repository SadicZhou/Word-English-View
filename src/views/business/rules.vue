<template>
    <div class="content">
        <!-- 表格区域 -->
        <div class="table-container">
            <el-table :data="tableData" v-bind="{ ...tableConfig }" v-loading="loading">
                <el-table-column prop="ruleName" label="规则名称" />
                <el-table-column prop="ruleCategory" label="规则分类" />
                <el-table-column prop="configItem" label="配置项" />
                <el-table-column prop="status" label="状态">
                    <template #default="{ row }">
                        <el-switch v-model="row.status" active-text="启用" inactive-text="禁用"
                            @change="handleStatusChange(row)" />
                    </template>
                </el-table-column>
                <el-table-column prop="defaultValue" label="默认值" />
                <el-table-column prop="effectiveTime" label="生效时间" />
                <el-table-column fixed="right" label="操作" width="100" align="center">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleEdit(row)">
                            编辑
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>

    <!-- 编辑规则对话框 -->
    <el-dialog v-model="editDialogShow" width="800" title="编辑" destroy-on-close>
        <el-form :model="editForm" :rules="editRules" ref="editFormRef" v-bind="{ ...formConfig }">
            <el-form-item label="规则名称" v-bind="{ ...formItemConfig }">
                <span>{{ editForm.ruleName }}</span>
            </el-form-item>
            <el-form-item label="规则分类" v-bind="{ ...formItemConfig }">
                <span>{{ editForm.ruleCategory }}</span>
            </el-form-item>
            <el-form-item label="配置项" v-bind="{ ...formItemConfig }">
                <span>{{ editForm.configItem }}</span>
            </el-form-item>
            <el-form-item label="状态" v-bind="{ ...formItemConfig }">
                <el-switch v-model="editForm.status" active-text="启用" inactive-text="禁用" />
            </el-form-item>
            <el-form-item label="默认值" prop="defaultValue" v-bind="{ ...formItemConfig }">
                <el-input v-model="editForm.defaultValue" placeholder="请输入默认值" />
            </el-form-item>
            <el-form-item label="生效时间" prop="effectiveTime" v-bind="{ ...formItemConfig }">
                <el-select v-model="effectiveTimeType" style="width: 200px; margin-right: 10px;">
                    <el-option label="永久有效" value="permanent" />
                    <el-option label="自定义" value="custom" />
                </el-select>
                <el-date-picker v-if="effectiveTimeType === 'custom'" v-model="editForm.customTime" type="date"
                    placeholder="选择生效时间" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="cancelEdit">取消</el-button>
                <el-button type="primary" @click="confirmEdit">保存</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { tableConfig } from '@/config/tableConfig'
import { formConfig, formItemConfig } from '@/config/formConfig'

// 规则数据类型定义
interface RuleItem {
    id: number
    ruleName: string
    ruleCategory: string
    configItem: string
    status: boolean
    defaultValue: string
    effectiveTime: string
    customTime?: string
}

/**
 * 响应式数据
 */
const loading = ref(false)
const tableData = ref<RuleItem[]>([])

// 编辑对话框
const editDialogShow = ref(false)
const editFormRef = ref()
const editForm = ref<RuleItem>({
    id: 0,
    ruleName: '',
    ruleCategory: '',
    configItem: '',
    status: true,
    defaultValue: '',
    effectiveTime: '',
    customTime: ''
})

// 生效时间类型
const effectiveTimeType = ref('permanent')

// 表单验证规则
const editRules = reactive({
    defaultValue: [
        { required: true, message: '请输入默认值', trigger: 'blur' }
    ]
})

/**
 * 状态切换
 */
const handleStatusChange = (row: RuleItem) => {
    console.log('切换规则状态', row.id, row.status)
    // 这里调用API更新状态
    ElMessage.success(`规则已${row.status ? '启用' : '禁用'}`)
}

/**
 * 编辑规则
 */
const handleEdit = (row: RuleItem) => {
    editForm.value = { ...row }
    // 根据生效时间判断类型
    if (row.effectiveTime === '永久有效') {
        effectiveTimeType.value = 'permanent'
    } else {
        effectiveTimeType.value = 'custom'
        editForm.value.customTime = row.effectiveTime
    }
    editDialogShow.value = true
}

/**
 * 确认编辑
 */
const confirmEdit = () => {
    editFormRef.value?.validate((valid: boolean) => {
        if (valid) {
            // 设置生效时间
            if (effectiveTimeType.value === 'permanent') {
                editForm.value.effectiveTime = '永久有效'
            } else {
                editForm.value.effectiveTime = editForm.value.customTime || ''
            }

            console.log('保存规则配置', editForm.value)
            // 这里调用API保存

            // 更新表格数据
            const index = tableData.value.findIndex(item => item.id === editForm.value.id)
            if (index > -1) {
                tableData.value[index] = { ...editForm.value }
            }

            ElMessage.success('保存成功')
            editDialogShow.value = false
        }
    })
}

/**
 * 取消编辑
 */
const cancelEdit = () => {
    editDialogShow.value = false
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
                ruleName: '自动取消课程人数阈值',
                ruleCategory: '课程管理',
                configItem: '最少人数',
                status: true,
                defaultValue: '4',
                effectiveTime: '永久有效'
            },
            {
                id: 2,
                ruleName: '课程锁定提前时间',
                ruleCategory: '课程管理',
                configItem: '锁定提前时间(小时)',
                status: true,
                defaultValue: '3',
                effectiveTime: '永久有效'
            },
            {
                id: 3,
                ruleName: '课程取消提前检查',
                ruleCategory: '课程管理',
                configItem: '检查提前时间(小时)',
                status: true,
                defaultValue: '3',
                effectiveTime: '永久有效'
            },
            {
                id: 4,
                ruleName: '恶意约课判定次数',
                ruleCategory: '学员管理',
                configItem: '最大违约次数',
                status: true,
                defaultValue: '3',
                effectiveTime: '永久有效'
            },
            {
                id: 5,
                ruleName: '课时不足提醒阈值',
                ruleCategory: '学员管理',
                configItem: '最大课时节数',
                status: true,
                defaultValue: '4',
                effectiveTime: '永久有效'
            },
            {
                id: 6,
                ruleName: '合同到期提醒天数',
                ruleCategory: '合同管理',
                configItem: '提前提醒天数',
                status: true,
                defaultValue: '7',
                effectiveTime: '永久有效'
            },
            {
                id: 7,
                ruleName: '课程确认提前时间',
                ruleCategory: '课程管理',
                configItem: '确认提前时间(小时)',
                status: true,
                defaultValue: '6',
                effectiveTime: '永久有效'
            }
        ]
        loading.value = false
    }, 1000)
}

onMounted(() => {
    getMockData()
})
</script>

<style scoped>
.content {
    padding: 20px;
}

.table-container {
    margin-bottom: 20px;
}

.dialog-footer {
    text-align: center;
}

:deep(.el-switch__label) {
    color: var(--el-text-color-primary);
}

:deep(.el-switch__label.is-active) {
    color: var(--el-color-primary);
}
</style>
