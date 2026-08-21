import { Link, useParams, Navigate } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { blogPosts, getPostBySlug } from '../data/blogPosts'

function Block({ block }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="font-disp font-semibold text-2xl mt-11 mb-3.5">{block.text}</h2>
    case 'ul':
      return (
        <ul className="pl-5 mb-5 flex flex-col gap-2 text-[#e6e1d4] list-disc">
          {block.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      )
    case 'quote':
      return (
        <blockquote className="border-l-[3px] border-orange pl-4.5 my-7 font-disp text-lg text-cream">
          {block.text}
        </blockquote>
      )
    default:
      return <p className="text-[#e6e1d4] text-[1.02rem] mb-5">{block.text}</p>
  }
}

export default function BlogPost() {
  const { slug } = useParams()
  const post = getPostBySlug(slug)
  if (!post) return <Navigate to="/blog" replace />

  const idx = blogPosts.findIndex((p) => p.slug === slug)
  const prev = blogPosts[idx - 1]
  const next = blogPosts[idx + 1]

  return (
    <>
      <section className="pt-16 pb-0">
        <div className="wrap max-w-[720px]">
          <Reveal>
            <div className="font-mono text-xs uppercase tracking-[0.06em] text-muted2 mb-4">
              {post.category} · {post.readTime}
            </div>
            <h1 className="font-disp font-semibold text-4xl md:text-[2.75rem] leading-tight max-w-[22ch]">
              {post.title}
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="py-12">
        <div className="wrap max-w-[720px]">
          <Reveal delay={0.1}>
            <p className="text-muted text-lg mb-2">{post.excerpt}</p>
          </Reveal>
          <article>
            {post.body.map((b, i) => (
              <Reveal key={i} delay={Math.min(i * 0.03, 0.3)} y={12}>
                <Block block={b} />
              </Reveal>
            ))}
          </article>
        </div>
      </section>

      <div className="wrap max-w-[720px] flex justify-between pt-7 border-t border-line text-sm mb-16">
        {prev ? (
          <Link to={`/blog/${prev.slug}`} className="text-muted hover:text-cream">← {prev.title}</Link>
        ) : (
          <Link to="/blog" className="text-muted hover:text-cream">← Back to blog</Link>
        )}
        {next ? (
          <Link to={`/blog/${next.slug}`} className="text-muted hover:text-cream">{next.title} →</Link>
        ) : (
          <Link to="/blog" className="text-muted hover:text-cream">Back to all posts →</Link>
        )}
      </div>
    </>
  )
}
