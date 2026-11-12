const styleColorPresets = {
    '暗黑高级': [
        { colors: ['#0A0A0F', '#1A1A2E', '#2D2D44', '#4A4A6A'] },
        { colors: ['#0D0D14', '#1E1E33', '#2A2A4A', '#3D3D5C'] },
        { colors: ['#0B0B12', '#1C1C2E', '#2F2F4A', '#444466'] },
        { colors: ['#0F0F18', '#222238', '#333355', '#4A4A70'] },
        { colors: ['#0C0C15', '#1F1F35', '#303050', '#45456A'] },
        { colors: ['#0E0E16', '#21213A', '#323255', '#484872'] },
        { colors: ['#0D0D14', '#1F1F33', '#31314F', '#46466E'] },
        { colors: ['#0A0A0F', '#1B1B2F', '#2E2E4B', '#434366'] },
        { colors: ['#09090E', '#1A1A2E', '#2C2C48', '#414163'] },
        { colors: ['#0C0C15', '#1E1E35', '#2F2F50', '#44446A'] },
    ],
    '商务高级': [
        { colors: ['#1A1A2E', '#16213E', '#0F3460', '#533483'] },
        { colors: ['#2D3436', '#636E72', '#B2BEC3', '#FFFFFF'] },
        { colors: ['#0C1821', '#1B2A41', '#2D4A53', '#4A6FA5'] },
        { colors: ['#2C3E50', '#34495E', '#7F8C8D', '#ECF0F1'] },
        { colors: ['#1A237E', '#3949AB', '#5C6BC0', '#E3F2FD'] },
        { colors: ['#1B5E20', '#388E3C', '#66BB6A', '#E8F5E9'] },
        { colors: ['#311B92', '#5E35B1', '#7E57C2', '#EDE7F6'] },
        { colors: ['#BF360C', '#E65100', '#FF7043', '#FFF3E0'] },
        { colors: ['#006064', '#00838F', '#26C6DA', '#E0F7FA'] },
        { colors: ['#4A148C', '#7B1FA2', '#9C27B0', '#F3E5F5'] },
    ],
    '莫兰迪': [
        { colors: ['#A8A8A8', '#B8B8B8', '#C8C8C8', '#D8D8D8'] },
        { colors: ['#C4A484', '#D4B494', '#E4C4A4', '#F0DCC0'] },
        { colors: ['#B8A0A0', '#C8B0B0', '#D8C0C0', '#E8D0D0'] },
        { colors: ['#A8B8A8', '#B8C8B8', '#C8D8C8', '#D8E8D8'] },
        { colors: ['#A8A8B8', '#B8B8C8', '#C8C8D8', '#D8D8E8'] },
        { colors: ['#B8A8C8', '#C8B8D8', '#D8C8E8', '#E8D8F0'] },
        { colors: ['#C8B8A8', '#D8C8B8', '#E8D8C8', '#F5E8D8'] },
        { colors: ['#A8C8B8', '#B8D8C8', '#C8E8D8', '#D8F0E8'] },
        { colors: ['#B8C8A8', '#C8D8B8', '#D8E8C8', '#E8F0D8'] },
        { colors: ['#C8A8B8', '#D8B8C8', '#E8C8D8', '#F0D8E8'] },
    ],
    '多巴胺': [
        { colors: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1'] },
        { colors: ['#FF8E72', '#FFD93D', '#6BCB77', '#4D96FF'] },
        { colors: ['#FF6B9D', '#C9B1FF', '#95E1D3', '#F9ED69'] },
        { colors: ['#FEB5A7', '#FFD89B', '#FFF3B0', '#A8E6CF'] },
        { colors: ['#FF7171', '#FFB4B4', '#FFEFEF', '#B5EAD7'] },
        { colors: ['#E23E57', '#F6416C', '#FFDE7D', '#FF9F43'] },
        { colors: ['#FF6363', '#FFE66D', '#7CFC00', '#00CED1'] },
        { colors: ['#FF9FF3', '#FFD2D2', '#FFF176', '#B2EBF2'] },
        { colors: ['#FF8066', '#FFD93D', '#6BCB77', '#4D96FF'] },
        { colors: ['#FF6B6B', '#FFEAA7', '#81ECEC', '#A29BFE'] },
    ],
    '赛博朋克': [
        { colors: ['#0F0F23', '#1A1A3E', '#00D4FF', '#FF00FF'] },
        { colors: ['#121218', '#1A1A2E', '#00FFFF', '#FF00FF'] },
        { colors: ['#0D0D14', '#1E1E3A', '#00FFCC', '#FF00AA'] },
        { colors: ['#0B0B12', '#222244', '#00EEFF', '#FF00DD'] },
        { colors: ['#0F0F1A', '#1A1A3E', '#00FFFF', '#FF33FF'] },
        { colors: ['#111118', '#1F1F3F', '#00CCFF', '#FF00EE'] },
        { colors: ['#0C0C15', '#1D1D3B', '#00FFEE', '#FF00FF'] },
        { colors: ['#0E0E16', '#1F1F40', '#00DDFF', '#FF11FF'] },
        { colors: ['#0D0D14', '#202044', '#00FFFF', '#FF00AA'] },
        { colors: ['#0F0F18', '#1B1B3E', '#00CCEE', '#FF00DD'] },
    ],
};

function generateRandomColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = Math.floor(Math.random() * 360);
        const saturation = 50 + Math.floor(Math.random() * 30);
        const lightness = 40 + Math.floor(Math.random() * 20);
        colors.push(hslToHex(hue, saturation, lightness));
    }
    return colors;
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export async function generateColors(style, colorCount = 4) {
    const schemes = [];
    const presets = styleColorPresets[style] || [];
    
    for (let i = 0; i < 50; i++) {
        if (i < presets.length) {
            schemes.push({ colors: presets[i].colors });
        } else {
            schemes.push({ colors: generateRandomColors(colorCount) });
        }
    }
    
    return schemes;
}

export async function generateColorsBatch(style, colorCount = 4, batchSize = 50) {
    return generateColors(style, colorCount);
}

export default {
    generateColors,
    generateColorsBatch
};