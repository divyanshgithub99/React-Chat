import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const Dashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')))
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState({})
  const [message, setMessage] = useState('')
  const [users, setUsers] = useState([])
  const [socket, setSocket] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const messageRef = useRef(null)

  useEffect(() => {
    setSocket(io('http://localhost:8000'))
  }, [])

  useEffect(() => {
    if (socket) {
        socket.emit('addUser', user?.id);
        socket.on('getUsers', users => {
            console.log('activeUsers :>> ', users);
        });
        socket.on('getMessage', data => {
            if (data.senderId !== user.id) {
                setMessages(prev => ({
                    ...prev,
                    messages: [...prev.messages, { user: data.user, message: data.message }]
                }));
            }
        });
    }
}, [socket, user.id]);

useEffect(() => {
    messageRef?.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.messages])

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user:detail'))
    const fetchConversations = async () => {
      const res = await fetch(`http://localhost:8080/api/conversations/${loggedInUser?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const resData = await res.json()
      setConversations(resData)
    }
    fetchConversations()
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`http://localhost:8080/api/users/${user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const resData = await res.json()
      setUsers(resData)
    }
    fetchUsers()
  }, [])

  const fetchMessages = async (conversationId, receiver) => {
    if (selectedUserId !== receiver?.receiverId) {
      const res = await fetch(`http://localhost:8080/api/message/${conversationId}?senderId=${user?.id}&&receiverId=${receiver?.receiverId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const resData = await res.json()
      setMessages({ messages: resData, receiver, conversationId })
      setSelectedUserId(receiver?.receiverId)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Check if there is a message to send
    if (!message.trim()) {
        return;
    }

    setMessage(''); // Clear the message input field

    let conversationId = messages?.conversationId;

    if (!conversationId && messages?.receiver?.receiverId) {
        const res = await fetch(`http://localhost:8080/api/conversation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                senderId: user?.id,
                receiverId: messages?.receiver?.receiverId
            })
        });
        const resData = await res.json();
        conversationId = resData._id;
        setMessages(prev => ({
            ...prev,
            conversationId
        }));
    }

    socket?.emit('sendMessage', {
        senderId: user?.id,
        receiverId: messages?.receiver?.receiverId,
        message,
        conversationId
    });

    // Update the messages state to include the sender's message
    setMessages(prev => ({
        ...prev,
        messages: [...prev.messages, { user: { id: user?.id }, message }]
    }));
};



return (
  <div className='flex'>
    <div className='w-1/4 h-screen bg-gray-800 text-white overflow-y-auto'>
      <div className='flex items-center my-8 mx-4'>
        <div>
          <img src='https://img.freepik.com/free-photo/3d-illustration-young-hipster-guy-with-beard-mustache_1142-42216.jpg?t=st=1718979772~exp=1718983372~hmac=174e5a738bfbc506578a648e2799329fa6b1c299b7130e21e8629600e56c70a5&w=740' className='w-[80px] h-[80px] rounded-full p-[2px] border border-primary' alt='User Avatar' />
        </div>
        <div className='ml-4'>
						<h3 className='text-2xl'>{user?.fullName}</h3>
						<p className='text-lg font-light'>My Account</p>
        </div>
      </div>
      <hr className="border-gray-600" />
      <div className='mx-4 mt-10'>
        <div className='text-lg'>Messages</div>
        <div>
          {
            conversations.length > 0 ?
              conversations.map(({ conversationId, user }) => (
                <div className='flex items-center py-4 border-b border-gray-600' key={conversationId}>
                  <div className='cursor-pointer flex items-center' onClick={() => fetchMessages(conversationId, user)}>
                    <div>
                      <img src='https://img.freepik.com/free-photo/3d-illustration-young-hipster-guy-with-beard-mustache_1142-42216.jpg?t=st=1718979772~exp=1718983372~hmac=174e5a738bfbc506578a648e2799329fa6b1c299b7130e21e8629600e56c70a5&w=740' className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary" alt='User Avatar' />
                    </div>
                    <div className='ml-4'>
                      <h3 className='text-lg font-semibold'>{user?.fullName}</h3>
                      <p className='text-sm font-light text-gray-300'>{user?.email}</p>
                    </div>
                  </div>
                </div>
              )) : <div className='text-center text-lg font-semibold mt-4'>No Conversations</div>
          }
        </div>
      </div>
    </div>
    <div className='w-1/2 h-screen bg-white flex flex-col items-center'>
      {
        messages?.receiver?.fullName &&
        <div className='w-3/4 bg-green-500 text-white h-20 my-8 rounded-full flex items-center px-4 py-2'>
          <div className='cursor-pointer'>
            <img src="https://img.freepik.com/free-photo/3d-illustration-young-hipster-guy-with-beard-mustache_1142-42216.jpg?t=st=1718979772~exp=1718983372~hmac=174e5a738bfbc506578a648e2799329fa6b1c299b7130e21e8629600e56c70a5&w=740" className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary" alt='Receiver Avatar' />
          </div>
          <div className='ml-4 mr-auto'>
            <h3 className='text-lg'>{messages?.receiver?.fullName}</h3>
            <p className='text-sm font-light text-gray-100'>{messages?.receiver?.email}</p>
          </div>
        </div>
      }
      <div className='h-3/4 w-full overflow-y-auto shadow-sm'>
        <div className='p-4'>
          {
            messages?.messages?.length > 0 ?
              messages.messages.map(({ message, user: { id } = {} }, index) => (
                <div key={index} className={`max-w-[40%] rounded-xl p-2 mb-4 ${id === user?.id ? 'bg-blue-500 text-white rounded-r-none ml-auto' : 'bg-gray-200 text-black rounded-l-none'}`}>{message}</div>
              )) : <div className='text-center text-lg font-semibold mt-4'>No Messages or No Conversation Selected</div>
          }
        </div>
      </div>
      {
        messages?.receiver?.fullName &&
        <div className='p-4 w-full flex items-center'>
          <input placeholder='Type a message...' value={message} onChange={(e) => setMessage(e.target.value)} className='w-3/4 p-2 border border-gray-300 rounded-lg focus:outline-none' />
          <button className={`ml-4 p-2 bg-gray-300 rounded-full ${!message && 'pointer-events-none'}`} onClick={(e) => sendMessage(e)}>Send</button>

        </div>
      }
    </div>
    <div className='w-1/4 h-screen bg-gray-900 text-white overflow-y-auto'>
      <div className='mx-4 mt-8'>
        <div className='text-lg'>Users</div>
        <div>
          {
            users.length > 0 ?
              users.map(({ userId, user }) => (
                <div className='flex items-center py-4 border-b border-gray-600' key={userId}>
                  <div className='cursor-pointer flex items-center' onClick={() => fetchMessages('new', user)}>
                    <div><img src='https://img.freepik.com/free-photo/3d-illustration-young-hipster-guy-with-beard-mustache_1142-42216.jpg?t=st=1718979772~exp=1718983372~hmac=174e5a738bfbc506578a648e2799329fa6b1c299b7130e21e8629600e56c70a5&w=740' className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary" alt='User Avatar' /></div>
                    <div className='ml-4'>
                      <h3 className='text-lg font-semibold'>{user?.fullName}</h3>
                      <p className='text-sm font-light text-gray-600'>{user?.email}</p>
                    </div>
                  </div>
                </div>
              )) : <div className='text-center text-lg font-semibold mt-4'>No Conversations</div>
          }
        </div>
      </div>
    </div>
  </div>
)

}

export default Dashboard;