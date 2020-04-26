import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

const AdjustBankrollModal = ({ gameId, players, onClose }) => {
  const [adjusted, setAdjusted] = useState([...players]);

  const setMoney = (idx) => {
    return (e) => {
      const edit = [...adjusted];

      edit[idx].money = e.target.value;
      setAdjusted(edit);
    };
  };

  const submit = () => {
    fetch(`/api/games/${gameId}/bankroll`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(
        adjusted.map((a) => {
          a.money = parseInt(a.money, 10) || 0;
          return a;
        })
      )
    })
      .then(() => {
        onClose();
      })
      .catch((e) => {
        console.log(e);
        onClose();
      });
  };

  return (
    <Modal show={true} size="lg">
      <Form onSubmit={submit}>
        <Modal.Header>Adjust Bankroll</Modal.Header>
        <Modal.Body>
          <p>
            Set the amount of money each player should have. The amounts don’t
            have to add up; you can set a player’s bankroll to zero if they’ve
            cashed out, or give them more money if they want to re-buy.
          </p>
          <table className="table">
            <tbody>
              {adjusted.map((player, idx) => {
                return (
                  <tr key={idx}>
                    <td>{player.name}</td>
                    <td>
                      <Form.Control
                        type="number"
                        value={player.money}
                        onChange={setMoney(idx)}
                      ></Form.Control>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={submit}>
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
AdjustBankrollModal.propTypes = {
  gameId: PropTypes.string,
  players: PropTypes.array,
  onClose: PropTypes.func
};

export default AdjustBankrollModal;
