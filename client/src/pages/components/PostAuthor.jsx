import React, { useEffect, useState } from 'react'
import {Link} from 'react-router-dom'
import axios from 'axios'
import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'

import on from 'javascript-time-ago/locale/en.json'
import ru from 'javascript-time-ago/locale/ru.json'

TimeAgo.addDefaultLocale(on)
TimeAgo.addLocale(ru)

const PostAuthor = ({authorId,createdAt}) => {
  const [author,setAuthor] = useState({})

  useEffect(()=>{
    const getAuthor =async ()=>{
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/${authorId}`)
        setAuthor(response?.data);
      } catch (error) {
        console.log(error)
      }
    }
    getAuthor();
  },[])
  return (
    <Link to={`/posts/users/${authorId}`} className='post__author'>
        <div className='post__author-avatar'>
            <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${author?.avatar}`} alt="jjj" />
        </div>
        <div className='post__author-details'>
            <h5>By : {author?.name}</h5>
            <small><ReactTimeAgo date={new Date(createdAt)} locale='en-us'/></small>
        </div>
    </Link>
  )
}

export default PostAuthor