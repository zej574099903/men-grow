# 铁炼计划 API 文档

## 基本信息

- 基础URL: `http://10.30.17.9:3000`
- 所有POST请求的Content-Type均为: `application/json`
- 认证方式: Bearer Token (JWT)

## 身份验证 API

### 注册用户

- **URL**: `/auth/register`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "example",
    "password": "password123",
    "nickname": "示例用户",
    "soldierType": "侦察兵-80s" // 可选值: "侦察兵-80s", "炮兵-90s", "装甲兵-00s"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "_id": "用户ID",
    "username": "example",
    "nickname": "示例用户",
    "soldierType": "侦察兵-80s",
    "createdAt": "2023-07-01T06:00:00.000Z",
    "updatedAt": "2023-07-01T06:00:00.000Z"
  }
  ```

### 用户登录

- **URL**: `/auth/login`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "example",
    "password": "password123"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "userId": "用户ID",
    "username": "example",
    "access_token": "JWT令牌"
  }
  ```

### 获取用户信息

- **URL**: `/auth/profile`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {access_token}`
- **成功响应** (200):
  ```json
  {
    "userId": "用户ID",
    "username": "example"
  }
  ```

## 用户管理 API

### 获取用户列表

- **URL**: `/users`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {access_token}`
- **成功响应** (200):
  ```json
  [
    {
      "_id": "用户ID",
      "username": "example",
      "nickname": "示例用户",
      "soldierType": "侦察兵-80s",
      "createdAt": "2023-07-01T06:00:00.000Z",
      "updatedAt": "2023-07-01T06:00:00.000Z"
    }
  ]
  ```

### 获取单个用户

- **URL**: `/users/{id}`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {access_token}`
- **成功响应** (200):
  ```json
  {
    "_id": "用户ID",
    "username": "example",
    "nickname": "示例用户",
    "soldierType": "侦察兵-80s",
    "createdAt": "2023-07-01T06:00:00.000Z",
    "updatedAt": "2023-07-01T06:00:00.000Z"
  }
  ```

### 更新用户信息

- **URL**: `/users/{id}`
- **方法**: `PUT`
- **请求头**: `Authorization: Bearer {access_token}`
- **请求体**:
  ```json
  {
    "nickname": "更新的昵称",
    "soldierType": "炮兵-90s"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "_id": "用户ID",
    "username": "example",
    "nickname": "更新的昵称",
    "soldierType": "炮兵-90s",
    "createdAt": "2023-07-01T06:00:00.000Z",
    "updatedAt": "2023-07-01T06:00:00.000Z"
  }
  ```

## 训练计划 API

### 获取所有训练计划

- **URL**: `/trainings/plans`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {access_token}`
- **成功响应** (200):
  ```json
  [
    {
      "_id": "计划ID",
      "name": "新兵体能特训",
      "description": "适合初级训练者的基础军体拳和体能锻炼",
      "level": "beginner",
      "soldierType": "步兵",
      "duration": 14,
      "drills": [
        {
          "day": 1,
          "activities": [
            {
              "name": "基础军姿站立",
              "description": "保持军姿站立10分钟",
              "duration": 10,
              "type": "posture"
            }
            // 更多活动...
          ]
        }
        // 更多训练日...
      ],
      "createdAt": "2023-07-01T06:00:00.000Z",
      "updatedAt": "2023-07-01T06:00:00.000Z"
    }
  ]
  ```

### 获取单个训练计划

- **URL**: `/trainings/plans/{id}`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {access_token}`
- **成功响应** (200):
  ```json
  {
    "_id": "计划ID",
    "name": "新兵体能特训",
    "description": "适合初级训练者的基础军体拳和体能锻炼",
    "level": "beginner",
    "soldierType": "步兵",
    "duration": 14,
    "drills": [
      // 训练细节...
    ],
    "createdAt": "2023-07-01T06:00:00.000Z",
    "updatedAt": "2023-07-01T06:00:00.000Z"
  }
  ```

## 训练记录 API

### 创建训练记录

- **URL**: `/trainings/logs`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer {access_token}`
- **请求体**:
  ```json
  {
    "userId": "用户ID",
    "planId": "计划ID",
    "date": "2023-07-01T06:00:00.000Z",
    "duration": 30,
    "completed": true,
    "notes": "完成了所有训练项目，感觉良好"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "_id": "记录ID",
    "userId": "用户ID",
    "planId": "计划ID",
    "date": "2023-07-01T06:00:00.000Z",
    "duration": 30,
    "completed": true,
    "notes": "完成了所有训练项目，感觉良好",
    "createdAt": "2023-07-01T06:00:00.000Z",
    "updatedAt": "2023-07-01T06:00:00.000Z"
  }
  ```

### 获取用户训练记录

- **URL**: `/trainings/logs/user/{userId}`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {access_token}`
- **成功响应** (200):
  ```json
  [
    {
      "_id": "记录ID",
      "userId": "用户ID",
      "planId": {
        "_id": "计划ID",
        "name": "新兵体能特训"
      },
      "date": "2023-07-01T06:00:00.000Z",
      "duration": 30,
      "completed": true,
      "notes": "完成了所有训练项目，感觉良好",
      "createdAt": "2023-07-01T06:00:00.000Z",
      "updatedAt": "2023-07-01T06:00:00.000Z"
    }
  ]
  ```

## 成就系统 API

### 获取所有勋章规则

- **URL**: `/achievements/medals`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {access_token}`
- **成功响应** (200):
  ```json
  [
    {
      "_id": "规则ID",
      "medalName": "新兵铁人",
      "description": "完成10次训练计划",
      "condition": {
        "type": "totalCount",
        "target": 10
      },
      "imageUrl": "/assets/medals/iron-rookie.png"
    }
  ]
  ```

### 获取用户已获得的勋章

- **URL**: `/achievements/user/{userId}`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {access_token}`
- **成功响应** (200):
  ```json
  [
    {
      "_id": "成就ID",
      "userId": "用户ID",
      "medalName": "新兵铁人",
      "awardedDate": "2023-07-01T06:00:00.000Z",
      "createdAt": "2023-07-01T06:00:00.000Z",
      "updatedAt": "2023-07-01T06:00:00.000Z"
    }
  ]
  ```

### 检查并更新用户成就

- **URL**: `/achievements/check/{userId}`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer {access_token}`
- **成功响应** (200):
  ```json
  [
    {
      "_id": "成就ID",
      "userId": "用户ID",
      "medalName": "新兵铁人",
      "awardedDate": "2023-07-01T06:00:00.000Z",
      "createdAt": "2023-07-01T06:00:00.000Z",
      "updatedAt": "2023-07-01T06:00:00.000Z"
    }
  ]
  ```

## 健康检查 API

### 系统状态检查

- **URL**: `/health`
- **方法**: `GET`
- **成功响应** (200):
  ```json
  {
    "status": "ok",
    "timestamp": "2023-07-01T06:00:00.000Z",
    "services": {
      "database": {
        "status": "up",
        "type": "mongodb"
      },
      "app": {
        "status": "up",
        "version": "0.0.1"
      }
    }
  }
  ```
