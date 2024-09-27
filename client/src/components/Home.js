import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import styles from '../styles/Home.module.css'
import Sidebar from './Sidebar';
import Conversations from './Conversations';
import Chat from './Chat';
import { NewChatContext } from '../context/NewChatContext';
import NewChatModel from './NewChatModel';
import { useOpenContext } from '../context/OpenContext';

const Home = () => {

  const { isChatOpen, handleOpenChat, handleOpenConversation, isConversationOpen } = useOpenContext();

  const { isNewChatModalOpen } = useContext(NewChatContext);

  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${styles.home} ${theme === 'light' ? styles.homeLight : styles.homeDark}`}>
      <Sidebar />
      <div className={`${styles.right}`}>
        <div className={`${styles.main} ${isConversationOpen ? styles.conversationsOpen : styles.conversationsClose}`}>
          <Conversations />
          <NewChatModel />
        </div>
        <Chat />
      </div>
    </div>
  )
}

export default Home