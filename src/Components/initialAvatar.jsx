import React from 'react';

const colors = [
  '#F44336', '#E91E63', '#9C27B0', '#3F51B5',
  '#2196F3', '#009688', '#4CAF50', '#FF9800',
  '#795548', '#607D8B'
];

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

function getInitials(name) {
  const words = name.trim().split(" ");
  const initials = words.length >= 2
    ? words[0][0] + words[1][0]
    : words[0][0];
  return initials.toUpperCase();
}

const InitialAvatar = ({ username = "Unknown User", size = 40 }) => {
  const bgColor = stringToColor(username);
  const initials = getInitials(username);

  return (
    <div
      className="d-flex justify-content-center align-items-center rounded-circle text-white"
      style={{
        backgroundColor: bgColor,
        width: size,
        height: size,
        fontWeight: 'bold',
        fontSize: size / 2.7,
        textTransform: 'uppercase',
        userSelect: 'none'
      }}
    >
      {initials}
    </div>
  );
};

export default InitialAvatar;
