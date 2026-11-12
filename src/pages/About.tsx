import { Link } from 'react-router-dom'
import { site } from '../site.config'

export default function About() {
  return (
    <div className="about">
      <section className="about__card">
        <span className="brand-gao brand-gao--avatar" aria-hidden="true">
          {'GaoYue'.split('').map((char, index) => (
            <span key={`${char}-${index}`}>{char}</span>
          ))}
        </span>
        <div>
          <p className="eyebrow">ABOUT ME</p>
          <h1>{site.author}</h1>
          <p className="about__role">{site.role}</p>
        </div>
      </section>

      <div className="about__body">
        <section className="about__section">
          <h2>关于我</h2>
          <p>
            河北工业职业技术大学-软件工程技术专业。<br />
            性格沉稳、待人真诚，做事认真负责、积极主动。<br />
            有明确的职业规划；喜欢探索一些新事物，也相信快速学习和团队协作的力量。<br />
            持有证书：大学英语四级 · 普通话二级甲等 · 计算机二级
          </p>
          <p>
            这个博客是我整理思考的地方。我喜欢记录那些经得起时间的内容：
            解决问题的方法、读到的好句子，以及生活里微小的确定感。
          </p>
        </section>

        <section className="about__section">
          <h2>实习与项目经历</h2>
          <div className="about__timeline">
            <article className="about__job">
              <div className="about__job-head">
                <h3>AIGC 工程师 · 北京晨星创投科技有限公司</h3>
                <span className="about__job-date">2025.07 – 2025.11</span>
              </div>
              <p>
                利用大模型 AIGC 技术承接商业化文本生成任务：根据赛事赛道要求与项目定位搭建标准化
                提示词体系，用 AI 生成并迭代竞赛参赛完整方案；独立负责商业策划书全模块内容生成，
                覆盖市场分析、商业模式、竞争分析与发展规划等板块。
              </p>
            </article>
            <article className="about__job">
              <div className="about__job-head">
                <h3>产品助理 · 天津市维科车辆技术有限公司</h3>
                <span className="about__job-date">2026.01 – 2026.07</span>
              </div>
              <p>
                参与铁路客车检修虚拟仿真实训系统、地铁车辆故障检修模拟仿系统真、城市交通数字化交付系统等项目的开发与交付；
                负责需求收集梳理与建立技术需求文档，跟进产品方案落地、对接研发并推动问题闭环，
              </p>
            </article>
          </div>
        </section>

        <section className="about__section">
          <h2>个人技能</h2>
          <div className="tag-list">
            {site.skills.map((skill) => (
              <span key={skill} className="tag tag--static">
                {skill}
              </span>
            ))}
          </div>

        </section>

        <section className="about__section">
          <h2>最近的项目</h2>
          <Link to="/projects/color-matching" className="about__project">
            <div className="about__project-head">
              <h3>智能配色系统</h3>
              <span className="about__project-badge">AI + 全栈</span>
              <span className="about__project-more">查看详情 →</span>
            </div>
            <p>
              输入「莫兰迪」「国潮」这样的风格关键词，一键生成成套配色方案。底层用自训练的
              WGAN-GP 模型学习了一百多种设计风格，并接入豆包大模型做生成兜底；
              前后端分离实现，支持登录认证、配色收藏与配色库管理。
            </p>
            <div className="about__project-tags">
              {['Vue 3', 'TypeScript', 'Express', 'MySQL', 'JWT 认证', 'WGAN-GP', '豆包 API'].map(
                (item) => (
                  <span key={item} className="tag tag--static">
                    {item}
                  </span>
                ),
              )}
            </div>
          </Link>
        </section>

        <section className="about__section">
          <h2>联系我</h2>
          <p>如果你想聊聊技术、书或者别的什么，欢迎来信。</p>
          <div className="about__links">
            <a className="btn btn--primary" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <a className="btn btn--primary" href={`mailto:${site.phone}`}>
              {site.phone}
            </a>
            <a className="btn btn--primary" href={`mailto:${site.wechat}`}>
              {site.wechat}
            </a>
            <Link className="btn btn--ghost" to="/blog">
              读读文章
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
