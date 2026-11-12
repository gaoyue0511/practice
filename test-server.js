import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/test', (req, res) => {
    console.log('收到请求:', JSON.stringify(req.body));
    res.json({ code: 200, message: '成功', data: req.body });
});

app.post('/api/colors', (req, res) => {
    console.log('收到配色请求:', JSON.stringify(req.body));
    const { style } = req.body;
    
    const schemes = [];
    for (let i = 0; i < 20; i++) {
        const colors = [];
        for (let j = 0; j < 4; j++) {
            colors.push('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase());
        }
        schemes.push({ colors });
    }
    
    const result = schemes.map(s => ({ colors: s.colors.map(c => ({ hex: c })) }));
    console.log('返回配色数量:', result.length);
    res.json({ code: 200, message: '配色生成成功', data: result });
});

app.listen(PORT, () => {
    console.log(`测试服务器启动: http://localhost:${PORT}`);
});
