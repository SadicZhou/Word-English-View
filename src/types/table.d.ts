declare namespace Table {
    interface Columns {
        prop: string
        label: string
        config: ColumnConfig
    }
    /**
     * @description 表格列的配置选项
     * @param {'selection' | 'index' | 'expand'} type - 对应列的类型。如果设置为 'selection' 则显示多选框； 如果设置为 'index' 则显示该行的索引（从 1 开始计算）； 如果设置为 'expand' 则显示为一个可展开的按钮
     * @param {number | Function} index - 如果设置了 type='index'，可以通过传递 index 属性来自定义索引
     * 
     * @param {string} label - 显示的标题
     * 
     * @param {string} columnKey - column 的 key，如果需要使用 filter-change 事件，则需要此属性标识是哪个 column 的筛选条件
     * 
     * @param {string} prop - 字段名称，对应列内容的字段名，也可以使用 property 属性
     * 
     * @param {string | number} width - 对应列的宽度
     * 
     * @param {string | number} minWidth - 对应列的最小宽度，与 width 的区别是 width 是固定的，min-width 会把剩余宽度按比例分配给设置了 min-width 的列
     * 
     * @param {boolean | 'left' | 'right'} fixed - 列是否固定在左侧或者右侧。true 表示固定在左侧
     * 
     * @param {Function} renderHeader - 列标题 Label 区域渲染使用的 Function
     * 
     * @param {boolean | 'custom'} sortable - 对应列是否可以排序，如果设置为 'custom'，则代表用户希望远程排序，需要监听 Table 的 sort-change 事件
     * 
     * @param {Function} sortMethod - 指定数据按照哪个属性进行排序，仅当 sortable 设置为 true 的时候有效。应该如同 Array.sort 那样返回一个 Number
     * 
     * @param {Function | string | object} sortBy - 指定数据按照哪个属性进行排序，仅当 sortable 设置为 true 且没有设置 sort-method 的时候有效。如果 sort-by 为数组，则先按照第 1 个属性排序，如果第 1 个相等，再按照第 2 个排序，以此类推
     * 
     * @param {object} sortOrders - 数据在排序时所使用排序策略的轮转顺序，仅当 sortable 为 true 时有效。需传入一个数组，随着用户点击表头，该列依次按照数组中元素的顺序进行排序
     * 
     * @param {boolean} resizable - 对应列是否可以通过拖动改变宽度（需要在 el-table 上设置 border 属性为真）
     * 
     * @param {function} formatter - 用来格式化内容
     * 
     * @param {boolean | object} showOverflowTooltip - 当内容过长被隐藏时显示 tooltip
     * 
     * @param {'left' | 'center' | 'right'} align - 对齐方式
     * 
     * @param {'left' | 'center' | 'right'} headerAlign - 表头对齐方式，若不设置该项，则使用表格的对齐方式
     * 
     * @param {string} className - 列的 className
     * 
     * @param {string} labelClassName - 当前列标题的自定义类名
     * 
     * @param {Function} selectable - 仅对 type='selection' 的列有效，类型为 Function，Function 的返回值用来决定这一行的 CheckBox 是否可以勾选
     * 
     * @param {boolean} reserveSelection - 数据刷新后是否保留选项，仅对 type='selection' 的列有效，请注意，需指定 row-key 来让这个功能生效。
     * 
     * @param {array} filters - 数据过滤的选项，数组格式，数组中的元素需要有 text 和 value 属性。
     * 
     * @param {string} filterPlacement - 过滤弹出框的定位
     * 
     * @param {string} filterClassName - 过滤弹出框的 className
     * 
     * @param {boolean} filterMultiple - 数据过滤的选项是否多选
     * 
     * @param {function} filterMethod - 数据过滤使用的方法，如果是多选的筛选项，对每一条数据会执行多次，任意一次返回 true 就会显示。
     * 
     * @param {object} filteredValue - 选中的数据过滤项，如果需要自定义表头过滤的渲染方式，可能会需要此属性。
     * 
     * @param {Function} tooltipFormatter - 使用 show-overflow-tooltip 时自定义 tooltip 内容
     */
    interface ColumnConfig {
        type?: 'selection' | 'index' | 'expand'
        index?: number | Function
        label?: string
        columnKey?: string
        prop?: string
        width?: string | number
        minWidth?: string | number
        fixed?: boolean | 'left' | 'right'
        renderHeader?: Function
        sortable?: boolean | 'custom'
        sortMethod?: Function
        sortBy?: Function | string | object
        sortOrders?: string[]
        resizable?: boolean
        formatter?: Function
        showOverflowTooltip?: boolean | object
        align?: 'left' | 'center' | 'right'
        headerAlign?: 'left' | 'center' | 'right'
        className?: string
        labelClassName?: string
        selectable?: Function
        reserveSelection?: boolean
        filters?: any[]
        filterPlacement?: string
        filterClassName?: string
        filterMultiple?: boolean
        filterMethod?: Function
        filteredValue?: any[]
        tooltipFormatter?: Function
    }

}
