import store from "@/store";

const SOCKET_SERVER_ADDRESS = `ws://${window.location.host}/room`;
let SOCKET;

const ROOM_EVENT_TYPE = Object.freeze({
  JOIN: "Join",
  LEAVE: "Leave"
});

export const joinRoom = name => {
  SOCKET = new WebSocket(SOCKET_SERVER_ADDRESS);
  SOCKET.addEventListener("open", () => {
    SOCKET.send(JSON.stringify({ type: ROOM_EVENT_TYPE.JOIN, name }));
  });
  SOCKET.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    store.commit("setRoom", message.room);
  });
  SOCKET.addEventListener("close", () => {
    SOCKET = undefined;
    store.commit("setRoom", {});
  });
};

export const leaveRoom = () => {
  SOCKET.close();
};
