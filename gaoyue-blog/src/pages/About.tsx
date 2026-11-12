import { Link } from 'react-router-dom'
import { site } from '../site.config'

export default function About() {
  return (
    <div className="about">
      <section className="about__card">
        <div className="about__avatar">{site.initials}</div>
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
            一名喜欢把复杂问题拆简单的前端开发者。白天写页面与组件，晚上读书、写字，
            偶尔也会为了一杯好咖啡走很远的路。
          </p>
          <p>
            这个博客是我整理思考的地方。比起追逐热点，我更愿意记录那些经得起时间的内容：
            解决问题的方法、读到的好句子，以及生活里微小的确定感。
          </p>
        </section>

        <section className="about__section">
          <h2>我在做什么</h2>
          <p>
            目前专注于前端开发与工程化实践，喜欢用 React 与 TypeScript 构建清晰、好维护的界面。
            业余时间也在练习写作，希望把技术之外的部分讲得同样明白。
          </p>
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
            <a className="btn btn--ghost" href={site.github} target="_blank" rel="noreferrer">
              GitHub
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
