import React, { useContext, useEffect ,useState} from 'react'
import { useNavigate ,useLocation} from 'react-router-dom';
import { UserContext } from '../context/userContext';
import {Link} from 'react-router-dom'
import axios from 'axios';
import Loader from './components/Loader';

const DeletePoste = ({postId : id}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {currentUser} =useContext(UserContext)
  const token = currentUser?.token;
  const [isLoading,setIsLoading] =useState(false)

  //redirect to login page  for any user who is not loged in

  useEffect(()=>{
    if(!token){
      navigate('/login')
    }
  },[])


   const removePost =async (id) =>{
    setIsLoading(true)
    try{
       const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/posts/${id}`,  {withCredentials: true,
       headers: {
         Authorization: `Bearer ${token}`,
       },
     })
     if(response.status == 200){
      if(location.pathname == `/myposts/${currentUser.id}`){
        navigate(0)
      }else{
        navigate('/')
      }
     }
     setIsLoading(false)
    }catch(error){
      console.log("couldn,t delete a post")
    }
   }

   if(isLoading){
    return <Loader/>
  }



  return (
    <Link className="btn sm danger" onClick={() => removePost(id)}>Delete</Link>
  )
}

export default DeletePoste