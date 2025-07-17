import React from 'react';

const DeleteUserModal = ({ user, onClose, onConfirm }) => {
    if (!user) return null;

    return (
        <div className="modal is-active">
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-content training-modal">
                <div className="box">
                    <h1 className="title">Usuń konto</h1>
                    <p>Czy jesteś pewien że chcesz usunąć konto:  <strong>{user.username}</strong>? Ta akcja jest nie odwracalna!!</p>
                    <div className="buttons">
                        <button className="button is-danger" onClick={onConfirm}>USUŃ</button>
                        <button className="button" onClick={onClose}>Cofnij</button>
                    </div>
                </div>
            </div>
            <button className="modal-close is-large" aria-label="close" onClick={onClose}></button>
        </div>
    );
};

export default DeleteUserModal;