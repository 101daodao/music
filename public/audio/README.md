# 音频文件目录

此目录用于存放备用音频文件，当无法获取在线音频URL时使用。

## 文件说明

- `demo.mp3` - 默认备用音频文件（需要添加）

## 使用场景

1. 当API无法获取歌曲播放URL时
2. 当网络请求失败时
3. 当音频URL无效时

## 配置

备用音频配置在 `src/config/audio.js` 中：

```javascript
fallbackAudios: [
  {
    id: 'demo-1',
    title: '示例音频',
    artist: '网易云音乐',
    album: '测试专辑',
    cover: 'https://picsum.photos/200/200?demo1',
    url: '/audio/demo.mp3', // 对应此目录下的文件
    duration: 180
  }
]
```

## 注意事项

- 请确保音频文件格式为支持的格式（mp3, wav, ogg, m4a, aac）
- 音频文件不宜过大，建议控制在5MB以内
- 可以添加多个备用音频文件，系统会轮换使用