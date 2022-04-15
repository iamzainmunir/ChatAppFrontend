import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import loader from "../assets/loader.gif";

export default function Chat() {
  const navigate = useNavigate();

  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [searchContact, setSearchContact] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(async () => {
    if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/login");
    } else {
      setCurrentUser(
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )
      );
    }
  }, []);

  useEffect(async () => {
    if (currentUser) {
        const data = await axios.get(`${allUsersRoute}/${currentUser._id}`, {
          headers: {
            "x-access-token": currentUser.token,
          },
        });
        setContacts(data.data.list);
        setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("user-loggedin", currentUser._id);
    }
  }, [currentUser]);



  useEffect(async () => {
    if (currentUser && searchContact !== '') {
      const data = await axios.get(`${allUsersRoute}/${currentUser._id}?name=${searchContact}`, {
        headers: {
          "x-access-token": currentUser.token,
        },
      });
      setContacts(data.data.list);
    }else if(currentUser && searchContact === ''){
      const data = await axios.get(`${allUsersRoute}/${currentUser._id}`, {
        headers: {
          "x-access-token": currentUser.token,
        },
      });
      setContacts(data.data.list);
    }
  }, [searchContact]);

  const handleSearchUser = (value) => {
    console.log(value)
    setSearchContact(value);
  }

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="container">
            <Contacts
              contacts={contacts}
              changeChat={handleChatChange}
              searchUser={handleSearchUser}
            />
            {currentChat === undefined ? (
              <Welcome />
            ) : (
              <ChatContainer currentChat={currentChat} socket={socket} />
            )}
          </div>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75% !important;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
