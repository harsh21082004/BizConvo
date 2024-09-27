import React, { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from '../styles/Chat.module.css';
import { Link } from 'react-router-dom';
import { AccountContext } from '../context/AccountContext';
import { ConversationContext } from '../context/ConversationContext';
import { useOpenContext } from '../context/OpenContext';

const Chat = () => {
  const { isConversationOpen, isChatOpen } = useOpenContext();
  const { user, chatPerson, setChatPerson, activeUsers, socket } = useContext(AccountContext);
  const { newMessage, setNewMessage, addConversation, conversations } = useContext(ConversationContext);
  const [newChat, setNewChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [conversation, setConversation] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/get-messages/${user?._id}/${chatPerson?._id}`);
        if (response.status !== 200) {
          console.error('Error fetching messages:', response);
          setMessages([]);
          return;
        }
        setMessages(response.data.messages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setMessages([]);
        console.log('Messages:', messages);
      }
    };

    if (chatPerson?._id) {
      fetchMessages();
    }
  }, [chatPerson, user, setMessages, message, newMessage, setNewMessage, setChatPerson]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/conversation/get/${user?._id}`); // Ensure conversations contain `lastMessage`
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
    };

    if (user?._id) {
      fetchConversations();
    }
  }, [user, chatPerson, setChatPerson]);

  useEffect(() => {
    console.log('New Chat:', chatPerson, newChat);
    socket?.current?.on('getMessage', data => {
      setIncomingMessage({
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        messageType: data.messageType,
        timestamp: Date.now()
      });

      console.log('Incoming Message:', data);
    });

    console.log('Incoming Message:', incomingMessage);
  }, [newMessage, addConversation,chatPerson,newChat,setNewChat,socket, incomingMessage]);

  useEffect(() => {
    console.log('chat:', chatPerson?._id , incomingMessage?.senderId);
    if (incomingMessage && chatPerson?._id === incomingMessage?.senderId && user?._id === incomingMessage?.receiverId) {
      setMessages([...messages, incomingMessage]);
    }

    console.log('Incoming Message:', incomingMessage);
  }, [incomingMessage, chatPerson, message, newChat, setNewChat])

  const handleSendMessage = async (e) => {

    console.log('Chat Person:', chatPerson);
    e.preventDefault();
    const senderId = user?._id;
    const receiverId = chatPerson?._id;
    const messageType = 'text';
    const content = message;

    if (!content.trim()) return;

    socket?.current?.emit('sendMessage', {
      senderId,
      receiverId,
      content,
      messageType,
    });

    setNewChat({
      senderId,
      receiverId,
      content,
      messageType,
    })



    // Create a valid timestamp before sending the message
    const timestamp = new Date(); // Creates a valid Date object

    try {
      // Call API to add a new conversation
      const conversationResponse = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/conversation/add`, {
        senderId: senderId,
        receiverId: receiverId
      });

      if (conversationResponse.status !== 200) {
        console.error('Error adding conversation:', conversationResponse);
        return;
      }

      const newConversation = conversationResponse.data;

      console.log('New Conversation:', newConversation);

      // Now await for the conversationId to be set before proceeding with create-chat
      const data = {
        senderId: senderId,
        receiverId: receiverId,
        conversationId: newConversation._id // Use the newly created conversation ID
      };

      const chatResponse = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/create-chat`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (chatResponse.status !== 200) {
        console.error('Error creating chat:', chatResponse);
        return;
      }
    } catch (error) {
      console.error('Error adding conversation or creating chat:', error);
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/conversation/add`, {
        senderId: receiverId,
        receiverId: senderId
      });
    } catch (err) {
      console.error('Error adding conversation:', err);
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/send-message`, {
        senderId,
        receiverId,
        content,
        messageType,
      });

      if (response.status !== 200) {
        console.error('Error sending message:', response);
        return;
      }


      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/add-last-message-sender`, {
          senderId: senderId,
          receiverId: receiverId,
          lastMessage: content
        });

        setNewMessage(response.data);
        

        const newConversation = response.data;

        setNewMessage(response.data);


        setConversation(newConversation.conversation);

        // Set the conversation ID after the conversation is successfully created
        setConversationId(newConversation.conversation._id);

        // Update the conversation list in context
        addConversation(newConversation.conversation);

        console.log('Last message Sender:', response.data);
      } catch (err) {
        console.error('Error sending message:', err);
      }

      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/add-last-message-receiver`, {
          senderId: senderId,
          receiverId: receiverId,
          lastMessage: content
        });

        console.log('Last message Receiver:', response.data);

      } catch (err) {
        console.error('Error sending message:', err);
      }

      // Add the new message with the correct timestamp immediately to the state
      const newMessage = {
        senderId,
        receiverId,
        content,
        messageType,
        timestamp, // Use the correct timestamp
      };

      setMessages([...messages, newMessage]);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ transition: 'smooth' });
  }, [messages]);


  return (
    <>
      {Object.keys(chatPerson).length > 0 ? (
        <div className={`${styles.chat} ${isChatOpen ? styles.chatOpen : styles.chatClose}`}>
          <div className={`${styles.header}`}>
            <div className={`${styles.headerInfo}`}>
              <div className={`${styles.profileImg}`}>
                <img src={chatPerson?.picture} alt="profile" />
              </div>
              <div className={`${styles.details}`}>
                <h3>{chatPerson?.name}</h3>
                <p>{activeUsers?.find(user => user?._id === chatPerson._id) ? 'Online' : 'Offline'}</p>
              </div>
            </div>
            <div className={`${styles.headerRight}`}>
              <Link><i className="fa-solid fa-phone"></i></Link>
              <Link><i className="fa-solid fa-video"></i></Link>
              <Link><i className="fa-solid fa-ellipsis-vertical"></i></Link>
            </div>
          </div>

          <div className={`${styles.chatBody}`}>
            {messages.map((msg, index) => (
              <div
                key={index}
                ref={index === messages.length - 1 ? scrollRef : null}
                className={`${styles.message} ${msg.senderId === user?._id ? styles.right : styles.left} ${((index > 0 && messages[index-1]?.senderId === msg.receiverId && msg.senderId === user?._id) || (index === 0 && msg.senderId === user?._id)) && styles.rightCorner} ${((index > 0 && messages[index-1]?.receiverId === msg.senderId && msg.senderId !== user?._id) || (index === 0 && msg.senderId !== user?._id)) && styles.leftCorner}`}>
                <div>
                  <p className={styles.messageContent}>{msg.content}</p>
                  <span className={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={`${styles.footer}`}>
            <form onSubmit={handleSendMessage}>
              <img src={user?.picture} alt="profile" className={`${styles.footerProfile}`} />
              <div className={`${styles.input}`}>
                <input
                  type="text"
                  id="message"
                  placeholder="Type a message"
                  className={`${styles.text}`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <input type="file" name="" id="file" className={`${styles.file}`} />
                <span>
                  <label htmlFor="file"><img src="/attach-file.png" alt="attach" /></label>
                </span>
                <div className={`${styles.footerIcons}`}>
                  <img src="/mic.png" alt="mic" />
                  <div className={`${styles.sep}`}></div>
                  <img src="/send.png" alt="send" onClick={handleSendMessage} />
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className={`${styles.chatImage}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <img src="/emptyChat.png" style={{ width: '500px', height: '500px' }} alt="cloud" />
          <h2 style={{ color: 'gray' }}>Open a chat to start messaging</h2>
        </div>
      )}
    </>
  );
};

export default Chat;
