import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";

type ChatType = {
  roomId: string;
  username: string;
  message: string;
};

function App() {
  const formElem = useRef<HTMLFormElement | null>(null);

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  const [message, setMessage] = useState("");

  const [chats, setChats] = useState<ChatType[]>([]);

  const [showChat, setShowChat] = useState(false);

  const socket = useMemo(() => {
    return io("http://localhost:3000");
  }, []);

  const sendMessage = () => {
    if (message === "") return;
    setChats((prev) => [...prev, { roomId, username, message }]);
    socket.emit("sendMessage", { roomId, username, message });
    setMessage("");
  };

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    if (!formElem || !formElem.current) return;
    e.preventDefault();
    socket.emit("joinRoom", { username, roomId });
    setShowChat(true);
  };

  useEffect(() => {
    socket.on("recieveMessage", (data) => {
      setChats((prev) => [...prev, data]);
    });
  }, [socket]);

  return (
    <main className="w-full h-screen flex justify-center items-center px-10">
      <div className="h-full w-full flex items-center justify-center">
        {showChat ? (
          <div className=" h-4/5 px-10 py-10 border border-black rounded-lg flex flex-col justify-center items-center">
            <h1 className="text-4xl mb-4 text-center">Chat</h1>
            <div className="flex flex-col h-5/6 w-full">
              <ScrollToBottom className="overflow-auto">
                {chats.map((chat, idx) => {
                  return (
                    <div
                      key={idx}
                      className={`flex ${username !== chat.username && "justify-end"} `}
                    >
                      <h1
                        className={`flex flex-col py-2 px-4 rounded-lg max-w-[45%] my-2 ${username !== chat.username ? "bg-green-500 text-white" : "bg-gray-200"} `}
                      >
                        <span
                          className={`text-xs ${chat.username !== username ? "text-green-100" : "text-gray-600"}`}
                        >
                          {chat.username === username ? "You" : chat.username}
                        </span>
                        {chat.message}
                      </h1>
                    </div>
                  );
                })}
              </ScrollToBottom>
            </div>
            <div className="">
              <input
                type="text"
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                value={message}
                className="border rounded-lg px-4 py-2 border-black"
                placeholder="Enter a messsage"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
              <button
                className="rounded-lg bg-green-400 hover:bg-green-500 active:scale-95 px-4 py-2 mx-6 text-white"
                onClick={sendMessage}
              >
                send
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 border-2 border-black rounded-lg px-8 py-16 w-full max-w-[500px]">
            <h1 className="text-4xl text-center">Join Room</h1>
            <form
              className="flex flex-col gap-4 items-center "
              ref={formElem}
              onSubmit={(e) => {
                handleJoinRoom(e);
              }}
            >
              <input
                type="text"
                name="username"
                className="border p-2 rounded-lg border-black"
                placeholder="Enter username"
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
              <input
                type="text"
                name="roomId"
                className="border p-2 rounded-lg border-black"
                placeholder="Enter room id "
                onChange={(e) => {
                  setRoomId(e.target.value);
                }}
              />
              <button
                className="border rounded-lg bg-green-400 hover:bg-green-500 active:scale-95 text-white  py-2 px-4"
                type="submit"
              >
                Join
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
