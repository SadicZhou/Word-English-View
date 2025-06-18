<template>
    <div class="content">
        <!-- 搜索区域 -->
        <el-card :body-style="cardPad" class="search-card">
            <el-form :model="queryParams" :inline="true" label-width="100px">
                <el-form-item label="课程名称">
                    <el-input v-model="queryParams.courseName" style="width: 200px" placeholder="请输入课程名称" clearable />
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
                <el-form-item label="授课老师">
                    <el-input v-model="queryParams.teacher" style="width: 200px" placeholder="请输入授课老师" clearable />
                </el-form-item>
                <el-form-item label="教室地点">
                    <el-input v-model="queryParams.classroom" style="width: 200px" placeholder="请输入教室地点" clearable />
                </el-form-item>
                <el-form-item label="上课时间">
                    <el-date-picker v-model="queryParams.classTime" style="width: 300px" type="daterange"
                        range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
                    <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 课程表区域 -->
        <div class="calendar-container">
            <el-calendar v-model="currentDate" class="custom-calendar">
                <template #date-cell="{ data }">
                    <div class="calendar-cell">
                        <div class="date-number">{{ data.day.split('-').slice(-1)[0] }}</div>
                        <div class="course-list">
                            <div v-for="course in getCoursesForDate(data.day)" :key="course.id" class="course-item"
                                :class="getStatusClass(course.status)" @click="handleCourseClick(course)">
                                <div class="course-title">{{ course.title }}</div>
                                <div class="course-time">{{ course.time }}</div>
                            </div>
                        </div>
                    </div>
                </template>
            </el-calendar>
        </div>
    </div>

    <!-- 课程详情弹窗 -->
    <el-dialog v-model="detailDialogShow" width="600" title="课程详情" destroy-on-close>
        <div class="course-detail">
            <div class="detail-header">
                <h3>{{ detailData.title }}</h3>
                <el-tag :type="getStatusTagType(detailData.status)">{{ detailData.status }}</el-tag>
            </div>
            <div class="detail-content">
                <div class="detail-item">
                    <span class="label">授课老师：</span>
                    <span class="value">{{ detailData.teacher }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">上课时间：</span>
                    <span class="value">{{ detailData.fullTime }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">教室地点：</span>
                    <span class="value">{{ detailData.classroom }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">课程类型：</span>
                    <span class="value">{{ detailData.courseType }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">所属校区：</span>
                    <span class="value">{{ detailData.campus }}</span>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { cardPad } from '@/config/cardConfig'

// 响应式数据
const loading = ref(false)
const detailDialogShow = ref(false)
const currentDate = ref(new Date())

// 查询参数
const queryParams = reactive({
    courseName: '',
    campus: '',
    teacher: '',
    classroom: '',
    status: '',
    classTime: []
})

// 课程数据
const courseData = ref([
    {
        id: 1,
        title: '商务英语基础语法（一）',
        teacher: '张兰',
        time: '10:10',
        fullTime: '2025-06-15 10:10:00',
        classroom: '302教室',
        courseType: '商务英语',
        campus: '北京校区',
        status: '待上课',
        date: '2025-06-15'
    },
    {
        id: 2,
        title: '雅思实战演练03',
        teacher: '张兰',
        time: '14:30',
        fullTime: '2025-06-15 14:30:00',
        classroom: '301教室',
        courseType: '雅思',
        campus: '北京校区',
        status: '待上课',
        date: '2025-06-15'
    },
    {
        id: 2,
        title: '雅思实战演练03',
        teacher: '张兰',
        time: '14:30',
        fullTime: '2025-06-15 14:30:00',
        classroom: '301教室',
        courseType: '雅思',
        campus: '北京校区',
        status: '待上课',
        date: '2025-06-15'
    },
    {
        id: 2,
        title: '雅思实战演练03',
        teacher: '张兰',
        time: '14:30',
        fullTime: '2025-06-15 14:30:00',
        classroom: '301教室',
        courseType: '雅思',
        campus: '北京校区',
        status: '待上课',
        date: '2025-06-15'
    },

    {
        id: 3,
        title: '商务英语口语训练',
        teacher: '李明',
        time: '09:00',
        fullTime: '2025-06-16 09:00:00',
        classroom: '303教室',
        courseType: '商务英语',
        campus: '上海校区',
        status: '已结束',
        date: '2025-06-16'
    },
    {
        id: 4,
        title: '雅思听力专项',
        teacher: '王芳',
        time: '15:00',
        fullTime: '2025-06-17 15:00:00',
        classroom: '304教室',
        courseType: '雅思',
        campus: '广州校区',
        status: '上课中',
        date: '2025-06-17'
    },
    {
        id: 5,
        title: '商务英语写作训练',
        teacher: '赵强',
        time: '11:00',
        fullTime: '2025-06-18 11:00:00',
        classroom: '305教室',
        courseType: '商务英语',
        campus: '深圳校区',
        status: '待上课',
        date: '2025-06-18'
    },
    {
        id: 6,
        title: '雅思阅读技巧',
        teacher: '陈静',
        time: '16:30',
        fullTime: '2025-06-18 16:30:00',
        classroom: '306教室',
        courseType: '雅思',
        campus: '北京校区',
        status: '待上课',
        date: '2025-06-18'
    },
    {
        id: 7,
        title: '商务英语演讲技巧',
        teacher: '刘华',
        time: '08:30',
        fullTime: '2025-06-19 08:30:00',
        classroom: '307教室',
        courseType: '商务英语',
        campus: '上海校区',
        status: '待上课',
        date: '2025-06-19'
    },
    {
        id: 8,
        title: '雅思口语模拟考试',
        teacher: '周伟',
        time: '13:00',
        fullTime: '2025-06-19 13:00:00',
        classroom: '308教室',
        courseType: '雅思',
        campus: '广州校区',
        status: '已取消',
        date: '2025-06-19'
    },
    {
        id: 9,
        title: '商务英语邮件写作',
        teacher: '吴丽',
        time: '10:30',
        fullTime: '2025-06-20 10:30:00',
        classroom: '309教室',
        courseType: '商务英语',
        campus: '深圳校区',
        status: '待上课',
        date: '2025-06-20'
    },
    {
        id: 10,
        title: '雅思写作技巧训练',
        teacher: '徐磊',
        time: '14:00',
        fullTime: '2025-06-20 14:00:00',
        classroom: '310教室',
        courseType: '雅思',
        campus: '北京校区',
        status: '上课中',
        date: '2025-06-20'
    }
])

// 详情数据
const detailData = ref<any>({})

/**
 * 获取指定日期的课程
 */
const getCoursesForDate = (date: string) => {
    return courseData.value.filter(course => course.date === date)
}

/**
 * 获取状态样式类
 */
const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
        '待上课': 'status-pending',
        '已取消': 'status-cancelled',
        '已结束': 'status-finished',
        '上课中': 'status-ongoing'
    }
    return statusMap[status] || 'status-default'
}

/**
 * 获取状态标签类型
 */
const getStatusTagType = (status: string) => {
    const typeMap: Record<string, string> = {
        '待上课': 'warning',
        '已取消': 'info',
        '已结束': 'success',
        '上课中': 'primary'
    }
    return typeMap[status] || 'info'
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
    queryParams.courseName = ''
    queryParams.campus = ''
    queryParams.teacher = ''
    queryParams.classroom = ''
    queryParams.status = ''
    queryParams.classTime = []
    handleQuery()
}

/**
 * 点击课程
 */
const handleCourseClick = (course: any) => {
    detailData.value = { ...course }
    detailDialogShow.value = true
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

    // 日历容器样式
    .calendar-container {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
}

// 自定义日历样式
.custom-calendar {
    :deep(.el-calendar__body) {
        padding: 12px;
    }

    :deep(.el-calendar-table) {
        .el-calendar-day {
            height: 180px;
            padding: 8px;
        }
    }
}

// 日历单元格样式
.calendar-cell {
    height: 100%;
    display: flex;
    flex-direction: column;

    .date-number {
        font-size: 16px;
        font-weight: bold;
        color: #606266;
        margin-bottom: 8px;
        text-align: center;
    }

    .course-list {
        flex: 1;
        overflow-y: auto;
        max-height: 140px;
    }

    .course-item {
        background: #f0f9ff;
        border: 1px solid #b3d8ff;
        border-radius: 4px;
        padding: 6px 8px;
        margin-bottom: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s;
        min-height: 24px;

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .course-title {
            font-weight: 500;
            color: #1f2937;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .course-time {
            color: #6b7280;
            font-size: 11px;
            margin-top: 2px;
        }

        // 状态样式
        &.status-pending {
            background: #fef3c7;
            border-color: #fbbf24;

            .course-title {
                color: #92400e;
            }
        }

        &.status-cancelled {
            background: #f3f4f6;
            border-color: #d1d5db;

            .course-title {
                color: #6b7280;
            }
        }

        &.status-finished {
            background: #d1fae5;
            border-color: #34d399;

            .course-title {
                color: #065f46;
            }
        }

        &.status-ongoing {
            background: #dbeafe;
            border-color: #60a5fa;

            .course-title {
                color: #1e40af;
            }
        }
    }
}

// 课程详情样式
.course-detail {
    .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e5e7eb;

        h3 {
            margin: 0;
            color: #1f2937;
            font-size: 18px;
        }
    }

    .detail-content {
        .detail-item {
            display: flex;
            margin-bottom: 12px;

            .label {
                width: 100px;
                color: #6b7280;
                font-weight: 500;
            }

            .value {
                color: #1f2937;
                flex: 1;
            }
        }
    }
}
</style>
