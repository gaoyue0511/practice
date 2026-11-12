import { Link } from 'react-router-dom'

const heroImage =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20illustration%20of%20an%20AI%20color%20palette%20generator%20dashboard%2C%20rows%20of%20color%20swatches%20with%20hex%20codes%2C%20pastel%20pink%20yellow%20mint%20blue%20gradient%2C%20dopamine%20colors%2C%20clean%20modern%20minimal%20web%20design&image_size=landscape_16_9'

const uiImage =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=web%20app%20user%20interface%20mockup%20for%20color%20scheme%20generation%2C%20cards%20showing%20color%20palettes%2C%20soft%20pastel%20background%2C%20clean%20UI%20design%20with%20rounded%20corners%20and%20soft%20shadows%2C%20modern%20minimal%20style&image_size=landscape_4_3'

const modelImage =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20neural%20network%20visualization%20generating%20color%20palettes%2C%20flowing%20gradient%20ribbons%20in%20pink%20orange%20yellow%20mint%20blue%20violet%2C%20modern%20tech%20illustration%2C%20data%20science%20aesthetic&image_size=landscape_4_3'

const features = [
  {
    title: '风格配色生成',
    desc: '内置 114 种设计风格，从莫兰迪、马卡龙到国潮、赛博朋克，输入关键词即可批量产出成套配色。',
    tone: 'pink',
  },
  {
    title: '三级生成链路',
    desc: '本地 WGAN-GP 模型推理优先，豆包大模型 API 扩展兜底，离线风格预设保底，服务永不落空。',
    tone: 'orange',
  },
  {
    title: '配色库与收藏',
    desc: '生成的方案可一键保存，登录用户拥有独立的收藏夹，配色库支持按风格检索与管理。',
    tone: 'yellow',
  },
  {
    title: '完整用户系统',
    desc: 'JWT + bcrypt 的注册登录体系，含忘记密码与用户管理后台，接口全部经过鉴权保护。',
    tone: 'mint',
  },
  {
    title: '数据可视化',
    desc: '使用 ECharts 展示风格分布与配色数据，训练阶段的 Loss 曲线也被完整记录归档。',
    tone: 'blue',
  },
  {
    title: '色彩风格迁移',
    desc: '除文本生成外，还探索了图像色彩风格迁移模型，可将参考图的色调迁移到目标图像。',
    tone: 'violet',
  },
]

const techSections = [
  {
    tag: '深度学习',
    title: 'WGAN-GP 配色生成模型',
    points: [
      '生成器输入为「128 维高斯噪声 + 风格 One-Hot 向量」的拼接，输出 15 维 RGB 值，解析为 5 个十六进制色值。',
      '训练采用 WGAN-GP（Wasserstein GAN + 梯度惩罚），相比原始 GAN 收敛更稳定，Loss 曲线平滑可查。',
      '模型以 .h5 格式落盘，由 Flask 服务封装推理接口：模型与 LabelEncoder 懒加载并缓存，风格名经编码器转为索引后构造 One-Hot 向量。',
      '支持批量推理：一次生成多套方案时按 batch 并行采样，明显快于逐条请求。',
    ],
  },
  {
    tag: '大模型',
    title: '豆包 API 生成链路',
    points: [
      '调用豆包 doubao-seed-1-6-flash 模型，System Prompt 严格约束输出格式：15 套配色、每套 4 个十六进制色值、换行分隔，便于直接解析。',
      '以「风格 + 色数」为键做 10 分钟内存缓存，相同风格的重复请求直接命中缓存，降低 API 成本与延迟。',
      '全链路埋点计时：接收请求、发起调用、响应返回、解析完成逐段打日志，方便定位慢在哪一步。',
    ],
  },
  {
    tag: '架构',
    title: '前后端分离与三级降级',
    points: [
      '前端：Vue 3 + TypeScript + Vite，Vue Router 管理页面流转，Axios 统一封装请求，ECharts 负责可视化。',
      '后端：Node.js + Express + MySQL（mysql2 连接池），按 routes / controllers / services 分层，RESTful 风格接口。',
      '配色生成实现三级降级：本地模型推理 → 豆包 API → 内置风格预设，任何一级失败都自动切换，保证功能始终可用。',
      '认证采用 JWT + bcrypt：密码哈希存储，登录签发 Token，敏感接口统一走鉴权中间件。',
    ],
  },
]

const steps = [
  {
    title: '注册并登录',
    desc: '进入首页完成注册或登录，密码经 bcrypt 哈希存储，登录后签发 JWT 令牌。',
  },
  {
    title: '输入风格关键词',
    desc: '在「配色生成」页输入莫兰迪、国潮等风格词，或从 114 种风格列表中挑选，并设置每套颜色数量。',
  },
  {
    title: '一键生成方案',
    desc: '点击生成后返回 15 套方案、每套 4 色，看中哪套点击即可复制十六进制色值。',
  },
  {
    title: '保存与收藏',
    desc: '把满意的方案保存进「我的收藏」，随时回看，不再担心灵感丢失。',
  },
  {
    title: '浏览配色库',
    desc: '在「配色库」集中浏览与管理全部方案，支持按风格筛选，也可以继续二创。',
  },
]

export default function Project() {
  return (
    <div className="project">
      <section className="project__hero">
        <div className="project__hero-text">
          <p className="eyebrow">PROJECT</p>
          <h1>智能配色系统</h1>
          <p className="project__lead">
            从风格关键词到成套配色的 AI 生成平台。输入「莫兰迪」「国潮」「赛博朋克」，
            一键生成 15 套可直接使用的配色方案，覆盖从模型训练、服务端推理到前后端应用的完整链路。
          </p>
          <div className="project__meta-tags">
            {['Vue 3', 'TypeScript', 'Express', 'MySQL', 'JWT 认证', 'WGAN-GP', '豆包 API'].map(
              (item) => (
                <span key={item} className="project__meta-tag">
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
        <img className="project__hero-img" src={heroImage} alt="智能配色系统封面图" />
      </section>

      <section className="project__section">
        <h2>它解决什么问题</h2>
        <p>
          做设计时最常卡住的不是画图，而是「用什么颜色」。这个项目把配色这件事交给模型：
          用户只需要说出一种风格的感觉，系统就能批量给出协调、可直接落地的配色方案，
          并提供收藏与管理能力，让每一次生成都能沉淀下来。
        </p>
      </section>

      <section className="project__section">
        <h2>核心功能</h2>
        <div className="project__features">
          {features.map((feature) => (
            <div key={feature.title} className={`project__feature project__feature--${feature.tone}`}>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="project__section">
        <h2>项目一览</h2>
        <figure className="project__figure">
          <img src={uiImage} alt="配色生成与收藏界面示意" />
          <figcaption>配色生成、收藏与配色库界面示意：输入风格词，批量产出可复制的配色卡片。</figcaption>
        </figure>
        <figure className="project__figure">
          <img src={modelImage} alt="WGAN-GP 模型生成配色示意" />
          <figcaption>生成模型示意：噪声向量与风格向量共同驱动，输出五个协调的色值。</figcaption>
        </figure>
      </section>

      <section className="project__section">
        <h2>技术详解</h2>
        <div className="project__tech">
          {techSections.map((section) => (
            <article key={section.title} className="project__tech-item">
              <div className="project__tech-head">
                <span className="project__tech-tag">{section.tag}</span>
                <h3>{section.title}</h3>
              </div>
              <ul>
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="project__section">
        <h2>怎么使用</h2>
        <ol className="project__steps">
          {steps.map((step, index) => (
            <li key={step.title} className="project__step">
              <span className="project__step-num">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="project__footer">
        <Link className="btn btn--ghost" to="/about">
          返回关于页
        </Link>
        <Link className="btn btn--primary" to="/blog">
          读读文章
        </Link>
      </div>
    </div>
  )
}
