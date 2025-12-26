## ADDED Requirements

### Requirement: 首页轮播图展示
系统应在首页顶部提供轮播图组件，用于展示热门歌曲的封面图片。

#### Scenario: 成功加载轮播图
- **WHEN** 用户访问首页
- **THEN** 系统应自动从 `/toplist/detail` API 获取热门榜单数据
- **AND** 提取前5-8首热门歌曲的封面图片作为轮播图内容
- **AND** 轮播图应显示歌曲标题和歌手信息

#### Scenario: 自动轮播
- **WHEN** 首页加载完成
- **THEN** 轮播图应每隔3秒自动切换到下一张图片
- **AND** 支持循环播放

#### Scenario: 手动切换轮播图
- **WHEN** 用户点击左右箭头按钮
- **THEN** 轮播图应切换到上一张或下一张图片
- **AND** 切换应流畅过渡

#### Scenario: 点击跳转播放
- **WHEN** 用户点击轮播图中的任意一张图片
- **THEN** 系统应调用音乐播放器播放对应的歌曲
- **AND** 播放器应显示歌曲信息（标题、歌手、封面）

## MODIFIED Requirements

### Requirement: 首页数据源
系统应使用API接口获取所有展示数据，不使用任何硬编码的示例数据。

**修改内容**:
- **WHEN** 首页加载时
- **THEN** 推荐音乐区域应通过 `/personalized` API 获取推荐歌单数据
- **AND** 最新音乐区域应通过 `/personalized/newsong` API 获取新歌推荐数据
- **AND** 统计数据区域应基于实际数据计算或显示真实统计值
- **AND** 禁止使用任何硬编码的示例数据（如 `recommendMusic`、`latestMusic` 等静态数组）

#### Scenario: API数据加载失败
- **WHEN** API请求失败或返回错误
- **THEN** 应显示友好的错误提示信息
- **AND** 提供重试按钮让用户可以重新加载数据
- **AND** 不展示任何示例数据