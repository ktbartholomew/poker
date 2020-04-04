import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const Home = () => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const createGame = (e) => {
    e.preventDefault();

    if (!name) {
      setError('You must provide your name.');
      return;
    }

    fetch('/api/games', { method: 'POST' }).then((res) => {
      if (!res.ok) {
        throw new Error('failed to create new game');
      }

      const [, gameId] = res.headers
        .get('location')
        .match(/\/games\/([0-9]+)$/);

      fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name })
      }).then(() => {
        history.push(`/games/${gameId}`);
      });
    });
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-sm">
          <h1 className="h2">Create a new game</h1>
          <form onSubmit={createGame} noValidate>
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
              Create a new game
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
