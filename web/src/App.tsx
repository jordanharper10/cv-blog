import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import Projects from './pages/Projects';
import CV from './pages/CV';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminIndex from './pages/Admin/AdminIndex';
import AssetsManager from './pages/Admin/AssetsManager';
import Login from './pages/Admin/Login';
import GeneralEditor from './pages/Admin/GeneralEditor';
import ContactsEditor from './pages/Admin/ContactsEditor';
import ProjectsEditor from './pages/Admin/ProjectsEditor';
import PostsEditor from './pages/Admin/PostsEditor';
import TimelineEditor from './pages/Admin/TimelineEditor';
import CvEditor from './pages/Admin/CvEditor';

export default function App(){
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/blog" element={<BlogList/>} />
        <Route path="/blog/:slug" element={<BlogPost/>} />
        <Route path="/projects" element={<Projects/>} />
        <Route path="/cv" element={<CV/>} />

        <Route path="/admin/login" element={<Login/>} />
        <Route path="/admin" element={<AdminLayout/>}>
          <Route index element={<AdminIndex/>} />
          <Route path="general" element={<GeneralEditor/>} />
          <Route path="contacts" element={<ContactsEditor/>} />
          <Route path="timeline" element={<TimelineEditor/>} />
          <Route path="projects" element={<ProjectsEditor/>} />
          <Route path="posts" element={<PostsEditor/>} />
          <Route path="cv" element={<CvEditor/>} />
          <Route path="assets" element={<AssetsManager/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

