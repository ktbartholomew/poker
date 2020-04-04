import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DealerControls = ({ game, onChange }) => {
  const [dropdown, setDropdown] = useState(false);

  if (!game.isOwner()) {
    return null;
  }

  const maxBet = Math.max(...game.players().map((p) => p.bet));

  const deal = () => {
    return fetch(`/api/games/${game.id}/deal`, {
      method: 'POST'
    }).then(() => {
      onChange();
    });
  };

  const drawCard = () => {
    if (game.pile().length >= 5 || maxBet > 0) {
      return;
    }

    return fetch(`/api/games/${game.id}/draw`, {
      method: 'POST'
    }).then(() => {
      onChange();
    });
  };

  const showCards = () => {
    if (game.pile().length !== 5) {
      return;
    }

    return fetch(`/api/games/${game.id}/showCards`, {
      method: 'POST'
    }).then(() => {
      onChange();
    });
  };

  const collectBets = () => {
    return fetch(`/api/games/${game.id}/collectBets`, {
      method: 'POST'
    }).then(() => {
      onChange();
    });
  };

  const awardHand = (playerIndex) => {
    return (e) => {
      e.preventDefault();
      setDropdown(false);

      return fetch(`/api/games/${game.id}/giveMoney`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          player: playerIndex
        })
      })
        .then(() => {
          deal();
        })
        .catch((e) => {
          console.log(e);
        });
    };
  };

  return (
    <div className="detail-controls bg-dark">
      <div className="btn-group">
        {!game.isStarted() && (
          <button className="btn btn-primary" onClick={deal}>
            Start Game
          </button>
        )}
        {game.isStarted() && (
          <button
            className={`btn btn-primary${
              game.pile().length >= 5 || maxBet > 0 ? ' disabled' : ''
            }`}
            onClick={drawCard}
          >
            Draw<span className="d-none d-md-inline"> Card</span>
          </button>
        )}

        {game.isStarted() && (
          <button
            className={`btn btn-light ${maxBet === 0 ? ' disabled' : ''}`}
            onClick={collectBets}
          >
            Collect<span className="d-none d-md-inline"> Bets</span>
          </button>
        )}
        {game.isStarted() && (
          <button
            className={`btn btn-light${
              game.pile().length < 5 ? ' disabled' : ''
            }`}
            onClick={showCards}
          >
            Show<span className="d-none d-md-inline"> Cards</span>
          </button>
        )}
        {game.isStarted() && (
          <>
            <button
              className="btn btn-success dropdown-toggle"
              onClick={() => {
                setDropdown(!dropdown);
              }}
            >
              💰 Winner
            </button>
            <div className={`dropdown-menu${dropdown ? ' show' : ''}`}>
              {game.players().map((p, idx) => {
                return (
                  <a
                    key={idx}
                    href="#"
                    className="dropdown-item"
                    onClick={awardHand(idx)}
                  >
                    {p.name}
                  </a>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
DealerControls.propTypes = {
  game: PropTypes.object.isRequired,
  onChange: PropTypes.func
};

DealerControls.defaultProps = {
  onChange: function () {}
};

export default DealerControls;
