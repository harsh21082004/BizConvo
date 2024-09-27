const mongoose = require('mongoose');

// Conversation schema with members array storing senderId and receiverIds
const ConversationSchema = new mongoose.Schema({
  members: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserData',
      },
      receiverIds: [
        {
          receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserData',
          },
          lastMessage: {
            type: String,
            default: ''
          },
          lastMessageTimestamp: {
            type: Date,  // Add timestamp for sorting purposes
            default: Date.now,
          },
          seen: {
            type: Boolean,
            default: false
          },
          unreadCount: {
            type: Number,
            default: 0
          }
        }
      ]
    }
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserData'
  }
},
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', ConversationSchema);
