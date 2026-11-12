import axios from 'axios';

const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY;
const DOUBAO_API_ENDPOINT = process.env.DOUBAO_API_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const DOUBAO_MODEL = 'doubao-seed-1-6-flash-250828';

const colorCache = new Map();
const CACHE_EXPIRE = 10 * 60 * 1000;

const SYSTEM_PROMPT = '只输出15套配色，每套4个十六进制色值，不要任何其他文字或说明。格式：#XXXXXX #XXXXXX #XXXXXX #XXXXXX，换行分隔每套';

async function generateColorsWithDoubao(style, colorCount = 4, schemeCount = 15) {
    const cacheKey = style + '_' + colorCount;
    const cached = colorCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRE) {
        console.log('使用缓存');
        return cached.data;
    }

    const userPrompt = style + '风格';

    const startTime = Date.now();
    const step1_receiveRequest = startTime;

    try {
        console.log('[计时] 1. 收到请求: ' + new Date().toISOString());

        console.log('[计时] 2. 开始调用豆包API...');
        const step2_beforeApiCall = Date.now();
        console.log('[计时]    请求准备耗时: ' + (step2_beforeApiCall - step1_receiveRequest) + 'ms');

        const response = await axios.post(
            DOUBAO_API_ENDPOINT,
            {
                model: DOUBAO_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                stream: false,
                max_tokens: 1500,
                temperature: 0.5,
                top_p: 0.8,
                thinking_type: 'disabled',
                max_output_tokens: 1500
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + DOUBAO_API_KEY
                },
                timeout: 90000
            }
        );

        const step3_apiResponse = Date.now();
        console.log('[计时] 3. API响应返回: ' + new Date().toISOString());
        console.log('[计时]    API调用耗时: ' + (step3_apiResponse - step2_beforeApiCall) + 'ms');

        const requestId = response.data.id || '未知';
        console.log('[计时]    API请求ID: ' + requestId);

        const content = response.data.choices[0].message.content;
        console.log('[计时]    API响应长度: ' + content.length + '字符');
        console.log('[计时]    API原始响应: ' + content.substring(0, 200) + '...');

        const step4_jsonParsed = Date.now();
        console.log('[计时] 4. 开始解析数据: ' + (step4_jsonParsed - step3_apiResponse) + 'ms');

        const result = parseColors(content, colorCount, schemeCount);

        const step5_dataProcessed = Date.now();
        console.log('[计时] 5. 数据处理完成: ' + (step5_dataProcessed - step4_jsonParsed) + 'ms');

        if (result.length > 0) {
            colorCache.set(cacheKey, { data: result, timestamp: Date.now() });
            console.log('[计时] 6. 成功生成' + result.length + '套配色方案');
        }

        const totalTime = Date.now() - startTime;
        console.log('[计时] ========== 总耗时: ' + totalTime + 'ms ==========');

        return result;
    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error('[计时] 失败，总耗时: ' + totalTime + 'ms');
        console.error('豆包API调用失败:', error.message);
        throw error;
    }
}

function parseColors(content, colorCount, schemeCount) {
    const hexPattern = /#?[0-9A-Fa-f]{6}/g;
    const matches = content.match(hexPattern);
    
    if (!matches) {
        console.log('未找到颜色值');
        return [];
    }

    const colors = matches.map(function(c) {
        return c.startsWith('#') ? c.toUpperCase() : '#' + c.toUpperCase();
    });
    console.log('找到' + colors.length + '个颜色值');

    const result = [];
    for (var i = 0; i < colors.length; i += colorCount) {
        if (result.length >= schemeCount) break;
        const schemeColors = colors.slice(i, i + colorCount);
        if (schemeColors.length === colorCount) {
            result.push({ colors: schemeColors });
        }
    }

    return result;
}

export async function generateColors(style, colorCount = 4) {
    return generateColorsWithDoubao(style, colorCount, 15);
}

export async function generateColorsBatch(style, colorCount = 4, batchSize = 15) {
    return generateColorsWithDoubao(style, colorCount, batchSize);
}

export default { generateColors, generateColorsBatch };
