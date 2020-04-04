import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const GameError = ({ message }) => {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-sm">
          <p>{message}</p>
          <p>
            <Link to="/">Go Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
GameError.propTypes = {
  message: PropTypes.node
};

export default GameError;
