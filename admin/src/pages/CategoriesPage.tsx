import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Tags, Wallet } from "lucide-react";
import { api } from "@/api/client";
import type { Category, PriceType } from "@/types";
import Modal from "@/components/Modal";
import { formatCategoryPrice, PRICE_TYPE_LABELS } from "@/lib/pricing";

interface FormState {
  nameEn: string;
  nameAm: string;
  icon: string;
  sortOrder: number;
  priceType: PriceType;
  price: string;
}

const EMPTY_FORM: FormState = {
  nameEn: "",
  nameAm: "",
  icon: "",
  sortOrder: 0,
  priceType: "one_time",
  price: "",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    return api
      .get("/categories")
      .then((res) => setCategories(res.data.categories || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({
      nameEn: cat.nameEn,
      nameAm: cat.nameAm,
      icon: cat.icon,
      sortOrder: cat.sortOrder,
      priceType: cat.priceType,
      price: cat.price ? String(cat.price) : "",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        nameEn: form.nameEn.trim(),
        nameAm: form.nameAm.trim(),
        icon: form.icon.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        priceType: form.priceType,
        price: form.priceType === "negotiable" ? 0 : Number(form.price) || 0,
      };

      if (editing) {
        await api.patch(`/admin/categories/${editing.id}`, payload);
      } else {
        await api.post("/admin/categories", payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Could not save this work type.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat: Category) {
    setDeleteError(null);
    if (!confirm(`Delete "${cat.nameEn}"? This can't be undone.`)) return;
    try {
      await api.delete(`/admin/categories/${cat.id}`);
      await load();
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Could not delete this work type.";
      setDeleteError(message);
    }
  }

  return (
    <div className='space-y-5'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h1 className='text-base-100 text-2xl font-semibold'>
            Work Types &amp; Prices
          </h1>
          <p className='text-base-400 mt-1 text-sm'>
            The price customers see is set here, per work type — never by
            the provider.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25'
        >
          <Plus size={16} />
          Add work type
        </motion.button>
      </div>

      {deleteError && (
        <div className='rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2.5 text-sm text-rose-300'>
          {deleteError}
        </div>
      )}

      {loading ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='shimmer-bg animate-shimmer glass-panel h-32 rounded-2xl'
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className='glass-panel text-base-400 flex flex-col items-center gap-2 rounded-2xl py-16 text-sm'>
          <Tags size={22} className='text-base-500' />
          No work types yet — add the first one.
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              whileHover={{ y: -3 }}
              className='glass-panel relative overflow-hidden rounded-2xl p-5'
            >
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-base-100 font-semibold'>{cat.nameEn}</p>
                  <p className='text-base-400 text-xs'>{cat.nameAm}</p>
                </div>
                <div className='flex items-center gap-1.5'>
                  <button
                    onClick={() => openEdit(cat)}
                    className='text-base-300 hover:bg-white/5 hover:text-cyan-300 rounded-lg border border-white/10 p-1.5 transition-colors'
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className='text-base-300 hover:bg-white/5 hover:text-rose-300 rounded-lg border border-white/10 p-1.5 transition-colors'
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className='border-base-700/60 mt-4 flex items-center gap-2 border-t pt-4'>
                <div className='rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 p-1.5'>
                  <Wallet size={14} className='text-white' />
                </div>
                <div>
                  <p className='text-base-100 text-sm font-semibold'>
                    {formatCategoryPrice(cat)}
                  </p>
                  <p className='text-base-400 text-[11px]'>
                    {PRICE_TYPE_LABELS[cat.priceType]} pricing
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit work type" : "Add work type"}
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-base-300 mb-1.5 block text-xs font-medium'>
                Name (English)
              </label>
              <input
                required
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder='e.g. Electrician'
                className='border-base-600 bg-base-900/60 text-base-100 placeholder:text-base-400 focus:border-violet-400/60 w-full rounded-xl border px-3 py-2 text-sm outline-none'
              />
            </div>
            <div>
              <label className='text-base-300 mb-1.5 block text-xs font-medium'>
                Name (Amharic)
              </label>
              <input
                required
                value={form.nameAm}
                onChange={(e) => setForm({ ...form, nameAm: e.target.value })}
                placeholder='ኤሌክትሪክ ባለሙያ'
                className='border-base-600 bg-base-900/60 text-base-100 placeholder:text-base-400 focus:border-violet-400/60 w-full rounded-xl border px-3 py-2 text-sm outline-none'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-base-300 mb-1.5 block text-xs font-medium'>
                Icon name
              </label>
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder='bulb'
                className='border-base-600 bg-base-900/60 text-base-100 placeholder:text-base-400 focus:border-violet-400/60 w-full rounded-xl border px-3 py-2 text-sm outline-none'
              />
            </div>
            <div>
              <label className='text-base-300 mb-1.5 block text-xs font-medium'>
                Sort order
              </label>
              <input
                type='number'
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
                className='border-base-600 bg-base-900/60 text-base-100 focus:border-violet-400/60 w-full rounded-xl border px-3 py-2 text-sm outline-none'
              />
            </div>
          </div>

          <div>
            <label className='text-base-300 mb-1.5 block text-xs font-medium'>
              Price type
            </label>
            <div className='grid grid-cols-3 gap-2'>
              {(Object.keys(PRICE_TYPE_LABELS) as PriceType[]).map((pt) => (
                <button
                  type='button'
                  key={pt}
                  onClick={() => setForm({ ...form, priceType: pt })}
                  className={`rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${
                    form.priceType === pt
                      ? "border-violet-400/50 bg-violet-500/20 text-violet-200"
                      : "border-base-600 text-base-300 hover:bg-white/5"
                  }`}
                >
                  {PRICE_TYPE_LABELS[pt]}
                </button>
              ))}
            </div>
          </div>

          {form.priceType !== "negotiable" && (
            <div>
              <label className='text-base-300 mb-1.5 block text-xs font-medium'>
                Price (Birr){" "}
                {form.priceType === "monthly" ? "per month" : "one time"}
              </label>
              <input
                type='number'
                min='0'
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder='500'
                className='border-base-600 bg-base-900/60 text-base-100 placeholder:text-base-400 focus:border-violet-400/60 w-full rounded-xl border px-3 py-2 text-sm outline-none'
              />
            </div>
          )}

          {error && (
            <p className='rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-300'>
              {error}
            </p>
          )}

          <div className='flex items-center gap-3 pt-1'>
            <button
              type='button'
              onClick={() => setModalOpen(false)}
              className='text-base-300 flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium hover:bg-white/5'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={saving}
              className='flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 disabled:opacity-60'
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
