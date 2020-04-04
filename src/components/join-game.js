import React, { useState } from 'react';

// eslint-disable-next-line react/prop-types
const JoinGame = ({ gameId, onJoin }) => {
  const joinGame = (e) => {
    e.preventDefault();

    if (!name) {
      return;
    }

    if (name.length > 20) {
      setError('Name must be 20 characters or less');
      return;
    }

    fetch(`/api/games/${gameId}/join`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name })
    }).then(() => {
      onJoin();
    });
  };

  const [error, setError] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-sm">
          <h1 className="h2">Join Game</h1>
          <form onSubmit={joinGame} noValidate>
            <div className="form-group">
              <label htmlFor="name">Your name</label>
              <input
                className={`form-control${error ? ' is-invalid' : ''}`}
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value !== '') {
                    setError('');
                  }
                }}
                required
              />
              {error && <div className="invalid-feedback">{error}</div>}
            </div>
            <button className="btn btn-primary" type="submit">
              Join Game
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinGame;
