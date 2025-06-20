<template>
  <div ref="barChart" style="width: 100%; height: 100%" />
</template>

<script setup>
/**
 * 柱状图组件，用于展示数据，支持数据缩放、工具框等功能，并且可以配置柱状图的各种样式和属性。
 *
 * @component
 * @name BarChart
 * @description 该组件基于 ECharts 实现，提供了一个可配置的柱状图，能够根据传入的数据源和配置项展示不同的柱状图效果，同时支持点击事件和缩放等交互操作。
 * 定义组件的属性配置
 *
 * @typedef {Object} Props
 * @property {number|string|null} barWidth 数据柱的宽度，设为 null 表示自适应宽度
 * @property {number|string} barGap 数据柱之间的间距，默认值为 "30%"
 * @property {string} barColor 数据柱的颜色，默认值为 "#5B8FF9"
 * @property {Function} yAxisFormatter Y 轴数据的格式化函数，默认返回原值
 * @property {string} yAxisLabelColor Y 轴标签的颜色，默认值为 "#606266"
 * @property {string} yAxisSplitLineColor Y 轴分割线的颜色，默认值为 "#EBEEF5"
 * @property {Array} xAxisLabels X 轴标签数组，每个元素可以是包含 text 等属性的对象
 * @property {Array} data 图表的数据数组
 * @property {number|string} chartHeight 图表的高度，默认值为 400
 * @property {number|string} chartWidth 图表的宽度，默认值为 750
 * @property {boolean} enableZoom 是否启用缩放功能，默认值为 true
 * @property {string} zoomType 缩放类型，可选 'x', 'y', 'xy'，默认值为 "xy"
 * @property {boolean} showZoomSlider 是否显示缩放进度条，默认值为 false
 * @property {boolean} showToolbox 是否显示右上角的工具栏，默认值为 false
 * @property {Function} clickDataFormatter 点击数据柱时展示数据的格式化函数，默认返回原值
 * @property {string} clickDataColor 点击数据柱时展示数据的颜色，默认值为 "#333"
 * @property {string} unit Y 轴数据的单位，默认值为 "/次"
 * @property {boolean} showUnit 是否在提示框中显示单位，默认值为 false
 * @property {string} activeBarColor 数据柱被点击后的激活颜色，默认值为 "#FF5722"
 * @property {number|string} xAxisOffset x 轴的位置偏移量，默认值为 0
 * @property {number|string} yAxisOffset y 轴的位置偏移量，默认值为 0
 * @property {string} xAxisLabelColor X 轴标签的颜色，默认值为 "#606266"
 * @property {string} xAxisLineColor X 轴轴线的颜色，默认值为 "#C0C4CC"
 * @property {string} toolTipsBgColor 提示框的背景颜色，默认值为 "#3C3C3C"
 * @property {string} toolTipsColor 提示框的文字颜色，默认值为 "#D27C3B"
 * @property {number|string} toolTipsFontSize 提示框的文字大小，默认值为 14
 * @property {number|string} toolTipsFontWeight 提示框的文字粗细，默认值为 600
 * @property {number|string} toolTipsBorderRadius 提示框的圆角大小，默认值为 4
 */
import { ref, onMounted, nextTick, watch, onUnmounted, computed } from "vue";
import * as echarts from "echarts";
const props = defineProps({
  // 数据柱配置
  barWidth: {
    type: [Number, String],
    default: null // 设为null表示自适应宽度
  },
  barGap: {
    // 新增：数据柱之间的间距
    type: [Number, String],
    default: "30%"
  },
  barColor: {
    type: String,
    default: "#5B8FF9"
  },
  // Y轴配置
  yAxisFormatter: {
    type: Function,
    default: val => val
  },
  yAxisLabelColor: {
    type: String,
    default: "#606266"
  },
  yAxisSplitLineColor: {
    type: String,
    default: "#383838"
  },
  // X轴配置
  xAxisLabels: {
    type: Array,
    default: () => []
  },
  // 图表数据
  data: {
    type: Array,
    default: () => []
  },
  // 图表尺寸
  chartHeight: {
    type: [Number, String],
    default: 400
  },
  chartWidth: {
    type: [Number, String],
    default: 750
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
  showZoomSlider: {
    // 新增：控制缩放进度条显示/隐藏
    type: Boolean,
    default: false
  },
  showToolbox: {
    // 新增：控制右上角工具栏显示/隐藏，默认隐藏
    type: Boolean,
    default: false
  },
  // 新增：点击数据柱时展示数据的格式化函数
  clickDataColor: {
    type: String,
    default: "#333"
  },
  unit: {
    type: String,
    default: ""
  },
  showUnit: {
    type: Boolean,
    default: false
  },
  // 新增：数据柱被点击后的激活颜色
  activeBarColor: {
    type: String,
    default: "#FF5722"
  },
  // 新增：x 轴的位置偏移量
  xAxisOffset: {
    type: [Number, String],
    default: 0
  },
  // 新增：y 轴的位置偏移量
  yAxisOffset: {
    type: [Number, String],
    default: 0
  },
  // 新增：X轴标签的颜色
  xAxisLabelColor: {
    type: String,
    default: "#606266"
  },
  // 新增：X轴轴线的颜色
  xAxisLineColor: {
    type: String,
    default: "#383838"
  },
  barMaxWidth: {
    type: String,
    default: "16"
  },
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

const barChart = ref(null);
let chartInstance = null;
const emits = defineEmits(["barClick"]); // 定义抛出的事件

// 初始化图表
const initChart = () => {
  if (!barChart.value) {
    console.error("BarChart component not initialized");
    return;
  }
  chartInstance = echarts.init(barChart.value);

  if (!chartInstance) {
    console.error("Failed to initialize ECharts instance");
    return;
  }

  const options = {
    grid: {
      left: "0%",
      right: "0%",
      bottom: props.showZoomSlider ? "15%" : "3%",
      top: "5%",
      containLabel: true
    },
    toolbox: {
      show: props.showToolbox,
      feature: {
        dataZoom: {
          yAxisIndex: "none"
        },
        restore: {}
      }
    },
    tooltip: {
      show: props.showUnit,
      renderMode: "html",
      position: "top",
      formatter: "{c0}" + props.unit, // 提示框浮层内容格式器，支持字符串模板和回调函数两种形式,模板变量有 {a}, {b}，{c}，{d}，{e}，分别表示系列名，数据名，数据值等，具体见下图
      borderWidth: 0,
      backgroundColor: props.toolTipsBgColor,
      borderRadius: props.toolTipsBorderRadius,
      padding: [
        6, // 上
        8, // 右
        6, // 下
        8 // 左
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
          },
          {
            type: "slider",
            xAxisIndex: 0,
            start: 0,
            end: 100,
            show: props.showZoomSlider
          }
        ]
      : [],
    xAxis: {
      type: "category",
      data: props.xAxisLabels.map((item, index) =>
        item.show !== false ? item.text || `x${index}` : ""
      ),
      axisLabel: {
        color: props.xAxisLabels.map(
          item => item.color || props.xAxisLabelColor
        ),
        fontSize: props.xAxisLabels.map(item => item.fontSize || 12),
        formatter: (value, index) => {
          const label = props.xAxisLabels[index] || {};
          return label.formatter ? label.formatter(value) : value;
        }
      },
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: props.xAxisLineColor,
          // 添加 x 轴位置偏移量
          offset: props.xAxisOffset
        }
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: props.yAxisLabelColor,
        formatter: props.yAxisFormatter
      },
      splitLine: {
        lineStyle: {
          color: props.yAxisSplitLineColor
        }
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false,
        // 添加 y 轴位置偏移量
        offset: props.yAxisOffset
      }
    },
    series: [
      {
        type: "bar",
        data: props.data,
        barWidth: props.barWidth || null,
        barMaxWidth: props.barMaxWidth || null,
        barGap: props.barGap,
        itemStyle: {
          color: props.barColor,
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  chartInstance.setOption(options);

  chartInstance.on("click", params => {
    // 数据柱点击事件
    const { dataIndex } = params;
    emits("barClick", {
      value: params.data,
      dataIndex
    });
    // 改变点击后的数据柱颜色
    const newOptions = {
      series: [
        {
          type: "bar",
          data: props.data,
          itemStyle: {
            normal: {
              color: props.barColor
            },
            emphasis: {
              color: props.activeBarColor
            }
          }
        }
      ]
    };
    chartInstance.setOption(newOptions);
  });
};

// 响应式更新图表
watch([() => props.data, () => props.xAxisLabels], () => {
  if (chartInstance) {
    chartInstance.setOption({
      xAxis: {
        data: props.xAxisLabels.map((item, index) =>
          item.show !== false ? item.text || `x${index}` : ""
        )
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
  nextTick(() => {
    initChart();
  });
  window.addEventListener("resize", () => {
    console.log("resize");
    if (chartInstance) {
      chartInstance.resize();
    }
  });
});

// 组件销毁时释放资源
onUnmounted(() => {
  console.log("unmount");
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener("resize", () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  });
});
</script>
