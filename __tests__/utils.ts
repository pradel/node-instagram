const hour = 60 * 60 * 1000;

function getOldDate() {
  const oldDate = new Date();
  oldDate.setTime(oldDate.getTime() - hour);
  return Math.round(oldDate / 1000);
}

function getNewDate() {
  const oldDate = new Date();
  oldDate.setTime(oldDate.getTime() + hour);
  return Math.round(oldDate / 1000);
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
