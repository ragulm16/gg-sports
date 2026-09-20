"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

type ContentType = "EVENT" | "PRODUCT" | "SERVICE" | "SECTION";
type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type ContentItem = {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  metadata: string | null;
  status: ContentStatus;
  startsAt: string | null;
  endsAt: string | null;
};
type RoadmapItem = { id: string; year: number; title: string; description: string; position: number };
type SectionFilter = "ALL" | ContentType;
type AdminUser = { id: string; name: string; email: string; role: string };

const apiBase = process.env.NEXT_PUBLIC_API_URL;

const emptyForm = {
  type: "SERVICE" as ContentType,
  title: "",
  tagline: "",
  description: "",
  imageUrl: "",
  status: "DRAFT" as ContentStatus,
  startsAt: "",
  endsAt: "",
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

function taglineOf(item: ContentItem): string {
  try {
    const parsed = JSON.parse(item.metadata || "");
    return typeof parsed?.eyebrow === "string" ? parsed.eyebrow : "";
  } catch {
    return "";
  }
}

function metadataWith(tagline: string, existing: string | null): string | null {
  const parsed: Record<string, unknown> = (() => {
    try {
      return JSON.parse(existing || "{}");
    } catch {
      return {};
    }
  })();
  if (tagline.trim()) {
    parsed.eyebrow = tagline.trim();
  } else {
    delete parsed.eyebrow;
  }
  const keys = Object.keys(parsed);
  return keys.length ? JSON.stringify(parsed) : null;
}

const typeLabel = (type: ContentType): string => {
  switch (type) {
    case "EVENT":
      return "Event";
    case "PRODUCT":
      return "Product / Gear";
    case "SERVICE":
      return "Service";
    case "SECTION":
      return "Section";
  }
};

export default function AdminWorkspace() {
  const [signedIn, setSignedIn] = useState(
    () => typeof window !== "undefined" && window.sessionStorage.getItem("gg-admin-session") === "active",
  );
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? window.sessionStorage.getItem("gg-admin-token") : null,
  );
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<SectionFilter>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [roadmapError, setRoadmapError] = useState("");

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoaded, setAdminsLoaded] = useState(false);
  const [adminsError, setAdminsError] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });

  const counts = useMemo(
    () => ({
      SERVICE: items.filter((item) => item.type === "SERVICE").length,
      EVENT: items.filter((item) => item.type === "EVENT").length,
      PRODUCT: items.filter((item) => item.type === "PRODUCT").length,
      SECTION: items.filter((item) => item.type === "SECTION").length,
    }),
    [items],
  );

  const visibleItems = useMemo(
    () => (filter === "ALL" ? items : items.filter((item) => item.type === filter)),
    [items, filter],
  );

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  useEffect(() => {
    if (!signedIn || !token || !apiBase) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${apiBase}/api/admin/content`, { headers })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data: { items: ContentItem[] }) => {
        setItems(data.items || []);
        setLoaded(true);
      })
      .catch(() => setError("Could not load website sections. Is the API running?"));
    fetch(`${apiBase}/api/admin/roadmap`, { headers })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data: { items: RoadmapItem[] }) => setRoadmap(data.items || []))
      .catch(() => setRoadmapError("Failed to load roadmap stages"));
    fetch(`${apiBase}/api/auth/me`, { headers })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data: { user: AdminUser }) => setCurrentUser(data.user))
      .catch(() => {});
    fetch(`${apiBase}/api/admin/users`, { headers })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data: { users: AdminUser[] }) => {
        setAdmins(data.users || []);
        setAdminsLoaded(true);
      })
      .catch(() => setAdminsError("Could not load admin accounts."));
  }, [signedIn, token]);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    if (!apiBase) {
      setError("API URL is not configured. Add NEXT_PUBLIC_API_URL to your .env file.");
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }),
      });
      if (!response.ok) {
        setError("Unable to sign in. Check your credentials.");
        return;
      }
      const result = (await response.json()) as { accessToken: string };
      const nextToken = result.accessToken;
      window.sessionStorage.setItem("gg-admin-session", "active");
      window.sessionStorage.setItem("gg-admin-token", nextToken);
      setToken(nextToken);
      setSignedIn(true);
    } catch {
      setError("Unable to reach the API.");
    }
  };

  const setField = (field: keyof typeof emptyForm, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setForm({
      type: item.type,
      title: item.title,
      tagline: taglineOf(item),
      description: item.description,
      imageUrl: item.imageUrl || "",
      status: item.status,
      startsAt: item.startsAt ? item.startsAt.slice(0, 10) : "",
      endsAt: item.endsAt ? item.endsAt.slice(0, 10) : "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiBase || !token) return;
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    const existing = items.find((entry) => entry.id === editingId);
    const payload: Record<string, unknown> = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      status: form.status,
      startsAt: form.startsAt ? new Date(`${form.startsAt}T00:00:00`).toISOString() : undefined,
      endsAt: form.endsAt ? new Date(`${form.endsAt}T00:00:00`).toISOString() : undefined,
      metadata: metadataWith(form.tagline, existing?.metadata ?? null),
    };
    try {
      const isEdit = Boolean(editingId);
      const response = await fetch(`${apiBase}/api/admin/content${isEdit ? `/${editingId}` : ""}`, {
        method: isEdit ? "PATCH" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        setError(result?.error || "Could not save this section.");
        return;
      }
      const result = (await response.json()) as { item: ContentItem };
      setItems((current) =>
        isEdit ? current.map((entry) => (entry.id === result.item.id ? result.item : entry)) : [result.item, ...current],
      );
      setNotice(isEdit ? "Section updated." : "New section added.");
      cancelEdit();
    } catch {
      setError("Could not save this section.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item: ContentItem) => {
    if (!apiBase || !token) return;
    setError("");
    const next = item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const response = await fetch(`${apiBase}/api/admin/content/${item.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) throw new Error();
      const result = (await response.json()) as { item: ContentItem };
      setItems((current) => current.map((entry) => (entry.id === item.id ? result.item : entry)));
      setNotice(next === "PUBLISHED" ? `"${item.title}" is now live on the website.` : `"${item.title}" is now hidden.`);
    } catch {
      setError("Could not change the status of this section.");
    }
  };

  const removeItem = async (item: ContentItem) => {
    if (!apiBase || !token) return;
    if (!window.confirm(`Delete "${item.title}" permanently? This cannot be undone.`)) return;
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/admin/content/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok && response.status !== 204) throw new Error();
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setNotice("Section deleted.");
    } catch {
      setError("Could not delete this section.");
    }
  };

  const signOut = () => {
    window.sessionStorage.removeItem("gg-admin-session");
    window.sessionStorage.removeItem("gg-admin-token");
    setSignedIn(false);
    setToken(null);
    setItems([]);
    setRoadmap([]);
    setAdmins([]);
    setCurrentUser(null);
    cancelEdit();
  };

  const updateRoadmapItem = async (item: RoadmapItem) => {
    if (!apiBase || !token) return;
    setRoadmapError("");
    try {
      const response = await fetch(`${apiBase}/api/admin/roadmap/${item.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error();
      const result = (await response.json()) as { item: RoadmapItem };
      setRoadmap((current) => current.map((entry) => (entry.id === result.item.id ? result.item : entry)));
    } catch {
      setRoadmapError("Could not update this roadmap stage.");
    }
  };

  const setAdminField = (field: "name" | "email" | "password", value: string) =>
    setAdminForm((current) => ({ ...current, [field]: value }));

  const addAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiBase || !token) return;
    if (adminForm.name.trim().length < 2 || !adminForm.email.trim() || adminForm.password.length < 8) {
      setAdminsError("Name, a valid email and a password of at least 8 characters are required.");
      return;
    }
    setAddingAdmin(true);
    setAdminsError("");
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${apiBase}/api/admin/users`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          name: adminForm.name.trim(),
          email: adminForm.email.trim(),
          password: adminForm.password,
        }),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        setAdminsError(result?.error || "Could not add this admin.");
        return;
      }
      const result = (await response.json()) as { user: AdminUser };
      setAdmins((current) => [result.user, ...current]);
      setAdminForm({ name: "", email: "", password: "" });
      setNotice(`Admin access granted to ${result.user.email}.`);
    } catch {
      setAdminsError("Could not add this admin.");
    } finally {
      setAddingAdmin(false);
    }
  };

  const removeAdmin = async (user: AdminUser) => {
    if (!apiBase || !token) return;
    if (user.id === currentUser?.id) return;
    if (!window.confirm(`Remove admin access for ${user.email}? They will no longer be able to sign in.`)) return;
    setAdminsError("");
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${apiBase}/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        setError(result?.error || "Could not remove admin access.");
        return;
      }
      setAdmins((current) => current.filter((entry) => entry.id !== user.id));
      setNotice(`Admin access removed for ${user.email}.`);
    } catch {
      setAdminsError("Could not remove admin access.");
    }
  };

  if (!signedIn) {
    return (
      <main className="min-h-screen bg-[#020617] text-[#f8fafc]">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/95 px-6 py-4 backdrop-blur-xl lg:px-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#38bdf8]">GG Sports</p>
              <h1 className="mt-2 text-2xl font-black uppercase tracking-[-0.05em]">Mission Control</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => document.getElementById("admin-email-input")?.focus()} className="rounded-full bg-[#ff6a00] px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em]">Sign in</button>
            </div>
          </div>
        </header>
        <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-6 pt-6">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1120] p-8 shadow-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#38bdf8]">GG Sports / Mission Control</p>
            <h1 className="mt-5 text-4xl font-black uppercase tracking-[-0.06em]">Admin access.</h1>
            <p className="mt-3 text-sm leading-6 text-[#94a3b8]">Sign in with the admin email and password to manage every section of the website.</p>
            <form id="admin-login-form" onSubmit={signIn} className="mt-8 space-y-4">
              <input id="admin-email-input" name="email" required type="email" placeholder="Admin email" className="w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm outline-none focus:border-[#38bdf8]" />
              <input name="password" required type="password" placeholder="Password" className="w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm outline-none focus:border-[#38bdf8]" />
              {error && <p className="text-xs text-[#ff6a00]">{error}</p>}
              <button type="submit" className="w-full rounded-lg bg-[#ff6a00] px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-white transition hover:bg-[#38bdf8]">Sign in</button>
            </form>
            <p className="mt-6 text-[10px] uppercase tracking-[0.15em] text-[#94a3b8]">Published sections appear live on the website.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-[#f8fafc]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/95 px-6 py-4 backdrop-blur-xl lg:px-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#38bdf8]">GG Sports</p>
            <h1 className="mt-2 text-2xl font-black uppercase tracking-[-0.05em]">Mission Control</h1>
          </div>
          <div className="flex items-center gap-3">
            {currentUser && <span className="hidden text-[10px] font-bold uppercase tracking-[0.15em] text-[#94a3b8] md:block">Signed in as <span className="text-[#38bdf8]">{currentUser.email}</span></span>}
            <Link href="/" className="rounded-full border border-white/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#94a3b8] hover:border-[#38bdf8] hover:text-[#38bdf8]">View site</Link>
            <button onClick={signOut} className="rounded-full bg-[#ff6a00] px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em]">Sign out</button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        {notice && <div className="mb-6 rounded-lg border border-[#22c55e]/40 bg-[#22c55e]/10 px-4 py-3 text-sm text-[#4ade80]">{notice}</div>}
        {error && <div className="mb-6 rounded-lg border border-[#ff6a00]/40 bg-[#ff6a00]/10 px-4 py-3 text-sm text-[#ff6a00]">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(["EVENT", "PRODUCT", "SERVICE", "SECTION"] as ContentType[]).map((type) => (
            <div key={type} className="rounded-xl border border-white/10 bg-[#0b1120] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#94a3b8]">{typeLabel(type)}{type === "SECTION" ? "s" : ""}</p>
              <p className="mt-2 text-4xl font-black">{counts[type]}</p>
            </div>
          ))}
          <div className="rounded-xl border border-white/10 bg-[#0b1120] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Admins</p>
            <p className="mt-2 text-4xl font-black">{adminsLoaded ? admins.length : "…"}</p>
          </div>
        </div>

        {/* Website sections manager */}
        <div className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#38bdf8]">Website sections</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em]">Add & edit every section.</h2>
              <p className="mt-2 text-sm text-[#94a3b8]">Services, events and gear built here appear on the website the moment they are published.</p>
            </div>
            <button onClick={openAdd} className="rounded-full bg-[#ff6a00] px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] transition hover:bg-[#38bdf8]">Add new section</button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {(["ALL", "SERVICE", "EVENT", "PRODUCT", "SECTION"] as SectionFilter[]).map((option) => (
              <button key={option} onClick={() => setFilter(option)}
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] ${filter === option ? "bg-[#38bdf8] text-[#020617]" : "border border-white/15 text-[#94a3b8] hover:border-[#38bdf8] hover:text-[#38bdf8]"}`}>
                {option === "ALL" ? `All sections ${items.length}` : option === "SERVICE" ? `Services ${counts.SERVICE}` : option === "EVENT" ? `Events ${counts.EVENT}` : option === "PRODUCT" ? `Products ${counts.PRODUCT}` : `Sections ${counts.SECTION}`}
              </button>
            ))}
          </div>

          {showForm && (
            <form onSubmit={saveItem} className="mt-8 rounded-2xl border border-[#38bdf8]/40 bg-[#0b1120] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#38bdf8]">{editingId ? "Edit section" : "New website section"}</p>
                  <p className="mt-1 text-xs text-[#94a3b8]">{editingId ? "Save to update it on the website." : "Fill it in and publish it to the website."}</p>
                </div>
                <button type="button" onClick={cancelEdit} className="text-xs font-bold text-[#94a3b8] hover:text-[#f8fafc]">Cancel</button>
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Section type</span>
                    <select value={form.type} onChange={(e) => setField("type", e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm outline-none focus:border-[#38bdf8]">
                      <option value="SERVICE">Service</option>
                      <option value="EVENT">Event</option>
                      <option value="PRODUCT">Product / Gear</option>
                      <option value="SECTION">Section (other)</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Status</span>
                    <select value={form.status} onChange={(e) => setField("status", e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm outline-none focus:border-[#38bdf8]">
                      <option value="DRAFT">Draft (hidden)</option>
                      <option value="PUBLISHED">Published (live)</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Title *</span>
                  <input value={form.title} onChange={(e) => setField("title", e.target.value)} required placeholder="e.g. Corporate cricket" className="w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm outline-none focus:border-[#38bdf8]" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Tagline</span>
                  <input value={form.tagline} onChange={(e) => setField("tagline", e.target.value)} placeholder="e.g. Bring teams together" className="w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm outline-none focus:border-[#38bdf8]" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Description *</span>
                  <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} required placeholder="What does this section offer?" rows={4} className="w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm outline-none focus:border-[#38bdf8]" />
                </label>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Image URL</span>
                    <input value={form.imageUrl} onChange={(e) => setField("imageUrl", e.target.value)} placeholder="https://…" className="w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm outline-none focus:border-[#38bdf8]" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Starts on</span>
                    <input type="date" value={form.startsAt} onChange={(e) => setField("startsAt", e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm outline-none focus:border-[#38bdf8]" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Ends on</span>
                    <input type="date" value={form.endsAt} onChange={(e) => setField("endsAt", e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm outline-none focus:border-[#38bdf8]" />
                  </label>
                </div>
              </div>
              <button type="submit" disabled={saving} className="mt-5 w-full rounded-xl bg-[#ff6a00] px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] transition hover:bg-[#38bdf8] disabled:opacity-50">
                {saving ? "Saving…" : editingId ? "Save changes" : "Add section"}
              </button>
            </form>
          )}

          <div className="mt-6 space-y-3">
            {!loaded ? (
              <p className="rounded-lg border border-white/10 bg-[#0b1120] px-4 py-6 text-sm text-[#94a3b8]">Loading website sections…</p>
            ) : visibleItems.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-[#0b1120] px-4 py-8 text-center">
                <p className="text-sm font-bold text-[#94a3b8]">No {filter === "ALL" ? "sections" : `${filter.toLowerCase()}s`} yet.</p>
                <p className="mt-1 text-xs text-[#94a3b8]">Use “Add new section” to create the first one.</p>
              </div>
            ) : visibleItems.map((item) => (
              <article key={item.id} className="rounded-xl border border-white/10 bg-[#0b1120] p-5">
                {item.imageUrl && (
                  <div className="relative mb-4 aspect-[16/7] w-full overflow-hidden rounded-lg border border-white/10">
                    <Image src={item.imageUrl} alt={item.title} fill unoptimized className="object-cover" />
                  </div>
                )}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] rounded bg-white/10 px-2 py-1 text-[#94a3b8]">{typeLabel(item.type)}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.1em] rounded px-2 py-1 ${item.status === "PUBLISHED" ? "bg-[#22c55e]/15 text-[#4ade80]" : item.status === "DRAFT" ? "bg-[#f59e0b]/15 text-[#fbbf24]" : "bg-white/10 text-[#94a3b8]"}`}>{item.status}</span>
                    {item.startsAt && <span className="text-[10px] font-bold uppercase tracking-[0.1em] rounded bg-white/10 px-2 py-1 text-[#94a3b8]">Starts {formatDate(item.startsAt)}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8] hover:border-[#38bdf8] hover:text-[#38bdf8]">Edit</button>
                    <button onClick={() => toggleStatus(item)} className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8] hover:text-[#22c55e]">{item.status === "PUBLISHED" ? "Unpublish" : "Publish"}</button>
                    <button onClick={() => removeItem(item)} className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#ff6a00] hover:border-[#ff6a00]">Delete</button>
                  </div>
                </div>
                <div className="mt-3">
                  {taglineOf(item) && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]">{taglineOf(item)}</p>}
                  <h3 className="mt-1 text-lg font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{item.description}</p>
                  {item.endsAt && <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#94a3b8]">Ends {formatDate(item.endsAt)}</p>}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Roadmap Management Section */}
        <div className="mt-10">
          <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#38bdf8]">Homepage roadmap</p><h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em]">Edit the journey.</h2><p className="mt-2 text-sm text-[#94a3b8]">Update the year, stage title and description shown in the overlapping homepage roadmap.</p></div>

          {roadmap.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">Loading roadmap stages...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {roadmap.map((item) => (
                <div key={item.id} className="rounded-lg border border-white/10 bg-[#0b1120] p-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Year</label>
                      <input type="number" value={item.year} onChange={(e) => { const updated = { ...item, year: parseInt(e.target.value) }; setRoadmap(roadmap.map(r => r.id === item.id ? updated : r)); }} className="mt-1 w-full rounded border border-white/10 bg-[#020617] px-3 py-2 text-sm text-[#f8fafc] outline-none focus:border-[#38bdf8]" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Title</label>
                      <input value={item.title} onChange={(e) => { const updated = { ...item, title: e.target.value }; setRoadmap(roadmap.map(r => r.id === item.id ? updated : r)); }} className="mt-1 w-full rounded border border-white/10 bg-[#020617] px-3 py-2 text-sm text-[#f8fafc] outline-none focus:border-[#38bdf8]" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Description</label>
                      <textarea value={item.description} onChange={(e) => { const updated = { ...item, description: e.target.value }; setRoadmap(roadmap.map(r => r.id === item.id ? updated : r)); }} className="mt-1 w-full rounded border border-white/10 bg-[#020617] px-3 py-2 text-sm text-[#f8fafc] outline-none focus:border-[#38bdf8]" rows={3} />
                    </div>
                    <button onClick={() => updateRoadmapItem(item)} className="w-full rounded bg-[#ff6a00] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition hover:bg-[#38bdf8]">Save stage</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {roadmapError && <p className="mt-4 text-xs text-[#ff6a00]">{roadmapError}</p>}
        </div>

        {/* Admin access section */}
        <div className="mt-10">
          <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#38bdf8]">Admin access</p><h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em]">Who can sign in.</h2><p className="mt-2 text-sm text-[#94a3b8]">Every admin signs in with their email and password. Grant access to a new person, or remove it.</p></div>

          <form onSubmit={addAdmin} className="rounded-2xl border border-white/10 bg-[#0b1120] p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#38bdf8]">Add admin access</p>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Name</span>
                <input value={adminForm.name} onChange={(e) => setAdminField("name", e.target.value)} required placeholder="e.g. Coach Ravi" className="w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm outline-none focus:border-[#38bdf8]" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Email (sign-in)</span>
                <input value={adminForm.email} onChange={(e) => setAdminField("email", e.target.value)} required type="email" placeholder="coach@ggsports.in" className="w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm outline-none focus:border-[#38bdf8]" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Password (min 8 characters)</span>
                <input value={adminForm.password} onChange={(e) => setAdminField("password", e.target.value)} required minLength={8} type="password" placeholder="Create a strong password" className="w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm outline-none focus:border-[#38bdf8]" />
              </label>
              {adminsError && <p className="text-xs text-[#ff6a00]">{adminsError}</p>}
              <button type="submit" disabled={addingAdmin} className="w-full rounded-xl bg-[#ff6a00] px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] transition hover:bg-[#38bdf8] disabled:opacity-50">
                {addingAdmin ? "Granting access…" : "Grant admin access"}
              </button>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            {!adminsLoaded ? (
              <p className="rounded-lg border border-white/10 bg-[#0b1120] px-4 py-6 text-sm text-[#94a3b8]">Loading admin accounts…</p>
            ) : admins.map((admin) => (
              <article key={admin.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/10 bg-[#0b1120] p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] rounded bg-white/10 px-2 py-1 text-[#94a3b8]">{admin.role}</span>
                    {admin.id === currentUser?.id && <span className="text-[10px] font-bold uppercase tracking-[0.1em] rounded bg-[#38bdf8]/15 px-2 py-1 text-[#38bdf8]">You</span>}
                  </div>
                  <h3 className="mt-2 text-sm font-bold">{admin.name}</h3>
                  <p className="mt-1 text-xs text-[#94a3b8]">{admin.email}</p>
                </div>
                {admin.id !== currentUser?.id && (
                  <button onClick={() => removeAdmin(admin)} className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#ff6a00] hover:border-[#ff6a00]">Remove access</button>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}