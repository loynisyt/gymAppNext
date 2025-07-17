function Home({ user }) 
{
  return (
    <div className="container" style={{ marginTop: '5rem' }}>
      <h2 className="title">Witaj, {user?.username}!</h2>
      <p>Twoja rola: <strong>{user?.role}</strong></p>
      <div className="notification is-info">To jest strona domowa po zalogowaniu.</div>
    </div>
  )
}

export default Home