import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, Clock, Eye, Search, Star, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBlogStore } from '../store/useBlogStore';

const BlogCard = ({ blog, featured = false }) => (
  <Link to={`/blog/${blog._id}`} className={`group overflow-hidden rounded-[26px] border border-[#e2ebe7] bg-white p-2 shadow-[0_18px_50px_rgba(7,63,53,.07)] hover:-translate-y-1 ${featured ? 'lg:grid lg:grid-cols-[1.1fr_.9fr]' : ''}`}>
    <div className={`relative overflow-hidden rounded-[20px] bg-[#effbf7] ${featured ? 'h-72 lg:h-full' : 'h-56'}`}><img src={blog.image} alt={blog.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#087558] shadow-sm backdrop-blur">{blog.category}</span></div>
    <div className="flex flex-col p-5"><div className="flex items-start justify-between gap-4"><h2 className={`${featured ? 'text-3xl' : 'text-xl'} font-semibold leading-tight tracking-[-.035em] text-[#10211b] group-hover:text-[#087558]`}>{blog.title}</h2><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#effbf7] text-[#073f35]"><ArrowUpRight className="size-4" /></span></div><p className="mt-4 line-clamp-3 text-sm leading-6 text-[#66756f]">{blog.excerpt}</p>{blog.tags?.length ? <div className="mt-5 flex flex-wrap gap-2">{blog.tags.slice(0,3).map((tag) => <span key={tag} className="rounded-full border border-[#dce7e3] px-2.5 py-1 text-[11px] text-[#087558]">#{tag}</span>)}</div> : null}<div className="mt-auto flex flex-wrap items-center gap-4 border-t border-[#e2ebe7] pt-5 text-xs text-[#66756f]"><span className="flex items-center gap-1"><Clock className="size-3.5" />{blog.readTime} min</span><span className="flex items-center gap-1"><Eye className="size-3.5" />{blog.views}</span><span className="ml-auto flex items-center gap-1"><User className="size-3.5" />{blog.author?.fullName || 'PharmaCart'}</span></div></div>
  </Link>
);

const BlogPage = () => {
  const { blogs, featuredBlogs, categories, tags, isLoading, pagination, filters, fetchBlogs, fetchFeaturedBlogs, fetchCategories, fetchTags, updateFilters } = useBlogStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchBlogs(); fetchFeaturedBlogs(); fetchCategories(); fetchTags(); }, [fetchBlogs, fetchFeaturedBlogs, fetchCategories, fetchTags]);
  const handleSearch = (event) => { event.preventDefault(); updateFilters({ search: searchTerm.trim(), tag: 'all', page: 1 }); };
  const handleTag = (tag) => { setSearchTerm(''); updateFilters({ tag, search: '', page: 1 }); };

  return (
    <main className="min-h-screen bg-white p-2 pt-[80px] sm:p-3 sm:pt-[84px]">
      <section className="relative overflow-hidden rounded-[32px] bg-[#073f35] px-5 py-16 text-white sm:px-10 sm:py-24"><div className="absolute -right-24 -top-44 size-[480px] rounded-full border border-white/10" /><div className="relative mx-auto max-w-7xl"><span className="text-xs font-semibold uppercase tracking-[.2em] text-[#65d6b4]">PharmaCart health library</span><h1 className="mt-5 max-w-4xl text-6xl font-semibold leading-[.88] tracking-[-.065em] sm:text-8xl">Clear health information, thoughtfully organized.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/60">Search precise topics and read admin-managed articles about medicine safety, wellness and responsible product use.</p></div></section>

      <section className="mx-auto max-w-7xl px-3 py-14 sm:px-6 sm:py-20">
        <form onSubmit={handleSearch} className="grid gap-3 rounded-[26px] border border-[#e2ebe7] bg-[#f5f8f7] p-3 shadow-[0_16px_45px_rgba(7,63,53,.06)] md:grid-cols-[1.3fr_.85fr_.85fr]">
          <div className="relative"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#159a74]" /><label htmlFor="blog-search" className="sr-only">Search exact article title or topic</label><input id="blog-search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search exact title or topic…" className="h-14 w-full rounded-2xl border border-[#dce7e3] bg-white pl-12 pr-4 text-[#10211b] outline-none focus:border-[#159a74]" /></div>
          <select value={filters.tag} onChange={(e) => handleTag(e.target.value)} className="h-14 rounded-2xl border border-[#dce7e3] bg-white px-4 text-[#10211b] outline-none focus:border-[#159a74]" style={{ colorScheme:'light' }}><option value="all">All topics</option>{tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select>
          <select value={filters.category} onChange={(e) => updateFilters({ category: e.target.value, page: 1 })} className="h-14 rounded-2xl border border-[#dce7e3] bg-white px-4 text-[#10211b] outline-none focus:border-[#159a74]" style={{ colorScheme:'light' }}><option value="all">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
        </form>

        {featuredBlogs.length && !filters.search && filters.category === 'all' && filters.tag === 'all' ? <section className="mt-14"><div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-[#159a74]"><Star className="size-4" />Featured reading</div><div className="grid gap-5 lg:grid-cols-2">{featuredBlogs.slice(0,2).map((blog) => <BlogCard key={blog._id} blog={blog} featured />)}</div></section> : null}

        <section className="mt-14"><div className="mb-7 flex items-end justify-between"><div><span className="text-xs font-semibold uppercase tracking-[.18em] text-[#159a74]">Latest articles</span><h2 className="mt-3 text-4xl font-semibold tracking-[-.05em] text-[#10211b]">Explore the library</h2></div><span className="text-sm text-[#66756f]">{pagination.totalBlogs} articles</span></div>
          {isLoading ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[0,1,2].map((item) => <div key={item} className="h-96 animate-pulse rounded-[26px] bg-[#f5f8f7]" />)}</div> : blogs.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}</div> : <div className="rounded-[28px] border border-dashed border-[#b9cbc4] bg-[#f5f8f7] py-20 text-center"><BookOpen className="mx-auto size-12 text-[#9bb2a9]" /><h3 className="mt-5 text-2xl font-semibold">No articles found</h3><p className="mt-2 text-[#66756f]">Try another exact topic or category.</p></div>}
        </section>

        {pagination.totalPages > 1 ? <nav className="mt-10 flex justify-center gap-3" aria-label="Article pages"><button onClick={() => updateFilters({ page: pagination.currentPage - 1 })} disabled={!pagination.hasPrev} className="rounded-full border border-[#dce7e3] px-5 py-3 disabled:opacity-40">Previous</button><span className="rounded-full bg-[#effbf7] px-5 py-3 text-[#66756f]">{pagination.currentPage} / {pagination.totalPages}</span><button onClick={() => updateFilters({ page: pagination.currentPage + 1 })} disabled={!pagination.hasNext} className="rounded-full border border-[#dce7e3] px-5 py-3 disabled:opacity-40">Next</button></nav> : null}
      </section>
    </main>
  );
};

export default BlogPage;
