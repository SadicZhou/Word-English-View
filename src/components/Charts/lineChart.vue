<template>
  <div ref="lineChart" style="width: 100%; height: 100%" />
</template>
<script setup lang="ts">
/**
 * 折线图组件，用于展示趋势数据，支持数据缩放、自定义样式等功能
 *
 * @component
 * @name LineChart
 * @description 该组件基于ECharts实现，提供可配置的折线图，支持丰富的自定义样式和交互功能
 *
 * @property {Array} data 图表的数据数组
 * @property {Array} xAxisData X轴数据数组
 * @property {string} yAxisLabelColor Y轴标签的颜色，默认值为 "#969998"
 * @property {string} yAxisSplitLineColor Y轴分割线的颜色，默认值为 "#383838"
 * @property {string} xAxisLabelColor X轴标签的颜色，默认值为 "#969998"
 * @property {string} xAxisLineColor X轴轴线的颜色，默认值为 "#383838"
 * @property {number|string} xAxisOffset x轴的位置偏移量，默认值为 0
 * @property {number|string} yAxisOffset y轴的位置偏移量，默认值为 0
 * @property {boolean} enableZoom 是否启用缩放功能，默认值为 true
 * @property {string} zoomType 缩放类型，可选 'x', 'y', 'xy'，默认值为 "xy"
 * @property {boolean} showUnit 是否显示tooltips，默认值为 false
 * @property {string} unit 自定义单位，默认值为 ""
 * @property {string} lineColor 折线颜色，默认值为 "#29B37A"
 * @property {string} areaColorStart 区域填充渐变开始颜色，默认值为 "rgba(90,225,168,.5)"
 * @property {string} areaColorEnd 区域填充渐变结束颜色，默认值为 "rgba(62,205,146,0)"
 * @property {boolean} smooth 是否平滑曲线，默认值为 true
 * @property {number} symbolSize 数据点大小，默认值为 5
 * @property {string} toolTipsBgColor 提示框的背景颜色，默认值为 "#3C3C3C"
 * @property {string} toolTipsColor 提示框的文字颜色，默认值为 "#D27C3B"
 * @property {number|string} toolTipsFontSize 提示框的文字大小，默认值为 14
 * @property {number|string} toolTipsFontWeight 提示框的文字粗细，默认值为 600
 * @property {number|string} toolTipsBorderRadius 提示框的圆角大小，默认值为 4
 */
import * as echarts from "echarts";
import { onMounted, ref, watch, onUnmounted } from "vue";

const props = defineProps({
  // 图表数据
  data: {
    type: Array,
    default: () => [820, 932, 901, 934, 1290, 1330, 1320]
  },
  // X轴数据
  xAxisData: {
    type: Array,
    default: () => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  // Y轴配置
  yAxisLabelColor: {
    type: String,
    default: "#969998"
  },
  yAxisSplitLineColor: {
    type: String,
    default: "#383838"
  },
  // X轴配置
  xAxisLabelColor: {
    type: String,
    default: "#969998"
  },
  xAxisLineColor: {
    type: String,
    default: "#383838"
  },
  xAxisOffset: {
    type: [Number, String],
    default: 0
  },
  yAxisOffset: {
    type: [Number, String],
    default: 0
  },
  // 图表缩放配置
  enableZoom: {
    type: Boolean,
    default: true
  },
  zoomType: {
    type: String,
    default: "xy" // 可选'x', 'y', 'xy'
  },
  // Tooltip配置
  showUnit: {
    type: Boolean,
    default: false
  },
  unit: {
    type: String,
    default: ""
  },
  // 折线样式配置
  lineColor: {
    type: String,
    default: "#29B37A"
  },
  areaColorStart: {
    type: String,
    default: "rgba(90,225,168,.5)"
  },
  areaColorEnd: {
    type: String,
    default: "rgba(62,205,146,0)"
  },
  smooth: {
    type: Boolean,
    default: true
  },
  symbolSize: {
    type: Number,
    default: 5
  },
  // Tooltip样式配置
  toolTipsBgColor: {
    type: String,
    default: "#3C3C3C"
  },
  toolTipsColor: {
    type: String,
    default: "#D27C3B"
  },
  toolTipsFontSize: {
    type: [Number, String],
    default: 14
  },
  toolTipsFontWeight: {
    type: [Number, String],
    default: 600
  },
  toolTipsBorderRadius: {
    type: [Number, String],
    default: 4
  }
});

const lineChart = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const getOption = () => {
  return {
    grid: {
      left: "1%", // 与容器左侧的距离
      right: "2%", // 与容器右侧的距离
      top: "10%", // 与容器顶部的距离
      bottom: "10%", // 与容器底部的距离
      containLabel: true
    },
    tooltip: {
      show: props.showUnit,
      renderMode: "html",
      position: "top",
      formatter: "{c0}" + props.unit,
      borderWidth: 0,
      backgroundColor: props.toolTipsBgColor,
      borderRadius: props.toolTipsBorderRadius,
      padding: [
        6, // 上
        8, // 右
        6, // 下
        8  // 左
      ],
      textStyle: {
        fontSize: props.toolTipsFontSize,
        color: props.toolTipsColor,
        fontWeight: props.toolTipsFontWeight
      }
    },
    dataZoom: props.enableZoom
      ? [
        {
          type: "inside",
          xAxisIndex: 0,
          start: 0,
          end: 100
        }
      ]
      : [],
    xAxis: {
      type: "category",
      boundaryGap: true, // 坐标轴两边留白策略
      axisLine: {
        // 坐标轴轴线
        show: false,
        lineStyle: {
          color: props.xAxisLineColor,
          offset: props.xAxisOffset
        }
      },
      axisTick: {
        // 坐标轴刻度
        show: false
      },
      splitLine: {
        // 坐标轴在 grid 区域中的分隔线。
        show: false
      },
      axisLabel: {
        // 坐标轴刻度标签
        show: true,
        color: props.xAxisLabelColor
      },
      data: props.xAxisData
    },
    yAxis: {
      type: "value",
      axisLine: {
        show: false,
        offset: props.yAxisOffset
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: props.yAxisSplitLineColor
        }
      },
      axisLabel: {
        // 坐标轴刻度标签
        show: true,
        color: props.yAxisLabelColor
      }
    },
    series: [
      {
        data: props.data,
        type: "line",
        symbolSize: props.symbolSize,
        itemStyle: {
          normal: {
            color: props.lineColor,
            lineStyle: {
              color: props.lineColor
            }
          }
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: props.areaColorStart
            },
            {
              offset: 1,
              color: props.areaColorEnd
            }
          ])
        },
        smooth: props.smooth
      }
    ]
  };
};

const handleResize = () => {
  if (chartInstance && lineChart.value) {
    // 在调整大小前检查DOM是否可见
    const container = lineChart.value;
    const isVisible = 
      container.offsetParent !== null && 
      container.clientWidth > 0 && 
      container.clientHeight > 0;
    
    if (isVisible) {
      chartInstance.resize();
    }
  }
};

const initLineChart = () => {
  if (!lineChart.value) {
    console.error("LineChart component not initialized");
    return;
  }

  // 确保容器有明确的尺寸
  const container = lineChart.value;
  const containerWidth = container.clientWidth || container.offsetWidth;
  const containerHeight = container.clientHeight || container.offsetHeight;
  
  if (containerWidth === 0 || containerHeight === 0) {
    console.warn("LineChart container has zero width or height");
    // 设置一个默认的最小尺寸，避免echarts报错
    container.style.minWidth = "100%";
    container.style.minHeight = "300px";
  }

  chartInstance = echarts.init(container);
  
  if (!chartInstance) {
    console.error("Failed to initialize ECharts instance");
    return;
  }

  chartInstance.setOption(getOption());

  // 监听窗口大小变化，调整图表大小
  window.addEventListener("resize", handleResize);
  
  // 延迟一点时间后再次调整大小，确保在布局完成后能正确渲染
  setTimeout(() => {
    if (chartInstance) {
      chartInstance.resize();
    }
  }, 200);
};

// 响应式更新图表
watch([() => props.data, () => props.xAxisData], () => {
  if (chartInstance) {
    chartInstance.setOption({
      xAxis: {
        data: props.xAxisData
      },
      series: [
        {
          data: props.data
        }
      ]
    });
  }
});

onMounted(() => {
  initLineChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener("resize", handleResize);
});
</script>
