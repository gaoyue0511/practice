import axios from 'axios';

const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY;
const DOUBAO_API_ENDPOINT = process.env.DOUBAO_API_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const DOUBAO_MODEL = 'doubao-seed-2-0-mini-260428';

const colorCache = new Map();
const CACHE_EXPIRE = 10 * 60 * 1000;

const SYSTEM_PROMPT = '根据风格生成20套配色方案，每套4个十六进制颜色，只返回JSON格式:{"schemes":[{"colors":["#RRGGBB"]}]}';

async function generateColorsWithDoubao(style, colorCount = 4, schemeCount = 20) {
    const cacheKey = `${style}_${colorCount}`;
    const cached = colorCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRE) {
        console.log('使用缓存');
        return cached.data;
    }

    const userPrompt = `${style}风格，生成配色JSON`;

    try {
        console.log(`调用豆包API生成${schemeCount}套配色...`);

        const response = await axios.post(
            DOUBAO_API_ENDPOINT,
            {
                model: DOUBAO_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                stream: false,
                max_tokens: 800,
                temperature: 0.7,
                top_p: 0.9,
                thinking_type: 'disabled',
                max_output_tokens: 800
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DOUBAO_API_KEY}`
                },
                timeout: 45000
            }
        );

        const content = response.data.choices[0].message.content;
        console.log('API响应:', content.trim().substring(0, 200));

        let jsonStr = content.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7);
        }
        if (jsonStr.endsWith('```')) {
            jsonStr = jsonStr.substring(0, jsonStr.length - 3);
        }

        const parsed = JSON.parse(jsonStr);
        let schemes = parsed.schemes || parsed.colors || [];

        if (!Array.isArray(schemes)) {
            schemes = [schemes];
        }

        const result = schemes.slice(0, schemeCount).map((scheme) => {
            let colors = [];
            if (scheme.colors && Array.isArray(scheme.colors)) {
                colors = scheme.colors.map(c => {
                    const hex = c.startsWith('#') ? c.toUpperCase() : `#${c}`.toUpperCase();
                    return hex.match(/^#[0-9A-F]{6}$/) ? hex : null;
                }).filter(Boolean);
            } else if (Array.isArray(scheme)) {
                colors = scheme.map(c => {
                    const hex = c.startsWith('#') ? c.toUpperCase() : `#${c}`.toUpperCase();
                    return hex.match(/^#[0-9A-F]{6}$/) ? hex : null;
                }).filter(Boolean);
            }
            return { colors: colors.slice(0, colorCount) };
        }).filter(s => s.colors.length === colorCount);

        if (result.length > 0) {
            colorCache.set(cacheKey, { data: result, timestamp: Date.now() });
            console.log(`成功生成${result.length}套配色方案`);
            return result;
        }

        throw new Error('未生成有效配色');
    } catch (error) {
        console.error('豆包API调用失败:', error.message);
        throw error;
    }
}

export async function generateColors(style, colorCount = 4) {
    return generateColorsWithDoubao(style, colorCount, 20);
}

export async function generateColorsBatch(style, colorCount = 4, batchSize = 20) {
    return generateColorsWithDoubao(style, colorCount, batchSize);
}

export default { generateColors, generateColorsBatch };
