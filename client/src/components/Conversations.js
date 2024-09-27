import React, { useContext, useEffect, useState } from 'react';
import styles from '../styles/Conversations.module.css';
import axios from 'axios';
import { NewChatContext } from '../context/NewChatContext';
import { AccountContext } from '../context/AccountContext';
import { ConversationContext } from '../context/ConversationContext';
import { useOpenContext } from '../context/OpenContext';

const Conversations = () => {
    const {isConversationOpen, handleOpenChat, handleOpenConversation, isChatOpen} = useOpenContext();
    const { toggleNewChatModal } = useContext(NewChatContext);
    const { user, setChatPerson, chatPerson, socket, setActiveUsers } = useContext(AccountContext);
    const [conversationId, setConversationId] = useState([]);
    const [receiverDetails, setReceiverDetails] = useState([]);
    const [lastMessage, setLastMessage] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // State for search input
    const { conversations, newMessage, setNewMessage } = useContext(ConversationContext);

    useEffect(() => {
        socket?.current?.emit('addUsers', user);
        socket?.current?.on('getUsers', users => {
            console.log('Users:', users);
            setActiveUsers(users);
        });
    }, [user])

    const fetchConversation = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/conversation/get/${user._id}`);
            const conversation = response.data;

            // Sort conversations by the lastMessageTimestamp
            const sortedConversations = conversation.sort((a, b) => {
                const lastMessageA = a.members[0].receiverIds[0].lastMessageTimestamp;
                const lastMessageB = b.members[0].receiverIds[0].lastMessageTimestamp;
                return new Date(lastMessageB) - new Date(lastMessageA);  // Most recent first
            });

            setConversationId(sortedConversations[0]._id);

            // Sort receiverIds by lastMessageTimestamp
            const sortedReceiverIds = sortedConversations[0].members[0].receiverIds.sort((a, b) => {
                return new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp);
            });

            // Fetch the last message details
            setLastMessage(sortedReceiverIds);

            console.log('Last Message:', lastMessage);

            // Fetch receiver details
            if (sortedReceiverIds.length > 0) {
                const receiverIds = sortedReceiverIds.map(receiver => receiver.receiverId);

                const receiverPromises = receiverIds.map(id =>
                    axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/usersDetails/${id}`)
                );

                const receiverResponses = await Promise.all(receiverPromises);
                const receivers = receiverResponses.map(res => res.data);
                setReceiverDetails(receivers);
            }
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    useEffect(() => {
        fetchConversation();
    }, [user, chatPerson, newMessage]);

    const handleChatPerson = (receiver) => async () => {
        console.log('HandleChatPerson:', receiver);
        setChatPerson(receiver);

        const data = {
            senderId: user._id,
            receiverId: receiver?._id,
            conversationId: conversationId
        };

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/create-chat/`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    const handleSeenMessage = (receiver) => async () => {
        console.log('HandleSeen:', receiver);
        const data = {
            senderId: receiver._id,
            receiverId: user._id
        };

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/mark-as-seen/`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Message seen:', response.data);
        } catch (error) {
            console.error('Error marking message as seen:', error);
        }
    }

    // Filter the conversations based on the search term
    const filteredReceivers = receiverDetails.filter(receiver =>
        receiver.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`${styles.conversations}`}>
            <div className={`${styles.header}`}>
                <div className={`${styles.top}`}>
                    <div className={`${styles.left}`}>
                        <h2>Messages</h2>
                        <p>100 New</p>
                    </div>
                    <div className={`${styles.right}`}>
                        <img src="/edit.png" alt="add" onClick={() => {
                            toggleNewChatModal();
                            fetchConversation();
                        }} />
                    </div>
                </div>
                <form className={`${styles.bottom}`} onSubmit={e => e.preventDefault()}>
                    <div className={`${styles.input}`}>
                        <input 
                            type="text" 
                            id='search' 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} // Update search term
                            placeholder="Search" 
                        />
                        <span><label htmlFor="search"><img src="/search.png" alt="search" /></label></span>
                    </div>
                </form>
            </div>
            <div className={`${styles.body}`}>
                {filteredReceivers.map((receiver, index) => {
                    const message = lastMessage.find(msg => msg.receiverId === receiver._id);
                    const unreadCount = lastMessage.find(msg => msg.receiverId === receiver._id)?.unreadCount;

                    return (
                        <div key={index} className={`${styles.conversation} ${receiver._id === chatPerson._id && styles.activeConversation}`} onClick={() => {
                            handleChatPerson(receiver)();
                            setSearchTerm('');
                            handleSeenMessage(receiver)();
                            handleOpenChat();
                        }}>
                            <div className={`${styles.profile}`}>
                                <img src={receiver.picture} alt="profile" />
                                <div className={`${styles.details}`}>
                                    <h3>{receiver._id === user._id ? `${receiver.name} (You)` : receiver.name}</h3>
                                    <p>{message?.lastMessage || 'No messages yet'}</p>
                                </div>
                            </div>
                            <div className={`${styles.time}`}>
                                <p className={`${styles.lastMessage}`}>{new Date(message?.lastMessageTimestamp).toLocaleTimeString()}</p>
                                {unreadCount > 0 && <p className={`${styles.unreadCount}`}>{unreadCount > 0 ? unreadCount : ''}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Conversations;
