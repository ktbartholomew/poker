import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import AdjustBankrollModal from './adjust-bankroll-modal';
import LateJoinModal from './late-join-modal';
import SetBlindsModal from './set-blinds-modal';

const DealerControls = ({ game, onChange }) => {
  const [showLateJoin, setShowLateJoin] = useState(false);
  const [showAdjustBankroll, setShowAdjustBankroll] = useState(false);
  const [showBlinds, setShowBlinds] = useState(false);

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
          <Button variant="primary" onClick={deal}>
            Start Game
          </Button>
        )}
        {game.isStarted() && (
          <Button
            className={`btn btn-primary${
              game.pile().length >= 5 || maxBet > 0 ? ' disabled' : ''
            }`}
            onClick={drawCard}
          >
            Draw<span className="d-none d-md-inline"> Card</span>
          </Button>
        )}

        {game.isStarted() && (
          <Button
            className={`btn btn-light ${maxBet === 0 ? ' disabled' : ''}`}
            onClick={collectBets}
          >
            Collect<span className="d-none d-md-inline"> Bets</span>
          </Button>
        )}
        {game.isStarted() && (
          <Button
            className={`btn btn-light${
              game.pile().length < 5 ? ' disabled' : ''
            }`}
            onClick={showCards}
          >
            Show<span className="d-none d-md-inline"> Cards</span>
          </Button>
        )}
        {game.isStarted() && (
          <>
            <Dropdown>
              <Dropdown.Toggle style={{ borderRadius: '0' }} variant="success">
                💰 Winner
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {game.players().map((p, idx) => {
                  if (p.cards.length === 0) {
                    return;
                  }

                  return (
                    <Dropdown.Item key={idx} onClick={awardHand(idx)}>
                      {p.name}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Toggle
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                variant="light"
              >
                Other
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => {
                    setShowBlinds(true);
                  }}
                >
                  Set Blinds
                </Dropdown.Item>

                <Dropdown.Item
                  onClick={() => {
                    setShowAdjustBankroll(true);
                  }}
                >
                  Adjust Bankroll
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setShowLateJoin(true);
                  }}
                >
                  Late Join
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            {showLateJoin && (
              <LateJoinModal
                gameId={game.id}
                onClose={() => {
                  setShowLateJoin(false);
                }}
              />
            )}
            {showAdjustBankroll && (
              <AdjustBankrollModal
                gameId={game.id}
                players={game.players()}
                onClose={() => {
                  setShowAdjustBankroll(false);
                }}
              />
            )}
            {showBlinds && (
              <SetBlindsModal
                game={game}
                onClose={() => {
                  setShowBlinds(false);
                }}
              />
            )}
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
