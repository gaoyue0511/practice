import numpy as np

# 项目中的风格列表（模拟数据库中的114种风格）
styles = ['莫兰迪', '马卡龙', '科技商务', '国潮', '日系清新', '北欧风', '复古', '极简', '轻奢', '工业风']
style_to_index = {style: idx for idx, style in enumerate(styles)}
num_styles = len(styles)

def encode_style(style_name):
    print(f'=== 风格编码转换: {style_name} ===')
    
    # Step 1: 风格名称 -> 风格索引
    idx = style_to_index[style_name]
    print(f'Step 1 - 风格名称: "{style_name}" -> 风格索引: {idx}')
    、
    # Step 2: 风格索引 -> One-Hot向量6666666666666                     
    onehot = np.zeros(num_styles)
    onehot[idx] = 1.0
    print(f'Step 2 - 风格索引: {idx} -> One-Hot向量 (维度: {num_styles})')
    print(f'         One-Hot向量: {onehot}')
    
    # Step 3: 生成128维随机噪声向量
    noise = np.random.normal(0, 1, 128)
    print(f'Step 3 - 生成128维随机噪声向量')
    print(f'         噪声向量前5位: {noise[:5].round(4)}...')
    
    # Step 4: 组合输入（模型推理准备）
    print(f'Step 4 - 组合输入: [128维噪声, {num_styles}维风格向量]')
    print()

# 演示三个风格的转换过程
selected_styles = ['莫兰迪', '马卡龙', '科技商务']
for style in selected_styles:
    encode_style(style)

print('=== 转换过程总结 ===')
print(f'风格总数: {num_styles}')
print(f'输入格式: [128维噪声, {num_styles}维风格One-Hot向量]')
print(f'输出格式: 15维RGB值 -> 5个十六进制颜色')