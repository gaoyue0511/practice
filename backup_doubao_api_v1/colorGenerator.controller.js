import { generateColors } from '../services/colorGenerator.doubao.js';

const ColorGeneratorController = {
    generateColors: async (req, res) => {
        try {
            console.log('收到配色请求，请求体:', JSON.stringify(req.body));
            const { style, colorCount = 4 } = req.body;

            if (!style) {
                return res.status(400).json({
                    code: 400,
                    message: '请输入设计风格关键词'
                });
            }

            console.log('生成配色方案:', { style, colorCount });

            const schemes = await generateColors(style, colorCount);

            const result = schemes.map((scheme) => ({
                colors: scheme.colors.map(hex => ({ hex }))
            }));

            res.json({
                code: 200,
                message: '配色生成成功',
                data: result
            });

        } catch (error) {
            console.error('生成配色失败:', error.message);
            res.status(500).json({
                code: 500,
                message: '服务器内部错误',
                error: error.message
            });
        }
    },

    getStyles: async (req, res) => {
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
    }
};

export default ColorGeneratorController;