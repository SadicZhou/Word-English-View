<template>
    <div class="dashboard-container">
        <!-- 统计卡片区域 -->
        <div class="stats-cards">
            <el-card class="stats-card" :body-style="cardPad">
                <div class="stats-content">
                    <div class="stats-icon course">
                        <el-icon><Document /></el-icon>
                    </div>
                    <div class="stats-info">
                        <div class="stats-number">{{ todayStats.courseCount }}</div>
                        <div class="stats-label">今日课程数</div>
                        <div class="stats-unit">节</div>
                    </div>
                </div>
            </el-card>

            <el-card class="stats-card" :body-style="cardPad">
                <div class="stats-content">
                    <div class="stats-icon warning">
                        <el-icon><Warning /></el-icon>
                    </div>
                    <div class="stats-info">
                        <div class="stats-number">{{ todayStats.warningCount }}</div>
                        <div class="stats-label">今日预警数</div>
                        <div class="stats-unit">次</div>
                    </div>
                </div>
            </el-card>

            <el-card class="stats-card" :body-style="cardPad">
                <div class="stats-content">
                    <div class="stats-icon student">
                        <el-icon><User /></el-icon>
                    </div>
                    <div class="stats-info">
                        <div class="stats-number">{{ todayStats.newStudentCount }}</div>
                        <div class="stats-label">今日新增学员</div>
                        <div class="stats-unit">人</div>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- 图表区域 -->
        <div class="charts-container">
            <!-- 课程统计柱状图 -->
            <el-card class="chart-card course-chart" :body-style="cardPad">
                <template #header>
                    <div class="chart-header">
                        <span class="chart-title">课程统计</span>
                        <div class="chart-controls">
                            <span class="control-label">统计维度：</span>
                            <el-select v-model="courseStatsDimension" style="width: 120px;" @change="handleDimensionChange">
                                <el-option label="预定率" value="booking" />
                                <el-option label="出勤率" value="attendance" />
                                <el-option label="取消率" value="cancellation" />
                            </el-select>
                        </div>
                    </div>
                </template>
                <div class="chart-wrapper" style="height: 350px;">
                    <BarChart
                        :data="courseChartData"
                        :x-axis-labels="courseLabels"
                        :bar-color="'#5B8FF9'"
                        :show-unit="true"
                        :unit="courseUnit"
                        :enable-zoom="true"
                        :show-zoom-slider="false"
                        :y-axis-split-line-color="'#f0f0f0'"
                        :x-axis-line-color="'#e0e0e0'"
                        @bar-click="handleBarClick"
                    />
                </div>
            </el-card>

            <!-- 学员排名表格 -->
            <el-card class="chart-card ranking-card" :body-style="cardPad">
                <template #header>
                    <div class="chart-header">
                        <span class="chart-title">学员排名</span>
                        <div class="chart-controls">
                            <span class="control-label">排名规则：</span>
                            <el-select v-model="rankingRule" style="width: 100px;" @change="handleRankingChange">
                                <el-option label="积分" value="score" />
                                <el-option label="出勤" value="attendance" />
                            </el-select>
                        </div>
                    </div>
                </template>
                <div class="table-container">
                    <el-table :data="rankingData" stripe style="width: 100%">
                        <el-table-column prop="studentId" label="学员ID" width="120" />
                        <el-table-column prop="studentName" label="学员姓名" width="100" />
                        <el-table-column 
                            v-if="rankingRule === 'score'" 
                            prop="scoreChange" 
                            label="今日积分变动" 
                            width="120"
                            :formatter="formatScoreChange"
                        />
                        <el-table-column 
                            v-if="rankingRule === 'score'" 
                            prop="totalScore" 
                            label="积分总额" 
                        />
                        <el-table-column 
                            v-if="rankingRule === 'attendance'" 
                            prop="attendanceRate" 
                            label="出勤率" 
                        />
                    </el-table>
                </div>
            </el-card>
        </div>

        <!-- 趋势分析折线图 -->
        <el-card class="trend-card" :body-style="cardPad">
            <template #header>
                <div class="chart-header">
                    <span class="chart-title">趋势分析</span>
                </div>
            </template>
            <div class="chart-wrapper" style="height: 220px;">
                <LineChart
                    :data="trendData"
                    :x-axis-data="trendLabels"
                    :line-color="'#29B37A'"
                    :area-color-start="'rgba(41,179,122,0.3)'"
                    :area-color-end="'rgba(41,179,122,0)'"
                    :smooth="true"
                    :symbol-size="6"
                    :show-unit="true"
                    :unit="'人'"
                    :enable-zoom="true"
                    :y-axis-split-line-color="'#f0f0f0'"
                />
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { Document, Warning, User } from '@element-plus/icons-vue'
import { cardPad } from '@/config/cardConfig'
import BarChart from '@/components/Charts/barChart.vue'
import LineChart from '@/components/Charts/lineChart.vue'

/**
 * 数据看板页面
 * 展示今日统计数据、课程统计图表、学员排名和趋势分析
 */

// 今日统计数据
const todayStats = reactive({
    courseCount: 12,
    warningCount: 12,
    newStudentCount: 12
})

// 课程统计相关数据
const courseStatsDimension = ref('booking')
const courseUnit = computed(() => {
    switch (courseStatsDimension.value) {
        case 'booking': return '%'
        case 'attendance': return '%'
        case 'cancellation': return '%'
        default: return ''
    }
})

// 课程标签数据
const courseLabels = ref([
    { text: '商务英语写作', show: true },
    { text: '雅思听力', show: true },
    { text: '职场口语', show: true },
    { text: '雅思阅读', show: true },
    { text: '学术写作', show: true },
    { text: '商务谈判', show: true },
    { text: '雅思口语', show: true },
    { text: '简历面试', show: true }
])

// 课程图表数据
const courseChartData = ref([85, 92, 78, 88, 95, 82, 90, 87])

// 学员排名相关数据
const rankingRule = ref('score')

// 积分排名数据
const scoreRankingData = ref([
    { studentId: '6521735138', studentName: '邵静雅', scoreChange: 5, totalScore: 88 },
    { studentId: '6521735139', studentName: '李明华', scoreChange: -2, totalScore: 85 },
    { studentId: '6521735140', studentName: '王小红', scoreChange: 8, totalScore: 92 },
    { studentId: '6521735141', studentName: '张伟强', scoreChange: 3, totalScore: 79 },
    { studentId: '6521735142', studentName: '陈美丽', scoreChange: 0, totalScore: 81 },
    { studentId: '6521735143', studentName: '刘志强', scoreChange: 12, totalScore: 96 },
    { studentId: '6521735144', studentName: '赵敏敏', scoreChange: -5, totalScore: 73 },
    { studentId: '6521735145', studentName: '孙丽华', scoreChange: 7, totalScore: 89 }
])

// 出勤排名数据
const attendanceRankingData = ref([
    { studentId: '6521735138', studentName: '邵静雅', attendanceRate: '98%' },
    { studentId: '6521735139', studentName: '李明华', attendanceRate: '95%' },
    { studentId: '6521735140', studentName: '王小红', attendanceRate: '97%' },
    { studentId: '6521735141', studentName: '张伟强', attendanceRate: '92%' },
    { studentId: '6521735142', studentName: '陈美丽', attendanceRate: '89%' },
    { studentId: '6521735143', studentName: '刘志强', attendanceRate: '100%' },
    { studentId: '6521735144', studentName: '赵敏敏', attendanceRate: '87%' },
    { studentId: '6521735145', studentName: '孙丽华', attendanceRate: '94%' }
])

// 计算属性：当前排名数据
const rankingData = computed(() => {
    return rankingRule.value === 'score' ? scoreRankingData.value : attendanceRankingData.value
})

// 趋势分析数据
const trendData = ref([8, 12, 15, 10, 18, 22, 16])
const trendLabels = ref(['06-10', '06-11', '06-12', '06-13', '06-14', '06-15', '06-16'])

/**
 * 处理统计维度变更
 */
const handleDimensionChange = (value: string) => {
    // 根据不同维度更新图表数据
    switch (value) {
        case 'booking':
            courseChartData.value = [85, 92, 78, 88, 95, 82, 90, 87]
            break
        case 'attendance':
            courseChartData.value = [88, 95, 82, 91, 97, 85, 93, 89]
            break
        case 'cancellation':
            courseChartData.value = [12, 8, 15, 10, 5, 18, 7, 11]
            break
    }
}

/**
 * 处理排名规则变更
 */
const handleRankingChange = (value: string) => {
    console.log('排名规则变更:', value)
}

/**
 * 处理柱状图点击事件
 */
const handleBarClick = (data: any) => {
    console.log('点击了柱状图:', data)
}

/**
 * 格式化积分变动显示
 */
const formatScoreChange = (row: any, column: any, cellValue: number) => {
    return cellValue > 0 ? `+${cellValue}` : cellValue.toString()
}

onMounted(() => {
    // 页面挂载后的初始化操作
    console.log('数据看板页面已加载')
})
</script>

<style scoped lang="scss">
.dashboard-container {
    padding: 20px;
    background-color: #f5f5f5;
    min-height: calc(100vh - 60px);

    .stats-cards {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;

        .stats-card {
            flex: 1;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            .stats-content {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .stats-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: white;

                    &.course {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }

                    &.warning {
                        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    }

                    &.student {
                        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    }
                }

                .stats-info {
                    flex: 1;
                    text-align: right;

                    .stats-number {
                        font-size: 48px;
                        font-weight: 700;
                        color: #303133;
                        line-height: 1;
                        margin-bottom: 5px;
                    }

                    .stats-label {
                        font-size: 14px;
                        color: #909399;
                        margin-bottom: 2px;
                    }

                    .stats-unit {
                        font-size: 16px;
                        font-weight: 650;
                        color: #606266;
                    }
                }
            }
        }
    }

    .charts-container {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;

        .chart-card {
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            &.course-chart {
                flex: 2;
            }

            &.ranking-card {
                flex: 1;
            }

            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .chart-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #303133;
                }

                .chart-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .control-label {
                        font-size: 14px;
                        color: #606266;
                    }
                }
            }

            .chart-wrapper {
                width: 100%;
            }

            .table-container {
                max-height: 350px;
                overflow-y: auto;
            }
        }
    }

    .trend-card {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .chart-header {
            .chart-title {
                font-size: 16px;
                font-weight: 600;
                color: #303133;
            }
        }

        .chart-wrapper {
            width: 100%;
        }
    }
}

// 响应式设计
@media (max-width: 1200px) {
    .dashboard-container {
        .charts-container {
            flex-direction: column;

            .chart-card {
                &.course-chart,
                &.ranking-card {
                    flex: none;
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .dashboard-container {
        padding: 10px;

        .stats-cards {
            flex-direction: column;
            gap: 10px;

            .stats-card .stats-content {
                .stats-info .stats-number {
                    font-size: 36px;
                }
            }
        }

        .charts-container {
            gap: 10px;
        }
    }
}
</style>
