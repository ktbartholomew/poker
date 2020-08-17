import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

const SetBlindsModal = ({ game, onClose }) => {
  console.log(game);
  const [antestring, setAntestring] = useState(
    game.preferences().antes.join(',')
  );
  const submit = () => {
    fetch(`/api/games/${game.id}/blinds`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        antes: []
      })
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
        <Modal.Header>
          <h4>Set Blinds</h4>
        </Modal.Header>
        <Modal.Body>
          <p>
            Set the big and small blinds, separated by commas. Set it to an
            empty string to disable auto-blinds.
          </p>
          <input
            className="form-control"
            type="text"
            value={antestring}
            onChange={(e) => {
              setAntestring(e.target.value);
            }}
          />
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
SetBlindsModal.propTypes = {
  game: PropTypes.object,
  onClose: PropTypes.func
};

export default SetBlindsModal;
