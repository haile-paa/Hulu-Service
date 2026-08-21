import { Link } from 'react-router-dom'
import Reveal from '../Reveal'
import { blogPosts } from '../../data/blogPosts'
import { ArrowRightIcon } from '../Icons'

export default function BlogTeaser() {
  const posts = blogPosts.slice(0, 2)
  return (
    <section className="py-20 border-t border-line">
      <div className="wrap">
        <Reveal className="max-w-xl mb-11">
          <span className="stop">from the blog</span>
          <h2 className="font-disp font-semibold text-3xl md:text-4xl">Notes on building Hulu Service</h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.1} className="card p-7 flex flex-col gap-3.5">
              <div className="font-mono text-[11.5px] uppercase tracking-[0.05em] text-muted2">{p.category}</div>
              <h3 className="font-disp font-semibold text-xl">{p.title}</h3>
              <p className="text-muted text-[14.5px]">{p.excerpt}</p>
              <Link to={`/blog/${p.slug}`} className="mt-auto text-[13.5px] font-semibold text-teal inline-flex items-center gap-1.5 group">
                Read the post
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
