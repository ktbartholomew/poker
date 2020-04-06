import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Game from '../classes/game';
import Card from '../components/card';
import JoinGame from '../components/join-game';
import GameError from '../components/game-error';
import DealerControls from '../components/dealer-controls';

const GamePage = () => {
  const { gameId } = useParams();
  const [fetchedAt, setFetchedAt] = useState(Date.now());
  const [game, setGame] = useState(null);
  const [error, setError] = useState('');

  const fold = () => {
    fetch(`/api/games/${gameId}/fold`, {
      method: 'POST'
    }).then(() => {
      setFetchedAt(Date.now());
    });
  };

  const bet = (amount) => {
    return (e) => {
      e.preventDefault();

      fetch(`/api/games/${gameId}/bet`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ amount })
      }).then(() => {
        setFetchedAt(Date.now());
      });
    };
  };

  useEffect(() => {
    fetch(`/api/games/${gameId}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`Game ${gameId} does not exist`);
          }

          if (res.status === 403) {
            throw new Error(
              `Game ${gameId} has already started, and no new players may join.`
            );
          }

          throw new Error(`Unable to load game ${gameId}`);
        }
        return res.json();
      })
      .then((j) => {
        setGame(new Game(gameId, j));
        setError('');
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [fetchedAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFetchedAt(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (error) {
    return <GameError message={error} />;
  }

  if (!game) {
    return null;
  }

  if (!game.me()) {
    return (
      <JoinGame
        gameId={gameId}
        onJoin={() => {
          setFetchedAt(Date.now());
        }}
      />
    );
  }

  const maxBet = Math.max(...game.players().map((p) => p.bet));

  return (
    <div
      style={{
        backgroundColor: '#076324',
        backgroundImage: 'url("/static/45-degree-fabric-dark.png")',
        color: 'rgb(250,250,240)',
        height: '100vh'
      }}
    >
      <DealerControls
        game={game}
        onChange={() => {
          setFetchedAt(Date.now());
        }}
      />
      <div>
        <div id="other-players" className="bg-dark mb-2">
          {game.players().map((p, idx) => {
            return (
              <div key={idx} className="player d-block text-left p-1 mb-2">
                <div>
                  <div>
                    {game.dealer() === idx && (
                      <span className="badge badge-light mr-1">D</span>
                    )}
                    <span>{p.name}</span>
                    <span className="text-success ml-2">${p.money}</span>
                  </div>
                  <div>
                    <div>
                      Bet:{' '}
                      <span className={p.bet < maxBet ? 'text-danger' : ''}>
                        ${p.bet || 0}
                      </span>
                    </div>
                  </div>
                </div>
                {p.cards.map((c, idx) => {
                  return (
                    <Card
                      key={idx}
                      card={c ? c.card : null}
                      style={{
                        marginLeft: !c && idx > 0 ? '-0.75em' : '0.25em'
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="container">
          <div id="controls">
            <div className="btn-group">
              <button className="btn btn-danger" onClick={fold}>
                Fold
              </button>
              <button className="btn btn-light" onClick={bet(0)}>
                Undo Bet
              </button>
            </div>
            <div className="chips mt-2">
              <button className="btn btn-chip white" onClick={bet(1)}>
                1
              </button>
              <button className="btn btn-chip red" onClick={bet(5)}>
                5
              </button>
              <button className="btn btn-chip blue" onClick={bet(10)}>
                10
              </button>
              <button className="btn btn-chip green" onClick={bet(25)}>
                25
              </button>
              <button className="btn btn-chip orange" onClick={bet(50)}>
                50
              </button>
            </div>
          </div>
          <div className="mt-3">
            <span className="mr-2">Money on the table:</span>
            <span className="h4">${game.money()}</span>
          </div>
          <div id="table-cards">
            {game.pile().map((c, idx) => {
              return <Card key={idx} card={c ? c.card : null} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
