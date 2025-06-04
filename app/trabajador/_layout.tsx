import React from 'react'
import { Platform, View } from 'react-native'
import "../../global.css";
import { Redirect } from 'expo-router';

const _layout = () => {
    if (Platform.OS !== "web") {
        return <Redirect href="/" />;
    }
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <form
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    width: 320,
                    background: '#fff',
                    padding: 32,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onSubmit={async e => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const restaurante_id = (form.elements.namedItem('ownerId') as HTMLInputElement).value;
                    const user = (form.elements.namedItem('username') as HTMLInputElement).value;
                    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

                    try {
                        const response = await fetch('http://127.0.0.1:8000/trabajador/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ restaurante_id, user, password })
                        });
                        if (!response.ok) {
                            alert('Credenciales incorrectas');
                            return;
                        }
                        const data = await response.json();
                        // Guarda la data que necesites, por ejemplo en localStorage
                        localStorage.setItem('trabajador', JSON.stringify(data));
                        // Verifica el rol y redirige
                        if (data.rol === 'cocinero') {
                            
                            window.location.href = '/cocina';
                        } else {
                            alert('Login exitoso, pero no eres cocinero');
                        }
                    } catch (error) {
                        alert('Error de conexión');
                    }
                }}
            >
                <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Login Trabajador</h2>
                <label>
                    User ID del Dueño
                    <input
                        type="text"
                        name="ownerId"
                        required
                        style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
                        placeholder="Ingrese el user_id del dueño"
                    />
                </label>
                <label>
                    Usuario
                    <input
                        type="text"
                        name="username"
                        required
                        style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
                        placeholder="Ingrese su usuario"
                    />
                </label>
                <label>
                    Clave
                    <input
                        type="password"
                        name="password"
                        required
                        style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
                        placeholder="Ingrese su clave"
                    />
                </label>
                <button
                    type="submit"
                    style={{
                        marginTop: 16,
                        padding: 12,
                        borderRadius: 4,
                        border: 'none',
                        background: '#0070f3',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Ingresar
                </button>
            </form>
        </View>
    )
}

export default _layout