## ADDED Requirements

### Requirement: 轮播图展示推荐新音乐
系统应在首页顶部提供轮播图组件，专门用于展示推荐新音乐的封面图片。

#### Scenario: 成功加载推荐新音乐轮播图
- **WHEN** 用户访问首页
- **THEN** 系统应自动从 `/personalized/newsong` API 获取推荐新音乐数据
- **AND** 提取前首歌的封面图片作为轮播图内容（默认10首）
- **AND** 轮播图应显示歌曲标题和歌手信息

#### Scenario: 移除播放按钮装饰
- **WHEN** 用户悬停或点击轮播图
- **THEN** 不显示任何播放按钮装饰元素
- **AND** 保持界面简洁，仅展示歌曲封面和基本信息

## MODIFIED Requirements

### Requirement: 轮播图数据源
轮播图应使用推荐新音乐API获取数据，而非榜单数据。

**修改内容**:
- **WHEN** 轮播图组件初始化时
- **THEN** 应调用 `/personalized/newsong` API获取推荐新音乐数据
- **AND** limit参数设置为5-10，控制轮播图数量
- **AND** 移除原有的 `/toplist/detail` API调用

#### Scenario: API数据格式化
- **WHEN** 收到推荐新音乐API响应
- **THEN** 应将歌曲数据格式为统一格式：`{ id, title, artist, cover }`
- **AND** 确保所有必需字段都正确映射