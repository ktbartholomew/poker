import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

const LateJoinModal = ({ gameId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [joinToken, setJoinToken] = useState('');
  useEffect(() => {
    fetch(`/api/games/${gameId}/joinToken`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        return {};
      })
      .then((responseData) => {
        setJoinToken(responseData.joinToken);
        setLoading(false);
      });
  }, []);

  return (
    <Modal show={true}>
      <Modal.Header>
        <h4>Late Join</h4>
      </Modal.Header>
      <Modal.Body>
        {loading && <p>Loading&hellip;</p>}
        {!loading && (
          <>
            <p>Share this URL with someone to let them join this game:</p>
            <Form.Group>
              <Form.Control
                value={`${window.location.origin}/games/${gameId}?joinToken=${joinToken}`}
                readOnly
              />
              <Form.Text className="text-muted">
                This link can only be used once
              </Form.Text>
            </Form.Group>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
LateJoinModal.propTypes = {
  gameId: PropTypes.string.isRequired,
  onClose: PropTypes.func
};

export default LateJoinModal;
