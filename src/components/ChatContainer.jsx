import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";
import { ToastContainer, toast } from "react-toastify";
import moment from 'moment'

export default function ChatContainer({ currentChat, socket }) {

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);

  useEffect(async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    const response = await axios.get(recieveMessageRoute + `\\${currentChat._id}`, {
      headers: {
        'x-access-token': data.token,
      }
    });

    setMessages(response.data.list);
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  
  const handleSendMsg = async (msg) => {
    try{
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
  
      socket.current.emit("send-message", {
        receiverId: currentChat._id,
        message: msg,
      });
  
      await axios.post(sendMessageRoute, {
        receiver: currentChat._id,
        message: msg,
        timestamp: new Date()
      }, {
        headers: {
          'x-access-token': data.token,
        }
      });
  
      const msgs = [...messages];
      msgs.push({ self: true, message: msg });
      setMessages(msgs);
    }catch (error) {
      if(error && error.response && error.response.data && error.response.data.message) {
        return toast.error(error.response.data.message, toastOptions);
      }else {
        return toast.error(error.message, toastOptions);
      }
    }
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("receive-message", (msg) => {
        setArrivalMessage({ self: false, message: msg });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <Container>
        <div className="chat-header">
          <div className="user-details">
            <div className="avatar">
              <img
                src={`https://ui-avatars.com/api/?name=${currentChat.displayName}&background=86C083&color=fff`}
                alt=""
              />
            </div>
            <div className="username">
              <h3>{currentChat.displayName}</h3>
            </div>
          </div>
          <Logout />
        </div>
        <div className="chat-messages">
          {messages.length <= 0 ? 
          <div className="emptyMessages"> 
            <h3>Send "Hi" to start conversation</h3>
          </div> :
          messages.map((message) => {
            return (
              <div ref={scrollRef} key={uuidv4()}>
                <div
                  className={`message ${message.self ? "sended" : "recieved"}`}
                >
                  <div className="content ">
                    <p>{message.message}</p>
                    <br></br>
                    <span className="timestamp">{moment(message.timestamp).fromNow()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <ChatInput handleSendMsg={handleSendMsg} />
        <ToastContainer />
      </Container>
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    background-color: #080420;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          border-radius: 50%;
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .emptyMessages{
    margin-top: 2rem;
    text-align: center;
  }
  .chat-messages {
    background-color: #EFEAE2;
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.4rem;
      &-thumb {
        background-color: #C3C1BC;
        width: 0.5rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #54656F;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
      .timestamp{
        color: #B2BCC3;
        overflow-wrap: break-word;
        font-size: 0.8rem;
        border-radius: 1rem;
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #D9FDD3;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #FFFFFF;
      }
    }
  }
`;
