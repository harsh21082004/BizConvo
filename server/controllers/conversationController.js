const mongoose = require('mongoose');
const Conversation = require('../models/Conversations');

// Create or update a conversation
exports.newConversation = async (req, res) => {
    const { senderId, receiverId } = req.body;

    // Ensure senderId and receiverId are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json('Invalid ObjectId format');
    }

    try {
        // Check if a conversation already exists with the senderId
        const existingConversation = await Conversation.findOne({
            'members.senderId': senderId,
            'members.receiverIds.receiverId': receiverId
        });

        // If conversation already exists, return it
        if (existingConversation) {
            return res.status(200).json(existingConversation);
        }

        // Check if there's a conversation for the sender without this specific receiverId
        const existingSenderConversation = await Conversation.findOne({
            'members.senderId': senderId
        });

        if (existingSenderConversation) {
            // Update existing conversation by adding the new receiverId with an empty lastMessage
            const updatedConversation = await Conversation.findOneAndUpdate(
                { 'members.senderId': senderId },
                { $addToSet: { 'members.$.receiverIds': { receiverId, lastMessage: '' } } },
                { new: true }
            );

            return res.status(200).json(updatedConversation);
        }

        // Create a new conversation if no conversation exists for the sender
        const newConversation = new Conversation({
            members: [
                {
                    senderId,
                    receiverIds: [{ receiverId, lastMessage: '' }]
                }
            ],
            userId: senderId
        });

        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    } catch (error) {
        console.error('Error creating or updating conversation:', error);
        res.status(500).json(error);
    }
};

// Get all conversations for a user
exports.getConversation = async (req, res) => {
    const { senderId } = req.params;

    // Ensure senderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
        return res.status(400).json('Invalid ObjectId format');
    }

    try {
        // Find conversations where the user is the sender
        const conversations = await Conversation.find({
            'members.senderId': senderId
        });

        // if (!conversations || conversations[0].length === 0) {
        //     return res.status(404).json('No conversations found');
        // }

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json(error);
    }
};
