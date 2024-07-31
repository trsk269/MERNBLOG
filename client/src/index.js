import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Layout from './pages/components/Layouts.jsx' 
import ErrorPage from './pages/ErrorPage'
import Home from './pages/Home'
import PostDetails from './pages/PostDetails';
import Register from './pages/Register';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import Author from './pages/Author';
import CreatePosts from './pages/CreatePosts';
import CategoryPosts from './pages/CategoryPosts';
import AuthorPosts from './pages/AuthorPosts';
import DashBoard from './pages/DashBoard';
import EditPost from './pages/EditPost';
import DeletePost from './pages/DeletePoste'
import Logout from './pages/Logout';
import UserProvider from './context/userContext';


const router = createBrowserRouter([
  {
    path : "/",
    element : <UserProvider><Layout/></UserProvider>,
    errorElement : <ErrorPage />,
    children : [
      {index : true ,element: <Home />},
      {path : "posts/:id" ,element : <PostDetails/>},
      {path : "register" ,element : <Register/>},
      {path : "login" ,element : <Login/>},
      {path : "profile/:id" ,element : <UserProfile/>},
      {path : "authors" ,element : <Author/>},
      {path : "create" ,element : <CreatePosts/>},
      {path : "posts/categories/:category" ,element : <CategoryPosts/>},
      {path : "posts/users/:id" ,element : <AuthorPosts/>},
      {path : "myposts/:id" ,element : <DashBoard/>},
      {path : "posts/:id/edit" ,element : <EditPost/>},
      {path : "posts/:id/delete" ,element : <DeletePost/>},
      {path : "logout" ,element : <Logout/>}
    ]
  }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);

