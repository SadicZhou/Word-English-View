import { getCategoryList } from "@/service/product"
import { ref } from "vue"

export const useCategory = () => {
    const tableData = ref<any[]>([])
    const loading = ref<boolean>(false)
    const columns = ref<any[]>([
        {
            prop: "id",
            label: "ID",
            config: {
                type: "index",
                width: 100
            }
        },
        {
            prop: "createTime",
            label: "创建时间",
            config: {
                width: 100
            }
        },
        {
            prop: "updateTime",
            label: "更新时间",
            config: {
                width: 100
            }
        },
        {
            prop: "name",
            label: "名称",
            config: {
                width: 100
            }
        },
        {
            prop: "imgUrl",
            label: "图片",
            config: {
                width: 100
            }
        },
        {
            prop: "status",
            label: "状态",
            config: {
                width: 100
            }
        },
    ])
    const total = ref<number>(0)
    const tableConfig = ref<any>({})
    const getTableData = async () => {
        loading.value = true
        const res = await getCategoryList()
        tableData.value = res.data
        loading.value = false
        console.log(tableData.value, 'tableData')
    }
    const load = async (row: any, treeNode: any, resolve: any) => {
        const res = await getCategoryList(row.id)
        resolve(res.data)
    }
    return { tableData, loading, columns, total, tableConfig, getTableData, load }
}
