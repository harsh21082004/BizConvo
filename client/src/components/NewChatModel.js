import React, { useContext, useEffect, useState } from 'react';
import styles from '../styles/NewChatModel.module.css';
import { NewChatContext } from '../context/NewChatContext';
import { AccountContext } from '../context/AccountContext';
import { ConversationContext } from '../context/ConversationContext'; // Import the ConversationContext
import axios from 'axios';

const NewChatModel = () => {
    const { isNewChatModalOpen, toggleNewChatModal, users } = useContext(NewChatContext);
    const { user, setChatPerson } = useContext(AccountContext);
    const { addConversation } = useContext(ConversationContext); // Access addConversation function
    const [searchTerm, setSearchTerm] = useState('');

    const [conversationId, setConversationId] = useState(null);

    const [userList, setUserList] = useState([]);

    useEffect(() => {
        if (users && Array.isArray(users)) {
            const updatedUserList = users.map((u) => ({
                ...u,
                name: u._id === user._id ? `${u.name} (You)` : u.name
            }));
            setUserList(updatedUserList);
        }
    }, [users, user]);

    const handleAddChat = (selectedUser) => async () => {

        // try {
        //     // Call API to add a new conversation
        //     const conversationResponse = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/conversation/add`, {
        //         senderId: user._id,
        //         receiverId: selectedUser._id
        //     });

        //     const newConversation = conversationResponse.data;

        //     // Set the conversation ID after the conversation is successfully created
        //     setConversationId(newConversation._id);

        //     // Update the conversation list in context
        //     addConversation(newConversation);

        //     // Now await for the conversationId to be set before proceeding with create-chat
        //     const data = {
        //         senderId: user._id,
        //         receiverId: selectedUser._id,
        //         conversationId: newConversation._id // Use the newly created conversation ID
        //     };

        //     const chatResponse = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/create-chat`, data, {
        //         headers: {
        //             'Content-Type': 'application/json'
        //         }
        //     });

        //     console.log('Chat created:', chatResponse.data);


            setChatPerson(selectedUser);
            
            toggleNewChatModal();
        // } catch (error) {
        //     console.error('Error adding conversation or creating chat:', error);
        // }

        // try {
        //     const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/conversation/add`, {
        //         senderId: selectedUser._id,
        //         receiverId: user._id
        //     });
        // } catch (err) {
        //     console.error('Error adding conversation:', err);
        // }
    };

    const filteredReceivers = userList.filter(receiver =>
        receiver.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`${styles.newChatModel} ${isNewChatModalOpen ? styles.chatModalOpen : styles.chatModalClose}`}>
            <div className={`${styles.header}`}>
                <div className={`${styles.top}`}>
                    <div className={`${styles.left}`}>
                        <h2>Add New Chat</h2>
                    </div>
                    <div className={`${styles.right}`}>
                        <img src="/close.png" alt="close" onClick={toggleNewChatModal} />
                    </div>
                </div>
                <form className={`${styles.bottom}`}>
                    <div className={`${styles.input}`}>
                        <input 
                        type="text" 
                        id='search' 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}placeholder='Search' />
                        <span><label htmlFor="search"><img src="/search.png" alt="search" /></label></span>
                    </div>
                </form>
            </div>
            <div className={`${styles.body}`}>
                {filteredReceivers.map((u) => (
                    <div className={`${styles.chats}`} key={u._id} onClick={handleAddChat(u)}>
                        <div className={`${styles.profile}`}>
                            <img src={u.picture || "/anonymous.png"} alt="profile" />
                            <div className={`${styles.details}`}>
                                <h3>{u.name}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewChatModel;
