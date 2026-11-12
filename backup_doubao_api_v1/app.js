process.env.NODE_OPTIONS = "--openssl-legacy-provider";

process.stdout.setEncoding('utf8');
process.stderr.setEncoding('utf8');

import express from 'express';
import cors from 'cors';
import { generateColors } from './services/colorGenerator.doubao.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.post('/api/color-generator/generate', async (req, res) => {
    try {
        const { style, colorCount = 4 } = req.body;
        
        if (!style) {
            return res.status(400).json({
                code: 400,
                message: '请输入设计风格关键词'
            });
        }

        console.log(`调用豆包API生成${style}风格配色...`);
        const schemes = await generateColors(style, colorCount);

        const response = schemes.map(scheme => ({
            colors: scheme.colors.map(hex => ({ hex }))
        }));

        res.json({
            code: 200,
            message: '配色生成成功',
            data: response
        });

    } catch (error) {
        console.error('生成配色失败:', error.message);
        res.status(500).json({
            code: 500,
            message: '服务器内部错误',
            error: error.message
        });
    }
});

app.get('/api/color-generator/styles', (req, res) => {
    const defaultStyles = [
        '暗黑高级', '商务高级', '莫兰迪', '多巴胺', '赛博朋克',
        '复古', '清新', '暖色', '冷色', '奶油ins',
        '复古港风', '北欧简约', '日落晚霞', '海洋清新',
        '国潮新中式', '轻奢黑金', '美式复古', '法式复古',
        '日系清新', '元气橙黄', '冷淡风', '学院风',
        '机能风', '废土风'
    ];

    res.json({
        code: 200,
        message: '获取风格列表成功',
        data: defaultStyles
    });
});

app.listen(PORT, () => {
    console.log(`后端服务已启动: http://localhost:${PORT}`);
});
