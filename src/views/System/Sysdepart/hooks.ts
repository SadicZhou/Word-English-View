import { findNodes } from "@/service/depart"
import { ref } from "vue"

export const useDepartment = () => {
    const tableData = ref<any[]>([])
    const loading = ref<boolean>(false)
    const columns = ref<any[]>([
        {
            prop: "name",
            label: "部门名称",
            config: {
                width: 200
            }
        },
        {
            prop: "sortValue",
            label: "排序",
            config: {
                width: 80
            }
        },
        {
            prop: "status",
            label: "状态",
            config: {
                width: 100,
                type: "tag",
                tagMap: {
                    0: { type: "success", text: "正常" },
                    1: { type: "danger", text: "停用" }
                }
            }
        },
        {
            prop: "remark",
            label: "描述",
            config: {
                width: 200
            }
        },
        {
            prop: "createTime",
            label: "创建时间",
            config: {
                width: 180
            }
        },

    ])
    const total = ref<number>(0)
    const tableConfig = ref<any>({})

    /**
     * 获取顶级部门数据
     */
    const getTableData = async () => {
        loading.value = true
        try {
            const res = await findNodes(0)
            tableData.value = res.data
            console.log(tableData.value, 'departmentData')
        } catch (error) {
            console.error('获取部门数据失败:', error)
        } finally {
            loading.value = false
        }
    }

    /**
     * 懒加载子部门数据
     */
    const load = async (row: any, treeNode: any, resolve: any) => {
        try {
            const res = await findNodes(row.id)
            resolve(res.data)
        } catch (error) {
            console.error('加载子部门失败:', error)
            resolve([])
        }
    }

    return {
        tableData,
        loading,
        columns,
        total,
        tableConfig,
        getTableData,
        load
    }
}
