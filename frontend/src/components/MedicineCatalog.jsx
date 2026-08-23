import { useEffect, useState } from 'react';
import { ArrowDown, ChevronLeft, ChevronRight, Loader, Search, Sparkles, X } from 'lucide-react';
import { useMedicineStore } from '../store/useMedicineStore';
import MedicineCard from './MedicineCard';

const MedicineCatalog = () => {
  const { medicines, categories, isLoading, pagination, filters, fetchMedicines, fetchCategories, updateFilters } = useMedicineStore();
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
  }, [fetchMedicines, fetchCategories]);

  const handleSearch = (event) => {
    event.preventDefault();
    updateFilters({ search: searchInput.trim(), category: 'all', page: 1 });
    document.querySelector('#catalog-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSuggestion = (value) => {
    setSearchInput(value);
    updateFilters({ search: value, category: 'all', page: 1 });
  };

  const clearSearch = () => {
    setSearchInput('');
    updateFilters({ search: '', page: 1 });
  };

  const handleCategoryChange = (category) => updateFilters({ category, page: 1 });
  const handlePageChange = (page) => {
    updateFilters({ page });
    document.querySelector('#catalog-results')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="overflow-x-hidden bg-white p-2 sm:p-3">
      <section className="relative overflow-hidden rounded-[32px] bg-[#062e28] px-5 pb-14 pt-14 text-white sm:px-10 sm:pb-20 sm:pt-20 lg:px-16">
        <div className="absolute -right-32 -top-24 size-[480px] rounded-full border border-white/10" />
        <div className="absolute right-20 top-16 size-48 rounded-full bg-[#159a74]/20 blur-3xl" />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#65d6b4]"><Sparkles className="size-4" />Smart online pharmacy</div>
            <h1 className="max-w-4xl text-[clamp(3.3rem,7vw,7.6rem)] font-semibold leading-[0.86] tracking-[-0.075em]">Find the right medicine</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/65">Search by medicine brand, generic ingredient, or category—and understand what you are viewing before you order.</p>
            <a href="#smart-search" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#65d6b4] px-6 font-semibold text-[#062e28] hover:bg-[#7de0c1]">Search medicines <ArrowDown className="size-4" /></a>
          </div>

          <div className="relative mx-auto hidden h-[430px] w-full max-w-[520px] lg:block" aria-hidden="true">
            <div className="absolute right-12 top-4 h-80 w-60 rotate-6 rounded-[30px] bg-gradient-to-br from-white to-[#dff8ef] p-8 text-[#073f35] shadow-2xl shadow-black/30">
              <span className="text-xs uppercase tracking-[0.18em] text-[#66756f]">PharmaCart</span><div className="my-16 text-7xl font-semibold text-[#159a74]">+</div><strong className="text-xl">Medicine clarity</strong><p className="mt-2 text-sm text-[#66756f]">Brand + generic discovery</p>
            </div>
            <div className="absolute bottom-4 left-0 w-80 rounded-[24px] border border-white/50 bg-white/95 p-5 text-[#10211b] shadow-2xl shadow-black/20 backdrop-blur">
              <span className="rounded-full bg-[#dff8ef] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#087558]">Generic match</span><h3 className="mt-4 text-2xl font-semibold">Paracetamol</h3><p className="text-[#66756f]">Napa · Ace · Fast</p><div className="mt-5 flex justify-between border-t border-[#e2ebe7] pt-4 text-sm"><span className="text-[#159a74]">● Available</span><strong>3 matches</strong></div>
            </div>
            <div className="absolute right-0 top-16 h-16 w-40 -rotate-[24deg] rounded-full bg-gradient-to-r from-[#65d6b4_50%] to-white shadow-xl" />
          </div>
        </div>
      </section>

      <section id="smart-search" className="mx-auto max-w-7xl scroll-mt-24 px-3 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <div><span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159a74]">Smart medicine search</span><h2 className="mt-4 text-5xl font-semibold leading-[0.92] tracking-[-0.055em] text-[#10211b] sm:text-6xl">Find medicine<br />your way</h2><p className="mt-5 max-w-md leading-7 text-[#66756f]">Search a brand like “Napa”, a generic ingredient like “Paracetamol”, or an entire category.</p></div>
          <div>
            <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-[24px] border border-[#dce7e3] bg-[#f5f8f7] p-2 shadow-[0_18px_50px_rgba(7,63,53,0.08)]">
              <Search className="ml-3 size-5 shrink-0 text-[#159a74]" />
              <label htmlFor="medicine-search" className="sr-only">Search by medicine, generic, or category</label>
              <input id="medicine-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search Napa, Paracetamol, Pain Relief..." className="min-w-0 flex-1 bg-transparent px-2 py-4 text-base text-[#10211b] outline-none placeholder:text-[#88948f]" />
              {searchInput ? <button type="button" onClick={clearSearch} className="grid size-11 shrink-0 place-items-center rounded-full text-[#66756f] hover:bg-white" aria-label="Clear search"><X className="size-4" /></button> : null}
              <button type="submit" className="min-h-12 shrink-0 rounded-full bg-[#159a74] px-5 font-semibold text-white hover:bg-[#087558] sm:px-7">Search</button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#66756f]"><span>Try:</span>{['Paracetamol', 'Napa', 'Omeprazole'].map((item) => <button key={item} onClick={() => handleSuggestion(item)} className="rounded-full border border-[#dce7e3] bg-white px-3 py-1.5 text-[#073f35] hover:border-[#65d6b4] hover:bg-[#effbf7]">{item}</button>)}</div>
          </div>
        </div>
      </section>

      <section id="catalog-results" className="scroll-mt-24 rounded-[32px] bg-[#f5f8f7] px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div><span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159a74]">Medicine catalog</span><h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#10211b] sm:text-5xl">Explore available medicines</h2><p className="mt-3 text-[#66756f]">{pagination.totalMedicines} product{pagination.totalMedicines === 1 ? '' : 's'} found{filters.search ? ` for “${filters.search}”` : ''}</p></div>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-2 lg:max-w-[58%]" aria-label="Medicine categories">
              <button onClick={() => handleCategoryChange('all')} className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium ${filters.category === 'all' ? 'bg-[#073f35] text-white' : 'border border-[#dce7e3] bg-white text-[#66756f] hover:border-[#65d6b4]'}`}>All</button>
              {categories.map((category) => <button key={category} onClick={() => handleCategoryChange(category)} className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium ${filters.category === category ? 'bg-[#073f35] text-white' : 'border border-[#dce7e3] bg-white text-[#66756f] hover:border-[#65d6b4]'}`}>{category}</button>)}
            </div>
          </div>

          {isLoading ? <div className="grid min-h-80 place-items-center"><div className="text-center"><Loader className="mx-auto size-10 animate-spin text-[#159a74]" /><p className="mt-4 text-[#66756f]">Finding medicines…</p></div></div> : medicines.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{medicines.map((medicine) => <MedicineCard key={medicine._id} medicine={medicine} />)}</div> : <div className="rounded-[28px] border border-dashed border-[#b9cbc4] bg-white px-6 py-20 text-center"><Search className="mx-auto size-12 text-[#9bb2a9]" /><h3 className="mt-5 text-2xl font-semibold text-[#10211b]">No medicine found</h3><p className="mx-auto mt-2 max-w-md text-[#66756f]">Try another brand, generic ingredient, or select a different category.</p><button onClick={() => { setSearchInput(''); updateFilters({ search: '', category: 'all', page: 1 }); }} className="mt-6 rounded-full bg-[#159a74] px-6 py-3 font-semibold text-white">Clear filters</button></div>}

          {pagination.totalPages > 1 && !isLoading ? <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Medicine pages"><button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrev} className="grid size-11 place-items-center rounded-full border border-[#dce7e3] bg-white text-[#073f35] disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="size-4" /></button><span className="rounded-full bg-white px-5 py-3 text-sm text-[#66756f]">Page <strong className="text-[#073f35]">{pagination.currentPage}</strong> of {pagination.totalPages}</span><button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNext} className="grid size-11 place-items-center rounded-full border border-[#dce7e3] bg-white text-[#073f35] disabled:opacity-40" aria-label="Next page"><ChevronRight className="size-4" /></button></nav> : null}
        </div>
      </section>

      <aside className="mx-auto mb-4 max-w-7xl rounded-[28px] bg-[#073f35] px-6 py-8 text-white sm:px-10"><p className="max-w-4xl text-sm leading-6 text-white/65"><strong className="text-[#65d6b4]">Medicine safety:</strong> Information shown on PharmaCart is for product discovery and informational purposes. Always follow qualified medical advice and applicable prescription requirements.</p></aside>
    </main>
  );
};

export default MedicineCatalog;
