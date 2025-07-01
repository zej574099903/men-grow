# 铁炼计划 - 军旅健身应用

<p align="center">
  <img src="https://placeholder-for-logo-url.com/logo.png" alt="铁炼计划" width="200" />
</p>

## 项目介绍

**铁炼计划**是一款军旅风格的健身应用，专注于提供军事化训练体验。应用结合了军事训练元素与现代健身理念，为用户提供严格、系统的训练计划与记录系统。

### 核心功能

- **用户系统**：手机号注册/登录，个人资料（昵称/兵种选择）
- **训练中心**：新兵连"三个100"计划，军体拳基础动作库，跑步/徒步计时器
- **数据记录**：训练完成打卡，周度数据统计
- **成就系统**：军事主题勋章

## 技术架构

本项目采用三端分离架构：

- **移动端**：UniApp（Vue3语法）
- **后端**：NestJS (Node.js) + MongoDB
- **管理后台**：React + Ant Design Pro

### 系统架构图

```
+---------------+       +---------------+       +---------------+
|               |       |               |       |               |
|  移动端应用   | <---> |    后端服务   | <---> |   管理后台    |
| (UniApp+Vue3) |       | (NestJS+MongoDB)|     | (React+Antd) |
|               |       |               |       |               |
+---------------+       +---------------+       +---------------+
```

## 安装与运行

### 环境要求

- Node.js v18+
- MongoDB v5.0+
- HBuilderX（用于UniApp开发）

### 后端服务 (men_serve)

```bash
# 进入后端目录
cd men_serve

# 安装依赖
npm install

# 开发模式运行
npm run start:dev

# 生产模式构建
npm run build

# 生产模式运行
npm run start:prod
```

### 移动端应用 (men_app)

推荐使用HBuilderX打开项目进行开发：

1. 在HBuilderX中打开`men_app`目录
2. 安装相关插件和依赖
3. 点击运行到浏览器/模拟器/真机

如使用命令行：

```bash
# 进入移动端目录
cd men_app

# 安装依赖(如果有package.json)
npm install

# HBuilderX CLI构建
```

### 管理后台 (men_admin)

```bash
# 进入管理后台目录
cd men_admin

# 安装依赖
npm install

# 开发模式运行
npm run start

# 构建生产版本
npm run build
```

## 项目目录结构

```
men-grow/
├── men_app/              # 移动端应用(UniApp)
│   ├── pages/            # 页面文件
│   ├── static/           # 静态资源
│   ├── App.vue           # 应用入口
│   └── ...               
│
├── men_serve/            # 后端服务(NestJS)
│   ├── src/              # 源代码
│   ├── test/             # 测试文件
│   └── ...               
│
├── men_admin/            # 管理后台(React)
│   ├── src/              # 源代码
│   ├── public/           # 静态文件
│   └── ...               
│
└── 铁炼计划开发进度表.md  # 开发计划与进度
```

## API文档

后端API文档基于Swagger自动生成，启动后端服务后可通过以下地址访问：

- 开发环境：http://localhost:3000/api/docs

## 核心数据模型

### 用户模型

```typescript
// 用户集合
const UserSchema = {
  phone: { type: String, unique: true }, // 登录账号
  nickname: String,
  soldierType: {
    type: String,
    enum: ["侦察兵-80s", "炮兵-90s", "装甲兵-00s"], // 预设历史兵种
  },
};
```

### 训练记录模型

```typescript
// 训练记录集合
const TrainingLogSchema = {
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  planId: String,
  drill: String,
  completed: Number, // 完成量
  duration: Number, // 耗时(秒)
  date: { type: Date, default: Date.now },
};
```

## 合规注意事项

本应用在设计上遵循以下合规原则：

- 兵种选择仅包含**历史兵种**（如"侦察兵-1980s"），禁用现役部队信息
- 军体拳教程标注"**民用简化版**"
- 禁止存储用户地理位置
- 成就名称使用**虚拟勋章**（如"荒野先锋"替代"侦察兵标兵"）

## 开发团队

- 产品经理：[姓名]
- 前端开发：[姓名]
- 后端开发：[姓名]
- UI设计：[姓名]

## 开源协议

[待定] - 建议使用MIT或Apache 2.0
