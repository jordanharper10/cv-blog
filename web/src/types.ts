export type Social = { key: string; url: string; icon?: string };
export type Profile = {
  name: string; title: string; location: string;
  photo_url?: string;
  socials?: Record<string,string> | Social[];
  certs?: string[] };
export type Project = { id:number; title:string; summary?:string; tags?:string; url?:string; repo_url?:string; cover_url?:string; created_at:string };
export type Post = { id:number; title:string; slug:string; excerpt?:string; body_md?:string; cover_url?:string; created_at:string };
export type TimelineItem = { id:number; date:string; label:string; description?:string; icon?:string };
export type Contact = { id:number; label:string; value:string; url?:string; sort?:number };

