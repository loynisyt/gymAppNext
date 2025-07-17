import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import DeleteUserModal from './DeleteUserModal.js';
import EditUserModal from './EditUserModal.js';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editUserModalOpen, setEditUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        email: '',
        telephone_number: '',
        role: 'user'
    });
    const [message, setMessage] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            setMessage('Error fetching users: ' + error.message);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newUser)
            });
            if (response.ok) {
                setMessage('User created successfully');
                setNewUser({
                    username: '',
                    password: '',
                    email: '',
                    telephone_number: '',
                    role: 'user'
                });
                fetchUsers();
            } else {
                const data = await response.json();
                setMessage(data.message || 'Error creating user');
            }
        } catch (error) {
            setMessage('Error creating user: ' + error.message);
        }
    };

    // MODAL DELETE
    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };
    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setUserToDelete(null);
    };
    const confirmDelete = async () => {
        if (userToDelete) {
            await handleDeleteUser(userToDelete.id);
            closeDeleteModal();
        }
    };
    const handleDeleteUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                setMessage('User deleted successfully');
                fetchUsers();
            } else {
                const data = await response.json();
                setMessage(data.message || 'Error deleting user');
            }
        } catch (error) {
            setMessage('Error deleting user: ' + error.message);
        }
    };

    // MODAL EDIT
    const openEditModal = (user) => {
        setUserToEdit(user);
        setEditUserModalOpen(true);
    };
    const closeEditModal = () => {
        setEditUserModalOpen(false);
        setUserToEdit(null);
    };
    const handleEditUser = async (updatedUser) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${updatedUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(updatedUser),
            });
            if (response.ok) {
                setMessage("Użytkownik zaktualizowany!");
                closeEditModal();
                fetchUsers();
            } else {
                setMessage("Błąd podczas edycji użytkownika");
            }
        } catch (error) {
            setMessage("Błąd podczas edycji użytkownika: " + error.message);
        }
    };

    return (
        <div className="container">
            <h2 className="title is-1">Admin Panel</h2>
            {message && (
                <div className={`notification ${message.includes('Error') || message.includes('Błąd') ? 'is-danger' : 'is-success'}`}>
                    {message}
                </div>
            )}

            <div className="columns">
                <div className="column is-half">
                    <h3 className="title is-4">Stwórz nowego użytkownika</h3>
                    <form onSubmit={handleAddUser}>
                        <div className="field">
                            <label className="label">Nazwa użytkownika</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Hasło</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Email</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Nr tel</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    value={newUser.telephone_number}
                                    onChange={(e) => setNewUser({ ...newUser, telephone_number: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Rola (zarządzanie)</label>
                            <div className="control">
                                <div className="select">
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="user">User</option>
                                        <option value="trainer">Trainer</option>
                                        <option value="ward">Ward</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="control">
                            <button className="button is-primary" type="submit">Stwórz Użytkownika</button>
                        </div>
                    </form>
                </div>
                <div className="column is-half">
                    <h3 className="title is-4">Lista Użytkowników</h3>
                    {isLoading ? (
                        <p>Loading users...</p>
                    ) : (
                        <ul>
                            {users.map(user => (
                                <li key={user.id} className="user-list-item">
                                    <span className="user-name">{user.username}</span>
                                    <button className="button is-info is-small" onClick={() => openEditModal(user)}>Edytuj</button>
                                    <button className="button is-danger is-small" onClick={() => openDeleteModal(user)}>Usuń Konto</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            {deleteModalOpen && (
                <DeleteUserModal
                    user={userToDelete}
                    onClose={closeDeleteModal}
                    onConfirm={confirmDelete}
                />
            )}
            {editUserModalOpen && userToEdit && (
                <EditUserModal
                    user={userToEdit}
                    onClose={closeEditModal}
                    onSave={handleEditUser}
                />
            )}
        </div>
    );
};

export default AdminPanel;