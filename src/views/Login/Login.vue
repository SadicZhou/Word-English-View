<template>
	<div class="page-login">
		<div class="box">
			<div class="logo">
				<img src="@/assets/logo.png" alt="Logo" />
				<div class="name">
					<span>脚印源设后台管理系统</span>
				</div>
			</div>
			<p class="desc">脚印源设</p>
			<div class="form">
				<el-form label-position="top" class="form" :disabled="saving">
					<el-form-item label="用户名">
						<input v-model="form.account" placeholder="请输入用户名" maxlength="20" type="text"
							:readonly="readonly" autocomplete="off" @focus="readonly = false" />
					</el-form-item>

					<el-form-item label="密码">
						<input v-model="form.password" type="password" placeholder="请输入密码" maxlength="20"
							autocomplete="off" />
					</el-form-item>

					<el-form-item label="验证码">
						<div class="row">
							<input
								v-model="form.captcha"
								placeholder="图片验证码"
								maxlength="4"
								@keyup.enter="toLogin"
							/>
							<img class="validateCode" :src="validateCode" alt="">
						</div>
					</el-form-item>

					<div class="op">
						<el-button type="primary" :loading="saving" @click="toLogin">登录</el-button>
					</div>
				</el-form>
			</div>
		</div>
		<img class="bg" src="@/assets/bg.svg" alt="">
		<!-- <a href="https://cool-js.com" class="copyright"> Copyright © COOL </a> -->
	</div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import {valiDateCode } from "@/service/user"
import {useLogin} from "./hooks"
// 状态
const saving = ref(false);
// 避免自动填充
const readonly = ref(true);
// 表单数据
const form = reactive<LOGIN.loginParams>({
	account: 'admin',
	password: '111111',
	codeKey:"",//图片验证码id
	captcha:"",//图片验证码值

});
//验证码图片
let validateCode = ref('')
//mounted
onMounted(()=>{
	getValiDateCode()
})
//获取图片验证码
async function getValiDateCode() {
	try {
		const res = await valiDateCode()
		console.log(res,'图形验证码')
		const {codeValue,codeKey} = res.data
		validateCode.value = codeValue
		form.codeKey = codeKey
	} catch (error) {
		console.log(error)
		throw error
	}
}
// 登录
async function toLogin() {
	useLogin(form,saving)
}
</script>


<style lang="scss" scoped>
$color: #2c3142;

.page-login {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	width: 100%;
	position: relative;
	background-color: #fff;
	color: $color;

	.bg {
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		width: 90%;
		pointer-events: none;
		transform: rotate(180deg) scaleY(-1);

		.cl-svg {
			height: 100%;
			width: 100%;
			fill: $color;
		}
	}

	.copyright {
		position: absolute;
		bottom: 15px;
		left: 0;
		text-align: center;
		width: 100%;
		color: #666;
		font-size: 14px;
	}

	.box {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 50%;
		position: absolute;
		right: 0;
		top: 0;
		z-index: 9;

		.logo {
			height: 50px;
			margin-bottom: 20px;
			display: flex;
			align-items: center;

			img {
				height: 46px;
				background-color: $color;
				border-radius: 50px;
				border: 3px solid $color;
				margin-right: 10px;
			}

			span {
				display: inline-block;
				font-size: 38px;
				font-weight: bold;
				line-height: 1;
				letter-spacing: 3px;

				&:nth-child(6) {
					animation: dou 1s infinite linear;
				}
			}
		}

		.desc {
			font-size: 15px;
			letter-spacing: 1px;
			margin-bottom: 50px;
		}

		.form {
			width: 300px;

			:deep(.el-form) {
				.el-form-item {
					margin-bottom: 20px;
				}

				.el-form-item__label {
					padding-left: 5px;
				}

				input {
					height: 45px;
					width: 100%;
					box-sizing: border-box;
					font-size: 17px;
					border: 0;
					border-radius: 0;
					background-color: #f8f8f8;
					padding: 0 15px;
					border-radius: 6px;
					position: relative;

					&:-webkit-autofill {
						box-shadow: none;
						-webkit-box-shadow: 0 0 0 1000px #f8f8f8 inset;
						box-shadow: 0 0 0 1000px #f8f8f8 inset;
					}

					&::placeholder {
						font-size: 14px;
					}
				}

				.row {
					display: flex;
					align-items: center;
					width: 100%;
					position: relative;
					.validateCode{
						position: absolute;
						right: 2.5px;
						top: 2.5px;
						width: 145px;
						height: 40px;
						border-radius: 6px;
						cursor:pointer;
					}
				}
			}
		}

		.op {
			display: flex;
			justify-content: center;
			margin-top: 40px;

			:deep(.el-button) {
				height: 45px;
				width: 100%;
				font-size: 15px;
				border-radius: 6px;
				letter-spacing: 1px;
			}
		}
	}
}

@media screen and (max-width: 1024px) {
	.page-login {
		.box {
			width: 100%;
		}
	}
}
</style>
