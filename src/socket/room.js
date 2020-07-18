import store from "@/store";
import router from "@/router";
import { ROOM_SEND_EVENT, ROOM_RECEIVE_EVENT } from "@/models/room.js";

const SOCKET_SERVER_ADDRESS = `ws://${window.location.host}/room`;
let SOCKET;

const handleReceiveEvent = message => {
  switch (message.type) {
    case ROOM_RECEIVE_EVENT.ROOM: {
      store.commit("setRoom", message.room);
      break;
    }
    case ROOM_RECEIVE_EVENT.NAME: {
      store.commit("setName", message.name);
      break;
    }
    default: {
      console.error(message.type);
    }
  }
};

export const enterRoom = () => {
  SOCKET = new WebSocket(SOCKET_SERVER_ADDRESS);
  SOCKET.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    handleReceiveEvent(message);
  });
  SOCKET.addEventListener("close", () => {
    SOCKET = undefined;
    store.commit("reset");
    router.push("/");
  });
};

export const chooseUser = user => {
  SOCKET.send(
    JSON.stringify({
      type: ROOM_SEND_EVENT.CHOOSE,
      name: user
    })
  );
};

export const leaveRoom = () => {
  SOCKET.close();
};

export const act = (type, data) => {
  const event = { type };
  if (data !== undefined) event.data = data;
  SOCKET.send(JSON.stringify(event));
};
