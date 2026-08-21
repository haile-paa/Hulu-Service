import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { blogPosts } from '../data/blogPosts'
import { ArrowRightIcon } from '../components/Icons'

export default function Blog() {
  return (
    <>
      <section className="pt-16 pb-6">
        <div className="wrap max-w-[760px]">
          <Reveal>
            <span className="stop">the blog</span>
            <h1 className="font-disp font-semibold text-4xl md:text-5xl">Notes on building Hulu Service</h1>
            <p className="text-muted text-lg max-w-[54ch] mt-5">
              Build logs from PA Dev's on the architecture, the bilingual design decisions, and the realities of
              shipping an Android app in Ethiopia without the Play Store.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-14 border-t border-line mt-6">
        <div className="wrap grid md:grid-cols-2 gap-6">
          {blogPosts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08} className="card p-7 flex flex-col gap-3.5">
              <div className="font-mono text-[11.5px] uppercase tracking-[0.05em] text-muted2">
                {p.category} · {p.readTime}
              </div>
              <h3 className="font-disp font-semibold text-xl">{p.title}</h3>
              <p className="text-muted text-[14.5px]">{p.excerpt}</p>
              <Link to={`/blog/${p.slug}`} className="mt-auto text-[13.5px] font-semibold text-teal inline-flex items-center gap-1.5 group">
                Read the post
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
