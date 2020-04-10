import { useState, useEffect } from 'react';
import Game from '../classes/game';

const useGame = (gameId, callback) => {
  // const [game, setGame] = useState(null);
  const [wsStart, setWsStart] = useState(Date.now());
  const [backoff, setBackoff] = useState(0);

  useEffect(() => {
    const ws = new WebSocket(
      `${window.location.origin.replace(/^http/, 'ws')}/games/${gameId}/ws`
    );
    var pingInterval;

    ws.addEventListener('error', () => {
      console.log(
        `websocket connection error, reconnecting in ${2 ** backoff} seconds`
      );

      setTimeout(() => {
        setBackoff(Math.min(backoff + 1, 5));
        setWsStart(Date.now());
      }, 2 ** backoff * 1000);
    });

    ws.addEventListener('open', () => {
      setBackoff(0);
      console.log('websocket open');
      pingInterval = setInterval(() => {
        if (ws.readyState !== ws.OPEN) {
          return;
        }

        ws.send('');
      }, 20000);

      ws.addEventListener('message', ({ data }) => {
        callback(new Game(gameId, JSON.parse(data)));
      });

      ws.addEventListener('close', () => {
        console.log(
          'websocket closed, reconnecting in ' + 2 ** backoff + ' seconds'
        );
        setTimeout(() => {
          setBackoff(Math.min(backoff + 1, 5));
          setWsStart(Date.now());
        }, 2 ** backoff * 1000);
      });
    });

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [wsStart]);
};

export { useGame };
