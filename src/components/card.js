import React from 'react';

const cardStyles = {
  backgroundColor: 'white',
  border: 'solid 2px white',
  boxShadow: '0px 1px 2px 1px rgba(0,0,0,0.25)',
  borderRadius: '0.25em',
  display: 'inline-block',
  marginLeft: '0.25em',
  marginTop: '0.25em',
  width: '2.75em',
  whitespace: 'nowrap',
  overflow: 'hidden',
  lineHeight: '4em',
  textAlign: 'center'
};

// eslint-disable-next-line react/prop-types
const Card = ({ card, style: propStyles }) => {
  if (!card) {
    return (
      <div
        style={{
          ...cardStyles,
          ...propStyles,
          color: 'white',
          backgroundColor: 'maroon'
        }}
      >
        ?
      </div>
    );
  }

  const { rank, suit } = card;
  const color = suit == 1 || suit === 4 ? 'black' : 'red';

  let suitString = '';
  let rankString = '';

  switch (suit) {
    case 1:
      suitString = '♧';
      break;
    case 2:
      suitString = '♢';
      break;
    case 3:
      suitString = '♡';
      break;
    case 4:
      suitString = '♤';
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
    <div className="card" style={{ ...cardStyles, color }}>
      {rankString}
      {suitString}
    </div>
  );
};

Card.propTypes = {
  card: () => {}
};

export default Card;
