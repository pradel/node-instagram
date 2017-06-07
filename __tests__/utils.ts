const hour = 60 * 60 * 1000;

function getOldDate() {
  let oldDate = new Date();
  oldDate.setTime(oldDate.getTime() - hour);
  oldDate = Math.round(oldDate / 1000);
  return oldDate;
}

function getNewDate() {
  let oldDate = new Date();
  oldDate.setTime(oldDate.getTime() + hour);
  oldDate = Math.round(oldDate / 1000);
  return oldDate;
}

export function generateOldMessage(text) {
  return {
    caption: {
      text,
    },
    created_time: getOldDate().toString(),
  };
}

export function generateNewMessage(text) {
  return {
    caption: {
      text,
    },
    created_time: getNewDate().toString(),
  };
}
