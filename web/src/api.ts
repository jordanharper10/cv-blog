export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(typeof body === 'string' ? body : JSON.stringify(body));
    this.status = status;
    this.body = body;
  }
}

const API_BASE = "/api";


export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
    ...opts
  });
  if (!res.ok) {
    let body: any;
    try { body = await res.json(); } catch { body = await res.text(); }
    throw new ApiError(res.status, body);
  }
  return res.json();
}

export const getProfile = () => api('/profile');
export const getProjects = () => api('/projects');
export const getPosts = () => api('/posts');
export const getPostsAdmin = () => api('/admin/posts');
export const getPost = (slug: string) => api(`/posts/${slug}`);
export const getTimeline = () => api('/timeline');
export const login = (email:string, password:string) => api('/auth/login',{ method:'POST', body: JSON.stringify({email,password}) });
export const whoami = () => api('/auth/me');
export const listUploads = () => api('/uploads');
export const deleteUpload = (name: string) => api(`/uploads/${name}`, { method: 'DELETE' });
export const uploadFile = async (file: File) => {
  const form = new FormData(); form.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST', credentials: 'include', body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ url: string }>;
}

export const getContacts = () => api('/contacts');
export const createContact = (row:any) => api('/contacts',{ method:'POST', body: JSON.stringify(row) });
export const updateContact = (id:number, row:any) => api(`/contacts/${id}`,{ method:'PUT', body: JSON.stringify(row) });
export const deleteContact = (id:number) => api(`/contacts/${id}`,{ method:'DELETE' });

export const updateProfile = (data:any) => api('/profile',{ method:'PUT', body: JSON.stringify(data) });
export const createProject = (row:any) => api('/projects',{ method:'POST', body: JSON.stringify(row) });
export const updateProject = (id:number, row:any) => api(`/projects/${id}`,{ method:'PUT', body: JSON.stringify(row) });
export const deleteProject = (id:number) => api(`/projects/${id}`,{ method:'DELETE' });
export const createPost = (row:any) => api('/posts',{ method:'POST', body: JSON.stringify(row) });
export const updatePost = (id:number, row:any) => api(`/posts/${id}`,{ method:'PUT', body: JSON.stringify(row) });
export const deletePost = (id:number) => api(`/posts/${id}`,{ method:'DELETE' });

export const createTimeline = (row:any) => api('/timeline',{ method:'POST', body: JSON.stringify(row) });
export const updateTimeline = (id:number, row:any) => api(`/timeline/${id}`,{ method:'PUT', body: JSON.stringify(row) });
export const deleteTimeline = (id:number) => api(`/timeline/${id}`,{ method:'DELETE' });

export const getCV = () => api('/cv');

// meta
export const updateCvMeta = (row:any) =>
  api('/cv/meta', { method:'PUT', body: JSON.stringify(row) });

// experience
export const createCvExp = (row:any) =>
  api('/cv/experience', { method:'POST', body: JSON.stringify(row) });
export const updateCvExp = (id:number, row:any) =>
  api(`/cv/experience/${id}`, { method:'PUT', body: JSON.stringify(row) });
export const deleteCvExp = (id:number) =>
  api(`/cv/experience/${id}`, { method:'DELETE' });

// education
export const createCvEdu = (row:any) =>
  api('/cv/education', { method:'POST', body: JSON.stringify(row) });
export const updateCvEdu = (id:number, row:any) =>
  api(`/cv/education/${id}`, { method:'PUT', body: JSON.stringify(row) });
export const deleteCvEdu = (id:number) =>
  api(`/cv/education/${id}`, { method:'DELETE' });

// skills
export const createCvSkill = (row:any) =>
  api('/cv/skills', { method:'POST', body: JSON.stringify(row) });
export const updateCvSkill = (id:number, row:any) =>
  api(`/cv/skills/${id}`, { method:'PUT', body: JSON.stringify(row) });
export const deleteCvSkill = (id:number) =>
  api(`/cv/skills/${id}`, { method:'DELETE' });

// links
export const createCvLink = (row:any) =>
  api('/cv/links', { method:'POST', body: JSON.stringify(row) });
export const updateCvLink = (id:number, row:any) =>
  api(`/cv/links/${id}`, { method:'PUT', body: JSON.stringify(row) });
export const deleteCvLink = (id:number) =>
  api(`/cv/links/${id}`, { method:'DELETE' });
export const createCvCert = (row:any) =>
  api('/cv/certs', { method:'POST', body: JSON.stringify(row) });
export const updateCvCert = (id:number, row:any) =>
  api(`/cv/certs/${id}`, { method:'PUT', body: JSON.stringify(row) });
export const deleteCvCert = (id:number) =>
  api(`/cv/certs/${id}`, { method:'DELETE' });


