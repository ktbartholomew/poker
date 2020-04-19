import React from 'react';
// eslint-disable-next-line react/prop-types
const Card = ({ card, style: propStyles }) => {
  if (!card) {
    return (
      <div className="playing-card" style={{ ...propStyles }}>
        <div className="back"></div>
      </div>
    );
  }

  const { rank, suit } = card;
  const color = suit == 1 || suit === 4 ? 'black' : 'red';

  let suitString = '';
  let rankString = '';

  switch (suit) {
    case 1:
      suitString = '♣';
      break;
    case 2:
      suitString = '♦';
      break;
    case 3:
      suitString = '♥';
      break;
    case 4:
      suitString = '♠';
      break;
  }

  switch (rank) {
    case 1:
      rankString = 'A';
      break;
    case 11:
      rankString = 'J';
      break;
    case 12:
      rankString = 'Q';
      break;
    case 13:
      rankString = 'K';
      break;
    default:
      rankString = rank.toString();
  }

  return (
    <div className="playing-card" style={{ color }}>
      <div className="front">
        {rankString}
        {suitString}
      </div>
    </div>
  );
};

Card.propTypes = {
  card: () => {}
};

export default Card;
