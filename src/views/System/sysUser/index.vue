<template>
  <div class="content">
    <el-card :body-style="cardPad" style="margin-top: 10px">
      <el-row>
        <div class="keyword">关键字</div>
        <el-col :span="4">
          <el-input
            v-model="searchForm.keyword"
            style="width: 95%"
            placeholder="请输入关键字"
            :prefix-icon="Search"
          />
        </el-col>
        <div class="keyword">创建时间</div>
        <el-col :span="4">
          <el-config-provider :locale="lang">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="datetimerange"
              range-separator="To"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            />
          </el-config-provider>
        </el-col>
      </el-row>
      <el-row style="margin-top: 10px">
        <el-col :span="2">
          <el-button
            type="success"
            :icon="Search"
            size="small"
            @click="getUserList()"
            >搜索</el-button
          >
        </el-col>
      </el-row>
    </el-card>
    <el-card :body-style="cardPad" class="mt-10">
      <el-row>
        <el-col :span="2">
          <el-button size="small" type="primary" :icon="Plus" @click="addClick"
            >新增</el-button
          >
        </el-col>
      </el-row>
    </el-card>
    <div class="conheight">
      <el-table :data="tableData" v-bind="{ ...tableConfig }">
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="userName" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="avatar" label="头像">
          <template #default="{ row }">
            <img class="avatar" :src="row.avatar" alt="" />
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机" />
        <el-table-column prop="description" label="备注" />
        <el-table-column fixed="right" label="操作">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="updateClick(row)"
            >
              修改
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="deleteClick(row)"
              >删除</el-button
            >
            <el-button
              link
              type="primary"
              size="small"
              @click="assigningRoles(row)"
              >分配角色</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="page">
      <el-pagination
        size="small"
        background
        layout="prev, pager, next"
        :total="totalNum"
        class="mt-4"
        :page-sizes:="pageNationConfig.pageSizes"
        v-model:current-page="current"
      />
    </div>
  </div>
  <!-- 新增/修改用户-->
  <el-dialog v-model="dialogShow" width="500">
    <template #header>
      <div class="titStyle">{{ title }}</div>
    </template>
    <el-form :model="user" v-bind="{ ...formConfig }">
      <el-form-item label="头像" v-bind="{ ...formItemConfig }">
        <el-upload
          class="avatar-uploader"
          action="http://localhost:3000/admin/system/file/upload"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="user.avatar" :src="user.avatar" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="用户名" v-bind="{ ...formItemConfig }">
        <el-input v-model="user.userName" autocomplete="off" />
      </el-form-item>
      <el-form-item label="昵称" v-bind="{ ...formItemConfig }">
        <el-input v-model="user.name" autocomplete="off" />
      </el-form-item>
      <el-form-item
        v-if="title == '新增用户'"
        label="密码"
        v-bind="{ ...formItemConfig }"
      >
        <el-input
          type="password"
          show-password
          v-model="user.password"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item label="手机号码" v-bind="{ ...formItemConfig }">
        <el-input v-model="user.phone" autocomplete="off" />
      </el-form-item>
      <el-form-item label="状态" v-bind="{ ...formItemConfig }">
        <el-select v-model="user.status" placeholder="请设置用户状态">
          <el-option label="正常" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="描述" v-bind="{ ...formItemConfig }">
        <el-input
          v-model="user.description"
          autocomplete="off"
          :rows="2"
          type="textarea"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div>
        <el-button @click="cancelHandler">取消</el-button>
        <el-button type="primary" @click="confirmHandler()"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 分配角色 -->
  <el-dialog v-model="assainRoleDialog" width="500">
    <template #header>
      <div class="titStyle">{{ title }}</div>
    </template>
    <el-form :model="userRole">
      <el-form-item label="用户名" v-bind="{ ...formItemConfig }">
        <el-input v-model="userRole.userName" autocomplete="off" disabled />
      </el-form-item>
      <el-form-item label="角色" v-bind="{ ...formItemConfig }">
        <el-checkbox-group v-model="userRole.roleList">
          <el-checkbox
            v-for="(item) in boxList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          />
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div>
        <el-button @click="assignRoleCancelHandler">取消</el-button>
        <el-button type="primary" @click="assignRoleConfirmHandler">
          提交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Search, Plus } from "@element-plus/icons-vue";
import { onMounted, reactive, ref } from "vue";
import {
  updateSysUser,
  userList,
  saveSysUser,
  deleteUserById,
  doAssign,
} from "@/service/user";
import { pageNationConfig } from "@/config/pageConfig";
import { lang } from "@/config/lang";
import { cardPad } from "@/config/cardConfig";
import { formConfig, formItemConfig } from "@/config/formConfig";
import { ElMessage, ElMessageBox } from "element-plus";
import { tableConfig } from "@/config/tableConfig";
import { findAllRoles } from "@/service/role";
import { Code } from "@/config/code";
import { HOOKS } from "@/hooks";

const handleAvatarSuccess = (response: RES.response<string>) => {
  user.avatar = response.data;
};
const beforeAvatarUpload = () => {};
const searchForm = reactive({
  keyword: "",
  dateRange: [],
});
let title = ref("新增");
let tableData = ref<SYSTEM.user[]>([]);
let totalNum = ref(0);
let current = ref(1);
let dialogShow = ref(false);
let user = reactive<SYSTEM.user>({
  id: "",
  avatar: "",
  userName: "",
  name: "",
  phone: "",
  status: 0,
  description: "",
  password: "",
});
let boxList: SYSTEM.role[] = [];
let userRole = reactive({
  userName: "",
  roleList: <number[]>[],
  userId: 0,
});
const getUserList = async () => {
  try {
    const { data } = await userList({
      current: 1,
      limit: 10,
      keyword: searchForm.keyword,
      createTimeBegin: searchForm.dateRange[0],
      createTimeEnd: searchForm.dateRange[1],
    });
    const { list, total, pageNum } = data;
    tableData.value = list;
    totalNum.value = total;
    current.value = pageNum;
    console.log(tableData, "tableData");
  } catch (error) {
    console.log(error);
    return [];
  }
};

const updateClick = (row: SYSTEM.user) => {
  title.value = "修改用户";
  user.id = row.id;
  user.avatar = row.avatar;
  user.description = row.description;
  user.userName = row.userName;
  user.name = row.name;
  user.phone = row.phone;
  user.status = row.status;
  dialogShow.value = true;
};
const restForm = () => {
  user.id = "";
  user.avatar = "";
  user.userName = "";
  user.name = "";
  user.phone = "";
  user.status = 1;
  user.description = "";
  user.password = "";
  (userRole.roleList = []), (userRole.userName = "");
  boxList = [];
};
let assainRoleDialog = ref(false);
const confirmHandler = async () => {
  try {
    if (title.value == "修改用户") {
      const res = await updateSysUser(user);
      console.log("res");
      if (
        res.code == Code.SUCCESS_CODE &&
        res.message ==Code.SUCCESS
      ) {
        dialogShow.value = false;
        getUserList();
        ElMessage({
          message: res.message,
          type: "success",
        });
        restForm();
      } else {
        ElMessage({
          message: res.message,
          type: "warning",
        });
      }
    }
    if (title.value == "新增用户") {
      const res = await saveSysUser(user);
      console.log("res");
      if (res.code == Code.SUCCESS_CODE && res.message ==Code.SUCCESS) {
        dialogShow.value = false;
        getUserList();
        ElMessage({
          message: res.message,
          type: "success",
        });
        restForm();
      } else {
        ElMessage({
          message: res.message,
          type: "warning",
        });
      }
    }
  } catch (error) {
    console.warn(error, "err");
    HOOKS.useError()
  }
};
const cancelHandler = () => {
  dialogShow.value = false;
  restForm();
};
const addClick = () => {
  title.value = "新增用户";
  restForm();
  dialogShow.value = true;
};
const deleteClick = (row: SYSTEM.user) => {
  ElMessageBox.confirm("确定要删除该用户吗", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const res = await deleteUserById({ id: row.id as string });
      if (
        res.code == Code.SUCCESS_CODE &&
        res.message == Code.SUCCESS
      ) {
        ElMessage({
          type: "success",
          message: "删除成功",
        });
        getUserList();
      }
    })
    .catch(() => {
      HOOKS.useError()
    });
};
const assigningRoles = async (row: SYSTEM.user) => {
  try {
    const { data } = await findAllRoles({
      id: String(row.id),
    });
    console.log(data, "====>rolelist");
    const { roleList, userRoleList } = data;
    boxList = roleList;
    userRole.roleList = userRoleList.map((item) => {
      return item.roleId;
    });
    title.value = "分配角色";
    userRole.userName = row.userName;
    userRole.userId = row.id as number;
    assainRoleDialog.value = true;
  } catch (error) {
    console.warn(error);
    HOOKS.useError()
  }
};
const assignRoleCancelHandler = () => {
  assainRoleDialog.value = false;
  restForm();
};
const assignRoleConfirmHandler = async () => {
  try {
    const { code, message } = await doAssign({
      userId: userRole.userId,
      roleIdList: userRole.roleList,
    });
    if (code == Code.SUCCESS_CODE && message == Code.SUCCESS) {
      ElMessage({
        type: "success",
        message: "分配成功",
      });
      assainRoleDialog.value = false
      restForm()
    } else {
      ElMessage({
        message: message,
        type: "warning",
      });
    }
  } catch (error) {
    console.warn(error)
    HOOKS.useError()
  }
};
onMounted(() => {
  getUserList();
});
</script>
<style scoped lang="scss">
.content {
  width: 99%;
  .keyword {
    font-weight: bold;
    font-size: 15px;
    color: #909399;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 10px;
  }
  .avatar {
    width: 80px;
    height: 80px;
  }
}
.avatar-uploader .el-upload {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.el-icon.avatar-uploader-icon {
  border: 1px dashed #8c939d !important;
  border-radius: 6px;
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  text-align: center;
}
</style>
