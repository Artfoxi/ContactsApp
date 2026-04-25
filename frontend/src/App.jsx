import { useState, useEffect } from 'react'

function App() {
  const [contacts, setContacts] = useState([])
  const [token, setToken] = useState(localStorage.getItem('access_token') || '')
  
  // Состояния для форм авторизации
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoginView, setIsLoginView] = useState(true)

  // Состояние для формы ДОБАВЛЕНИЯ
  const [newContact, setNewContact] = useState({
    first_name: '', last_name: '', email: '', phone: ''
  })

  // Состояния для РЕДАКТИРОВАНИЯ
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    first_name: '', last_name: '', email: '', phone: ''
  })

  const serverIp = window.location.hostname;

  // --- ЗАГРУЗКА КОНТАКТОВ ---
  useEffect(() => {
    if (token) {
      fetch(`http://${serverIp}:8001/api/contacts/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Ошибка токена');
          return res.json();
        })
        .then(data => setContacts(data))
        .catch(() => handleLogout())
    }
  }, [token])

  // --- ЛОГИН И РЕГИСТРАЦИЯ ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`http://${serverIp}:8001/api/auth/jwt/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) throw new Error('Неверный логин или пароль');
      const data = await response.json();
      setToken(data.access);
      localStorage.setItem('access_token', data.access);
    } catch (err) { setError(err.message); }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`http://${serverIp}:8001/api/auth/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(JSON.stringify(errData)); 
      }
      alert('Ура! Аккаунт создан. Теперь вы можете войти.');
      setIsLoginView(true);
      setPassword('');
    } catch (err) { setError("Ошибка: " + err.message); }
  }

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('access_token');
    setContacts([]);
  }

  // --- СОЗДАНИЕ КОНТАКТА ---
  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://${serverIp}:8001/api/contacts/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newContact)
      });
      if (response.ok) {
        const createdData = await response.json();
        setContacts([createdData, ...contacts]);
        setNewContact({ first_name: '', last_name: '', email: '', phone: '' });
      } else { alert("Ошибка при создании контакта."); }
    } catch (err) { console.error(err); }
  }

  // --- УДАЛЕНИЕ КОНТАКТА ---
  const handleDeleteContact = async (id) => {
    if (!window.confirm("Точно удалить этот контакт?")) return;
    try {
      const response = await fetch(`http://${serverIp}:8001/api/contacts/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setContacts(contacts.filter(contact => contact.id !== id));
      }
    } catch (err) { console.error(err); }
  }

  // --- РЕДАКТИРОВАНИЕ КОНТАКТА ---
  const startEdit = (contact) => {
    setEditingId(contact.id);
    setEditForm({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone
    });
  }

  const handleUpdateContact = async (id) => {
    try {
      const response = await fetch(`http://${serverIp}:8001/api/contacts/${id}/`, {
        method: 'PUT', // PUT полностью заменяет данные контакта
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        const updatedData = await response.json();
        // Обновляем контакт в массиве
        setContacts(contacts.map(c => c.id === id ? updatedData : c));
        setEditingId(null); // Выходим из режима редактирования
      } else { alert("Ошибка при обновлении контакта."); }
    } catch (err) { console.error(err); }
  }

  // ================= РЕНДЕР ИНТЕРФЕЙСА =================

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
        <h2>{isLoginView ? 'Вход в систему' : 'Регистрация'}</h2>
        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        <form onSubmit={isLoginView ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="Логин" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ padding: '8px' }}/>
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '8px' }}/>
          <button type="submit" style={{ padding: '10px', cursor: 'pointer', background: isLoginView ? '#007BFF' : '#28A745', color: 'white', border: 'none', borderRadius: '4px' }}>
            {isLoginView ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} style={{ background: 'none', border: 'none', color: '#007BFF', cursor: 'pointer', textDecoration: 'underline' }}>
            {isLoginView ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Мои контакты</h1>
        <button onClick={handleLogout} style={{ padding: '8px 15px', cursor: 'pointer', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px' }}>Выйти</button>
      </div>
      
      {/* Форма ДОБАВЛЕНИЯ */}
      <form onSubmit={handleCreateContact} style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
        <input type="text" placeholder="Имя *" required value={newContact.first_name} onChange={e => setNewContact({...newContact, first_name: e.target.value})} style={{ padding: '8px', flex: 1 }}/>
        <input type="text" placeholder="Фамилия" value={newContact.last_name} onChange={e => setNewContact({...newContact, last_name: e.target.value})} style={{ padding: '8px', flex: 1 }}/>
        <input type="email" placeholder="Email *" required value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} style={{ padding: '8px', flex: 1 }}/>
        <input type="text" placeholder="Телефон" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} style={{ padding: '8px', flex: 1 }}/>
        <button type="submit" style={{ padding: '8px 15px', cursor: 'pointer', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>Добавить</button>
      </form>

      {/* СПИСОК КОНТАКТОВ */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {contacts.map(contact => (
          <div key={contact.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            
            {/* Если режим редактирования для ЭТОГО контакта */}
            {editingId === contact.id ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', flex: 1, marginRight: '10px' }}>
                <input type="text" value={editForm.first_name} onChange={e => setEditForm({...editForm, first_name: e.target.value})} style={{ padding: '5px' }} />
                <input type="text" value={editForm.last_name} onChange={e => setEditForm({...editForm, last_name: e.target.value})} style={{ padding: '5px' }} />
                <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ padding: '5px' }} />
                <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} style={{ padding: '5px' }} />
              </div>
            ) : (
              /* Обычный режим просмотра */
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{contact.first_name} {contact.last_name}</h3>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>✉️ {contact.email} | 📞 {contact.phone || '—'}</p>
              </div>
            )}

            {/* Кнопки управления */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {editingId === contact.id ? (
                <>
                  <button onClick={() => handleUpdateContact(contact.id)} style={{ padding: '5px 10px', background: '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Сохранить</button>
                  <button onClick={() => setEditingId(null)} style={{ padding: '5px 10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Отмена</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(contact)} style={{ padding: '5px 10px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Изменить</button>
                  <button onClick={() => handleDeleteContact(contact.id)} style={{ padding: '5px 10px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', color: 'red' }}>Удалить</button>
                </>
              )}
            </div>
          </div>
        ))}
        {contacts.length === 0 && <p>У вас пока нет контактов.</p>}
      </div>
    </div>
  )
}

export default App